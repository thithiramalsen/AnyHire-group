import mongoose from "mongoose";
import Counter from './counter.model.js';

const portfolioSchema = new mongoose.Schema(
    {
        _id: { type: Number },
        user: {
            type: Number,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Title is required"],
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
        },
        experience: {
            type: String,
            required: [true, "Experience is required"],
        },
        qualifications: {
            type: String,
            required: [true, "Qualifications are required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        categories: [
            {
                type: Number,
                ref: "Category",
            },
        ],
        images: [
            {
                type: String, // Store image file paths
            },
        ],
        files: [
            {
                type: String, // Store file paths
            },
        ],
        status: {
            type: String,
            enum: ["pending", "approved", "not-approved"],
            default: "not-approved",
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Add pre-save middleware to handle auto-incrementing
portfolioSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'portfolioId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
    next();
});

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;