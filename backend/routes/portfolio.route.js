import express from "express";
import {
    getPortfolio,
    getPortfolioItems,
    getUserPortfolio,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
} from "../controllers/portfolio.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getPortfolio );
router.post("/getportfolio", protectRoute, getPortfolioItems);
router.get("/getportfolio", protectRoute, getPortfolioItems);
router.post("/portfoliobycat", getUserPortfolio);
router.post("/", protectRoute, createPortfolioItem);
router.put("/upportfolio/:id", protectRoute, updatePortfolioItem);
router.delete("/:id", protectRoute, deletePortfolioItem);

export default router;