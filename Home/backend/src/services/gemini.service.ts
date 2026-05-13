import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { DesignStyle } from '../models';
import { buildPreviewPrompt, buildFinalPrompt } from '../prompts/builder';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

// Gemini API key (read directly from env — kept for image analysis capabilities)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  logger.warn('GEMINI_API_KEY is not set. Gemini features will not work.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Models that support image generation/analysis
const IMAGE_GENERATION_MODELS = [
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-pro-vision',
];

// Fallback text-only analysis models
const TEXT_ANALYSIS_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-pro',
];

function fileToGenerativePart(filePath: string, mimeType: string) {
  return {
    inlineData: {
      data: fs.readFileSync(filePath).toString('base64'),
      mimeType,
    },
  };
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
  };
  return mimes[ext] || 'image/jpeg';
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a redesigned room image using Gemini image generation.
 * Tries models with image output support, falls back to text analysis.
 */
async function generateImageWithGemini(
  prompt: string,
  imagePart: { inlineData: { data: string; mimeType: string } }
): Promise<{ imageData: Buffer; mimeType: string; analysisText?: string } | null> {
  let lastError: Error | null = null;

  for (const modelName of IMAGE_GENERATION_MODELS) {
    try {
      logger.info(`Trying image generation with model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          // @ts-ignore - responseModalities is supported in newer API versions
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      const response = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            {
              text: `${prompt}\n\nIMPORTANT: You MUST generate a new redesigned image of this room. Edit the room in the photo to match the described style. Return the edited image.`,
            },
            imagePart,
          ],
        }],
      });

      const candidates = response.response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error(`Model ${modelName} returned no candidates`);
      }

      let imageData: Buffer | null = null;
      let imageMimeType = 'image/png';
      let analysisText: string | undefined;

      // Parse response parts for both image and text
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageData = Buffer.from(part.inlineData.data, 'base64');
          imageMimeType = part.inlineData.mimeType || 'image/png';
          logger.info(`Got generated image from ${modelName} (${imageMimeType}, ${imageData.length} bytes)`);
        } else if (part.text) {
          analysisText = part.text;
        }
      }

      if (imageData && imageData.length > 1000) {
        logger.info(`Successfully generated image with model: ${modelName}`);
        return { imageData, mimeType: imageMimeType, analysisText };
      }

      lastError = new Error(`Model ${modelName} did not return a valid image`);
      logger.warn(lastError.message);
    } catch (error: any) {
      lastError = error;
      const msg = error.message || '';
      logger.warn(`Image generation model ${modelName} failed: ${msg}`);
      
      console.log(`[GEMINI API ERROR] Model: ${modelName} | Error:`, msg);

      if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API key')) {
        console.log(`[GEMINI 403] Check API Key for ${modelName}.`);
        throw new AppError('Gemini API key is invalid or expired. Check your configuration.', 500);
      } else if (msg.includes('500') || msg.includes('INTERNAL')) {
        console.log(`[GEMINI 500] Internal Server Error for ${modelName}. Retrying...`);
        // Fall through to next model
      } else if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        logger.warn('Rate limited, waiting 3s before trying next model...');
        await delay(3000);
      }
    }
  }

  logger.warn(`Image generation failed for all models. Last error: ${lastError?.message}`);
  return null;
}

/**
 * Fallback: Analyze room image with Gemini text models
 */
async function analyzeRoomWithGemini(
  prompt: string,
  imagePart: { inlineData: { data: string; mimeType: string } }
): Promise<string> {
  let lastError: Error | null = null;

  for (const modelName of TEXT_ANALYSIS_MODELS) {
    try {
      logger.info(`Analyzing with text model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
      });

      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
      });

      const candidates = response.response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error(`Model ${modelName} returned no candidates`);
      }

      const textContent = candidates[0].content.parts[0];
      if (!textContent || !textContent.text) {
        lastError = new Error(`Model ${modelName} did not return text`);
        continue;
      }

      logger.info(`Successfully analyzed room with model: ${modelName}`);
      return textContent.text;
    } catch (error: any) {
      lastError = error;
      const msg = error.message || '';
      logger.warn(`Model ${modelName} failed: ${msg}`);

      if (msg.includes('API key') || msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
        throw new AppError(
          'Gemini API key is invalid or expired. Check your GEMINI_API_KEY in .env',
          500
        );
      }

      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        logger.warn('Rate limited, waiting 3s before trying next model...');
        await delay(3000);
      }
    }
  }

  throw new AppError(
    `Failed to analyze room with Gemini. Last error: ${lastError?.message || 'Unknown'}`,
    500
  );
}

/**
 * Get the file extension from a MIME type
 */
function extensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
  };
  return map[mimeType] || '.png';
}

