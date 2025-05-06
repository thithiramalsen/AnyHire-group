import mongoose from "mongoose";
import Counter from './counter.model.js';

const paymentSchema = new mongoose.Schema({
    _id: { type: Number },
    bookingId: {
        type: Number,
        required: true,
        ref: 'Booking'
    },
    amount: {
        type: Number,
        required: true
    },
    paymentType: {
        type: String,
        enum: ["manual", "payment_proof", "card"],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["bank-transfer", "credit-card", "paypal", "other"],
        default: "bank-transfer"
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    // For payment proof method
    proofPath: {
        type: String
    },
    proofFilename: {
        type: String
    },
    proofData: {
        type: Buffer
    },
    proofContentType: {
        type: String
    },
    status: {
        type: String,
        enum: [
            "pending",           // Initial status when payment is initiated
            "awaiting_confirmation", // When payment proof is uploaded or manual payment selected
            "confirmed",         // When job seeker confirms the payment
            "reported",          // When job seeker reports fake payment
            "completed"          // When payment is fully processed (used for admin completion)
        ],
        default: "pending"
    },
    seekerConfirmation: {
        confirmed: { type: Boolean, default: false },
        confirmedAt: { type: Date },
        notes: { type: String }
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true });

// Add pre-save middleware to handle auto-incrementing
paymentSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'paymentId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
    next();
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;