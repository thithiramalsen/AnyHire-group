import express from "express";
import * as Jobs from "../controllers/job.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import upload from "../lib/multer.js"; 

const router = express.Router();

// Public routes (no authentication required)
router.get("/public/approved", Jobs.getPublicApprovedJobs); // Get all approved jobs for public view
router.get("/available", Jobs.getAvailableJobs); // Get available jobs for application

// Protected routes (requires authentication)
router.post("/add", protectRoute, upload.single("images"), Jobs.addJob); // Create new job
router.get("/get", Jobs.getJobs); // Get all jobs
router.get("/status", protectRoute, Jobs.getJobsByStatus); // Get jobs by status
router.get("/getApproved", protectRoute, Jobs.getJobsApproved); // Get approved jobs
router.get("/:id", Jobs.getJobById); // Get job by ID
router.get("/user/:userId", protectRoute, Jobs.getJobsByUserId); // Get jobs by user ID
router.patch("/up/:id", protectRoute, Jobs.updateJob); // Update job
router.delete("/del/:id", protectRoute, Jobs.deleteJob); // Delete job

// Admin routes (requires admin privileges)
router.patch("/approve/:id", protectRoute, adminRoute, Jobs.approveJob); // Approve job
router.patch("/decline/:id", protectRoute, adminRoute, Jobs.declineJob); // Decline job
router.patch("/pending/:id", protectRoute, adminRoute, Jobs.setJobToPending); // Set job to pending

export default router;