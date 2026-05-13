import { DesignStyle } from '../models';

export interface PromptOptions {
  style: DesignStyle;
  roomType?: string;
  additionalInstructions?: string;
  isPreview?: boolean;
}

export interface AdvancedPromptOptions {
  style: DesignStyle;
  intensity: number; // 0-100
  colorPalette?: {
    name: string;
    colors: string[];
  } | null;
  removals?: {
    furniture: boolean;
    decor: boolean;
    electronics: boolean;
    emptyRoom: boolean;
  };
  roomType?: string;
  additionalContext?: string;
}

export interface StrengthLevel {
  strength: number; // For img2img generation (0.1-1.0)
  intensityDescription: string;
  scope: string;
}

// Map intensity percentage to img2img strength parameter
export function getStrengthFromIntensity(intensity: number): StrengthLevel {
  if (intensity <= 20) {
    return {
      strength: 0.3,
      intensityDescription: 'subtle refinement',
      scope: 'minor adjustments only',
    };
  }
  if (intensity <= 60) {
    return {
      strength: 0.6,
      intensityDescription: 'moderate redesign',
      scope: 'furniture and color changes',
    };
  }
  return {
    strength: 0.85,
    intensityDescription: 'complete transformation',
    scope: 'full room redesign',
  };
}

// Build removal instructions
export function buildRemovalInstructions(removals: {
  furniture: boolean;
  decor: boolean;
  electronics: boolean;
  emptyRoom: boolean;
}): string {
  const removedItems = [];
  if (removals.furniture) removedItems.push('all furniture');
  if (removals.decor) removedItems.push('decorative items and accessories');
  if (removals.electronics) removedItems.push('electronics (TVs, lights, appliances)');
  if (removals.emptyRoom) return 'Empty room with only walls, floor, windows, and doors';

  if (removedItems.length === 0) return '';
  return `Remove: ${removedItems.join(', ')}.`;
}

// Build color description from palette
export function buildColorDescription(
  colorPalette?: { name: string; colors: string[] } | null,
  customColors?: string[]
): string {
  if (customColors && customColors.length > 0) {
    return `COLOR PALETTE: Custom colors (${customColors.join(', ')})`;
  }
  if (colorPalette) {
    return `COLOR PALETTE (${colorPalette.name}): ${colorPalette.colors.join(', ')}`;
  }
  return '';
}

// Build advanced prompt with intensity and all parameters
export function buildAdvancedPrompt(options: AdvancedPromptOptions): string {
  const {
    style,
    intensity,
    colorPalette,
    removals = { furniture: false, decor: false, electronics: false, emptyRoom: false },
    roomType = 'room',
    additionalContext = '',
  } = options;

  const strengthInfo = getStrengthFromIntensity(intensity);
  const removalInstructions = buildRemovalInstructions(removals);
  const colorDescription = buildColorDescription(colorPalette);

  const prompt = [
    // Main objective
    `Redesign this ${roomType} in ${style.displayName} style with ${strengthInfo.intensityDescription}.`,
    `Design intensity: ${intensity}% - ${strengthInfo.scope}.`,
    '',

    // Colors
    colorDescription,
    '',

    // Furniture and materials
    `FURNITURE STYLE: ${style.furnitureType}`,
    `LIGHTING: ${style.lightingMood}`,
    `MATERIALS: ${style.materials.join(', ')}`,
    '',

    // Removals
    removalInstructions && `REMOVALS: ${removalInstructions}`,
    '',

    // Requirements
    'REQUIREMENTS:',
    '- Preserve the original room layout, walls, windows, ceiling height, and architectural features.',
    `- Apply the ${style.displayName} style consistently throughout.`,
    '- Natural, consistent lighting with proper shadows.',
    '- Include appropriate decor items fitting the ${intensity}% intensity level.',
    '- No text, watermarks, or logos.',
    '',

    // Strength info for img2img
    `IMG2IMG STRENGTH: ${strengthInfo.strength} (0-1 scale, higher = more changes)`,
    '',

    // Additional context
    additionalContext && `ADDITIONAL NOTES: ${additionalContext}`,
  ]
    .filter(Boolean)
    .join('\n');

  return prompt;
}

export function buildPreviewPrompt(style: DesignStyle, roomType?: string): string {
  const room = roomType || 'room';

  return [
    `Redesign this ${room} in ${style.displayName} style.`,
    `Use a color palette of: ${style.colorPalette.join(', ')}.`,
    `Furniture style: ${style.furnitureType}.`,
    `Lighting: ${style.lightingMood}.`,
    `Materials: ${style.materials.join(', ')}.`,
    `Keep the original room geometry, dimensions, windows, and doors intact.`,
    `Quick interior design for fast preview.`,
  ].join('\n');
}

export function buildFinalPrompt(style: DesignStyle, roomType?: string, additionalInstructions?: string): string {
  const room = roomType || 'room';

  const base = [
    `Redesign this ${room} in ${style.displayName} style.`,
    ``,
    `COLOR PALETTE: ${style.colorPalette.join(', ')}`,
    `FURNITURE: ${style.furnitureType}`,
    `LIGHTING: ${style.lightingMood}`,
    `MATERIALS: ${style.materials.join(', ')}`,
    ``,
    `REQUIREMENTS:`,
    `- Preserve the original room layout, walls, windows, ceiling height, and architectural features exactly.`,
    `- Apply the ${style.displayName} style consistently to all furniture, decor, lighting, and materials.`,
    `- Natural, consistent lighting with proper shadows.`,
    `- Include appropriate decor items fitting the style.`,
    `- No text, watermarks, or logos.`,
  ];

  if (additionalInstructions) {
    base.push(``, `ADDITIONAL INSTRUCTIONS: ${additionalInstructions}`);
  }

  return base.join('\n');
}

export function buildMultiStylePreviewPrompt(styles: DesignStyle[], roomType?: string): string[] {
  return styles.map((style) => buildPreviewPrompt(style, roomType));
}
