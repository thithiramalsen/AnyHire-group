import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { 
    ChatBubbleLeftIcon, 
    CheckIcon, 
    XMarkIcon,
    UserGroupIcon,
    AdjustmentsHorizontalIcon 
} from "@heroicons/react/24/outline";

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

    const handleReply = async (e) => {
        e.preventDefault();
        if (!selectedTicket || !reply.trim()) return;

        setLoading(true);
        try {
            await axios.patch(`/ticket/reply/${selectedTicket._id}`, { reply });
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

    // Filter and group tickets
    const processedTickets = () => {
        let filteredTickets = [...tickets];
        
        // Apply status filter
        if (filterStatus !== "all") {
            filteredTickets = filteredTickets.filter(ticket => 
                ticket.status.toLowerCase() === filterStatus.toLowerCase()
            );
        }

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

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-emerald-400">Support Tickets Management</h2>
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
                                            // ... Ticket item component (same as below)
                                            <TicketItem 
                                                key={ticket._id}
                                                ticket={ticket}
                                                isSelected={selectedTicket?._id === ticket._id}
                                                onSelect={() => setSelectedTicket(ticket)}
                                                onStatusChange={handleUpdateStatus}
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
                                        getStatusColor={getStatusColor}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reply Section - Keep existing code */}
                    {/* ... existing reply section code ... */}
                </div>
            </div>
        </div>
    );
};

// Ticket Item Component
const TicketItem = ({ ticket, isSelected, onSelect, onStatusChange, getStatusColor }) => (
    <div
        className={`bg-gray-800 p-4 rounded-lg shadow-lg cursor-pointer transition duration-300 ${
            isSelected ? "ring-2 ring-emerald-500" : ""
        }`}
        onClick={onSelect}
    >
        <div className="flex justify-between items-start mb-2">
            <div>
                <h4 className="text-lg font-semibold text-white">{ticket.subject}</h4>
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
            </div>
        </div>
        <p className="text-gray-300 mb-2">{ticket.message}</p>
        <div className="text-xs text-gray-400">
            Created: {new Date(ticket.createdAt).toLocaleString()}
        </div>
    </div>
);

export default SupportAdminTab;