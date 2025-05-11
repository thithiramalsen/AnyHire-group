import { Schema, model } from 'mongoose';
import Counter from './counter.model.js';

const notificationSchema = new Schema({
    _id: { 
        type: Number // Keep this consistent with other models
    },
    userId: {
        type: Number, // Changed from ObjectId to Number
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['WELCOME', 'BOOKING', 'PAYMENT', 'REVIEW', 'SYSTEM', 'ROLE_UPGRADE',
            'JOB_POSTED', 'JOB_APPROVED', 'JOB_DECLINED', 'JOB_APPLICATION'
        ]
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        default: null
    },
    links: {
        type: Map,
        of: String,
        default: new Map()
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

export default model('Notification', notificationSchema);