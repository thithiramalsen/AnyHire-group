import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, updateUser, deleteUser, getUserBookingInfo, getUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

// Get all users (admin only)
router.get("/", protectRoute, adminRoute, getAllUsers);

// Get single user profile
router.get("/:id", protectRoute, getUserProfile);

// Update user (admin only)
router.put("/:id", protectRoute, adminRoute, updateUser);

// Delete user (admin only)
router.delete("/:id", protectRoute, adminRoute, deleteUser);

// New route for fetching limited user information for bookings
router.get("/booking-info/:id", protectRoute, getUserBookingInfo);

export default router; 