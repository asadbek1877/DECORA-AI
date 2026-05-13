import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, { statusCode: err.statusCode });
    // AIBillingError (503) → code: AI_BILLING
    const code = err.statusCode === 503 ? 'AI_BILLING' : undefined;
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(code && { code }),
    });
    return;
  }

  logger.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};
