import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Star, Filter, User, Briefcase, MessageSquare, Edit2, MapPin, Tag, Plus } from "lucide-react";
import PortfolioItem from "./PortfolioItem";
import { useUserStore } from "../stores/useUserStore";
import PortfolioModalForm from "./PortfolioModalForm";

const WorkerProfileTab = () => {
    const { user } = useUserStore();
    const [portfolios, setPortfolios] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [preferredCategories, setPreferredCategories] = useState([]);
    const [preferredDistrict, setPreferredDistrict] = useState("");
    const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
    const [portfolioToEdit, setPortfolioToEdit] = useState(null);
    const [availableDistricts] = useState([
        "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
        "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
        "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
        "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
        "Monaragala", "Ratnapura", "Kegalle"
    ]);

    console.log("Initial worker profile data:", {
        preferredCategories,
        preferredDistrict,
        categories
    });

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => Number(cat._id) === Number(categoryId));
        return category ? category.name : "Unknown Category";
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch user's portfolios
                const portfoliosResponse = await axios.get(`/portfolio/user/${user._id}`);
                setPortfolios(portfoliosResponse.data);

                // Fetch user's reviews
                const reviewsResponse = await axios.get(`/reviews/user/${user._id}?type=received`);
                setReviews(reviewsResponse.data);

                // Fetch categories
                const categoriesResponse = await axios.get("/category");
                setCategories(categoriesResponse.data.categories);

                // Set initial preferred categories and district
                setPreferredCategories(user.preferredCategories || []);
                setPreferredDistrict(user.preferredDistrict || "");
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user._id]);

    const handleSavePreferences = async () => {
        try {
            console.log("Saving preferences:", {
                preferredCategories,
                preferredDistrict,
                userId: user._id
            });

            const response = await axios.put(`/users/${user._id}/preferences`, {
                preferredCategories,
                preferredDistrict
            });

            if (response.data) {
                toast.success("Preferences updated successfully");
                setIsEditing(false);
                
                // Update local user store if needed
                useUserStore.getState().setUser({
                    ...user,
                    preferredCategories,
                    preferredDistrict
                });
            }
        } catch (error) {
            console.error("Error updating preferences:", error);
            toast.error(error.response?.data?.message || "Failed to update preferences");
        }
    };

    const handleEditPortfolio = async (portfolio) => {
        setPortfolioToEdit(portfolio);
        setIsPortfolioModalOpen(true);
    };

    const handleDeletePortfolio = async (portfolioId) => {
        try {
            await axios.delete(`/portfolio/${portfolioId}`);
            // Refresh portfolios list
            const response = await axios.get(`/portfolio/user/${user._id}`);
            setPortfolios(response.data);
            toast.success("Portfolio deleted successfully");
        } catch (error) {
            console.error("Error deleting portfolio:", error);
            toast.error("Failed to delete portfolio");
        }
    };

    const handleCreatePortfolio = async (formData, images, files) => {
        try {
            const portfolioData = new FormData();
            
            // Handle basic form fields
            Object.keys(formData).forEach(key => {
                if (key === 'categories') {
                    // Convert categories to numbers and filter out any NaN values
                    const validCategories = formData[key]
                        .map(Number)
                        .filter(id => !isNaN(id));
                    
                    // Append each valid category ID
                    validCategories.forEach(categoryId => {
                        portfolioData.append('categories', categoryId);
                    });
                } else {
                    portfolioData.append(key, formData[key]);
                }
            });

            // Handle files
            if (images && images.length > 0) {
                images.forEach(image => {
                    portfolioData.append('images', image);
                });
            }

            if (files && files.length > 0) {
                files.forEach(file => {
                    portfolioData.append('files', file);
                });
            }

            let response;
            if (portfolioToEdit) {
                // Update existing portfolio
                response = await axios.put(`/portfolio/${portfolioToEdit._id}`, portfolioData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Portfolio updated successfully');
            } else {
                // Create new portfolio
                response = await axios.post('/portfolio', portfolioData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Portfolio created successfully');
            }

            // Refresh portfolios list
            const updatedPortfolios = await axios.get(`/portfolio/user/${user._id}`);
            setPortfolios(updatedPortfolios.data);
            setIsPortfolioModalOpen(false);
            setPortfolioToEdit(null);
        } catch (error) {
            console.error('Error saving portfolio:', error);
            toast.error(error.response?.data?.message || 'Failed to save portfolio');
        }
    };

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

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* User Profile Header */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
                <div className="flex items-center justify-between">
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
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                        <Edit2 size={20} />
                        <span>{isEditing ? "Cancel" : "Edit Preferences"}</span>
                    </button>
                </div>

                {/* Preferences Section */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Preferred Categories */}
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Tag className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-lg font-semibold text-white">
                                    Preferred Job Categories
                                </h3>
                            </div>
                            {isEditing ? (
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <label key={category._id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={preferredCategories.includes(category._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setPreferredCategories([...preferredCategories, category._id]);
                                                    } else {
                                                        setPreferredCategories(
                                                            preferredCategories.filter(id => id !== category._id)
                                                        );
                                                    }
                                                }}
                                                className="rounded text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <span className="text-gray-300">{category.name}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {preferredCategories.map(categoryId => {
                                        const category = categories.find(cat => cat._id === categoryId);
                                        return category ? (
                                            <span 
                                                key={categoryId} 
                                                className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm"
                                            >
                                                {category.name}
                                            </span>
                                        ) : null;
                                    })}
                                    {preferredCategories.length === 0 && (
                                        <span className="text-gray-400">No categories selected</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Preferred District */}
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <MapPin className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-lg font-semibold text-white">Preferred District</h3>
                            </div>
                            {isEditing ? (
                                <select
                                    value={preferredDistrict}
                                    onChange={(e) => setPreferredDistrict(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                                        focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                >
                                    <option value="">Select District</option>
                                    {availableDistricts.map((district) => (
                                        <option key={district} value={district}>
                                            {district}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="text-gray-300">
                                    {preferredDistrict || "Not specified"}
                                </span>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSavePreferences}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 
                                    text-white rounded-lg transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Portfolio Section */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <Briefcase className="w-6 h-6 text-emerald-500" />
                        <h2 className="text-2xl font-bold text-white">Portfolio</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Add Portfolio Button */}
                        <button
                            onClick={() => setIsPortfolioModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 
                                hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                            <span>Add Portfolio</span>
                        </button>

                        {/* Existing Filter */}
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-gray-700 text-white rounded-lg px-4 py-2 
                                    focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPortfolios.map((portfolio) => (
                        <PortfolioItem
                            key={portfolio._id}
                            item={portfolio}
                            categories={categories}
                            showActions={true}
                            onEdit={() => {
                                setIsPortfolioModalOpen(true);
                                setPortfolioToEdit(portfolio);
                            }}
                            onDelete={() => handleDeletePortfolio(portfolio._id)}
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
                                                src={`http://localhost:5000/uploads/${review.reviewerId.image}`}
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

            {isPortfolioModalOpen && (
                <PortfolioModalForm
                    isOpen={isPortfolioModalOpen}
                    onClose={() => {
                        setIsPortfolioModalOpen(false);
                        setPortfolioToEdit(null);
                    }}
                    onSave={handleCreatePortfolio}
                    item={portfolioToEdit}
                />
            )}
        </div>
    );
};

export default WorkerProfileTab;