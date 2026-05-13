import logger from '../../utils/logger';
import { uploadUrlToCloudinary } from '../cloudinary.service';
import { AppError } from '../../utils/errors';
import { AIBillingError } from '../replicate.service';
import { AIProvider, DesignMode, DesignStyleInput, GenerationResult } from './ai.provider.interface';

// ─── Model & Endpoint ─────────────────────────────────────────────────────────
// stabilityai/stable-diffusion-xl-base-1.0 — CONFIRMED working on HF router free tier.
// Note: HF free tier only supports text-to-image (not img2img).
// The prompt is styled to match the selected interior design style as closely as possible.
const HF_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;


// ─── Instruction Builder ──────────────────────────────────────────────────────
// instruct-pix2pix expects a natural-language EDITING instruction, not a description.
function buildInstruction(
    style: DesignStyleInput,
    roomType?: string,
    customPrompt?: string,
    mode: DesignMode = 'preview',
): string {
    const room = roomType || 'room';

    if (customPrompt) {
        return `Redesign this ${room}: ${customPrompt}. Apply ${style.displayName} interior design style.`;
    }

    const colors = style.colorPalette.slice(0, 3).join(', ');
    const quality = mode === 'final'
        ? 'ultra high resolution, professional architectural render, magazine quality'
        : 'photorealistic, 4K quality, architectural visualization';

    return [
        `Redesign the interior of this ${room} in ${style.displayName} style.`,
        `Use color palette: ${colors}.`,
        `Apply ${style.furnitureType} furniture and ${style.lightingMood} lighting.`,
        `Materials: ${style.materials.slice(0, 3).join(', ')}.`,
        `Keep the room structure and walls, only redesign the interior decor.`,
        quality,
    ].join(' ');
}

// ─── HuggingFace Provider ─────────────────────────────────────────────────────
export class HuggingFaceProvider implements AIProvider {
    private readonly apiToken: string;

    constructor(apiToken: string) {
        if (!apiToken) {
            logger.warn('[HuggingFaceProvider] HUGGINGFACE_API_TOKEN is not set — requests will fail.');
        }
        this.apiToken = apiToken;
    }

    async generateDesign(
        mode: DesignMode,
        imageUrl: string,
        style: DesignStyleInput,
        roomType?: string,
        additionalInstructions?: string,
        customPrompt?: string,
    ): Promise<GenerationResult> {
        const instruction = buildInstruction(style, roomType, customPrompt, mode);
        const fullInstruction = additionalInstructions
            ? `${instruction} Additional: ${additionalInstructions}`
            : instruction;

        // ── SDXL text-to-image request ────────────────────────────────────────────
        // Note: HF free tier does not support img2img. We generate a styled interior
        // based on the prompt. The original imageUrl is not used by SDXL but kept
        // in the signature for API compatibility.
        const requestBody = {
            inputs: fullInstruction,
            parameters: {
                negative_prompt:
                    'ugly, blurry, low quality, distorted, watermark, logo, text, deformed, cartoon, anime',
                num_inference_steps: mode === 'final' ? 50 : 25,
                guidance_scale: 7.5,
                width: 1024,
                height: 1024,
            },
        };

        console.log('[HuggingFaceProvider] Fetching HF URL:', HF_API_URL);
        logger.info(`[HuggingFaceProvider] mode=${mode} style="${style.name}" model=${HF_MODEL}`);
        logger.info(`[HuggingFaceProvider] Prompt: ${fullInstruction.substring(0, 120)}...`);

        // ── Send request ─────────────────────────────────────────────────────────
        let hfResponse: Response;
        try {
            hfResponse = await fetch(HF_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                    'X-Use-Cache': 'false',
                },
                body: JSON.stringify(requestBody),
            });
        } catch (err: any) {
            logger.error(`[HuggingFaceProvider] Network error: ${err.message}`);
            throw new AppError('HuggingFace API network error. Check internet connection.', 503);
        }

        // ── Handle errors ────────────────────────────────────────────────────────
        if (!hfResponse.ok) {
            const errText = await hfResponse.text().catch(() => '(no body)');
            logger.error(
                `[HuggingFaceProvider] API error ${hfResponse.status}: ${errText.substring(0, 300)}`,
            );

            if (hfResponse.status === 401 || hfResponse.status === 403) {
                throw new AppError(
                    'Invalid HuggingFace API token. Check HUGGINGFACE_API_TOKEN in .env',
                    500,
                );
            }
            if (hfResponse.status === 503) {
                // Model cold-start on free HF tier — client should retry
                throw new AIBillingError(
                    'HuggingFace model is loading (cold start). Please wait 20–30 seconds and try again.',
                );
            }
            if (hfResponse.status === 429) {
                throw new AIBillingError('HuggingFace rate limit exceeded. Please try again in a minute.');
            }
            if (hfResponse.status === 404) {
                throw new AppError(
                    `HuggingFace model "${HF_MODEL}" not found on router. Check model availability.`,
                    500,
                );
            }
            throw new AppError(
                `HuggingFace API error (${hfResponse.status}): ${errText.substring(0, 100)}`,
                500,
            );
        }

        // ── Parse response ────────────────────────────────────────────────────────
        const contentType = hfResponse.headers.get('content-type') || '';
        logger.info(`[HuggingFaceProvider] Response Content-Type: ${contentType}`);

        if (!contentType.startsWith('image/')) {
            const body = await hfResponse.text().catch(() => '');
            logger.error(
                `[HuggingFaceProvider] Unexpected response "${contentType}": ${body.substring(0, 300)}`,
            );
            throw new AppError('HuggingFace returned unexpected response format.', 500);
        }

        // ── Upload result to Cloudinary ───────────────────────────────────────────
        const imageBytes = Buffer.from(await hfResponse.arrayBuffer());
        const base64 = imageBytes.toString('base64');
        const dataUri = `data:${contentType};base64,${base64}`;

        const folder = mode === 'final' ? 'finals' : 'previews';
        const cloudResult = await uploadUrlToCloudinary(dataUri, `ai-interior/${folder}/${style.name}`);

        logger.info(`[HuggingFaceProvider] ✓ Uploaded to Cloudinary: ${cloudResult.publicId}`);

        return {
            imageUrl: cloudResult.url,
            publicId: cloudResult.publicId,
            styleName: style.name,
            prompt: fullInstruction,
            modelUsed: `huggingface/${HF_MODEL}`,
        };
    }
}
