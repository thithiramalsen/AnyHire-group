import express from "express";
import {
    getPortfolioItems,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    getUserPortfolioItems
} from "../controllers/portfolio.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import multer from "../lib/multer.js";

const router = express.Router();

const upload = multer.fields([
    { name: "images", maxCount: 5 },
    { name: "files", maxCount: 5 },
]);

// Get portfolio items for a specific user
router.get("/user/:userId", protectRoute, getUserPortfolioItems);

// Get user's own portfolio items
router.get("/", protectRoute, getPortfolioItems);

// Create portfolio item
router.post("/", protectRoute, upload, createPortfolioItem);

// Update portfolio item
router.put("/:id", protectRoute, upload, updatePortfolioItem);

// Delete portfolio item
router.delete("/:id", protectRoute, deletePortfolioItem);

export default router;