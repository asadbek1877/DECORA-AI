import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

export interface CompressedImage {
  base64: string;
  mimeType: 'image/jpeg' | 'image/png';
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

/**
 * Compress image locally on the device before upload
 * - Max 1024x1024 resolution
 * - JPEG quality 0.7 (70%)
 * - Result: typically <500KB payload
 */
export async function compressImageToBase64(
  imageUri: string
): Promise<CompressedImage | null> {
  try {
    console.log('[ImageCompression] Starting compression for:', imageUri);
    
    // Step 1: Get original metadata
    const originalSize = await getFileSizeBytes(imageUri);
    console.log(`[ImageCompression] Original size: ${(originalSize / 1024).toFixed(0)} KB`);

    // Step 2: Resize to max 1024x1024 (preserves aspect ratio)
    console.time('[ImageCompression] Resize');
    const resized = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: 1024,
            height: 1024,
          },
        },
      ],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    console.timeEnd('[ImageCompression] Resize');

    // Step 3: Get resized dimensions
    const metadata = await getImageMetadata(resized.uri);

    // Step 4: Convert to base64
    console.time('[ImageCompression] Base64 encoding');
    const base64 = await uriToBase64(resized.uri);
    console.timeEnd('[ImageCompression] Base64 encoding');

    const compressedSize = Math.round((base64.length * 3) / 4); // Estimate bytes from base64 length
    const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);

    console.log(
      `[ImageCompression] ✓ Complete: ${metadata.width}x${metadata.height} ` +
      `${(originalSize / 1024).toFixed(0)} KB → ${(compressedSize / 1024).toFixed(0)} KB ` +
      `(${compressionRatio}% saved)`
    );

    return {
      base64,
      mimeType: 'image/jpeg',
      originalSize,
      compressedSize,
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error: any) {
    console.error('[ImageCompression] Error:', error.message || error);
    return null;
  }
}

// Helper: Get file size in bytes
async function getFileSizeBytes(uri: string): Promise<number> {
  try {
    // For data URIs, estimate from base64
    if (uri.startsWith('data:')) {
      const base64Part = uri.split(',')[1] || '';
      return Math.round((base64Part.length * 3) / 4);
    }
    
    // For file:// URIs, fetch and get blob size
    if (uri.startsWith('file://')) {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob.size;
    }
    
    return 0;
  } catch (error: any) {
    console.warn('[ImageCompression] Could not get file size:', error.message);
    return 0;
  }
}

// Helper: Get image dimensions using React Native Image
async function getImageMetadata(
  uri: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({ width, height });
      },
      () => {
        console.warn('[ImageCompression] Could not get image size, using defaults');
        // Default to 1024x1024 if we can't determine size
        resolve({ width: 1024, height: 1024 });
      }
    );
  });
}

// Helper: Convert URI to base64 using React Native compatible methods
async function uriToBase64(uri: string): Promise<string> {
  try {
    // If already a data URI, extract base64
    if (uri.startsWith('data:')) {
      const base64 = uri.split(',')[1];
      if (!base64) throw new Error('Invalid data URI format');
      return base64;
    }
    
    // For file:// URIs, fetch and convert to base64
    if (uri.startsWith('file://')) {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blobToBase64(blob);
    }
    
    throw new Error('Unsupported URI format');
  } catch (error: any) {
    console.error('[ImageCompression] Could not convert to base64:', error.message);
    throw new Error('Failed to convert image to base64');
  }
}

// Helper: Convert Blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to extract base64 from FileReader result'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}
