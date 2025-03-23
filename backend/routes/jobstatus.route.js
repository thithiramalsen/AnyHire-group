import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createJobStatus,
  getJobStatus,
  updateJobStatus,
  deleteJobStatus,
  getstatus,
  getJobStatusbycat,

} from "../controllers/jobstatus.controller.js";

const router = express.Router();

router.post("/getjobstatusbycat", getJobStatusbycat);
router.post("/", protectRoute, createJobStatus);
router.get("/getstatus", protectRoute, getstatus);
router.get("/getstatusbyid", protectRoute, getJobStatus);
router.put("/:id", protectRoute, updateJobStatus);
router.delete("/deletestatus/:id", protectRoute, deleteJobStatus);

export default router;