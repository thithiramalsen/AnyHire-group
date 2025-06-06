import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import Rating from '../models/review.model.js';
import Support from '../models/ticket.model.js';
import mongoose from 'mongoose';

// Helper function to get date range based on timeRange parameter
const getDateRange = (timeRange) => {
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
        case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
        case '1y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate.setDate(now.getDate() - 30); // Default to 30 days
    }

    return { startDate, endDate: now };
};

// Get users analytics
export const getUsersAnalytics = async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await User.countDocuments();
        
        // Get new users in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get active users (users who have logged in within last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeUsers = await User.countDocuments({
            lastLogin: { $gte: sevenDaysAgo }
        });

        // Get verified users
        const verifiedUsers = await User.countDocuments({ isVerified: true });

        // Get user growth data for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Format user growth data
        const formattedUserGrowth = userGrowth.map(item => ({
            date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
            users: item.count
        }));

        // Get user types distribution
        const userTypes = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format user types data
        const formattedUserTypes = userTypes.map(item => ({
            type: item._id,
            count: item.count
        }));

        res.json({
            totalUsers,
            newUsers,
            activeUsers,
            verifiedUsers,
            userGrowth: formattedUserGrowth,
            userTypes: formattedUserTypes
        });
    } catch (error) {
        console.error('Error in getUsersAnalytics:', error);
        res.status(500).json({ message: 'Error fetching users analytics' });
    }
};

// Get jobs analytics
export const getJobsAnalytics = async (req, res) => {
    try {
        // Get basic stats
        const totalJobs = await Job.countDocuments();
        const activeJobs = await Job.countDocuments({ status: 'active' });
        const completedJobs = await Job.countDocuments({ status: 'completed' });

        // Get jobs growth data for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const jobsGrowth = await Job.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: {
                        $concat: [
                            { $toString: "$_id.year" },
                            "-",
                            {
                                $cond: {
                                    if: { $lt: ["$_id.month", 10] },
                                    then: { $concat: ["0", { $toString: "$_id.month" }] },
                                    else: { $toString: "$_id.month" }
                                }
                            }
                        ]
                    },
                    count: 1
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Get jobs by category
        const jobsByCategory = await Job.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Fill in missing months with zero counts
        const months = [];
        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            months.unshift(`${year}-${month}`);
        }

        const filledGrowthData = months.map(month => ({
            _id: month,
            count: jobsGrowth.find(item => item._id === month)?.count || 0
        }));

        console.log('Processed jobs growth data:', filledGrowthData);

        res.json({
            totalJobs,
            activeJobs,
            completedJobs,
            jobsByCategory,
            jobsGrowth: filledGrowthData
        });
    } catch (error) {
        console.error('Error in getJobsAnalytics:', error);
        res.status(500).json({ message: 'Error fetching jobs analytics' });
    }
};

// Get bookings analytics
export const getBookingsAnalytics = async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);

        // Get total bookings
        const totalBookings = await Booking.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Get active bookings (including those with pending payments)
        const activeBookings = await Booking.countDocuments({
            $or: [
                // Active booking statuses
                { status: { $in: ['accepted', 'in_progress', 'completed_by_seeker', 'payment_pending'] } },
                // Bookings with pending payments
                {
                    status: 'paid',
                    'payment.status': { $in: ['pending', 'awaiting_confirmation'] }
                }
            ],
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Get completed bookings (including those with confirmed payments)
        const completedBookings = await Booking.countDocuments({
            $or: [
                // Bookings marked as paid
                { status: 'paid' },
                // Bookings with confirmed payments
                {
                    status: 'payment_pending',
                    'payment.status': { $in: ['confirmed', 'completed'] }
                }
            ],
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Get bookings by status
        const bookingsByStatus = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'bookingId',
                    as: 'payment'
                }
            },
            {
                $addFields: {
                    effectiveStatus: {
                        $switch: {
                            branches: [
                                {
                                    case: { $in: ['$status', ['accepted', 'in_progress', 'completed_by_seeker', 'payment_pending']] },
                                    then: 'active'
                                },
                                {
                                    case: {
                                        $or: [
                                            { $eq: ['$status', 'paid'] },
                                            {
                                                $and: [
                                                    { $eq: ['$status', 'payment_pending'] },
                                                    { $in: ['$payment.status', ['confirmed', 'completed']] }
                                                ]
                                            }
                                        ]
                                    },
                                    then: 'completed'
                                }
                            ],
                            default: '$status'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$effectiveStatus',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        // Get bookings by category
        const bookingsByCategory = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'job'
                }
            },
            {
                $unwind: '$job'
            },
            {
                $group: {
                    _id: '$job.category',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    category: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        // Get bookings growth trend
        const bookingsGrowth = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    date: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        res.json({
            totalBookings,
            activeBookings,
            completedBookings,
            bookingsByStatus,
            bookingsByCategory,
            bookingsGrowth
        });
    } catch (error) {
        console.error('Error in getBookingsAnalytics:', error);
        res.status(500).json({ message: 'Error fetching bookings analytics' });
    }
};

// Get payments analytics
export const getPaymentsAnalytics = async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);

        // Get total payments and amount
        const paymentStats = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Get pending payments
        const pendingPayments = await Payment.countDocuments({
            status: { $in: ['pending', 'awaiting_confirmation'] },
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Get completed payments (combine 'completed' and 'confirmed' statuses)
        const completedPayments = await Payment.countDocuments({
            status: { $in: ['completed', 'confirmed'] },
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Update paymentsByStatus to normalize statuses
        const paymentsByStatus = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        // First normalize the status
                        status: {
                            $switch: {
                                branches: [
                                    {
                                        case: { $in: ["$status", ["completed", "confirmed"]] },
                                        then: "completed"
                                    },
                                    {
                                        case: { $in: ["$status", ["pending", "awaiting_confirmation"]] },
                                        then: "pending"
                                    }
                                ],
                                default: "$status"
                            }
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: "$_id.status",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        const paymentsByMethod = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' }
                }
            },
            {
                $project: {
                    method: '$_id',
                    count: 1,
                    amount: 1,
                    _id: 0
                }
            }
        ]);

        const paymentsGrowth = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' }
                }
            },
            {
                $project: {
                    date: '$_id',
                    count: 1,
                    amount: 1,
                    _id: 0
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        res.json({
            totalPayments: paymentStats[0]?.totalPayments || 0,
            totalAmount: paymentStats[0]?.totalAmount || 0,
            pendingPayments,
            completedPayments,
            paymentsByStatus,
            paymentsByMethod,
            paymentsGrowth
        });

    } catch (error) {
        console.error('Error in getPaymentsAnalytics:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching payments analytics',
            error: error.message 
        });
    }
};

// Get ratings analytics
export const getRatingsAnalytics = async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);

        // Get total ratings and average rating
        const ratingStats = await Rating.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRatings: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    positiveRatings: {
                        $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] }
                    },
                    ratingsWithComments: {
                        $sum: { $cond: [{ $ifNull: ['$comment', false] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get ratings by category
        const ratingsByCategory = await Rating.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        // Get ratings distribution
        const ratingsDistribution = await Rating.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    rating: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { rating: 1 }
            }
        ]);

        // Get ratings growth trend
        const ratingsGrowth = await Rating.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    averageRating: { $avg: '$rating' }
                }
            },
            {
                $project: {
                    date: '$_id',
                    count: 1,
                    averageRating: { $round: ['$averageRating', 1] },
                    _id: 0
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        res.json({
            totalRatings: ratingStats[0]?.totalRatings || 0,
            averageRating: ratingStats[0]?.averageRating || 0,
            positiveRatings: ratingStats[0]?.positiveRatings || 0,
            ratingsWithComments: ratingStats[0]?.ratingsWithComments || 0,
            ratingsByCategory,
            ratingsDistribution,
            ratingsGrowth
        });
    } catch (error) {
        console.error('Error in getRatingsAnalytics:', error);
        res.status(500).json({ message: 'Error fetching ratings analytics' });
    }
};

