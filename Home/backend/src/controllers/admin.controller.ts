import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

const USER_STATUS_TO_ROLE: Record<string, string> = {
    ACTIVE: 'USER',
    BLOCKED: 'BLOCKED',
    BANNED: 'BANNED',
    ADMIN: 'ADMIN',
};

function roleToStatus(role: string): string {
    if (role === 'BLOCKED') return 'BLOCKED';
    if (role === 'BANNED') return 'BANNED';
    if (role === 'ADMIN') return 'ADMIN';
    return 'ACTIVE';
}

function parsePagination(value: unknown, fallback: number, max: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.min(Math.floor(parsed), max);
}

function getParamAsString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    throw new BadRequestError('Invalid id parameter');
}

export const requireAdminSecret = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const expected = process.env.ADMIN_PASSWORD || 'admin';
    const provided = req.headers['x-admin-password'];

    if (typeof provided !== 'string' || provided !== expected) {
        return next(new ForbiddenError('Admin access denied'));
    }

    next();
};

/**
 * POST /api/admin/verify
 */
export const verifyAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { password } = req.body;
        const correctPassword = process.env.ADMIN_PASSWORD || 'admin';
        
        if (password === correctPassword) {
            res.status(200).json({ success: true, message: 'Verified' });
        } else {
            res.status(401).json({ success: false, error: 'Incorrect password' });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/dashboard
 * Fetch aggregated data for the admin dashboard
 */
export const getAdminDashboardData = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        logger.info(`[Admin] Fetching dashboard data...`);

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                avatarUrl: true,
                credits: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        projects: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Fast summary aggregations
        const totalUsers = users.length;
        
        const totalProjects = await prisma.project.count({
            where: { isDeleted: false }
        });

        const totalGeneratedImages = await prisma.generatedImage.count();
        const blockedUsers = users.filter((u: any) => u.role === 'BLOCKED').length;
        const bannedUsers = users.filter((u: any) => u.role === 'BANNED').length;
        const adminUsers = users.filter((u: any) => u.role === 'ADMIN').length;

        const recentGenerations = await prisma.generatedImage.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                project: {
                    select: {
                        id: true,
                        user: { select: { username: true, email: true } },
                        roomType: true,
                        style: true,
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalProjects,
                    totalGeneratedImages,
                    blockedUsers,
                    bannedUsers,
                    adminUsers,
                },
                users: users.map((user: any) => ({
                    ...user,
                    status: roleToStatus(user.role),
                })),
                recentGenerations,
            }
        });
    } catch (error) {
        logger.error(`[Admin] Dashboard Error: ${error}`);
        next(error);
    }
};

/**
 * GET /api/admin/users
 */
