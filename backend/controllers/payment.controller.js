import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads/payment-proofs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `payment-proof-${uuidv4()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(allowed.includes(ext) ? null : new Error('Only JPG, PNG, and PDF files are allowed'), allowed.includes(ext));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Initialize payment
export const initializePayment = async (req, res) => {
    try {
        const { bookingId, paymentType, paymentMethod } = req.body;

        if (!bookingId || !paymentType) {
            return res.status(400).json({ 
                success: false, 
                message: "Booking ID and payment type are required" 
            });
        }

        // Verify booking exists and is in payment_pending status
        const booking = await Booking.findOne({ _id: bookingId, status: 'payment_pending' });
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found or not in payment pending status" 
            });
        }

        // Create new payment record
        const payment = new Payment({
            bookingId: Number(bookingId),
            amount: booking.payment.amount,
            paymentType,
            paymentMethod: paymentMethod || 'bank-transfer',
            status: paymentType === 'manual' ? 'awaiting_confirmation' : 'pending'
        });

        await payment.save();

        res.status(201).json({
            success: true,
            message: "Payment initialized successfully",
            payment: {
                _id: payment._id,
                bookingId: payment.bookingId,
                amount: payment.amount,
                paymentType: payment.paymentType,
                status: payment.status
            }
        });
    } catch (err) {
        console.error('Payment initialization error:', err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to initialize payment", 
            error: err.message 
        });
    }
};

// Upload payment proof
export const uploadPaymentProof = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "Payment proof file is required" 
            });
        }

        const payment = await Payment.findOne({ _id: Number(paymentId) });
        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                message: "Payment not found" 
            });
        }

        if (payment.paymentType !== 'payment_proof') {
            return res.status(400).json({ 
                success: false, 
                message: "This payment does not require proof upload" 
            });
        }

        const buffer = fs.readFileSync(req.file.path);

        payment.proofPath = req.file.path.replace(/\\/g, '/');
        payment.proofFilename = req.file.filename;
        payment.proofData = buffer;
        payment.proofContentType = req.file.mimetype;
        payment.status = 'awaiting_confirmation';

        await payment.save();

        res.json({
            success: true,
            message: "Payment proof uploaded successfully",
            payment: {
                _id: payment._id,
                status: payment.status
            }
        });
    } catch (err) {
        console.error('Payment proof upload error:', err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to upload payment proof", 
            error: err.message 
        });
    }
};

// Get payment proof
export const getPaymentProof = async (req, res) => {
    try {
        const payment = await Payment.findOne({ _id: Number(req.params.paymentId) });
        if (!payment || !payment.proofData) {
            return res.status(404).json({ 
                success: false, 
                message: "Payment proof not found" 
            });
        }

        res.setHeader('Content-Type', payment.proofContentType);
        res.setHeader('Content-Disposition', `attachment; filename="${payment.proofFilename}"`);
        res.send(payment.proofData);
    } catch (err) {
        console.error('Error fetching payment proof:', err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch payment proof", 
            error: err.message 
        });
    }
};

// Get payment by booking ID
export const getPaymentByBooking = async (req, res) => {
    try {
        const payment = await Payment.findOne({ bookingId: Number(req.params.bookingId) });
        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                message: "No payment found for this booking" 
            });
        }

        res.json({
            success: true,
            payment: {
                _id: payment._id,
                bookingId: payment.bookingId,
                amount: payment.amount,
                paymentType: payment.paymentType,
                paymentMethod: payment.paymentMethod,
                status: payment.status,
                seekerConfirmation: payment.seekerConfirmation,
                createdAt: payment.createdAt
            }
        });
    } catch (err) {
        console.error('Get payment error:', err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch payment", 
            error: err.message 
        });
    }
};

// Confirm payment (job seeker only)
export const confirmPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { confirmed, notes } = req.body;
        const userId = Number(req.user._id);

        const payment = await Payment.findOne({ _id: Number(paymentId) });
        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                message: "Payment not found" 
            });
        }

        // Get the booking to verify the user is the job seeker
        const booking = await Booking.findOne({ _id: payment.bookingId });
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Associated booking not found" 
            });
        }

        // Verify user is the job seeker
        if (Number(booking.seekerId) !== userId) {
            console.debug('User verification failed:', {
                userId,
                seekerId: booking.seekerId,
                bookingId: booking._id
            });
            return res.status(403).json({ 
                success: false, 
                message: "Only the job seeker can confirm the payment" 
            });
        }

        if (payment.status !== 'awaiting_confirmation') {
            return res.status(400).json({ 
                success: false, 
                message: "Payment is not awaiting confirmation" 
            });
        }

        // Update payment status
        payment.seekerConfirmation = {
            confirmed,
            confirmedAt: new Date(),
            notes
        };

        if (confirmed) {
            payment.status = 'confirmed'; // Changed from 'completed'
            
            // Update booking status to match the new flow
            await Booking.findOneAndUpdate(
                { _id: payment.bookingId },
                { 
                    status: 'paid' // Update booking status to paid
                }
            );
        } else {
            payment.status = 'reported';
        }

        await payment.save();

        res.json({
            success: true,
            message: confirmed ? "Payment confirmed successfully" : "Payment reported as invalid",
            payment: {
                _id: payment._id,
                status: payment.status,
                seekerConfirmation: payment.seekerConfirmation
            }
        });
    } catch (err) {
        console.error('Payment confirmation error:', err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to process payment confirmation", 
            error: err.message 
        });
    }
};

// Get all payments (admin only)
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .sort({ createdAt: -1 });

        // Fetch booking details for each payment
        const paymentsWithDetails = await Promise.all(payments.map(async (payment) => {
            const booking = await Booking.findOne({ _id: payment.bookingId });
            return {
                _id: payment._id,
                bookingId: payment.bookingId,
                amount: payment.amount,
                paymentType: payment.paymentType,
                paymentMethod: payment.paymentMethod,
                status: payment.status,
                proofPath: payment.proofPath,
                proofFilename: payment.proofFilename,
                seekerConfirmation: payment.seekerConfirmation,
                createdAt: payment.createdAt,
                completedAt: payment.completedAt,
                booking: booking ? {
                    jobTitle: booking.jobTitle,
                    posterDetails: booking.posterDetails,
                    seekerDetails: booking.seekerDetails,
                    status: booking.status
                } : null
            };
        }));

        res.json({
            success: true,
            payments: paymentsWithDetails
        });
    } catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch payments", 
            error: error.message 
        });
    }
};

// Delete payment (admin only)
export const deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        const payment = await Payment.findOne({ _id: Number(paymentId) });
        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                message: "Payment not found" 
            });
        }

        // Delete payment proof file if exists
        if (payment.proofPath) {
            try {
                fs.unlinkSync(payment.proofPath);
            } catch (err) {
                console.error('Error deleting proof file:', err);
            }
        }

        await Payment.deleteOne({ _id: Number(paymentId) });

        res.json({
            success: true,
            message: "Payment deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete payment", 
            error: error.message 
        });
    }
};

export const createPaymentForBooking = async (req, res) => {
    try {
        const bookingId = Number(req.params.bookingId);
        const { paymentType, paymentMethod } = req.body;

        // Check if payment already exists
        const existing = await Payment.findOne({ bookingId });
        if (existing) {
            return res.status(400).json({ success: false, message: "Payment already exists for this booking" });
        }

        // Find booking and get amount
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const payment = new Payment({
            bookingId,
            amount: booking.payment.amount,
            paymentType,
            paymentMethod: paymentMethod || 'bank-transfer',
            status: paymentType === 'manual' ? 'awaiting_confirmation' : 'pending'
        });

        await payment.save();

        res.status(201).json({ success: true, payment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteCustomerPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = Number(req.user._id);
        
        const payment = await Payment.findOne({ _id: Number(paymentId) });
        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                message: "Payment not found" 
            });
        }

        // Get the booking to verify the user is the customer
        const booking = await Booking.findOne({ _id: payment.bookingId });
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Associated booking not found" 
            });
        }

        // Verify user is the customer who made the payment
        if (Number(booking.posterId) !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: "Only the customer who made the payment can delete it" 
            });
        }

        // Only allow deletion if payment is pending or awaiting_confirmation
        if (!['pending', 'awaiting_confirmation'].includes(payment.status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Can only delete payments that are pending or awaiting confirmation" 
            });
        }

        // Delete payment proof file if exists
        if (payment.proofPath) {
            try {
                fs.unlinkSync(payment.proofPath);
            } catch (err) {
                console.error('Error deleting proof file:', err);
            }
        }

        // Delete the payment
        await Payment.deleteOne({ _id: Number(paymentId) });

        // Update booking status back to payment_pending
        await Booking.findOneAndUpdate(
            { _id: payment.bookingId },
            { status: 'payment_pending' }
        );

        res.json({
            success: true,
            message: "Payment deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete payment", 
            error: error.message 
        });
    }
};

// Add this new controller method
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;

        if (!['pending', 'awaiting_confirmation', 'completed', 'reported'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status"
            });
        }

        const payment = await Payment.findOne({ _id: Number(paymentId) });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        payment.status = status;
        if (status === 'completed') {
            payment.completedAt = new Date();
        }

        await payment.save();

        // If payment is completed, update booking status
        if (status === 'completed') {
            await Booking.findOneAndUpdate(
                { _id: payment.bookingId },
                { 
                    status: 'paid',
                    'dates.paid': new Date()
                }
            );
        }

        res.json({
            success: true,
            message: "Payment status updated successfully",
            payment
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update payment status",
            error: error.message
        });
    }
};