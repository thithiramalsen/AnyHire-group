import Booking from '../models/booking.model.js';
import Job from '../models/job.model.js';
import User from '../models/user.model.js';

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

        // Check if user has already applied
        const existingBooking = await Booking.findOne({ 
            jobId: jobId, 
            seekerId: seekerId
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
                return {
                    ...application.toObject(),
                    title: job?.title || application.jobTitle,
                    description: job?.description,
                    images: job?.images,
                    district: job?.district,
                    category: job?.category,
                    payment: job?.payment || application.payment.amount,
                    seekerName: seeker?.name || 'Anonymous'
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
export const updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;
        const userId = req.user.id;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return next(createError(404, "Booking not found"));
        }

        // Verify user is authorized
        const isSeeker = booking.seekerId === userId;
        const isPoster = booking.posterId === userId;
        if (!isSeeker && !isPoster) {
            return next(createError(403, "Not authorized"));
        }

        // Define valid status transitions
        const validTransitions = {
            // Poster actions
            'applied': isPoster ? ['accepted', 'declined'] : [],
            // Seeker actions
            'accepted': isSeeker ? ['in_progress'] : [],
            'in_progress': isSeeker ? ['completed_by_seeker'] : [],
            // Poster confirms completion
            'completed_by_seeker': isPoster ? ['completed'] : [],
            // System updates these automatically
            'completed': ['payment_pending'],
            'payment_pending': ['paid']
        };

        if (!validTransitions[booking.status]?.includes(status)) {
            return next(createError(400, "Invalid status transition"));
        }

        // Update status and corresponding date
        booking.status = status;
        booking.dates[status] = new Date();

        // If job is completed by both parties, update job status
        if (status === 'completed') {
            const job = await Job.findById(booking.jobId);
            if (job) {
                job.status = 'completed';
                await job.save();
            }
        }

        const updatedBooking = await booking.save();
        res.status(200).json(updatedBooking);
    } catch (err) {
        next(err);
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
export const getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return next(createError(404, "Booking not found"));
        }

        // Verify user is either seeker or poster
        if (booking.seekerId !== req.user.id && booking.posterId !== req.user.id) {
            return next(createError(403, "Not authorized to view this booking"));
        }

        res.status(200).json(booking);
    } catch (err) {
        next(err);
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