import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import Ticket from '../models/ticket.model.js';
import Review from '../models/review.model.js';
import Contact from '../models/contact.model.js'; 

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
        const bookings = await Booking.find().lean();
        const enhancedBookings = await Promise.all(bookings.map(async (booking) => {
            const job = await Job.findById(booking.jobId);
            const seeker = await User.findById(booking.seekerId);
            const provider = await User.findById(booking.providerId);
            const payment = await Payment.findOne({ bookingId: booking._id });

            return {
                'ID': booking._id,
                'Job Title': job?.title || 'N/A',
                'Seeker': seeker?.name || 'N/A',
                'Provider': provider?.name || 'N/A',
                'Created Date': formatDate(booking.createdAt),
                'Status': booking.status,
                'Payment Status': payment?.status || 'No Payment',
                'Amount': payment ? `$${payment.amount}` : 'N/A',
                'Completion Date': formatDate(booking.completedAt),
                'Rating': booking.rating || 'Not Rated',
                'Feedback': booking.feedback || 'No Feedback'
            };
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
        const payments = await Payment.find().lean();
        const enhancedPayments = await Promise.all(payments.map(async (payment) => {
            const booking = await Booking.findById(payment.bookingId);
            const job = booking ? await Job.findById(booking.jobId) : null;
            const payer = booking ? await User.findById(booking.seekerId) : null;
            const receiver = booking ? await User.findById(booking.providerId) : null;

            return {
                'ID': payment._id,
                'Job': job?.title || 'N/A',
                'From': payer?.name || 'N/A',
                'To': receiver?.name || 'N/A',
                'Amount': `$${payment.amount}`,
                'Status': payment.status,
                'Date': formatDate(payment.createdAt),
                'Method': payment.paymentMethod || 'N/A',
                'Transaction ID': payment.transactionId || 'N/A'
            };
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
        const reviews = await Review.find().lean();
        
        const enhancedReviews = await Promise.all(reviews.map(async (review) => {
            const booking = await Booking.findById(review.bookingId);
            const reviewer = await User.findById(review.reviewerId);
            const reviewee = await User.findById(review.revieweeId);

            return {
                'ID': review._id,
                'Booking ID': review.bookingId,
                'Job Title': booking?.jobTitle || 'N/A',
                'Reviewer': reviewer?.name || 'N/A',
                'Reviewee': reviewee?.name || 'N/A',
                'Rating': review.rating,
                'Comment': review.comment || 'N/A',
                'Type': review.reviewType === 'customer_to_seeker' ? 'Customer → Seeker' : 'Seeker → Customer',
                'Date': formatDate(review.createdAt)
            };
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
