import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';

// Middleware to update job status based on booking and payment status
export const updateJobStatus = async (jobId) => {
    try {
        const job = await Job.findOne({ _id: jobId });
        if (!job) return;

        // Get all bookings for this job
        const bookings = await Booking.find({ jobId });
        
        // Check if any booking is in progress
        const hasInProgressBooking = bookings.some(booking => 
            ['accepted', 'in_progress'].includes(booking.status)
        );

        // Check if any booking is completed but payment pending
        const hasCompletedBooking = bookings.some(booking => 
            ['completed_by_seeker', 'completed', 'payment_pending'].includes(booking.status)
        );

        // Check if any booking is paid
        const hasPaidBooking = bookings.some(booking => 
            booking.status === 'paid'
        );

        // Get all payments for this job's bookings
        const payments = await Payment.find({
            bookingId: { $in: bookings.map(b => b._id) }
        });

        // Check if any payment is confirmed
        const hasConfirmedPayment = payments.some(payment => 
            payment.status === 'confirmed' || payment.status === 'completed'
        );

        // Update job status based on conditions
        let newStatus = job.status;

        if (hasConfirmedPayment) {
            newStatus = 'paid';
        } else if (hasCompletedBooking) {
            newStatus = 'completed';
        } else if (hasInProgressBooking) {
            newStatus = 'in_progress';
        }

        // Only update if status has changed
        if (newStatus !== job.status) {
            job.status = newStatus;
            await job.save();
        }
    } catch (error) {
        console.error('Error updating job status:', error);
    }
}; 