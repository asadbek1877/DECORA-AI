import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';

const getParamAsString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  throw new BadRequestError('Invalid id parameter');
};

export const getPublicGallery = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const designs = await prisma.project.findMany({
      where: { isPublic: true, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        generatedImages: {
          where: { imageType: 'FINAL' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        user: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: designs.map((design: any) => ({
        id: design.id,
        originalImageUrl: design.originalImageUrl,
        finalImageUrl: design.generatedImages[0]?.imageUrl || null,
        prompt: design.prompt || design.generatedImages[0]?.prompt || null,
        styleName: design.styleName || design.style || null,
        style: design.style || null,
        roomType: design.roomType,
        isPublic: design.isPublic,
        author: design.user?.username || 'Unknown',
        avatarUrl: design.user?.avatarUrl || null,
        createdAt: design.createdAt,
      })),
      count: designs.length,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleDesignPublish = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const designId = getParamAsString(req.params.id);

    const design = await prisma.project.findUnique({
      where: { id: designId },
      select: { id: true, userId: true, isPublic: true },
    });

    if (!design) {
      throw new NotFoundError('Design not found');
    }

    const isGuestOwner = req.user?.role === 'guest' && !design.userId;
    const isRealOwner = !!req.userId && !!design.userId && design.userId === req.userId;

    if (!isGuestOwner && !isRealOwner) {
      throw new ForbiddenError('Access denied');
    }

    const updated = await prisma.project.update({
      where: { id: designId },
      data: { isPublic: !design.isPublic },
      select: {
        id: true,
        isPublic: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: updated.isPublic ? 'Design published' : 'Design hidden from gallery',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};