import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
    createContact,
    getAllContacts,
    replyToContact
} from "../controllers/contact.controller.js";

const router = express.Router();

// Public route - no authentication needed
router.post("/create", createContact);

// Admin routes
router.get("/admin", protectRoute, adminRoute, getAllContacts);
router.post("/reply/:id", protectRoute, adminRoute, replyToContact);

export default router;