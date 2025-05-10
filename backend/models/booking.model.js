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
            "payment_pending",   // When both parties confirm completion
            "paid",             // When payment is completed
            "cancelled"         // When another booking goes to in_progress
        ],
        default: "applied" 
    },
    payment: {
        amount: { type: Number, required: true },
        status: { type: String, enum: ["pending", "completed"] }
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

// Add pre-save middleware to handle auto-incrementing and payment status
bookingSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'bookingId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }

    // Set payment status to pending only when booking is accepted
    if (this.status === 'accepted' && !this.payment.status) {
        this.payment.status = 'pending';
    }

    next();
});

// Add compound index to prevent duplicate applications
bookingSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;