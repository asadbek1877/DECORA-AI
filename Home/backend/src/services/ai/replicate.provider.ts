import Replicate from 'replicate';
import logger from '../../utils/logger';
import { uploadUrlToCloudinary } from '../cloudinary.service';
import { AppError } from '../../utils/errors';
import { AIBillingError } from '../replicate.service';
import { AIProvider, DesignMode, DesignStyleInput, GenerationResult } from './ai.provider.interface';

// ─── AI Models ────────────────────────────────────────────────────────────────
const AI_MODELS = {
    interiorDesign: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
    img2img: 'stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6f6b0c7b98c4',
    controlnetCanny: 'jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638d88307bdaf1c2f1ac95079c9613',
};

// ─── Mode Parameters ──────────────────────────────────────────────────────────
const MODE_PARAMS = {
    preview: { guidance_scale: 7.5, prompt_strength: 0.6, num_inference_steps: 30, folder: 'previews' },
    final: { guidance_scale: 8.0, prompt_strength: 0.65, num_inference_steps: 50, width: 1024, height: 1024, folder: 'finals' },
} as const;

// ─── Prompt Builder ───────────────────────────────────────────────────────────
function buildPrompt(style: DesignStyleInput, roomType?: string, customPrompt?: string, mode: DesignMode = 'preview'): string {
    const room = roomType || 'room';
    if (customPrompt) {
        const suffix = mode === 'final'
            ? 'Ultra high resolution, professional architectural render.'
            : 'Photorealistic, 4K quality, architectural visualization.';
        return `${customPrompt} Style: ${style.displayName}. ${suffix}`;
    }
    const base = [
        `Professional interior design photo of a ${room} redesigned in ${style.displayName} style.`,
        `Color palette: ${style.colorPalette.join(', ')}.`,
        `Furniture: ${style.furnitureType}.`,
        `Lighting: ${style.lightingMood}.`,
        `Materials: ${style.materials.join(', ')}.`,
        `Camera: ${style.cameraPerspective}.`,
        `Photorealistic, 4K quality, architectural visualization, magazine-quality interior photography.`,
        `Keep the same room layout and geometry. No text, watermarks, or logos.`,
    ].join(' ');
    return mode === 'final' ? `${base} Ultra high resolution, professional architectural render.` : base;
}

// ─── Raw Replicate runner ─────────────────────────────────────────────────────
async function runModel(client: Replicate, modelId: string, input: Record<string, any>): Promise<string | null> {
    try {
        logger.info(`[ReplicateProvider] Running model: ${modelId}`);
        const output = await client.run(modelId as `${string}/${string}:${string}`, { input });

        if (Array.isArray(output) && output.length > 0) {
            const first = output[0];
            if (typeof first === 'string') return first;
            if (first && typeof first === 'object' && 'url' in first) return (first as any).url();
            if (first?.toString) return first.toString();
        }
        if (typeof output === 'string') return output;
        if (output && typeof output === 'object') {
            if ('url' in (output as any)) return (output as any).url();
            const vals = Object.values(output as object);
            if (vals.length > 0 && typeof vals[0] === 'string') return vals[0] as string;
        }
        logger.error(`[ReplicateProvider] Cannot extract URL from output: ${JSON.stringify(output).substring(0, 300)}`);
        return null;
    } catch (error: any) {
        logger.error(`[ReplicateProvider] Model ${modelId} failed: ${error.message}`);
        const msg = error.message || '';
        if (msg.includes('402') || msg.includes('Payment Required') || msg.includes('Insufficient credit')) {
            throw new AIBillingError('Replicate balance exhausted. Please top up or switch to Gemini/Fal provider.');
        }
        if (msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('rate limit')) {
            throw new AIBillingError('Replicate rate limit exceeded. Please try later.');
        }
        throw error;
    }
}

// ─── Replicate Provider ───────────────────────────────────────────────────────
export class ReplicateProvider implements AIProvider {
    private readonly client: Replicate;

