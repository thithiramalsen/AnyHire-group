import mongoose from "mongoose";
import Counter from './counter.model.js';

const overallStatusSchema = new mongoose.Schema({
    _id: { type: Number },
    jobId: { 
        type: Number, 
        ref: "Job", 
        required: true 
    },
    bookingId: { 
        type: Number, 
        ref: "Booking" 
    },
    paymentId: { 
        type: Number, 
        ref: "Payment" 
    },
    overallJobStatus: {
        type: String,
        enum: ["pending", "active", "completed", "declined"],
        default: "pending"
    },
    overallBookingStatus: {
        type: String,
        enum: ["active", "completed"],
        default: null
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add pre-save middleware to handle auto-incrementing
overallStatusSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'overallStatusId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
    this.lastUpdated = Date.now();
    next();
});

// Add compound index for job and booking
overallStatusSchema.index({ jobId: 1, bookingId: 1 }, { unique: true });

const OverallStatus = mongoose.model("OverallStatus", overallStatusSchema);
export default OverallStatus; 