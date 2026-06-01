import { useCallback, useEffect } from 'react';
import { api } from '../api/client';
import { GalleryItem, GeneratedImage, useDesignStore } from '../store/designStore';
import type { PreviewImageDto } from '../../../shared/api/types';

const GALLERY_STORAGE_KEY = 'design-gallery';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function mapPreviewToImage(preview: PreviewImageDto, projectId: string, style: string, prompt: string, suffix = ''): GeneratedImage {
  return {
    id: `${projectId}${suffix}`,
    url: preview.imageUrl || preview.imagePath || '',
    style: preview.styleName || style,
    prompt,
    createdAt: new Date().toISOString(),
  };
}

export function useDesignWorkflow() {
  const uploadedFile = useDesignStore((state) => state.uploadedFile);
  const uploadedPreview = useDesignStore((state) => state.uploadedPreview);
  const selectedStyle = useDesignStore((state) => state.selectedStyle);
  const customPrompt = useDesignStore((state) => state.customPrompt);
  const projectId = useDesignStore((state) => state.projectId);
  const gallery = useDesignStore((state) => state.gallery);
  const setUploadedFile = useDesignStore((state) => state.setUploadedFile);
  const setUploadedPreview = useDesignStore((state) => state.setUploadedPreview);
  const setIsUploading = useDesignStore((state) => state.setIsUploading);
  const setIsGenerating = useDesignStore((state) => state.setIsGenerating);
  const setGeneratedImages = useDesignStore((state) => state.setGeneratedImages);
  const setProjectId = useDesignStore((state) => state.setProjectId);
  const setGallery = useDesignStore((state) => state.setGallery);
  const setError = useDesignStore((state) => state.setError);

  useEffect(() => {
    const storedGallery = JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY) || '[]');
    setGallery(storedGallery);
  }, [setGallery]);

  const setFileWithPreview = useCallback((file: File | null) => {
    if (!file) {
      setUploadedFile(null);
      setUploadedPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedFile(file);
      setUploadedPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [setUploadedFile, setUploadedPreview]);

  const persistGalleryItem = useCallback((item: GalleryItem) => {
    const nextGallery = [item, ...gallery].slice(0, 50);
    setGallery(nextGallery);
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(nextGallery));
  }, [gallery, setGallery]);

  const uploadAndGenerate = useCallback(async () => {
    if (!uploadedFile) {
      setError('Please upload an image first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const uploadRes = await api.uploadImage(uploadedFile);
      if (!uploadRes.data) {
        throw new Error('Upload failed. Please try again.');
      }
      const nextProjectId = uploadRes.data.projectId;
      if (!nextProjectId) {
        throw new Error('Project was not created. Please try again.');
      }
      setProjectId(nextProjectId);
      setIsUploading(false);
      setIsGenerating(true);

      const generateRes = await api.generatePreview(
        nextProjectId,
        [selectedStyle],
        customPrompt || undefined,
      );

      if (!generateRes.data) {
        throw new Error('Generation failed. Please try again.');
      }
      const previews = generateRes.data.previews || [];
      const images = previews
        .slice(0, 1)
        .map((preview, index) =>
          mapPreviewToImage(preview, `${nextProjectId}-${index}`, selectedStyle, customPrompt),
        );

      setGeneratedImages(images);
      persistGalleryItem({
        id: nextProjectId,
        originalUrl: uploadedPreview || '',
        generatedImages: images,
        style: selectedStyle,
        prompt: customPrompt,
        createdAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Generation failed. Please try again.'));
      throw error;
    } finally {
      setIsUploading(false);
      setIsGenerating(false);
    }
  }, [
    uploadedFile,
    uploadedPreview,
    selectedStyle,
    customPrompt,
    persistGalleryItem,
    setError,
    setGeneratedImages,
    setIsGenerating,
    setIsUploading,
    setProjectId,
  ]);

  const regenerate = useCallback(async () => {
    if (!projectId) {
      await uploadAndGenerate();
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generateRes = await api.generatePreview(
        projectId,
        [selectedStyle],
        customPrompt || undefined,
      );
      if (!generateRes.data) {
        throw new Error('Regeneration failed. Please try again.');
      }
      const previews = generateRes.data.previews || [];
      const images = previews
        .slice(0, 1)
        .map((preview, index) =>
          mapPreviewToImage(preview, `${projectId}-regen-${index}-${Date.now()}`, selectedStyle, customPrompt),
        );

      setGeneratedImages(images);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Regeneration failed. Please try again.'));
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [projectId, selectedStyle, customPrompt, uploadAndGenerate, setError, setGeneratedImages, setIsGenerating]);

  return { setFileWithPreview, uploadAndGenerate, regenerate };
}