    constructor(apiToken: string) {
        if (!apiToken) {
            logger.warn('[ReplicateProvider] REPLICATE_API_TOKEN is not set — API calls will fail.');
        }
        this.client = new Replicate({ auth: apiToken });
    }

    async generateDesign(
        mode: DesignMode,
        imageUrl: string,
        style: DesignStyleInput,
        roomType?: string,
        additionalInstructions?: string,
        customPrompt?: string,
    ): Promise<GenerationResult> {
        const modeParams = MODE_PARAMS[mode];
        let prompt = buildPrompt(style, roomType, customPrompt, mode);
        if (additionalInstructions) prompt += ` Additional requirements: ${additionalInstructions}`;

        logger.info(`[ReplicateProvider] ${mode.toUpperCase()} — style: ${style.name}`);

        const primaryInput: Record<string, any> = {
            image: imageUrl,
            prompt,
            negative_prompt: 'ugly, blurry, low quality, distorted, text, watermark, logo, deformed, cartoon, anime, painting',
            num_outputs: 1,
            guidance_scale: modeParams.guidance_scale,
            prompt_strength: modeParams.prompt_strength,
            num_inference_steps: modeParams.num_inference_steps,
            scheduler: 'K_EULER_ANCESTRAL',
        };
        if ('width' in modeParams) primaryInput.width = modeParams.width;
        if ('height' in modeParams) primaryInput.height = modeParams.height;

        let resultUrl: string | null = null;

        try {
            resultUrl = await runModel(this.client, AI_MODELS.interiorDesign, primaryInput);
        } catch (err: any) {
            if (err instanceof AIBillingError) throw err;
            logger.warn(`[ReplicateProvider] Primary SDXL failed: ${err.message}. Trying SD 1.5 fallback...`);
            try {
                resultUrl = await runModel(this.client, AI_MODELS.img2img, {
                    image: imageUrl, prompt,
                    negative_prompt: 'ugly, blurry, low quality, text, watermark',
                    num_outputs: 1,
                    guidance_scale: modeParams.guidance_scale,
                    prompt_strength: modeParams.prompt_strength,
                    num_inference_steps: modeParams.num_inference_steps,
                    scheduler: 'K_EULER_ANCESTRAL',
                });
            } catch (fb1: any) {
                if (fb1 instanceof AIBillingError) throw fb1;
                logger.warn(`[ReplicateProvider] SD 1.5 failed: ${fb1.message}. Trying ControlNet fallback...`);
                try {
                    resultUrl = await runModel(this.client, AI_MODELS.controlnetCanny, {
                        image: imageUrl, prompt,
                        negative_prompt: 'ugly, blurry, low quality, text, watermark',
                        num_samples: '1',
                        image_resolution: mode === 'final' ? '1024' : '768',
                        ddim_steps: modeParams.num_inference_steps,
                        scale: 9,
                        a_prompt: mode === 'final'
                            ? 'best quality, extremely detailed, photorealistic, 8k, interior design masterpiece'
                            : 'best quality, extremely detailed, photorealistic, interior design, 4k',
                    });
                } catch (fb2: any) {
                    if (fb2 instanceof AIBillingError) throw fb2;
                    logger.error(`[ReplicateProvider] All models failed for ${mode}`);
                    throw new AppError('Could not generate design — all Replicate models failed.', 500);
                }
            }
        }

        if (!resultUrl) throw new AppError('Replicate returned no image URL.', 500);

        const cloudResult = await uploadUrlToCloudinary(resultUrl, `ai-interior/${modeParams.folder}/${style.name}`);
        logger.info(`[ReplicateProvider] Saved to Cloudinary: ${cloudResult.publicId}`);

        return {
            imageUrl: cloudResult.url,
            publicId: cloudResult.publicId,
            styleName: style.name,
            prompt,
            modelUsed: AI_MODELS.interiorDesign,
        };
    }
}
