import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, updateUser, deleteUser } from "../controllers/user.controller.js";

const router = express.Router();

// Get all users (admin only)
router.get("/", protectRoute, adminRoute, getAllUsers);

// Update user (admin only)
router.put("/:id", protectRoute, adminRoute, updateUser);

// Delete user (admin only)
router.delete("/:id", protectRoute, adminRoute, deleteUser);

export default router; 