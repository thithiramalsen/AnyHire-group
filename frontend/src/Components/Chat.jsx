import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useUserStore } from '../stores/useUserStore';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';
import { Trash2, Edit2, Check, X } from 'lucide-react';

const Chat = ({ bookingId }) => {
    console.debug('[Chat] Component initialized with bookingId:', bookingId);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editMessageText, setEditMessageText] = useState('');
    const messagesEndRef = useRef(null);
    const { user } = useUserStore();
    const socketRef = useRef(null);
    const loginToastShownRef = useRef(false);
    const typingTimeoutRef = useRef(null);

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
                    timestamp: message.timestamp,
                    status: 'delivered'
                }]);
                
                // Mark message as read
                socketRef.current.emit('mark_message_read', {
                    messageId: message._id,
                    bookingId
                });
            });

            socketRef.current.on('message_status', ({ messageId, status }) => {
                setMessages(prev => prev.map(msg => 
                    msg._id === messageId ? { ...msg, status } : msg
                ));
            });

            socketRef.current.on('message_deleted', ({ messageId }) => {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
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

            socketRef.current.on('message_edited', ({ messageId, message }) => {
                setMessages(prev => prev.map(msg => 
                    msg._id === messageId 
                        ? { ...msg, message } 
                        : msg
                ));
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
                    setMessages(response.data.map(msg => ({
                        ...msg,
                        status: 'delivered'
                    })));
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

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isConnected || !socketRef.current) return;

        const messageData = {
            bookingId,
            message: newMessage.trim()
        };

        console.debug('[Chat] Sending message:', messageData);
        socketRef.current.emit('send_message', messageData);
        setNewMessage('');
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
                            {editingMessageId === msg._id ? (
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={editMessageText}
                                        onChange={(e) => setEditMessageText(e.target.value)}
                                        className="bg-gray-700 text-white rounded px-2 py-1"
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => handleSaveEdit(msg._id)}
                                            className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-sm">{msg.message}</div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="text-xs opacity-70">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {msg.senderId === user._id && (
                                                <div className="text-xs opacity-70">
                                                    {msg.status === 'delivered' && '✓'}
                                                    {msg.status === 'read' && '✓✓'}
                                                </div>
                                            )}
                                            {msg.senderId === user._id && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEditMessage(msg._id, msg.message)}
                                                        className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg._id)}
                                                        className="text-xs opacity-70 hover:opacity-100 transition-opacity"
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
                ))}
                {typingUsers.length > 0 && (
                    <div className="text-sm text-gray-400 italic">
                        {typingUsers.map((u, i) => (
                            <span key={u.id}>
                                {u.name}{i < typingUsers.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                        {typingUsers.length === 1 ? ' is typing...' : ' are typing...'}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
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