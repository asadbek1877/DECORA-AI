import logger from '../../utils/logger';
import { uploadUrlToCloudinary } from '../cloudinary.service';
import { AppError } from '../../utils/errors';
import { AIBillingError } from '../replicate.service';
import { AIProvider, DesignMode, DesignStyleInput, GenerationResult } from './ai.provider.interface';

function buildPrompt(style: DesignStyleInput, roomType?: string, customPrompt?: string, mode: DesignMode = 'preview'): string {
    const room = roomType || 'room';
    if (customPrompt) {
        const suffix = mode === 'final'
            ? 'Ultra high resolution, professional architectural render.'
            : 'Photorealistic 4K quality, architectural visualization.';
        return `Redesign this ${room}: ${customPrompt}. Interior design style: ${style.displayName}. Keep room structure unchanged. ${suffix}`;
    }

    return [
        `Professional interior redesign of a ${room} in ${style.displayName} style.`,
        `Color palette: ${style.colorPalette.join(', ')}.`,
        `Furniture: ${style.furnitureType}.`,
        `Lighting: ${style.lightingMood}.`,
        `Materials: ${style.materials.join(', ')}.`,
        'Keep exact room geometry, camera angle, walls, windows, doors, floor, and ceiling.',
        mode === 'final'
            ? 'Ultra detailed, photorealistic, 8k architectural rendering.'
            : 'Photorealistic, high detail architectural visualization.',
    ].join(' ');
}

function toDataUriFromBuffer(contentType: string, buffer: Buffer): string {
    return `data:${contentType};base64,${buffer.toString('base64')}`;
}

export class SegmindProvider implements AIProvider {
    private readonly apiKey: string;
    private readonly endpoint: string;

    constructor(apiKey: string, endpoint: string) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
        if (!this.apiKey) {
            logger.warn('[SegmindProvider] SEGMIND_API_KEY is not set — API calls will fail with 401/403.');
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
        let prompt = buildPrompt(style, roomType, customPrompt, mode);
        if (additionalInstructions) {
            prompt += ` Additional requirements: ${additionalInstructions}`;
        }

        const payload = {
            prompt,
            image: imageUrl,
            strength: 0.4,              // Very low (was 0.65/0.6) - minimal processing
            guidance_scale: 2,          // Very low (was 8/7) - fast inference
            num_inference_steps: 10,    // Minimal steps - was 40/30 (75% reduction)
            seed: -1,
            base64: false,
        };

        logger.info(`[SegmindProvider] Generating ${mode} style="${style.name}" via ${this.endpoint}`);

        let response: Response;
        try {
            response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
        } catch (error: any) {
            logger.error(`[SegmindProvider] Network error: ${error.message}`);
            throw new AppError('Segmind request failed. Please try again.', 500);
        }

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`[SegmindProvider] HTTP ${response.status}: ${errorText}`);

            if (response.status === 401 || response.status === 403) {
                throw new AppError('Invalid SEGMIND_API_KEY. Check your .env file.', 500);
            }
            if (
                response.status === 402 ||
                response.status === 429 ||
                (response.status === 406 && /insufficient credits|recharge/i.test(errorText))
            ) {
                throw new AIBillingError('Segmind quota or credits exceeded. Please top up or wait and retry.');
            }
            throw new AppError(`Segmind API error: ${response.statusText}`, 500);
        }

        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        let imageSource: string;

        if (contentType.startsWith('image/')) {
            const raw = Buffer.from(await response.arrayBuffer());
            imageSource = toDataUriFromBuffer(contentType, raw);
        } else {
            const body = await response.json() as any;

            imageSource =
                body?.image ||
                body?.output ||
                body?.url ||
                body?.data?.image ||
                body?.data?.url ||
                body?.images?.[0]?.url ||
                body?.images?.[0];

            if (!imageSource) {
                logger.error(`[SegmindProvider] Unknown response shape: ${JSON.stringify(body).substring(0, 500)}`);
                throw new AppError('Segmind returned no image.', 500);
            }

            if (typeof imageSource === 'string' && !imageSource.startsWith('http') && !imageSource.startsWith('data:')) {
                imageSource = `data:image/png;base64,${imageSource}`;
            }
        }

        const folder = mode === 'final' ? 'finals' : 'previews';
        const cloud = await uploadUrlToCloudinary(imageSource, `ai-interior/${folder}/${style.name}`);

        return {
            imageUrl: cloud.url,
            publicId: cloud.publicId,
            styleName: style.name,
            prompt,
            modelUsed: `segmind/${this.endpoint.split('/').pop() || 'img2img'}`,
        };
    }
}
