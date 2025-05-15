import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

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

    // Socket.IO middleware for authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            console.log('Socket.IO received token:', token);
            
            if (!token || !token.startsWith('Bearer ')) {
                return next(new Error('Invalid token format'));
            }

            const tokenValue = token.split(' ')[1];
            
            const decoded = jwt.verify(tokenValue, process.env.ACCESS_TOKEN_SECRET);
            
            const user = await User.findById(decoded.userId)
                .select('-password')
                .lean();
            
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.user._id);

        // Join booking room
        socket.on('join_booking', (bookingId) => {
            socket.join(`booking_${bookingId}`);
            console.log(`User ${socket.user._id} joined booking room: ${bookingId}`);
        });

        // Leave booking room
        socket.on('leave_booking', (bookingId) => {
            socket.leave(`booking_${bookingId}`);
            console.log(`User ${socket.user._id} left booking room: ${bookingId}`);
        });

        // Handle chat messages
        socket.on('send_message', async (data) => {
            const { bookingId, message } = data;
            console.log(`Message received in booking ${bookingId}:`, message);
            
            // Emit message to all users in the booking room
            io.to(`booking_${bookingId}`).emit('receive_message', {
                senderId: socket.user._id,
                senderName: socket.user.name,
                message,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.user._id);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
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