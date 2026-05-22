import { create } from 'zustand';
import {
  DesignStyle,
  PreviewImage,
  Project,
  AIModel,
  ColorPalette,
  RemovalOptions,
  StyleParameters,
  ColorAnalysis,
} from '../types';
import { api, SERVER_URL } from '../api/client';
import { useAuthStore } from './authStore';
import * as SecureStore from 'expo-secure-store';

/** Convert relative /uploads/... paths to full http://... URLs. Skip data URIs. */
function fullUrl(urlOrPath: string | undefined | null): string | undefined {
  if (!urlOrPath) return undefined;
  // Data URIs are already valid URLs — don't prefix them with SERVER_URL
  if (urlOrPath.startsWith('data:')) return urlOrPath;
  // Absolute URLs are already valid
  if (urlOrPath.startsWith('http')) return urlOrPath;
  // Relative paths need SERVER_URL prefix
  return `${SERVER_URL}${urlOrPath}`;
}

/** Cost constants (fixed to 1 credit per action to match backend) */
export const CREDITS_PER_PREVIEW = 1;
export const CREDITS_PER_FINAL = 1;

interface DesignState {
  // Current project
  currentProjectId: string | null;
  originalImageUri: string | null;
  originalImageUrl: string | null;
  selectedStyle: string | null;
  previews: PreviewImage[];
  finalImageUrl: string | null;
  status: 'idle' | 'uploading' | 'previewing' | 'generating' | 'completed' | 'error';

  // Per-card regeneration
  regeneratingStyle: string | null;

  // Styles & Models
  styles: DesignStyle[];
  stylesLoaded: boolean;
  models: AIModel[];
  selectedModel: string | null;

  // ───────── NEW: Advanced Design Control Parameters ────────
  styleIntensity: number; // 0-100%
  selectedColorPalette: ColorPalette | null;
  customColors: string[]; // User-selected hex colors
  removalOptions: RemovalOptions;
  promptMode: 'AUTO' | 'MANUAL'; // AutoGeneration or Manual Input
  customPrompt: string;
  currentGeneratedPrompt: string; // Display the last generated prompt
  colorAnalysis: ColorAnalysis | null; // Colors extracted from result
  availableColorPalettes: ColorPalette[]; // Pre-built palettes
  paletteLoaded: boolean;
  // ────────────────────────────────────────────────────────────

  // History
  history: Project[];
  historyLoaded: boolean;

  // Credits
  credits: number | null;
  freeCredits: number | null;
  paidCredits: number | null;
  possibleGenerations: number | null;
  nextRefillAt: string | null;

  // Error
  error: string | null;
  /** Whether the last generation used mock AI */
  isMock: boolean;

  // Actions
  setOriginalImage: (uri: string) => void;
  uploadImage: (imageUri: string) => Promise<{ projectId: string | null; success: boolean; isGuest: boolean; originalImageUrl: string | null } | null>;
  generatePreviews: (projectId: string | undefined, styles?: string[], roomType?: string, guestImageUrl?: string, customPrompt?: string) => Promise<void>;
  generateFinal: (projectId: string, styleName: string, roomType?: string, guestImageUrl?: string, customPrompt?: string, aiProvider?: string) => Promise<void>;
  regenerateSinglePreview: (styleName: string, projectId?: string, guestImageUrl?: string) => Promise<void>;
  selectStyle: (styleName: string) => void;
  selectModel: (modelId: string) => void;
  loadStyles: () => Promise<void>;
  loadModels: () => Promise<void>;
  loadHistory: () => Promise<void>;
  loadCredits: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  reset: () => void;
  clearError: () => void;
  cancelGeneration: () => void;

