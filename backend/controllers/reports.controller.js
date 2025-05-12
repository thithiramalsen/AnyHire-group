import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import User from '../models/user.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';

import Review from '../models/review.model.js';


const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
};

const calculateUserEarnings = async (userId) => {
    try {
        const payments = await Payment.aggregate([
            {
                $match: {
                    status: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'bookingId',
                    foreignField: '_id',
                    as: 'booking'
                }
            },
            {
                $unwind: '$booking'
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: {
                        $sum: {
                            $cond: [
                                { $eq: ['$booking.providerId', userId] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    totalPayments: {
                        $sum: {
                            $cond: [
                                { $eq: ['$booking.seekerId', userId] },
                                '$amount',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const result = payments[0] || { totalEarnings: 0, totalPayments: 0 };
        return {
            totalEarnings: result.totalEarnings,
            totalPayments: result.totalPayments,
            netEarnings: result.totalEarnings - result.totalPayments
        };
    } catch (error) {
        console.error('Error calculating earnings:', error);
        return { totalEarnings: 0, totalPayments: 0, netEarnings: 0 };
    }
};

export const generateUsersReport = async (req, res) => {
    try {
        const users = await User.find({}, '-password').lean();
        const enhancedUsers = await Promise.all(users.map(async (user) => {
            const jobsPosted = await Job.countDocuments({ createdBy: user._id });
            const jobsApplied = await Booking.countDocuments({ seekerId: user._id });
            const jobsCompleted = await Booking.countDocuments({ 
                seekerId: user._id,
                status: { $in: ['completed', 'paid'] }
            });

            const successRate = jobsApplied > 0 
                ? ((jobsCompleted / jobsApplied) * 100).toFixed(1) 
                : 0;

            const earnings = await calculateUserEarnings(user._id);
            
            return {
                ID: user._id,
                Name: user.name || 'N/A',
                Email: user.email || 'N/A',
                Role: user.role || 'N/A',
                'Join Date': formatDate(user.createdAt),
                'Last Active': formatDate(user.lastActive),
                District: user.preferredDistrict || 'N/A',
                'Jobs Posted': jobsPosted,
                'Jobs Applied': jobsApplied,
                'Jobs Completed': jobsCompleted,
                'Success Rate': `${successRate}%`,
                'Total Earnings': `$${earnings.totalEarnings}`,
                'Total Spent': `$${earnings.totalPayments}`,
                'Net Balance': `$${earnings.netEarnings}`
            };
        }));

        return res.json(enhancedUsers);
    } catch (error) {
        console.error('Error generating users report:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating users report'
        });
    }
};

export const generateUserReport = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId, '-password').lean();
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const jobsPosted = await Job.countDocuments({ createdBy: userId });
        const jobsApplied = await Booking.countDocuments({ seekerId: userId });
        const jobsCompleted = await Booking.countDocuments({ 
            seekerId: userId,
            status: { $in: ['completed', 'paid'] }
        });
        
        const earnings = await calculateUserEarnings(userId);
        const successRate = jobsApplied > 0 
            ? ((jobsCompleted / jobsApplied) * 100).toFixed(1) 
            : 0;

        const userReport = {
            'Personal Information': {
                'Name': user.name || 'N/A',
                'Email': user.email || 'N/A',
                'Role': user.role || 'N/A',
                'District': user.preferredDistrict || 'N/A',
                'Join Date': formatDate(user.createdAt),
                'Last Active': formatDate(user.lastActive)
            },
            'Activity Statistics': {
                'Jobs Posted': jobsPosted,
                'Jobs Applied': jobsApplied,
                'Jobs Completed': jobsCompleted,
                'Success Rate': `${successRate}%`
            },
            'Financial Summary': {
                'Total Earnings': `$${earnings.totalEarnings}`,
                'Total Spent': `$${earnings.totalPayments}`,
                'Net Balance': `$${earnings.netEarnings}`
            }
        };

        return res.json(userReport);
    } catch (error) {
        console.error('Error generating user report:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating user report'
        });
    }
};

export const generateJobsReport = async (req, res) => {
    try {
        const jobs = await Job.find().lean();
        const enhancedJobs = await Promise.all(jobs.map(async (job) => {
            const totalApplications = await Booking.countDocuments({ jobId: job._id });
            const completedBookings = await Booking.countDocuments({ 
                jobId: job._id,
                status: { $in: ['completed', 'paid'] }
            });

            const payments = await Payment.aggregate([
                {
                    $match: {
                        status: { $in: ['confirmed', 'completed'] }
                    }
                },
                {
                    $lookup: {
                        from: 'bookings',
                        localField: 'bookingId',
                        foreignField: '_id',
                        as: 'booking'
                    }
                },
                {
                    $unwind: '$booking'
                },
                {
                    $match: {
                        'booking.jobId': job._id
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ]);

            const poster = await User.findById(job.createdBy);
            const successRate = totalApplications > 0 
                ? ((completedBookings / totalApplications) * 100).toFixed(1) 
                : 0;

            return {
                'ID': job._id,
                'Title': job.title,
                'Category': job.category,
                'District': job.district,
                'Posted By': poster?.name || 'N/A',
                'Posted Date': formatDate(job.postedDate),
                'Deadline': formatDate(job.deadline),
                'Status': job.status,
                'Payment Amount': `$${job.payment}`,
                'Applications': totalApplications,
                'Completed': completedBookings,
                'Success Rate': `${successRate}%`,
                'Total Earnings': `$${payments[0]?.totalAmount || 0}`
            };
        }));

        return res.json(enhancedJobs);
    } catch (error) {
        console.error('Error generating jobs report:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating jobs report'
        });
    }
};

export const generateBookingsReport = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('posterId', 'name email')
            .populate('seekerId', 'name email')
            .lean();

        const enhancedBookings = bookings.map(booking => ({
            'ID': booking._id,
            'Title': booking.title,
            'Category': booking.category,
            'Customer': booking.posterId?.name || 'N/A',
            'Job Seeker': booking.seekerId?.name || 'N/A',
            'Created Date': formatDate(booking.dates.created),
            'Status': booking.status,
            'Payment Amount': `Rs. ${booking.payment.amount}`,
            'Location': booking.location.address,
            'Started Date': formatDate(booking.dates.started),
            'Completed Date': formatDate(booking.dates.completed),
            'Paid Date': formatDate(booking.dates.paid)
        }));

        return res.json(enhancedBookings);
    } catch (error) {
        console.error('Error generating bookings report:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating bookings report'
        });
    }
};

export const generatePaymentsReport = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate({
                path: 'bookingId',
                select: 'title posterId seekerId',
                populate: [
                    { path: 'posterId', select: 'name' },
                    { path: 'seekerId', select: 'name' }
                ]
            })
            .lean();

        const enhancedPayments = payments.map(payment => ({
            'ID': payment._id,
            'Booking Title': payment.bookingId?.title || 'N/A',
            'From': payment.bookingId?.posterId?.name || 'N/A',
            'To': payment.bookingId?.seekerId?.name || 'N/A',
            'Amount': `Rs. ${payment.amount}`,
            'Status': payment.status,
            'Date': formatDate(payment.createdAt),
            'Method': payment.paymentMethod || 'N/A',
            'Transaction ID': payment._id || 'N/A'
        }));

        return res.json(enhancedPayments);
    } catch (error) {
        console.error('Error generating payments report:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating payments report'
        });
    }
};

