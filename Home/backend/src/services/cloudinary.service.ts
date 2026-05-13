import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { config } from '../config';
import logger from '../utils/logger';

// ─── Cloudinary конфигурация ──────────────
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

// ─── Retry utilities ──────────────────────
interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

async function retryUpload<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoffMultiplier = 2 } = options;
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error?.status || error?.statusCode || 0;
      
      // Don't retry on authentication/authorization errors
      if (status === 401 || status === 403) {
        throw error;
      }

      // Don't retry on client errors (4xx except 429)
      if (status >= 400 && status < 500 && status !== 429) {
        throw error;
      }

      if (attempt < maxAttempts) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        logger.warn(`Upload attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Локал файлни Cloudinary-га юклаш (retry with exponential backoff)
 */
export async function uploadToCloudinary(
  filePath: string,
  folder = 'ai-interior/originals'
): Promise<{ url: string; publicId: string }> {
  return retryUpload(
    async () => {
      const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1024, height: 1024, crop: 'limit' }, // AI pipeline max — keeps payloads small
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      });

      logger.info(`☁️ Uploaded to Cloudinary: ${result.public_id} (${result.bytes} bytes)`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    },
    { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 2 }
  ).catch((error: any) => {
    logger.error(`Cloudinary upload failed after retries: ${error.message}`);
    throw new Error(`Failed to upload image to cloud: ${error.message}`);
  });
}

/**
 * URL орқали расмни Cloudinary-га юклаш (retry with exponential backoff)
 */
export async function uploadUrlToCloudinary(
  imageUrl: string,
  folder = 'ai-interior/generated'
): Promise<{ url: string; publicId: string }> {
  return retryUpload(
    async () => {
      const result: UploadApiResponse = await cloudinary.uploader.upload(imageUrl, {
        folder,
        resource_type: 'image',
      });

      logger.info(`☁️ URL uploaded to Cloudinary: ${result.public_id}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    },
    { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 2 }
  ).catch((error: any) => {
    logger.error(`Cloudinary URL upload failed after retries: ${error.message}`);
    throw new Error(`Failed to upload generated image to cloud: ${error.message}`);
  });
}

/**
 * Cloudinary-дан расм ўчириш
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    const success = result.result === 'ok';
    if (success) {
      logger.info(`☁️ Deleted from Cloudinary: ${publicId}`);
    } else {
      logger.warn(`Cloudinary delete returned: ${result.result} for ${publicId}`);
    }
    return success;
  } catch (error: any) {
    logger.error(`Cloudinary delete failed: ${error.message}`);
    return false;
  }
}

/**
 * Cloudinary URL-дан оптимизация қилинган версиясини олиш
 */
export function getOptimizedUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: string;
}): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: options?.width || 1024,
        height: options?.height || 1024,
        crop: 'limit',
        quality: options?.quality || 'auto:good',
        fetch_format: 'auto',
      },
    ],
  });
}

/**
 * Thumbnail URL олиш
 */
export function getThumbnailUrl(publicId: string, size = 300): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width: size, height: size, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:low', fetch_format: 'auto' },
    ],
  });
}

export default cloudinary;
