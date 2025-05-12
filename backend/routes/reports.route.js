 import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { generateUserReport, generateUsersReport } from "../controllers/reports.controller.js";

const router = express.Router();

// Admin routes
router.get('/admin/users', protectRoute, adminRoute, generateUsersReport);

// User routes
router.get('/user/:userId', protectRoute, generateUserReport);

export default router;