import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import {
  generateDesign,
  generateMultipleDesignPreviews,
  isFreeProvider,
  getActiveProvider,
  isProviderConfigured,
  analyzeRoom,
  suggestPrompt
} from '../services/ai.service';
import { getStyleByName, getAllStyles } from '../prompts/styles';
import { getStrengthFromIntensity } from '../prompts/builder';
import { BadRequestError, NotFoundError, ForbiddenError, AppError } from '../utils/errors';
import { deleteFile, processUploadedImage } from '../services/image.service';
import { config } from '../config';
import logger from '../utils/logger';
import { checkCreditsAvailable, deductCredits, getUserCreditState } from '../services/credits.service';
import { getModelById, AVAILABLE_MODELS } from '../config/models';

const DAILY_FREE_CREDITS = 3;

async function getCurrentCreditState(userId: string): Promise<{
  user: { id: string; credits: number; lastCreditRefillAt: Date };
  freeCredits: number;
  paidCredits: number;
  totalCredits: number;
  nextRefillAt: Date;
}> {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const now = new Date();
  const lastRefill = new Date(user.lastCreditRefillAt);
  const hoursSinceRefill = (now.getTime() - lastRefill.getTime()) / (1000 * 60 * 60);

  // If 24+ hours since last refill, reset to 3 free credits
  if (hoursSinceRefill >= 24) {
    logger.info(`[Credits] Refilling credits for user ${userId}: ${hoursSinceRefill.toFixed(1)} hours since last refill`);
    user = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: DAILY_FREE_CREDITS, // Reset to 3 (not Math.max to ensure refill)
        lastCreditRefillAt: now,
      },
    });
    logger.info(`[Credits] User ${userId} refilled to ${DAILY_FREE_CREDITS} credits`);
  }

  const totalCredits = user.credits;
  const freeCredits = Math.min(DAILY_FREE_CREDITS, totalCredits);
  const paidCredits = Math.max(0, totalCredits - DAILY_FREE_CREDITS);
  const nextRefillAt = new Date(lastRefill.getTime() + 24 * 60 * 60 * 1000);

  return {
    user: { id: user.id, credits: user.credits, lastCreditRefillAt: user.lastCreditRefillAt },
    freeCredits,
    paidCredits,
    totalCredits,
    nextRefillAt,
  };
}

// ─── Validation Schemas ───────────────────
const previewSchema = z.object({
  projectId: z.string().optional(),            // Optional — guests don't have a DB project
  originalImageUrl: z.string().url().optional(), // Guest mode: direct Cloudinary URL
  imageBase64: z.string().min(100).optional(),  // Guest mode: base64 image data (NEW)
  mimeType: z.enum(['image/jpeg', 'image/png']).optional().default('image/jpeg'), // For base64 images
  styles: z.array(z.string()).optional(),
  roomType: z.string().max(100).optional(),
  customPrompt: z.string().max(500).optional(),
  modelName: z.string().optional(),
  modelId: z.string().optional(),              // NEW: Model ID for credit-based selection
  intensity: z.number().min(0).max(100).optional(), // Design intensity (0-100%)
});


const finalSchema = z.object({
  projectId: z.string().optional(),              // Optional — guests don't have a DB project
  originalImageUrl: z.string().url().optional(), // Guest mode: direct Cloudinary URL
  imageBase64: z.string().min(100).optional(),   // Guest mode: base64 image data (NEW)
  mimeType: z.enum(['image/jpeg', 'image/png']).optional().default('image/jpeg'), // For base64 images
  styleName: z.string().min(1, 'Style name is required'),
  roomType: z.string().max(100).optional(),
  additionalInstructions: z.string().max(500).optional(),
  customPrompt: z.string().max(500).optional(),
  modelName: z.string().optional(),
  aiProvider: z.string().optional(),             // AI Provider selection (gemini, fal, replicate, huggingface)
  modelId: z.string().optional(),                // NEW: Model ID for credit-based selection
  intensity: z.number().min(0).max(100).optional(), // Design intensity (0-100%)
});

