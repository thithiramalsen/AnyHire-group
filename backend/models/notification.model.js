import mongoose from "mongoose";
import Counter from './counter.model.js';

const notificationSchema = new mongoose.Schema({
    _id: { type: Number },
    userId: { type: Number, ref: 'User', required: true },
    type: {
        type: String,
        required: true,
        enum: ['BOOKING', 'JOB_APPLICATION', 'REVIEW', 'PAYMENT', 'TICKET', 'JOB_POSTED', 'JOB_APPROVED', 'JOB_DECLINED', 'WELCOME',
            'CHAT', 'New Message', 'CONTACT'
        ]
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // Keep for backward compatibility
    links: { type: Object }, // Keep for backward compatibility
    references: {
        bookingId: { type: Number, ref: 'Booking' },
        jobId: { type: Number, ref: 'Job' },
        reviewId: { type: Number, ref: 'Review' },
        ticketId: { type: Number, ref: 'Ticket' },
        targetUserId: { type: Number, ref: 'User' },
        paymentId: { type: Number, ref: 'Payment' }
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

// Pre-save middleware to handle auto-incrementing - matches your other models
notificationSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'notificationId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
    next();
});

export default mongoose.model('Notification', notificationSchema);