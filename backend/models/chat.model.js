import mongoose from "mongoose";
import Counter from './counter.model.js';

const chatSchema = new mongoose.Schema(
    {
        _id: { type: Number },  // Changed from ObjectId to Number
        bookingId: {
            type: Number,       // Changed from ObjectId to Number
            ref: "Booking",
            required: true,
        },
        senderId: {
            type: Number,       // Changed from ObjectId to Number
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Add pre-save middleware for auto-incrementing ID
chatSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'chatId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
    next();
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;