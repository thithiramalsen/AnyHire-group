import express from 'express';
import { updateOverallStatus, getOverallStatusAnalytics, updateAllOverallStatuses } from '../controllers/overallStatus.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Update overall status for a specific job/booking
router.post('/update/:jobId/:bookingId?', protectRoute, adminRoute, updateOverallStatus);

// Update overall status for all existing bookings
router.post('/update-all', protectRoute, adminRoute, updateAllOverallStatuses);

// Get overall status analytics
router.get('/analytics', protectRoute, adminRoute, getOverallStatusAnalytics);

export default router; 