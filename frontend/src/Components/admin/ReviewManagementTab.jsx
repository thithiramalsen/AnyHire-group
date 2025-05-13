import { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";
import { 
  Search, Filter, Star, Trash2, Eye, 
  Calendar, MessageSquare, User, RefreshCw 
} from "lucide-react";

const ReviewManagementTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [reviewTypeFilter, setReviewTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/reviews/admin");
      setReviews(response.data);
      toast.success("Reviews loaded successfully");
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    toast((t) => (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete this review? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              try {
                await axios.delete(`/reviews/${reviewId}`);
                setReviews(reviews.filter(review => review._id !== reviewId));
                toast.success("Review deleted successfully!");
                toast.dismiss(t.id);
              } catch (error) {
                console.error("Error deleting review:", error);
                toast.error("Failed to delete review");
              }
            }}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 
              rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-300 
              bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'transparent',
        boxShadow: 'none',
      },
    });
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      (review.reviewerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (review.revieweeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesRating = ratingFilter === "all" || review.rating === parseInt(ratingFilter);
    const matchesType = reviewTypeFilter === "all" || review.reviewType === reviewTypeFilter;
    
    const reviewDate = new Date(review.createdAt);
    const matchesDateRange = 
      (!dateRange.start || reviewDate >= new Date(dateRange.start)) &&
      (!dateRange.end || reviewDate <= new Date(dateRange.end));
    
    return matchesSearch && matchesRating && matchesType && matchesDateRange;
  });

  const getReviewTypeLabel = (type) => {
    return type === "customer_to_seeker" ? "Customer to Seeker" : "Seeker to Customer";
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 5: return "text-yellow-400";
      case 4: return "text-yellow-500";
      case 3: return "text-yellow-600";
      case 2: return "text-orange-500";
      case 1: return "text-red-500";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Review Management</h2>
        <button
          onClick={fetchReviews}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Star className="text-gray-400" size={20} />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <MessageSquare className="text-gray-400" size={20} />
          <select
            value={reviewTypeFilter}
            onChange={(e) => setReviewTypeFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="customer_to_seeker">Customer to Seeker</option>
            <option value="seeker_to_customer">Seeker to Customer</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={20} />
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reviewer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reviewee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredReviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {review.reviewerId?.image ? (
                        <img
                          src={`http://localhost:5000/uploads/${review.reviewerId.image}`}
                          alt={review.reviewerId?.name || 'User'}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-2">
                          <User size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div className="text-sm font-medium text-white">
                        {review.reviewerId?.name || 'Unknown User'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {review.revieweeId?.image ? (
                        <img
                          src={`http://localhost:5000/uploads/${review.revieweeId.image}`}
                          alt={review.revieweeId?.name || 'User'}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-2">
                          <User size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div className="text-sm font-medium text-white">
                        {review.revieweeId?.name || 'Unknown User'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className={`${getRatingColor(review.rating)} mr-1`} size={20} />
                      <span className="text-sm text-white">{review.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300 max-w-xs truncate">
                      {review.comment || "No comment"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white">
                      {getReviewTypeLabel(review.reviewType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`/booking/${review.bookingId}`, '_blank')}
                        className="text-emerald-500 hover:text-emerald-400"
                        title="View Booking"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-red-500 hover:text-red-400"
                        title="Delete Review"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewManagementTab;