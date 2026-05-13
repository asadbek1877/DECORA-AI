import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';
import { getAllStyles } from '../prompts/styles';
import { GroqService, GROQ_MODELS } from './groq.service';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const TEXT_MODEL = 'gemini-2.0-flash';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface RoomAnalysis {
    roomType: string;
    currentStyle: string;
    dimensions: string;
    lighting: string;
    colors: string[];
    strengths: string[];
    improvements: string[];
    overallScore: number;
}

export interface StyleScore {
    name: string;
    displayName: string;
    score: number;
    reason: string;
}

export interface GeneratedPrompt {
    mainPrompt: string;
    styleDetails: string;
    colorSuggestions: string;
    fullPrompt: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// ─── Helper: URL → Base64 (for Gemini fallback) ───────────────────────────────

async function urlToBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(imageUrl);
    if (!response.ok) throw new AppError(`Failed to fetch image: ${response.statusText}`, 400);
    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    return { data: buffer.toString('base64'), mimeType: contentType };
}

// ─── 1. Room Analysis ─────────────────────────────────────────────────────────

export async function analyzeRoom(imageUrl: string): Promise<RoomAnalysis> {
    logger.info(`[AI] analyzeRoom: ${imageUrl}`);

    // PRIMARY: Groq Vision (free, fast, no rate limits)
    if (GroqService.isAvailable) {
        try {
            const result = await GroqService.analyzeRoomImage(imageUrl);
            logger.info(`[AI] Room analysis via Groq Vision: ${result.roomType}`);
            return result as RoomAnalysis;
        } catch (err: any) {
            logger.warn(`[AI] Groq Vision failed, trying Gemini: ${err.message}`);
        }
    }

    // FALLBACK: Gemini Vision
    try {
        const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
        const imageData = await urlToBase64(imageUrl);

        const prompt = `Analyze this room and return ONLY valid JSON (no markdown):
{
  "roomType": "Living Room/Bedroom/Kitchen/etc",
  "currentStyle": "Modern/Minimalist/etc",
  "dimensions": "Small ~15m²/Medium ~25m²/Large ~40m²+",
  "lighting": "Natural/Artificial/Mixed/Dark/Bright",
  "colors": ["color1", "color2", "color3"],
  "strengths": ["o'zbek tilidagi 3 ta kuchli tomon"],
  "improvements": ["o'zbek tilidagi 3 ta tavsiya"],
  "overallScore": 7
}`;

        const response = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { data: imageData.data, mimeType: imageData.mimeType } }] }],
        });
        const text = response.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new AppError('Could not parse AI response', 500);
        return JSON.parse(jsonMatch[0]) as RoomAnalysis;
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        logger.error(`[AI] analyzeRoom error: ${error.message}`);
        throw new AppError(`Room analysis failed: ${error.message}`, 500);
    }
}

// ─── 2. Style Recommendations ─────────────────────────────────────────────────

export async function recommendStyles(imageUrl: string): Promise<StyleScore[]> {
    logger.info(`[AI] recommendStyles: ${imageUrl}`);

    const allStyles = getAllStyles();
    const styleList = allStyles.map(s => `${s.name} (${s.displayName})`);

    // PRIMARY: Groq Vision
    if (GroqService.isAvailable) {
        try {
            const scores = await GroqService.recommendStyles(imageUrl, styleList);
            logger.info(`[AI] Style recommendations via Groq Vision`);
            return scores as StyleScore[];
        } catch (err: any) {
            logger.warn(`[AI] Groq Vision style failed, trying Gemini: ${err.message}`);
        }
    }

    // FALLBACK: Gemini Vision
    try {
        const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
        const imageData = await urlToBase64(imageUrl);

        const prompt = `Rate these design styles for this room: ${styleList.join(', ')}
Return ONLY a JSON array (no markdown):
[{"name":"style-key","displayName":"Display Name","score":8,"reason":"O'zbek tilidagi sabab"}]`;

        const response = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { data: imageData.data, mimeType: imageData.mimeType } }] }],
        });
        const text = response.response.text().trim();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new AppError('Could not parse style recommendations', 500);
        const scores = JSON.parse(jsonMatch[0]) as StyleScore[];
        return scores.sort((a, b) => b.score - a.score);
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        logger.error(`[AI] recommendStyles error: ${error.message}`);
        throw new AppError(`Style recommendations failed: ${error.message}`, 500);
    }
}

// ─── 3. Smart Prompt Generator ────────────────────────────────────────────────

