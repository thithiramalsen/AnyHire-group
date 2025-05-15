import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { 
    Trophy, Gift, Calendar, AlertCircle, Sun, Moon, 
    Star, Clock, MessageSquare, Shield, Medal, Award,
    CheckCircle
} from "lucide-react";

const MyAwards = () => {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState("all");
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetchMyAwards();
        fetchUserRole();
    }, []);

    const fetchUserRole = async () => {
        try {
            const response = await axios.get('/users/me');
            setUserRole(response.data.role);
        } catch (error) {
            console.error("Error fetching user role:", error);
        }
    };

    const fetchMyAwards = async () => {
        try {
            const response = await axios.get('/awards/my-awards');
            setAwards(response.data.data);
        } catch (error) {
            console.error("Error fetching awards:", error);
            toast.error("Failed to load your awards");
        } finally {
            setLoading(false);
        }
    };

    const getBadgeIcon = (badge) => {
        switch (badge) {
            case 'PLATINUM': return <Shield className="w-6 h-6 text-purple-400" />;
            case 'GOLD': return <Trophy className="w-6 h-6 text-yellow-400" />;
            case 'SILVER': return <Medal className="w-6 h-6 text-gray-400" />;
            case 'BRONZE': return <Award className="w-6 h-6 text-orange-400" />;
            default: return null;
        }
    };

    const filteredAwards = awards.filter(award => {
        if (selectedType === "all") return true;
        if (selectedType === "customer" && (award.type === "CUSTOMER_OF_DAY" || award.type === "CUSTOMER_OF_MONTH")) return true;
        if (selectedType === "seeker" && (award.type === "TOP_SEEKER_DAY" || award.type === "TOP_SEEKER_MONTH")) return true;
        return false;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    My Awards
                </h2>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
                >
                    <option value="all">All Awards</option>
                    {userRole === "customer" && <option value="customer">Customer Awards</option>}
                    {userRole === "jobSeeker" && <option value="seeker">Job Seeker Awards</option>}
                </select>
            </div>

            {filteredAwards.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <Trophy className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300">No Awards Yet</h3>
                    <p className="text-gray-400 mt-2">
                        {userRole === "customer" 
                            ? "Keep booking services to earn customer awards!"
                            : "Complete jobs with excellence to earn seeker awards!"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAwards.map((award) => (
                        <div key={award._id} className="bg-gray-800 rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                    award.type.includes('DAY')
                                        ? 'bg-blue-500/10 text-blue-400'
                                        : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                    {award.type.includes('SEEKER') ? (
                                        <div className="flex items-center gap-1">
                                            {award.type.includes('DAY') ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                            {award.type.includes('DAY') ? 'Top Seeker of the Day' : 'Top Seeker of the Month'}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            {award.type.includes('DAY') ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                            {award.type.includes('DAY') ? 'Customer of the Day' : 'Customer of the Month'}
                                        </div>
                                    )}
                                </span>
                                {award.badge && getBadgeIcon(award.badge)}
                            </div>

                            <div className="text-gray-400">
                                {award.period.day && `${award.period.day}/`}{award.period.month}/{award.period.year}
                            </div>

                            <div className="space-y-2">
                                {award.type.includes('SEEKER') ? (
                                    <>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Briefcase className="w-4 h-4" />
                                            <span>Completed Jobs: {award.metrics.completedJobs}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Star className="w-4 h-4" />
                                            <span>Rating: {award.metrics.averageRating.toFixed(1)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Clock className="w-4 h-4" />
                                            <span>On-time Delivery: {award.metrics.onTimeDelivery}%</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>Response Rate: {award.metrics.responseRate}%</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Calendar className="w-4 h-4" />
                                            <span>Bookings: {award.metrics.totalBookings}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Gift className="w-4 h-4" />
                                            <span>Total Spent: ${award.metrics.totalSpent}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="border-t border-gray-700 pt-4">
                                <h4 className="text-sm font-semibold text-gray-300 mb-2">Your Rewards</h4>
                                {award.rewards.map((reward, index) => (
                                    <div key={index} className="bg-gray-700 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-emerald-400 font-semibold">
                                                {reward.type === 'DISCOUNT' && `${reward.value}% Discount`}
                                                {reward.type === 'FEATURED_PROFILE' && `Featured Profile (${reward.value} days)`}
                                                {reward.type === 'PRIORITY_MATCHING' && `Priority Matching (${reward.value} days)`}
                                            </span>
                                            <span className={`text-sm ${reward.isUsed ? 'text-red-400' : 'text-green-400'}`}>
                                                {reward.isUsed ? 'Used' : 'Active'}
                                            </span>
                                        </div>
                                        {!reward.isUsed && reward.code && (
                                            <>
                                                <div className="text-sm text-gray-400">
                                                    Code: <span className="font-mono">{reward.code}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Valid until: {new Date(reward.validUntil).toLocaleDateString()}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAwards; 