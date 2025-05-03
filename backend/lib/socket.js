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
                
                console.log('Message broadcast to room:', `booking_${bookingId}`);
            } catch (error) {
                console.error('Error handling message:', error);
                socket.emit('error', { message: 'Failed to process message' });
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