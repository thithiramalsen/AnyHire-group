import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Star, Filter, User, Briefcase, MessageSquare, Tag, MapPin } from "lucide-react";
import PortfolioItem from "./PortfolioItem";

const UserProfileView = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [portfolios, setPortfolios] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(true);

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
        </div>
    );
};

export default UserProfileView;