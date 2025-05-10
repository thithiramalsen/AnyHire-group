import express from 'express';
import { 
    createReview, 
    getUserReviews, 
    getUserAverageRating,
    getAdminReviews,
    deleteReview 
} from '../controllers/review.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new review (requires authentication)
router.post('/', protectRoute, createReview);

// Get reviews for a user (either received or given)
router.get('/user/:userId', getUserReviews);

// Get average rating for a user
router.get('/user/:userId/rating', getUserAverageRating);

// Admin routes
router.get('/admin', protectRoute, adminRoute, getAdminReviews);
router.delete('/:id', protectRoute, adminRoute, deleteReview);

export default router; 