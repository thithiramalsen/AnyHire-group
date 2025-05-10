import mongoose from "mongoose";
import Counter from './counter.model.js';

const contactSchema = new mongoose.Schema({
    _id: { type: Number },  // Auto-increment ID
    name: {
        type: String,
        required: true,
    },
    email: {
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
        enum: ["New", "In Progress", "Resolved"],
        default: "New",
    },
    replies: [{
        message: {
            type: String,
            required: true
        },
        adminId: {
            type: Number,  // Changed from ObjectId to Number
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

// Pre-save middleware for auto-incrementing ID and updating timestamps
contactSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'contactId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model("Contact", contactSchema);