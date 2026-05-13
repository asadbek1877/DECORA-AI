import { Router } from 'express';
import { getTrialDemos, createTrialDemo, deleteTrialDemo, addTrialDemoVariant, deleteTrialDemoVariant, fetchAllTrialDemosAdmin } from '../controllers/trial.controller';
import { requireAdminSecret } from '../controllers/admin.controller';
import { upload } from '../middleware/upload';

const router = Router();

// Public route for frontend Trail mode
router.get('/', getTrialDemos);

// Admin routes
router.use(requireAdminSecret);
router.get('/admin', fetchAllTrialDemosAdmin);
router.post('/admin', upload.single('image'), createTrialDemo);
router.delete('/admin/:id', deleteTrialDemo);

router.post('/admin/:id/variants', upload.single('image'), addTrialDemoVariant);
router.delete('/admin/variants/:variantId', deleteTrialDemoVariant);

export default router;

