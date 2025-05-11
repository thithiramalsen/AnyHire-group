import { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";
import { 
    Trophy, Search, Calendar, Award, 
    Gift, RefreshCw, User, Tag,
    AlertCircle 
} from "lucide-react";

const GamificationManagementTab = () => {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState({
        start: "",
        end: ""
    });
    const [dataStatus, setDataStatus] = useState(null);

    useEffect(() => {
        fetchAwards();
        checkDataRequirements();
    }, []);

    const checkDataRequirements = async () => {
        try {
            const response = await axios.get('/awards/check-requirements');
            setDataStatus(response.data);
        } catch (error) {
            console.error("Error checking data requirements:", error);
            setDataStatus({
                hasBookings: false,
                hasPaidBookings: false,
                message: "Could not verify data requirements"
            });
        }
    };

    const fetchAwards = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const response = await axios.get(`/awards/customer-of-month/${now.getFullYear()}/${now.getMonth() + 1}`);
            
            if (!response.data || !response.data.data) {
                setAwards([]);
                toast.error("No awards found for this period");
                return;
            }
            
            setAwards(Array.isArray(response.data.data) ? response.data.data : [response.data.data].filter(Boolean));
            toast.success("Awards loaded successfully");
        } catch (error) {
            console.error("Error fetching awards:", error);
            if (error.response?.status === 404) {
                toast.error("No awards found for this period");
                setAwards([]);
            } else {
                toast.error(`Failed to load awards: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateNewAwards = async () => {
        try {
            const response = await axios.post('/awards/customer-of-month/calculate');
            if (response.data.success) {
                toast.success("New awards calculated successfully");
                fetchAwards();
            }
        } catch (error) {
            console.error("Error calculating awards:", error);
            const errorMessage = error.response?.data?.message || error.message;
            
            // Handle duplicate award error specifically
            if (errorMessage.includes('Award already exists for period')) {
                toast.error("An award has already been issued for this period");
            } else {
                toast.error(`Failed to calculate new awards: ${errorMessage}`);
            }
        }
    };

    const filteredAwards = awards.filter(award => {
        const searchLower = searchTerm.toLowerCase();
        const userMatch = award.userId?.name?.toLowerCase().includes(searchLower) || 
                         award.userId?.email?.toLowerCase().includes(searchLower);
        
        const dateMatch = (!dateRange.start || new Date(award.issuedAt) >= new Date(dateRange.start)) &&
                         (!dateRange.end || new Date(award.issuedAt) <= new Date(dateRange.end));
        
        return userMatch && dateMatch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Gamification Management
                </h2>
                <button
                    onClick={calculateNewAwards}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                    <Award className="w-5 h-5" />
                    Calculate New Awards
                </button>
            </div>

            {/* Data Requirements Status */}
            {dataStatus && !dataStatus.hasPaidBookings && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-yellow-500 font-semibold mb-1">Insufficient Data for Awards</h3>
                        <p className="text-gray-300 text-sm">
                            To calculate awards, you need:
                            <ul className="list-disc ml-5 mt-2 space-y-1">
                                <li className={dataStatus.hasBookings ? 'text-green-500' : 'text-gray-400'}>
                                    Active bookings in the system
                                </li>
                                <li className={dataStatus.hasPaidBookings ? 'text-green-500' : 'text-gray-400'}>
                                    Completed payments for bookings
                                </li>
                            </ul>
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className="text-gray-400" size={20} />
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className="text-gray-400" size={20} />
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                </div>
            </div>

            {/* Awards Table */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Award Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Period</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Metrics</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rewards</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredAwards.map((award) => (
                            <tr key={award._id} className="hover:bg-gray-750">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <User className="w-5 h-5 text-gray-400 mr-2" />
                                        <div>
                                            <div className="text-sm font-medium text-white">{award.userId?.name}</div>
                                            <div className="text-sm text-gray-400">{award.userId?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500 text-white">
                                        Customer of the Month
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300">
                                    {award.period.month}/{award.period.year}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-300">
                                        <div>Bookings: {award.metrics.totalBookings}</div>
                                        <div>Spent: ${award.metrics.totalSpent}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {award.rewards.map((reward, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <Gift className="w-4 h-4 text-emerald-400" />
                                            <span className="text-white">{reward.value}% Discount</span>
                                            <Tag className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-400">{reward.code}</span>
                                        </div>
                                    ))}
                                </td>
                                <td className="px-6 py-4">
                                    {award.rewards.some(r => !r.isUsed) ? (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-500 text-white">
                                            Used
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GamificationManagementTab;