// ─── NEW: Base64 Upload Schema ─────────────────
const base64Schema = z.object({
  imageBase64: z.string().min(100, 'Base64 string too small'),
  mimeType: z.enum(['image/jpeg', 'image/png']).default('image/jpeg'),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

// ─── Helper: Convert base64 to data URI ─────────────────
function base64ToDataUri(base64: string, mimeType: string = 'image/jpeg'): string {
  // Ensure mimeType is valid
  const validMimeType = ['image/jpeg', 'image/png'].includes(mimeType) ? mimeType : 'image/jpeg';
  // If base64 doesn't start with the MIME prefix, add it
  if (base64.startsWith('data:')) {
    return base64;
  }
  return `data:${validMimeType};base64,${base64}`;
}

// ─── Upload ───────────────────────────────
export const uploadImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      throw new BadRequestError('No image file provided');
    }

    const isGuest = !req.userId;
    logger.info(`[Upload] Started for ${isGuest ? 'GUEST' : `user ${req.userId}`}`);

    // ── Step 1: Compress image BEFORE uploading to Cloudinary ────────────────
    // Raw multer file → sharp → 1024px / JPEG 85q → smaller Cloudinary URL
    // This reduces payload to Gemini from potentially 4-8MB down to ~200KB.
    console.time('[Upload] Sharp compression');
    let uploadPath = req.file.path; // default: use raw file if compression fails
    let compressedPath: string | null = null;
    try {
      const processed = await processUploadedImage(req.file.path);
      compressedPath = processed.path;
      uploadPath = compressedPath;
      logger.info(`[Upload] Compression OK: ${processed.width}x${processed.height} ${processed.format}`);
    } catch (compressErr: any) {
      logger.warn(`[Upload] Compression failed (using raw file): ${compressErr.message}`);
    }
    console.timeEnd('[Upload] Sharp compression');

    // ── Step 2: Upload compressed file to Cloudinary ─────────────────────────
    console.time('[Upload] Cloudinary upload');
    const cloudResult = await uploadToCloudinary(uploadPath, 'ai-interior/originals');
    console.timeEnd('[Upload] Cloudinary upload');

    // ── Step 3: Cleanup both temp files ──────────────────────────────────────
    deleteFile(req.file.path);
    if (compressedPath && compressedPath !== req.file.path) {
      deleteFile(compressedPath);
    }

    // ── Guest mode: skip DB, return Cloudinary URL directly ───────────────
    if (isGuest) {
      logger.info(`[Upload] Guest upload — Cloudinary OK, no DB project created`);
      res.status(201).json({
        success: true,
        data: {
          projectId: null,           // No DB project for guests
          originalImageUrl: cloudResult.url,
          cloudinaryPublicId: cloudResult.publicId,
          status: 'UPLOADED',
          guestMode: true,
        },
      });
      return;
    }

    // ── Authenticated: create DB project ──────────────────────────────────
    const project = await prisma.project.create({
      data: {
        userId: req.userId!,
        originalImageUrl: cloudResult.url,
        originalPublicId: cloudResult.publicId,
        status: 'UPLOADED',
      },
    });

    logger.info(`[Upload] Project created: ${project.id} by user ${req.userId}`);

    res.status(201).json({
      success: true,
      data: {
        projectId: project.id,
        originalImageUrl: project.originalImageUrl,
        status: project.status,
        guestMode: false,
      },
    });
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    next(error);
  }
};

// ─── NEW: Upload Base64 Image ─────────────────
/**
 * Handle base64 image upload (no Cloudinary roundtrip for input)
 * Clients compress locally → send base64 → backend stores base64 directly
 * Cloudinary is only used for FINAL generated images
 */
export const uploadImageBase64 = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('[Upload Base64] Request received', {
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      base64Length: req.body?.imageBase64?.length || 0,
      mimeType: req.body?.mimeType,
      hasUserId: !!req.userId,
    });

    const parsed = base64Schema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn('[Upload Base64] Validation failed:', parsed.error.issues);
      throw new BadRequestError(
        parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', ')
      );
    }

    const { imageBase64, mimeType } = parsed.data;
    const isGuest = !req.userId;

    logger.info(
      `[Upload Base64] Started for ${isGuest ? 'GUEST' : `user ${req.userId}`}`
    );

    // ── SKIP Cloudinary for input — store base64 directly in DB ──────────────
    // This is the KEY optimization: no Cloudinary roundtrip on input!
    const imageDataUri = `data:${mimeType};base64,${imageBase64}`;

    // ── Guest mode: skip DB, return base64 directly ────────────────────────
    if (isGuest) {
      logger.info('[Upload Base64] Guest upload — no DB project created');
      res.status(201).json({
        success: true,
        data: {
          projectId: null,
          originalImageUrl: imageDataUri, // Send back as originalImageUrl for consistency with generation endpoints
          status: 'UPLOADED',
          guestMode: true,
        },
      });
      return;
    }

    // ── Authenticated: create DB project with base64 reference ──────────────
    const project = await prisma.project.create({
      data: {
        userId: req.userId!,
        originalImageUrl: imageDataUri, // Store data URI for retrieval
        originalPublicId: 'base64-local', // Mark as base64, not Cloudinary
        status: 'UPLOADED',
      },
    });

    logger.info(
      `[Upload Base64] Project created: ${project.id}, user: ${req.userId}`
    );

    res.status(201).json({
      success: true,
      data: {
        projectId: project.id,
        originalImageUrl: imageDataUri, // Consistent field naming
        status: project.status,
        guestMode: false,
      },
    });
  } catch (error) {
    logger.error('[Upload Base64] Error:', error);
    next(error);
  }
};


