import { Router } from 'express';
const router = Router();
import { getUserAnalytics, getJobsAnalytics, getBookingsAnalytics, getPaymentsAnalytics, getRatingsAnalytics, getSupportAnalytics } from '../controllers/analytics.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';

// All analytics routes require admin authentication
router.use(protectRoute, adminRoute);

// Users analytics
router.get('/users', getUserAnalytics);

// Jobs analytics
router.get('/jobs', getJobsAnalytics);

// Bookings analytics
router.get('/bookings', getBookingsAnalytics);

// Payments analytics
router.get('/payments', getPaymentsAnalytics);

// Ratings analytics
router.get('/ratings', getRatingsAnalytics);

// Support analytics
router.get('/support', getSupportAnalytics);

export default router; 