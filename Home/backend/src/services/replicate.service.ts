import Replicate from 'replicate';
import { config } from '../config';
import { uploadUrlToCloudinary } from './cloudinary.service';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

// ─── Billing Error (402/429) ──────────────
export class AIBillingError extends AppError {
  constructor(message: string) {
    super(message, 503);
  }
}

// ─── Mock режим учун демо расмлар ─────────
const MOCK_IMAGES: Record<string, string[]> = {
  minimalism: [
    'https://picsum.photos/seed/minimalism1/1024/768',
    'https://picsum.photos/seed/minimalism2/1024/768',
  ],
  modern: [
    'https://picsum.photos/seed/modern1/1024/768',
    'https://picsum.photos/seed/modern2/1024/768',
  ],
  scandinavian: [
    'https://picsum.photos/seed/scandinavian1/1024/768',
    'https://picsum.photos/seed/scandinavian2/1024/768',
  ],
  luxury: [
    'https://picsum.photos/seed/luxury1/1024/768',
    'https://picsum.photos/seed/luxury2/1024/768',
  ],
  industrial: [
    'https://picsum.photos/seed/industrial1/1024/768',
    'https://picsum.photos/seed/industrial2/1024/768',
  ],
  'art-deco': [
    'https://picsum.photos/seed/artdeco1/1024/768',
    'https://picsum.photos/seed/artdeco2/1024/768',
  ],
  cyberpunk: [
    'https://picsum.photos/seed/cyberpunk1/1024/768',
    'https://picsum.photos/seed/cyberpunk2/1024/768',
  ],
  japandi: [
    'https://picsum.photos/seed/japandi1/1024/768',
    'https://picsum.photos/seed/japandi2/1024/768',
  ],
  bohemian: [
    'https://picsum.photos/seed/bohemian1/1024/768',
    'https://picsum.photos/seed/bohemian2/1024/768',
  ],
  classic: [
    'https://picsum.photos/seed/classic1/1024/768',
    'https://picsum.photos/seed/classic2/1024/768',
  ],
  _default: [
    'https://picsum.photos/seed/interior1/1024/768',
    'https://picsum.photos/seed/interior2/1024/768',
  ],
};

function getMockImageUrl(styleName: string, index = 0): string {
  const images = MOCK_IMAGES[styleName] || MOCK_IMAGES._default;
  return images[index % images.length];
}

// ─── Replicate Client ─────────────────────
if (!config.replicate.apiToken) {
  logger.error('REPLICATE_API_TOKEN is not set! AI features will not work.');
}

const replicate = new Replicate({ auth: config.replicate.apiToken });

// ─── AI Models ────────────────────────────
const AI_MODELS = {
  // Primary: SDXL img2img — high quality interior redesign
  interiorDesign: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
  // Fallback 1: SD 1.5 img2img
  img2img: 'stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6f6b0c7b98c4',
  // Fallback 2: ControlNet Canny — preserves room geometry
  controlnetCanny: 'jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638d88307bdaf1c2f1ac95079c9613',
};

// ─── Generation Modes ─────────────────────
type DesignMode = 'preview' | 'final';

const MODE_PARAMS: Record<DesignMode, {
  guidance_scale: number;
  prompt_strength: number;
  num_inference_steps: number;
  width?: number;
  height?: number;
  folder: string;
  mockIndex: number;
}> = {
  preview: {
    guidance_scale: 7.5,
    prompt_strength: 0.6,
    num_inference_steps: 30,
    folder: 'previews',
    mockIndex: 0,
  },
  final: {
    guidance_scale: 8,
    prompt_strength: 0.65,
    num_inference_steps: 50,
    width: 1024,
    height: 1024,
    folder: 'finals',
    mockIndex: 1,
  },
};

// ─── Interfaces ───────────────────────────
export interface DesignStyleInput {
  name: string;
  displayName: string;
  colorPalette: string[];
  lightingMood: string;
  furnitureType: string;
  materials: string[];
  cameraPerspective: string;
  description: string;
}

export interface GenerationResult {
  imageUrl: string;
  publicId: string;
  styleName: string;
  prompt: string;
  modelUsed: string;
}

