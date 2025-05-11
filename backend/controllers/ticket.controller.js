import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../lib/email.js";
import NotificationService from "../services/notification.service.js";

export const createTicket = async (req, res) => {
    try {
        const { subject, message, phoneNumber, priority } = req.body;  // Add priority here
        
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
            priority: priority || "Normal",  // Add this line
            status: "Open"
        });

        const savedTicket = await ticket.save();

        // Get all admin users
        const adminUsers = await User.find({ role: 'admin' });

        // Send notification to all admins
        await Promise.all(adminUsers.map(admin => 
            NotificationService.createNotification(
                admin._id,
                'TICKET',
                'New Support Ticket',
                `New ticket created: ${ticket.subject}`,
                {
                    ticket: `/secret-dashboard?tab=tickets&ticket=${ticket._id}`,
                    profile: `/user/${req.user._id}`
                }
            )
        ));

        // Send confirmation to user
        await sendEmail({
            to: user.email,
            subject: `Support Ticket Created - #${String(savedTicket._id).padStart(6, '0')}`,
            html: `
                <h2>Support Ticket Created</h2>
                <p>Dear ${user.name},</p>
                <p>Your support ticket has been created successfully.</p>
                <p><strong>Ticket Number:</strong> #${String(savedTicket._id).padStart(6, '0')}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981;">
                    ${message}
                </div>
                <p>We will respond to your ticket as soon as possible.</p>
                <p>Best regards,<br>AnyHire Support Team</p>
            `
        });

        // Notify support email instead of all admin emails
        await sendEmail({
            to: process.env.EMAIL_USER || "anyhirelk@gmail.com",
            subject: `${ticket.priority === "Urgent" ? "🔴 URGENT: " : ""}New Support Ticket - #${String(savedTicket._id).padStart(6, '0')}`,
            html: `
                <h2 style="color: ${ticket.priority === "Urgent" ? "#EF4444" : "#10b981"}">
                    ${ticket.priority === "Urgent" ? "🔴 URGENT: " : ""}New Support Ticket
                </h2>
                <p>A new ${ticket.priority.toLowerCase()} priority ticket has been created:</p>
                <p><strong>Ticket Number:</strong> #${String(savedTicket._id).padStart(6, '0')}</p>
                <p><strong>From:</strong> ${user.name} (${user.email})</p>
                <p><strong>Priority:</strong> <span style="color: ${ticket.priority === "Urgent" ? "#EF4444" : "#10b981"}">${ticket.priority}</span></p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: ${ticket.priority === "Urgent" ? "4px solid #EF4444" : "4px solid #10b981"}">
                    ${message}
                </div>
                <p>Please log in to the admin panel to respond.</p>
            `
        });

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

        // Add the admin reply with correct fields
        ticket.replies.push({
            message: reply.trim(),
            isAdmin: true,
            adminId: req.user._id,
            adminName: req.user.name,
            userId: ticket.userId,    // Add the ticket owner's userId
            userName: ticket.name,    // Add the ticket owner's name
            createdAt: new Date()
        });

        ticket.status = "In Progress";
        ticket.updatedAt = new Date();
        await ticket.save();

        // Create notification for user when admin replies
        await NotificationService.createNotification(
            ticket.userId,
            'TICKET',
            'Support Ticket Update',
            `Admin has replied to your ticket: ${ticket.subject}`,
            {
                ticket: `/tickets/${ticket._id}`,
                profile: `/user/${req.user._id}`
            }
        );

        // Send email notification
        await sendEmail({
            to: ticket.email,
            subject: `Re: Ticket #${String(ticket._id).padStart(6, '0')} - ${ticket.subject}`,
            html: `
                <h2>Support Ticket Update</h2>
                <p>Dear ${ticket.name},</p>
                <p>Our support team has replied to your ticket:</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981;">
                    ${reply}
                </div>
                <p><strong>Ticket Number:</strong> #${String(ticket._id).padStart(6, '0')}</p>
                <p><strong>Subject:</strong> ${ticket.subject}</p>
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

        const oldStatus = ticket.status;
        ticket.status = status;
        await ticket.save();

        // Create notification for user when ticket status changes
        await NotificationService.createNotification(
            ticket.userId,
            'TICKET',
            'Ticket Status Updated',
            `Your ticket "${ticket.subject}" status has been changed from ${oldStatus} to ${status}`,
            {
                ticket: `/tickets/${ticket._id}`
            }
        );

        res.json(ticket);
    } catch (error) {
        console.error("Error updating ticket status:", error);
        res.status(500).json({ message: "Error updating ticket status" });
    }
};

export const addUserReply = async (req, res) => {
    try {
        const { reply } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Verify this is the ticket owner
        if (ticket.userId !== req.user._id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Add user's reply with correct fields
        ticket.replies.push({
            message: reply.trim(),
            isAdmin: false,
            userId: req.user._id,
            userName: req.user.name,
            createdAt: new Date()
        });

        ticket.status = "Open"; // Change status back to Open when user replies
        ticket.updatedAt = new Date();
        await ticket.save();

        // Get all admin users and notify them
        const adminUsers = await User.find({ role: 'admin' });
        await Promise.all(adminUsers.map(admin => 
            NotificationService.createNotification(
                admin._id,
                'TICKET',
                'New Ticket Reply',
                `${ticket.name} has replied to ticket: ${ticket.subject}`,
                {
                    ticket: `/secret-dashboard?tab=tickets&ticket=${ticket._id}`,
                    profile: `/user/${ticket.userId}`
                }
            )
        ));

        // Notify support email
        await sendEmail({
            to: process.env.EMAIL_USER || "anyhirelk@gmail.com", // Use the main support email
            subject: `New Reply to Ticket #${String(ticket._id).padStart(6, '0')} - ${ticket.subject}`,
            html: `
                <h2>New Ticket Reply</h2>
                <p>User ${ticket.name} has replied to ticket #${String(ticket._id).padStart(6, '0')}:</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981;">
                    ${reply}
                </div>
                <p><strong>Ticket Subject:</strong> ${ticket.subject}</p>
                <p>Please log in to the admin panel to respond.</p>
            `
        });

        res.json(ticket);
    } catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).json({ message: "Error adding reply" });
    }
};

// Add this new function
export const deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Send notification to user about ticket deletion
        await sendEmail({
            to: ticket.email,
            subject: `Support Ticket #${String(ticket._id).padStart(6, '0')} Deleted`,
            html: `
                <h2>Support Ticket Deleted</h2>
                <p>Dear ${ticket.name},</p>
                <p>Your support ticket has been deleted by an administrator:</p>
                <p><strong>Ticket Number:</strong> #${String(ticket._id).padStart(6, '0')}</p>
                <p><strong>Subject:</strong> ${ticket.subject}</p>
                <p>If you still need assistance, please create a new support ticket.</p>
                <p>Best regards,<br>AnyHire Support Team</p>
            `
        });

        await Ticket.findByIdAndDelete(req.params.id);
        res.json({ message: "Ticket deleted successfully" });
    } catch (error) {
        console.error("Error deleting ticket:", error);
        res.status(500).json({ message: "Error deleting ticket" });
    }
};