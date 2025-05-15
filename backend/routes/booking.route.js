import express from "express";
import * as Bookings from "../controllers/booking.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
    applyForJob,
    updateBookingStatus,
    getUserBookings,
    getBookingById,
    getJobBookings,
    getMyApplications,
    getAllBookings,
    updateBookingStatusAdmin,
    deleteBooking
} from '../controllers/booking.controller.js';

const router = express.Router();

// Admin route to get all bookings
router.get('/', protectRoute, adminRoute, getAllBookings);

// Apply for a job (creates booking)
router.post('/apply/:jobId', protectRoute, applyForJob);

// Update booking status (accept/decline/progress/complete)
router.patch('/:id/status', protectRoute, updateBookingStatus);

// Add this new route for admin to update booking status
router.patch('/admin/:bookingId/status', protectRoute, adminRoute, updateBookingStatusAdmin);

// Add this line for admin delete
router.delete('/admin/:id', protectRoute, adminRoute, deleteBooking);

// Get all bookings for logged-in user (both as seeker and poster)
router.get('/me', protectRoute, getUserBookings);

// Get user's applications (as a job seeker)
router.get('/my-applications', protectRoute, getMyApplications);

// Get single booking by ID
router.get('/:id', protectRoute, getBookingById);

// Get all bookings for a specific job (poster only)
router.get('/job/:jobId', protectRoute, getJobBookings);

export default router;