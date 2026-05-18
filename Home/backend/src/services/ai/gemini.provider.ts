import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import * as fs from 'fs';
import logger from '../../utils/logger';
import { uploadUrlToCloudinary } from '../cloudinary.service';
import { AppError } from '../../utils/errors';
import { AIBillingError } from '../replicate.service';
import { AIProvider, DesignMode, DesignStyleInput, GenerationResult } from './ai.provider.interface';

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
// gemini-3.1-flash-image-preview supports:
//   • Image input  (original room photo as base64)
//   • Text prompt  (style instruction)
//   • Image output (edited version — same room, new style)
// This is TRUE img2img: walls, floor, ceiling stay in place.
// Docs: https://ai.google.dev/gemini-api/docs/image-generation
const GEMINI_MODEL = 'gemini-3.1-flash-image-preview';

// ─── Timeout for Gemini API call ──────────────────────────────────────────────
// The @google/genai SDK silently retries 503s with exponential backoff.
// This cap kills that before the SDK can hang indefinitely and returns a fast, user-friendly error.
const GEMINI_TIMEOUT_MS = 90_000;

// ─── Timeout wrapper ──────────────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(
      () => reject(new AppError(`${label} timed out after ${ms / 1000}s. The AI server is under high demand — please try again in a moment.`, 503)),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer!));
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

// ─── Gemini Provider ──────────────────────────────────────────────────────────
export class GeminiProvider implements AIProvider {
    private readonly ai: GoogleGenAI;

    constructor(apiKey: string) {
        if (!apiKey) {
            logger.warn('[GeminiProvider] GEMINI_API_KEY is not set — API calls will fail with 403.');
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    async analyzeRoom(imageUrl: string): Promise<any> {
        let imageBase64: string;
        let imageMime: string;
        try {
            const imgResp = await fetch(imageUrl);
            if (!imgResp.ok) throw new Error(`HTTP ${imgResp.status}`);
            const buffer = Buffer.from(await imgResp.arrayBuffer());
            imageMime = (imgResp.headers.get('content-type') || 'image/jpeg').split(';')[0];
            imageBase64 = buffer.toString('base64');
        } catch (err: any) {
            throw new AppError('Could not download source image for analysis.', 500);
        }

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
            // Using flash-8b for faster text/vision tasks if available, otherwise fallback to flash
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: imageMime,
                            data: imageBase64,
                        },
                    },
                ],
            });
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
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ text: prompt }],
            });
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

        // ── Step 1: Get image as base64 (optimize for each source type) ──────────
        let imageBase64: string;
        let imageMime: string;

        console.time('[Gemini] Image preparation');
        try {
            if (imagePath.startsWith('data:')) {
                // ── FASTEST: Already base64 from local compression ───────────────────
                // No download, no compression needed!
                console.log('[Gemini] Using local base64 (pre-compressed, fastest!)');
                const matches = imagePath.match(/^data:([^;]+);base64,(.+)$/);
                if (!matches) throw new Error('Invalid data URI format');
                imageMime = matches[1];
                imageBase64 = matches[2];
            } else if (imagePath.includes('cloudinary.com')) {
                // ── FAST PATH: Cloudinary URL (already compressed by previous upload) ─
                console.log('[Gemini] Downloading from Cloudinary (already 1024px)...');
                const imgResp = await fetch(imagePath);
                if (!imgResp.ok) throw new Error(`HTTP ${imgResp.status}`);
                const buffer = Buffer.from(await imgResp.arrayBuffer());
                imageMime = (
                    imgResp.headers.get('content-type') || 'image/jpeg'
                ).split(';')[0];
                imageBase64 = buffer.toString('base64');
            } else {
                // ── FALLBACK: File system path ────────────────────────────────────────
                console.log('[Gemini] Reading from file system...');
                const buffer = fs.readFileSync(imagePath);
                imageMime = getMimeType(imagePath);
                imageBase64 = buffer.toString('base64');
            }
            console.timeEnd('[Gemini] Image preparation');
        } catch (err: any) {
            console.timeEnd('[Gemini] Image preparation');
            console.timeEnd(totalLabel);
            logger.error(`[GeminiProvider] Image prep failed: ${err.message}`);
            throw new AppError('Could not prepare image for Gemini.', 500);
        }

        logger.info(`[GeminiProvider] Source ready: ${(imageBase64.length / 1024 / 4).toFixed(0)} KB (${imageMime})`);

        // ── Step 2: Call Gemini API with strict 40-second timeout ────────────────
        // NO exponential backoff — fail fast!
        let response: any;
        console.time('[Gemini] API call');
        try {
            response = await withTimeout(
                this.ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: [
                        { text: fullInstruction },
                        {
                            inlineData: {
                                mimeType: imageMime,
                                data: imageBase64,
                            },
                        },
                    ],
                }),
                GEMINI_TIMEOUT_MS,
                'Gemini API call',
            );
        } catch (err: any) {
            console.timeEnd('[Gemini] API call');
            console.timeEnd(totalLabel);
            logger.error(`[GeminiProvider] API error: ${err.message}`);

            // Handle errors with strict, no-retry approach
            if (
                err.message?.includes('API_KEY') ||
                err.status === 401 ||
                err.status === 403
            ) {
                throw new AppError('Invalid GEMINI_API_KEY. Check .env', 500);
            }
            if (err.status === 429) {
                throw new AIBillingError('Gemini quota exceeded (429). Wait and retry.');
            }
            if (err.status === 503 || err.statusCode === 503) {
                throw new AppError(
                    'Gemini servers overloaded (503). Please retry in 30 seconds.',
                    503
                );
            }
            if (err.message?.includes('timeout')) {
                throw new AppError(
                    'Generation timeout after 40 seconds. Servers too slow.',
                    503
                );
            }
            throw new AppError(`Gemini error: ${err.message}`, err.statusCode || 500);
        }
        console.timeEnd('[Gemini] API call');

        // ── Step 3: Extract image from response ─────────────────────────────────
        const parts = response?.candidates?.[0]?.content?.parts ?? [];
        let imageData: string | null = null;
        let imageMimeOut = 'image/png';

        for (const part of parts) {
            if (part?.inlineData?.mimeType?.startsWith('image/')) {
                imageData = part.inlineData.data;
                imageMimeOut = part.inlineData.mimeType;
                break;
            }
        }

        if (!imageData) {
            console.timeEnd(totalLabel);
            const textParts = parts
                .filter((p: any) => p?.text)
                .map((p: any) => p.text)
                .join(' ');
            logger.error(
                `[GeminiProvider] No image in response. Text: ${textParts.substring(0, 200)}`
            );
            throw new AppError(
                'Gemini returned no image. Try different style or prompt.',
                500
            );
        }

        // ── Step 4: Upload ONLY the generated image to Cloudinary ────────────────
        // This is the ONLY Cloudinary upload now!
        console.time('[Gemini] Cloudinary upload');
        const dataUri = `data:${imageMimeOut};base64,${imageData}`;
        const folder = mode === 'final' ? 'finals' : 'previews';
        const cloudResult = await uploadUrlToCloudinary(
            dataUri,
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
            modelUsed: `gemini/${GEMINI_MODEL}`,
        };
    }
}
