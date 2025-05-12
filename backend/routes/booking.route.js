import express from 'express';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';
import {
    createBooking,
    getUserBookings,
    getBooking,
    updateBookingStatus,
    deleteBooking,
    getAvailableBookings,
    getAllBookings
} from '../controllers/booking.controller.js';

const router = express.Router();

// Create a new booking
router.post('/', protectRoute, createBooking);

// Get all bookings for the logged-in user
router.get('/user', protectRoute, getUserBookings);

// Get available bookings (in pending status)
router.get('/available', protectRoute, getAvailableBookings);

// Get all bookings (admin only)
router.get('/all', protectRoute, adminRoute, getAllBookings);

// Get a specific booking
router.get('/:id', protectRoute, getBooking);

// Update booking status
router.patch('/:id/status', protectRoute, updateBookingStatus);

// Delete booking (admin only)
router.delete('/:id', protectRoute, deleteBooking);

export default router;