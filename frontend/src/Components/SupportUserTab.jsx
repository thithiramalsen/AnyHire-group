import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { ChatBubbleLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

const SupportUserTab = () => {
    const [tickets, setTickets] = useState([]);
    const [newTicket, setNewTicket] = useState({
        subject: "",
        message: "",
        phoneNumber: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await axios.get("/tickets/user");
            setTickets(response.data);
        } catch (error) {
            toast.error("Failed to fetch tickets");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post("/tickets/create", newTicket);
            toast.success("Ticket created successfully");
            setNewTicket({ subject: "", message: "", phoneNumber: "" });
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create ticket");
        } finally {
            setLoading(false);
        }
    };

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
                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={newTicket.phoneNumber}
                                onChange={(e) => setNewTicket({ ...newTicket, phoneNumber: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Message
                            </label>
                            <textarea
                                value={newTicket.message}
                                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                rows="4"
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
                                <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                            )}
                            Submit Ticket
                        </button>
                    </form>
                </div>

                {/* Tickets List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-4">Your Tickets</h3>
                    {tickets.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No tickets found</p>
                    ) : (
                        tickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                className="bg-gray-800 p-4 rounded-lg shadow-lg"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-lg font-semibold text-white">
                                        {ticket.subject}
                                    </h4>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        ticket.status === "Open" ? "bg-yellow-500" :
                                        ticket.status === "Resolved" ? "bg-green-500" :
                                        "bg-gray-500"
                                    }`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <p className="text-gray-300 mb-2">{ticket.message}</p>
                                {ticket.reply && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <p className="text-sm text-gray-400 mb-1">Admin Reply:</p>
                                        <p className="text-gray-300">{ticket.reply}</p>
                                    </div>
                                )}
                                <div className="text-xs text-gray-400 mt-2">
                                    Created: {new Date(ticket.createdAt).toLocaleString()}
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