import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Star, Edit2, Trash2, Filter, Calendar, Briefcase } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const ReviewsTab = () => {
    const { user } = useUserStore();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, received, given
    const [sortOrder, setSortOrder] = useState("desc"); // desc, asc

    const fetchReviews = async () => {
        try {
            setLoading(true);
            console.log("Fetching reviews for user:", user._id);

            if (filter === "all") {
                const [receivedRes, givenRes] = await Promise.all([
                    axios.get(`/reviews/user/${user._id}?type=received`),
                    axios.get(`/reviews/user/${user._id}?type=given`)
                ]);

                // Combine and sort by date
                setReviews([...receivedRes.data, ...givenRes.data]);
            } else {
                const response = await axios.get(`/reviews/user/${user._id}?type=${filter}`);
                setReviews(response.data);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?._id) {
            fetchReviews();
        }
    }, [user?._id, filter]);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            await axios.delete(`/reviews/${reviewId}`);
            toast.success("Review deleted successfully");
            fetchReviews();
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review");
        }
    };

    const handleEditReview = async (reviewId, newRating, newComment) => {
        try {
            await axios.put(`/reviews/${reviewId}`, {
                rating: newRating,
                comment: newComment
            });
            toast.success("Review updated successfully");
            fetchReviews();
        } catch (error) {
            console.error("Error updating review:", error);
            toast.error("Failed to update review");
        }
    };

    const sortedReviews = [...reviews].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Star
                key={index}
                className={`w-5 h-5 ${
                    index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
                }`}
            />
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">My Reviews</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">All Reviews</option>
                            <option value="received">Reviews Received</option>
                            <option value="given">Reviews Given</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                        className="text-gray-400 hover:text-white"
                    >
                        Sort {sortOrder === "desc" ? "↓" : "↑"}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-gray-400">Loading reviews...</div>
            ) : sortedReviews.length === 0 ? (
                <div className="text-center text-gray-400">No reviews found</div>
            ) : (
                <div className="space-y-4">
                    {sortedReviews.map((review) => (
                        <div
                            key={review._id}
                            className="bg-gray-800 rounded-lg p-6 shadow-lg"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {filter === "all" ? (
                                            review.reviewerId?._id === user?._id ? (
                                                <>Review for: {review.revieweeId?.name ?? "User not found"}</>
                                            ) : (
                                                <>Review from: {review.reviewerId?.name ?? "User not found"}</>
                                            )
                                        ) : filter === "given" ? (
                                            <>Review for: {review.revieweeId?.name ?? "User not found"}</>
                                        ) : (
                                            <>Review from: {review.reviewerId?.name ?? "User not found"}</>
                                        )}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center text-gray-400">
                                            <Briefcase className="w-4 h-4 mr-2" />
                                            <span>{review.bookingId?.title ?? "Booking not found"}</span>
                                        </div>
                                        <div className="flex items-center text-gray-400">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(filter === "given" || (filter === "all" && review.reviewerId?._id === user?._id)) && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    const newRating = prompt("Enter new rating (1-5):", review.rating);
                                                    if (!newRating || isNaN(newRating) || +newRating < 1 || +newRating > 5) {
                                                        toast.error("Please enter a valid rating between 1 and 5");
                                                        return;
                                                    }
                                                    const newComment = prompt("Enter new comment:", review.comment ?? "");
                                                    if (newComment !== null) {
                                                        handleEditReview(review._id, parseInt(newRating), newComment);
                                                    }
                                                }}
                                                className="text-emerald-400 hover:text-emerald-300"
                                                title="Edit Review"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(review._id)}
                                                className="text-red-400 hover:text-red-300"
                                                title="Delete Review"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                {renderStars(review.rating ?? 0)}
                            </div>
                            <p className="text-gray-300 mb-4">{review.comment ?? "No comment provided"}</p>
                            {review.bookingId && (
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">Category:</span>
                                            <span className="text-emerald-400">
                                                {review.bookingId?.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">Amount:</span>
                                            <span className="text-emerald-400">
                                                Rs. {review.bookingId?.payment?.amount?.toLocaleString() ?? "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">Status:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                review.bookingId?.status === 'paid' 
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : review.bookingId?.status === 'pending'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : review.bookingId?.status === 'in_progress'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {review.bookingId?.status?.replace('_', ' ').toUpperCase() ?? "unknown"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">Location:</span>
                                            <span className="text-gray-300 truncate">
                                                {review.bookingId?.location?.address ?? "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewsTab;