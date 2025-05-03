import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { 
    ChatBubbleLeftIcon, 
    CheckIcon, 
    XMarkIcon,
    UserGroupIcon,
    AdjustmentsHorizontalIcon,
    PaperAirplaneIcon
} from "@heroicons/react/24/outline";
import { sortTickets, statusPriority } from "../utils/ticket.util";

// Add this component at the top of both SupportUserTab.jsx and SupportAdminTab.jsx
const PriorityTag = ({ priority }) => {
    if (priority !== "Urgent") return null;
    
    return (
        <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full ml-2 animate-pulse">
            URGENT
        </span>
    );
};

const SupportAdminTab = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [groupByUser, setGroupByUser] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await axios.get("/ticket/admin");
            setTickets(response.data);
        } catch (error) {
            console.error("Fetch tickets error:", error);
            toast.error("Failed to fetch tickets");
        }
    };

    const handleReply = async (replyMessage) => {
        if (!selectedTicket || !replyMessage.trim()) return;

        setLoading(true);
        try {
            await axios.patch(`/ticket/reply/${selectedTicket._id}`, { reply: replyMessage });
            toast.success("Reply sent successfully");
            setReply("");
            setSelectedTicket(null);
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reply");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (ticketId, newStatus) => {
        try {
            await axios.patch(`/ticket/${ticketId}/status`, { status: newStatus });
            toast.success("Status updated successfully");
            fetchTickets();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        toast((t) => (
            <div className="flex items-center gap-4">
                <p className="text-sm">Delete this ticket?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            toast.promise(
                                axios.delete(`/ticket/${ticketId}`).then(() => {
                                    fetchTickets(); // Refresh the tickets list
                                }),
                                {
                                    loading: 'Deleting...',
                                    success: 'Ticket deleted successfully',
                                    error: 'Failed to delete ticket'
                                }
                            );
                        }}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'top-center',
        });
    };

    // Filter and group tickets
    const processedTickets = () => {
        let filteredTickets = [...tickets];
        
        // Apply status filter
        if (filterStatus !== "all") {
            filteredTickets = filteredTickets.filter(ticket => 
                ticket.status.toLowerCase() === filterStatus.toLowerCase()
            );
        }

        // Sort tickets
        filteredTickets = sortTickets(filteredTickets);

        // Group by user if enabled
        if (groupByUser) {
            const grouped = {};
            filteredTickets.forEach(ticket => {
                const userId = ticket.userId;
                if (!grouped[userId]) {
                    grouped[userId] = {
                        user: { id: userId, name: ticket.name, email: ticket.email },
                        tickets: []
                    };
                }
                grouped[userId].tickets.push(ticket);
            });
            return grouped;
        }

        return filteredTickets;
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "open":
                return "bg-yellow-500";
            case "in progress":
                return "bg-blue-500";
            case "resolved":
                return "bg-green-500";
            case "closed":
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    const urgentCount = tickets.filter(t => t.priority === "Urgent" && t.status !== "Closed").length;

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-emerald-400">Support Tickets Management</h2>
                    {urgentCount > 0 && (
                        <div className="text-red-500 font-semibold animate-pulse flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            {urgentCount} Urgent {urgentCount === 1 ? "Ticket" : "Tickets"} Pending
                        </div>
                    )}
                    <div className="flex gap-4">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-gray-700 text-white rounded-md px-3 py-2"
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="in progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <button
                            onClick={() => setGroupByUser(!groupByUser)}
                            className={`flex items-center px-4 py-2 rounded-md ${
                                groupByUser ? 'bg-emerald-600' : 'bg-gray-700'
                            }`}
                        >
                            <UserGroupIcon className="w-5 h-5 mr-2" />
                            Group by User
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tickets List */}
                    <div className="lg:col-span-2 space-y-4">
                        {groupByUser ? (
                            Object.values(processedTickets()).map(({ user, tickets }) => (
                                <div key={user.id} className="bg-gray-800 p-4 rounded-lg mb-4">
                                    <h3 className="text-lg font-semibold text-white mb-3">
                                        {user.name} ({user.email})
                                    </h3>
                                    <div className="space-y-3">
                                        {tickets.map(ticket => (
                                            <TicketItem 
                                                key={ticket._id}
                                                ticket={ticket}
                                                isSelected={selectedTicket?._id === ticket._id}
                                                onSelect={() => setSelectedTicket(ticket)}
                                                onStatusChange={handleUpdateStatus}
                                                onDelete={handleDeleteTicket}
                                                getStatusColor={getStatusColor}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="space-y-4">
                                {processedTickets().map(ticket => (
                                    <TicketItem 
                                        key={ticket._id}
                                        ticket={ticket}
                                        isSelected={selectedTicket?._id === ticket._id}
                                        onSelect={() => setSelectedTicket(ticket)}
                                        onStatusChange={handleUpdateStatus}
                                        onDelete={handleDeleteTicket}
                                        getStatusColor={getStatusColor}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reply Section */}
                    <ReplySection 
                        ticket={selectedTicket} 
                        onReply={handleReply} 
                        loading={loading} 
                    />
                </div>
            </div>
        </div>
    );
};

// Ticket Item Component
const TicketItem = ({ ticket, isSelected, onSelect, onStatusChange, onDelete, getStatusColor }) => (
    <div
        className={`bg-gray-800 p-4 rounded-lg shadow-lg cursor-pointer transition duration-300 ${
            isSelected ? "ring-2 ring-emerald-500" : ""
        }`}
        onClick={onSelect}
    >
        <div className="flex justify-between items-start mb-2">
            <div>
                <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-white">
                        {ticket.subject}
                    </h4>
                    <span className="text-sm text-gray-400">
                        #{String(ticket._id).padStart(6, '0')}
                    </span>
                </div>
                <p className="text-sm text-gray-400">From: {ticket.name} ({ticket.email})</p>
            </div>
            <div className="flex items-center gap-2">
                <select
                    value={ticket.status}
                    onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(ticket._id, e.target.value);
                    }}
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                </select>
                <PriorityTag priority={ticket.priority} />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(ticket._id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete Ticket"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <p className="text-gray-300 mb-2">{ticket.message}</p>
        
        {ticket.replies && ticket.replies.length > 0 && (
            <div className="mt-4 space-y-3">
                {ticket.replies.map((reply, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-white">{reply.message}</p>
                        <div className="mt-2 text-xs text-gray-400">
                            By {reply.isAdmin ? (
                                <span className="text-emerald-400">{reply.adminName} (Support Staff)</span>
                            ) : (
                                <span className="text-blue-400">{reply.userName} (User)</span>
                            )} • {new Date(reply.createdAt).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        <div className="text-xs text-gray-400">
            Created: {new Date(ticket.createdAt).toLocaleString()}
        </div>
    </div>
);

// Reply Section Component
const ReplySection = ({ ticket, onReply, loading }) => {
    const [reply, setReply] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onReply(reply);
        setReply('');
    };

    return (
        <div className="lg:col-span-1 bg-gray-800 p-4 rounded-lg h-fit sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4">
                Reply to Ticket
                {ticket && (
                    <span className="text-sm text-gray-400 ml-2">
                        #{String(ticket._id).padStart(6, '0')}
                    </span>
                )}
            </h3>
            {ticket ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Replying to: {ticket.subject}
                        </label>
                        <textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                            rows="6"
                            placeholder="Type your reply..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                                Send Reply
                            </span>
                        )}
                    </button>
                </form>
            ) : (
                <p className="text-gray-400">Select a ticket to reply</p>
            )}
            
            {ticket && ticket.replies && ticket.replies.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Previous Replies</h4>
                    <div className="space-y-4">
                        {ticket.replies.map((reply, index) => (
                            <div key={index} className="bg-gray-700 p-3 rounded-lg">
                                <p className="text-white">{reply.message}</p>
                                <div className="mt-2 text-xs text-gray-400">
                                    By {reply.adminName} on {new Date(reply.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportAdminTab;