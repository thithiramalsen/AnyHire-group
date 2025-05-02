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
        
        if (!reply || !reply.trim()) {
            return res.status(400).json({ message: "Reply cannot be empty" });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Add the reply with timestamp
        ticket.replies = ticket.replies || [];
        ticket.replies.push({
            message: reply.trim(),
            adminId: req.user._id,
            adminName: req.user.name,
            createdAt: new Date()
        });

        ticket.status = "In Progress";
        ticket.updatedAt = new Date();
        await ticket.save();

        // Send email notification
        await sendEmail({
            to: ticket.email,
            subject: `Re: ${ticket.subject} - Support Ticket Update`,
            html: `
                <h2>Support Ticket Update</h2>
                <p>Dear ${ticket.name},</p>
                <p>Our support team has replied to your ticket:</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981;">
                    ${reply}
                </div>
                <p><strong>Original Ticket:</strong> ${ticket.subject}</p>
                <p>You can view the full conversation by logging into your account.</p>
                <p>Best regards,<br>AnyHire Support Team</p>
            `
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