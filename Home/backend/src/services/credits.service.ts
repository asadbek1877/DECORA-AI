/**
 * ═════════════════════════════════════════════════════════════════
 *  Credit Management Service
 * ═════════════════════════════════════════════════════════════════
 * 
 * Handles all credit operations:
 * - Pre-check: Verify user has enough credits before generation
 * - Deduct: Safely deduct credits after successful generation
 * - Refund: Return credits if generation fails (error recovery)
 * 
 * Safety Mechanisms:
 * - No credits deducted on API failures
 * - Pre-check prevents over-spending
 * - Transaction-like semantics (generate succeeds → deduct)
 */

import prisma from '../lib/prisma';
import { AppError, NotFoundError } from '../utils/errors';
import { AIModelConfig } from '../config/models';
import logger from '../utils/logger';

const DAILY_FREE_CREDITS = 3;

interface CreditState {
  totalCredits: number;
  freeCredits: number;
  paidCredits: number;
  lastRefillAt: Date;
  nextRefillAt: Date;
}

interface PreCheckResult {
  hasEnoughCredits: boolean;
  currentCredits: number;
  requiredCredits: number;
  shortfall: number;
  message?: string;
}

/**
 * Get current credit state for a user
 * Handles daily refill (3 free credits every 24 hours)
 */
export async function getUserCreditState(userId: string): Promise<CreditState> {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError(`User ${userId} not found`);

  const now = new Date();
  const lastRefill = new Date(user.lastCreditRefillAt);
  const hoursSinceRefill = (now.getTime() - lastRefill.getTime()) / (1000 * 60 * 60);

  // Auto-refill if 24+ hours have passed
  if (hoursSinceRefill >= 24) {
    const refreshedCredits = Math.max(user.credits, DAILY_FREE_CREDITS);
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: refreshedCredits,
        lastCreditRefillAt: now,
      },
    });
    logger.info(
      `[Credits] Daily refill for user ${userId}: ${user.credits} credits`
    );
  }

  const totalCredits = user.credits;
  const freeCredits = Math.min(DAILY_FREE_CREDITS, totalCredits);
  const paidCredits = Math.max(0, totalCredits - DAILY_FREE_CREDITS);
  const nextRefillAt = new Date(
    new Date(user.lastCreditRefillAt).getTime() + 24 * 60 * 60 * 1000
  );

  return {
    totalCredits,
    freeCredits,
    paidCredits,
    lastRefillAt: user.lastCreditRefillAt,
    nextRefillAt,
  };
}

/**
 * Pre-check: Verify user has sufficient credits BEFORE generation
 * Should be called before any API call to the AI provider
 * 
 * Returns:
 * - hasEnoughCredits: boolean
 * - currentCredits: user's current balance
 * - requiredCredits: credits needed for this model
 * - shortfall: how many credits short (0 if sufficient)
 * - message: human-readable explanation
 */
export async function checkCreditsAvailable(
  userId: string,
  model: AIModelConfig
): Promise<PreCheckResult> {
  try {
    const creditState = await getUserCreditState(userId);
    const hasEnoughCredits = creditState.totalCredits >= model.creditCost;
    const shortfall = Math.max(
      0,
      model.creditCost - creditState.totalCredits
    );

    const message = hasEnoughCredits
      ? `Sufficient credits (${creditState.totalCredits} available, ${model.creditCost} required)`
      : `Insufficient credits (${creditState.totalCredits} available, ${model.creditCost} required). You need ${shortfall} more.`;

    logger.info(
      `[Credits] Pre-check for user ${userId}: ${hasEnoughCredits ? 'PASS' : 'FAIL'} — ${message}`
    );

    return {
      hasEnoughCredits,
      currentCredits: creditState.totalCredits,
      requiredCredits: model.creditCost,
      shortfall,
      message,
    };
  } catch (error: any) {
    logger.error(
      `[Credits] Pre-check error for user ${userId}: ${error.message}`
    );
    throw error;
  }
}

/**
 * Deduct credits ONLY after successful generation
 * This should be called AFTER the API returns successfully
 * Never call this on API errors!
 * 
 * Returns updated credit balance
 */
export async function deductCredits(
  userId: string,
  model: AIModelConfig
): Promise<number> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    // Safety check: ensure user has credits (shouldn't happen if pre-check was called)
    if (user.credits < model.creditCost) {
      throw new AppError(
        `Cannot deduct ${model.creditCost} credits (only ${user.credits} available)`,
        402
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: model.creditCost } },
    });

    logger.info(
      `[Credits] Deducted ${model.creditCost} credits for user ${userId} (${model.displayName}). Balance: ${updatedUser.credits}`
    );

    return updatedUser.credits;
  } catch (error: any) {
    logger.error(
      `[Credits] Deduction error for user ${userId}: ${error.message}`
    );
    throw error;
  }
}

/**
 * Refund credits if generation fails
 * Call this if the API returns an error to restore pre-deducted credits
 * 
 * Note: Current implementation deducts AFTER success, so this may not be needed
 * In future, if credits are deducted upfront, use this to refund on failure
 */
export async function refundCredits(
  userId: string,
  model: AIModelConfig
): Promise<number> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: model.creditCost } },
    });

    logger.info(
      `[Credits] Refunded ${model.creditCost} credits for user ${userId}. Balance: ${user.credits}`
    );

    return user.credits;
  } catch (error: any) {
    logger.error(
      `[Credits] Refund error for user ${userId}: ${error.message}`
    );
    throw error;
  }
}

/**
 * Add credits manually (admin operation)
 * For payment processing or premium features
 */
export async function addCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<number> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    });

    logger.info(
      `[Credits] Added ${amount} credits for user ${userId} (${reason}). Balance: ${user.credits}`
    );

    return user.credits;
  } catch (error: any) {
    logger.error(
      `[Credits] Add credits error for user ${userId}: ${error.message}`
    );
    throw error;
  }
}
