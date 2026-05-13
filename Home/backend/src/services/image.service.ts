import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import logger from '../utils/logger';

export interface ProcessedImage {
  path: string;
  filename: string;
  width: number;
  height: number;
  format: string;
}

export async function processUploadedImage(filePath: string): Promise<ProcessedImage> {
  const metadata = await sharp(filePath).metadata();
  const originalSize = fs.statSync(filePath).size;

  // ── FAST MODE: Minimal compression ─────────────────────────────────────
  // Compress to 512px max (70% smaller than 1024) for ultra-fast pipeline
  const maxDimension = 512;

  let pipeline = sharp(filePath);

  // Fix image orientation based on EXIF data
  // This ensures images taken in portrait/landscape are rotated correctly
  pipeline = pipeline.rotate();

  // Resize if too large while maintaining aspect ratio
  if ((metadata.width && metadata.width > maxDimension) || (metadata.height && metadata.height > maxDimension)) {
    pipeline = pipeline.resize(maxDimension, maxDimension, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to JPEG at 70 quality for fast processing (~40% smaller than q85)
  // Remove EXIF data after rotation to prevent double-rotation by clients
  const outputFilename = `processed_${uuidv4()}.jpg`;
  const outputPath = path.join(config.storage.uploadDir, outputFilename);

  await pipeline
    .rotate() // Auto-rotate based on EXIF orientation
    .jpeg({ quality: 70, progressive: true })
    .withMetadata({
      exif: {
        IFD0: {
          Orientation: '1', // Reset orientation to normal after rotation (string not number)
        }
      }
    })
    .toFile(outputPath);

  const processedMeta = await sharp(outputPath).metadata();
  const processedSize = fs.statSync(outputPath).size;

  logger.info(
    `[ImageService] Processed: ${outputFilename} | ` +
    `${processedMeta.width}x${processedMeta.height} | ` +
    `${(originalSize / 1024).toFixed(0)} KB → ${(processedSize / 1024).toFixed(0)} KB ` +
    `(saved ${Math.round((1 - processedSize / originalSize) * 100)}%)`
  );

  return {
    path: outputPath,
    filename: outputFilename,
    width: processedMeta.width || 0,
    height: processedMeta.height || 0,
    format: 'jpeg',
  };
}

export async function createThumbnail(filePath: string, size = 200): Promise<string> {  // Reduced from 300
  const outputFilename = `thumb_${uuidv4()}.jpg`;
  const outputPath = path.join(config.storage.uploadDir, outputFilename);

  await sharp(filePath)
    .rotate() // Fix EXIF orientation for thumbnails too
    .resize(size, size, { fit: 'cover' })
    .jpeg({ quality: 65 })  // Reduced from 80
    .withMetadata({
      exif: {
        IFD0: {
          Orientation: '1', // Reset orientation after rotation (string not number)
        }
      }
    })
    .toFile(outputPath);

  return outputPath;
}

export function deleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error: any) {
    logger.error(`Failed to delete file: ${error.message}`);
    return false;
  }
}

export function getImageUrl(filename: string): string {
  return `/uploads/${filename}`;
}

export function ensureUploadDir(): void {
  const dir = config.storage.uploadDir;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Upload directory created: ${dir}`);
  }
}
