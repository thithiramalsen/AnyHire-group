import express from "express";
import * as Jobs from "../controllers/job.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import upload from "../lib/multer.js"; 

const router = express.Router();



// Job posting
router.post("/add", protectRoute, upload.single("images"),Jobs.addJob);

// Get all jobs
router.get("/get", Jobs.getJobs,);

// Fetch jobs by status
router.get("/status", protectRoute, Jobs.getJobsByStatus);

// Get a job by ID
router.get("/:id", Jobs.getJobById);

// Update a job
router.patch("/up/:id", protectRoute, Jobs.updateJob);

// Delete a job
router.delete("/del/:id", protectRoute, Jobs.deleteJob);



// Approve a job
router.patch("/approve/:id", protectRoute, adminRoute, Jobs.approveJob);

router.patch("/decline/:id", protectRoute, adminRoute, Jobs.declineJob);

export default router;