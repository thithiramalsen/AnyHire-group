import { Router } from 'express';
import { generateReport, generateUserReport } from '../controllers/reports.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all routes with authentication
router.use(protectRoute);

// Admin-only routes
router.get('/generate', adminRoute, generateReport);

// User-specific report (accessible by admin and the user themselves)
router.get('/user/:userId', generateUserReport);

export default router; 