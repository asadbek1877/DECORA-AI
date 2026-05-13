/**
 * Design File Manager
 * Organizes downloaded designs into folders by style
 * Structure: /designs/[designName]/[style]/[designImage.jpg]
 * 
 * Note: This module provides the folder structure template and management functions.
 * Actual file operations depend on your setup (RNFS, Expo FileSystem, etc.)
 */

export interface DesignFileConfig {
  designName: string;
  style: string;
  imageName: string;
  imageData: string; // base64
}

// Base directory path - can be customized based on your file system setup
const DESIGNS_BASE_DIR = 'documents://designs/';

/**
 * Get the folder path for a specific design and style
 */
export function getDesignFolderPath(designName: string, style: string): string {
  return `${DESIGNS_BASE_DIR}${designName}/${style}/`;
}

/**
 * Get all folder paths by design
 */
export function getAllDesignFolderPaths(designs: { name: string; styles: string[] }[]): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  designs.forEach(design => {
    result[design.name] = {};
    design.styles.forEach(style => {
      result[design.name][style] = getDesignFolderPath(design.name, style);
    });
  });

  return result;
}

/**
 * Generate folder structure template for a design collection
 */
export function generateDesignStructureTemplate(designNames: string[], styles: string[]): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  designNames.forEach(designName => {
    result[designName] = {};
    styles.forEach(style => {
      result[designName][style] = getDesignFolderPath(designName, style);
    });
  });

  return result;
}

/**
 * Get the image file path within a design folder
 */
export function getDesignImagePath(designName: string, style: string, imageName: string): string {
  return `${getDesignFolderPath(designName, style)}${imageName}`;
}

/**
 * Common design names
 */
export const COMMON_DESIGNS = [
  'Kitchen Redesign',
  'Living Room 2025',
  'Bedroom Makeover',
  'Bathroom Update',
  'Office Space',
  'Dining Area',
  'Entryway Design',
];

/**
 * Available styles
 */
export const DESIGN_STYLES = [
  'Modern',
  'Luxury',
  'Japanese',
  'Industrial',
  'Minimal',
  'Scandinavian',
  'Classic',
];

/**
 * Example folder structure that should be created:
 * 
 * designs/
 *   Kitchen-Redesign/
 *     Modern/
 *       design_001.jpg
 *       design_002.jpg
 *     Luxury/
 *       design_001.jpg
 *   Living-Room-2025/
 *     Scandinavian/
 *       design_001.jpg
 *     Minimal/
 *       design_002.jpg
 * 
 * Usage:
 * const path = getDesignFolderPath('Kitchen-Redesign', 'Modern');
 * const imagePath = getDesignImagePath('Kitchen-Redesign', 'Modern', 'design_001.jpg');
 */

/**
 * Structure validator - ensures folder naming conventions
 */
export function validateDesignPath(path: string): { valid: boolean; error?: string } {
  const parts = path.split('/').filter(p => p);
  
  if (parts.length < 3) {
    return { valid: false, error: 'Path must include designs/designName/style/imageName' };
  }

  if (parts[0] !== 'designs') {
    return { valid: false, error: 'Root must be designs folder' };
  }

  if (parts[2] && !DESIGN_STYLES.includes(parts[2])) {
    return { valid: false, error: `Invalid style. Must be one of: ${DESIGN_STYLES.join(', ')}` };
  }

  return { valid: true };
}
