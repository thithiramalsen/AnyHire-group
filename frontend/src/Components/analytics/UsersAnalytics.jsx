import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { Users, UserPlus, UserCheck, UserX } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { toast } from "react-hot-toast";

const UsersAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState({
        totalUsers: 0,
        newUsers: 0,
        activeUsers: 0,
        userGrowth: [],
        userTypes: [],
        userActivityByTime: [],
        topUsers: []
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
            const response = await axios.get(`/analytics/users?timeRange=${timeRange}`);
            
            if (response.data) {
                // Ensure we have all required properties with default values
                const data = {
                    totalUsers: response.data.totalUsers || 0,
                    newUsers: response.data.newUsers || 0,
                    activeUsers: response.data.activeUsers || 0,
                    userGrowth: response.data.userGrowth || [],
                    userTypes: response.data.userTypes || [],
                    userActivityByTime: response.data.userActivityByTime || [],
                    topUsers: response.data.topUsers || []
                };
                setAnalyticsData(data);
                toast.success('Analytics data loaded successfully');
            }
        } catch (error) {
            console.error("Error fetching users analytics data:", error);
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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Users Analytics</h1>
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
                    title="Total Users"
                    value={analyticsData.totalUsers.toLocaleString()}
                    icon={Users}
                    color="from-blue-500 to-blue-700"
                />
                <AnalyticsCard
                    title="New Users"
                    value={analyticsData.newUsers.toLocaleString()}
                    icon={UserPlus}
                    color="from-green-500 to-green-700"
                />
                <AnalyticsCard
                    title="Active Users"
                    value={analyticsData.activeUsers.toLocaleString()}
                    icon={UserCheck}
                    color="from-purple-500 to-purple-700"
                />
                <AnalyticsCard
                    title="Inactive Users"
                    value={(analyticsData.totalUsers - analyticsData.activeUsers).toLocaleString()}
                    icon={UserX}
                    color="from-red-500 to-red-700"
                />
            </div>

            {/* Charts */}
            {analyticsData.userGrowth.length > 0 && (
                <motion.div
                    className="bg-gray-800/60 rounded-lg p-6 shadow-lg mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-xl font-semibold text-white mb-4">User Growth Trend</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={analyticsData.userGrowth}>
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
                            <Line type="monotone" dataKey="newUsers" stroke="#10B981" name="New Users" />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            {/* User Types Distribution */}
            {analyticsData.userTypes.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <motion.div
                        className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">User Types Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analyticsData.userTypes}
                                    dataKey="count"
                                    nameKey="type"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {analyticsData.userTypes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* User Activity Chart */}
                    {analyticsData.userActivityByTime.length > 0 && (
                        <motion.div
                            className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-xl font-semibold text-white mb-4">Activity by Hour</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analyticsData.userActivityByTime}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="hour" stroke="#D1D5DB" />
                                    <YAxis stroke="#D1D5DB" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1F2937",
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            color: "#fff"
                                        }}
                                    />
                                    <Bar dataKey="activeUsers" fill="#3B82F6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                </div>
            )}
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

export default UsersAnalytics;