// Get support analytics
export const getSupportAnalytics = async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);

        // Get all tickets
        const tickets = await Support.find({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Basic metrics
        const totalTickets = tickets.length;
        const openTickets = tickets.filter(t => t.status === 'Open').length;
        const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
        const averageResponseTime = tickets.reduce((acc, t) => acc + (t.responseTime || 0), 0) / totalTickets || 0;

        // Calculate response time distribution
        const responseTimeRanges = [
            { min: 0, max: 1, label: '0-1h' },
            { min: 1, max: 4, label: '1-4h' },
            { min: 4, max: 8, label: '4-8h' },
            { min: 8, max: 24, label: '8-24h' },
            { min: 24, max: Infinity, label: '24h+' }
        ];

        const responseTimeDistribution = responseTimeRanges.map(range => ({
            range: range.label,
            count: tickets.filter(t => {
                const responseTime = t.responseTime || 0;
                return responseTime >= range.min && responseTime < range.max;
            }).length
        }));

        // Calculate tickets growth trend
        const ticketsGrowth = await Support.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    newTickets: { $sum: 1 },
                    resolvedTickets: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    newTickets: 1,
                    resolvedTickets: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        // Existing aggregations for status and category
        const ticketsByStatus = await Support.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, name: "$_id", count: 1 } }
        ]);

        const ticketsByCategory = await Support.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { _id: 0, category: "$_id", count: 1 } }
        ]);

        res.json({
            totalTickets,
            openTickets,
            resolvedTickets,
            averageResponseTime,
            ticketsByStatus,
            ticketsByCategory,
            ticketsGrowth,
            responseTimeDistribution
        });

    } catch (error) {
        console.error('Error in getSupportAnalytics:', error);
        res.status(500).json({
            message: 'Failed to fetch support analytics',
            error: error.message
        });
    }
};

export const getUserAnalytics = async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        
        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        switch (timeRange) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        // Get total users
        const totalUsers = await User.countDocuments();
        
        // Get new users in the selected time range
        const newUsers = await User.countDocuments({
            createdAt: { $gte: startDate }
        });

        // Get active users (users who have logged in within the last 7 days)
        const activeUsers = await User.countDocuments({
            lastActive: { $gte: new Date(now.getDate() - 7) }
        });

        // Get user growth data
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    newUsers: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get user types distribution
        const userTypes = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    type: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        // Get user activity by time
        const userActivityByTime = await User.aggregate([
            {
                $match: {
                    lastActive: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $hour: "$lastActive" },
                    activeUsers: { $sum: 1 }
                }
            },
            {
                $project: {
                    hour: "$_id",
                    activeUsers: 1,
                    _id: 0
                }
            },
            {
                $sort: { hour: 1 }
            }
        ]);

        // Get top active users
        const topUsers = await User.find()
            .sort({ lastActive: -1 })
            .limit(10)
            .select('name email role image lastActive');

        res.json({
            totalUsers,
            newUsers,
            activeUsers,
            userGrowth,
            userTypes,
            userActivityByTime,
            topUsers
        });
    } catch (error) {
        console.error('Error in getUserAnalytics:', error);
        res.status(500).json({ message: 'Error fetching user analytics' });
    }
};