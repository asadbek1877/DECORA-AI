import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserProfile, changePassword } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';
import { BadRequestError } from '../utils/errors';
import { uploadToCloudinary } from '../services/cloudinary.service';
import { deleteFile } from '../services/image.service';
import { prisma } from '../lib/prisma';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      throw new BadRequestError('Email, username, and password are required');
    }

    if (password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters');
    }

    const result = await registerUser(email, username, password);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const result = await loginUser(email, password);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await getUserProfile(req.userId!);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
        throw new BadRequestError('No image file provided for avatar');
    }

    const cloudResult = await uploadToCloudinary(req.file.path, 'ai-interior/avatars');
    deleteFile(req.file.path);

    const updatedUser = await prisma.user.update({
        where: { id: req.userId! },
        data: { avatarUrl: cloudResult.url },
        select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
            credits: true,
            lastCreditRefillAt: true,
            createdAt: true,
            role: true
        }
    });

    res.status(200).json({
        success: true,
        data: {
          user: updatedUser
        },
    });
  } catch (error) {
      if (req.file) deleteFile(req.file.path);
      next(error);
  }
};

export const updateProfileInfo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, phone } = req.body;
    const updateData: any = {};

    // Always allow updates, even if fields are empty (to handle partial updates)
    if (username !== undefined && username !== '') updateData.username = username;
    if (email !== undefined && email !== '') updateData.email = email;
    // Note: phone is not in User model, but we keep it for future use

    // If there's a file, upload avatar as well
    if (req.file) {
      const cloudResult = await uploadToCloudinary(req.file.path, 'ai-interior/avatars');
      deleteFile(req.file.path);
      updateData.avatarUrl = cloudResult.url;
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      // No updates provided, just return current user
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          credits: true,
          lastCreditRefillAt: true,
          createdAt: true,
          role: true,
        },
      });
      res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId! },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        credits: true,
        lastCreditRefillAt: true,
        createdAt: true,
        role: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
      },
    });
  } catch (error: any) {
    if (req.file) deleteFile(req.file.path);
    if (error?.code === 'P2002') {
      return next(new BadRequestError('Email or username already exists'));
    }
    console.error('Profile update error:', error);
    next(error);
  }
};

export const updatePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Current and new passwords are required');
    }
    if (newPassword.length < 6) {
      throw new BadRequestError('New password must be at least 6 characters');
    }

    await changePassword(req.userId!, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q } },
          { email: { contains: q } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
      },
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getPublicUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        projects: {
          where: {
            isPublic: true,
            isDeleted: false,
            status: 'COMPLETED',
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: {
            id: true,
            style: true,
            roomType: true,
            createdAt: true,
            generatedImages: {
              where: { imageType: 'FINAL' },
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { id: true, imageUrl: true, styleName: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfileShowcase = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectIds = Array.isArray(req.body?.projectIds) ? req.body.projectIds : [];
    const currentUserId = req.userId!;

    await prisma.project.updateMany({
      where: { userId: currentUserId },
      data: { isPublic: false },
    });

    if (projectIds.length > 0) {
      await prisma.project.updateMany({
        where: {
          userId: currentUserId,
          id: { in: projectIds },
        },
        data: { isPublic: true },
      });
    }

    res.status(200).json({ success: true, message: 'Showcase updated' });
  } catch (error) {
    next(error);
  }
};
