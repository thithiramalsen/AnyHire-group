import mongoose from 'mongoose';
import { connectDB } from '../lib/db.js';
import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import Review from '../models/review.model.js';
import Portfolio from '../models/portfolio.model.js';
import Ticket from '../models/ticket.model.js';
import Cart from '../models/cart.model.js';
import Chat from '../models/chat.model.js';
import Notification from '../models/notification.model.js';
import Award from '../models/award.model.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupDatabase = async () => {
    try {
        // Use your existing database connection configuration
        await connectDB();
        console.log('Connected to MongoDB, starting cleanup...');

        // Get all valid user IDs
        const validUserIds = (await User.find({}).select('_id')).map(user => user._id);
        console.log(`Found ${validUserIds.length} valid users`);

        // Cleanup operations
        const operations = [
            {
                model: Job,
                query: { createdBy: { $nin: validUserIds } },
                name: 'Jobs'
            },
            {
                model: Booking,
                query: {
                    $or: [
                        { seekerId: { $nin: validUserIds } },
                        { posterId: { $nin: validUserIds } }
                    ]
                },
                name: 'Bookings'
            },
            {
                model: Payment,
                query: { 'bookingId': { $exists: true, $ne: null } },
                name: 'Payments',
                preCheck: async () => {
                    const validBookingIds = (await Booking.find({}).select('_id')).map(booking => booking._id);
                    return { bookingId: { $nin: validBookingIds } };
                }
            },
            {
                model: Review,
                query: {
                    $or: [
                        { reviewerId: { $nin: validUserIds } },
                        { revieweeId: { $nin: validUserIds } }
                    ]
                },
                name: 'Reviews'
            },
            {
                model: Portfolio,
                query: { user: { $nin: validUserIds } },
                name: 'Portfolio Items'
            },
            {
                model: Ticket,
                query: { userId: { $nin: validUserIds } },
                name: 'Support Tickets'
            },
            {
                model: Cart,
                query: { userId: { $nin: validUserIds } },
                name: 'Cart Items'
            },
            {
                model: Chat,
                query: { 
                    $or: [
                        { senderId: { $nin: validUserIds } },
                        { receiverId: { $nin: validUserIds } }
                    ]
                },
                name: 'Chat Messages'
            },
            {
                model: Notification,
                query: { userId: { $nin: validUserIds } },
                name: 'Notifications'
            },
            {
                model: Award,
                query: { userId: { $nin: validUserIds } },
                name: 'Awards'
            }
        ];

        // Add summary statistics
        let totalDeleted = 0;
        let summaryStats = {};

        // Execute cleanup operations
        for (const operation of operations) {
            try {
                const query = operation.preCheck 
                    ? await operation.preCheck()
                    : operation.query;

                const result = await operation.model.deleteMany(query);
                totalDeleted += result.deletedCount;
                summaryStats[operation.name] = result.deletedCount;
                
                console.log(`Cleaned up ${result.deletedCount} orphaned ${operation.name}`);
            } catch (error) {
                console.error(`Error cleaning up ${operation.name}:`, error);
            }
        }

        // Print summary
        console.log('\nCleanup Summary:');
        console.table(summaryStats);
        console.log(`Total items deleted: ${totalDeleted}`);
        console.log('Database cleanup completed successfully');

    } catch (error) {
        console.error('Database cleanup failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the cleanup with error handling
cleanupDatabase().catch(error => {
    console.error('Fatal error during cleanup:', error);
    process.exit(1);
});