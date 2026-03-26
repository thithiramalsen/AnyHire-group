import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import Review from '../models/review.model.js';
import Portfolio from '../models/portfolio.model.js';
import Ticket from '../models/ticket.model.js';
import Cart from '../models/cart.model.js';
import Contact from '../models/contact.model.js';
import Chat from '../models/chat.model.js';
import Notification from '../models/notification.model.js';
import Award from '../models/award.model.js';

export const cleanupUserData = async (userId) => {
    try {
        // Run all cleanup operations in parallel
        await Promise.all([
            // Delete all jobs posted by the user
            Job.deleteMany({ createdBy: userId }),

            // Delete all bookings associated with the user
            Booking.deleteMany({ 
                $or: [
                    { seekerId: userId },
                    { posterId: userId }
                ]
            }),

            // Delete all payments associated with the user's bookings
            Payment.deleteMany({
                bookingId: {
                    $in: (await Booking.find({
                        $or: [
                            { seekerId: userId },
                            { posterId: userId }
                        ]
                    })).map(booking => booking._id)
                }
            }),

            // Delete all reviews given by or received by the user
            Review.deleteMany({
                $or: [
                    { reviewerId: userId },
                    { revieweeId: userId }
                ]
            }),

            // Delete user's portfolio items
            Portfolio.deleteMany({ user: userId }),

            // Delete user's support tickets
            Ticket.deleteMany({ userId: userId }),

            // Delete user's cart items
            Cart.deleteMany({ userId: userId }),

            // Delete user's chat messages
            Chat.deleteMany({ senderId: userId }),

            // Delete user's notifications
            Notification.deleteMany({ userId: userId }),

            // Delete user's awards
            Award.deleteMany({ userId: userId }),

            // Update contact messages to anonymize user data
            Contact.updateMany(
                { 'replies.adminId': userId },
                {
                    $set: {
                        'replies.$.adminName': 'Deleted User',
                    }
                }
            )
        ]);

        // Finally, delete the user
        await User.findByIdAndDelete(userId);

        return { success: true, message: 'User data cleanup completed successfully' };
    } catch (error) {
        console.error('Error during user cleanup:', error);
        throw new Error('Failed to clean up user data');
    }
};