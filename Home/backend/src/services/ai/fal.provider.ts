import logger from '../../utils/logger';
import { uploadUrlToCloudinary } from '../cloudinary.service';
import { AppError } from '../../utils/errors';
import { AIBillingError } from '../replicate.service';
import { AIProvider, DesignMode, DesignStyleInput, GenerationResult } from './ai.provider.interface';

// fal.ai supports FLUX with ControlNet. 
// Options: fal-ai/flux-general/image-to-image Or fal-ai/flux-pro/v1/controlnet
const FAL_ENDPOINT = 'https://fal.run/fal-ai/flux-general/image-to-image';

function buildInstruction(style: DesignStyleInput, roomType?: string, customPrompt?: string, mode?: DesignMode): string {
    const room = roomType || 'room';
    if (customPrompt) {
        return `Redesign this ${room}: ${customPrompt}. Interior design style: ${style.displayName}.`;
    }

    return [
        `High-quality architectural interior design of a ${room}.`,
        `Style: ${style.displayName} interior design.`,
        `Colors: ${style.colorPalette.join(', ')}.`,
        `Lighting: ${style.lightingMood}.`,
        `Materials: ${style.materials.join(', ')}.`,
        `Furniture: ${style.furnitureType}.`,
        `Keep the exact same room structure, walls, windows, and perspective.`,
        mode === 'final' ? 'Ultra photorealistic, 8k resolution, architectural rendering.' : 'Photorealistic.'
    ].join(' ');
}

export class FalProvider implements AIProvider {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        if (!this.apiKey) {
            logger.warn('[FalProvider] FAL_KEY is not set — API calls will fail with 401.');
        }
    }

    async generateDesign(
        mode: DesignMode,
        imageUrl: string,
        style: DesignStyleInput,
        roomType?: string,
        additionalInstructions?: string,
        customPrompt?: string,
    ): Promise<GenerationResult> {
        let instruction = buildInstruction(style, roomType, customPrompt, mode);
        if (additionalInstructions) {
            instruction += ` Additional details: ${additionalInstructions}`;
        }

        // ── FAST MODE: Minimal resources ────────────────────────────────────
        // Use very small images (512px) and minimal inference steps for fast generation
        let optimizedImageUrl = imageUrl;
        if (imageUrl.includes('/upload/')) {
            // Always use 512px for speed (70% smaller than 1024, 85% smaller than 1920)
            optimizedImageUrl = imageUrl.replace('/upload/', `/upload/w_512,c_limit,q_auto/`);
        }

        logger.info(`[FalProvider] Generating ${mode} for style "${style.name}" (FAST MODE)`);
        logger.info(`[FalProvider] Prompt: ${instruction.substring(0, 100)}...`);

        try {
            // fal.ai expects an image_url and an array of controlnets
            // MINIMIZED: fewer steps, lower guidance, weak ControlNet to reduce computation
            const payload = {
                prompt: instruction,
                image_url: optimizedImageUrl,
                strength: 0.35, // Very low transformation (was 0.85) - minimal processing
                controlnets: [
                    {
                        path: "https://huggingface.co/InstantX/FLUX.1-dev-Controlnet-Canny/resolve/main/diffusion_pytorch_model.safetensors",
                        control_image_url: optimizedImageUrl,
                        conditioning_scale: 0.15  // Very weak ControlNet (was 0.7) - less computation
                    }
                ],
                num_inference_steps: 8,  // Minimal steps - was 25/15 (70% reduction)
                guidance_scale: 1.5,     // Very low guidance - was 3.5 (57% reduction)
                sync_mode: true
            };

            const response = await fetch(FAL_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.text();
                logger.error(`[FalProvider] HTTP Error ${response.status}: ${errorData}`);

                if (response.status === 401) {
                    throw new AppError('Invalid FAL_KEY. Check your .env file.', 500);
                }
                if (response.status === 403) {
                    if (/exhausted balance|user is locked|billing|top up/i.test(errorData)) {
                        throw new AIBillingError('Fal.ai balance exhausted. Please top up your account or wait and retry.');
                    }
                    throw new AppError('Fal.ai access denied. Check FAL_KEY permissions.', 500);
                }
                if (response.status === 402) {
                    throw new AIBillingError('Fal.ai balance exhausted. Please top up your account.');
                }
                throw new AppError(`Fal.ai API error: ${response.statusText}`, 500);
            }

            const data = await response.json() as any;

            // Handle standard fal.ai response
            if (!data.images || data.images.length === 0) {
                logger.error(`[FalProvider] No images inside response: ${JSON.stringify(data)}`);
                throw new AppError('Fal.ai returned empty response', 500);
            }

            const falImageUrl = data.images[0].url;
            logger.info(`[FalProvider] ✓ Image generated! URL: ${falImageUrl.substring(0, 60)}...`);

            // Upload directly from fal URL to Cloudinary
            const folder = mode === 'final' ? 'finals' : 'previews';
            const cloudResult = await uploadUrlToCloudinary(falImageUrl, `ai-interior/${folder}/${style.name}`);

            return {
                imageUrl: cloudResult.url,
                publicId: cloudResult.publicId,
                styleName: style.name,
                prompt: instruction,
                modelUsed: 'fal-ai/flux-general/image-to-image'
            };

        } catch (error: any) {
            logger.error(`[FalProvider] Generation failed: ${error.message}`);

            // Re-throw known errors
            if (error instanceof AppError || error instanceof AIBillingError) {
                throw error;
            }

            throw new AppError(`AI generation failed: ${error.message}`, 500);
        }
    }
}
