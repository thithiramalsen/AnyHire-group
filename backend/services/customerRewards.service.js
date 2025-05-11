import Award from '../models/award.model.js';
import Booking from '../models/booking.model.js';
import { generateRandomCode } from '../utils/helpers.js';

class CustomerRewardsService {
    static async calculateCustomerOfMonth(month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Check if award already exists for this period
        const existingAward = await Award.findOne({
            type: 'CUSTOMER_OF_MONTH',
            'period.month': month,
            'period.year': year
        });

        if (existingAward) {
            throw new Error(`Award already exists for period ${month}/${year}`);
        }

        // Get all completed bookings for the month
        const bookings = await Booking.aggregate([
            {
                $match: {
                    status: 'paid',
                    'dates.paid': {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: '$posterId',
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: '$payment.amount' }
                }
            },
            {
                $sort: {
                    totalSpent: -1,
                    totalBookings: -1
                }
            },
            {
                $limit: 1
            }
        ]);

        if (bookings.length === 0) {
            return null;
        }

        const winner = bookings[0];
        
        // Create award with discount reward
        const discountCode = generateRandomCode(8);
        const award = new Award({
            type: 'CUSTOMER_OF_MONTH',
            userId: winner._id,
            period: { month, year },
            metrics: {
                totalBookings: winner.totalBookings,
                totalSpent: winner.totalSpent
            },
            rewards: [{
                type: 'DISCOUNT',
                value: 10, // 10% discount
                code: discountCode,
                validUntil: new Date(year, month + 1, 0) // Valid until end of next month
            }]
        });

        await award.save();
        return award;
    }

    static async getCustomerOfMonth(month, year) {
        return Award.findOne({
            type: 'CUSTOMER_OF_MONTH',
            'period.month': month,
            'period.year': year
        }).populate('userId', 'name email');
    }

    static async validateDiscountCode(code) {
        const award = await Award.findOne({
            'rewards.code': code,
            'rewards.isUsed': false
        });

        if (!award) {
            return null;
        }

        const reward = award.rewards.find(r => r.code === code);
        if (!reward || reward.validUntil < new Date()) {
            return null;
        }

        return {
            discountPercentage: reward.value,
            awardId: award._id,
            userId: award.userId
        };
    }

    static async markDiscountCodeAsUsed(code) {
        return Award.findOneAndUpdate(
            { 'rewards.code': code },
            { 'rewards.$.isUsed': true },
            { new: true }
        );
    }

    static async applyDiscountToPayment(code, paymentAmount) {
        const discountInfo = await this.validateDiscountCode(code);
        
        if (!discountInfo) {
            throw new Error('Invalid or expired discount code');
        }

        const discountAmount = (paymentAmount * discountInfo.discountPercentage) / 100;
        const finalAmount = paymentAmount - discountAmount;

        // Mark the discount code as used
        await this.markDiscountCodeAsUsed(code);

        return {
            originalAmount: paymentAmount,
            discountPercentage: discountInfo.discountPercentage,
            discountAmount: discountAmount,
            finalAmount: finalAmount,
            userId: discountInfo.userId,
            awardId: discountInfo.awardId
        };
    }

    static async getUserActiveDiscounts(userId) {
        const now = new Date();
        
        const awards = await Award.find({
            userId: userId,
            'rewards.isUsed': false,
            'rewards.validUntil': { $gt: now }
        });

        return awards.flatMap(award => 
            award.rewards
                .filter(reward => !reward.isUsed && new Date(reward.validUntil) > now)
                .map(reward => ({
                    code: reward.code,
                    value: reward.value,
                    validUntil: reward.validUntil,
                    awardPeriod: award.period
                }))
        );
    }

    static async getAllAwards() {
        return Award.find()
            .populate('userId', 'name email')
            .sort({ 'period.year': -1, 'period.month': -1 });
    }

    static async getUserAwards(userId) {
        return Award.find({ userId })
            .sort({ 'period.year': -1, 'period.month': -1 });
    }

    static async calculateCustomerOfDay(day, month, year) {
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year, month - 1, day, 23, 59, 59);

        // Check if award already exists for this period
        const existingAward = await Award.findOne({
            type: 'CUSTOMER_OF_DAY',
            'period.day': day,
            'period.month': month,
            'period.year': year
        });

        if (existingAward) {
            throw new Error(`Award already exists for date ${day}/${month}/${year}`);
        }

        // Get all completed bookings for the day
        const bookings = await Booking.aggregate([
            {
                $match: {
                    status: 'paid',
                    'dates.paid': {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: '$posterId',
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: '$payment.amount' }
                }
            },
            {
                $sort: {
                    totalSpent: -1,
                    totalBookings: -1
                }
            },
            {
                $limit: 1
            }
        ]);

        if (bookings.length === 0) {
            return null;
        }

