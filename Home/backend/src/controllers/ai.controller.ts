import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import {
    analyzeRoom,
    recommendStyles,
    generateSmartPrompt,
    chatAboutRoom,
    removeObject,
    ChatMessage,
} from '../services/ai-assistant.service';
import { availableModels } from '../services/ai.service';
import { BadRequestError } from '../utils/errors';
import logger from '../utils/logger';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const imageUrlSchema = z.object({
    imageUrl: z.string().url('Valid image URL is required'),
});

const promptSchema = z.object({
    imageUrl: z.string().url('Valid image URL is required'),
    selectedStyle: z.string().optional(),
    userInstructions: z.string().max(500).optional(),
    modelName: z.string().optional(),
});

const removeObjectSchema = z.object({
    imageUrl: z.string().url('Valid image URL is required'),
    objectName: z.string().min(1, 'Object name is required').max(100),
    replacement: z.string().max(100).optional(),
});

const chatSchema = z.object({
    imageUrl: z.string().url('Valid image URL is required'),
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
        })
    ).default([]),
    newMessage: z.string().min(1, 'Message cannot be empty').max(1000),
    modelName: z.string().optional(),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/ai/analyze
 * Analyze room image and return detailed breakdown
 */
export const analyzeRoomController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const parsed = imageUrlSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new BadRequestError(parsed.error.issues.map(e => e.message).join(', '));
        }

        const { imageUrl } = parsed.data;
        logger.info(`[AI] analyzeRoom request for: ${imageUrl}`);

        const analysis = await analyzeRoom(imageUrl);

        res.status(200).json({ success: true, data: analysis });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/ai/models
 * List available AI models for selection
 */
export const getModelsController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        res.status(200).json({ success: true, data: availableModels });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/ai/recommend-styles
 * Get AI style recommendations with scores
 */
export const recommendStylesController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const parsed = imageUrlSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new BadRequestError(parsed.error.issues.map(e => e.message).join(', '));
        }

        const { imageUrl } = parsed.data;
        logger.info(`[AI] recommendStyles request for: ${imageUrl}`);

        const scores = await recommendStyles(imageUrl);

        res.status(200).json({ success: true, data: scores });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/ai/generate-prompt
 * Generate an optimized AI prompt for image generation
 */
export const generatePromptController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const parsed = promptSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new BadRequestError(parsed.error.issues.map(e => e.message).join(', '));
        }

        const { imageUrl, selectedStyle, userInstructions, modelName } = parsed.data;
        logger.info(`[AI] generatePrompt for style: ${selectedStyle} using model: ${modelName || 'default'}`);

        const prompt = await generateSmartPrompt(imageUrl, selectedStyle, userInstructions, modelName);

        res.status(200).json({ success: true, data: prompt });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/ai/chat
 * Chat with AI about the room image
 */
export const chatController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const parsed = chatSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new BadRequestError(parsed.error.issues.map(e => e.message).join(', '));
        }

        const { imageUrl, messages, newMessage, modelName } = parsed.data;
        logger.info(`[AI] chat message (model: ${modelName || 'default'}): "${newMessage.substring(0, 50)}..."`);

        const reply = await chatAboutRoom(
            imageUrl,
            messages as ChatMessage[],
            newMessage,
            modelName
        );

        res.status(200).json({ success: true, data: { reply } });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/ai/remove-object
 * Remove or replace an object in the room image
 */
export const removeObjectController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const parsed = removeObjectSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new BadRequestError(parsed.error.issues.map(e => e.message).join(', '));
        }

        const { imageUrl, objectName, replacement } = parsed.data;
        logger.info(`[AI] removeObject request for: ${objectName} from ${imageUrl}`);

        const resultUrl = await removeObject(imageUrl, objectName, replacement);

        res.status(200).json({ success: true, data: { imageUrl: resultUrl } });
    } catch (error) {
        next(error);
    }
};
