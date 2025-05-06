import express from 'express';
import { 
    initializePayment, 
    uploadPaymentProof, 
    getPaymentByBooking, 
    confirmPayment, 
    upload,
    getAllPayments,
    deletePayment,
    createPaymentForBooking,
    getPaymentProof,
    deleteCustomerPayment,
    updatePaymentStatus,
    completePayment 
} from '../controllers/payment.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all payments (admin only)
router.get('/', protectRoute, adminRoute, getAllPayments);

// Admin delete payment
router.delete('/admin/:paymentId', protectRoute, adminRoute, deletePayment);

// Customer delete payment
router.delete('/:paymentId/customer', protectRoute, deleteCustomerPayment);

// Add this new route for admin to update payment status
router.patch('/admin/:paymentId/status', protectRoute, adminRoute, updatePaymentStatus);

// Add this new route
router.patch('/:paymentId/complete', protectRoute, completePayment);

// Initialize payment
router.post('/initialize', protectRoute, initializePayment);

// Upload payment proof
router.post('/:paymentId/proof', protectRoute, upload.single('paymentProof'), uploadPaymentProof);

// Get payment by booking ID
router.get('/booking/:bookingId', protectRoute, getPaymentByBooking);

// Confirm payment (job seeker only)
router.post('/:paymentId/confirm', protectRoute, confirmPayment);

// Create payment for booking
router.post('/booking/:bookingId', protectRoute, createPaymentForBooking);

// Get payment proof
router.get('/:paymentId/proof', protectRoute, getPaymentProof);

export default router;