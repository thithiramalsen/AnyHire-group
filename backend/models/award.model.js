import mongoose from "mongoose";
import Counter from './counter.model.js';

const awardSchema = new mongoose.Schema({
    _id: { type: Number },
    type: {
        type: String,
        enum: ['CUSTOMER_OF_MONTH'],
        required: true
    },
    userId: {
        type: Number,
        ref: 'User',
        required: true
    },
    period: {
        month: { type: Number, required: true },
        year: { type: Number, required: true }
    },
    metrics: {
        totalBookings: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 }
    },
    rewards: [{
        type: {
            type: String,
            enum: ['DISCOUNT'],
            required: true
        },
        value: { type: Number, required: true }, // percentage for discount
        code: { type: String, required: true },
        validUntil: { type: Date, required: true },
        isUsed: { type: Boolean, default: false }
    }],
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
    { userId: 1, type: 1, 'period.month': 1, 'period.year': 1 },
    { unique: true }
);

const Award = mongoose.model("Award", awardSchema);
export default Award; 