import { Router } from 'express';
import * as galleryController from '../controllers/gallery.controller';
import * as publicDesignController from '../controllers/public-design.controller';
import { upload } from '../middleware/upload';
import { requireAdminSecret } from '../controllers/admin.controller';

const router = Router();

// ═══════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════

/**
 * GET /api/gallery/styles
 * Get list of supported design styles
 */
router.get('/styles', galleryController.getSupportedStyles);

/**
 * GET /api/gallery
 * List all public designs for the gallery feed
 */
router.get('/', publicDesignController.getPublicGallery);

/**
 * GET /api/gallery/:id
 * Get single gallery item with all its images organized by style
 */
router.get('/:id', galleryController.getGalleryItemById);

/**
 * GET /api/gallery/:id/after
 * Get after images for specific item, optionally filtered by style
 */
router.get('/:id/after', galleryController.getAfterImages);

// ═══════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════

router.use(requireAdminSecret);

/**
 * POST /api/gallery
 * Create new gallery item (metadata only)
 */
router.post('/', galleryController.createGalleryItem);

/**
 * PUT /api/gallery/:id
 * Update gallery item metadata (title)
 */
router.put('/:id', galleryController.updateGalleryItemMetadata);

/**
 * DELETE /api/gallery/:id
 * Delete gallery item and all its images
 */
router.delete('/:id', galleryController.deleteGalleryItem);

// ─── IMAGE MANAGEMENT ──────────────────────

/**
 * POST /api/gallery/:id/before
 * Upload or replace before image
 */
router.post(
  '/:id/before',
  upload.single('image'),
  galleryController.uploadBeforeImage
);

/**
 * POST /api/gallery/:id/after
 * Upload after image with specific style
 * Body: { style: string, order?: number }
 */
router.post(
  '/:id/after',
  upload.single('image'),
  galleryController.uploadAfterImage
);

/**
 * PATCH /api/gallery/images/:imageId
 * Update image metadata (order, style)
 */
router.patch('/images/:imageId', galleryController.updateImageMetadata);

/**
 * PATCH /api/gallery/images/:imageId/replace
 * Replace image file
 */
router.patch(
  '/images/:imageId/replace',
  upload.single('image'),
  galleryController.replaceImage
);

/**
 * DELETE /api/gallery/images/:imageId
 * Delete image
 */
router.delete('/images/:imageId', galleryController.deleteImage);

export default router;
