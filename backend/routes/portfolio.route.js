import express from "express";
import {
    getPortfolioItems,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
} from "../controllers/portfolio.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getPortfolioItems);
router.post("/", protectRoute, createPortfolioItem);
router.put("/:id", protectRoute, updatePortfolioItem);
router.delete("/:id", protectRoute, deletePortfolioItem);

export default router;