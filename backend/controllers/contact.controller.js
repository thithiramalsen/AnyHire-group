import Contact from "../models/contact.model.js";
import { sendEmail } from "../lib/email.js";

export const createContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                message: "Please provide all required fields" 
            });
        }

        const contact = new Contact({
            name,
            email,
            subject,
            message,
        });

        const savedContact = await contact.save();

        // Send confirmation to user
        await sendEmail({
            to: email,
            subject: `Contact Form Submission - #${String(savedContact._id).padStart(6, '0')}`,
            html: `
                <h2>Thank you for contacting us</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you soon.</p>
                <p><strong>Reference Number:</strong> #${String(savedContact._id).padStart(6, '0')}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Your Message:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981;">
                    ${message}
                </div>
                <p>We will respond to your message as soon as possible.</p>
                <p>Best regards,<br>AnyHire Support Team</p>
            `
        });

        // Notify admin
        await sendEmail({
            to: process.env.EMAIL_USER || "anyhirelk@gmail.com",
            subject: `New Contact Form Submission - #${String(savedContact._id).padStart(6, '0')}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p>A new message has been received:</p>
                <p><strong>Reference Number:</strong> #${String(savedContact._id).padStart(6, '0')}</p>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981;">
                    ${message}
                </div>
                <p>Please log in to the admin panel to respond.</p>
            `
        });

        res.status(201).json({
            message: "Message sent successfully",
            referenceNumber: String(savedContact._id).padStart(6, '0')
        });
    } catch (error) {
        console.error("Error creating contact:", error);
        res.status(500).json({ message: "Error sending message" });
    }
};

export const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ message: "Error fetching contacts" });
    }
};

export const replyToContact = async (req, res) => {
    try {
        const { reply } = req.body;
        
        if (!reply?.trim()) {
            return res.status(400).json({ message: "Reply cannot be empty" });
        }

        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        // Add admin reply with numeric ID
        contact.replies.push({
            message: reply.trim(),
            adminId: req.user._id,  // This should now be a number from the counter
            adminName: req.user.name,
            createdAt: new Date()
        });

        contact.status = "In Progress";
        contact.updatedAt = new Date();
        await contact.save();

        // Send email to user
        await sendEmail({
            to: contact.email,
            subject: `Re: Your Message #${String(contact._id).padStart(6, '0')} - ${contact.subject}`,
            html: `
                <h2>Response to Your Message</h2>
                <p>Dear ${contact.name},</p>
                <p>Our support team has replied to your message:</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981;">
                    ${reply}
                </div>
                <p><strong>Reference Number:</strong> #${String(contact._id).padStart(6, '0')}</p>
                <p><strong>Original Subject:</strong> ${contact.subject}</p>
                <p>If you need to reply, please reply directly to this email.</p>
                <p>Best regards,<br>AnyHire Support Team</p>
            `
        });

        res.json(contact);
    } catch (error) {
        console.error("Error replying to contact:", error);
        res.status(500).json({ message: "Error sending reply" });
    }
};