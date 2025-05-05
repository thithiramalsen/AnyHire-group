import Chat from "../models/chat.model.js";
import Booking from "../models/booking.model.js";

export const getChatMessages = async (req, res) => {
    console.log('getChatMessages called with params:', {
        bookingId: req.params.bookingId,
        userId: req.user?._id
    });

    try {
        const bookingId = parseInt(req.params.bookingId);
        console.log('Parsed bookingId:', bookingId);

        if (isNaN(bookingId)) {
            console.warn('Invalid booking ID format received');
            return res.status(400).json({ message: "Invalid booking ID format" });
        }

        console.log('Finding booking with ID:', bookingId);
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            console.warn('Booking not found:', bookingId);
            return res.status(404).json({ message: "Booking not found" });
        }

        console.log('Checking user authorization:', {
            userId: req.user._id,
            seekerId: booking.seekerId,
            posterId: booking.posterId
        });

        if (booking.seekerId !== req.user._id && 
            booking.posterId !== req.user._id) {
            console.warn('Unauthorized access attempt:', {
                userId: req.user._id,
                bookingId
            });
            return res.status(403).json({ message: "Not authorized to view these messages" });
        }

        console.log('Fetching messages for booking:', bookingId);
        const messages = await Chat.find({ bookingId })
            .sort({ timestamp: 1 })
            .populate('senderId', 'name');

        // Format messages to match socket message format
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            senderId: msg.senderId._id,
            senderName: msg.senderId.name,
            message: msg.message,
            timestamp: msg.timestamp
        }));

        console.log(`Found ${formattedMessages.length} messages`);
        res.status(200).json(formattedMessages);
    } catch (error) {
        console.error("Detailed error in getChatMessages:", {
            error: error.message,
            stack: error.stack,
            bookingId: req.params.bookingId
        });
        res.status(500).json({ message: "Error fetching chat messages" });
    }
};

export const sendMessage = async (req, res) => {
    console.log('sendMessage called with:', {
        bookingId: req.params.bookingId,
        userId: req.user?._id,
        messageLength: req.body.message?.length
    });

    try {
        const bookingId = parseInt(req.params.bookingId);
        const { message } = req.body;

        console.log('Parsed request data:', { bookingId, message });

        if (isNaN(bookingId)) {
            console.warn('Invalid booking ID format in send message');
            return res.status(400).json({ message: "Invalid booking ID format" });
        }

        console.log('Verifying booking:', bookingId);
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            console.warn('Booking not found for message:', bookingId);
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.seekerId !== req.user._id && 
            booking.posterId !== req.user._id) {
            console.warn('Unauthorized message attempt:', {
                userId: req.user._id,
                bookingId
            });
            return res.status(403).json({ message: "Not authorized to send messages" });
        }

        console.log('Creating new message:', { bookingId, senderId: req.user._id, message });
        const newMessage = new Chat({
            bookingId,
            senderId: req.user._id,
            message,
        });

        await newMessage.save();
        await newMessage.populate('senderId', 'name');

        console.log('Message saved successfully:', newMessage);
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Detailed error in sendMessage:", {
            error: error.message,
            stack: error.stack,
            bookingId: req.params.bookingId
        });
        res.status(500).json({ message: "Error sending message" });
    }
};

export const deleteMessage = async (req, res) => {
    console.log('deleteMessage called with:', {
        messageId: req.params.messageId,
        userId: req.user?._id
    });

    try {
        const messageId = parseInt(req.params.messageId);
        console.log('Parsed messageId:', messageId);

        if (isNaN(messageId)) {
            console.warn('Invalid message ID format received');
            return res.status(400).json({ message: "Invalid message ID format" });
        }

        // Find the message
        const message = await Chat.findById(messageId);
        if (!message) {
            console.warn('Message not found:', messageId);
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if the user is the sender of the message
        if (message.senderId.toString() !== req.user._id.toString()) {
            console.warn('Unauthorized deletion attempt:', {
                userId: req.user._id,
                messageId
            });
            return res.status(403).json({ message: "Not authorized to delete this message" });
        }

        // Delete the message
        await Chat.findByIdAndDelete(messageId);
        console.log('Message deleted successfully:', messageId);

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error in deleteMessage:", error);
        res.status(500).json({ message: "Error deleting message" });
    }
};

export const editMessage = async (req, res) => {
    console.log('editMessage called with:', {
        messageId: req.params.messageId,
        userId: req.user?._id,
        message: req.body.message
    });

    try {
        const messageId = parseInt(req.params.messageId);
        const { message } = req.body;

        console.log('Parsed messageId:', messageId);

        if (isNaN(messageId)) {
            console.warn('Invalid message ID format received');
            return res.status(400).json({ message: "Invalid message ID format" });
        }

        if (!message || message.trim() === '') {
            console.warn('Empty message received');
            return res.status(400).json({ message: "Message cannot be empty" });
        }

        // Find the message
        const existingMessage = await Chat.findById(messageId);
        if (!existingMessage) {
            console.warn('Message not found:', messageId);
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if the user is the sender of the message
        if (existingMessage.senderId.toString() !== req.user._id.toString()) {
            console.warn('Unauthorized edit attempt:', {
                userId: req.user._id,
                messageId
            });
            return res.status(403).json({ message: "Not authorized to edit this message" });
        }

        // Update the message
        existingMessage.message = message;
        await existingMessage.save();
        console.log('Message updated successfully:', messageId);

        res.status(200).json({ message: "Message updated successfully" });
    } catch (error) {
        console.error("Error in editMessage:", error);
        res.status(500).json({ message: "Error updating message" });
    }
};