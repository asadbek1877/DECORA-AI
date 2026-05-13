import logger from '../../utils/logger';
import { AIProvider, DesignMode, DesignStyleInput, GenerationResult } from './ai.provider.interface';

// ─── Demo Images per Style ────────────────────────────────────────────────────
const MOCK_IMAGES: Record<string, string[]> = {
    minimalism: ['https://picsum.photos/seed/minimalism1/1024/768', 'https://picsum.photos/seed/minimalism2/1024/768'],
    modern: ['https://picsum.photos/seed/modern1/1024/768', 'https://picsum.photos/seed/modern2/1024/768'],
    scandinavian: ['https://picsum.photos/seed/scandinavian1/1024/768', 'https://picsum.photos/seed/scandinavian2/1024/768'],
    luxury: ['https://picsum.photos/seed/luxury1/1024/768', 'https://picsum.photos/seed/luxury2/1024/768'],
    industrial: ['https://picsum.photos/seed/industrial1/1024/768', 'https://picsum.photos/seed/industrial2/1024/768'],
    'art-deco': ['https://picsum.photos/seed/artdeco1/1024/768', 'https://picsum.photos/seed/artdeco2/1024/768'],
    cyberpunk: ['https://picsum.photos/seed/cyberpunk1/1024/768', 'https://picsum.photos/seed/cyberpunk2/1024/768'],
    japandi: ['https://picsum.photos/seed/japandi1/1024/768', 'https://picsum.photos/seed/japandi2/1024/768'],
    bohemian: ['https://picsum.photos/seed/bohemian1/1024/768', 'https://picsum.photos/seed/bohemian2/1024/768'],
    classic: ['https://picsum.photos/seed/classic1/1024/768', 'https://picsum.photos/seed/classic2/1024/768'],
    _default: ['https://picsum.photos/seed/interior1/1024/768', 'https://picsum.photos/seed/interior2/1024/768'],
};

function getMockImageUrl(styleName: string, index = 0): string {
    const images = MOCK_IMAGES[styleName] || MOCK_IMAGES._default;
    return images[index % images.length];
}

// ─── Mock Provider ────────────────────────────────────────────────────────────
export class MockProvider implements AIProvider {
    async generateDesign(
        mode: DesignMode,
        _imageUrl: string,
        style: DesignStyleInput,
        _roomType?: string,
        _additionalInstructions?: string,
        customPrompt?: string,
    ): Promise<GenerationResult> {
        const mockIndex = mode === 'final' ? 1 : 0;
        const delay = mode === 'preview' ? 1000 + Math.random() * 1500 : 1500 + Math.random() * 1500;

        logger.info(`[MockProvider] Simulating ${mode} generation for style "${style.name}" (${Math.round(delay)}ms delay)`);
        await new Promise((r) => setTimeout(r, delay));

        const mockUrl = getMockImageUrl(style.name, mockIndex);
        const prompt = customPrompt
            ? `${customPrompt} Style: ${style.displayName}.`
            : `Professional interior design in ${style.displayName} style.`;

        return {
            imageUrl: mockUrl,
            publicId: `mock-${mode}-${style.name}-${Date.now()}`,
            styleName: style.name,
            prompt: `[MOCK ${mode.toUpperCase()}] ${prompt}`,
            modelUsed: 'mock-mode',
        };
    }
}
