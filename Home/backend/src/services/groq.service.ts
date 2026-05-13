import * as dotenv from 'dotenv';
dotenv.config();
import logger from '../utils/logger';

/**
 * Groq API Service
 * - Text models: llama-3.1-70b-versatile, llama-3.1-8b-instant
 * - Vision models: meta-llama/llama-4-scout-17b-16e-instruct (can see images!)
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Current active Groq models (as of 2025)
export const GROQ_MODELS = {
    // Vision — can analyze images (REPLACES Gemini Vision!)
    VISION: 'meta-llama/llama-4-scout-17b-16e-instruct',
    // Text — for chat and prompt generation
    TEXT_PRO: 'llama-3.1-70b-versatile',
    TEXT_FAST: 'llama-3.1-8b-instant',
};

type MessageContent =
    | string
    | Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
    >;

interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: MessageContent;
}

export class GroqService {
    static get apiKey() {
        return process.env.GROQ_API_KEY;
    }

    static get isAvailable() {
        return !!process.env.GROQ_API_KEY;
    }

    /**
     * Make a chat completion request to Groq API
     */
    static async createCompletion(
        messages: GroqMessage[],
        model: string = GROQ_MODELS.TEXT_PRO,
        temperature: number = 0.7,
        maxTokens: number = 1500
    ) {
        if (!this.apiKey) {
            throw new Error('GROQ_API_KEY not configured.');
        }

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
        });

        if (!response.ok) {
            const err: any = await response.json().catch(() => ({}));
            throw new Error(`Groq Error ${response.status}: ${err?.error?.message || response.statusText}`);
        }

        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }

    /**
     * Analyze a room image using Groq Vision (llama-4 scout)
     * Returns structured JSON with room details
     */
    static async analyzeRoomImage(imageUrl: string) {
        logger.info('[GroqService] Analyzing room with Groq Vision...');

        const messages: GroqMessage[] = [
            {
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: imageUrl },
                    },
                    {
                        type: 'text',
                        text: `Analyze this room image and respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "roomType": "Living Room|Bedroom|Kitchen|Bathroom|Office|Dining Room|Hallway",
  "currentStyle": "Modern|Minimalist|Traditional|Industrial|Scandinavian|Bohemian|Classic|Hi-Tech|Japandi",
  "dimensions": "Small ~15m²|Medium ~25m²|Large ~40m²+",
  "lighting": "Natural|Artificial|Mixed|Dark|Bright",
  "colors": ["color1", "color2", "color3"],
  "strengths": ["strength1 in Uzbek", "strength2 in Uzbek", "strength3 in Uzbek"],
  "improvements": ["improvement1 in Uzbek", "improvement2 in Uzbek", "improvement3 in Uzbek"],
  "overallScore": 7
}
Respond ONLY with JSON. Write strengths and improvements in Uzbek.`,
                    },
                ],
            },
        ];

        const text = await this.createCompletion(messages, GROQ_MODELS.VISION, 0.3, 1000);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Could not parse room analysis JSON from Groq');
        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Get style recommendations for a room using Groq Vision
     */
    static async recommendStyles(imageUrl: string, allStyles: string[]) {
        logger.info('[GroqService] Getting style recommendations with Groq Vision...');

        const messages: GroqMessage[] = [
            {
                role: 'user',
                content: [
                    { type: 'image_url', image_url: { url: imageUrl } },
                    {
                        type: 'text',
                        text: `Look at this room and rate how well each design style would work for it.
Available styles: ${allStyles.join(', ')}

Respond ONLY with a JSON array (no markdown):
[{"name": "style-key", "displayName": "Style Name", "score": 8, "reason": "Uzbek tilidagi sabab"}]

Include ALL styles. Respond ONLY with JSON array. Write "reason" in Uzbek.`,
                    },
                ],
            },
        ];

        const text = await this.createCompletion(messages, GROQ_MODELS.VISION, 0.3, 1200);
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('Could not parse style recommendations from Groq');
        const scores = JSON.parse(jsonMatch[0]);
        return scores.sort((a: any, b: any) => b.score - a.score);
    }

    /**
     * Generate a smart AI prompt with Groq Vision
     */
    static async generatePrompt(imageUrl: string, style?: string, instructions?: string) {
        logger.info('[GroqService] Generating prompt with Groq Vision...');

        const messages: GroqMessage[] = [
            {
                role: 'user',
                content: [
                    { type: 'image_url', image_url: { url: imageUrl } },
                    {
                        type: 'text',
                        text: `You are an expert AI image generation prompt engineer for interior design.
Look at this room image and create an optimal Stable Diffusion/Flux/Midjourney prompt.
${style ? `Target style: ${style}` : ''}
${instructions ? `User instructions: ${instructions}` : ''}

Respond ONLY with JSON (no markdown):
{
  "mainPrompt": "core redesign description (1-2 sentences in Uzbek)",
  "styleDetails": "furniture and material details",
  "colorSuggestions": "recommended colors",
  "fullPrompt": "COMPLETE English prompt for AI image generator ending with: photorealistic, 4K, interior architecture photography, sharp focus, professional lighting"
}`,
                    },
                ],
            },
        ];

        const text = await this.createCompletion(messages, GROQ_MODELS.VISION, 0.7, 1000);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Could not parse prompt from Groq Vision');
        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Chat about a room using Groq Vision (first message) then text models (follow-up)
     */
    static async chatWithRoom(
        imageUrl: string,
        history: { role: string; content: string }[],
        newMessage: string,
        modelName: string = GROQ_MODELS.TEXT_PRO
    ) {
        logger.info('[GroqService] Chat request...');

        const activeModel = modelName.includes('8b') ? GROQ_MODELS.TEXT_FAST : GROQ_MODELS.TEXT_PRO;

        // If no history, use vision model to see the room first
        if (history.length === 0) {
            const messages: GroqMessage[] = [
                {
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: imageUrl } },
                        {
                            type: 'text',
                            text: `You are an expert interior designer AI assistant. The user wants to discuss this room.
Their first question: "${newMessage}"
Answer in the same language as the question (Uzbek/Russian/English). Be specific, helpful and brief.`,
                        },
                    ],
                },
            ];
            return this.createCompletion(messages, GROQ_MODELS.VISION, 0.7, 800);
        }

        // Follow-up messages use text model (faster, cheaper)
        const formattedHistory: GroqMessage[] = history.slice(-8).map(m => ({
            role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: m.content,
        }));

        const messages: GroqMessage[] = [
            {
                role: 'system',
                content: `You are an expert interior designer AI. Answer in the same language as the user (Uzbek/Russian/English). Be helpful, specific and friendly.`,
            },
            ...formattedHistory,
            { role: 'user', content: newMessage },
        ];

        return this.createCompletion(messages, activeModel, 0.7, 800);
    }

    /**
     * Generate a prompt from text context only (fallback when no image)
     */
    static async generatePromptFromTextContext(
        roomContext: string,
        style?: string,
        instructions?: string
    ) {
        const messages: GroqMessage[] = [
            {
                role: 'system',
                content: `You are a professional interior design prompt engineer for AI image generators.
Return ONLY a JSON object (no markdown):
{
  "mainPrompt": "Uzbek description",
  "styleDetails": "furniture details",
  "colorSuggestions": "color palette",
  "fullPrompt": "Complete English prompt ending with: photorealistic, 4K, interior architecture photography, sharp focus, professional lighting"
}`,
            },
            {
                role: 'user',
                content: `Room: ${roomContext || 'standard room'}
Style: ${style || 'Modern'}
Instructions: ${instructions || 'none'}
Return ONLY JSON.`,
            },
        ];

        const text = await this.createCompletion(messages, GROQ_MODELS.TEXT_PRO, 0.8, 800);
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Failed to parse JSON response from Groq');
        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Generate an advanced AI prompt based on style, intensity, colors, and removals
     * For the Decore design system with full control parameters
     */
    static async generateAdvancedDesignPrompt(params: {
        style: string;
        styleName: string;
        intensity: number; // 0-100%
        colorPalette?: { name: string; colors: string[] } | null;
        removals?: {
            furniture: boolean;
            decor: boolean;
            electronics: boolean;
            emptyRoom: boolean;
        };
        roomType?: string;
        additionalContext?: string;
    }) {
        logger.info('[GroqService] Generating advanced prompt with parameters...');

        const intensityLevel =
            params.intensity <= 20
                ? 'minimal changes (light refresh)'
                : params.intensity <= 60
                    ? 'moderate changes (furniture and colors)'
                    : 'complete transformation (full redesign)';

        const colorDescription = params.colorPalette
            ? `Use color palette "${params.colorPalette.name}": ${params.colorPalette.colors.join(', ')}`
            : 'Choose colors naturally fitting the style';

        const removalList = [];
        if (params.removals?.furniture) removalList.push('remove all furniture');
        if (params.removals?.decor) removalList.push('remove decorative items');
        if (params.removals?.electronics) removalList.push('remove electronics and appliances');
        const removalText = params.removals?.emptyRoom
            ? 'Show empty room with only walls, floor, windows, doors, and architectural features'
            : removalList.length > 0
                ? `Actions: ${removalList.join(', ')}`
                : '';

        const systemPrompt = `You are an expert interior design AI prompt engineer specialized in producing  prompts for Flux, Stable Diffusion 3, and Midjourney.
You understand intensity levels, color palettes, and design transformations.

Return ONLY a valid JSON object (NO markdown, NO code blocks):
{
  "mainPrompt": "1-2 sentence objective in Uzbek",
  "styleDetails": "furniture, materials, and fixtures specific to ${params.styleName}",
  "colorDescription": "${colorDescription}",
  "removalInstructions": "removal operations ${removalText || '(none)'}",
  "fullPrompt": "Complete English prompt for image generation. Must include: ${params.styleName} style, ${intensityLevel}, ${colorDescription}. End with: photorealistic photography, professional interior design, sharp focus, studio lighting, 4K resolution, high detail"
}`;

        const messages: GroqMessage[] = [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: `Generate a professional interior design prompt:
- Room Type: ${params.roomType || 'general room'}
- Style: ${params.styleName} (${params.style})
- Design Intensity: ${params.intensity}% (${intensityLevel})
- Color Palette: ${params.colorPalette?.name || 'style-default'}
- Removals: ${removalText || 'none'}
${params.additionalContext ? `- Additional Notes: ${params.additionalContext}` : ''}

Return ONLY the JSON object described in system message. No explanations.`,
            },
        ];

        try {
            const text = await this.createCompletion(messages, GROQ_MODELS.TEXT_PRO, 0.8, 1200);
            // Remove markdown code blocks if present
            const cleanJson = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                logger.error('[GroqService] Could not extract JSON from response:', text.substring(0, 200));
                throw new Error('Could not parse JSON response from Groq');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            logger.error('[GroqService] Advanced prompt generation error:', error);
            throw error;
        }
    }
}

