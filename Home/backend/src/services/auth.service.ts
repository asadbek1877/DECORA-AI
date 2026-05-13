import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { config } from '../config';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';

export interface AuthResult {
  user: { id: string; email: string; username: string; credits: number; lastCreditRefillAt?: Date };
  token: string;
}

export async function registerUser(email: string, username: string, password: string): Promise<AuthResult> {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      credits: 3, // 3 бепул кредит
    },
  });

  const token = generateToken(user.id);

  logger.info(`User registered: ${email} (credits: ${user.credits})`);

  return {
    user: { id: user.id, email: user.email, username: user.username, credits: user.credits, lastCreditRefillAt: user.lastCreditRefillAt },
    token,
  };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.role === 'BANNED') {
    throw new UnauthorizedError('Your account is banned. Please contact support.');
  }

  if (user.role === 'BLOCKED') {
    throw new UnauthorizedError('Your account is temporarily blocked.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken(user.id);

  logger.info(`User logged in: ${email}`);

  return {
    user: { id: user.id, email: user.email, username: user.username, credits: user.credits, lastCreditRefillAt: user.lastCreditRefillAt },
    token,
  };
}

export async function getUserProfile(userId: string): Promise<{ id: string; email: string; username: string; credits: number; lastCreditRefillAt: Date } | null> {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  // Check if 24 hours have passed since last refill
  const now = new Date();
  const lastRefill = new Date(user.lastCreditRefillAt);
  const hoursSinceRefill = (now.getTime() - lastRefill.getTime()) / (1000 * 60 * 60);

  if (hoursSinceRefill >= 24) {
    const refreshedCredits = Math.max(user.credits, 3);
    user = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: refreshedCredits,
        lastCreditRefillAt: now,
      },
    });
    logger.info(`Refilled credits for user ${user.email} (new balance: ${user.credits})`);
  }

  return { id: user.id, email: user.email, username: user.username, credits: user.credits, lastCreditRefillAt: user.lastCreditRefillAt };
}

export async function changePassword(userId: string, current: string, newPass: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new UnauthorizedError('User not found');

  const isPasswordValid = await bcrypt.compare(current, user.passwordHash);
  if (!isPasswordValid) throw new BadRequestError('Incorrect current password');

  const newPasswordHash = await bcrypt.hash(newPass, 12);
  
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });
  
  logger.info(`User ${user.email} changed password`);
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}
