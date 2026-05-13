// ─── Shared AI Provider Types ─────────────────────────────────────────────────

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

export type DesignMode = 'preview' | 'final';

export interface AIProvider {
  generateDesign(
    mode: DesignMode,
    imageUrl: string,
    style: DesignStyleInput,
    roomType?: string,
    additionalInstructions?: string,
    customPrompt?: string,
  ): Promise<GenerationResult>;
}
