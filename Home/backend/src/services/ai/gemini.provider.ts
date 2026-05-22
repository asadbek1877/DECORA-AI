import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import logger from '../../utils/logger';
import { uploadUrlToCloudinary } from '../cloudinary.service';
import { AppError } from '../../utils/errors';
import { AIProvider, DesignMode, DesignStyleInput, GenerationResult } from './ai.provider.interface';
import { GEMINI_TIMEOUT_MS, withGeminiRetries } from './gemini.resilience';

/**
 * Get MIME type from file path extension
 */
function getMimeType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop();
    const mimeTypes: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
    };
    return mimeTypes[ext || 'jpg'] || 'image/jpeg';
}

// ─── Model ────────────────────────────────────────────────────────────────────
// Gemini image models support inline image input via base64 `inlineData`.
// This is true img2img: walls, floor, ceiling stay in place.
// Docs: https://ai.google.dev/gemini-api/docs/image-generation

const GEMINI_IMAGE_MODELS = [
    'gemini-2.0-flash-preview-image-generation',
    'gemini-2.5-flash-image',
] as const;

type GeminiRequestConfig = {
    httpOptions: {
        timeout: number;
    };
    abortSignal: AbortSignal;
};

async function withGeminiRequestTimeout<T>(timeoutMs: number, operation: (config: GeminiRequestConfig) => Promise<T>): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await operation({
            httpOptions: { timeout: timeoutMs },
            abortSignal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

// ─── Instruction Builder (FAST MODE - Minimal Processing) ────────────────────
function buildInstruction(
    style: DesignStyleInput,
    roomType?: string,
    customPrompt?: string,
    mode: DesignMode = 'preview',
): string {
    const room = roomType || 'room';

    if (customPrompt) {
        return `Redesign this ${room}: ${customPrompt}. Style: ${style.displayName}. Keep the same room layout and structure.`;
    }

    return [
        `Redesign this ${room} photo in ${style.displayName} interior design style.`,
        `Color scheme: ${style.colorPalette.slice(0, 3).join(', ')}.`,
        `Furniture: ${style.furnitureType}. Lighting: ${style.lightingMood}.`,
        `Materials: ${style.materials.slice(0, 2).join(', ')}.`,
        `IMPORTANT: Keep the exact same perspective, camera angle, walls, windows, doors, ceiling, and floor position.`,
        `Only change furniture, decor, wall colors, and flooring material.`,
    ].join(' ');
}

function isHttpUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
}

function isDataUri(value: string): boolean {
    return /^data:/i.test(value);
}

async function readImageAsBase64(imagePath: string): Promise<{ mimeType: string; data: string }> {
    if (isDataUri(imagePath)) {
        const match = imagePath.match(/^data:(.+?);base64,(.+)$/i);
        if (!match) {
            throw new AppError('Invalid data URI image input.', 400);
        }

        return {
            mimeType: match[1],
            data: match[2],
        };
    }

    if (/^https?:\/\//i.test(imagePath)) {
        const response = await fetch(imagePath);
        if (!response.ok) {
            throw new AppError(`Could not download source image. HTTP ${response.status}`, 500);
        }

        return {
            mimeType: (response.headers.get('content-type') || 'image/jpeg').split(';')[0],
            data: Buffer.from(await response.arrayBuffer()).toString('base64'),
        };
    }

    const mimeType = getMimeType(imagePath);
    const data = await fs.promises.readFile(imagePath, { encoding: 'base64' });

    return { mimeType, data };
}

async function cleanupFile(filePath: string): Promise<void> {
    try {
        await fs.promises.unlink(filePath);
    } catch {
        // Best-effort cleanup only.
    }
}

// ─── Gemini Provider ──────────────────────────────────────────────────────────
export class GeminiProvider implements AIProvider {
    private readonly ai: GoogleGenAI;

    constructor(apiKey: string) {
        if (!apiKey) {
            logger.warn('[GeminiProvider] GEMINI_API_KEY is not set — API calls will fail with 403.');
        }
        this.ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
                timeout: GEMINI_TIMEOUT_MS,
            },
        });
    }

    async analyzeRoom(imageUrl: string): Promise<any> {
        const prompt = `Analyze this interior room image. Respond ONLY with a valid JSON object matching this schema:
{
  "roomType": "string (e.g. living room, bedroom, kitchen)",
  "dimensions": "string (estimated size, e.g. '15x20 ft' or 'Medium')",
  "architecturalFeatures": ["string array of features like 'large windows', 'hardwood floors', 'vaulted ceiling'"],
  "currentStyle": "string (best guess at current design style)",
  "lighting": "string (description of natural and artificial light)",
  "suggestions": ["string array of 3 quick design tips"]
}
Do not include any markdown formatting like \`\`\`json. Just output the raw JSON string.`;

        try {
            const image = await readImageAsBase64(imageUrl);

            logger.info('[GeminiProvider] generateContent started');
            const response = await withGeminiRetries('Gemini room analysis generateContent', async () => withGeminiRequestTimeout(GEMINI_TIMEOUT_MS, (requestConfig) => this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: [
                    prompt,
                    {
                        inlineData: {
                            mimeType: image.mimeType,
                            data: image.data,
                        },
                    },
                ],
                config: requestConfig,
            })));
            logger.info('[GeminiProvider] generateContent completed');

            const text = response?.text || '';
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanedText);
        } catch (err: any) {
            logger.warn(`[GeminiProvider] Analysis error: ${err.message}. Attempting Groq fallback...`);
            
            // Fallback to Groq Llama 3.2 Vision if Gemini rate limits
            const groqApiKey = (await import('../../config/index.js')).config.groq?.apiKey || process.env.GROQ_API_KEY;
            
            if (groqApiKey) {
                try {
                    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${groqApiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: 'llama-3.2-11b-vision-preview',
                            messages: [
                                {
                                    role: 'user',
                                    content: [
                                        { type: 'text', text: prompt },
                                        { type: 'image_url', image_url: { url: imageUrl } }
                                    ]
                                }
                            ],
                            temperature: 0.2,
                        })
                    });
                    
                    if (groqResponse.ok) {
                        const groqData = await groqResponse.json() as any;
                        const text = groqData.choices[0]?.message?.content || '';
                        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                        logger.info(`[GeminiProvider] Successfully used Groq fallback for room analysis.`);
                        return JSON.parse(cleanedText);
                    } else {
                        const errorDetails = await groqResponse.text();
                         logger.error(`[GeminiProvider] Groq Analysis fallback failed: ${errorDetails}`);
                    }
                } catch (groqErr: any) {
                     logger.error(`[GeminiProvider] Groq fetch failed: ${groqErr.message}`);
                }
            }

            throw new AppError('Failed to analyze room image with AI. Rate Limit exceeded.', 500);
        }
    }

    async suggestPrompt(roomType: string, styleDetails: any): Promise<string> {
        const prompt = `You are an expert interior designer. Create a highly detailed, professional prompt for an AI image generator (like Midjourney or Stable Diffusion) to redesign a ${roomType}.
Target style: ${styleDetails.displayName}.
Style description: ${styleDetails.description}.
Color Palette: ${styleDetails.colorPalette.join(', ')}.
Materials: ${styleDetails.materials.join(', ')}.

The prompt should be written in English. Focus on lighting, materials, atmosphere, and camera quality (e.g., '8k resolution, photorealistic, architectural photography').
Return ONLY the prompt string, nothing else.`;

        try {
            const response = await withGeminiRequestTimeout(GEMINI_TIMEOUT_MS, (requestConfig) => this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ text: prompt }],
                config: requestConfig,
            }));
            return response?.text?.trim() || '';
        } catch (err: any) {
            logger.warn(`[GeminiProvider] Prompt generation error: ${err.message}. Attempting Groq fallback...`);
            
             // Fallback to standard Groq text model if Gemini rate limits
             const groqApiKey = (await import('../../config/index.js')).config.groq?.apiKey || process.env.GROQ_API_KEY;
            
             if (groqApiKey) {
                 try {
                     const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                         method: 'POST',
                         headers: {
                             'Authorization': `Bearer ${groqApiKey}`,
                             'Content-Type': 'application/json'
                         },
                         body: JSON.stringify({
                             model: 'llama-3.1-70b-versatile',
                             messages: [{ role: 'user', content: prompt }],
                             temperature: 0.7,
                         })
                     });
                     
                     if (groqResponse.ok) {
                         const groqData = await groqResponse.json() as any;
                         logger.info(`[GeminiProvider] Successfully used Groq fallback for prompt generation.`);
                         return groqData.choices[0]?.message?.content?.trim() || '';
                     } else {
                         const errorDetails = await groqResponse.text();
                         logger.error(`[GeminiProvider] Groq Prompt fallback failed: ${errorDetails}`);
                     }
                 } catch (groqErr: any) {
                      logger.error(`[GeminiProvider] Groq fetch failed: ${groqErr.message}`);
                 }
             }

            throw new AppError('Failed to generate prompt with AI. Both Gemini and Groq failed.', 500);
        }
    }

    async generateDesign(
        mode: DesignMode,
        imagePath: string, // Now can be data URI, Cloudinary URL, or file path
        style: DesignStyleInput,
        roomType?: string,
        additionalInstructions?: string,
        customPrompt?: string,
    ): Promise<GenerationResult> {
        const instruction = buildInstruction(style, roomType, customPrompt, mode);
        const fullInstruction = additionalInstructions
            ? `${instruction} Additional: ${additionalInstructions}`
            : instruction;

        const totalLabel = `[Gemini] Total generateDesign (${mode}/${style.name})`;
        console.time(totalLabel);

        try {
            const image = await readImageAsBase64(imagePath);

            logger.info('[GeminiProvider] generateContent started');
            const apiLabel = 'Gemini generateContent';
            console.time(`[Gemini] ${apiLabel}`);
            let lastError: unknown;

            for (const model of GEMINI_IMAGE_MODELS) {
                try {
                    logger.info(`[GeminiProvider] Trying Gemini image model: ${model}`);
                    const response = await withGeminiRetries(`${apiLabel} (${model})`, async () => withGeminiRequestTimeout(GEMINI_TIMEOUT_MS, (requestConfig) => this.ai.models.generateContent({
                        model,
                        contents: [
                            fullInstruction,
                            {
                                inlineData: {
                                    mimeType: image.mimeType,
                                    data: image.data,
                                },
                            },
                        ],
                        config: requestConfig,
                    })));

                    console.timeEnd(`[Gemini] ${apiLabel}`);
                    logger.info('[GeminiProvider] generateContent completed');

                    const parts = response?.candidates?.[0]?.content?.parts ?? [];
                    let imageData: string | null = null;
                    let imageMimeOut = 'image/png';

                    for (const part of parts) {
                        if (part?.inlineData?.mimeType?.startsWith('image/') && typeof part.inlineData.data === 'string') {
                            imageData = part.inlineData.data;
                            imageMimeOut = part.inlineData.mimeType;
                            break;
                        }
                    }

                    if (!imageData) {
                        const textParts = parts
                            .filter((p: any) => p?.text)
                            .map((p: any) => p.text)
                            .join(' ');
                        logger.error(
                            `[GeminiProvider] No image in response from ${model}. Text: ${textParts.substring(0, 200)}`
                        );
                        throw new AppError(
                            'Gemini returned no image. Try different style or prompt.',
                            500
                        );
                    }

                    console.time('[Gemini] Cloudinary upload');
                    const folder = mode === 'final' ? 'finals' : 'previews';
                    const cloudResult = await uploadUrlToCloudinary(
                        `data:${imageMimeOut};base64,${imageData}`,
                        `ai-interior/${folder}/${style.name}`
                    );
                    console.timeEnd('[Gemini] Cloudinary upload');

                    logger.info(`[GeminiProvider] ✓ Generated and uploaded to Cloudinary`);
                    console.timeEnd(totalLabel);

                    return {
                        imageUrl: cloudResult.url,
                        publicId: cloudResult.publicId,
                        styleName: style.name,
                        prompt: fullInstruction,
                        modelUsed: `gemini/${model}`,
                    };
                } catch (error: any) {
                    lastError = error;
                    logger.warn(`[GeminiProvider] Model ${model} failed: ${error.message}`);
                }
            }

            throw lastError instanceof AppError
                ? lastError
                : new AppError(`Gemini error: ${(lastError as any)?.message || 'Unknown error'}`, (lastError as any)?.statusCode || (lastError as any)?.status || 500);
        } catch (err: any) {
            console.timeEnd(totalLabel);
            logger.error(`[GeminiProvider] API error: ${err.message}`);
            throw err instanceof AppError
                ? err
                : new AppError(`Gemini error: ${err.message}`, err.statusCode || err.status || 500);
        }
    }
}
