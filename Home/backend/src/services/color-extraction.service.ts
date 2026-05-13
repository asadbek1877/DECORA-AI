import sharp from 'sharp';
import logger from '../utils/logger';

export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
}

export interface ColorAnalysisResult {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  palette: string[];
  hexCodes: { [key: string]: string };
  rgbCodes?: { [key: string]: { r: number; g: number; b: number } };
}

/**
 * Extract dominant colors from an image
 * Uses k-means clustering to find the most prominent colors
 */
export class ColorExtractionService {
  /**
   * Helper: Convert RGB to Hex
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  }

  /**
   * Helper: Convert Hex to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Helper: Calculate color distance in RGB space
   */
  static colorDistance(
    c1: { r: number; g: number; b: number },
    c2: { r: number; g: number; b: number }
  ): number {
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  /**
   * Extract top N dominant colors from an image using k-means clustering
   */
  static async extractDominantColors(
    imageBuffer: Buffer,
    numColors: number = 5
  ): Promise<ExtractedColor[]> {
    try {
      logger.info('[ColorExtraction] Extracting colors from image...');

      // Resize image for faster processing
      const resized = await sharp(imageBuffer)
        .resize(100, 100, { fit: 'cover' })
        .raw()
        .toBuffer();

      // Extract pixel data (3 bytes per pixel: R, G, B)
      const pixels: { r: number; g: number; b: number }[] = [];
      for (let i = 0; i < resized.length; i += 3) {
        pixels.push({
          r: resized[i],
          g: resized[i + 1],
          b: resized[i + 2],
        });
      }

      // K-means clustering
      let centroids = this.initializeCentroids(pixels, numColors);
      let assignments: number[] = [];

      for (let iteration = 0; iteration < 10; iteration++) {
        // Assign pixels to nearest centroid
        assignments = pixels.map((pixel) =>
          centroids.reduce((nearest, centroid, idx) => {
            const dist = this.colorDistance(pixel, centroid);
            const nearestDist = this.colorDistance(pixel, centroids[nearest]);
            return dist < nearestDist ? idx : nearest;
          }, 0)
        );

        // Update centroids
        const newCentroids: { r: number; g: number; b: number }[] = [];
        for (let c = 0; c < numColors; c++) {
          const clusterPixels = pixels.filter((_, i) => assignments[i] === c);
          if (clusterPixels.length > 0) {
            const avgR = Math.round(
              clusterPixels.reduce((sum, p) => sum + p.r, 0) / clusterPixels.length
            );
            const avgG = Math.round(
              clusterPixels.reduce((sum, p) => sum + p.g, 0) / clusterPixels.length
            );
            const avgB = Math.round(
              clusterPixels.reduce((sum, p) => sum + p.b, 0) / clusterPixels.length
            );
            newCentroids.push({ r: avgR, g: avgG, b: avgB });
          } else {
            newCentroids.push(centroids[c]);
          }
        }
        centroids = newCentroids;
      }

      // Count pixels per centroid to get percentage
      const colorCounts = new Array(numColors).fill(0);
      assignments.forEach((assignment) => {
        colorCounts[assignment]++;
      });

      const totalPixels = pixels.length;
      const extractedColors: ExtractedColor[] = centroids
        .map((centroid, idx) => ({
          hex: this.rgbToHex(centroid.r, centroid.g, centroid.b),
          rgb: centroid,
          percentage: Math.round((colorCounts[idx] / totalPixels) * 100),
        }))
        .sort((a, b) => b.percentage - a.percentage) // Sort by percentage descending
        .slice(0, numColors);

      logger.info('[ColorExtraction] Extracted colors:', extractedColors);
      return extractedColors;
    } catch (error) {
      logger.error('[ColorExtraction] Error extracting colors:', error);
      // Return default palette on error
      return this.getDefaultPalette();
    }
  }

  /**
   * Analyze image and return structured color analysis
   */
  static async analyzeImageColors(imageBuffer: Buffer): Promise<ColorAnalysisResult> {
    const dominantColors = await this.extractDominantColors(imageBuffer, 8);

    const palette = dominantColors.map((c) => c.hex);
    const hexCodes: { [key: string]: string } = {
      primary: dominantColors[0]?.hex || '#808080',
      secondary: dominantColors[1]?.hex || '#A0A0A0',
      accent: dominantColors[2]?.hex || '#C0C0C0',
    };

    const rgbCodes: { [key: string]: { r: number; g: number; b: number } } = {
      primary: dominantColors[0]?.rgb || { r: 128, g: 128, b: 128 },
      secondary: dominantColors[1]?.rgb || { r: 160, g: 160, b: 160 },
      accent: dominantColors[2]?.rgb || { r: 192, g: 192, b: 192 },
    };

    return {
      primaryColor: dominantColors[0]?.hex || '#808080',
      secondaryColor: dominantColors[1]?.hex || '#A0A0A0',
      accentColor: dominantColors[2]?.hex || '#C0C0C0',
      palette,
      hexCodes,
      rgbCodes,
    };
  }

  /**
   * Initialize centroids randomly from pixels
   */
  private static initializeCentroids(
    pixels: { r: number; g: number; b: number }[],
    k: number
  ): { r: number; g: number; b: number }[] {
    const centroids: { r: number; g: number; b: number }[] = [];
    const step = Math.floor(pixels.length / k);

    for (let i = 0; i < k; i++) {
      const randomIdx = Math.min(i * step + Math.floor(Math.random() * step), pixels.length - 1);
      centroids.push(pixels[randomIdx]);
    }

    return centroids;
  }

  /**
   * Get default neutral palette (fallback)
   */
  private static getDefaultPalette(): ExtractedColor[] {
    return [
      { hex: '#808080', rgb: { r: 128, g: 128, b: 128 }, percentage: 25 },
      { hex: '#A0A0A0', rgb: { r: 160, g: 160, b: 160 }, percentage: 20 },
      { hex: '#C0C0C0', rgb: { r: 192, g: 192, b: 192 }, percentage: 15 },
      { hex: '#606060', rgb: { r: 96, g: 96, b: 96 }, percentage: 20 },
      { hex: '#E0E0E0', rgb: { r: 224, g: 224, b: 224 }, percentage: 20 },
    ];
  }
}
