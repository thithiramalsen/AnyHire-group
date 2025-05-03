import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useUserStore } from '../stores/useUserStore';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';

const Chat = ({ bookingId }) => {
    console.debug('[Chat] Component initialized with bookingId:', bookingId);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useUserStore();
    const socketRef = useRef(null);
    const loginToastShownRef = useRef(false);

    useEffect(() => {
        console.debug('[Chat] Effect triggered. User:', user);
        if (!user || !user.accessToken) {
            if (!loginToastShownRef.current) {
                console.debug('[Chat] Showing login toast');
                toast.error('Please login to use chat');
                loginToastShownRef.current = true;
            }
            return;
        }

        // Reset the toast flag when user becomes available
        loginToastShownRef.current = false;

        // Get the base URL for socket connection
        const baseURL = 'http://localhost:5000';
        console.debug('[Chat] Socket connection URL:', baseURL);

        // Initialize socket connection only if not already initialized
        if (!socketRef.current) {
            console.debug('[Chat] Initializing socket with token:', user.accessToken);
            
            socketRef.current = io(baseURL, {
                auth: { token: `Bearer ${user.accessToken}` },
                transports: ['websocket', 'polling'],
                path: '/socket.io/',
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                withCredentials: true
            });

            socketRef.current.on('connect', () => {
                console.debug('[Chat] Socket connected successfully');
                setIsConnected(true);
                socketRef.current.emit('join_booking', bookingId);
                console.debug('[Chat] Joined booking room:', bookingId);
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('[Chat] Socket connection error:', error);
                setIsConnected(false);
                toast.error('Connection error. Please refresh the page.');
            });

            socketRef.current.on('receive_message', (message) => {
                console.debug('[Chat] Message received:', message);
                setMessages(prev => [...prev, {
                    _id: message._id,
                    senderId: message.senderId,
                    senderName: message.senderName,
                    message: message.message,
                    timestamp: message.timestamp
                }]);
            });

            socketRef.current.on('disconnect', () => {
                console.debug('[Chat] Socket disconnected');
                setIsConnected(false);
            });

            // Fetch existing messages after connection
            const fetchMessages = async () => {
                try {
                    console.debug('[Chat] Fetching messages for booking:', bookingId);
                    const response = await axios.get(`/chat/${bookingId}`);
                    console.debug('[Chat] Messages fetched:', response.data.length);
                    setMessages(response.data);
                } catch (error) {
                    console.error('[Chat] Error fetching messages:', error);
                    toast.error('Failed to load chat history');
                }
            };

            fetchMessages();
        }

        return () => {
            if (socketRef.current) {
                console.debug('[Chat] Cleaning up socket connection');
                socketRef.current.emit('leave_booking', bookingId);
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [bookingId, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isConnected || !socketRef.current) return;

        console.debug('[Chat] Sending message:', newMessage.trim());
        socketRef.current.emit('send_message', {
            bookingId,
            message: newMessage.trim()
        });

        setNewMessage('');
    };

    if (!user) {
        return <div className="text-center text-gray-500">Please login to use chat</div>;
    }

    return (
        <div className="flex flex-col h-[500px] bg-gray-800 rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Chat</h3>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                                msg.senderId === user._id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-white'
                            }`}
                        >
                            <div className="text-sm font-semibold mb-1">
                                {msg.senderId === user._id ? 'You' : msg.senderName}
                            </div>
                            <div className="text-sm">{msg.message}</div>
                            <div className="text-xs opacity-70 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isConnected ? "Type your message..." : "Connecting..."}
                        disabled={!isConnected}
                        className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!isConnected}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;