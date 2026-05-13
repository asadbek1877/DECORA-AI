/**
 * Image Orientation Utilities
 * Handles EXIF orientation data and image rotation
 */

/**
 * EXIF Orientation values
 * 1 = Normal (0°)
 * 2 = Flipped horizontally
 * 3 = Rotated 180°
 * 4 = Flipped vertically
 * 5 = Rotated 90° + flipped horizontally
 * 6 = Rotated 90° clockwise
 * 7 = Rotated 90° + flipped vertically
 * 8 = Rotated 270° clockwise
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Get display dimensions based on EXIF orientation
 * Swaps width/height for 90° and 270° rotations
 */
export function getDisplayDimensions(
  width: number,
  height: number,
  orientation: number = 1
): ImageDimensions {
  // Orientations 5, 6, 7, 8 involve 90° rotation, so swap dimensions
  if ([5, 6, 7, 8].includes(orientation)) {
    return { width: height, height: width };
  }
  return { width, height };
}

/**
 * Get rotation angle based on EXIF orientation
 * Used for CSS transforms or canvas rotation
 */
export function getRotationAngle(orientation: number = 1): number {
  switch (orientation) {
    case 6:
      return 90;
    case 3:
      return 180;
    case 8:
      return 270;
    default:
      return 0;
  }
}

/**
 * Get transform style for image based on orientation
 * Useful for React Native Image components
 */
export function getImageTransform(orientation: number = 1): string {
  const angle = getRotationAngle(orientation);
  if (angle === 0) return 'none';
  return `rotateZ(${angle}deg)`;
}

/**
 * Determine if image should be displayed in portrait or landscape
 */
export function isPortrait(width: number, height: number): boolean {
  return height > width;
}

/**
 * Log orientation info for debugging
 */
export function logOrientationInfo(
  filename: string,
  width: number,
  height: number,
  orientation: number
): void {
  const orientationMap: Record<number, string> = {
    1: 'Normal',
    2: 'Flipped Horizontal',
    3: '180°',
    4: 'Flipped Vertical',
    5: '90° CW + Flipped H',
    6: '90° CW',
    7: '90° CW + Flipped V',
    8: '270° CW',
  };

  console.log(
    `[ImageOrientation] ${filename}: ${width}x${height}, EXIF: ${orientationMap[orientation] || 'Unknown'}`
  );
}
