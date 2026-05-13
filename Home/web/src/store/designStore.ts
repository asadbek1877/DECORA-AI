import { create } from 'zustand';

export interface GeneratedImage {
  id: string;
  url: string;
  style: string;
  prompt?: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  originalUrl: string;
  generatedImages: GeneratedImage[];
  style: string;
  prompt?: string;
  createdAt: string;
}

interface DesignState {
  // Upload
  uploadedFile: File | null;
  uploadedPreview: string | null;

  // Style & prompt
  selectedStyle: string;
  customPrompt: string;

  // Generation
  isUploading: boolean;
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  projectId: string | null;

  // Gallery
  gallery: GalleryItem[];

  // Error
  error: string | null;

  // Actions
  setUploadedFile: (file: File | null) => void;
  setSelectedStyle: (style: string) => void;
  setCustomPrompt: (prompt: string) => void;
  uploadAndGenerate: () => Promise<void>;
  regenerate: () => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  reset: () => void;
}

const API_BASE = '/api';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.error || error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const useDesignStore = create<DesignState>((set, get) => ({
  uploadedFile: null,
  uploadedPreview: null,
  selectedStyle: 'modern',
  customPrompt: '',
  isUploading: false,
  isGenerating: false,
  generatedImages: [],
  projectId: null,
  gallery: JSON.parse(localStorage.getItem('design-gallery') || '[]'),
  error: null,

  setUploadedFile: (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        set({ uploadedFile: file, uploadedPreview: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      set({ uploadedFile: null, uploadedPreview: null });
    }
  },

  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),

  uploadAndGenerate: async () => {
    const { uploadedFile, selectedStyle, customPrompt } = get();
    if (!uploadedFile) {
      set({ error: 'Please upload an image first' });
      return;
    }

    set({ isUploading: true, error: null, generatedImages: [] });

    try {
      // Step 1: Upload
      const formData = new FormData();
      formData.append('image', uploadedFile);

      const uploadRes = await apiRequest<{ success: boolean; data: any }>('/design/upload', {
        method: 'POST',
        body: formData,
      });

      const projectId = uploadRes.data.projectId;
      set({ projectId, isUploading: false, isGenerating: true });

      // Step 2: Generate previews
      const generateRes = await apiRequest<{ success: boolean; data: any }>('/design/generate-preview', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          styles: [selectedStyle],
          customPrompt: customPrompt || undefined,
        }),
      });

      const previews = generateRes.data.previews || [];
      const images: GeneratedImage[] = previews.slice(0, 1).map((p: any, i: number) => ({  // Only take first image
        id: `${projectId}-${i}`,
        url: p.imageUrl || p.imagePath || '',
        style: p.styleName || selectedStyle,
        prompt: customPrompt,
        createdAt: new Date().toISOString(),
      }));

      // Single image mode - no duplication for grid filling

      set({ generatedImages: images, isGenerating: false });

      // Save to gallery
      const { gallery, uploadedPreview } = get();
      const galleryItem: GalleryItem = {
        id: projectId,
        originalUrl: uploadedPreview || '',
        generatedImages: images,  // Use single image instead of 4
        style: selectedStyle,
        prompt: customPrompt,
        createdAt: new Date().toISOString(),
      };
      const newGallery = [galleryItem, ...gallery].slice(0, 50);
      set({ gallery: newGallery });
      localStorage.setItem('design-gallery', JSON.stringify(newGallery));
    } catch (err: any) {
      console.error('Generation failed:', err);
      set({
        error: err.message || 'Generation failed. Please try again.',
        isUploading: false,
        isGenerating: false,
      });
    }
  },

  regenerate: async () => {
    const { projectId, selectedStyle, customPrompt } = get();
    if (!projectId) {
      // If no project, re-upload
      await get().uploadAndGenerate();
      return;
    }

    set({ isGenerating: true, error: null });

    try {
      const generateRes = await apiRequest<{ success: boolean; data: any }>('/design/generate-preview', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          styles: [selectedStyle],
          customPrompt: customPrompt || undefined,
        }),
      });

      const previews = generateRes.data.previews || [];
      const images: GeneratedImage[] = previews.slice(0, 1).map((p: any, i: number) => ({  // Only take first image
        id: `${projectId}-regen-${i}-${Date.now()}`,
        url: p.imageUrl || p.imagePath || '',
        style: p.styleName || selectedStyle,
        prompt: customPrompt,
        createdAt: new Date().toISOString(),
      }));

      // Single image mode - no duplication for grid filling

      set({ generatedImages: images, isGenerating: false });
    } catch (err: any) {
      set({
        error: err.message || 'Regeneration failed. Please try again.',
        isGenerating: false,
      });
    }
  },

  clearResults: () => set({ generatedImages: [], projectId: null }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      uploadedFile: null,
      uploadedPreview: null,
      selectedStyle: 'modern',
      customPrompt: '',
      isUploading: false,
      isGenerating: false,
      generatedImages: [],
      projectId: null,
      error: null,
    }),
}));
