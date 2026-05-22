import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';
import prisma from '../lib/prisma';

export type RequestUser = {
  id: string;
  role: string;
};

export interface AuthRequest extends Request {
  userId?: string;
  user?: RequestUser;
}

const attachGuestUser = (req: AuthRequest): void => {
  req.user = { id: 'guest', role: 'guest' };
  delete req.userId;
};

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      attachGuestUser(req);
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.role === 'BANNED') {
      throw new UnauthorizedError('Your account is banned');
    }

    if (user.role === 'BLOCKED') {
      throw new UnauthorizedError('Your account is blocked');
    }

    req.userId = decoded.userId;
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    attachGuestUser(req);
    next();
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      req.userId = decoded.userId;
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user) {
        req.user = { id: user.id, role: user.role };
      }
    } else {
      attachGuestUser(req);
    }
  } catch {
    attachGuestUser(req);
  }
  next();
};
