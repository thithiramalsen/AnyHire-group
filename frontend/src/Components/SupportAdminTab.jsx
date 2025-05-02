import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { ChatBubbleLeftIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const SupportAdminTab = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await axios.get("/tickets/admin");
            setTickets(response.data);
        } catch (error) {
            toast.error("Failed to fetch tickets");
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!selectedTicket || !reply.trim()) return;

        setLoading(true);
        try {
            await axios.patch(`/tickets/reply/${selectedTicket._id}`, { reply });
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

    const getStatusColor = (status) => {
        switch (status) {
            case "Open":
                return "bg-yellow-500";
            case "In Progress":
                return "bg-blue-500";
            case "Resolved":
                return "bg-green-500";
            case "Closed":
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-emerald-400 mb-6">Support Tickets Management</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tickets List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-xl font-semibold text-white mb-4">All Tickets</h3>
                        {tickets.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No tickets found</p>
                        ) : (
                            tickets.map((ticket) => (
                                <div
                                    key={ticket._id}
                                    className={`bg-gray-800 p-4 rounded-lg shadow-lg cursor-pointer transition duration-300 ${
                                        selectedTicket?._id === ticket._id ? "ring-2 ring-emerald-500" : ""
                                    }`}
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-lg font-semibold text-white">
                                                {ticket.subject}
                                            </h4>
                                            <p className="text-sm text-gray-400">
                                                From: {ticket.name} ({ticket.email})
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 mb-2">{ticket.message}</p>
                                    <div className="text-xs text-gray-400">
                                        Created: {new Date(ticket.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Reply Section */}
                    <div className="lg:col-span-1">
                        {selectedTicket ? (
                            <div className="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Reply to Ticket</h3>
                                <form onSubmit={handleReply} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Reply Message
                                        </label>
                                        <textarea
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            rows="6"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center justify-center w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition duration-300"
                                    >
                                        {loading ? (
                                            <span className="animate-spin mr-2">⏳</span>
                                        ) : (
                                            <CheckIcon className="w-5 h-5 mr-2" />
                                        )}
                                        Send Reply
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                                <p className="text-gray-400">Select a ticket to reply</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportAdminTab; 