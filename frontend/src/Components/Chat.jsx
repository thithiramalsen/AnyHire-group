import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useUserStore } from '../stores/useUserStore';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';
import { 
    Trash2, 
    Edit2, 
    Check, 
    X, 
    Send, 
    User, 
    Phone, 
    Video, 
    MoreVertical,
    Smile,
    Paperclip,
    Mic
} from 'lucide-react';
import chatBg from '../assets/chat-bg.jpg'; // adjust path if needed
import { motion, AnimatePresence } from 'framer-motion';

const Chat = ({ bookingId }) => {
    console.debug('[Chat] Component initialized with bookingId:', bookingId);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editMessageText, setEditMessageText] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useUserStore();
    const socketRef = useRef(null);
    const loginToastShownRef = useRef(false);
    const typingTimeoutRef = useRef(null);
    const lastMessageTimestampRef = useRef(null);
    const autoRefreshIntervalRef = useRef(null);
    const REFRESH_INTERVAL = 30000; // 30 seconds

    const fetchMessages = async () => {
        try {
            setIsRefreshing(true);
            console.debug('[Chat] Fetching messages for booking:', bookingId);
            const response = await axios.get(`/chat/${bookingId}`);
            console.debug('[Chat] Messages fetched:', response.data.length);
            
            // Only update messages if we have new ones
            if (response.data.length > 0) {
                const lastMessage = response.data[response.data.length - 1];
                if (!lastMessageTimestampRef.current || 
                    new Date(lastMessage.timestamp) > new Date(lastMessageTimestampRef.current)) {
                    setMessages(response.data.map(msg => ({
                        ...msg,
                        status: 'delivered'
                    })));
                    lastMessageTimestampRef.current = lastMessage.timestamp;
                }
            }
        } catch (error) {
            console.error('[Chat] Error fetching messages:', error);
            toast.error('Failed to load chat history');
        } finally {
            setIsRefreshing(false);
        }
    };

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
                // Only add message if it's not from the current user
                if (message.senderId !== user._id) {
                    setMessages(prev => {
                        // Check if message already exists
                        const messageExists = prev.some(msg => msg._id === message._id);
                        if (messageExists) {
                            return prev;
                        }
                        return [...prev, {
                    _id: message._id,
                    senderId: message.senderId,
                    senderName: message.senderName,
                    message: message.message,
                            timestamp: message.timestamp,
                            status: 'delivered'
                        }];
                    });
                    lastMessageTimestampRef.current = message.timestamp;
                }
            });

            socketRef.current.on('message_status', ({ messageId, status }) => {
                setMessages(prev => prev.map(msg => 
                    msg._id === messageId ? { ...msg, status } : msg
                ));
            });

            socketRef.current.on('message_deleted', ({ messageId }) => {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            });

            socketRef.current.on('message_edited', ({ messageId, message }) => {
                setMessages(prev => prev.map(msg => 
                    msg._id === messageId 
                        ? { ...msg, message } 
                        : msg
                ));
            });

            socketRef.current.on('typing', ({ userId, userName, isTyping }) => {
                setTypingUsers(prev => {
                    if (isTyping) {
                        return [...prev.filter(u => u.id !== userId), { id: userId, name: userName }];
                    } else {
                        return prev.filter(u => u.id !== userId);
                    }
                });
            });

            socketRef.current.on('disconnect', () => {
                console.debug('[Chat] Socket disconnected');
                setIsConnected(false);
            });

            // Initial message fetch
            fetchMessages();

            // Set up auto-refresh interval
            autoRefreshIntervalRef.current = setInterval(fetchMessages, REFRESH_INTERVAL);
        }

        return () => {
            if (socketRef.current) {
                console.debug('[Chat] Cleaning up socket connection');
                socketRef.current.emit('leave_booking', bookingId);
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            if (autoRefreshIntervalRef.current) {
                clearInterval(autoRefreshIntervalRef.current);
                autoRefreshIntervalRef.current = null;
            }
        };
    }, [bookingId, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleTyping = () => {
        if (!isConnected || !socketRef.current) return;

        setIsTyping(true);
        socketRef.current.emit('typing', {
            bookingId,
            isTyping: true
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketRef.current.emit('typing', {
                bookingId,
                isTyping: false
            });
        }, 2000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isConnected || !socketRef.current) return;

        const messageData = {
            bookingId,
            message: newMessage.trim()
        };

        try {
            // First save the message to the database
            const response = await axios.post(`/chat/${bookingId}`, messageData);
            console.debug('[Chat] Message saved to database:', response.data);

            // Add the message to local state with the database ID
            const newMessageObj = {
                _id: response.data._id,
                senderId: user._id,
                senderName: user.name,
                message: newMessage.trim(),
                timestamp: new Date(),
                status: 'delivered'
            };
            
            setMessages(prev => [...prev, newMessageObj]);
        setNewMessage('');

            // Then emit through socket with sender info
            socketRef.current.emit('send_message', {
                ...messageData,
                _id: response.data._id,
                senderId: user._id,
                senderName: user.name,
                timestamp: newMessageObj.timestamp,
                isSender: true // Add flag to identify sender
            });
        } catch (error) {
            console.error('[Chat] Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!isConnected || !socketRef.current) return;

        try {
            await axios.delete(`/chat/${messageId}`);
            socketRef.current.emit('delete_message', { messageId, bookingId });
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
            toast.success('Message deleted');
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Failed to delete message');
        }
    };

    const handleEditMessage = async (messageId, currentText) => {
        if (!isConnected || !socketRef.current) return;

        setEditingMessageId(messageId);
        setEditMessageText(currentText);
    };

    const handleSaveEdit = async (messageId) => {
        if (!isConnected || !socketRef.current) return;

        try {
            await axios.put(`/chat/${messageId}`, { message: editMessageText });
            socketRef.current.emit('edit_message', { 
                messageId, 
                bookingId, 
                message: editMessageText 
            });
            setMessages(prev => prev.map(msg => 
                msg._id === messageId 
                    ? { ...msg, message: editMessageText } 
                    : msg
            ));
            setEditingMessageId(null);
            setEditMessageText('');
            toast.success('Message updated');
        } catch (error) {
            console.error('Error editing message:', error);
            toast.error('Failed to update message');
        }
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditMessageText('');
    };

    if (!user) {
        return <div className="text-center text-gray-500">Please login to use chat</div>;
    }

    return (
        <div className="relative flex flex-col h-[600px] rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/20">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA4YzAgMi0yIDQtNCA0cy00LTItNC00IDItNCA0LTQgNCAyIDQgNHY0YzAgMi0yIDQtNCA0cy00LTItNC00IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii4wMiIvPjwvZz48L3N2Zz4=')] opacity-5" />
            
            {/* Chat Header */}
            <div className="relative p-4 border-b border-gray-700/30 bg-gray-800/20 backdrop-blur-md">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/50 shadow-lg">
                                {user.profileImage ? (
                                    <img 
                                        src={user.profileImage} 
                                        alt="Your profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                        <User size={20} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                            }`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                                Chat
                            </h3>
                            <p className="text-xs text-gray-400">
                                {isConnected ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-400 hover:text-emerald-400 transition-colors duration-200">
                            <Phone size={20} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-emerald-400 transition-colors duration-200">
                            <Video size={20} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-emerald-400 transition-colors duration-200">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="relative flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700/30 scrollbar-track-transparent">
                <AnimatePresence>
                {messages.map((msg) => (
                        <motion.div
                        key={msg._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                            <div className={`flex items-start gap-2 ${msg.senderId === user._id ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Profile Image */}
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-700/30 shadow-lg">
                                    {msg.senderId === user._id ? (
                                        user.profileImage ? (
                                            <img 
                                                src={user.profileImage} 
                                                alt="Your profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                                <User size={16} className="text-white" />
                                            </div>
                                        )
                                    ) : (
                                        msg.senderProfileImage ? (
                                            <img 
                                                src={msg.senderProfileImage} 
                                                alt={`${msg.senderName}'s profile`} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                                                <User size={16} className="text-white" />
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Message Content */}
                                <div
                                    className={`max-w-[70%] rounded-2xl p-3 shadow-lg transition-all duration-200 hover:shadow-xl backdrop-blur-md ${
                                msg.senderId === user._id
                                            ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
                                            : 'bg-gradient-to-br from-gray-700 to-gray-800'
                            }`}
                        >
                                    <div className="text-sm font-semibold mb-1 text-white/90">
                                {msg.senderId === user._id ? 'You' : msg.senderName}
                                    </div>
                                    
                                    {editingMessageId === msg._id ? (
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="text"
                                                value={editMessageText}
                                                onChange={(e) => setEditMessageText(e.target.value)}
                                                className="bg-gray-800/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                                autoFocus
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleSaveEdit(msg._id)}
                                                    className="text-xs bg-emerald-600/80 hover:bg-emerald-600 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1"
                                                >
                                                    <Check size={14} />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="text-xs bg-red-600/80 hover:bg-red-600 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1"
                                                >
                                                    <X size={14} />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-sm break-words text-white/90">{msg.message}</div>
                                            <div className="flex items-center justify-between mt-2 text-xs text-white/60">
                                                <div>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {msg.senderId === user._id && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-xs opacity-70">
                                                                {msg.status === 'delivered' && <span title="Delivered">✓</span>}
                                                                {msg.status === 'read' && <span title="Seen">✓✓</span>}
                                                            </div>
                                                            <button
                                                                onClick={() => handleEditMessage(msg._id, msg.message)}
                                                                className="opacity-60 hover:opacity-100 transition-opacity duration-200"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteMessage(msg._id)}
                                                                className="opacity-60 hover:opacity-100 transition-opacity duration-200 text-red-400"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {typingUsers.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-gray-400 italic"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span>
                                {typingUsers.map((u, i) => (
                                    <span key={u.id}>
                                        {u.name}{i < typingUsers.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                                <span className="inline-flex">
                                    {typingUsers.length === 1 ? ' is typing' : ' are typing'}
                                </span>
                            </span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="relative p-4 border-t border-gray-700/30 bg-gray-800/20 backdrop-blur-md">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <div className="flex items-center gap-2">
                            <button type="button" className="p-2 text-gray-400 hover:text-emerald-400 transition-colors duration-200">
                                <Paperclip size={20} />
                            </button>
                    <input
                        type="text"
                        value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                }}
                        placeholder={isConnected ? "Type your message..." : "Connecting..."}
                        disabled={!isConnected}
                                className="flex-1 bg-gray-700/30 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                            <button type="button" className="p-2 text-gray-400 hover:text-emerald-400 transition-colors duration-200">
                                <Smile size={20} />
                            </button>
                            <button type="button" className="p-2 text-gray-400 hover:text-emerald-400 transition-colors duration-200">
                                <Mic size={20} />
                            </button>
                        </div>
                    <button
                        type="submit"
                            disabled={!isConnected || !newMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed p-2"
                    >
                            <Send size={20} />
                    </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

// Add these styles to your global CSS or create a new CSS module
const styles = `
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.3s ease-out;
}

/* Custom Scrollbar */
.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(107, 114, 128, 0.3);
    border-radius: 20px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: rgba(107, 114, 128, 0.5);
}

/* Message Bubble Animation */
@keyframes bubble {
    0% {
        transform: scale(0.95);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.animate-bubble {
    animation: bubble 0.2s ease-out;
}
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Chat;