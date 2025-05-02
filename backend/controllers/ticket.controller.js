import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../lib/email.js";

export const createTicket = async (req, res) => {
    try {
        const { subject, message, phoneNumber } = req.body;
        
        // Validate input
        if (!subject || !message || !phoneNumber) {
            return res.status(400).json({ 
                message: "Please provide all required fields" 
            });
        }

        // Get user info from auth middleware
        const user = req.user;

        const ticket = new Ticket({
            userId: user._id,
            name: user.name,
            email: user.email,
            phoneNumber,
            subject,
            message,
            status: "Open"
        });

        const savedTicket = await ticket.save();
        
        // Debug log
        console.log('Ticket created:', savedTicket);

        res.status(201).json(savedTicket);
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ message: "Error creating ticket" });
    }
};

export const getUserTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching user tickets:", error);
        res.status(500).json({ message: "Error fetching tickets" });
    }
};

export const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching all tickets:", error);
        res.status(500).json({ message: "Error fetching tickets" });
    }
};

export const replyToTicket = async (req, res) => {
    try {
        const { reply } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        ticket.reply = reply;
        ticket.status = "Resolved";
        await ticket.save();

        // Send reply email
        await sendEmail({
            to: ticket.email,
            subject: "Reply to Your Support Ticket",
            text: `Your ticket has been resolved. Reply: ${reply}`
        });

        res.json(ticket);
    } catch (error) {
        console.error("Error replying to ticket:", error);
        res.status(500).json({ message: "Error replying to ticket" });
    }

    
};

export const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        ticket.status = status;
        await ticket.save();

        res.json(ticket);
    } catch (error) {
        console.error("Error updating ticket status:", error);
        res.status(500).json({ message: "Error updating ticket status" });
    }
};