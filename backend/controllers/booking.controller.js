import Booking from '../models/booking.model.js';
import Job from '../models/job.model.js';
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';

// Apply for a job (creates a booking)
export const applyForJob = async (req, res) => {
    try {
        const jobId = Number(req.params.jobId);
        const seekerId = Number(req.user._id);

        // Add debug logging
        console.log('Application attempt:', {
            jobId,
            seekerId,
            user: req.user
        });

        // Verify job exists and is approved
        const job = await Job.findOne({ _id: jobId, status: "approved" });
        console.log('Found job:', job);

        if (!job) {
            return res.status(404).json({ message: "Job not found or not approved" });
        }

        // Check if user has an active booking for this job
        const existingBooking = await Booking.findOne({ 
            jobId: jobId, 
            seekerId: seekerId,
            status: { $in: ['applied', 'accepted', 'in_progress'] } // Only check active statuses
        });

        if (existingBooking) {
            return res.status(400).json({ message: "You have already applied for this job" });
        }

        // Get seeker details
        const seeker = await User.findById(seekerId);
        if (!seeker) {
            return res.status(404).json({ message: "Seeker not found" });
        }

        const newBooking = new Booking({
            jobId: jobId,
            jobTitle: job.title,
            seekerId: seekerId,
            posterId: job.createdBy,
            payment: {
                amount: job.payment
            },
            dates: {
                applied: new Date()
            }
        });

        console.log('Attempting to save booking:', newBooking);

        const savedBooking = await newBooking.save();
        console.log('Saved booking:', savedBooking);
        
        res.status(201).json(savedBooking);
    } catch (err) {
        console.error('Booking creation error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "You have already applied for this job" });
        }
        res.status(500).json({ message: "Internal server error" });
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
        
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // If cancelling, delete the booking instead of updating status
        if (status === 'cancelled') {
            // Check if any other booking for this job is in progress
            const otherInProgressBooking = await Booking.findOne({
                jobId: booking.jobId,
                _id: { $ne: booking._id },
                status: 'in_progress'
            });

            if (otherInProgressBooking) {
                // If another booking is in progress, just mark as cancelled
                booking.status = 'cancelled';
                await booking.save();
            } else {
                // If no other booking is in progress, delete this booking
                await Booking.findByIdAndDelete(id);
            }
            return res.json({ message: "Booking cancelled successfully" });
        }

        // Handle other status updates normally
        booking.status = status;
        if (status === 'accepted') booking.dates.accepted = new Date();
        await booking.save();

        res.json({ message: "Booking status updated", booking });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: "Error updating booking status" });
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