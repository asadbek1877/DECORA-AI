import logger from '../utils/logger';
import { config } from '../config';
import { MockProvider } from './ai/mock.provider';
import { HuggingFaceProvider } from './ai/huggingface.provider';
import { ReplicateProvider } from './ai/replicate.provider';
import { GeminiProvider } from './ai/gemini.provider';
import { FalProvider } from './ai/fal.provider';
import { SegmindProvider } from './ai/segmind.provider';
import { AppError } from '../utils/errors';
import { AIBillingError } from './replicate.service';
import { AIProvider, DesignMode, DesignStyleInput, GenerationResult } from './ai/ai.provider.interface';
import { getStrengthFromIntensity } from '../prompts/builder';

// Re-export types so controller doesn't need to change import paths
export type { DesignStyleInput, GenerationResult, DesignMode };

// ─── Provider types ───────────────────────────────────────────────────────────
export type ActiveProvider = 'mock' | 'fal' | 'huggingface' | 'replicate' | 'gemini' | 'segmind';

// ─── Available Models Metadata ────────────────────────────────────────────────
export const availableModels = [
    {
        id: 'segmind',
        name: 'Segmind (Img2Img)',
        description: 'Fast image-to-image generation with your Segmind API key.',
        isFree: true,
        recommended: true,
    },
    {
        id: 'fal',
        name: 'Fal.ai (FLUX ControlNet)',
        description: 'BEST for keeping room structure. Very fast. Requires API key with $5 free credit.',
        isFree: true,
        recommended: true,
    },
    {
        id: 'gemini',
        name: 'Google Gemini 2.0 Flash',
        description: 'TRUE img2img. Keeps your room structure when redesigning! Free tier available.',
        isFree: true,
        recommended: true,
    },
    {
        id: 'huggingface',
        name: 'Hugging Face (Free)',
        description: 'Text-to-image only. Slower, but completely free.',
        isFree: true,
        recommended: false,
    },
    {
        id: 'replicate',
        name: 'Replicate (Paid)',
        description: 'High quality models, but costs 1 credit per generation.',
        isFree: false,
        recommended: false,
    },
    {
        id: 'mock',
        name: 'Mock (Demo)',
        description: 'Instant generation for testing UI without using credits.',
        isFree: true,
        recommended: false,
    }
];

// ─── Factory ──────────────────────────────────────────────────────────────────
export function getProvider(providerNameOverride?: string): AIProvider {
    const providerName = (providerNameOverride || config.activeAiProvider || 'mock').toLowerCase() as ActiveProvider;

    switch (providerName) {
        case 'gemini':
            return new GeminiProvider((config as any).gemini?.apiKey || '');
        case 'fal':
            return new FalProvider((config as any).fal?.apiKey || '');
        case 'segmind':
            return new SegmindProvider(
                (config as any).segmind?.apiKey || '',
                (config as any).segmind?.endpoint || 'https://api.segmind.com/v1/sd1.5-img2img',
            );
        case 'huggingface':
            return new HuggingFaceProvider(config.huggingface.apiToken);
        case 'replicate':
            return new ReplicateProvider(config.replicate.apiToken);
        case 'mock':
            return new MockProvider();
        default:
            logger.warn(`[AIService] Unknown provider "${providerName}" — falling back to mock`);
            return new MockProvider();
    }
}

function resolveProviderForImageEditing(providerNameOverride?: string): string {
    const requested = (providerNameOverride || config.activeAiProvider || 'mock').toLowerCase();

    // HuggingFace free router model is text-to-image in this project.
    // For uploaded-room redesign we must use img2img-capable providers.
    if (requested === 'huggingface') {
        const fallback = ((config as any).gemini?.apiKey ? 'gemini' : ((config as any).fal?.apiKey ? 'fal' : 'replicate'));
        logger.warn(`[AIService] Provider "huggingface" does not preserve uploaded room layout. Auto-switching to "${fallback}" for image editing.`);
        return fallback;
    }

    return requested;
}

function normalizeRequestedProvider(providerNameOverride?: string): string {
    return (providerNameOverride || config.activeAiProvider || 'mock').toLowerCase();
}

