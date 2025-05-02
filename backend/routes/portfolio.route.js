import express from "express";
import {
    getPortfolioItems,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
} from "../controllers/portfolio.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import multer from "../lib/multer.js";

const router = express.Router();

const upload = multer.fields([
    { name: "images", maxCount: 5 },
    { name: "files", maxCount: 5 },
  ]);

router.get("/", protectRoute, getPortfolioItems);
router.post("/", protectRoute, upload, createPortfolioItem);
router.put("/:id", protectRoute, upload, updatePortfolioItem);
router.delete("/:id", protectRoute, deletePortfolioItem);

export default router;