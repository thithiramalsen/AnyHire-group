import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
// Import your chat controllers
import { getChatMessages, sendMessage, deleteMessage, editMessage } from "../controllers/chat.controller.js";

const router = express.Router();

// Protect all chat routes
router.use(protectRoute);

router.get("/:bookingId", getChatMessages);
router.post("/:bookingId", sendMessage);
router.delete("/:messageId", deleteMessage);
router.put("/:messageId", editMessage);

export default router;