import { prisma } from '../lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinary.service';
import { BadRequestError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * GALLERY SERVICE (Refactored for Scalable Architecture)
 * До/После галерея: До расмлар (before) ва 10 та хар хил стилдаги ПОСЛЕ расмлар
 * 
 * Database Structure:
 * - GalleryItem: id, title, createdAt, updatedAt
 * - GalleryImage: id, itemId, type (before|after), style, path, order, createdAt, updatedAt
 */

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════
const SUPPORTED_STYLES = [
  'modern',
  'minimal',
  'scandinavian',
  'classic',
  'luxury',
  'industrial',
  'loft',
  'dark',
  'eco',
  'hi-tech',
];

// ═══════════════════════════════════════════
// GALLERY ITEMS (CRUD)
// ═══════════════════════════════════════════

export async function createGalleryItem(data: { title?: string }): Promise<any> {
  try {
    const galleryItem = await prisma.galleryItem.create({
      data: {
        title: data.title || `Gallery Item ${new Date().toISOString()}`,
      },
      include: {
        images: {
          orderBy: [{ type: 'asc' }, { style: 'asc' }, { order: 'asc' }],
        },
      },
    });

    logger.info(`✅ Gallery item created: ${galleryItem.id}`);
    return galleryItem;
  } catch (error: any) {
    logger.error(`Failed to create gallery item: ${error.message}`);
    throw error;
  }
}

export async function getGalleryItems(): Promise<any[]> {
  try {
    const items = await prisma.galleryItem.findMany({
      include: {
        images: {
          where: { type: 'before' },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform: return item with beforeImage at top level for easier access
    return items.map((item: any) => ({
      ...item,
      beforeImage: item.images[0] || null,
    }));
  } catch (error: any) {
    logger.error(`Failed to fetch gallery items: ${error.message}`);
    throw error;
  }
}

export async function getGalleryItemById(id: string): Promise<any> {
  try {
    const item = await prisma.galleryItem.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [{ type: 'asc' }, { style: 'asc' }, { order: 'asc' }],
        },
      },
    });

    if (!item) {
      throw new NotFoundError('Gallery item not found');
    }

    // Transform: organize images by type and style
    return {
      ...item,
      beforeImage: item.images.find((img: any) => img.type === 'before') || null,
      styleVariants: groupImagesByStyle(item.images.filter((img: any) => img.type === 'after')),
    };
  } catch (error: any) {
    logger.error(`Failed to fetch gallery item: ${error.message}`);
    throw error;
  }
}

export async function updateGalleryItem(id: string, data: { title?: string }): Promise<any> {
  try {
    const item = await prisma.galleryItem.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        updatedAt: new Date(),
      },
      include: {
        images: {
          orderBy: [{ type: 'asc' }, { style: 'asc' }, { order: 'asc' }],
        },
      },
    });

    logger.info(`✅ Gallery item updated: ${id}`);
    return item;
  } catch (error: any) {
    logger.error(`Failed to update gallery item: ${error.message}`);
    if (error.code === 'P2025') {
      throw new NotFoundError('Gallery item not found');
    }
    throw error;
  }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    const item = await prisma.galleryItem.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!item) {
      throw new NotFoundError('Gallery item not found');
    }

    // Delete all images from Cloudinary
    for (const image of item.images) {
      if (image.publicId) {
        await deleteFromCloudinary(image.publicId);
      }
    }

    // Delete from database (cascade deletes images)
    await prisma.galleryItem.delete({ where: { id } });
    logger.info(`✅ Gallery item deleted: ${id}`);
  } catch (error: any) {
    logger.error(`Failed to delete gallery item: ${error.message}`);
    throw error;
  }
}

// ═══════════════════════════════════════════
// BEFORE IMAGE (Upload/Replace)
// ═══════════════════════════════════════════

export async function uploadBeforeImage(
  itemId: string,
  beforeImagePath: string
): Promise<any> {
  try {
    // Check item exists
    const item = await prisma.galleryItem.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundError('Gallery item not found');
    }

    // Find existing before image
    const existingBefore = await prisma.galleryImage.findFirst({
      where: { itemId, type: 'before' },
    });

    // Delete old image from Cloudinary
    if (existingBefore?.publicId) {
      await deleteFromCloudinary(existingBefore.publicId);
    }

    // Upload new image
    const { url, publicId } = await uploadToCloudinary(
      beforeImagePath,
      `gallery/${itemId}/before`
    );

    // Save or update in database
    let beforeImage;
    if (existingBefore) {
      beforeImage = await prisma.galleryImage.update({
        where: { id: existingBefore.id },
        data: { path: url, publicId, updatedAt: new Date() },
      });
    } else {
      beforeImage = await prisma.galleryImage.create({
        data: {
          itemId,
          type: 'before',
          style: null,
          path: url,
          publicId,
          order: 0,
        },
      });
    }

    logger.info(`✅ Before image uploaded for item: ${itemId}`);
    return beforeImage;
  } catch (error: any) {
    logger.error(`Failed to upload before image: ${error.message}`);
    throw error;
  }
}

