import mongoose from "mongoose";
import Counter from './counter.model.js';

const reviewSchema = new mongoose.Schema({
    _id: { type: Number },
    bookingId: { type: Number, ref: "Booking", required: true },
    reviewerId: { type: Number, ref: "User", required: true }, // ID of the person giving the review
    revieweeId: { type: Number, ref: "User", required: true }, // ID of the person being reviewed
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    reviewType: {
        type: String,
        enum: ["customer_to_seeker", "seeker_to_customer"],
        required: true
    }
}, {
    timestamps: true
});

// Add pre-save middleware to handle auto-incrementing
reviewSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'reviewId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
    next();
});

// Add compound index to prevent duplicate reviews for the same booking
reviewSchema.index({ bookingId: 1, reviewerId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;