export const generateTicketsReport = async (req, res) => {
    try {
        const tickets = await Ticket.find().lean();
        
        const enhancedTickets = await Promise.all(tickets.map(async (ticket) => {
            const user = await User.findById(ticket.userId);
            const responseTime = ticket.replies?.length > 0 
                ? Math.ceil((new Date(ticket.replies[0].createdAt) - new Date(ticket.createdAt)) / (1000 * 60 * 60))
                : null;

            return {
                'ID': ticket._id,
                'User': user?.name || 'N/A',
                'Email': ticket.email,
                'Subject': ticket.subject,
                'Priority': ticket.priority,
                'Status': ticket.status,
                'Created': formatDate(ticket.createdAt),
                'Last Updated': formatDate(ticket.updatedAt),
                'Response Time': responseTime ? `${responseTime} hours` : 'N/A',
                'Total Responses': ticket.replies?.length || 0
            };
        }));

        return res.json(enhancedTickets);
    } catch (error) {
        console.error('Error generating tickets report:', error);
        return res.status(500).json({ 
            success: false,
            message: error.message || 'Error generating tickets report'
        });
    }
};

export const generateReviewsReport = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate({
                path: 'bookingId',
                select: 'title'
            })
            .populate('reviewerId', 'name')
            .populate('revieweeId', 'name')
            .lean();
        
        const enhancedReviews = reviews.map(review => ({
            'ID': review._id,
            'Booking ID': review.bookingId?._id || 'N/A',
            'Job Title': review.bookingId?.title || 'N/A',
            'Reviewer': review.reviewerId?.name || 'N/A',
            'Reviewee': review.revieweeId?.name || 'N/A',
            'Rating': review.rating,
            'Comment': review.comment || 'N/A',
            'Type': review.reviewType === 'customer_to_seeker' ? 'Customer → Seeker' : 'Seeker → Customer',
            'Date': formatDate(review.createdAt)
        }));

        return res.json(enhancedReviews);
    } catch (error) {
        console.error('Error generating reviews report:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating reviews report'
        });
    }
};

export const generateContactsReport = async (req, res) => {
    try {
        const contacts = await Contact.find().lean();
        
        const enhancedContacts = contacts.map(contact => ({
            'ID': contact._id,
            'Name': contact.name,
            'Email': contact.email,
            'Subject': contact.subject,
            'Status': contact.status,
            'Message': contact.message,
            'Replies': contact.replies?.length || 0,
            'Created': formatDate(contact.createdAt),
            'Last Updated': formatDate(contact.updatedAt)
        }));

        return res.json(enhancedContacts);
    } catch (error) {
        console.error('Error generating contacts report:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error generating contacts report'
        });
    }
};
