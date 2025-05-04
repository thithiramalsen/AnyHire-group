import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["Content-Type", "Authorization"]
        },
        path: '/socket.io/',
        transports: ['websocket', 'polling']
    });

    // Debug event for socket server
    io.engine.on("connection_error", (err) => {
        console.log('Socket server connection error:', err);
    });

    // Socket.IO middleware for authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            console.log('Socket authentication attempt from:', socket.handshake.address);
            console.log('Socket auth headers:', socket.handshake.headers);
            
            if (!token || !token.startsWith('Bearer ')) {
                console.log('Invalid token format received:', token);
                return next(new Error('Invalid token format'));
            }

            const tokenValue = token.split(' ')[1];
            console.log('Processing token for authentication');
            
            const decoded = jwt.verify(tokenValue, process.env.ACCESS_TOKEN_SECRET);
            console.log('Token decoded successfully, userId:', decoded.userId);
            
            const user = await User.findById(decoded.userId)
                .select('-password')
                .lean();
            
            if (!user) {
                console.log('User not found for id:', decoded.userId);
                return next(new Error('User not found'));
            }

            console.log('User authenticated successfully:', user._id);
            socket.user = user;
            next();
        } catch (error) {
            console.error('Socket authentication error:', error.message);
            next(new Error(`Authentication error: ${error.message}`));
        }
    });

    io.on('connection', (socket) => {
        console.log('New socket connection established. User:', socket.user._id);

        // Join booking room
        socket.on('join_booking', (bookingId) => {
            const room = `booking_${bookingId}`;
            socket.join(room);
            console.log(`User ${socket.user._id} joined booking room: ${bookingId}`);
            
            // Notify user of successful room join
            socket.emit('room_joined', { room, message: 'Successfully joined chat room' });
        });

        // Leave booking room
        socket.on('leave_booking', (bookingId) => {
            const room = `booking_${bookingId}`;
            socket.leave(room);
            console.log(`User ${socket.user._id} left booking room: ${bookingId}`);
        });

        // Handle typing indicators
        socket.on('typing', (data) => {
            const room = `booking_${data.bookingId}`;
            socket.to(room).emit('typing', {
                userId: socket.user._id,
                userName: socket.user.name,
                isTyping: data.isTyping
            });
        });

        // Handle chat messages
        socket.on('send_message', async (data) => {
            try {
                const { bookingId, message } = data;
                console.log(`Message received from ${socket.user._id} in booking ${bookingId}:`, message);
                
                // Create and save the message to the database
                const newMessage = new Chat({
                    bookingId: parseInt(bookingId),
                    senderId: socket.user._id,
                    message: message
                });

                await newMessage.save();
                console.log('Message saved to database:', newMessage);

                const messageData = {
                    _id: newMessage._id,
                    senderId: socket.user._id,
                    senderName: socket.user.name,
                    message: message,
                    timestamp: newMessage.timestamp
                };

                // Emit message to all users in the booking room
                io.to(`booking_${bookingId}`).emit('receive_message', messageData);
                
                // Update message status to delivered
                io.to(`booking_${bookingId}`).emit('message_status', {
                    messageId: newMessage._id,
                    status: 'delivered'
                });
                
                console.log('Message broadcast to room:', `booking_${bookingId}`);
            } catch (error) {
                console.error('Error handling message:', error);
                socket.emit('error', { message: 'Failed to process message' });
            }
        });

        // Handle message deletion
        socket.on('delete_message', async (data) => {
            try {
                const { messageId, bookingId } = data;
                
                // Verify the message belongs to the user trying to delete it
                const message = await Chat.findById(messageId);
                if (!message) {
                    throw new Error('Message not found');
                }
                
                if (message.senderId.toString() !== socket.user._id.toString()) {
                    throw new Error('Unauthorized to delete this message');
                }

                // Delete the message from the database
                await Chat.findByIdAndDelete(messageId);
                
                // Notify all users in the room about the deletion
                io.to(`booking_${bookingId}`).emit('message_deleted', { messageId });
                
                console.log(`Message ${messageId} deleted by ${socket.user._id}`);
            } catch (error) {
                console.error('Error deleting message:', error);
                socket.emit('error', { message: 'Failed to delete message' });
            }
        });

        // Handle message editing
        socket.on('edit_message', async (data) => {
            try {
                const { messageId, bookingId, message } = data;
                
                // Verify the message belongs to the user trying to edit it
                const existingMessage = await Chat.findById(messageId);
                if (!existingMessage) {
                    throw new Error('Message not found');
                }
                
                if (existingMessage.senderId.toString() !== socket.user._id.toString()) {
                    throw new Error('Unauthorized to edit this message');
                }

                // Update the message in the database
                existingMessage.message = message;
                await existingMessage.save();
                
                // Notify all users in the room about the edit
                io.to(`booking_${bookingId}`).emit('message_edited', { 
                    messageId, 
                    message 
                });
                
                console.log(`Message ${messageId} edited by ${socket.user._id}`);
            } catch (error) {
                console.error('Error editing message:', error);
                socket.emit('error', { message: 'Failed to edit message' });
            }
        });

        // Handle message read receipts
        socket.on('mark_message_read', async (data) => {
            try {
                const { messageId, bookingId } = data;
                const room = `booking_${bookingId}`;
                
                // Update message status to read
                io.to(room).emit('message_status', {
                    messageId,
                    status: 'read'
                });
                
                console.log(`Message ${messageId} marked as read by ${socket.user._id}`);
            } catch (error) {
                console.error('Error marking message as read:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.user._id);
        });

        socket.on('error', (error) => {
            console.error('Socket error for user', socket.user._id, ':', error);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};