import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { CreditCard, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { toast } from "react-hot-toast";

const PaymentsAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState({
        totalPayments: 0,
        totalAmount: 0,
        pendingPayments: 0,
        completedPayments: 0,
        paymentsByStatus: [],
        paymentsByMethod: [],
        paymentsGrowth: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`/analytics/payments?timeRange=${timeRange}`);
            
            if (response.data) {
                // Ensure we have all required properties with default values
                const data = {
                    totalPayments: response.data.totalPayments || 0,
                    totalAmount: response.data.totalAmount || 0,
                    pendingPayments: response.data.pendingPayments || 0,
                    completedPayments: response.data.completedPayments || 0,
                    paymentsByStatus: response.data.paymentsByStatus || [],
                    paymentsByMethod: response.data.paymentsByMethod || [],
                    paymentsGrowth: response.data.paymentsGrowth || []
                };
                setAnalyticsData(data);
                toast.success('Analytics data loaded successfully');
            }
        } catch (error) {
            console.error("Error fetching payments analytics data:", error);
            const errorMessage = error.response?.data?.message || 'Failed to fetch analytics data';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={fetchAnalyticsData}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Payments Analytics</h1>
                <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                </select>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AnalyticsCard
                    title="Total Payments"
                    value={analyticsData.totalPayments.toLocaleString()}
                    icon={CreditCard}
                    color="from-blue-500 to-blue-700"
                />
                <AnalyticsCard
                    title="Total Amount"
                    value={`$${analyticsData.totalAmount.toLocaleString()}`}
                    icon={DollarSign}
                    color="from-green-500 to-green-700"
                />
                <AnalyticsCard
                    title="Pending Payments"
                    value={analyticsData.pendingPayments.toLocaleString()}
                    icon={Wallet}
                    color="from-yellow-500 to-yellow-700"
                />
                <AnalyticsCard
                    title="Completed Payments"
                    value={analyticsData.completedPayments.toLocaleString()}
                    icon={TrendingUp}
                    color="from-purple-500 to-purple-700"
                />
            </div>

            {/* Payments Growth Chart */}
            {analyticsData.paymentsGrowth.length > 0 && (
                <motion.div
                    className="bg-gray-800/60 rounded-lg p-6 shadow-lg mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-xl font-semibold text-white mb-4">Payments Growth Trend</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={analyticsData.paymentsGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#D1D5DB" />
                            <YAxis stroke="#D1D5DB" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1F2937",
                                    border: "none",
                                    borderRadius: "0.5rem",
                                    color: "#fff"
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#3B82F6"
                                activeDot={{ r: 8 }}
                                name="Payment Amount"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            {/* Payments by Status and Method */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Payments by Status */}
                {analyticsData.paymentsByStatus.length > 0 && (
                    <motion.div
                        className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Payments by Status</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analyticsData.paymentsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {analyticsData.paymentsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1F2937",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        color: "#fff"
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Payments by Method */}
                {analyticsData.paymentsByMethod.length > 0 && (
                    <motion.div
                        className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Payments by Method</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.paymentsByMethod}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="method" stroke="#D1D5DB" />
                                <YAxis stroke="#D1D5DB" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1F2937",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        color: "#fff"
                                    }}
                                />
                                <Bar dataKey="count" fill="#3B82F6" name="Number of Payments" />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex justify-between items-center">
            <div className="z-10">
                <p className="text-gray-400 text-sm mb-1">{title}</p>
                <h3 className="text-white text-3xl font-bold">{value}</h3>
            </div>
            <div className={`p-3 rounded-full bg-gradient-to-br ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </motion.div>
);

export default PaymentsAnalytics; 