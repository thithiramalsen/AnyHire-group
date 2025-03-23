import express from "express";
import * as Jobs from "../controllers/job.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/uploadmiddleware.js";

const router = express.Router();

// Job posting
router.post("/add", protectRoute, upload.array("images", 5), Jobs.addJob);

// Get all jobs
router.get("/get", Jobs.getjobs);

// Get a job by ID
router.get("/one", Jobs.getJobById);

// Update a job
router.patch("/up/:id", Jobs.updateJob);

// Delete a job
router.delete("/del/:id", Jobs.deleteJob);

// Fetch jobs by status
router.get("/status", protectRoute, Jobs.getJobsByStatus);

// Approve a job
router.patch("/approve/:id", protectRoute, adminRoute, Jobs.approveJob);

export default router;