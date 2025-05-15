import Cart from '../models/cart.model.js';
import Job from '../models/job.model.js';
import Booking from '../models/booking.model.js';

export const addToCart = async (req, res) => {
    try {
        const jobId = Number(req.params.jobId);
        const userId = Number(req.user._id);

        // Check if job exists and is approved
        const job = await Job.findOne({ _id: jobId, status: "approved" });
        if (!job) {
            return res.status(404).json({ message: "Job not found or not approved" });
        }

        // Check if user already has a booking for this job
        const existingBooking = await Booking.findOne({
            jobId,
            seekerId: userId,
            status: { $in: ['applied', 'accepted', 'in_progress'] }
        });

        if (existingBooking) {
            return res.status(400).json({ message: "You already have an active booking for this job" });
        }

        // Add to cart
        const cartItem = new Cart({
            userId,
            jobId
        });

        await cartItem.save();
        res.status(201).json(cartItem);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Job already in cart" });
        }
        res.status(500).json({ message: err.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = Number(req.user._id);
        const cartItems = await Cart.find({ userId });

        // Get job details and booking status for each cart item
        const itemsWithDetails = await Promise.all(
            cartItems.map(async (item) => {
                const job = await Job.findById(item.jobId);
                
                // Check if job has any active bookings
                const activeBooking = await Booking.findOne({
                    jobId: item.jobId,
                    status: { 
                        $in: ['accepted', 'in_progress', 'completed_by_seeker', 'completed', 'payment_pending', 'paid']
                    }
                });

                // Check if user has applied for this job
                const userBooking = await Booking.findOne({
                    jobId: item.jobId,
                    seekerId: userId,
                    status: { $in: ['applied'] }
                });

                return {
                    ...item.toObject(),
                    jobDetails: job,
                    jobStatus: {
                        isInProgress: !!activeBooking,
                        hasApplied: !!userBooking,
                        canApply: !activeBooking && job?.status === 'approved'
                    }
                };
            })
        );

        res.status(200).json(itemsWithDetails);
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ message: err.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const cartItemId = Number(req.params.id);
        const userId = Number(req.user._id);

        const result = await Cart.findOneAndDelete({
            _id: cartItemId,
            userId
        });

        if (!result) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        res.status(200).json({ message: "Item removed from cart" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};