export const getAdminUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const page = parsePagination(req.query.page, 1, 10000);
        const limit = parsePagination(req.query.limit, 20, 100);
        const skip = (page - 1) * limit;

        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'ALL';

        const where: any = {};

        if (search) {
            where.OR = [
                { email: { contains: search } },
                { username: { contains: search } },
            ];
        }

        if (status !== 'ALL' && USER_STATUS_TO_ROLE[status]) {
            where.role = USER_STATUS_TO_ROLE[status];
        }

        const [total, users] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    avatarUrl: true,
                    credits: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            projects: true,
                        },
                    },
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: users.map((user: any) => ({
                    ...user,
                    status: roleToStatus(user.role),
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    pageCount: Math.max(1, Math.ceil(total / limit)),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/users/:id
 */
export const getAdminUserDetail = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getParamAsString(req.params.id);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                projects: {
                    where: { isDeleted: false },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                    select: {
                        id: true,
                        style: true,
                        roomType: true,
                        status: true,
                        originalImageUrl: true,
                        createdAt: true,
                        generatedImages: {
                            orderBy: { createdAt: 'desc' },
                            take: 6,
                            select: {
                                id: true,
                                imageUrl: true,
                                styleName: true,
                                imageType: true,
                                createdAt: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const totalGeneratedImages = user.projects.reduce(
            (sum: number, project: { generatedImages: Array<unknown> }) => sum + project.generatedImages.length,
            0
        );

        res.status(200).json({
            success: true,
            data: {
                ...user,
                status: roleToStatus(user.role),
                metrics: {
                    totalProjects: user.projects.length,
                    totalGeneratedImages,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/admin/users/:id
 */
export const updateAdminUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getParamAsString(req.params.id);
        const { username, email, avatarUrl, credits, status } = req.body;

        const updateData: any = {};

        if (typeof username === 'string') {
            const normalized = username.trim();
            if (!normalized) throw new BadRequestError('Username cannot be empty');
            updateData.username = normalized;
        }

        if (typeof email === 'string') {
            const normalized = email.trim().toLowerCase();
            if (!normalized) throw new BadRequestError('Email cannot be empty');
            updateData.email = normalized;
        }

        if (typeof avatarUrl === 'string') {
            updateData.avatarUrl = avatarUrl.trim() || null;
        }

        if (credits !== undefined) {
            const nextCredits = Number(credits);
            if (!Number.isInteger(nextCredits) || nextCredits < 0) {
                throw new BadRequestError('Credits must be a non-negative integer');
            }
            updateData.credits = nextCredits;
        }

        if (typeof status === 'string') {
            const normalizedStatus = status.toUpperCase();
            if (!USER_STATUS_TO_ROLE[normalizedStatus]) {
                throw new BadRequestError('Invalid status value');
            }
            updateData.role = USER_STATUS_TO_ROLE[normalizedStatus];
        }

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestError('Nothing to update');
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                username: true,
                avatarUrl: true,
                credits: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.status(200).json({
            success: true,
            data: {
                ...user,
                status: roleToStatus(user.role),
            },
        });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return next(new BadRequestError('Email already exists'));
        }
        if (error?.code === 'P2025') {
            return next(new NotFoundError('User not found'));
        }
        next(error);
    }
};

/**
 * POST /api/admin/users/:id/credits
 */
export const updateAdminUserCredits = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getParamAsString(req.params.id);
        const { amount, mode } = req.body as { amount?: number; mode?: 'set' | 'add' | 'subtract' };

        const parsedAmount = Number(amount);
        if (!Number.isInteger(parsedAmount) || parsedAmount < 0) {
            throw new BadRequestError('Amount must be a non-negative integer');
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        let nextCredits = user.credits;
        if (mode === 'add') nextCredits = user.credits + parsedAmount;
        else if (mode === 'subtract') nextCredits = Math.max(0, user.credits - parsedAmount);
        else nextCredits = parsedAmount;

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { credits: nextCredits },
            select: {
                id: true,
                credits: true,
                updatedAt: true,
            },
        });

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/users/:id/status
 */
export const updateAdminUserStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getParamAsString(req.params.id);
        const status = String(req.body?.status || '').toUpperCase();

        if (!USER_STATUS_TO_ROLE[status]) {
            throw new BadRequestError('Invalid status value');
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { role: USER_STATUS_TO_ROLE[status] },
            select: {
                id: true,
                role: true,
                updatedAt: true,
            },
        });

        res.status(200).json({
            success: true,
            data: {
                ...updated,
                status: roleToStatus(updated.role),
            },
        });
    } catch (error: any) {
        if (error?.code === 'P2025') {
            return next(new NotFoundError('User not found'));
        }
        next(error);
    }
};

/**
 * DELETE /api/admin/users/:id
 */
export const deleteAdminUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getParamAsString(req.params.id);
        await prisma.user.delete({ where: { id: userId } });
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        if (error?.code === 'P2025') {
            return next(new NotFoundError('User not found'));
        }
        next(error);
    }
};

/**
 * GET /api/admin/settings & GET /api/settings (Public)
 */
export const getAppSettings = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let settings = await prisma.appSettings.findUnique({
            where: { id: 'singleton' },
        });

        if (!settings) {
            settings = await prisma.appSettings.create({
                data: {
                    id: 'singleton',
                    beforeImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    afterImageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                },
            });
        }

        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/settings
 */
export const updateAppSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { beforeImageUrl, afterImageUrl } = req.body;

        if (!beforeImageUrl || !afterImageUrl) {
            throw new BadRequestError('Both beforeImageUrl and afterImageUrl are required');
        }

        const settings = await prisma.appSettings.upsert({
            where: { id: 'singleton' },
            create: {
                id: 'singleton',
                beforeImageUrl,
                afterImageUrl,
            },
            update: {
                beforeImageUrl,
                afterImageUrl,
            },
        });

        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};
