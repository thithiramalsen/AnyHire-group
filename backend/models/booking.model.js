import mongoose from "mongoose";
import Counter from './counter.model.js';

const bookingSchema = new mongoose.Schema({
    _id: { type: Number },
    jobTitle: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    user: { type: Number, ref: "User", required: true },
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