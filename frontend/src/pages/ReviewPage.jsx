import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';
import { useUserStore } from '../stores/useUserStore';

const ReviewPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useUserStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(`/review/${bookingId}`, {
                rating,
                comment
            });
            toast.success('Review submitted successfully!');
            navigate(`/payment/${bookingId}`);
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(user?.role === 'jobSeeker' ? `/confirm-payment/${bookingId}` : `/payment/${bookingId}`)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                        Back to Payment
                    </button>
                    {user?.role === 'jobSeeker' && (
                        <button
                            onClick={() => navigate('/jobs')}
                            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
                        >
                            <Search size={20} />
                            Find More Jobs
                        </button>
                    )}
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6">Leave a Review</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-lg mb-4">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            size={32}
                                            className={`${
                                                star <= (hoveredStar || rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-400'
                                            } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-lg mb-2">
                                Comment (Optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                rows="4"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || rating === 0}
                            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewPage;