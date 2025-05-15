import mongoose from "mongoose";
import Counter from './counter.model.js';

const cartSchema = new mongoose.Schema({
    _id: { type: Number },
    userId: { type: Number, ref: "User", required: true },
    jobId: { type: Number, ref: "Job", required: true },
    addedAt: { type: Date, default: Date.now }
});

// Add auto-increment for _id
cartSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'cartId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
    next();
});

// Prevent duplicate items in cart
cartSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;