import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Update the updatedAt field before saving
ticketSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model("Ticket", ticketSchema); 