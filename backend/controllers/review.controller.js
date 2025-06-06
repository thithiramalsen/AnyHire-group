import Review from '../models/review.model.js';
import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';
import NotificationService from '../services/notification.service.js';

// Create a new review
export const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment = "", reviewType } = req.body;
        const reviewerId = req.user._id; // From auth middleware

        // Get the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Get the payment for this booking
        const payment = await Payment.findOne({ bookingId: booking._id });
        if (!payment || payment.status !== "confirmed") {
            return res.status(400).json({ message: "Can only review bookings with confirmed payments" });
        }

        // Determine revieweeId based on reviewType
        let revieweeId;
        if (reviewType === "customer_to_seeker") {
            if (reviewerId !== booking.posterId) {
                return res.status(403).json({ message: "Only the customer can review the job seeker" });
            }
            revieweeId = booking.seekerId;
        } else if (reviewType === "seeker_to_customer") {
            if (reviewerId !== booking.seekerId) {
                return res.status(403).json({ message: "Only the job seeker can review the customer" });
            }
            revieweeId = booking.posterId;
        } else {
            return res.status(400).json({ message: "Invalid review type" });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ bookingId, reviewerId });
        if (existingReview) {
            // Update existing review
            existingReview.rating = rating;
            existingReview.comment = comment;
            await existingReview.save();
            return res.status(200).json(existingReview);
        }

        // Create the review
        const review = new Review({
            bookingId,
            reviewerId,
            revieweeId,
            rating,
            ...(comment && { comment }),
            reviewType
        });

        await review.save();

        // Send notification to reviewee
        await NotificationService.createNotification(
            revieweeId,
            'REVIEW',
            'New Review Received',
            `You received a ${rating}-star review for job "${booking.jobTitle}"`,
            {
                references: {
                    reviewId: review._id,
                    bookingId: booking._id,
                    targetUserId: reviewerId
                }
            }
        );

        // If customer submitted the review, set booking and payment status to 'completed'
        if (reviewType === 'customer_to_seeker') {
            try {
                // Update booking status
                await Booking.findByIdAndUpdate(bookingId, {
                    status: 'completed',
                    'payment.status': 'completed',
                    'dates.completed': new Date()
                });

                // Update payment status if exists
                if (payment) {
                    payment.status = 'completed';
                    payment.completedAt = new Date();
                    await payment.save();
                }
            } catch (err) {
                console.error('Error updating statuses:', err);
                // Don't throw error here, still create the review
            }
        }

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get reviews for a user (either as customer or job seeker)
export const getUserReviews = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { type } = req.query; // 'received' or 'given'

        let query = {};
        if (type === 'received') {
            query = { revieweeId: userId };
        } else if (type === 'given') {
            query = { reviewerId: userId };
        } else {
            return res.status(400).json({ message: "Invalid review type query" });
        }

        const reviews = await Review.find(query)
            .populate('reviewerId', 'name image')
            .populate('revieweeId', 'name image')
            .populate('bookingId', 'jobTitle');

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get average rating for a user
export const getUserAverageRating = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { reviewType } = req.query; // 'customer_to_seeker' or 'seeker_to_customer'

        const query = {
            revieweeId: userId,
            reviewType: reviewType
        };

        const result = await Review.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const stats = result[0] || { averageRating: 0, totalReviews: 0 };
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all reviews for admin
export const getAdminReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('reviewerId', 'name image')
            .populate('revieweeId', 'name image')
            .populate('bookingId', 'jobTitle')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching admin reviews:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a review (admin only)
export const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        await Review.deleteOne({ _id: reviewId });
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a review (user only)
export const deleteUserReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Check if the user is the reviewer
        if (review.reviewerId !== userId) {
            return res.status(403).json({ 
                message: "Not authorized to delete this review" 
            });
        }

        await Review.deleteOne({ _id: reviewId });
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update a review
export const updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user._id;
        const { rating, comment } = req.body;

        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Check if the user is the reviewer
        if (review.reviewerId !== userId) {
            return res.status(403).json({ 
                message: "Not authorized to update this review" 
            });
        }

        // Update the review
        review.rating = rating;
        review.comment = comment;
        await review.save();

        res.status(200).json(review);
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ message: error.message });
    }
};