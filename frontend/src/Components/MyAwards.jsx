import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Trophy, Gift, Calendar, AlertCircle } from "lucide-react";

const MyAwards = () => {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyAwards();
    }, []);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                My Awards
            </h2>

            {awards.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <Trophy className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300">No Awards Yet</h3>
                    <p className="text-gray-400 mt-2">
                        Keep booking and completing jobs to become Customer of the Month!
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {awards.map((award) => (
                        <div key={award._id} className="bg-gray-800 rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-emerald-500/10 text-emerald-400">
                                    Customer of the Month
                                </span>
                                <span className="text-gray-400">
                                    {award.period.month}/{award.period.year}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Calendar className="w-4 h-4" />
                                    <span>Bookings: {award.metrics.totalBookings}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Gift className="w-4 h-4" />
                                    <span>Total Spent: ${award.metrics.totalSpent}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-4">
                                <h4 className="text-sm font-semibold text-gray-300 mb-2">Your Rewards</h4>
                                {award.rewards.map((reward, index) => (
                                    <div key={index} className="bg-gray-700 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-emerald-400 font-semibold">
                                                {reward.value}% Discount
                                            </span>
                                            <span className={`text-sm ${reward.isUsed ? 'text-red-400' : 'text-green-400'}`}>
                                                {reward.isUsed ? 'Used' : 'Active'}
                                            </span>
                                        </div>
                                        {!reward.isUsed && (
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