// ─── Prompt Builder ───────────────────────
function buildInteriorPrompt(
  style: DesignStyleInput,
  roomType?: string,
  customPrompt?: string,
  mode: DesignMode = 'preview'
): string {
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

  if (mode === 'final') {
    return `${base} Ultra high resolution, professional architectural render, magazine cover quality.`;
  }
  return base;
}

// ─── Core Replicate Runner ─────────────────
async function runReplicateModel(
  modelId: string,
  input: Record<string, any>
): Promise<string | null> {
  try {
    logger.info(`[Replicate] Running model: ${modelId}`);
    logger.info(`[Replicate] Input keys: ${JSON.stringify(Object.keys(input))}`);

    const output = await replicate.run(modelId as `${string}/${string}:${string}`, { input });

    logger.info(`[Replicate] Output type: ${typeof output}, isArray: ${Array.isArray(output)}`);

    let resultUrl: string | null = null;

    if (Array.isArray(output) && output.length > 0) {
      const first = output[0];
      if (typeof first === 'string') {
        resultUrl = first;
      } else if (first && typeof first === 'object' && 'url' in first) {
        resultUrl = (first as any).url();
      } else if (first && typeof first.toString === 'function') {
        resultUrl = first.toString();
      }
    } else if (typeof output === 'string') {
      resultUrl = output;
    } else if (output && typeof output === 'object') {
      if ('url' in (output as any)) {
        resultUrl = (output as any).url();
      } else {
        const entries = Object.values(output);
        if (entries.length > 0 && typeof entries[0] === 'string') {
          resultUrl = entries[0];
        }
      }
    }

    if (resultUrl) {
      logger.info(`[Replicate] Generated image URL: ${resultUrl.substring(0, 120)}...`);
    } else {
      logger.error(`[Replicate] Could not extract URL from output: ${JSON.stringify(output).substring(0, 300)}`);
    }

    return resultUrl;
  } catch (error: any) {
    logger.error(`[Replicate] Model ${modelId} FAILED — ${error.name}: ${error.message}`);
    logger.error(`[Replicate] Status: ${error.status || error.statusCode || 'N/A'}`);

    const msg = error.message || '';
    if (msg.includes('402') || msg.includes('Payment Required') || msg.includes('Insufficient credit')) {
      throw new AIBillingError('Replicate balance exhausted. Please top up or switch to Gemini/Fal provider.');
    }
    if (msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('rate limit')) {
      throw new AIBillingError('AI service rate limit exceeded. Please try later.');
    }

    throw error;
  }
}

/**
 * Unified design generation function for both preview and final modes.
 * mode='preview' → 30 steps, guidance 7.5 (fast)
 * mode='final'   → 50 steps, guidance 8, 1024x1024 (high quality)
 */
