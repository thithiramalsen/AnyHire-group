import express from 'express';
import { 
    createReview, 
    getUserReviews, 
    getUserAverageRating,
    getAdminReviews,
    deleteReview,
    deleteUserReview // Add this import
} from '../controllers/review.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new review (requires authentication)
router.post('/', protectRoute, createReview);

// Get reviews for a user (either received or given)
router.get('/user/:userId', getUserReviews);

// Get average rating for a user
router.get('/user/:userId/rating', getUserAverageRating);

// Add new user delete route (requires authentication but not admin)
router.delete('/user/:id', protectRoute, deleteUserReview);

// Admin routes
router.get('/admin', protectRoute, adminRoute, getAdminReviews);
router.delete('/:id', protectRoute, adminRoute, deleteReview);

export default router;