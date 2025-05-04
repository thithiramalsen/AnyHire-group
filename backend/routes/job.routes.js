import express from "express";
import {
  getJobs,
  getJobById,
  addJob,
  updateJob,
  deleteJob,
  getJobsByStatus,
  getJobsByUserId,
  getJobsApproved,
  approveJob,
  declineJob,
  setJobToPending,
  getPublicApprovedJobs,
  getAvailableJobs
} from "../controllers/job.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/public/approved", getPublicApprovedJobs);
router.get("/available", getAvailableJobs);

// Protected routes
router.get("/", verifyToken, getJobs);
router.get("/:id", verifyToken, getJobById);
router.post("/", verifyToken, addJob);
router.patch("/:id", verifyToken, updateJob);
router.delete("/:id", verifyToken, deleteJob);
router.get("/status", verifyToken, getJobsByStatus);
router.get("/user/:userId", verifyToken, getJobsByUserId);
router.get("/approved", verifyToken, getJobsApproved);
router.patch("/approve/:id", verifyToken, approveJob);
router.patch("/decline/:id", verifyToken, declineJob);
router.patch("/pending/:id", verifyToken, setJobToPending);

export default router; 