// ─── Generate Previews ────────────────────
export const generatePreviewImages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = previewSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '));
    }
    const { projectId, styles: requestedStyles, roomType, customPrompt, modelName, modelId, intensity } = parsed.data;

    const isGuest = !req.userId;
    const isFree = isFreeProvider(modelName);

    // ═════════════════════════════════════════════════════════════════════════
    // Resolve model configuration (for previews, use 1 credit by default)
    // ═════════════════════════════════════════════════════════════════════════
    let selectedModel = null;
    let modelApiName = modelName;
    
    if (modelId && modelId.trim()) {
      try {
        selectedModel = getModelById(modelId);
        modelApiName = selectedModel.apiModelName;
        logger.info(`[Preview] Model selected: ${selectedModel.displayName}`);
      } catch (error: any) {
        logger.warn(`[Preview] Invalid modelId "${modelId}": ${error.message}`);
        throw new BadRequestError(`Invalid model: ${error.message}`);
      }
    }

    // ── Resolve source image URL ──────────────────────────────────────────────
    // Guests pass EITHER originalImageUrl OR imageBase64 (no DB project)
    let originalImageUrl: string;
    if (isGuest) {
      // For guests: accept either Cloudinary URL or base64 image data
      const { originalImageUrl: urlFromBody, imageBase64, mimeType } = req.body;
      
      if (imageBase64) {
        // Convert base64 to data URI for AI providers
        originalImageUrl = base64ToDataUri(imageBase64, mimeType);
        logger.info(`[Preview] GUEST mode — using base64 image data (${mimeType})`);
      } else if (urlFromBody) {
        originalImageUrl = urlFromBody;
        logger.info(`[Preview] GUEST mode — using direct image URL`);
      } else {
        throw new BadRequestError('Either originalImageUrl or imageBase64 is required for guest mode');
      }
    } else {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) throw new NotFoundError('Project not found');
      if (project.userId !== req.userId) throw new ForbiddenError('Access denied to this project');
      originalImageUrl = project.originalImageUrl;

      const creditState = await getCurrentCreditState(req.userId!);
      if (creditState.totalCredits < 1) {
        logger.warn(`[ADMIN_ALERT] Credits exhausted for user ${req.userId} on preview generation`);
        throw new AppError('Credits exhausted. Please top up your paid credits or wait for free refill.', 402);
      }

      await prisma.project.update({ where: { id: projectId }, data: { status: 'PREVIEWING', roomType } });
    }

    const styleNames: string[] = requestedStyles || ['minimalism', 'modern', 'scandinavian'];
    const stylesToGenerate = styleNames
      .map((name: string) => getStyleByName(name))
      .filter(Boolean) as NonNullable<ReturnType<typeof getStyleByName>>[];

    if (stylesToGenerate.length === 0) throw new BadRequestError('No valid styles provided');

    logger.info(`[Preview] Starting AI preview ${isGuest ? '(GUEST)' : `for project ${projectId}`}, styles: ${stylesToGenerate.map(s => s.name).join(', ')}, model: ${selectedModel?.displayName || 'default'}`);

    let results;
    try {
      results = await generateMultipleDesignPreviews(originalImageUrl, stylesToGenerate, roomType, customPrompt, modelApiName, intensity);
    } catch (genError: any) {
      logger.error(`[Preview] generateMultipleDesignPreviews failed: ${genError.message}`);
      if (!isGuest && projectId) {
        await prisma.project.update({ where: { id: projectId }, data: { status: 'FAILED' } }).catch(() => { });
      }
      const statusCode = genError.statusCode || 500;
      const errorCode = statusCode === 503 ? 'AI_BILLING' : 'AI_FAILED';
      if (statusCode === 503) {
        logger.warn(`[ADMIN_ALERT] AI billing/API key issue on preview for user ${req.userId || 'guest'}`);
      }
      res.status(statusCode).json({ success: false, error: genError.message, code: errorCode });
      return;
    }

    if (results.length === 0) {
      if (!isGuest && projectId) {
        await prisma.project.update({ where: { id: projectId }, data: { status: 'FAILED' } }).catch(() => { });
      }
      res.status(500).json({ success: false, error: 'Could not generate any designs.' });
      return;
    }

    // ── Guest: return results without saving to DB ────────────────────────────
    if (isGuest) {
      logger.info(`[Preview] GUEST — ${results.length} previews generated (not saved to DB)`);
      res.status(200).json({
        success: true,
        data: {
          projectId: null,
          previews: results.map(r => ({ styleName: r.styleName, imageUrl: r.imageUrl })),
          creditsRemaining: 9999,
          isFree: true,
          guestMode: true,
        },
      });
      return;
    }

    // ── Authenticated: save to DB + deduct credits ────────────────────────────
    const savedImages = await Promise.all(
      results.map((r) =>
        prisma.generatedImage.create({
          data: {
            projectId: projectId!,   // safe: auth path only (isGuest=false)
            styleName: r.styleName,
            imageUrl: r.imageUrl,
            publicId: r.publicId,
            imageType: 'PREVIEW',
            prompt: r.prompt,
            modelUsed: selectedModel?.displayName || r.modelUsed || 'default',
          },
        })
      )
    );


    const updatedUser = await prisma.user.update({
      where: { id: req.userId! },
      data: { credits: { decrement: 1 } },
    });
    const creditsRemaining = updatedUser.credits;
    const freeCreditsRemaining = Math.min(DAILY_FREE_CREDITS, creditsRemaining);
    const paidCreditsRemaining = Math.max(0, creditsRemaining - DAILY_FREE_CREDITS);

    logger.info(`[Preview] Generated ${savedImages.length} previews ${isFree ? '(FREE)' : '(PAID)'}, model: ${selectedModel?.displayName || 'default'}`);
    await prisma.project.update({ where: { id: projectId }, data: { status: 'PREVIEWING' } });

    res.status(200).json({
      success: true,
      data: {
        projectId,
        previews: savedImages.map((img: any) => ({ id: img.id, styleName: img.styleName, imageUrl: img.imageUrl })),
        creditsRemaining,
        freeCreditsRemaining,
        paidCreditsRemaining,
        possibleGenerations: creditsRemaining,
        isFree,
        guestMode: false,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ─── Generate Final ───────────────────────
export const generateFinalImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = finalSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '));
    }
    const { projectId, styleName, roomType, additionalInstructions, customPrompt, modelName, aiProvider, modelId, intensity } = parsed.data;

    const style = getStyleByName(styleName);
    if (!style) throw new BadRequestError(`Style "${styleName}" not found`);

    const isGuest = !req.userId;

    // ══════════════════════════════════════════════════════════════════════════
    // STEP 1: Resolve Model Configuration (NEW)
    // ══════════════════════════════════════════════════════════════════════════
    let selectedModel = null;
    let modelApiName = modelName;     // Fallback to legacy modelName
    let creditCost = 1;               // Default: 1 credit if no model selected
    
    if (modelId && modelId.trim()) {
      try {
        selectedModel = getModelById(modelId);
        modelApiName = selectedModel.apiModelName;
        creditCost = selectedModel.creditCost;
        logger.info(`[Final] Model selected: ${selectedModel.displayName} (${creditCost} credits)`);
      } catch (error: any) {
        logger.warn(`[Final] Invalid modelId "${modelId}": ${error.message}`);
        throw new BadRequestError(`Invalid model: ${error.message}`);
      }
    }

    // ─── Resolve source image ──────────────────────────────────────────────────
    let originalImageUrl: string;
    if (isGuest) {
      // For guests: accept either Cloudinary URL or base64 image data
      const { originalImageUrl: urlFromBody, imageBase64, mimeType } = req.body;
      
      if (imageBase64) {
        // Convert base64 to data URI for AI providers
        originalImageUrl = base64ToDataUri(imageBase64, mimeType);
        logger.info(`[Final] GUEST mode — using base64 image data (${mimeType}), style: ${styleName}, model: ${selectedModel?.displayName || 'default'}`);
      } else if (urlFromBody) {
        originalImageUrl = urlFromBody;
        logger.info(`[Final] GUEST mode — style: ${styleName}, model: ${selectedModel?.displayName || 'default'}`);
      } else {
        throw new BadRequestError('Either originalImageUrl or imageBase64 is required for guest mode');
      }
      
      // Guests don't need credit check
    } else {
      // ═════════════════════════════════════════════════════════════════════════
      // STEP 2: Pre-Check — Verify User Has Sufficient Credits (NEW)
      // ═════════════════════════════════════════════════════════════════════════
      try {
        const preCheckResult = await checkCreditsAvailable(req.userId!, selectedModel || { creditCost } as any);
        
        if (!preCheckResult.hasEnoughCredits) {
          logger.warn(
            `[ADMIN_ALERT] Insufficient credits for user ${req.userId}: ` +
            `${preCheckResult.currentCredits} available, ${preCheckResult.requiredCredits} required`
          );
          throw new AppError(
            `Insufficient credits. ${preCheckResult.message} Upgrade your account to generate more designs.`,
            402
          );
        }
        logger.info(`[Final] Pre-check PASSED for user ${req.userId}: ${preCheckResult.message}`);
      } catch (error: any) {
        if (error.statusCode === 402) throw error;
        logger.error(`[Final] Pre-check error: ${error.message}`);
        throw error;
      }

      // ─── Continue with authenticated user ──────────────────────────────────
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) throw new NotFoundError('Project not found');
      if (project.userId !== req.userId) throw new ForbiddenError('Access denied to this project');
      originalImageUrl = project.originalImageUrl;

      await prisma.project.update({ where: { id: projectId }, data: { status: 'GENERATING', style: styleName } });
    }

    const isFree = isFreeProvider(modelName);
    logger.info(
      `[Final] Generating — style: ${styleName} ${isGuest ? '(GUEST)' : `project: ${projectId}`} ` +
      `${isFree ? '(FREE)' : '(PAID)'} aiProvider: ${aiProvider || 'default'} creditCost: ${creditCost}` +
      (intensity !== undefined ? ` intensity: ${intensity}%` : '')
    );

    // Build final additional instructions incorporating intensity
    let finalInstructions = additionalInstructions || '';
    if (intensity !== undefined) {
      const strengthInfo = getStrengthFromIntensity(intensity);
      const intensityNote = `\n\n[DESIGN INTENSITY: ${intensity}%]\n${strengthInfo.intensityDescription}`;
      finalInstructions = finalInstructions ? finalInstructions + intensityNote : intensityNote;
    }

    // ════════════════════════════════════════════════════════════════════════════
    // STEP 3: Call AI Provider for Generation (with retry + fallback)
    // ════════════════════════════════════════════════════════════════════════════
    let result;
    let usedProvider = aiProvider || modelApiName;
    
    try {
      result = await generateDesign(
        'final',
        originalImageUrl,
        style,
        roomType,
        finalInstructions,
        customPrompt,
        modelApiName,    // Use the resolved API model name
        aiProvider
      );
    } catch (genError: any) {
      // ── 503 Error: Try fallback to free provider ───────────────────────────
      if (genError.statusCode === 503 && aiProvider) {
        logger.warn(`[Final] Provider "${aiProvider}" returned 503 (overloaded). Trying fallback providers...`);

        // Quick retry for transient overloads/timeouts before switching providers.
        try {
          logger.info(`[Final] Retrying provider "${aiProvider}" once after short backoff...`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          result = await generateDesign(
            'final',
            originalImageUrl,
            style,
            roomType,
            finalInstructions,
            customPrompt,
            modelApiName,
            aiProvider
          );
          logger.info(`[Final] ✓ Retry on "${aiProvider}" succeeded!`);
        } catch (retryError: any) {
          genError = retryError;
          logger.warn(`[Final] Retry on "${aiProvider}" failed: ${retryError.message}`);
        }
        
        // If retry still fails, use configured img2img-capable providers only.
        const fallbackProviders = ['segmind', 'fal', 'gemini']
          .filter((provider) => provider !== aiProvider)
          .filter((provider) => isProviderConfigured(provider));
        let fallbackResult = null;

        if (!result && fallbackProviders.length === 0) {
          logger.warn('[Final] No configured fallback providers available.');
        }
        
        for (const fallbackProvider of fallbackProviders) {
          if (result) break;
          if (fallbackProvider === aiProvider) continue; // Skip the one that failed
          
          try {
            logger.info(`[Final] Attempting fallback to provider: "${fallbackProvider}"`);
            fallbackResult = await generateDesign(
              'final',
              originalImageUrl,
              style,
              roomType,
              finalInstructions,
              customPrompt,
              modelApiName,
              fallbackProvider  // Use fallback
            );
            usedProvider = fallbackProvider;
            logger.info(`[Final] ✓ Fallback to "${fallbackProvider}" succeeded!`);
            result = fallbackResult;
            break; // Success! Use this result
          } catch (fallbackError: any) {
            logger.warn(`[Final] Fallback to "${fallbackProvider}" also failed: ${fallbackError.message}`);
            continue;
          }
        }
        
        // If all fallbacks failed, throw original error
        if (!result) {
          logger.error(`[Final] All providers failed. Original: ${genError.message}`);
          throw genError;
        }
      } else {
        // Not a 503 error or already a fallback attempt — log and throw
        logger.error(`[Final] generateDesign failed: ${genError.message}`);
        throw genError;
      }
    }
    
    // Update project status if it failed
    if (!result) {
      if (!isGuest && projectId) {
        await prisma.project.update({ where: { id: projectId }, data: { status: 'FAILED' } }).catch(() => { });
      }
      throw new AppError('Generation failed after trying all providers', 503);
    }

    // ─── Guest: return directly without DB ────────────────────────────────────
    if (isGuest) {
      logger.info(`[Final] GUEST complete — result: ${result.imageUrl}`);
      res.status(200).json({
        success: true,
        data: {
          projectId: null,
          styleName,
          finalImageUrl: result.imageUrl,
          originalImageUrl,
          status: 'COMPLETED',
          creditsRemaining: 9999,
          isFree: true,
          guestMode: true,
          modelUsed: selectedModel?.displayName || 'default',
        },
      });
      return;
    }

    // ════════════════════════════════════════════════════════════════════════════
    // STEP 4: Save to Database (Image + Project)
    // ════════════════════════════════════════════════════════════════════════════
    const savedImage = await prisma.generatedImage.create({
      data: {
        projectId: projectId!,
        styleName: result.styleName,
        imageUrl: result.imageUrl,
        publicId: result.publicId,
        imageType: 'FINAL',
        prompt: result.prompt,
        modelUsed: selectedModel?.displayName || result.modelUsed || 'default',
      },
    });

    // ════════════════════════════════════════════════════════════════════════════
    // STEP 5: Deduct Credits (ONLY after successful generation and DB save)
    // ════════════════════════════════════════════════════════════════════════════
    let creditsRemaining = 0;
    try {
      creditsRemaining = await deductCredits(req.userId!, selectedModel || { creditCost } as any);
      logger.info(
        `[Final] Credits deducted for user ${req.userId}: ${creditCost} credits. ` +
        `Balance: ${creditsRemaining}`
      );
    } catch (deductError: any) {
      // If deduction fails, we still show success (image was generated and saved)
      // This prevents losing the generated image due to DB issues
      logger.error(`[Final] Credit deduction failed, but image was saved: ${deductError.message}`);
      const currentState = await getUserCreditState(req.userId!);
      creditsRemaining = currentState.totalCredits;
    }

    // ════════════════════════════════════════════════════════════════════════════
    // STEP 6: Return Success Response with Updated Credits
    // ════════════════════════════════════════════════════════════════════════════
    const creditState = await getUserCreditState(req.userId!);
    
    logger.info(`[Final] Completed — project ${projectId} model: ${selectedModel?.displayName || 'default'}`);
    await prisma.project.update({ where: { id: projectId }, data: { status: 'COMPLETED' } });

    res.status(200).json({
      success: true,
      data: {
        projectId,
        styleName,
        finalImageUrl: savedImage.imageUrl,
        originalImageUrl,
        status: 'COMPLETED',
        creditsRemaining,
        freeCreditsRemaining: creditState.freeCredits,
        paidCreditsRemaining: creditState.paidCredits,
        possibleGenerations: creditsRemaining,
        isFree,
        guestMode: false,
        modelUsed: selectedModel?.displayName || 'default',
        creditCostUsed: creditCost,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ─── History ──────────────────────────────
export const getHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    // Fixed N+1: use include to fetch images + prompts + likes in one query; filter soft-deleted projects
    const projects = await prisma.project.findMany({
      where: {
        userId: req.userId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        generatedImages: {
          orderBy: { createdAt: 'desc' },
        },
        promptHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get the most recent prompt only
        },
        likes: {
          where: { userId: req.userId },
          select: { userId: true },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    const data = projects.map((p: any) => ({
      id: p.id,
      originalImageUrl: p.originalImageUrl,
      finalImageUrl: p.generatedImages.find((img: any) => img.imageType === 'FINAL')?.imageUrl || null,
      style: p.style,
      styleName: p.style,
      roomType: p.roomType,
      status: p.status,
      previewCount: p.generatedImages.filter((img: any) => img.imageType === 'PREVIEW').length,
      previewImages: p.generatedImages
        .filter((img: any) => img.imageType === 'PREVIEW')
        .map((img: any) => ({
          id: img.id,
          styleName: img.styleName,
          imageUrl: img.imageUrl,
        })),
      finalImage: p.generatedImages.find((img: any) => img.imageType === 'FINAL') ? {
        id: p.generatedImages.find((img: any) => img.imageType === 'FINAL').id,
        imageUrl: p.generatedImages.find((img: any) => img.imageType === 'FINAL').imageUrl,
        prompt: p.generatedImages.find((img: any) => img.imageType === 'FINAL').prompt,
      } : null,
      lastPrompt: p.promptHistory[0]?.prompt || null,
      isLiked: p.likes.length > 0,
      likeCount: p._count.likes,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ─── Project Detail ───────────────────────
export const getProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params.id as string;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { 
        generatedImages: true,
        _count: { select: { likes: true } },
        likes: { where: { userId: req.userId } }
      },
    });

    if (!project) throw new NotFoundError('Project not found');
    if (project.userId !== req.userId) throw new ForbiddenError('Access denied to this project');

    res.status(200).json({
      success: true,
      data: {
        id: project.id,
        originalImageUrl: project.originalImageUrl,
        finalImageUrl: project.generatedImages.find((img: any) => img.imageType === 'FINAL')?.imageUrl || null,
        style: project.style,
        status: project.status,
        previewImages: project.generatedImages
          .filter((img: any) => img.imageType === 'PREVIEW')
          .map((img: any) => ({
            id: img.id,
            styleName: img.styleName,
            imageUrl: img.imageUrl,
          })),
        likeCount: project._count.likes,
        isLiked: project.likes.length > 0,
        createdAt: project.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Project (Soft Delete) ─────────
export const deleteImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) throw new NotFoundError('Project not found');
    if (project.userId !== req.userId) throw new ForbiddenError('Access denied');

    // Soft delete — preserve data for audit trail
    await prisma.project.update({
      where: { id: projectId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    logger.info(`[Delete] Project ${projectId} soft-deleted by user ${req.userId}`);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Styles ───────────────────────────────
export const getStyles = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const styles = getAllStyles().map((s) => ({
      name: s.name,
      displayName: s.displayName,
      description: s.description,
      colorPalette: s.colorPalette,
      materials: s.materials,
    }));

    res.status(200).json({ success: true, data: styles });
  } catch (error) {
    next(error);
  }
};

// ─── Get Available AI Models ───────────────────────
export const getModels = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const models = AVAILABLE_MODELS.map((m) => ({
      id: m.id,
      displayName: m.displayName,
      description: m.description,
      provider: m.provider,
      creditCost: m.creditCost,
      speed: m.speed,
      quality: m.quality,
      icon: m.icon,
    }));

    logger.info('[Models] Sent model configuration to client');
    res.status(200).json({ success: true, data: models });
  } catch (error) {
    next(error);
  }
};

// ─── Share Project ────────────────────────
export const shareImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId } = req.body;

    if (!projectId) throw new BadRequestError('Project ID is required');

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project not found');
    if (project.userId !== req.userId) throw new ForbiddenError('Access denied');

    let shareToken = project.shareToken;
    if (!shareToken) {
      shareToken = uuidv4();
      await prisma.project.update({
        where: { id: projectId },
        data: { shareToken, isPublic: true },
      });
    }

    const finalImage = await prisma.generatedImage.findFirst({
      where: { projectId, imageType: 'FINAL' },
    });

    res.status(200).json({
      success: true,
      data: {
        shareUrl: `/shared/${shareToken}`,
        shareToken,
        projectId,
        imageUrl: finalImage?.imageUrl || project.originalImageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Public Shared Project ────────────────
export const getSharedProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.params.token as string;

    // Fixed N+1: fetch project + user + images in efficient queries
    const project = await prisma.project.findFirst({
      where: { shareToken: token, isPublic: true },
      include: {
        generatedImages: true,
        user: { select: { username: true } },
      },
    });

    if (!project) throw new NotFoundError('Shared project not found');

    res.status(200).json({
      success: true,
      data: {
        id: project.id,
        originalImageUrl: project.originalImageUrl,
        finalImageUrl: project.generatedImages.find((img) => img.imageType === 'FINAL')?.imageUrl || null,
        style: project.style,
        author: project.user?.username || 'Unknown',
        createdAt: project.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Community Feed ───────────────────────
export const getCommunityFeed = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Fixed N+1: single query with includes instead of N+1 nested queries
    const projects = await prisma.project.findMany({
      where: { isPublic: true, status: 'COMPLETED', isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        generatedImages: {
          where: { imageType: 'FINAL' },
          take: 1,
        },
        user: { select: { username: true } },
      },
    });

    const feed = projects.map((p: any) => ({
      id: p.id,
      originalImageUrl: p.originalImageUrl,
      finalImageUrl: p.generatedImages[0]?.imageUrl || null,
      style: p.style,
      author: p.user?.username || 'Unknown',
      createdAt: p.createdAt,
    }));

    res.status(200).json({ success: true, data: feed });
  } catch (error) {
    next(error);
  }
};

// ─── User Credits ─────────────────────────
export const getUserCredits = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const creditState = await getCurrentCreditState(req.userId!);

    res.status(200).json({ 
      success: true, 
      data: { 
        credits: creditState.totalCredits,
        freeCredits: creditState.freeCredits,
        paidCredits: creditState.paidCredits,
        possibleGenerations: creditState.totalCredits,
        nextRefillAt: creditState.nextRefillAt.toISOString()
      } 
    });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle Like ──────────────────────────
export const toggleLike = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const userId = req.userId!;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project not found');

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_projectId: { userId, projectId }
      }
    });

    let isLiked = false;
    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      isLiked = false;
    } else {
      await prisma.like.create({ data: { userId, projectId } });
      isLiked = true;
    }

    const likeCount = await prisma.like.count({ where: { projectId } });

    res.status(200).json({ success: true, data: { isLiked, likeCount } });
  } catch (error) {
    next(error);
  }
};

// ─── AI Room Analysis ──────────────────────
const analyzeSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().min(100).optional(),  // Support base64 images (NEW)
  mimeType: z.enum(['image/jpeg', 'image/png']).optional().default('image/jpeg'), // For base64 images
});

export const analyzeRoomImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '));
    }

    const { imageUrl: urlFromBody, imageBase64, mimeType } = parsed.data;
    
    // Support both URL and base64
    let imageUrl: string;
    if (imageBase64) {
      imageUrl = base64ToDataUri(imageBase64, mimeType);
      logger.info(`[Analysis] Starting room analysis for base64 image (${mimeType})`);
    } else if (urlFromBody) {
      imageUrl = urlFromBody;
      logger.info(`[Analysis] Starting room analysis for image: ${imageUrl}`);
    } else {
      throw new BadRequestError('Either imageUrl or imageBase64 is required');
    }

    const analysis = await analyzeRoom(imageUrl);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

// ─── AI Prompt Suggestion ─────────────────
const suggestPromptSchema = z.object({
  roomType: z.string().min(1, 'Room type is required'),
  styleName: z.string().min(1, 'Style name is required'),
});

// ─── Advanced Prompt Generation Schema ────────────────
const advancedPromptSchema = z.object({
  style: z.string().min(1, 'Style is required'),
  styleName: z.string().min(1, 'Style name is required'),
  intensity: z.number().min(0).max(100, 'Intensity must be 0-100'),
  colorPalette: z.object({
    name: z.string(),
    colors: z.array(z.string()),
  }).nullable().optional(),
  removals: z.object({
    furniture: z.boolean(),
    decor: z.boolean(),
    electronics: z.boolean(),
    emptyRoom: z.boolean(),
  }).optional(),
  roomType: z.string().optional(),
  additionalContext: z.string().optional(),
});

// ─── Get Liked Projects ───────────────────
export const getLikedProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const likedProjects = await prisma.project.findMany({
      where: {
        likes: {
          some: { userId: req.userId }
        },
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        generatedImages: true,
        _count: { select: { likes: true } },
        likes: { where: { userId: req.userId } }
      },
    });

    const data = likedProjects.map((p: any) => ({
      id: p.id,
      originalImageUrl: p.originalImageUrl,
      finalImageUrl: p.generatedImages.find((img: any) => img.imageType === 'FINAL')?.imageUrl || null,
      style: p.style,
      styleName: p.style,
      roomType: p.roomType,
      status: p.status,
      likeCount: p._count.likes,
      isLiked: p.likes.length > 0,
      createdAt: p.createdAt,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ─── Get Prompt History ───────────────────
export const getPromptHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const prompts = await prisma.promptHistory.findMany({
      where: {
        project: {
          userId: req.userId,
          isDeleted: false,
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Last 50 prompts
      include: {
        project: {
          select: {
            id: true,
            originalImageUrl: true,
            style: true,
            roomType: true,
          }
        }
      }
    });

    const data = prompts.map((p: any) => ({
      id: p.id,
      prompt: p.prompt,
      styleName: p.styleName,
      roomType: p.roomType,
      projectId: p.projectId,
      createdAt: p.createdAt,
      projectImage: p.project?.originalImageUrl,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ─── Get User Preferences Summary ──────────
export const getUserSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    // Get all user projects
    const projects = await prisma.project.findMany({
      where: {
        userId: req.userId,
        isDeleted: false,
      },
      include: {
        generatedImages: true,
        _count: { select: { likes: true } }
      }
    });

    const styles = projects
      .filter(p => p.style)
      .reduce((acc: Record<string, number>, p) => {
        acc[p.style!] = (acc[p.style!] || 0) + 1;
        return acc;
      }, {});

    const roomTypes = projects
      .filter(p => p.roomType)
      .reduce((acc: Record<string, number>, p) => {
        acc[p.roomType!] = (acc[p.roomType!] || 0) + 1;
        return acc;
      }, {});

    const totalProjects = projects.length;
    const totalLikes = projects.reduce((sum, p) => sum + p._count.likes, 0);
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;

    // Get most used styles and rooms
    const topStyles = Object.entries(styles)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const topRooms = Object.entries(roomTypes)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        completedProjects,
        totalLikes,
        topStyles,
        topRooms,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const suggestRoomPrompt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = suggestPromptSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '));
    }

    const { roomType, styleName } = parsed.data;
    const style = getStyleByName(styleName);
    if (!style) throw new BadRequestError(`Style "${styleName}" not found`);

    logger.info(`[PromptGen] Generating prompt for ${roomType} in style ${styleName}`);

    const recommendedPrompt = await suggestPrompt(roomType, style);

    res.status(200).json({
      success: true,
      data: {
        prompt: recommendedPrompt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Generate Advanced AI Prompt ──────────────────────
export const generateAdvancedPrompt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = advancedPromptSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '));
    }

    const {
      style,
      styleName,
      intensity,
      colorPalette,
      removals,
      roomType,
      additionalContext,
    } = parsed.data;

    logger.info(`[AdvancedPromptGen] Generating prompt: ${styleName}, intensity: ${intensity}%`);

    // Use Groq to generate the prompt
    const { GroqService } = await import('../services/groq.service.js');
    const generatedPrompt = await GroqService.generateAdvancedDesignPrompt({
      style,
      styleName,
      intensity,
      colorPalette: colorPalette || undefined,
      removals,
      roomType,
      additionalContext,
    });

    res.status(200).json({
      success: true,
      data: generatedPrompt,
    });
  } catch (error) {
    logger.error('[AdvancedPromptGen] Error:', error);
    next(error);
  }
};

