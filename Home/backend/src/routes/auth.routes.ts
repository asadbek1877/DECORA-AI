import { Router } from 'express';
import {
	register,
	login,
	getProfile,
	updateProfile,
	updateProfileInfo,
	updatePassword,
	searchUsers,
	getPublicUserProfile,
	updateProfileShowcase,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { upload } from '../middleware/upload';
import { optionalUpload } from '../middleware/optionalUpload';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, upload.single('image'), updateProfile);
router.put('/profile-info', authenticate, optionalUpload, updateProfileInfo);
router.put('/password', authenticate, updatePassword);
router.get('/users/search', authenticate, searchUsers);
router.get('/users/:id/profile', authenticate, getPublicUserProfile);
router.patch('/profile/showcase', authenticate, updateProfileShowcase);

export default router;
