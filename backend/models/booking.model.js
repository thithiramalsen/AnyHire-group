import mongoose from "mongoose";
import Counter from './counter.model.js';

const bookingSchema = new mongoose.Schema({
    _id: { type: Number },
    title: { type: String, required: true },
    description: { type: String, required: true },
    seekerId: { type: Number, ref: "User", required: true },
    posterId: { type: Number, ref: "User", required: true },
    status: { 
        type: String, 
        enum: [
            "pending",           // Initial status when booking is created
            "accepted",          // When job seeker accepts the booking
            "declined",          // When job seeker declines the booking
            "in_progress",       // When work has started
            "completed_by_seeker", // When seeker marks as complete
            "payment_pending",   // When both parties confirm completion
            "paid",             // When payment is completed
            "cancelled"         // When booking is cancelled
        ],
        default: "pending" 
    },
    payment: {
        amount: { type: Number, required: true },
        status: { type: String, enum: ["pending", 'confirmed', "completed"] }
    },
    dates: {
        created: { type: Date, default: Date.now },
        accepted: { type: Date },
        started: { type: Date },
        completed_by_seeker: { type: Date },
        completed: { type: Date },
        paid: { type: Date }
    },
    category: { type: String, required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number], // [longitude, latitude]
        address: { type: String, required: true }
    }
}, {
    timestamps: true
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

// Add location index for geospatial queries
bookingSchema.index({ location: '2dsphere' });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;