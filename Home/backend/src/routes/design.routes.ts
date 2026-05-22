import { Router } from 'express';
import {
  uploadImage,
  uploadImageBase64,
  generatePreviewImages,
  generateFinalImage,
  getHistory,
  getProject,
  deleteImage,
  getStyles,
  getModels,
  shareImage,
  getSharedProject,
  getCommunityFeed,
  getUserCredits,
  toggleLike,
  analyzeRoomImage,
  suggestRoomPrompt,
  getLikedProjects,
  getPromptHistory,
  getUserSummary,
  generateAdvancedPrompt,
} from '../controllers/design.controller';
import * as publicDesignController from '../controllers/public-design.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { generateLimiter } from '../middleware/rateLimiter';

const router = Router();

// ─── Public (auth керак эмас) ────────────────────────────
router.get('/styles', getStyles);
router.get('/models', getModels);
router.get('/shared/:token', getSharedProject);
router.get('/community', getCommunityFeed);

// ─── Guest-friendly (optional auth) ─────────────────────
// Guests can upload and generate — no 401 thrown
router.get('/history', optionalAuth, getHistory);
router.post('/upload', optionalAuth, upload.single('image'), uploadImage);
router.post('/upload-base64', optionalAuth, uploadImageBase64);
router.post('/generate-preview', optionalAuth, generateLimiter, generatePreviewImages);
router.post('/generate-final', optionalAuth, generateLimiter, generateFinalImage);
router.post('/analyze-room', optionalAuth, analyzeRoomImage);
router.post('/suggest-prompt', optionalAuth, suggestRoomPrompt);
router.post('/generate-prompt', optionalAuth, generateAdvancedPrompt);

// ─── Auth required for user-specific actions ─────────────
router.get('/project/:id', authenticate, getProject);
router.delete('/image/:id', authenticate, deleteImage);
router.get('/credits', authenticate, getUserCredits);
router.post('/share', authenticate, shareImage);
router.post('/project/:id/like', authenticate, toggleLike);
router.get('/likes', authenticate, getLikedProjects);
router.get('/prompts', authenticate, getPromptHistory);
router.get('/summary', authenticate, getUserSummary);
router.patch('/:id/publish', authenticate, publicDesignController.toggleDesignPublish);

export default router;