  // ───────── NEW: Advanced Design Control Actions ────────
  setStyleIntensity: (intensity: number) => void;
  setSelectedColorPalette: (palette: ColorPalette | null) => void;
  setCustomColors: (colors: string[]) => void;
  setRemovalOptions: (options: RemovalOptions) => void;
  setPromptMode: (mode: 'AUTO' | 'MANUAL') => void;
  setCustomPrompt: (prompt: string) => void;
  generatePromptWithAI: (style: DesignStyle, roomType?: string) => Promise<string>;
  loadColorPalettes: () => Promise<void>;
  setColorAnalysis: (analysis: ColorAnalysis | null) => void;
  // ────────────────────────────────────────────────────────────

  // ──── NEW: Like Management & Persistent Storage ──────────
  toggleProjectLike: (projectId: string) => Promise<boolean | undefined>;
  refreshHistory: () => Promise<void>;
  saveGenerationToHistory: (projectId: string) => Promise<void>;
  // ──────────────────────────────────────────────────────────
}

export const useDesignStore = create<DesignState>((set, get) => {
  // Private: AbortController for cancelling ongoing generation
  let generationAbortController: AbortController | null = null;

  return {
  currentProjectId: null,
  originalImageUri: null,
  originalImageUrl: null,
  selectedStyle: null,
  previews: [],
  finalImageUrl: null,
  status: 'idle',
  regeneratingStyle: null,
  styles: [],
  stylesLoaded: false,
  models: [],
  selectedModel: null,

  // ───────── NEW: Initialize Advanced Design Control ────────
  styleIntensity: 50,
  selectedColorPalette: null,
  customColors: [],
  removalOptions: {
    furniture: false,
    decor: false,
    electronics: false,
    emptyRoom: false,
  },
  promptMode: 'AUTO',
  customPrompt: '',
  currentGeneratedPrompt: '',
  colorAnalysis: null,
  availableColorPalettes: [],
  paletteLoaded: false,
  // ────────────────────────────────────────────────

  history: [],
  historyLoaded: false,
  credits: null,
  freeCredits: null,
  paidCredits: null,
  possibleGenerations: null,
  nextRefillAt: null,
  error: null,
  isMock: false,

  setOriginalImage: (uri: string) => {
    set({ originalImageUri: uri, status: 'idle', error: null });
  },

  uploadImage: async (imageUri: string) => {
    set({ status: 'uploading', error: null });
    try {
      console.log('[DesignStore] uploadImage starting:', imageUri.substring(0, 50));
      const response = await api.uploadImage(imageUri);
      console.log('[DesignStore] uploadImage API response:', {
        success: response.success,
        projectId: response.data?.projectId,
        originalImageUrl: response.data?.originalImageUrl ? `${response.data.originalImageUrl.substring(0, 50)}...` : 'undefined',
      });
      
      if (response.success && response.data) {
        const imageUrl = fullUrl(response.data.originalImageUrl) || null;
        console.log('[DesignStore] uploadImage after fullUrl():', {
          originalImageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : 'null',
        });
        
        set({
          currentProjectId: response.data.projectId || null,
          originalImageUrl: imageUrl,
          status: 'idle',
        });
        
        // Return a truthy value even for guest mode (projectId will be null but upload succeeded)
        return {
          projectId: response.data.projectId || null,
          success: true,
          isGuest: !response.data.projectId,
          originalImageUrl: imageUrl,
        };
      }
      console.error('[DesignStore] uploadImage failed - no success or data:', {
        success: response.success,
        hasData: !!response.data,
        error: response.error,
      });
      set({ error: response.error || 'Upload failed', status: 'error' });
      return null;
    } catch (error: any) {
      console.error('[DesignStore] uploadImage error:', {
        message: error.message,
        stack: error.stack,
      });
      set({ error: error.message, status: 'error' });
      return null;
    }
  },

  generatePreviews: async (projectId: string | undefined, styles?: string[], roomType?: string, guestImageUrl?: string, customPrompt?: string) => {
    set({ status: 'previewing', error: null, previews: [] });
    try {
      const response = await api.generatePreview(
        projectId,
        styles,
        roomType,
        guestImageUrl,
        get().selectedModel || undefined,
        get().styleIntensity,
        customPrompt,
      );
      if (response.success && response.data) {
        set({
          previews: response.data.previews.map((p: PreviewImage) => ({
            ...p,
            imageUrl: fullUrl(p.imageUrl) || p.imageUrl,
          })),
          isMock: !!(response.data as any).isMock,
        });

        if (projectId) {
          // Persist the generated design to history immediately after success.
          try {
            await get().saveGenerationToHistory(projectId);
          } catch (saveError: any) {
            console.warn('[DesignStore] Failed to save preview to history:', saveError.message);
          }
        }

        set({ status: 'idle' });

        // Refresh credits after generating
        get().loadCredits();
      } else {
        // API returned error response
        const errorMsg = response.error || 'Generation failed';
        set({ error: errorMsg, status: 'error' });
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to generate design';
      set({ error: errorMsg, status: 'error' });
      // Re-throw so the component can handle it
      throw error;
    }
  },

  regenerateSinglePreview: async (styleName: string, projectId?: string, guestImageUrl?: string) => {
    set({ regeneratingStyle: styleName, error: null });
    try {
      const response = await api.generatePreview(
        projectId,
        [styleName],
        undefined,
        guestImageUrl,
        get().selectedModel || undefined,
        get().styleIntensity,
      );
      if (response.success && response.data && response.data.previews.length > 0) {
        const newPreview = response.data.previews[0];
        const updatedPreview: PreviewImage = {
          ...newPreview,
          imageUrl: fullUrl(newPreview.imageUrl) || newPreview.imageUrl,
        };
        // Replace the matching preview in the list
        const currentPreviews = get().previews;
        const updatedPreviews = currentPreviews.map((p) =>
          p.styleName === styleName ? updatedPreview : p
        );
        set({ previews: updatedPreviews });
        // Refresh credits
        get().loadCredits();
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ regeneratingStyle: null });
    }
  },

  selectStyle: (styleName: string) => {
    set({ selectedStyle: styleName });
  },

  selectModel: (modelId: string) => {
    set({ selectedModel: modelId });
  },

  loadStyles: async () => {
    try {
      const response = await api.getStyles();
      if (response.success && response.data) {
        set({ styles: response.data, stylesLoaded: true, error: null });
      } else {
        set({ styles: [], stylesLoaded: true, error: 'Failed to load styles' });
      }
    } catch (error: any) {
      set({ 
        styles: [],
        stylesLoaded: true,
        error: error.message || 'Failed to load styles'
      });
    }
  },

  loadModels: async () => {
    try {
      const response = await api.getModels();
      if (response.success && response.data) {
        set({
          models: response.data,
          // Auto-select first model if none is selected
          selectedModel: get().selectedModel || response.data[0]?.id || null,
          error: null,
        });
      } else {
        set({ 
          models: [],
          selectedModel: null,
          error: 'Failed to load models'
        });
      }
    } catch (error: any) {
      set({ 
        models: [],
        selectedModel: null,
        error: error.message || 'Failed to load models'
      });
    }
  },

  loadHistory: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ history: [], historyLoaded: true });
      return;
    }
    try {
      const response = await api.getHistory();
      if (response.success && response.data) {
        set({
          history: response.data.map((p: Project) => ({
            ...p,
            originalImageUrl: fullUrl(p.originalImageUrl) || p.originalImageUrl,
            finalImageUrl: fullUrl(p.finalImageUrl) || p.finalImageUrl,
          })),
          historyLoaded: true,
          error: null,
        });
      } else {
        // Even if data is empty or response.success is false, mark as loaded
        set({
          history: [],
          historyLoaded: true,
          error: response.success ? null : 'Failed to load history',
        });
      }
    } catch (error: any) {
      set({ 
        history: [],
        historyLoaded: true,
        error: error.message || 'Failed to load history' 
      });
    }
  },

  loadCredits: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ credits: null, freeCredits: null, paidCredits: null, possibleGenerations: null, nextRefillAt: null });
      return;
    }
    try {
      const response = await api.getCredits();
      if (response.success && response.data) {
        set({ 
          credits: response.data.credits,
          freeCredits: response.data.freeCredits ?? null,
          paidCredits: response.data.paidCredits ?? null,
          possibleGenerations: response.data.possibleGenerations ?? response.data.credits,
          nextRefillAt: response.data.nextRefillAt || null
        });
      }
    } catch {
      // Silently fail — credits display is non-critical
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      await api.deleteProject(projectId);
      const currentHistory = get().history;
      set({ history: currentHistory.filter((p: Project) => p.id !== projectId) });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  reset: () => {
    set({
      currentProjectId: null,
      originalImageUri: null,
      originalImageUrl: null,
      selectedStyle: null,
      previews: [],
      finalImageUrl: null,
      status: 'idle',
      regeneratingStyle: null,
      error: null,
      isMock: false,
      credits: null,
      freeCredits: null,
      paidCredits: null,
      possibleGenerations: null,
      // ───────── Reset Advanced Design Parameters ────────
      styleIntensity: 50,
      selectedColorPalette: null,
      customColors: [],
      removalOptions: {
        furniture: false,
        decor: false,
        electronics: false,
        emptyRoom: false,
      },
      promptMode: 'AUTO',
      customPrompt: '',
      currentGeneratedPrompt: '',
      colorAnalysis: null,
      // ──────────────────────────────────────────────────
    });
  },

  clearError: () => {
    set({ error: null });
  },

  // Cancel ongoing generation
  cancelGeneration: () => {
    generationAbortController?.abort();
    generationAbortController = null;
    set({ status: 'idle', error: 'Generation cancelled by user' });
  },

  // Update API calls to use AbortController
  generateFinal: async (projectId: string, styleName: string, roomType?: string, guestImageUrl?: string, customPrompt?: string, aiProvider?: string) => {
    console.log('[DesignStore] generateFinal called with:', {
      projectId,
      styleName,
      roomType,
      guestImageUrl: guestImageUrl ? `${guestImageUrl.substring(0, 50)}...` : 'undefined',
      customPrompt,
      aiProvider,
      selectedModel: get().selectedModel,
      styleIntensity: get().styleIntensity,
    });
    
    set({ status: 'generating', error: null, selectedStyle: styleName });
    generationAbortController = new AbortController();

    try {
      const response = await api.generateFinal(
        projectId,
        styleName,
        roomType,
        guestImageUrl,
        get().selectedModel || undefined,
        customPrompt,
        aiProvider,
        get().styleIntensity,
        generationAbortController.signal,
      );

      generationAbortController = null;

      console.log('[DesignStore] generateFinal API response:', {
        success: response.success,
        finalImageUrl: response.data?.finalImageUrl ? `${response.data.finalImageUrl.substring(0, 50)}...` : 'undefined',
        originalImageUrl: response.data?.originalImageUrl ? `${response.data.originalImageUrl.substring(0, 50)}...` : 'undefined',
        status: response.data?.status,
      });

      if (response.success && response.data) {
        const designId = response.data.design?.id || response.data.projectId || projectId || null;
        set({
          currentProjectId: designId,
          finalImageUrl: fullUrl(response.data.finalImageUrl) || null,
          originalImageUrl: fullUrl(response.data.originalImageUrl) || null,
          isMock: !!(response.data as any).isMock,
          status: 'completed',
          error: null,
        });
        get().loadCredits();

        // ──── NEW: Save to history after successful generation ────
        try {
          if (designId) {
            await get().saveGenerationToHistory(designId);
          }
        } catch (saveError: any) {
          console.warn('[DesignStore] Failed to save to history:', saveError.message);
          // Don't fail the generation, just warn
        }
        // ──────────────────────────────────────────────────────────

        return;
      }

      set({
        error: 'Generation failed for selected provider',
        status: 'error',
        finalImageUrl: null,
      });
    } catch (error: any) {
      generationAbortController = null;
      
      const errorMsg = error?.message || 'Generation failed for selected provider';
      set({
        error: errorMsg,
        status: 'error',
        finalImageUrl: null,
      });
    }
  },

  // ───────── NEW: Advanced Design Control Actions ────────
  setStyleIntensity: (intensity: number) => {
    set({ styleIntensity: Math.max(0, Math.min(100, intensity)) });
  },

  setSelectedColorPalette: (palette: ColorPalette | null) => {
    set({ selectedColorPalette: palette });
  },

  setCustomColors: (colors: string[]) => {
    set({ customColors: colors });
  },

  setRemovalOptions: (options: RemovalOptions) => {
    set({ removalOptions: options });
  },

  setPromptMode: (mode: 'AUTO' | 'MANUAL') => {
    set({ promptMode: mode });
  },

  setCustomPrompt: (prompt: string) => {
    set({ customPrompt: prompt, promptMode: 'MANUAL' });
  },

  setColorAnalysis: (analysis: ColorAnalysis | null) => {
    set({ colorAnalysis: analysis });
  },

  loadColorPalettes: async () => {
    try {
      // For now, use hardcoded palettes. In production, fetch from API
      const palettes: ColorPalette[] = [
        {
          id: 'warm-earth',
          name: 'Warm Earth',
          category: 'warm',
          colors: ['#8B4513', '#D2B48C', '#CD853F', '#DEB887'],
          likes: 352,
        },
        {
          id: 'cool-ocean',
          name: 'Cool Ocean',
          category: 'cool',
          colors: ['#003366', '#0066CC', '#00CCFF', '#66FFFF'],
          likes: 428,
        },
        {
          id: 'vibrant-sunset',
          name: 'Vibrant Sunset',
          category: 'vibrant',
          colors: ['#FF6B35', '#FF8C42', '#FFA500', '#FFE06B'],
          likes: 512,
        },
        {
          id: 'neutral-minimalist',
          name: 'Neutral Minimalist',
          category: 'neutral',
          colors: ['#FFFFFF', '#F5F5F5', '#A9A9A9', '#696969'],
          likes: 289,
        },
        {
          id: 'pastel-soft',
          name: 'Pastel Soft',
          category: 'pastel',
          colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9'],
          likes: 401,
        },
        {
          id: 'luxury-gold',
          name: 'Luxury Gold',
          category: 'warm',
          colors: ['#2F1B06', '#8B7355', '#DAA520', '#FFD700'],
          likes: 578,
        },
      ];

      set({
        availableColorPalettes: palettes,
        paletteLoaded: true,
        error: null,
      });
    } catch (error: any) {
      set({
        availableColorPalettes: [],
        paletteLoaded: true,
        error: error.message || 'Failed to load color palettes',
      });
    }
  },

  generatePromptWithAI: async (style: DesignStyle, roomType?: string) => {
    try {
      // Call Groq API through backend endpoint
      const response = await api.generateAdvancedPrompt({
        style: style.name,
        styleName: style.displayName,
        intensity: get().styleIntensity,
        colorPalette: get().selectedColorPalette,
        removals: get().removalOptions,
        roomType: roomType || 'living room',
      });

      if (response.success && response.data) {
        const { fullPrompt } = response.data;
        set({
          currentGeneratedPrompt: fullPrompt,
          customPrompt: fullPrompt,
          promptMode: 'AUTO',
          error: null,
        });
        return fullPrompt;
      } else {
        throw new Error('Failed to generate prompt');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to generate prompt with AI';
      set({ error: errorMsg });
      console.error('[DesignStore] generatePromptWithAI error:', error);
      return '';
    }
  },

  // ────── NEW: Like Management ──────────────────────────────
  toggleProjectLike: async (projectId: string) => {
    try {
      const response = await api.toggleLike(projectId);
      const likeData = response.data;
      if (response.success && likeData) {
        // Update history with new like status
        const updatedHistory = get().history.map((p: Project) =>
          p.id === projectId
            ? {
                ...p,
                isLiked: likeData.isLiked,
                likeCount: likeData.likeCount,
              }
            : p
        );
        set({ history: updatedHistory, error: null });
        return likeData.isLiked;
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error('[DesignStore] toggleProjectLike error:', error);
    }
  },

  // ──── NEW: Refresh History with Persistent Storage ───────
  refreshHistory: async () => {
    const currentHistory = get().history;
    if (currentHistory.length > 0) {
      // Mark as refreshing without clearing existing data
      set({ historyLoaded: false, error: null });
    }

    try {
      const response = await api.getHistory();
      if (response.success && response.data) {
        const processedHistory = response.data.map((p: any) => ({
          ...p,
          originalImageUrl: fullUrl(p.originalImageUrl) || p.originalImageUrl,
          finalImageUrl: fullUrl(p.finalImageUrl) || p.finalImageUrl,
          previewImages: (p.previewImages || []).map((img: any) => ({
            ...img,
            imageUrl: fullUrl(img.imageUrl) || img.imageUrl,
          })),
          finalImage: p.finalImage
            ? {
                ...p.finalImage,
                imageUrl: fullUrl(p.finalImage.imageUrl) || p.finalImage.imageUrl,
              }
            : null,
        }));

        set({
          history: processedHistory,
          historyLoaded: true,
          error: null,
        });

        // Optional: Save to AsyncStorage for offline access
        try {
          await SecureStore.setItemAsync(
            'designHistory',
            JSON.stringify({
              data: processedHistory,
              timestamp: new Date().toISOString(),
            })
          );
        } catch (storageError: any) {
          console.warn('[DesignStore] Failed to cache history:', storageError.message);
        }
      } else {
        set({ history: [], historyLoaded: true });
      }
    } catch (error: any) {
      // Load from cache if available
      try {
        const cached = await SecureStore.getItemAsync('designHistory');
        if (cached) {
          const parsed = JSON.parse(cached);
          set({
            history: parsed.data || [],
            historyLoaded: true,
            error: `Offline mode: ${error.message}`,
          });
          return;
        }
      } catch (cacheError) {
        // Ignore cache errors
      }

      set({
        history: [],
        historyLoaded: true,
        error: error.message || 'Failed to load history',
      });
    }
  },

  // ──── NEW: Auto-save After Generation ──────────────────
  saveGenerationToHistory: async (projectId: string) => {
    try {
      const response = await api.getProject(projectId);
      if (response.success && response.data) {
        const newProject: Project = {
          ...response.data,
          originalImageUrl:
            fullUrl(response.data.originalImageUrl) ||
            response.data.originalImageUrl,
          finalImageUrl:
            fullUrl(response.data.finalImageUrl) ||
            response.data.finalImageUrl,
        };

        // Add to the beginning of history
        const currentHistory = get().history;
        const updatedHistory = [
          newProject,
          ...currentHistory.filter((p) => p.id !== projectId),
        ];

        set({ history: updatedHistory });

        // Save to cache
        try {
          await SecureStore.setItemAsync(
            'designHistory',
            JSON.stringify({
              data: updatedHistory,
              timestamp: new Date().toISOString(),
            })
          );
        } catch (storageError: any) {
          console.warn('[DesignStore] Failed to cache history:', storageError.message);
        }
      }
    } catch (error: any) {
      console.warn('[DesignStore] saveGenerationToHistory error:', error.message);
      // Non-critical error, don't stop generation
    }
  },
  // ────────────────────────────────────────────────────────
  };
});
