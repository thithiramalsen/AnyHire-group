import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add/:jobId", protectRoute, addToCart);
router.get("/", protectRoute, getCart);
router.delete("/:id", protectRoute, removeFromCart);

export default router;