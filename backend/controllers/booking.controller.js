import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';
import NotificationService from '../services/notification.service.js';

// Create a new booking
export const createBooking = async (req, res) => {
    try {
        const posterId = Number(req.user._id);
        const { title, description, payment, category, location, seekerId } = req.body;

        // Validate required fields
        if (!title || !description || !payment?.amount || !category || !location?.address) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields" 
            });
        }

        // Create coordinates array if not provided
        const coordinates = location.coordinates || [0, 0];

        const newBooking = new Booking({
            title,
            description,
            seekerId: Number(seekerId || 0), // Default to 0 if not provided, will be updated later
            posterId,
            payment: {
                amount: Number(payment.amount)
            },
            category,
            location: {
                address: location.address,
                coordinates: coordinates
            },
            status: 'pending',
            dates: {
                created: new Date()
            }
        });

        await newBooking.save();

        // Only send notification if seekerId is provided
        if (seekerId) {
            await NotificationService.createNotification(
                seekerId,
                'BOOKING',
                'New Booking Request',
                `You have received a new booking request: "${title}"`,
                {
                    references: {
                        bookingId: newBooking._id,
                        targetUserId: posterId
                    }
                }
            );
        }

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: newBooking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create booking", 
            error: error.message 
        });
    }
};

// Get all bookings for a user
export const getUserBookings = async (req, res) => {
    try {
        const userId = Number(req.user._id);
        const { role } = req.query;

        let query = {};
        if (role === 'poster') {
            query.posterId = userId;
        } else if (role === 'seeker') {
            query.seekerId = userId;
        } else {
            query = {
                $or: [
                    { posterId: userId },
                    { seekerId: userId }
                ]
            };
        }

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch bookings", 
            error: error.message 
        });
    }
};

// Get a single booking by ID
export const getBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: Number(req.params.id) });
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }

        res.json({
            success: true,
            booking
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch booking", 
            error: error.message 
        });
    }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, seekerId } = req.body;
        const userId = Number(req.user._id);

        const booking = await Booking.findOne({ _id: Number(id) });
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }

        // For new applications, update seekerId and ensure status is accepted
        if (seekerId && booking.status === 'pending') {
            booking.seekerId = Number(seekerId);
            booking.status = 'accepted';
            booking.dates.accepted = new Date();

            // Send notification to job poster
            await NotificationService.createNotification(
                booking.posterId,
                'BOOKING',
                'New Job Application',
                `Someone has applied for your job: "${booking.title}"`,
                {
                    references: {
                        bookingId: booking._id,
                        targetUserId: seekerId
                    }
                }
            );

            await booking.save();

            return res.json({
                success: true,
                message: "Application submitted successfully",
                booking
            });
        }

        // Verify user has permission to update status
        const isSeeker = userId === booking.seekerId;
        const isPoster = userId === booking.posterId;

        if (!isSeeker && !isPoster) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized to update this booking" 
            });
        }

        // Validate status transitions
        const validTransitions = {
            pending: ['accepted', 'declined', 'cancelled'],
            accepted: ['in_progress', 'cancelled'],
            in_progress: ['completed_by_seeker', 'cancelled'],
            completed_by_seeker: ['payment_pending', 'in_progress'],
            payment_pending: ['paid'],
            paid: []
        };

        if (!validTransitions[booking.status]?.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status transition" 
            });
        }

        // Verify user has permission for this specific transition
        const seekerOnlyTransitions = ['accepted', 'declined', 'in_progress', 'completed_by_seeker'];
        const posterOnlyTransitions = ['payment_pending', 'paid'];

        if ((seekerOnlyTransitions.includes(status) && !isSeeker) ||
            (posterOnlyTransitions.includes(status) && !isPoster)) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized to perform this status transition" 
            });
        }

        // Update status and relevant dates
        booking.status = status;
        
        if (status === 'accepted') {
            booking.dates.accepted = new Date();
        }
        if (status === 'in_progress') {
            booking.dates.started = new Date();
        }
        if (status === 'completed_by_seeker') {
            booking.dates.completed_by_seeker = new Date();
        }
        if (status === 'payment_pending') {
            booking.dates.completed = new Date();
            // Add notification for job seeker
            await NotificationService.createNotification(
                booking.seekerId,
                'BOOKING',
                'Job Completion Confirmed',
                `Customer has confirmed completion of "${booking.title}". Payment is pending.`,
                {
                    references: {
                        bookingId: booking._id,
                        targetUserId: booking.posterId
                    }
                }
            );
        }
        if (status === 'paid') {
            booking.dates.paid = new Date();
        }

        await booking.save();

        // Send appropriate notifications based on status change
        let notificationData;
        if (status === 'accepted') {
            notificationData = {
                userId: booking.posterId,
                type: 'BOOKING',
                title: 'Booking Accepted',
                message: `Job seeker has accepted your booking: "${booking.title}"`,
                references: {
                    bookingId: booking._id,
                    targetUserId: booking.seekerId
                }
            };
        } else if (status === 'completed_by_seeker') {
            notificationData = {
                userId: booking.posterId,
                type: 'BOOKING',
                title: 'Booking Completed by Job Seeker',
                message: `Job seeker has marked booking "${booking.title}" as complete. Please confirm completion.`,
                references: {
                    bookingId: booking._id,
                    targetUserId: booking.seekerId
                }
            };
        }

        if (notificationData) {
            await NotificationService.createNotification(
                notificationData.userId,
                notificationData.type,
                notificationData.title,
                notificationData.message,
                {
                    references: notificationData.references
                }
            );
        }

        res.json({
            success: true,
            message: "Booking status updated successfully",
            booking
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to update booking", 
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

// Get available bookings (in pending status)
export const getAvailableBookings = async (req, res) => {
    try {
        const userId = Number(req.user._id);

        // Get all bookings in pending status, excluding the ones created by the current user
        const bookings = await Booking.find({
            status: 'pending',
            posterId: { $ne: userId } // Exclude bookings created by the current user
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error('Error fetching available bookings:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch available bookings", 
            error: error.message 
        });
    }
};

// Get all bookings (admin only)
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ createdAt: -1 })
            .populate('posterId', 'name')
            .populate('seekerId', 'name')
            .lean();

        // Transform the data to include poster and seeker names
        const enhancedBookings = bookings.map(booking => ({
            ...booking,
            posterName: booking.posterId?.name || 'Unknown',
            seekerName: booking.seekerId?.name || null,
        }));

        res.json({
            success: true,
            bookings: enhancedBookings
        });
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch bookings", 
            error: error.message 
        });
    }
};