function getImageEditingFallbackChain(initialProvider?: string): string[] {
    const first = resolveProviderForImageEditing(initialProvider);
    const chain = [first, 'segmind', 'gemini', 'fal', 'replicate'];
    return chain.filter((p, i) => chain.indexOf(p) === i);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns true when the active provider is free (no credits charged).
 * mock and huggingface are free; only replicate costs a credit.
 */
export function isFreeProvider(providerNameOverride?: string): boolean {
    const active = (providerNameOverride || config.activeAiProvider || 'mock').toLowerCase();
    return active === 'mock' || active === 'huggingface' || active === 'gemini' || active === 'fal' || active === 'segmind';
}

/**
 * Returns the active provider name for logging / response metadata.
 */
export function getActiveProvider(providerNameOverride?: string): string {
    return (providerNameOverride || config.activeAiProvider || 'mock').toLowerCase();
}

/**
 * Returns whether a provider has the minimum required credentials configured.
 * This avoids attempting fallbacks that are guaranteed to fail.
 */
export function isProviderConfigured(providerName: string): boolean {
    const provider = (providerName || '').toLowerCase();

    switch (provider) {
        case 'gemini':
            return Boolean((config as any).gemini?.apiKey);
        case 'fal':
            return Boolean((config as any).fal?.apiKey);
        case 'segmind':
            return Boolean((config as any).segmind?.apiKey);
        case 'huggingface':
            return Boolean((config as any).huggingface?.apiToken);
        case 'replicate':
            return Boolean((config as any).replicate?.apiToken);
        case 'mock':
            return true;
        default:
            return false;
    }
}

/**
 * Generate a single design (preview or final) using the active AI provider.
 * If user explicitly selects a provider (via aiProvider param), use ONLY that provider — NO fallback.
 * If no explicit provider is given, use active config provider with NO fallback either.
 * This ensures user choice is respected strictly.
 */
export async function generateDesign(
    mode: DesignMode,
    imageUrl: string,
    style: DesignStyleInput,
    roomType?: string,
    additionalInstructions?: string,
    customPrompt?: string,
    modelName?: string,
    aiProvider?: string,
): Promise<GenerationResult> {
    // Determine which provider to use (no fallback chain — strict mode)
    const providerName = aiProvider 
        ? (aiProvider.toLowerCase() as ActiveProvider)
        : (config.activeAiProvider?.toLowerCase() as ActiveProvider) || 'mock';

    try {
        logger.info(`[AIService] Using provider "${providerName}" for ${mode} style="${style.name}"`);
        const provider = getProvider(providerName);
        const result = await provider.generateDesign(
            mode,
            imageUrl,
            style,
            roomType,
            additionalInstructions,
            customPrompt,
        );
        return result;
    } catch (error: any) {
        const status = error?.statusCode || error?.status || 500;
        const message = error?.message || 'Unknown error';
        logger.error(`[AIService] Provider "${providerName}" failed (${status}): ${message}`);
        
        // Re-throw error immediately — no fallback, respect user choice
        throw error;
    }
}

/**
 * Generate previews for multiple styles sequentially.
 * Adds a 3-second delay between styles to respect rate limits.
 */
export async function generateMultipleDesignPreviews(
    imageUrl: string,
    styles: DesignStyleInput[],
    roomType?: string,
    customPrompt?: string,
    modelName?: string,
    intensity?: number,
): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];
    
    // Build intensity-based instructions if provided
    let intensityInstructions = '';
    if (intensity !== undefined) {
        const strengthInfo = getStrengthFromIntensity(intensity);
        intensityInstructions = `\n\n[DESIGN INTENSITY: ${intensity}%]\n${strengthInfo.intensityDescription}`;
    }

    for (const style of styles) {
        try {
            const result = await generateDesign('preview', imageUrl, style, roomType, intensityInstructions, customPrompt, modelName);
            results.push(result);

            if (styles.length > 1) {
                await new Promise((r) => setTimeout(r, 3000));
            }
        } catch (error: any) {
            // Re-throw billing errors immediately — no point retrying other styles
            if (error instanceof AIBillingError) throw error;
            logger.error(`[AIService] Preview failed for style "${style.name}": ${error.message}`);
            // Continue with remaining styles
        }
    }

    return results;
}

/**
 * Extract room details from an image.
 */
export async function analyzeRoom(imageUrl: string): Promise<any> {
    const provider = getProvider('gemini'); // Always use Gemini for analysis
    if (provider instanceof GeminiProvider) {
        return provider.analyzeRoom(imageUrl);
    }
    throw new AppError('Gemini provider is required for room analysis.', 500);
}

/**
 * Generate a descriptive prompt for a room and style.
 */
export async function suggestPrompt(roomType: string, styleDetails: any): Promise<string> {
   const provider = getProvider('gemini'); // Always use Gemini for prompt gen
   if (provider instanceof GeminiProvider) {
       return provider.suggestPrompt(roomType, styleDetails);
   }
   throw new AppError('Gemini provider is required for prompt generation.', 500);
}

// ─── Legacy compatibility exports ─────────────────────────────────────────────
// Keep these so any file that imported the old function names still works
export const generateDesignPreview = (
    imageUrl: string,
    style: DesignStyleInput,
    roomType?: string,
    customPrompt?: string,
    modelName?: string,
) => generateDesign('preview', imageUrl, style, roomType, undefined, customPrompt, modelName);

export const generateDesignFinal = (
    imageUrl: string,
    style: DesignStyleInput,
    roomType?: string,
    additionalInstructions?: string,
    customPrompt?: string,
    modelName?: string,
) => generateDesign('final', imageUrl, style, roomType, additionalInstructions, customPrompt, modelName);
