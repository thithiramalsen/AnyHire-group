import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
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
                type: mongoose.Schema.Types.ObjectId,
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

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;