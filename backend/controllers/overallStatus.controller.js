import OverallStatus from '../models/overallStatus.model.js';
import Job from '../models/job.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';

// Helper function to calculate overall job status
const calculateOverallJobStatus = (job, booking) => {
    if (job.status === "declined") return "declined";
    if (job.status === "paid") return "completed";
    if (job.status === "pending") return "pending";
    
    // Check if job is active based on job status
    if (job.status === "approved" || job.status === "in_progress") {
        return "active";
    }
    
    // Check if job is active based on booking status
    if (booking && ["applied", "accepted", "in_progress", "completed_by_seeker", "payment_pending"].includes(booking.status)) {
        return "active";
    }
    
    return "pending";
};

// Helper function to calculate overall booking status
const calculateOverallBookingStatus = (booking, payment) => {
    if (!booking) return null;
    
    // First check if booking is completed
    if (booking.status === "paid") {
        return "completed";
    }
    
    // Then check if booking is active
    if (["accepted", "in_progress", "completed_by_seeker", "payment_pending"].includes(booking.status)) {
        return "active";
    }
    
    // If booking is not in any of the above states, return null
    return null;
};

// Update overall status for a job and its bookings
export const updateOverallStatus = async (jobId, bookingId = null) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) throw new Error("Job not found");

        let booking = null;
        let payment = null;

        if (bookingId) {
            booking = await Booking.findById(bookingId);
            if (booking) {
                payment = await Payment.findOne({ bookingId: booking._id });
            }
        }

        const overallJobStatus = calculateOverallJobStatus(job, booking);
        const overallBookingStatus = calculateOverallBookingStatus(booking, payment);

        // Update or create overall status
        await OverallStatus.findOneAndUpdate(
            { jobId, bookingId: bookingId || null },
            {
                jobId,
                bookingId,
                paymentId: payment?._id,
                overallJobStatus,
                overallBookingStatus,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );

        return { success: true };
    } catch (error) {
        console.error("Error updating overall status:", error);
        throw error;
    }
};

// Update overall status for all existing bookings
export const updateAllOverallStatuses = async (req, res) => {
    try {
        // Get all bookings
        const bookings = await Booking.find();
        let updatedCount = 0;
        let errorCount = 0;

        for (const booking of bookings) {
            try {
                const job = await Job.findById(booking.jobId);
                if (!job) {
                    console.error(`Job not found for booking ${booking._id}`);
                    errorCount++;
                    continue;
                }

                const payment = await Payment.findOne({ bookingId: booking._id });
                
                const overallJobStatus = calculateOverallJobStatus(job, booking);
                const overallBookingStatus = calculateOverallBookingStatus(booking, payment);

                await OverallStatus.findOneAndUpdate(
                    { jobId: job._id, bookingId: booking._id },
                    {
                        jobId: job._id,
                        bookingId: booking._id,
                        paymentId: payment?._id,
                        overallJobStatus,
                        overallBookingStatus,
                        lastUpdated: new Date()
                    },
                    { upsert: true, new: true }
                );

                updatedCount++;
            } catch (error) {
                console.error(`Error updating overall status for booking ${booking._id}:`, error);
                errorCount++;
            }
        }

        res.json({
            success: true,
            message: `Updated ${updatedCount} bookings. ${errorCount} errors.`
        });
    } catch (error) {
        console.error("Error updating all overall statuses:", error);
        res.status(500).json({
            success: false,
            message: "Error updating overall statuses",
            error: error.message
        });
    }
};

// Get overall status for analytics
export const getOverallStatusAnalytics = async (timeRange = 'all') => {
    try {
        const dateFilter = {};
        if (timeRange !== 'all') {
            const now = new Date();
            switch (timeRange) {
                case 'week':
                    dateFilter.lastUpdated = { $gte: new Date(now.setDate(now.getDate() - 7)) };
                    break;
                case 'month':
                    dateFilter.lastUpdated = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
                    break;
                case 'year':
                    dateFilter.lastUpdated = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
                    break;
            }
        }

        const [jobStats, bookingStats] = await Promise.all([
            OverallStatus.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: "$overallJobStatus",
                        count: { $sum: 1 }
                    }
                }
            ]),
            OverallStatus.aggregate([
                { $match: { ...dateFilter, overallBookingStatus: { $ne: null } } },
                {
                    $group: {
                        _id: "$overallBookingStatus",
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        return {
            jobStats: jobStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            bookingStats: bookingStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {})
        };
    } catch (error) {
        console.error("Error getting overall status analytics:", error);
        throw error;
    }
}; 