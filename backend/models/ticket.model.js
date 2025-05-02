import mongoose from "mongoose";
import Counter from './counter.model.js';

const ticketSchema = new mongoose.Schema({
    _id: { type: Number },  // Changed to Number for auto-increment
    userId: {
        type: Number,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Open", "In Progress", "Resolved", "Closed"],
        default: "Open",
    },
    priority: {
        type: String,
        enum: ["Low", "Normal", "High", "Urgent"],
        default: "Normal",
    },
    reply: {
        type: String,
        default: "",
    },
    replies: [{
        message: {
            type: String,
            required: true
        },
        adminId: {
            type: Number,
            required: true
        },
        adminName: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Add pre-save middleware for auto-incrementing ID
ticketSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'ticketId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model("Ticket", ticketSchema);