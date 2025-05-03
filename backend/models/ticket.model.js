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
        enum: ["Normal", "Urgent"],  // Change this line to only allow Normal and Urgent
        default: "Normal"
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
        isAdmin: {
            type: Boolean,
            required: true,
            default: false
        },
        adminId: {
            type: Number,
            required: function() { return this.isAdmin; }
        },
        adminName: {
            type: String,
            required: function() { return this.isAdmin; }
        },
        userId: {
            type: Number,
            required: function() { return !this.isAdmin; }
        },
        userName: {
            type: String,
            required: function() { return !this.isAdmin; }
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