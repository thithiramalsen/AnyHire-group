import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import Rating from '../models/review.model.js';
import Support from '../models/ticket.model.js';
import mongoose from 'mongoose';

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
        // Get total jobs count
        const totalJobs = await Job.countDocuments();
        
        // Get active jobs
        const activeJobs = await Job.countDocuments({ status: 'active' });
        
        // Get completed jobs
        const completedJobs = await Job.countDocuments({ status: 'completed' });
        
        // Get jobs by category
        const jobsByCategory = await Job.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get jobs growth over time
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
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        res.json({
            totalJobs,
            activeJobs,
            completedJobs,
            jobsByCategory,
            jobsGrowth
        });
    } catch (error) {
        console.error('Error in getJobsAnalytics:', error);
        res.status(500).json({ message: 'Error fetching jobs analytics' });
    }
};

// Get bookings analytics
export const getBookingsAnalytics = async (req, res) => {
    try {
        // Get total bookings
        const totalBookings = await Booking.countDocuments();
        
        // Get active bookings
        const activeBookings = await Booking.countDocuments({ status: 'active' });
        
        // Get completed bookings
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        
        // Get bookings by status
        const bookingsByStatus = await Booking.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get bookings growth over time
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const bookingsGrowth = await Booking.aggregate([
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

        res.json({
            totalBookings,
            activeBookings,
            completedBookings,
            bookingsByStatus,
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
        // Get total revenue
        const totalRevenue = await Payment.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        // Get revenue by month
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const revenueByMonth = await Payment.aggregate([
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
                    total: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Get payment methods distribution
        const paymentMethods = await Payment.aggregate([
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        res.json({
            totalRevenue: totalRevenue[0]?.total || 0,
            revenueByMonth,
            paymentMethods
        });
    } catch (error) {
        console.error('Error in getPaymentsAnalytics:', error);
        res.status(500).json({ message: 'Error fetching payments analytics' });
    }
};

// Get ratings analytics
export const getRatingsAnalytics = async (req, res) => {
    try {
        // Get average rating
        const averageRating = await Rating.aggregate([
            {
                $group: {
                    _id: null,
                    average: { $avg: "$rating" }
                }
            }
        ]);

        // Get ratings distribution
        const ratingsDistribution = await Rating.aggregate([
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get ratings by category
        const ratingsByCategory = await Rating.aggregate([
            {
                $lookup: {
                    from: "jobs",
                    localField: "jobId",
                    foreignField: "_id",
                    as: "job"
                }
            },
            {
                $unwind: "$job"
            },
            {
                $group: {
                    _id: "$job.category",
                    average: { $avg: "$rating" },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            averageRating: averageRating[0]?.average || 0,
            ratingsDistribution,
            ratingsByCategory
        });
    } catch (error) {
        console.error('Error in getRatingsAnalytics:', error);
        res.status(500).json({ message: 'Error fetching ratings analytics' });
    }
};

// Get support analytics
export const getSupportAnalytics = async (req, res) => {
    try {
        // Get total support tickets
        const totalTickets = await Support.countDocuments();
        
        // Get open tickets
        const openTickets = await Support.countDocuments({ status: 'open' });
        
        // Get resolved tickets
        const resolvedTickets = await Support.countDocuments({ status: 'resolved' });
        
        // Get tickets by category
        const ticketsByCategory = await Support.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get average response time
        const responseTimeData = await Support.aggregate([
            {
                $match: {
                    status: 'resolved',
                    responseTime: { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    average: { $avg: "$responseTime" }
                }
            }
        ]);

        res.json({
            totalTickets,
            openTickets,
            resolvedTickets,
            ticketsByCategory,
            averageResponseTime: responseTimeData[0]?.average || 0
        });
    } catch (error) {
        console.error('Error in getSupportAnalytics:', error);
        res.status(500).json({ message: 'Error fetching support analytics' });
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