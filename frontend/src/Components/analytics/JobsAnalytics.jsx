import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { Briefcase, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const JobsAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState({
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        jobsByCategory: [],
        jobsGrowth: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const response = await axios.get("/analytics/jobs");
                console.log('Raw analytics data:', response.data);
                console.log('Jobs growth data structure:', {
                    length: response.data.jobsGrowth?.length,
                    sample: response.data.jobsGrowth?.[0],
                    allData: response.data.jobsGrowth
                });
                setAnalyticsData(response.data);
            } catch (error) {
                console.error("Error fetching jobs analytics data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-white mb-8">Jobs Analytics</h1>
            
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AnalyticsCard
                    title="Total Jobs"
                    value={analyticsData.totalJobs.toLocaleString()}
                    icon={Briefcase}
                    color="from-blue-500 to-blue-700"
                />
                <AnalyticsCard
                    title="Active Jobs"
                    value={analyticsData.activeJobs.toLocaleString()}
                    icon={Clock}
                    color="from-yellow-500 to-yellow-700"
                />
                <AnalyticsCard
                    title="Completed Jobs"
                    value={analyticsData.completedJobs.toLocaleString()}
                    icon={CheckCircle}
                    color="from-green-500 to-green-700"
                />
                <AnalyticsCard
                    title="Completion Rate"
                    value={`${((analyticsData.completedJobs / analyticsData.totalJobs) * 100).toFixed(1)}%`}
                    icon={TrendingUp}
                    color="from-purple-500 to-purple-700"
                />
            </div>

            {/* Jobs Growth Chart */}
            <motion.div
                className="bg-gray-800/60 rounded-lg p-6 shadow-lg mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-xl font-semibold text-white mb-4">Jobs Growth Trend</h2>
                {analyticsData.jobsGrowth && analyticsData.jobsGrowth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={analyticsData.jobsGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                dataKey="_id"
                                stroke="#D1D5DB"
                                tickFormatter={(value) => {
                                    const [year, month] = value.split('-');
                                    return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
                                }}
                            />
                            <YAxis stroke="#D1D5DB" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1F2937",
                                    border: "none",
                                    borderRadius: "0.5rem",
                                    color: "#fff"
                                }}
                                labelFormatter={(value) => {
                                    const [year, month] = value.split('-');
                                    return new Date(year, month - 1).toLocaleString('default', { 
                                        month: 'long',
                                        year: 'numeric'
                                    });
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                                name="Number of Jobs"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-gray-400 text-center py-8">
                        No growth data available
                    </div>
                )}
            </motion.div>

            {/* Jobs by Category */}
            <motion.div
                className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2 className="text-xl font-semibold text-white mb-4">Jobs by Category</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analyticsData.jobsByCategory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="_id" stroke="#D1D5DB" />
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
                            <Bar dataKey="count" fill="#3B82F6" name="Number of Jobs" />
                        </BarChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={analyticsData.jobsByCategory}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {analyticsData.jobsByCategory.map((entry, index) => (
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
                </div>
            </motion.div>
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

export default JobsAnalytics;