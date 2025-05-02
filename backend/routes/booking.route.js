import express from "express";
import * as Bookings from "../controllers/booking.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
    applyForJob,
    updateBookingStatus,
    getUserBookings,
    getBookingById,
    getJobBookings
} from '../controllers/booking.controller.js';

const router = express.Router();

// Apply for a job (creates booking)
router.post('/apply/:jobId', protectRoute, applyForJob);

// Update booking status (accept/decline/progress/complete)
router.patch('/:id/status', protectRoute, updateBookingStatus);

// Get all bookings for logged-in user (both as seeker and poster)
router.get('/me', protectRoute, getUserBookings);

// Get single booking by ID
router.get('/:id', protectRoute, getBookingById);

// Get all bookings for a specific job (poster only)
router.get('/job/:jobId', protectRoute, getJobBookings);

export default router;