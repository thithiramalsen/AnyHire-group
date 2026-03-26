import { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";
import { 
    Trophy, Search, Calendar, Award, 
    Gift, RefreshCw, User, Tag,
    AlertCircle, Sun, Moon, Star,
    Shield, Medal, Clock, MessageSquare,
    Briefcase
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
    const [selectedType, setSelectedType] = useState("all");

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
                hasCompletedJobs: false,
                message: "Could not verify data requirements"
            });
        }
    };

    const fetchAwards = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/awards/all');
            
            if (response.data?.data) {
                setAwards(response.data.data);
                toast.success("Awards loaded successfully");
            } else {
                setAwards([]);
                toast.error("No awards found");
            }
        } catch (error) {
            console.error("Error fetching awards:", error);
            toast.error(`Failed to load awards: ${error.response?.data?.message || error.message}`);
            setAwards([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateNewAwards = async (type) => {
        try {
            let endpoint;
            switch(type) {
                case 'customer-day':
                    endpoint = '/awards/customer-of-day/calculate';
                    break;
                case 'customer-month':
                    endpoint = '/awards/customer-of-month/calculate';
                    break;
                case 'seeker-day':
                    endpoint = '/awards/seeker-of-day/calculate';
                    break;
                case 'seeker-month':
                    endpoint = '/awards/seeker-of-month/calculate';
                    break;
                default:
                    throw new Error('Invalid award type');
            }
                
            const response = await axios.post(endpoint);
            if (response.data.success) {
                toast.success(`New ${type.replace('-', ' ')} award calculated successfully`);
                fetchAwards();
            }
        } catch (error) {
            console.error("Error calculating awards:", error);
            const errorMessage = error.response?.data?.message || error.message;
            
            if (errorMessage.includes('Award already exists')) {
                toast.error(`An award has already been issued for this period`);
            } else {
                toast.error(`Failed to calculate new awards: ${errorMessage}`);
            }
        }
    };

    const getBadgeIcon = (badge) => {
        switch (badge) {
            case 'PLATINUM': return <Shield className="w-4 h-4 text-purple-400" />;
            case 'GOLD': return <Trophy className="w-4 h-4 text-yellow-400" />;
            case 'SILVER': return <Medal className="w-4 h-4 text-gray-400" />;
            case 'BRONZE': return <Award className="w-4 h-4 text-orange-400" />;
            default: return null;
        }
    };

    const calculateScore = (metrics) => {
        if (!metrics) return 0;
        return Math.round(
            (metrics.averageRating * 20) + // Rating (max 100)
            (metrics.onTimeDelivery * 0.3) + // On-time delivery (max 30)
            (metrics.responseRate * 0.2) + // Response rate (max 20)
            (Math.min(metrics.completedJobs, 10) * 5) // Completed jobs (max 50)
        );
    };

    const filteredAwards = awards.filter(award => {
        const searchLower = searchTerm.toLowerCase();
        const userMatch = award.userId?.name?.toLowerCase().includes(searchLower) || 
                         award.userId?.email?.toLowerCase().includes(searchLower);
        
        const dateMatch = (!dateRange.start || new Date(award.issuedAt) >= new Date(dateRange.start)) &&
                         (!dateRange.end || new Date(award.issuedAt) <= new Date(dateRange.end));
        
        const typeMatch = selectedType === "all" || 
                         (selectedType === "customer" && award.type.includes("CUSTOMER")) ||
                         (selectedType === "seeker" && award.type.includes("SEEKER"));
        
        return userMatch && dateMatch && typeMatch;
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
                <div className="flex gap-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => calculateNewAwards('customer-day')}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Sun className="w-5 h-5" />
                                Calculate Customer Daily
                            </button>
                            <button
                                onClick={() => calculateNewAwards('customer-month')}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Moon className="w-5 h-5" />
                                Calculate Customer Monthly
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => calculateNewAwards('seeker-day')}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                            >
                                <Sun className="w-5 h-5" />
                                Calculate Seeker Daily
                            </button>
                            <button
                                onClick={() => calculateNewAwards('seeker-month')}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                            >
                                <Moon className="w-5 h-5" />
                                Calculate Seeker Monthly
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Requirements Status */}
            {dataStatus && (!dataStatus.hasPaidBookings || !dataStatus.hasCompletedJobs) && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-yellow-500 font-semibold mb-1">Insufficient Data for Awards</h3>
                        <div className="text-gray-300 text-sm">
                            To calculate awards, you need:
                        </div>
                        <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                            <li className={dataStatus.hasBookings ? 'text-green-500' : 'text-gray-400'}>
                                Active bookings in the system
                            </li>
                            <li className={dataStatus.hasPaidBookings ? 'text-green-500' : 'text-gray-400'}>
                                Completed payments for customer awards
                            </li>
                            <li className={dataStatus.hasCompletedJobs ? 'text-green-500' : 'text-gray-400'}>
                                Completed jobs for seeker awards
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                        <option value="all">All Awards</option>
                        <option value="customer">Customer Awards</option>
                        <option value="seeker">Seeker Awards</option>
                    </select>
                </div>
                <div>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div>
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
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            award.type.includes('SEEKER') 
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-blue-500/10 text-blue-400'
                                        }`}>
                                            {award.type === 'TOP_SEEKER_DAY' && 'Top Seeker of the Day'}
                                            {award.type === 'TOP_SEEKER_MONTH' && 'Top Seeker of the Month'}
                                            {award.type === 'CUSTOMER_OF_DAY' && 'Customer of the Day'}
                                            {award.type === 'CUSTOMER_OF_MONTH' && 'Customer of the Month'}
                                        </span>
                                        {award.badge && getBadgeIcon(award.badge)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300">
                                    {award.period.day && `${award.period.day}/`}{award.period.month}/{award.period.year}
                                </td>
                                <td className="px-6 py-4">
                                    {award.type.includes('SEEKER') ? (
                                        <div className="text-sm text-gray-300 space-y-1">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400" />
                                                Rating: {award.metrics.averageRating.toFixed(1)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-blue-400" />
                                                On-time: {award.metrics.onTimeDelivery}%
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="w-4 h-4 text-emerald-400" />
                                                Response: {award.metrics.responseRate}%
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4 text-purple-400" />
                                                Jobs: {award.metrics.completedJobs}
                                            </div>
                                            <div className="mt-1 text-xs font-medium text-emerald-400">
                                                Score: {calculateScore(award.metrics)} / 200
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-300">
                                            <div>Bookings: {award.metrics.totalBookings}</div>
                                            <div>Spent: ${award.metrics.totalSpent}</div>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {award.rewards.map((reward, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <Gift className="w-4 h-4 text-emerald-400" />
                                            <span className="text-white">
                                                {reward.type === 'DISCOUNT' && `${reward.value}% Discount`}
                                                {reward.type === 'FEATURED_PROFILE' && `Featured (${reward.value}d)`}
                                                {reward.type === 'PRIORITY_MATCHING' && `Priority (${reward.value}d)`}
                                            </span>
                                            {reward.code && (
                                                <>
                                                    <Tag className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-400 font-mono text-xs">{reward.code}</span>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </td>
                                <td className="px-6 py-4">
                                    {award.rewards.some(r => !r.isUsed) ? (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-400">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-400">
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