// ═══════════════════════════════════════════
// AFTER IMAGES / VARIANTS (Upload/Replace/Delete)
// ═══════════════════════════════════════════

export async function addAfterImage(data: {
  itemId: string;
  style: string; // 'modern', 'minimal', etc.
  afterImagePath: string;
  order?: number;
}): Promise<any> {
  try {
    // Validate style
    if (!SUPPORTED_STYLES.includes(data.style)) {
      throw new BadRequestError(
        `Invalid style. Supported: ${SUPPORTED_STYLES.join(', ')}`
      );
    }

    // Check item exists
    const item = await prisma.galleryItem.findUnique({ where: { id: data.itemId } });
    if (!item) {
      throw new NotFoundError('Gallery item not found');
    }

    // Upload to Cloudinary
    const { url, publicId } = await uploadToCloudinary(
      data.afterImagePath,
      `gallery/${data.itemId}/after/${data.style}`
    );

    // Get next order number for this style
    const lastImage = await prisma.galleryImage.findFirst({
      where: { itemId: data.itemId, type: 'after', style: data.style },
      orderBy: { order: 'desc' },
    });

    const order = data.order ?? (lastImage?.order || 0) + 1;

    // Save to database
    const afterImage = await prisma.galleryImage.create({
      data: {
        itemId: data.itemId,
        type: 'after',
        style: data.style,
        path: url,
        publicId,
        order,
      },
    });

    logger.info(`✅ After image added for item ${data.itemId} (${data.style})`);
    return afterImage;
  } catch (error: any) {
    logger.error(`Failed to add after image: ${error.message}`);
    throw error;
  }
}

export async function getAfterImages(
  itemId: string,
  style?: string
): Promise<any[]> {
  try {
    const images = await prisma.galleryImage.findMany({
      where: {
        itemId,
        type: 'after',
        ...(style && { style }),
      },
      orderBy: [{ style: 'asc' }, { order: 'asc' }],
    });

    return images;
  } catch (error: any) {
    logger.error(`Failed to fetch after images: ${error.message}`);
    throw error;
  }
}

export async function updateAfterImage(
  imageId: string,
  data: { order?: number; style?: string }
): Promise<any> {
  try {
    const image = await prisma.galleryImage.update({
      where: { id: imageId },
      data: {
        ...(data.order !== undefined && { order: data.order }),
        ...(data.style && { style: data.style }),
        updatedAt: new Date(),
      },
    });

    logger.info(`✅ After image updated: ${imageId}`);
    return image;
  } catch (error: any) {
    logger.error(`Failed to update after image: ${error.message}`);
    if (error.code === 'P2025') {
      throw new NotFoundError('Image not found');
    }
    throw error;
  }
}

export async function replaceAfterImage(
  imageId: string,
  newImagePath: string
): Promise<any> {
  try {
    // Get existing image
    const image = await prisma.galleryImage.findUnique({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundError('Image not found');
    }
    if (image.type !== 'after') {
      throw new BadRequestError('Can only replace after images');
    }

    // Delete old from Cloudinary
    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    // Upload new
    const { url, publicId } = await uploadToCloudinary(
      newImagePath,
      `gallery/${image.itemId}/after/${image.style}`
    );

    // Update database
    const updated = await prisma.galleryImage.update({
      where: { id: imageId },
      data: { path: url, publicId, updatedAt: new Date() },
    });

    logger.info(`✅ After image replaced: ${imageId}`);
    return updated;
  } catch (error: any) {
    logger.error(`Failed to replace after image: ${error.message}`);
    throw error;
  }
}

export async function deleteImage(imageId: string): Promise<void> {
  try {
    const image = await prisma.galleryImage.findUnique({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundError('Image not found');
    }

    // Delete from Cloudinary
    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    // Delete from database
    await prisma.galleryImage.delete({ where: { id: imageId } });
    logger.info(`✅ Image deleted: ${imageId}`);
  } catch (error: any) {
    logger.error(`Failed to delete image: ${error.message}`);
    throw error;
  }
}

// ═══════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════

/**
 * Group 'after' images by style for easier frontend consumption
 */
function groupImagesByStyle(
  images: Array<{ id: string; style: string | null; path: string; order: number }>
): Record<string, Array<{ id: string; path: string; order: number }>> {
  const grouped: Record<string, any> = {};

  for (const image of images) {
    if (!image.style) continue;

    if (!grouped[image.style]) {
      grouped[image.style] = [];
    }

    grouped[image.style].push({
      id: image.id,
      path: image.path,
      order: image.order,
    });
  }

  return grouped;
}

// Export supported styles for frontend/admin
export function getSupportedStyles(): string[] {
  return SUPPORTED_STYLES;
}
