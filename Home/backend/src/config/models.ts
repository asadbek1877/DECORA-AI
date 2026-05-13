/**
 * ═════════════════════════════════════════════════════════════════
 *  Dynamic Model Configuration for AI Image Generation
 * ═════════════════════════════════════════════════════════════════
 * 
 * This configuration defines all available AI models with their:
 * - Display names (user-facing)
 * - API model names (for provider routing)
 * - Credit costs (deducted on successful generation)
 * - Feature tags (for UI display)
 */

export interface AIModelConfig {
  id: string;                    // Unique identifier (e.g., 'gemini-flash')
  displayName: string;           // User-facing name (e.g., 'Gemini 3.1 Flash')
  description: string;           // Short description for UI tooltip
  apiModelName: string;          // Actual model name for API (e.g., 'gemini-3.1-flash-image-preview')
  provider: string;              // Provider: 'gemini' | 'segmind' | 'fal' | 'replicate' | 'huggingface'
  creditCost: number;            // Credits deducted on success (1-10)
  speed: 'fast' | 'medium' | 'slow';
  quality: 'good' | 'excellent' | 'premium';
  icon?: string;                 // Optional emoji for UI
}

/**
 * Available AI Models (MINIMAL MODE)
 * - Only lightweight, fast models enabled
 * - Default model is Gemini Flash (fastest)
 * - Premium/Excellent quality models disabled to minimize resource usage
 */
export const AVAILABLE_MODELS: AIModelConfig[] = [
  {
    id: 'gemini-flash',
    displayName: 'Gemini 3.1 Flash',
    description: 'Fast, cost-effective. Perfect for quick generation.',
    apiModelName: 'gemini-3.1-flash-image-preview',
    provider: 'gemini',
    creditCost: 1,
    speed: 'fast',
    quality: 'good',
    icon: '⚡',
  },
  // Other models disabled for minimal resource usage
  // - gemini-pro (removed: uses 4x more resources)
  // - fal-flux (removed: expensive inference steps)
  // - segmind-sdxl (removed: complex rendering)
  // - replicate-sdxl (removed: high overhead)
];

/**
 * Get a model configuration by ID
 * @throws Error if model not found
 */
export function getModelById(modelId: string): AIModelConfig {
  const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
  if (!model) {
    throw new Error(
      `Model "${modelId}" not found. Available models: ${AVAILABLE_MODELS.map((m) => m.id).join(', ')}`
    );
  }
  return model;
}

/**
 * Get the default (first) model
 */
export function getDefaultModel(): AIModelConfig {
  return AVAILABLE_MODELS[0];
}

/**
 * Get a model by provider and apiModelName (for backward compatibility)
 * Useful for routing API calls based on provider
 */
export function getModelByProvider(provider: string, apiModelName: string): AIModelConfig | undefined {
  return AVAILABLE_MODELS.find((m) => m.provider === provider && m.apiModelName === apiModelName);
}

/**
 * Get all available models for a specific provider
 */
export function getModelsByProvider(provider: string): AIModelConfig[] {
  return AVAILABLE_MODELS.filter((m) => m.provider === provider);
}
