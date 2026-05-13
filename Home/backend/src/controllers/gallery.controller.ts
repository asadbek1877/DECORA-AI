import { Request, Response, NextFunction } from 'express';
import * as galleryService from '../services/gallery.service';
import { BadRequestError } from '../utils/errors';
import logger from '../utils/logger';

// Helper to get string from Express params
const getParamAsString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  throw new BadRequestError('Invalid id parameter');
};

/**
 * GALLERY CONTROLLER (Refactored)
 * До/После галерея API с новой архитектурой:
 * - GalleryItem (metadata)
 * - GalleryImage (before/after images organized by style)
 */

// ═══════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════

/**
 * GET /api/gallery
 * Return all gallery items with their before images
 */
export const listGalleryItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const items = await galleryService.getGalleryItems();
    res.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error: any) {
    logger.error(`Gallery listing failed: ${error.message}`);
    // Return error details but don't expose stack traces
    res.status(500).json({
      success: false,
      data: [],
      count: 0,
      error: 'Gallery service temporarily unavailable',
      code: 'GALLERY_LOAD_ERROR',
    });
  }
};

/**
 * GET /api/gallery/:id
 * Return gallery item with all its images organized by style
 */
export const getGalleryItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const item = await galleryService.getGalleryItemById(id);
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/gallery/styles
 * Return list of supported styles
 */
export const getSupportedStyles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const styles = galleryService.getSupportedStyles();
    res.json({
      success: true,
      data: styles,
      count: styles.length,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════
// ADMIN ENDPOINTS - GALLERY ITEM MANAGEMENT
// ═══════════════════════════════════════════

/**
 * POST /api/gallery
 * Create new gallery item (metadata only, no image yet)
 */
export const createGalleryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title } = req.body;

    const item = await galleryService.createGalleryItem({
      title: title || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Gallery item created',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/gallery/:id
 * Update gallery item metadata (title only)
 */
export const updateGalleryItemMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const { title } = req.body;

    const item = await galleryService.updateGalleryItem(id, { title });

    res.json({
      success: true,
      message: 'Gallery item updated',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/gallery/:id
 * Delete gallery item and all its images
 */
export const deleteGalleryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    await galleryService.deleteGalleryItem(id);

    res.json({
      success: true,
      message: 'Gallery item deleted',
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════
// ADMIN ENDPOINTS - BEFORE IMAGE
// ═══════════════════════════════════════════

/**
 * POST /api/gallery/:id/before
 * Upload or update before image for gallery item
 */
export const uploadBeforeImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new BadRequestError('Image file is required');
    }

    const id = getParamAsString(req.params.id);
    const beforeImage = await galleryService.uploadBeforeImage(id, req.file.path);

    res.status(201).json({
      success: true,
      message: 'Before image uploaded',
      data: beforeImage,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════
// ADMIN ENDPOINTS - AFTER IMAGES (Variants)
// ═══════════════════════════════════════════

/**
 * POST /api/gallery/:id/after
 * Upload after image with specific style
 * Required: style (modern, minimal, scandinavian, classic, luxury, industrial, loft, dark, eco, hi-tech)
 */
export const uploadAfterImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new BadRequestError('Image file is required');
    }

    const itemId = getParamAsString(req.params.id);
    const { style, order } = req.body;

    if (!style) {
      throw new BadRequestError('Style parameter is required');
    }

    const afterImage = await galleryService.addAfterImage({
      itemId,
      style,
      afterImagePath: req.file.path,
      order: order ? parseInt(order) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'After image uploaded',
      data: afterImage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/gallery/:id/after
 * Get all after images for an item, optionally filtered by style
 */
export const getAfterImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const itemId = getParamAsString(req.params.id);
    const { style } = req.query;

    const images = await galleryService.getAfterImages(
      itemId,
      style ? String(style) : undefined
    );

    res.json({
      success: true,
      data: images,
      count: images.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/gallery/images/:imageId
 * Update image metadata (order, style)
 */
export const updateImageMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const imageId = getParamAsString(req.params.imageId);
    const { order, style } = req.body;

    const updated = await galleryService.updateAfterImage(imageId, { order, style });

    res.json({
      success: true,
      message: 'Image metadata updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/gallery/images/:imageId/replace
 * Replace image file (upload new version)
 */
export const replaceImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new BadRequestError('Image file is required');
    }

    const imageId = getParamAsString(req.params.imageId);
    const updated = await galleryService.replaceAfterImage(imageId, req.file.path);

    res.json({
      success: true,
      message: 'Image replaced',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/gallery/images/:imageId
 * Delete an image (before or after)
 */
export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const imageId = getParamAsString(req.params.imageId);
    await galleryService.deleteImage(imageId);

    res.json({
      success: true,
      message: 'Image deleted',
    });
  } catch (error) {
    next(error);
  }
};
