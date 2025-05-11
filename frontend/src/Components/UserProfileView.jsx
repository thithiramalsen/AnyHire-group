import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Star, Filter, User, Briefcase, MessageSquare, Tag, MapPin, Award, Clock, CheckCircle, Trophy, Medal, Shield, Calendar, Gift } from "lucide-react";
import PortfolioItem from "./PortfolioItem";

const UserProfileView = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [portfolios, setPortfolios] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [awards, setAwards] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch user data
                const userResponse = await axios.get(`/users/${userId}`);
                setUser(userResponse.data);

                // Fetch user's portfolios
                const portfoliosResponse = await axios.get(`/portfolio/user/${userId}`);
                setPortfolios(portfoliosResponse.data);

                // Fetch user's reviews
                const reviewsResponse = await axios.get(`/reviews/user/${userId}?type=received`);
                setReviews(reviewsResponse.data);

                // Fetch categories
                const categoriesResponse = await axios.get("/category");
                setCategories(categoriesResponse.data.categories);

                // Fetch awards
                const awardsResponse = await axios.get(`/awards/user/${userId}`);
                setAwards(awardsResponse.data.data || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const filteredPortfolios = selectedCategory
        ? portfolios.filter((item) => {
            // Convert all category IDs to numbers for consistent comparison
            const itemCategoryIds = item.categories.map(cat => 
                typeof cat === 'object' ? Number(cat._id) : Number(cat)
            );
            const selectedCategoryId = Number(selectedCategory);

            console.log("Filtering check:", {
                itemId: item._id,
                itemCategoryIds,
                selectedCategoryId,
                matches: itemCategoryIds.includes(selectedCategoryId)
            });

            return itemCategoryIds.includes(selectedCategoryId);
        })
        : portfolios;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const getLatestBadge = () => {
        const seekerAwards = awards.filter(a => 
            a.type === 'TOP_SEEKER_MONTH' || a.type === 'TOP_SEEKER_DAY'
        );
        return seekerAwards[0]?.badge || null;
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

    const calculateScore = (metrics) => {
        if (!metrics) return 0;
        return Math.round(
            (metrics.averageRating * 20) + // Rating (max 100)
            (metrics.onTimeDelivery * 0.3) + // On-time delivery (max 30)
            (metrics.responseRate * 0.2) + // Response rate (max 20)
            (Math.min(metrics.completedJobs, 10) * 5) // Completed jobs (max 50)
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center text-gray-400 mt-8">
                User not found
            </div>
        );
    }

    const badge = getLatestBadge();

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* User Profile Header */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full bg-emerald-600 flex items-center justify-center">
                        {user.image ? (
                            <img
                                src={`http://localhost:5000/uploads/${user.image}`}
                                alt={user.name}
                                className="w-24 h-24 rounded-full object-cover"
                            />
                        ) : (
                            <User className="w-12 h-12 text-white" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                        <p className="text-gray-400 capitalize mb-4">{user.role}</p>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <Star className="w-5 h-5 text-yellow-400 mr-1" />
                                <span className="text-white font-semibold">{averageRating}</span>
                                <span className="text-gray-400 ml-1">({reviews.length} reviews)</span>
                            </div>
                            {badge && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-700">
                                    {getBadgeIcon(badge)}
                                    <span className="text-sm font-medium">{badge} Seeker</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add this new section */}
                {user.role === "jobSeeker" && (
                    <div className="mt-6 pt-6 border-t border-gray-700 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Preferred Categories */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <Tag className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-lg font-semibold text-white">
                                        Preferred Job Categories
                                    </h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {user.preferredCategories?.length > 0 ? (
                                        user.preferredCategories.map(categoryId => {
                                            const category = categories.find(cat => cat._id === categoryId);
                                            return category ? (
                                                <span 
                                                    key={categoryId} 
                                                    className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm"
                                                >
                                                    {category.name}
                                                </span>
                                            ) : null;
                                        })
                                    ) : (
                                        <span className="text-gray-400">No categories selected</span>
                                    )}
                                </div>
                            </div>

                            {/* Preferred District */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <MapPin className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-lg font-semibold text-white">
                                        Preferred District
                                    </h3>
                                </div>
                                <span className="text-gray-300">
                                    {user.preferredDistrict || "Not specified"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Portfolio Section */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <Briefcase className="w-6 h-6 text-emerald-500" />
                        <h2 className="text-2xl font-bold text-white">Portfolio</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPortfolios.map((portfolio) => (
                        <PortfolioItem
                            key={portfolio._id}
                            item={portfolio}
                            categories={categories}
                            showActions={false}
                        />
                    ))}
                </div>
            </div>

            {/* Reviews Section */}
            <div>
                <div className="flex items-center space-x-2 mb-6">
                    <MessageSquare className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-2xl font-bold text-white">Reviews</h2>
                </div>

                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-gray-800 rounded-lg shadow-lg p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                        {review.reviewerId.image ? (
                                            <img
                                                src={`http://localhost:5000${review.reviewerId.image}`}
                                                alt={review.reviewerId.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{review.reviewerId.name}</h3>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, index) => (
                                                <Star
                                                    key={index}
                                                    className={`w-4 h-4 ${
                                                        index < review.rating
                                                            ? "text-yellow-400"
                                                            : "text-gray-600"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            {review.comment && (
                                <p className="mt-4 text-gray-300">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Awards Section */}
            {awards.length > 0 && (
                <div className="mt-8">
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            Awards & Achievements
                        </h2>

                        {user.role === "jobSeeker" && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg text-emerald-400">Current Badge</h3>
                                    <div className="flex items-center gap-2">
                                        {getBadgeIcon(getLatestBadge())}
                                        <span className="text-white font-semibold">{getLatestBadge() || 'No Badge Yet'}</span>
                                    </div>
                                </div>

                                {awards.filter(a => a.type.includes('SEEKER')).slice(0, 1).map(award => (
                                    <div key={award._id} className="bg-gray-700 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <h4 className="text-gray-400">Performance Score</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-2xl font-bold text-emerald-400">
                                                        {calculateScore(award.metrics)}
                                                    </div>
                                                    <div className="text-sm text-gray-400">/ 200 points</div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Rating Score:</span>
                                                    <span className="text-white">{Math.round(award.metrics.averageRating * 20)} / 100</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">On-time Score:</span>
                                                    <span className="text-white">{Math.round(award.metrics.onTimeDelivery * 0.3)} / 30</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Response Score:</span>
                                                    <span className="text-white">{Math.round(award.metrics.responseRate * 0.2)} / 20</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Jobs Score:</span>
                                                    <span className="text-white">{Math.round(Math.min(award.metrics.completedJobs, 10) * 5)} / 50</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
                                    <div className="p-2 rounded bg-gray-700">
                                        <Shield className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                                        <div className="font-semibold text-purple-400">PLATINUM</div>
                                        <div className="text-gray-400">180+ pts</div>
                                    </div>
                                    <div className="p-2 rounded bg-gray-700">
                                        <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                                        <div className="font-semibold text-yellow-400">GOLD</div>
                                        <div className="text-gray-400">150-179 pts</div>
                                    </div>
                                    <div className="p-2 rounded bg-gray-700">
                                        <Medal className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                        <div className="font-semibold text-gray-400">SILVER</div>
                                        <div className="text-gray-400">120-149 pts</div>
                                    </div>
                                    <div className="p-2 rounded bg-gray-700">
                                        <Award className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                                        <div className="font-semibold text-orange-400">BRONZE</div>
                                        <div className="text-gray-400">&lt;120 pts</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {awards.map((award) => (
                                <div key={award._id} className="bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-emerald-400 font-semibold">
                                            {award.type === 'TOP_SEEKER_DAY' && 'Top Seeker of the Day'}
                                            {award.type === 'TOP_SEEKER_MONTH' && 'Top Seeker of the Month'}
                                            {award.type === 'CUSTOMER_OF_DAY' && 'Customer of the Day'}
                                            {award.type === 'CUSTOMER_OF_MONTH' && 'Customer of the Month'}
                                        </span>
                                        <span className="text-gray-400 text-sm">
                                            {award.period.day && `${award.period.day}/`}{award.period.month}/{award.period.year}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {award.type.includes('SEEKER') ? (
                                            <>
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Star className="w-4 h-4" />
                                                    <span>Rating: {award.metrics.averageRating.toFixed(1)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Clock className="w-4 h-4" />
                                                    <span>On-time: {award.metrics.onTimeDelivery}%</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span>Response: {award.metrics.responseRate}%</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Briefcase className="w-4 h-4" />
                                                    <span>Jobs: {award.metrics.completedJobs}</span>
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

                                    {award.rewards && award.rewards.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-600">
                                            <div className="text-sm text-gray-400 mb-2">Rewards:</div>
                                            <div className="space-y-2">
                                                {award.rewards.map((reward, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                        <span className="text-emerald-400">
                                                            {reward.type === 'DISCOUNT' && `${reward.value}% Discount`}
                                                            {reward.type === 'FEATURED_PROFILE' && `Featured Profile (${reward.value} days)`}
                                                            {reward.type === 'PRIORITY_MATCHING' && `Priority Matching (${reward.value} days)`}
                                                        </span>
                                                        <span className={reward.isUsed ? 'text-red-400' : 'text-green-400'}>
                                                            {reward.isUsed ? 'Used' : 'Active'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfileView;