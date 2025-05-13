import express from 'express';
import { 
    calculateCustomerOfMonth, 
    getCustomerOfMonth, 
    validateDiscountCode,
    getAllAwards,
    getMyAwards,
    calculateCustomerOfDay,
    getCustomerOfDay,
    getTopSeekerOfMonth,
    getTopSeekerOfDay,
    calculateTopSeekerOfMonth,
    calculateTopSeekerOfDay
} from '../controllers/awards.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js'; 

const router = express.Router();

// Admin routes
router.post('/customer-of-month/calculate', protectRoute, adminRoute, calculateCustomerOfMonth);
router.post('/customer-of-day/calculate', protectRoute, adminRoute, calculateCustomerOfDay);
router.post('/seeker-of-month/calculate', protectRoute, adminRoute, calculateTopSeekerOfMonth);
router.post('/seeker-of-day/calculate', protectRoute, adminRoute, calculateTopSeekerOfDay);
router.get('/all', protectRoute, adminRoute, getAllAwards);

// User routes
router.get('/my-awards', protectRoute, getMyAwards);

// Public routes
router.get('/customer-of-month/:year/:month', getCustomerOfMonth);
router.get('/customer-of-day/:year/:month/:day', getCustomerOfDay);
router.get('/seeker-of-month/:year/:month', getTopSeekerOfMonth);
router.get('/seeker-of-day/:year/:month/:day', getTopSeekerOfDay);
router.post('/validate-discount', protectRoute, validateDiscountCode);

export default router; 