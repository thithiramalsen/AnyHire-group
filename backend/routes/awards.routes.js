import express from 'express';
import { 
    calculateCustomerOfMonth, 
    getCustomerOfMonth, 
    validateDiscountCode,
    getAllAwards,
    getMyAwards 
} from '../controllers/awards.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js'; 

const router = express.Router();

// Admin routes
router.post('/customer-of-month/calculate', protectRoute, adminRoute, calculateCustomerOfMonth);
router.get('/all', protectRoute, adminRoute, getAllAwards);

// User routes
router.get('/my-awards', protectRoute, getMyAwards);

// Public routes
router.get('/customer-of-month/:year/:month', getCustomerOfMonth);
router.post('/validate-discount', protectRoute, validateDiscountCode);

export default router; 