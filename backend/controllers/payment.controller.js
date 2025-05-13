import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { updateJobStatus } from '../middleware/jobStatus.middleware.js';
import NotificationService from '../services/notification.service.js';
import Award from '../models/award.model.js';

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
        const { bookingId, paymentType, paymentMethod, discountInfo } = req.body;
        console.log('Initializing payment with data:', {
            bookingId,
            paymentType,
            paymentMethod,
            discountInfo
        });

        const booking = await Booking.findOne({ _id: Number(bookingId), status: 'payment_pending' });
        if (!booking) {
            console.log('Booking not found or not in payment_pending status:', bookingId);
            return res.status(404).json({
                success: false,
                message: "Booking not found or not in payment pending status"
            });
        }

        // Calculate final amount and validate discount
        let finalAmount = booking.payment.amount;
        let validatedDiscount = null;

        if (discountInfo) {
            console.log('Processing discount:', discountInfo);
            const award = await Award.findOne({
                _id: discountInfo.awardId,
                'rewards.code': discountInfo.discountCode || discountInfo.code,
                'rewards.isUsed': false
            });

            if (award) {
                const reward = award.rewards.find(r => r.code === (discountInfo.discountCode || discountInfo.code));
                if (reward) {
                    finalAmount = booking.payment.amount * (1 - (reward.value / 100));
                    validatedDiscount = {
                        originalAmount: booking.payment.amount,
                        discountValue: reward.value,
                        discountCode: reward.code,
                        awardId: award._id
                    };
                    console.log('Discount validated:', validatedDiscount);
                }
            }
        }

        // Create payment with validated discount info
        const payment = new Payment({
            bookingId: Number(bookingId),
            amount: finalAmount,
            paymentType,
            paymentMethod: paymentMethod || 'bank-transfer',
            status: paymentType === 'manual' ? 'awaiting_confirmation' : 'pending',
            // Add discount information if validated
            originalAmount: validatedDiscount ? validatedDiscount.originalAmount : null,
            discountApplied: validatedDiscount ? true : false,
            discountValue: validatedDiscount ? validatedDiscount.discountValue : null,
            discountCode: validatedDiscount ? validatedDiscount.discountCode : null // Add this line
        });

        console.log('Creating payment with data:', {
            amount: payment.amount,
            originalAmount: payment.originalAmount,
            discountApplied: payment.discountApplied,
            discountValue: payment.discountValue
        });

        await payment.save();

        res.status(201).json({
            success: true,
            message: "Payment initialized successfully",
            payment: {
                _id: payment._id,
                bookingId: payment.bookingId,
                amount: payment.amount,
                originalAmount: payment.originalAmount,
                discountApplied: payment.discountApplied,
                discountValue: payment.discountValue,
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

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "Payment ID is required"
            });
        }

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
                status: payment.status,
                proofFilename: payment.proofFilename
            }
        });
    } catch (err) {
        console.error('Payment proof upload error:', err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to upload payment proof"
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
        console.log('Getting payment for booking:', req.params.bookingId);
        const payment = await Payment.findOne({ bookingId: Number(req.params.bookingId) });
        
        if (!payment) {
            console.log('No payment found for booking:', req.params.bookingId);
            return res.status(404).json({
                success: false,
                message: "No payment found for this booking"
            });
        }

        console.log('Found payment:', {
            _id: payment._id,
            amount: payment.amount,
            originalAmount: payment.originalAmount,
            discountApplied: payment.discountApplied,
            discountValue: payment.discountValue
        });

        res.json({
            success: true,
            payment: {
                _id: payment._id,
                bookingId: payment.bookingId,
                amount: payment.amount,
                originalAmount: payment.originalAmount,
                discountApplied: payment.discountApplied,
                discountValue: payment.discountValue,
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
            payment.status = 'confirmed';
            payment.completedAt = new Date();

            // Mark discount code as used if a discount was applied
            if (payment.discountApplied) {
                console.log('Marking discount code as used');
                // Find and update the award with the used discount code
                const award = await Award.findOne({
                    'rewards.code': payment.discountCode
                });

                if (award) {
                    const rewardIndex = award.rewards.findIndex(r => r.code === payment.discountCode);
                    if (rewardIndex !== -1) {
                        award.rewards[rewardIndex].isUsed = true;
                        award.rewards[rewardIndex].usedAt = new Date();
                        await award.save();
                        console.log('Updated award reward status:', award.rewards[rewardIndex]);
                    }
                }
            }

            // Update both booking status and payment status
            await Booking.findOneAndUpdate(
                { _id: payment.bookingId },
                {
                    status: 'paid',
                    'payment.status': 'confirmed',
                    'dates.paid': new Date()
                }
            );

            // Send notification to customer
            await NotificationService.createNotification(
                booking.posterId,
                'PAYMENT',
                'Payment Confirmed',
                `Job seeker has confirmed receiving payment for "${booking.jobTitle}". Transaction completed.`,
                {
                    references: {
                        bookingId: booking._id,
                        targetUserId: booking.seekerId
                    }
                }
            );

            // Update job status
            await updateJobStatus(booking.jobId);
        } else {
            payment.status = 'reported';
            // Send notification for reported payment
            await NotificationService.createNotification(
                booking.posterId,
                'PAYMENT',
                'Payment Reported',
                `Job seeker has reported an issue with the payment for "${booking.jobTitle}". Reason: ${notes || 'No reason provided'}`,
                {
                    references: {
                        bookingId: booking._id,
                        targetUserId: booking.seekerId
                    }
                }
            );
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
        if (!['pending', 'awaiting_confirmation', 'reported'].includes(payment.status)) {
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

// Add this new method
export const completePayment = async (req, res) => {
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

        // Verify user is the customer
        if (Number(booking.posterId) !== userId) {
            return res.status(403).json({
                success: false,
                message: "Only the customer can complete the payment"
            });
        }

        // Update payment status
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();

        res.json({
            success: true,
            message: "Payment completed successfully",
            payment: {
                _id: payment._id,
                status: payment.status,
                completedAt: payment.completedAt
            }
        });
    } catch (error) {
        console.error('Error completing payment:', error);
        res.status(500).json({
            success: false,
            message: "Failed to complete payment",
            error: error.message
        });
    }
};

export const getUserPayments = async (req, res) => {
    try {
        const userId = Number(req.user._id);
        const { type, range } = req.query;

        console.log('Fetching payments for user:', userId); // Debug log

        // Get bookings where user is either seeker or poster
        const bookings = await Booking.find({
            $or: [
                { seekerId: userId },
                { posterId: userId }
            ]
        });

        const bookingIds = bookings.map(booking => Number(booking._id));
        console.log('Associated booking IDs:', bookingIds); // Debug log

        // Build query
        let query = {
            bookingId: { $in: bookingIds }
        };

        // Add date filter if specified
        if (range === 'month') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            query.createdAt = { $gte: startOfMonth };
        } else if (range === 'year') {
            const startOfYear = new Date();
            startOfYear.setMonth(0, 1);
            startOfYear.setHours(0, 0, 0, 0);
            query.createdAt = { $gte: startOfYear };
        }

        console.log('Final query:', query); // Debug log

        const payments = await Payment.find(query)
            .populate({
                path: 'bookingId',
                populate: [
                    {
                        path: 'seekerId',
                        model: 'User',
                        select: 'name email'
                    },
                    {
                        path: 'posterId',
                        model: 'User',
                        select: 'name email'
                    },
                    {
                        path: 'jobId',
                        model: 'Job',
                        select: 'title'
                    }
                ]
            })
            .sort({ createdAt: -1 });

        console.log('Found payments:', payments.length); // Debug log

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Error fetching user payments:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message
        });
    }
};

export const calculateDiscountedAmount = async (req, res) => {
    try {
        const { bookingId, discountCode } = req.body;

        // Find the booking
        const booking = await Booking.findOne({ _id: Number(bookingId) });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Validate discount code
        const award = await Award.findOne({
            'rewards.code': discountCode,
            'rewards.isUsed': false,
            'rewards.validUntil': { $gt: new Date() }
        });

        if (!award) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired discount code"
            });
        }

        const reward = award.rewards.find(r => r.code === discountCode);
        const originalAmount = booking.payment.amount;
        const discountedAmount = originalAmount * (1 - (reward.value / 100));

        res.status(200).json({
            success: true,
            data: {
                originalAmount,
                discountedAmount,
                discountValue: reward.value,
                awardId: award._id,
                code: discountCode
            }
        });
    } catch (error) {
        console.error('Discount calculation error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to calculate discount",
            error: error.message
        });
    }
};

export const retryPayment = async (req, res) => {
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

        // Verify user is the customer
        if (Number(booking.posterId) !== userId) {
            return res.status(403).json({
                success: false,
                message: "Only the customer can retry the payment"
            });
        }

        // Verify payment is in reported status
        if (payment.status !== 'reported') {
            return res.status(400).json({
                success: false,
                message: "Only reported payments can be retried"
            });
        }

        // Delete the old payment
        await Payment.deleteOne({ _id: Number(paymentId) });

        // Reset booking status to payment_pending
        booking.status = 'payment_pending';
        await booking.save();

        res.json({
            success: true,
            message: "Payment reset for retry",
            booking: {
                _id: booking._id,
                status: booking.status,
                payment: booking.payment
            }
        });
    } catch (error) {
        console.error('Error retrying payment:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retry payment",
            error: error.message
        });
    }
};