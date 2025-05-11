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
}

export default CustomerRewardsService; 