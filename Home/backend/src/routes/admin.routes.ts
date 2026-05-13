import { Router } from 'express';
import {
	deleteAdminUser,
	getAdminDashboardData,
	getAdminUserDetail,
	getAdminUsers,
	requireAdminSecret,
	updateAdminUser,
	updateAdminUserCredits,
	updateAdminUserStatus,
	verifyAdmin,
	getAppSettings,
	updateAppSettings
} from '../controllers/admin.controller';

const router = Router();

router.post('/verify', verifyAdmin);
router.get('/settings', getAppSettings); // Public access to settings

router.use(requireAdminSecret);
router.put('/settings', updateAppSettings); // Admin-only access to update settings
router.get('/dashboard', getAdminDashboardData);
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserDetail);
router.patch('/users/:id', updateAdminUser);
router.post('/users/:id/credits', updateAdminUserCredits);
router.post('/users/:id/status', updateAdminUserStatus);
router.delete('/users/:id', deleteAdminUser);

export default router;
