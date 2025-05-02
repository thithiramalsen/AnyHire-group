import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
    createTicket,
    getUserTickets,
    getAllTickets,
    replyToTicket,
    updateTicketStatus
} from "../controllers/ticket.controller.js";


const router = express.Router();

// User routes
router.post("/create", protectRoute, createTicket);
router.get("/user", protectRoute, getUserTickets);

// Admin routes
router.get("/admin", protectRoute, adminRoute, getAllTickets);
router.patch("/reply/:id", protectRoute, adminRoute, replyToTicket);

// ...existing routes...
router.patch("/:id/status", protectRoute, adminRoute, updateTicketStatus);


export default router; 