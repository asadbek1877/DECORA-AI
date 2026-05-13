import { Router } from 'express';
import {
    analyzeRoomController,
    recommendStylesController,
    generatePromptController,
    chatController,
    getModelsController,
    removeObjectController,
} from '../controllers/ai.controller';

const router = Router();

// All AI endpoints are public (no auth required — guests can use them too)
// Rate limiting is handled globally

/**
 * POST /api/ai/analyze
 * Body: { imageUrl: string }
 * Analyze room image: type, style, colors, strengths, improvements, score
 */
router.post('/analyze', analyzeRoomController);

/**
 * POST /api/ai/recommend-styles
 * Body: { imageUrl: string }
 * Get scored recommendations for all design styles
 */
router.post('/recommend-styles', recommendStylesController);

/**
 * POST /api/ai/generate-prompt
 * Body: { imageUrl: string, selectedStyle?: string, userInstructions?: string }
 * Generate an optimized AI image generation prompt
 */
router.post('/generate-prompt', generatePromptController);

/**
 * POST /api/ai/chat
 * Body: { imageUrl: string, messages: Message[], newMessage: string }
 * Chat with AI about the room
 */
router.post('/chat', chatController);

/**
 * POST /api/ai/remove-object
 * Body: { imageUrl: string, objectName: string, replacement?: string }
 * Remove or replace object from image
 */
router.post('/remove-object', removeObjectController);

/**
 * GET /api/ai/models
 * Get list of available AI models
 */
router.get('/models', getModelsController);

export default router;
