import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
    createTicket,
    getUserTickets,
    getAllTickets,
    replyToTicket,
    updateTicketStatus,
    addUserReply,
    deleteTicket
} from "../controllers/ticket.controller.js";


const router = express.Router();

// User routes
router.post("/create", protectRoute, createTicket);
router.get("/user", protectRoute, getUserTickets);
router.post("/:id/reply", protectRoute, addUserReply);

// Admin routes
router.get("/admin", protectRoute, adminRoute, getAllTickets);
router.patch("/reply/:id", protectRoute, adminRoute, replyToTicket);
router.patch("/:id/status", protectRoute, adminRoute, updateTicketStatus);
router.delete("/:id", protectRoute, adminRoute, deleteTicket);


export default router;