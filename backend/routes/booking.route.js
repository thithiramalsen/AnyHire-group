import express from "express";
import Booking from "../models/booking.model.js"; // Replace with your actual Booking model
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all bookings for the logged-in user
router.get("/", protectRoute, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }); // Fetch bookings for the logged-in user
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;