export async function generateDesign(
  mode: DesignMode,
  originalImageUrl: string,
  style: DesignStyleInput,
  roomType?: string,
  additionalInstructions?: string,
  customPrompt?: string
): Promise<GenerationResult> {
  const modeParams = MODE_PARAMS[mode];
  let prompt = buildInteriorPrompt(style, roomType, customPrompt, mode);

  if (additionalInstructions) {
    prompt += ` Additional requirements: ${additionalInstructions}`;
  }

  logger.info(`[GenerateDesign] ${mode.toUpperCase()} for style: ${style.name}`);

  // ─── MOCK MODE ────────────────────────────
  if (config.useMockAi) {
    logger.info(`[GenerateDesign] MOCK MODE — returning demo image for style "${style.name}"`);
    const delay = mode === 'preview' ? 1000 + Math.random() * 1500 : 1500 + Math.random() * 1500;
    await new Promise((r) => setTimeout(r, delay));
    const mockUrl = getMockImageUrl(style.name, modeParams.mockIndex);
    return {
      imageUrl: mockUrl,
      publicId: `mock-${mode}-${style.name}-${Date.now()}`,
      styleName: style.name,
      prompt: `[MOCK ${mode.toUpperCase()}] ${prompt}`,
      modelUsed: 'mock-mode',
    };
  }

  // ─── REAL AI MODE ─────────────────────────
  const modelId = AI_MODELS.interiorDesign;
  let resultUrl: string | null = null;

  const primaryInput: Record<string, any> = {
    image: originalImageUrl,
    prompt,
    negative_prompt: 'ugly, blurry, low quality, distorted, text, watermark, logo, deformed, cartoon, anime, painting, drawing',
    num_outputs: 1,
    guidance_scale: modeParams.guidance_scale,
    prompt_strength: modeParams.prompt_strength,
    num_inference_steps: modeParams.num_inference_steps,
    scheduler: 'K_EULER_ANCESTRAL',
  };
  if (modeParams.width) primaryInput.width = modeParams.width;
  if (modeParams.height) primaryInput.height = modeParams.height;

  try {
    resultUrl = await runReplicateModel(modelId, primaryInput);
  } catch (error: any) {
    if (error instanceof AIBillingError) throw error;
    logger.warn(`[GenerateDesign] Primary SDXL failed: ${error.message}. Trying fallback 1...`);

    // Fallback 1: SD 1.5 img2img
    try {
      resultUrl = await runReplicateModel(AI_MODELS.img2img, {
        image: originalImageUrl,
        prompt,
        negative_prompt: 'ugly, blurry, low quality, text, watermark',
        num_outputs: 1,
        guidance_scale: modeParams.guidance_scale,
        prompt_strength: modeParams.prompt_strength,
        num_inference_steps: modeParams.num_inference_steps,
        scheduler: 'K_EULER_ANCESTRAL',
      });
    } catch (fallback1Error: any) {
      if (fallback1Error instanceof AIBillingError) throw fallback1Error;
      logger.warn(`[GenerateDesign] Fallback 1 (SD 1.5) failed: ${fallback1Error.message}. Trying fallback 2...`);

      // Fallback 2: ControlNet Canny
      try {
        resultUrl = await runReplicateModel(AI_MODELS.controlnetCanny, {
          image: originalImageUrl,
          prompt,
          negative_prompt: 'ugly, blurry, low quality, text, watermark',
          num_samples: '1',
          image_resolution: mode === 'final' ? '1024' : '768',
          ddim_steps: modeParams.num_inference_steps,
          scale: 9,
          a_prompt: mode === 'final'
            ? 'best quality, extremely detailed, photorealistic, 8k, interior design masterpiece'
            : 'best quality, extremely detailed, photorealistic, interior design, 4k',
        });
      } catch (fallback2Error: any) {
        if (fallback2Error instanceof AIBillingError) throw fallback2Error;
        logger.error(`[GenerateDesign] ALL AI models failed for ${mode}`);
        throw new AppError('Could not generate design. All AI models failed.', 500);
      }
    }
  }

  if (!resultUrl) {
    throw new AppError('AI model returned no result.', 500);
  }

  const cloudResult = await uploadUrlToCloudinary(
    resultUrl,
    `ai-interior/${modeParams.folder}/${style.name}`
  );

  logger.info(`[GenerateDesign] ${mode.toUpperCase()} saved to Cloudinary: ${cloudResult.publicId}`);

  return {
    imageUrl: cloudResult.url,
    publicId: cloudResult.publicId,
    styleName: style.name,
    prompt,
    modelUsed: modelId,
  };
}

/**
 * Generate previews for multiple styles sequentially.
 */
export async function generateMultipleDesignPreviews(
  originalImageUrl: string,
  styles: DesignStyleInput[],
  roomType?: string,
  customPrompt?: string
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];

  for (const style of styles) {
    try {
      const result = await generateDesign('preview', originalImageUrl, style, roomType, undefined, customPrompt);
      results.push(result);

      // Rate limit guard — 3 second delay between styles
      if (styles.length > 1) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    } catch (error: any) {
      if (error instanceof AIBillingError) throw error;
      logger.error(`[Preview] Failed for style ${style.name}: ${error.message}`);
      // Continue with other styles even if one fails
    }
  }

  return results;
}

// ─── Legacy compatibility exports ─────────
// Keep old names so controller doesn't break during refactor transition
export const generateDesignPreview = (
  originalImageUrl: string,
  style: DesignStyleInput,
  roomType?: string,
  customPrompt?: string
) => generateDesign('preview', originalImageUrl, style, roomType, undefined, customPrompt);

export const generateDesignFinal = (
  originalImageUrl: string,
  style: DesignStyleInput,
  roomType?: string,
  additionalInstructions?: string,
  customPrompt?: string
) => generateDesign('final', originalImageUrl, style, roomType, additionalInstructions, customPrompt);
