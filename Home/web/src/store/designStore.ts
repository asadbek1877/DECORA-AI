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
  uploadedFile: File | null;
  uploadedPreview: string | null;
  selectedStyle: string;
  customPrompt: string;
  isUploading: boolean;
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  projectId: string | null;
  gallery: GalleryItem[];
  error: string | null;

  setUploadedFile: (file: File | null) => void;
  setUploadedPreview: (preview: string | null) => void;
  setSelectedStyle: (style: string) => void;
  setCustomPrompt: (prompt: string) => void;
  setIsUploading: (isUploading: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGeneratedImages: (images: GeneratedImage[]) => void;
  setProjectId: (projectId: string | null) => void;
  setGallery: (gallery: GalleryItem[]) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  uploadedFile: null,
  uploadedPreview: null,
  selectedStyle: 'modern',
  customPrompt: '',
  isUploading: false,
  isGenerating: false,
  generatedImages: [],
  projectId: null,
  gallery: [],
  error: null,

  setUploadedFile: (file) => set({ uploadedFile: file }),
  setUploadedPreview: (preview) => set({ uploadedPreview: preview }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGeneratedImages: (images) => set({ generatedImages: images }),
  setProjectId: (projectId) => set({ projectId }),
  setGallery: (gallery) => set({ gallery }),
  setError: (error) => set({ error }),
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