export async function generateSmartPrompt(
    imageUrl: string,
    selectedStyle?: string,
    userInstructions?: string,
    modelName?: string
): Promise<GeneratedPrompt> {
    logger.info(`[AI] generateSmartPrompt style=${selectedStyle} model=${modelName}`);

    // PRIMARY: Groq Vision (direct prompt from image)
    if (GroqService.isAvailable && !modelName?.includes('gemini')) {
        try {
            const result = await GroqService.generatePrompt(imageUrl, selectedStyle, userInstructions);
            logger.info(`[AI] Prompt generated via Groq Vision`);
            return result as GeneratedPrompt;
        } catch (err: any) {
            logger.warn(`[AI] Groq prompt failed, using Gemini: ${err.message}`);
        }
    }

    // FALLBACK: Gemini Vision
    try {
        const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
        const imageData = await urlToBase64(imageUrl);
        const prompt = `Create an optimized AI image generation prompt for this room.
${selectedStyle ? `Style: ${selectedStyle}` : ''}
${userInstructions ? `Instructions: ${userInstructions}` : ''}
Return ONLY JSON (no markdown):
{"mainPrompt":"...","styleDetails":"...","colorSuggestions":"...","fullPrompt":"...photorealistic, 4K, interior architecture photography, sharp focus, professional lighting"}`;

        const response = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { data: imageData.data, mimeType: imageData.mimeType } }] }],
        });
        const text = response.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new AppError('Could not parse prompt response', 500);
        return JSON.parse(jsonMatch[0]) as GeneratedPrompt;
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        logger.error(`[AI] generateSmartPrompt error: ${error.message}`);
        throw new AppError(`Prompt generation failed: ${error.message}`, 500);
    }
}

// ─── 4. AI Chat ───────────────────────────────────────────────────────────────

export async function chatAboutRoom(
    imageUrl: string,
    messages: ChatMessage[],
    newMessage: string,
    modelName?: string
): Promise<string> {
    logger.info(`[AI] chat model=${modelName || 'default'}`);

    // PRIMARY: Groq (vision for first message, text model for follow-ups)
    if (GroqService.isAvailable && !modelName?.includes('gemini')) {
        try {
            const reply = await GroqService.chatWithRoom(imageUrl, messages, newMessage, modelName);
            logger.info(`[AI] Chat via Groq`);
            return reply;
        } catch (err: any) {
            logger.warn(`[AI] Groq chat failed, using Gemini: ${err.message}`);
        }
    }

    // FALLBACK: Gemini Vision
    try {
        const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
        const imageData = await urlToBase64(imageUrl);

        const contents: any[] = [
            {
                role: 'user',
                parts: [
                    { text: 'You are an expert interior designer AI. Analyze this room.' },
                    { inlineData: { data: imageData.data, mimeType: imageData.mimeType } },
                    { text: 'I can see your room. Ask me anything about design, colors, furniture, or improvements. Answer in the same language as the user.' },
                ],
            },
            {
                role: 'model',
                parts: [{ text: "Men sizning xonangizni ko'rdim! Savol bering." }],
            },
        ];

        for (const msg of messages.slice(-6)) {
            contents.push({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] });
        }
        contents.push({ role: 'user', parts: [{ text: newMessage }] });

        const response = await model.generateContent({ contents });
        return response.response.text();
    } catch (error: any) {
        logger.error(`[AI] chat error: ${error.message}`);
        throw new AppError(`Chat failed: ${error.message}`, 500);
    }
}

// ─── 5. Object Removal ────────────────────────────────────────────────────────

export async function removeObject(
    imageUrl: string,
    objectName: string,
    replacement?: string
): Promise<string> {
    logger.info(`[AI] removeObject: ${objectName} from ${imageUrl}`);

    try {
        // We'll use Fal.ai for the actual image manipulation
         const apiKey = (await import('../config/index.js')).config.fal?.apiKey;
         if (!apiKey) throw new AppError('FAL API key not configured for object removal', 500);

         const FAL_ENDPOINT = 'https://fal.run/fal-ai/flux-general/image-to-image';
         
         const prompt = replacement 
            ? `Replace the ${objectName} with ${replacement}. Photorealistic interior, exact same room, seamless integration.`
            : `Remove the ${objectName} completely. Leave the empty space natural, seamless photorealistic interior, exact same room.`;

         const payload = {
            prompt: prompt,
            image_url: imageUrl,
            strength: 0.85, 
            controlnets: [
                {
                    path: "https://huggingface.co/InstantX/FLUX.1-dev-Controlnet-Canny/resolve/main/diffusion_pytorch_model.safetensors",
                    control_image_url: imageUrl,
                    conditioning_scale: 0.6
                }
            ],
            num_inference_steps: 20,
            guidance_scale: 4.0,
            sync_mode: true
         };

         const response = await fetch(FAL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
         });

         if (!response.ok) {
             const errorData = await response.text();
             throw new AppError(`Fal.ai removal error: ${errorData}`, 500);
         }

         const data = await response.json() as any;
         if (!data.images || data.images.length === 0) {
             throw new AppError('No image returned from Fal.ai for object removal', 500);
         }

         const resultUrl = data.images[0].url;
         
         // Upload to Cloudinary
         const { uploadUrlToCloudinary } = await import('./cloudinary.service.js');
         const cloudResult = await uploadUrlToCloudinary(resultUrl, 'ai-interior/removals');
         
         return cloudResult.url;
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        logger.error(`[AI] removeObject error: ${error.message}`);
        throw new AppError(`Object removal failed: ${error.message}`, 500);
    }
}
