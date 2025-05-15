import express from "express";
import {
  getAllCategories,
  addCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route for getting categories
router.get("/public", getAllCategories);

// Protected routes
router.get("/", protectRoute, getAllCategories);
router.post("/", protectRoute, adminRoute, addCategory);
router.get("/:id", protectRoute, getCategoryById);
router.put("/:id", protectRoute, adminRoute, updateCategory);
router.delete("/:id", protectRoute, adminRoute, deleteCategory);

export default router;