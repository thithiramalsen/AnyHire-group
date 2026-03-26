import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import { Link } from 'react-router-dom';
import { 
    DollarSign, 
    Filter, 
    Calendar, 
    ArrowUpRight, 
    ArrowDownRight,
    FileText,
    Clock,
    ExternalLink
} from "lucide-react";

const PaymentsTab = () => {
    const { user } = useUserStore();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, sent, received
    const [sortOrder, setSortOrder] = useState("desc");
    const [viewType, setViewType] = useState("list"); // list, summary
    const [dateRange, setDateRange] = useState("all"); // all, month, year

    useEffect(() => {
        fetchPayments();
    }, [filter, dateRange]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            let endpoint = '/payment/user';
            
            // Add query parameters for filtering
            const params = new URLSearchParams();
            if (filter !== "all") params.append("type", filter);
            if (dateRange !== "all") params.append("range", dateRange);

            const response = await axios.get(`${endpoint}?${params.toString()}`);
            setPayments(response.data.payments);
        } catch (error) {
            console.error("Error fetching payments:", error);
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    const getPaymentStatus = (status) => {
        const statusColors = {
            pending: "text-yellow-400",
            awaiting_confirmation: "text-blue-400",
            confirmed: "text-green-400",
            completed: "text-emerald-400",
            reported: "text-red-400"
        };

        return (
            <span className={`px-2 py-1 rounded-full ${statusColors[status]} bg-opacity-20`}>
                {status.replace("_", " ").toUpperCase()}
            </span>
        );
    };

    const getSummaryData = () => {
        return payments.reduce((acc, payment) => {
            const isReceived = payment.bookingId.seekerId === user._id;
            
            if (isReceived) {
                acc.totalReceived += payment.amount;
                acc.receivedCount++;
            } else {
                acc.totalSent += payment.amount;
                acc.sentCount++;
            }

            return acc;
        }, {
            totalSent: 0,
            totalReceived: 0,
            sentCount: 0,
            receivedCount: 0
        });
    };

    const renderSummaryView = () => {
        const summary = getSummaryData();
        
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Payments Sent</h3>
                        <ArrowUpRight className="text-red-400" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">
                        ${summary.totalSent.toFixed(2)}
                    </p>
                    <p className="text-gray-400">Total transactions: {summary.sentCount}</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Payments Received</h3>
                        <ArrowDownRight className="text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">
                        ${summary.totalReceived.toFixed(2)}
                    </p>
                    <p className="text-gray-400">Total transactions: {summary.receivedCount}</p>
                </div>
            </div>
        );
    };

    const renderListView = () => {
        // First filter payments based on the selected filter
        const filteredPayments = payments.filter(payment => {
            if (!payment?.bookingId?.seekerId?._id || !payment?.bookingId?.posterId?._id) {
                return false; // Skip payments with missing user data
            }

            const isReceived = Number(payment.bookingId.seekerId._id) === user._id;
            
            if (filter === "sent") {
                return !isReceived; // Show only payments made
            } else if (filter === "received") {
                return isReceived; // Show only payments received
            }
            return true; // Show all payments
        });

        const sortedPayments = [...filteredPayments].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

        return (
            <div className="space-y-4">
                {sortedPayments.map((payment) => {
                    // Keep all existing null checks
                    const seekerId = payment?.bookingId?.seekerId?._id;
                    const posterId = payment?.bookingId?.posterId?._id;
                    const isReceived = Number(seekerId) === user._id;
                    const posterName = payment?.bookingId?.posterId?.name || 'Unknown User';
                    const seekerName = payment?.bookingId?.seekerId?.name || 'Unknown User';
                    const jobTitle = payment?.bookingId?.jobId?.title || 'Untitled Job';

                    if (!payment.bookingId) {
                        return null; // Skip rendering if booking data is missing
                    }

                    return (
                        <div key={payment._id} className="bg-gray-800 p-6 rounded-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold">
                                            {jobTitle}
                                        </h3>
                                        <span className={`text-sm ${isReceived ? 'text-green-400' : 'text-red-400'}`}>
                                            ({isReceived ? 'Payment Received' : 'Payment Made'})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center text-gray-400">
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            <span>${payment.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center text-gray-400">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center text-gray-400">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {getPaymentStatus(payment.status)}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to={`/booking/${payment.bookingId._id}`}
                                    state={{ paymentId: payment._id }}
                                    className="inline-flex items-center gap-1 text-sm bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 transition-colors"
                                    title="View Payment Details"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Payment
                                </Link>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">
                                        {isReceived ? "From" : "To"}:
                                    </span>
                                    <span className="text-white">
                                        {isReceived ? posterName : seekerName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Add role check
    const isJobSeeker = user.role === 'jobSeeker';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">My Payments</h2>
                <div className="flex items-center gap-4">
                    {isJobSeeker && (
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="bg-gray-700 text-white rounded-lg px-4 py-2"
                            >
                                <option value="all">All Payments</option>
                                <option value="sent">Payments Made</option>
                                <option value="received">Payments Received</option>
                            </select>
                        </div>
                    )}

                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2"
                    >
                        <option value="all">All Time</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewType(viewType === "list" ? "summary" : "list")}
                            className="text-gray-400 hover:text-white"
                        >
                            {viewType === "list" ? <FileText /> : <List />}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-gray-400">Loading payments...</div>
            ) : payments.length === 0 ? (
                <div className="text-center text-gray-400">No payments found</div>
            ) : (
                viewType === "summary" ? renderSummaryView() : renderListView()
            )}
        </div>
    );
};

export default PaymentsTab;