import mongoose from "mongoose";
import Counter from './counter.model.js';

const awardSchema = new mongoose.Schema({
    _id: { type: Number },
    type: {
        type: String,
        enum: ['CUSTOMER_OF_MONTH', 'CUSTOMER_OF_DAY', 'TOP_SEEKER_MONTH', 'TOP_SEEKER_DAY'],
        required: true
    },
    userId: {
        type: Number,
        ref: 'User',
        required: true
    },
    period: {
        day: { type: Number },
        month: { type: Number, required: true },
        year: { type: Number, required: true }
    },
    metrics: {
        totalBookings: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        completedJobs: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        onTimeDelivery: { type: Number, default: 0 }, // Percentage
        responseRate: { type: Number, default: 0 }, // Percentage
        totalEarnings: { type: Number, default: 0 }
    },
    rewards: [{
        type: {
            type: String,
            enum: ['DISCOUNT', 'FEATURED_PROFILE', 'PRIORITY_MATCHING'],
            required: true
        },
        value: { type: Number, required: true }, // percentage for discount, days for featured profile
        code: { type: String },
        validUntil: { type: Date, required: true },
        isUsed: { type: Boolean, default: false }
    }],
    badge: {
        type: String,
        enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
        default: 'BRONZE'
    },
    issuedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Auto-increment award ID
awardSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'awardId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
    next();
});

// Ensure unique award per user per period
awardSchema.index(
    { 
        userId: 1, 
        type: 1, 
        'period.day': 1,
        'period.month': 1, 
        'period.year': 1 
    },
    { unique: true }
);

const Award = mongoose.model("Award", awardSchema);
export default Award; 