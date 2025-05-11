import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { 
    MessageSquare, Clock, CheckCircle, TrendingUp, Mail, 
    AlertCircle, CheckSquare, AlertTriangle, Clock4, Users,
    BarChart2, PieChart as PieChartIcon
} from "lucide-react";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    Legend, ResponsiveContainer, BarChart, Bar, PieChart, 
    Pie, Cell, Area, AreaChart 
} from "recharts";
import { toast } from "react-hot-toast";

const SupportAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState({
        tickets: {
            total: 0,
            open: 0,
            resolved: 0,
            averageResponseTime: 0,
            byStatus: [],
            byCategory: [],
            growth: []
        },
        contacts: {
            total: 0,
            new: 0,
            resolved: 0,
            byStatus: [],
            growth: []
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('30d');
    const [activeTab, setActiveTab] = useState('tickets');

    // Add new state for detailed metrics
    const [detailedMetrics, setDetailedMetrics] = useState({
        responseTimeDistribution: [],
        ticketPriorities: [],
        hourlyDistribution: [],
        categoryTrends: []
    });

    // Add filter states
    const [filters, setFilters] = useState({
        priority: 'all',
        category: 'all',
        status: 'all'
    });

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`/analytics/support?timeRange=${timeRange}`);
            
            if (response.data) {
                setAnalyticsData(response.data);
                toast.success('Analytics data loaded successfully');
            }
        } catch (error) {
            console.error("Error fetching support analytics data:", error);
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

    // Enhanced analytics card for better visualization
    const AnalyticsCard = ({ title, value, subValue, change, icon: Icon, color }) => (
        <motion.div
            className={`bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-700/50`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className={`p-3 rounded-full bg-gradient-to-br ${color} mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-gray-400 text-sm">{title}</p>
                    <h3 className="text-white text-3xl font-bold mt-1">{value}</h3>
                    {subValue && (
                        <p className="text-gray-400 text-sm mt-1">{subValue}</p>
                    )}
                </div>
                {change && (
                    <div className={`px-2 py-1 rounded text-sm ${
                        change > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                    }`}>
                        {change > 0 ? '+' : ''}{change}%
                    </div>
                )}
            </div>
        </motion.div>
    );

    // Add new chart components
    const ResponseTimeDistributionChart = () => (
        <motion.div
            className="bg-gray-800/60 rounded-lg p-6 shadow-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h2 className="text-xl font-semibold text-white mb-4">Response Time Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={detailedMetrics.responseTimeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#D1D5DB" />
                    <YAxis stroke="#D1D5DB" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "none",
                            borderRadius: "0.5rem",
                            color: "#fff"
                        }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3B82F6" 
                        fill="#3B82F6"
                        fillOpacity={0.2} 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );

    // Add filters section
    const FilterSection = () => (
        <div className="flex gap-4 mb-8">
            <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
            </select>
            {/* Add more filters as needed */}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Time Range and Tab Selector */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-white">Support Analytics</h1>
                    <div className="flex bg-gray-700 rounded-lg">
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`px-4 py-2 rounded-lg ${
                                activeTab === 'tickets'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            Tickets
                        </button>
                        <button
                            onClick={() => setActiveTab('contacts')}
                            className={`px-4 py-2 rounded-lg ${
                                activeTab === 'contacts'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            Contact Forms
                        </button>
                    </div>
                </div>
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

            <FilterSection />

            {activeTab === 'tickets' ? (
                <>
                    {/* Enhanced metrics cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <AnalyticsCard
                            title="Total Tickets"
                            value={analyticsData.tickets.total}  // Remove toLocaleString() if causing issues
                            subValue={`Last ${timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} days`}
                            icon={MessageSquare}
                            color="from-blue-500 to-blue-700"
                        />
                        <AnalyticsCard
                            title="Open Tickets"
                            value={analyticsData.tickets.open}  // Remove hardcoded formatting
                            subValue={analyticsData.tickets.total > 0 ? 
                                `${((analyticsData.tickets.open / analyticsData.tickets.total) * 100).toFixed(1)}%` : '0%'}
                            icon={Clock}
                            color="from-yellow-500 to-yellow-700"
                        />
                        <AnalyticsCard
                            title="Resolved Tickets"
                            value={analyticsData.tickets.resolved}  // Remove hardcoded formatting
                            subValue={analyticsData.tickets.total > 0 ? 
                                `${((analyticsData.tickets.resolved / analyticsData.tickets.total) * 100).toFixed(1)}%` : '0%'}
                            icon={CheckCircle}
                            color="from-green-500 to-green-700"
                        />
                        <AnalyticsCard
                            title="Avg Response Time"
                            value={`${analyticsData.tickets.averageResponseTime?.toFixed(1) || 0}h`}
                            subValue="Response time"
                            icon={TrendingUp}
                            color="from-purple-500 to-purple-700"
                        />
                    </div>

                    {/* New Response Time Distribution Chart */}
                    <ResponseTimeDistributionChart />

                    {/* Tickets Growth Chart */}
                    {analyticsData.tickets.growth.length > 0 && (
                        <motion.div
                            className="bg-gray-800/60 rounded-lg p-6 shadow-lg mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-xl font-semibold text-white mb-4">Tickets Growth Trend</h2>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={analyticsData.tickets.growth}>
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
                                        dataKey="newTickets"
                                        stroke="#3B82F6"
                                        name="New Tickets"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="resolvedTickets"
                                        stroke="#10B981"
                                        name="Resolved Tickets"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}

                    {/* Tickets by Status and Category */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Tickets by Status */}
                        {analyticsData.tickets.byStatus.length > 0 && (
                            <motion.div
                                className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h2 className="text-xl font-semibold text-white mb-4">Tickets by Status</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={analyticsData.tickets.byStatus}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {analyticsData.tickets.byStatus.map((entry, index) => (
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

                        {/* Tickets by Category */}
                        {analyticsData.tickets.byCategory.length > 0 && (
                            <motion.div
                                className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <h2 className="text-xl font-semibold text-white mb-4">Tickets by Category</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analyticsData.tickets.byCategory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="category" stroke="#D1D5DB" />
                                        <YAxis stroke="#D1D5DB" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#1F2937",
                                                border: "none",
                                                borderRadius: "0.5rem",
                                                color: "#fff"
                                            }}
                                        />
                                        <Bar dataKey="count" fill="#3B82F6" name="Number of Tickets" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Contact Forms Key Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <AnalyticsCard
                            title="Total Contact Forms"
                            value={analyticsData.contacts.total.toLocaleString()}
                            icon={Mail}
                            color="from-blue-500 to-blue-700"
                        />
                        <AnalyticsCard
                            title="New Messages"
                            value={analyticsData.contacts.new.toLocaleString()}
                            icon={AlertCircle}
                            color="from-yellow-500 to-yellow-700"
                        />
                        <AnalyticsCard
                            title="Resolved Messages"
                            value={analyticsData.contacts.resolved.toLocaleString()}
                            icon={CheckSquare}
                            color="from-green-500 to-green-700"
                        />
                    </div>

                    {/* Contact Forms Growth Chart */}
                    {analyticsData.contacts.growth.length > 0 && (
                        <motion.div
                            className="bg-gray-800/60 rounded-lg p-6 shadow-lg mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-xl font-semibold text-white mb-4">Contact Forms Growth Trend</h2>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={analyticsData.contacts.growth}>
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
                                        dataKey="newContacts"
                                        stroke="#3B82F6"
                                        name="New Messages"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="resolvedContacts"
                                        stroke="#10B981"
                                        name="Resolved Messages"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}

                    {/* Contact Forms by Status */}
                    {analyticsData.contacts.byStatus.length > 0 && (
                        <motion.div
                            className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-xl font-semibold text-white mb-4">Messages by Status</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analyticsData.contacts.byStatus}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {analyticsData.contacts.byStatus.map((entry, index) => (
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
                </>
            )}
        </div>
    );
};

export default SupportAnalytics;