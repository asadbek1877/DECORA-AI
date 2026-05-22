import logger from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { AIBillingError } from '../replicate.service';

export const GEMINI_TIMEOUT_MS = 120_000;
export const GEMINI_MAX_RETRIES = 3;
export const GEMINI_TOTAL_ATTEMPTS = GEMINI_MAX_RETRIES + 1;
export const GEMINI_RETRY_BASE_DELAY_MS = 30_000;
export const GEMINI_OVERLOADED_MESSAGE = 'Gemini servers are currently overloaded. Please try again in a few moments.';

type GeminiErrorLike = {
  message?: string;
  status?: number;
  statusCode?: number;
  name?: string;
  cause?: {
    code?: string;
    name?: string;
    message?: string;
  };
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  const candidate = error as GeminiErrorLike | undefined;
  return candidate?.message || 'Unknown Gemini error';
}

function getErrorStatus(error: unknown): number | undefined {
  const candidate = error as GeminiErrorLike | undefined;
  return candidate?.statusCode ?? candidate?.status;
}

function isTimeoutLikeError(error: unknown): boolean {
  const candidate = error as GeminiErrorLike | undefined;
  const message = getErrorMessage(error);
  const name = candidate?.name || '';
  const causeName = candidate?.cause?.name || '';
  const causeCode = candidate?.cause?.code || '';
  const causeMessage = candidate?.cause?.message || '';

  return /timeout|timed out|aborted|aborterror|apiconnectiontimeouterror|apiuseraborterror|etimedout|econnreset|socket hang up|fetch failed/i.test(message)
    || /timeout|abort/i.test(name)
    || /timeout|abort/i.test(causeName)
    || /ETIMEDOUT|UND_ERR_CONNECT_TIMEOUT|ECONNRESET|UND_ERR_SOCKET|ECONNABORTED/i.test(causeCode)
    || /timeout|abort|fetch failed/i.test(causeMessage);
}

function isRetryableGeminiError(error: unknown): boolean {
  if (error instanceof AIBillingError) {
    return false;
  }

  const status = getErrorStatus(error);
  return status === 503 || isTimeoutLikeError(error);
}

function normalizeGeminiError(error: unknown, timeoutMs: number): AppError {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);

  if (error instanceof AIBillingError) {
    return error;
  }

  if (error instanceof AppError) {
    if (isTimeoutLikeError(error)) {
      return new AppError(
        `TimeoutError: Gemini request timed out after ${timeoutMs / 1000}s. Please try again in a few moments.`,
        503,
      );
    }

    return error;
  }

  if (status === 401 || status === 403 || /api[_-]?key|permission_denied|unauthorized/i.test(message)) {
    return new AppError('Invalid GEMINI_API_KEY. Check .env', 500);
  }

  if (status === 429) {
    return new AIBillingError('Gemini quota exceeded (429). Wait and retry.');
  }

  if (isTimeoutLikeError(error)) {
    return new AppError(
      `TimeoutError: Gemini request timed out after ${timeoutMs / 1000}s. Please try again in a few moments.`,
      503,
    );
  }

  if (status === 503) {
    return new AppError(GEMINI_OVERLOADED_MESSAGE, 503);
  }

  return new AppError(`Gemini error: ${message}`, status || 500);
}

export function isGeminiOverloadedMessage(message: string): boolean {
  return /Gemini servers are currently overloaded/i.test(message);
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new AppError(`TimeoutError: ${label} timed out after ${timeoutMs / 1000}s.`, 503));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

export async function withGeminiRetries<T>(
  label: string,
  operation: (attempt: number) => Promise<T>,
  timeoutMs: number = GEMINI_TIMEOUT_MS,
): Promise<T> {
  let lastError: AppError | null = null;

  for (let attempt = 1; attempt <= GEMINI_TOTAL_ATTEMPTS; attempt += 1) {
    const startedAt = Date.now();
    logger.info(`[GeminiProvider] ${label} attempt ${attempt}/${GEMINI_TOTAL_ATTEMPTS} started`);

    try {
      const result = await withTimeout(operation(attempt), timeoutMs, label);
      logger.info(
        `[GeminiProvider] ${label} attempt ${attempt}/${GEMINI_TOTAL_ATTEMPTS} succeeded in ${Date.now() - startedAt}ms`,
      );
      return result;
    } catch (error) {
      const normalizedError = normalizeGeminiError(error, timeoutMs);
      lastError = normalizedError;

      const elapsedMs = Date.now() - startedAt;
      logger.warn(
        `[GeminiProvider] ${label} attempt ${attempt}/${GEMINI_TOTAL_ATTEMPTS} failed after ${elapsedMs}ms: ${normalizedError.message}`,
      );

      if (attempt >= GEMINI_TOTAL_ATTEMPTS || !isRetryableGeminiError(normalizedError)) {
        throw normalizedError;
      }

      const delayMs = GEMINI_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      logger.warn(`[GeminiProvider] Retrying ${label} in ${delayMs / 1000}s`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new AppError('Gemini request failed.', 500);
}