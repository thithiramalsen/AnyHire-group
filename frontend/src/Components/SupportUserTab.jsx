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
        <div className="p-6 bg-gradient-to-b from-gray-900 via-gray-900 to-emerald-900/20 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">Support Tickets</h2>
                
                {/* Description Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8 border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-3">Submit a Support Ticket</h3>
                    <p className="text-gray-300 leading-relaxed">
                        Encountered an issue or need assistance? We're here to help! Fill out the support ticket form with all the details, 
                        and our team will review your request promptly. Whether it's a technical issue, account concern, or a general inquiry, 
                        we'll ensure you get the support you need.
                    </p>
                </div>
                
                {/* Create New Ticket Form */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-8 border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                        Create New Ticket
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={newTicket.subject}
                                onChange={(e) => handleFieldChange('subject', e.target.value)}
                                onBlur={() => handleBlur('subject')}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                required
                            />
                            {touched.subject && errors.subject && (
                                <div className="text-red-400 text-xs mt-2 flex items-center gap-1">
                                    <span>⚠️</span> {errors.subject}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Priority
                                </label>
                                <select
                                    value={newTicket.priority}
                                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={newTicket.phoneNumber}
                                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                                    onBlur={() => handleBlur('phoneNumber')}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                    required
                                />
                                {touched.phoneNumber && errors.phoneNumber && (
                                    <div className="text-red-400 text-xs mt-2 flex items-center gap-1">
                                        <span>⚠️</span> {errors.phoneNumber}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Message
                            </label>
                            <textarea
                                value={newTicket.message}
                                onChange={(e) => handleFieldChange('message', e.target.value)}
                                onBlur={() => handleBlur('message')}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                rows="4"
                                required
                            />
                            {touched.message && errors.message && (
                                <div className="text-red-400 text-xs mt-2 flex items-center gap-1">
                                    <span>⚠️</span> {errors.message}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 px-6 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <span className="animate-spin mr-2">⏳</span>
                                    Submitting...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                                    Submit Ticket
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Tickets List */}
                <div className="space-y-8">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                        Your Tickets
                    </h3>
                    {tickets.length === 0 ? (
                        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl text-center border border-gray-700/50">
                            <p className="text-gray-400">No tickets found</p>
                        </div>
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
                                            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300"
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
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        status === "Open" ? "bg-yellow-500/20 text-yellow-400" :
                                                        status === "In Progress" ? "bg-blue-500/20 text-blue-400" :
                                                        status === "Resolved" ? "bg-green-500/20 text-green-400" :
                                                        "bg-gray-500/20 text-gray-400"
                                                    }`}>
                                                        {status}
                                                    </span>
                                                    <PriorityTag priority={ticket.priority} />
                                                </div>
                                            </div>
                                            <p className="text-gray-300 mb-4">{ticket.message}</p>
                                            
                                            {ticket.replies && ticket.replies.length > 0 && (
                                                <div className="mt-4 space-y-3 pt-4 border-t border-gray-700/50">
                                                    <p className="text-sm font-medium text-gray-400">Replies:</p>
                                                    {ticket.replies.map((reply, index) => (
                                                        <div key={index} className="bg-gray-700/50 p-4 rounded-xl">
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
                                                <div className="mt-4 pt-4 border-t border-gray-700/50">
                                                    {replyingTo === ticket._id ? (
                                                        <div className="space-y-3">
                                                            <textarea
                                                                value={reply}
                                                                onChange={(e) => setReply(e.target.value)}
                                                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                                                                rows="4"
                                                                placeholder="Type your reply..."
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyingTo(null);
                                                                        setReply("");
                                                                    }}
                                                                    className="px-4 py-2 bg-gray-700/50 text-white rounded-xl hover:bg-gray-600/50 transition-all duration-300"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReply(ticket._id)}
                                                                    disabled={loading}
                                                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300"
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
                                                            className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
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