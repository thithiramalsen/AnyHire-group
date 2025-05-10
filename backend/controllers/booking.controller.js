import Booking from '../models/booking.model.js';
import Job from '../models/job.model.js';
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';
import { updateJobStatus } from '../middleware/jobStatus.middleware.js';
import { 
    notifyJobApplication, 
    notifyApplicationStatus 
} from '../services/notification.service.js';

// Apply for a job (creates a booking)
export const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user._id;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Check if user has already applied
        const existingApplication = await Booking.findOne({
            jobId,
            userId
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this job"
            });
        }

        const newBooking = new Booking({
            jobId,
            userId,
            status: 'pending'
        });

        const savedBooking = await newBooking.save();

        // Create notification using the service
        await notifyJobApplication(job, savedBooking);

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: savedBooking
        });
    } catch (error) {
        console.error("Error in applyForJob:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit application",
            error: error.message
        });
    }
};

// Get user's applications (as a job seeker)
export const getMyApplications = async (req, res) => {
    try {
        const seekerId = Number(req.user._id);
        
        // Find all bookings where the user is the seeker
        const applications = await Booking.find({ seekerId })
            .sort({ 'dates.applied': -1 }); // Most recent first

        // Get the full job details for each application
        const applicationsWithJobDetails = await Promise.all(
            applications.map(async (application) => {
                const job = await Job.findById(application.jobId);
                const seeker = await User.findById(application.seekerId);

                // Check if this job has any active bookings by other users
                const otherActiveBookings = await Booking.findOne({
                    jobId: application.jobId,
                    _id: { $ne: application._id },
                    seekerId: { $ne: seekerId }, // Exclude user's own bookings
                    status: {
                        $in: [
                            'accepted',
                            'in_progress',
                            'completed_by_seeker',
                            'completed',
                            'payment_pending',
                            'paid'
                        ]
                    }
                });

                // Determine if this is an active application for the user
                const isActiveApplication = [
                    'accepted',
                    'in_progress',
                    'completed_by_seeker',
                    'completed',
                    'payment_pending',
                    'paid'
                ].includes(application.status);

                return {
                    ...application.toObject(),
                    title: job?.title || application.jobTitle,
                    description: job?.description,
                    images: job?.images,
                    district: job?.district,
                    category: job?.category,
                    payment: job?.payment || application.payment.amount,
                    seekerName: seeker?.name || 'Anonymous',
                    isJobTaken: !!otherActiveBookings,
                    isActiveApplication
                };
            })
        );

        res.status(200).json(applicationsWithJobDetails);
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).json({ message: "Error fetching applications" });
    }
};

// Accept/Decline application
export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        booking.status = status;
        await booking.save();

        // Get job details for notification
        const job = await Job.findById(booking.jobId);

        // Create notification using the service
        await notifyApplicationStatus(job, booking, status);

        res.json({
            success: true,
            message: `Application ${status} successfully`,
            data: booking
        });
    } catch (error) {
        console.error("Error in updateBookingStatus:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update application status",
            error: error.message
        });
    }
};

// Get all bookings for logged-in user (both as seeker and poster)
export const getUserBookings = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const bookings = await Booking.find({
            $or: [
                { seekerId: userId },
                { posterId: userId }
            ]
        }).sort({ 'dates.applied': -1 }); // Most recent first

        // Get additional details for each booking
        const bookingsWithDetails = await Promise.all(
            bookings.map(async (booking) => {
                const job = await Job.findById(booking.jobId);
                const seeker = await User.findById(booking.seekerId);
                const poster = await User.findById(booking.posterId);
                return {
                    ...booking.toObject(),
                    jobDetails: job,
                    seekerDetails: seeker,
                    posterDetails: poster
                };
            })
        );

        res.status(200).json(bookingsWithDetails);
    } catch (err) {
        next(err);
    }
};

// Get single booking by ID
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify user is either seeker or poster
        if (booking.seekerId !== req.user._id && booking.posterId !== req.user._id) {
            return res.status(403).json({ message: "Not authorized to view this booking" });
        }

        // Get additional details
        const job = await Job.findById(booking.jobId);
        const seeker = await User.findById(booking.seekerId);
        const poster = await User.findById(booking.posterId);

        const bookingWithDetails = {
            ...booking.toObject(),
            jobDetails: job,
            seekerDetails: seeker,
            posterDetails: poster
        };

        res.status(200).json(bookingWithDetails);
    } catch (err) {
        console.error('Error fetching booking:', err);
        res.status(500).json({ message: "Error fetching booking details" });
    }
};

// Get all bookings for a specific job (poster only)
export const getJobBookings = async (req, res, next) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user.id;

        // Verify user is the job poster
        const job = await Job.findById(jobId);
        if (!job || job.createdBy !== userId) {
            return next(createError(403, "Not authorized to view these bookings"));
        }

        const bookings = await Booking.find({ jobId }).sort({ 'dates.applied': -1 });
        
        // Get additional details for each booking
        const bookingsWithDetails = await Promise.all(
            bookings.map(async (booking) => {
                const seeker = await User.findById(booking.seekerId);
                return {
                    ...booking.toObject(),
                    seekerDetails: seeker
                };
            })
        );

        res.status(200).json(bookingsWithDetails);
    } catch (err) {
        next(err);
    }
};

// Get all bookings (admin only)
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('jobId', 'title category')
            .populate('seekerId', 'name email')
            .populate('posterId', 'name email')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch bookings", 
            error: error.message 
        });
    }
};

// Delete booking (admin only)
export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        
        const booking = await Booking.findOne({ _id: Number(id) });
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }

        // Delete associated payment if exists
        const payment = await Payment.findOne({ bookingId: booking._id });
        if (payment) {
            await Payment.deleteOne({ _id: payment._id });
        }

        await Booking.deleteOne({ _id: Number(id) });

        res.json({
            success: true,
            message: "Booking deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete booking", 
            error: error.message 
        });
    }
};

// Add this new controller method
export const updateBookingStatusAdmin = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "applied",
            "accepted",
            "declined",
            "in_progress",
            "completed_by_seeker",
            "completed",
            "payment_pending",
            "paid",
            "cancelled"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking status"
            });
        }

        const booking = await Booking.findOne({ _id: Number(bookingId) });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        booking.status = status;
        booking.dates[status] = new Date();
        await booking.save();

        res.json({
            success: true,
            message: "Booking status updated successfully",
            booking
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update booking status",
            error: error.message
        });
    }
};