export async function generatePreview(
  imagePath: string,
  style: DesignStyle,
  roomType?: string
): Promise<{ imageBase64: string; imagePath: string; analysis?: string }> {
  logger.info(`Generating preview for style: ${style.name}`);

  const prompt = buildPreviewPrompt(style, roomType);
  const mimeType = getMimeType(imagePath);
  const imagePart = fileToGenerativePart(imagePath, mimeType);

  // Try to generate an actual redesigned image
  const imageResult = await generateImageWithGemini(prompt, imagePart);

  if (imageResult) {
    // Save the AI-generated image
    const ext = extensionFromMime(imageResult.mimeType);
    const filename = `preview_${style.name}_${uuidv4()}${ext}`;
    const outputPath = path.join(config.storage.uploadDir, filename);

    fs.writeFileSync(outputPath, imageResult.imageData);
    const imageBase64 = imageResult.imageData.toString('base64');

    logger.info(`AI-generated preview saved: ${outputPath}`);
    return {
      imageBase64,
      imagePath: outputPath,
      analysis: imageResult.analysisText,
    };
  }

  // Fallback: analyze with text and copy original image
  logger.warn(`Falling back to text analysis for ${style.name} (image generation not available)`);
  const analysisText = await analyzeRoomWithGemini(prompt, imagePart);
  logger.info(`Room analyzed for ${style.name}: ${analysisText.substring(0, 100)}...`);

  const ext = path.extname(imagePath);
  const filename = `preview_${style.name}_${uuidv4()}${ext}`;
  const outputPath = path.join(config.storage.uploadDir, filename);

  fs.copyFileSync(imagePath, outputPath);

  const imageBuffer = fs.readFileSync(outputPath);
  const imageBase64 = imageBuffer.toString('base64');

  logger.info(`Preview saved (fallback - original copy): ${outputPath}`);
  return {
    imageBase64,
    imagePath: outputPath,
    analysis: analysisText,
  };
}

export async function generateFinal(
  imagePath: string,
  style: DesignStyle,
  roomType?: string,
  additionalInstructions?: string
): Promise<{ imageBase64: string; imagePath: string; analysis?: string }> {
  logger.info(`Generating final image for style: ${style.name}`);

  const prompt = buildFinalPrompt(style, roomType, additionalInstructions);
  const mimeType = getMimeType(imagePath);
  const imagePart = fileToGenerativePart(imagePath, mimeType);

  // Try to generate an actual redesigned image
  const imageResult = await generateImageWithGemini(prompt, imagePart);

  if (imageResult) {
    // Save the AI-generated image
    const ext = extensionFromMime(imageResult.mimeType);
    const filename = `final_${style.name}_${uuidv4()}${ext}`;
    const outputPath = path.join(config.storage.uploadDir, filename);

    fs.writeFileSync(outputPath, imageResult.imageData);
    const imageBase64 = imageResult.imageData.toString('base64');

    logger.info(`AI-generated final image saved: ${outputPath}`);
    return {
      imageBase64,
      imagePath: outputPath,
      analysis: imageResult.analysisText,
    };
  }

  // Fallback: analyze with text and copy original image
  logger.warn(`Falling back to text analysis for final ${style.name}`);
  const analysisText = await analyzeRoomWithGemini(prompt, imagePart);
  logger.info(`Final design analyzed for ${style.name}: ${analysisText.substring(0, 100)}...`);

  const ext = path.extname(imagePath);
  const filename = `final_${style.name}_${uuidv4()}${ext}`;
  const outputPath = path.join(config.storage.uploadDir, filename);

  fs.copyFileSync(imagePath, outputPath);

  const imageBuffer = fs.readFileSync(outputPath);
  const imageBase64 = imageBuffer.toString('base64');

  logger.info(`Final image saved (fallback - original copy): ${outputPath}`);
  return {
    imageBase64,
    imagePath: outputPath,
    analysis: analysisText,
  };
}

export async function generateMultiplePreviews(
  imagePath: string,
  styles: DesignStyle[],
  roomType?: string
): Promise<Array<{ styleName: string; imageBase64: string; imagePath: string }>> {
  const results: Array<{ styleName: string; imageBase64: string; imagePath: string }> = [];

  // Process styles sequentially to avoid API rate limits
  for (const style of styles) {
    try {
      const result = await generatePreview(imagePath, style, roomType);
      results.push({
        styleName: style.name,
        ...result,
      });
      // Small delay between requests to avoid rate limiting
      if (styles.length > 1) {
        await delay(2000);
      }
    } catch (error: any) {
      logger.error(`Failed to generate preview for ${style.name}: ${error.message}`);
      // Continue with other styles even if one fails
    }
  }

  return results;
}