        const winner = bookings[0];
        
        // Create award with discount reward (5% for daily winner)
        const discountCode = generateRandomCode(8);
        const award = new Award({
            type: 'CUSTOMER_OF_DAY',
            userId: winner._id,
            period: { day, month, year },
            metrics: {
                totalBookings: winner.totalBookings,
                totalSpent: winner.totalSpent
            },
            rewards: [{
                type: 'DISCOUNT',
                value: 5, // 5% discount for daily winner
                code: discountCode,
                validUntil: new Date(year, month - 1, day + 7) // Valid for 7 days
            }]
        });

        await award.save();
        return award;
    }

    static async getCustomerOfDay(day, month, year) {
        return Award.findOne({
            type: 'CUSTOMER_OF_DAY',
            'period.day': day,
            'period.month': month,
            'period.year': year
        }).populate('userId', 'name email');
    }

    static async calculateTopSeekerOfMonth(month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Check if award already exists
        const existingAward = await Award.findOne({
            type: 'TOP_SEEKER_MONTH',
            'period.month': month,
            'period.year': year
        });

        if (existingAward) {
            throw new Error(`Award already exists for period ${month}/${year}`);
        }

        // Get all completed bookings for the month
        const seekerStats = await Booking.aggregate([
            {
                $match: {
                    status: 'completed',
                    'dates.completed': {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'bookingId',
                    as: 'reviews'
                }
            },
            {
                $group: {
                    _id: '$seekerId',
                    completedJobs: { $sum: 1 },
                    totalEarnings: { $sum: '$payment.amount' },
                    onTimeDelivery: {
                        $avg: {
                            $cond: [
                                { $lte: ['$dates.completed', '$dates.deadline'] },
                                100,
                                0
                            ]
                        }
                    },
                    responseRate: {
                        $avg: {
                            $cond: [
                                { $lte: ['$dates.accepted', { $add: ['$dates.created', 24 * 60 * 60 * 1000] }] },
                                100,
                                0
                            ]
                        }
                    },
                    averageRating: {
                        $avg: {
                            $arrayElemAt: ['$reviews.rating', 0]
                        }
                    }
                }
            },
            {
                $project: {
                    completedJobs: 1,
                    totalEarnings: 1,
                    onTimeDelivery: 1,
                    responseRate: 1,
                    averageRating: 1,
                    score: {
                        $add: [
                            { $multiply: ['$averageRating', 20] }, // Rating (max 100)
                            { $multiply: ['$onTimeDelivery', 0.3] }, // On-time delivery (max 30)
                            { $multiply: ['$responseRate', 0.2] }, // Response rate (max 20)
                            { $multiply: [{ $min: ['$completedJobs', 10] }, 5] } // Completed jobs (max 50)
                        ]
                    }
                }
            },
            {
                $sort: {
                    score: -1
                }
            },
            {
                $limit: 1
            }
        ]);

        if (seekerStats.length === 0) {
            return null;
        }

        const winner = seekerStats[0];
        const badge = this.calculateBadge(winner.score);
        
        // Create award with multiple rewards
        const award = new Award({
            type: 'TOP_SEEKER_MONTH',
            userId: winner._id,
            period: { month, year },
            metrics: {
                completedJobs: winner.completedJobs,
                averageRating: winner.averageRating,
                onTimeDelivery: winner.onTimeDelivery,
                responseRate: winner.responseRate,
                totalEarnings: winner.totalEarnings
            },
            badge,
            rewards: [
                {
                    type: 'DISCOUNT',
                    value: 15, // 15% discount on platform fees
                    code: generateRandomCode(8),
                    validUntil: new Date(year, month + 1, 0) // Valid until end of next month
                },
                {
                    type: 'FEATURED_PROFILE',
                    value: 30, // Featured for 30 days
                    validUntil: new Date(year, month + 1, 0)
                },
                {
                    type: 'PRIORITY_MATCHING',
                    value: 30, // Priority matching for 30 days
                    validUntil: new Date(year, month + 1, 0)
                }
            ]
        });

        await award.save();
        return award;
    }

    static calculateBadge(score) {
        if (score >= 180) return 'PLATINUM';
        if (score >= 150) return 'GOLD';
        if (score >= 120) return 'SILVER';
        return 'BRONZE';
    }

    static async getTopSeekerOfMonth(month, year) {
        return Award.findOne({
            type: 'TOP_SEEKER_MONTH',
            'period.month': month,
            'period.year': year
        }).populate('userId', 'name email');
    }

    // Similar implementation for daily awards
    static async calculateTopSeekerOfDay(day, month, year) {
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year, month - 1, day, 23, 59, 59);

        // Similar implementation as monthly but with different reward values
        // and shorter validity periods
    }
}

export default CustomerRewardsService; 