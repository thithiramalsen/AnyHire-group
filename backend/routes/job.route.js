import express from "express";
import * as Jobs from "../controllers/job.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getProfile } from "../controllers/auth.controller.js"; // Correct import for getProfile

const router = express.Router();

// Job posting
router.post("/add", protectRoute, Jobs.addJob);

// Get all jobs
router.get("/get", Jobs.getjobs);

// Get a job by ID
router.get("/one", Jobs.getJobById);

// Update a job
router.patch("/up/:id", Jobs.updateJob);

// Delete a job
router.delete("/del/:id", Jobs.deleteJob);

router.get("/status", protectRoute, Jobs.getJobsByStatus); // Fetch jobs by status
router.patch("/approve/:id", protectRoute, adminRoute, Jobs.approveJob); // Approve a job



export default router;