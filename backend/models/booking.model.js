import mongoose from "mongoose";
import Counter from './counter.model.js';

const bookingSchema = new mongoose.Schema({
    _id: { type: Number },
    jobId: { type: Number, ref: "Job", required: true },
    jobTitle: { type: String, required: true },
    seekerId: { type: Number, ref: "User", required: true },
    posterId: { type: Number, ref: "User", required: true },
    status: { 
        type: String, 
        enum: [
            "applied",           // Initial status when seeker applies
            "accepted",          // When poster accepts the application
            "declined",          // When poster declines the application
            "in_progress",       // When work has started
            "completed_by_seeker", // When seeker marks as complete
            "completed",         // When both parties confirm completion
            "payment_pending",   // Ready for payment
            "paid"              // Payment completed
        ],
        default: "applied" 
    },
    payment: {
        amount: { type: Number, required: true },
        status: { type: String, enum: ["pending", "completed"], default: "pending" }
    },
    dates: {
        applied: { type: Date, default: Date.now },
        accepted: { type: Date },
        started: { type: Date },
        completed_by_seeker: { type: Date },
        completed: { type: Date },
        paid: { type: Date }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add pre-save middleware to handle auto-incrementing
bookingSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'bookingId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
    next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;