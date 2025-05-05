import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { ChatBubbleLeftIcon, PaperAirplaneIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useUserStore } from "../stores/useUserStore";
import { sortTickets, statusPriority } from "../utils/ticket.util";

const PriorityTag = ({ priority }) => {
    if (priority !== "Urgent") return null;
    
    return (
        <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full ml-2 animate-pulse">
            URGENT
        </span>
    );
};

const SupportUserTab = () => {
    const [tickets, setTickets] = useState([]);
    const [newTicket, setNewTicket] = useState({
        subject: "",
        message: "",
        phoneNumber: "",
        priority: "Normal" // Add this line
    });
    const [loading, setLoading] = useState(false);
    const { user } = useUserStore();

    // Add these new states
    const [replyingTo, setReplyingTo] = useState(null);
    const [reply, setReply] = useState("");
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (user) {
            fetchTickets();
        }
    }, [user]);

    const fetchTickets = async () => {
        try {
            const response = await axios.get("/ticket/user");
            console.log('Fetched tickets:', response.data);
            setTickets(response.data);
        } catch (error) {
            console.error("Fetch tickets error:", error);
            toast.error("Failed to fetch tickets");
        }
    };

    const validate = (fields = newTicket) => {
        const errs = {};
        if (!fields.subject || fields.subject.trim().length < 5) {
            errs.subject = 'Subject must be at least 5 characters.';
        }
        if (!fields.phoneNumber) {
            errs.phoneNumber = 'Phone number is required.';
        } else if (!/^[0-9]{10}$/.test(fields.phoneNumber)) {
            errs.phoneNumber = 'Phone number must be exactly 10 digits.';
        }
        if (!fields.message || fields.message.trim().length < 10) {
            errs.message = 'Message must be at least 10 characters.';
        }
        return errs;
    };

    // Validate on every change
    const handleFieldChange = (field, value) => {
        const updatedTicket = { ...newTicket, [field]: value };
        setNewTicket(updatedTicket);
        const validationErrors = validate(updatedTicket);
        setErrors(validationErrors);
    };

    // Mark field as touched on blur
    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const validationErrors = validate(newTicket);
        setErrors(validationErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to create a ticket");
            return;
        }
        // Mark all fields as touched
        setTouched({ subject: true, phoneNumber: true, message: true });
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post("/ticket/create", newTicket);
            toast.success("Ticket created successfully");
            setNewTicket({ subject: "", message: "", phoneNumber: "", priority: "Normal" });
            setErrors({});
            setTouched({});
            await fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create ticket");
        } finally {
            setLoading(false);
        }
    };

    // Add this new function
    const handleReply = async (ticketId) => {
        if (!reply.trim()) {
            toast.error("Reply cannot be empty");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`/ticket/${ticketId}/reply`, { reply: reply.trim() });
            toast.success("Reply sent successfully");
            setReply("");
            setReplyingTo(null);
            await fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reply");
        } finally {
            setLoading(false);
        }
    };

    // Group tickets by status
    const groupedTickets = tickets.reduce((acc, ticket) => {
        acc[ticket.status] = acc[ticket.status] || [];
        acc[ticket.status].push(ticket);
        return acc;
    }, {});

    // Sort status groups by priority
    const sortedStatusGroups = Object.entries(groupedTickets)
        .sort(([statusA], [statusB]) => statusPriority[statusA] - statusPriority[statusB]);

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-emerald-400 mb-6">Support Tickets</h2>
                
                {/* Create New Ticket Form */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Create New Ticket</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={newTicket.subject}
                                onChange={(e) => handleFieldChange('subject', e.target.value)}
                                onBlur={() => handleBlur('subject')}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                            {touched.subject && errors.subject && (
                                <div className="text-red-500 text-xs mt-1">{errors.subject}</div>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Priority
                                </label>
                                <select
                                    value={newTicket.priority}
                                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={newTicket.phoneNumber}
                                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                                    onBlur={() => handleBlur('phoneNumber')}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                                {touched.phoneNumber && errors.phoneNumber && (
                                    <div className="text-red-500 text-xs mt-1">{errors.phoneNumber}</div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Message
                            </label>
                            <textarea
                                value={newTicket.message}
                                onChange={(e) => handleFieldChange('message', e.target.value)}
                                onBlur={() => handleBlur('message')}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                rows="4"
                                required
                            />
                            {touched.message && errors.message && (
                                <div className="text-red-500 text-xs mt-1">{errors.message}</div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition duration-300"
                        >
                            {loading ? (
                                <span className="animate-spin mr-2">⏳</span>
                            ) : (
                                <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                            )}
                            Submit Ticket
                        </button>
                    </form>
                </div>

                {/* Updated Tickets List */}
                <div className="space-y-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Your Tickets</h3>
                    {tickets.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No tickets found</p>
                    ) : (
                        sortedStatusGroups.map(([status, statusTickets]) => (
                            <div key={status} className="space-y-4">
                                <h4 className="text-lg font-medium text-gray-300 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                        status === "Open" ? "bg-yellow-500" :
                                        status === "In Progress" ? "bg-blue-500" :
                                        status === "Resolved" ? "bg-green-500" :
                                        "bg-gray-500"
                                    }`}></span>
                                    {status} ({statusTickets.length})
                                </h4>
                                <div className="space-y-4">
                                    {sortTickets(statusTickets).map((ticket) => (
                                        <div
                                            key={ticket._id}
                                            className="bg-gray-800 p-6 rounded-lg shadow-lg"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-lg font-semibold text-white">
                                                            {ticket.subject}
                                                        </h4>
                                                        <span className="text-sm text-gray-400">
                                                            #{String(ticket._id).padStart(6, '0')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs ${
                                                        status === "Open" ? "bg-yellow-500" :
                                                        status === "In Progress" ? "bg-blue-500" :
                                                        status === "Resolved" ? "bg-green-500" :
                                                        "bg-gray-500"
                                                    } text-white`}>
                                                        {status}
                                                    </span>
                                                    <PriorityTag priority={ticket.priority} />
                                                </div>
                                            </div>
                                            <p className="text-gray-300 mb-4">{ticket.message}</p>
                                            
                                            {ticket.replies && ticket.replies.length > 0 && (
                                                <div className="mt-4 space-y-3 pt-4 border-t border-gray-700">
                                                    <p className="text-sm font-medium text-gray-400">Replies:</p>
                                                    {ticket.replies.map((reply, index) => (
                                                        <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                                            <p className="text-white">{reply.message}</p>
                                                            <div className="mt-2 text-xs text-gray-400">
                                                                By {reply.isAdmin ? (
                                                                    <span className="text-emerald-400">{reply.adminName} (Support Staff)</span>
                                                                ) : (
                                                                    <span className="text-blue-400">{reply.userName} (You)</span>
                                                                )} • {new Date(reply.createdAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {ticket.status !== "Closed" && (
                                                <div className="mt-4 pt-4 border-t border-gray-700">
                                                    {replyingTo === ticket._id ? (
                                                        <div className="space-y-3">
                                                            <textarea
                                                                value={reply}
                                                                onChange={(e) => setReply(e.target.value)}
                                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                                rows="4"
                                                                placeholder="Type your reply..."
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyingTo(null);
                                                                        setReply("");
                                                                    }}
                                                                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReply(ticket._id)}
                                                                    disabled={loading}
                                                                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                                                                >
                                                                    {loading ? (
                                                                        <span className="animate-spin mr-2">⏳</span>
                                                                    ) : (
                                                                        <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                                                                    )}
                                                                    Send Reply
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setReplyingTo(ticket._id)}
                                                            className="flex items-center text-emerald-400 hover:text-emerald-300"
                                                        >
                                                            <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                                                            Reply to Support
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
                                                <ClockIcon className="w-4 h-4" />
                                                Created: {new Date(ticket.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportUserTab;