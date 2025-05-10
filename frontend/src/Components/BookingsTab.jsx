import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Star, Edit2, Trash2 } from 'lucide-react';
import Chat from './Chat';

const BookingsTab = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUserStore();
    const navigate = useNavigate();
    const [reviewsByBooking, setReviewsByBooking] = useState({});
    const [categories, setCategories] = useState({});

    useEffect(() => {
        const fetchBookingsAndReviews = async () => {
            try {
                // Fetch categories first
                const categoriesRes = await axios.get("/category");
                const categoriesMap = {};
                categoriesRes.data.categories.forEach(cat => {
                    categoriesMap[cat._id] = cat.name;
                });
                setCategories(categoriesMap);

                const [bookingsRes, reviewsRes] = await Promise.all([
                    axios.get("/booking/me"),
                    axios.get(`/reviews/user/${user._id}?type=given`)
                ]);
                const reviews = reviewsRes.data || [];
                console.log("Fetched reviews:", reviews);

                // Map reviews by bookingId for quick lookup
                const reviewsMap = {};
                reviews.forEach(r => {
                    if (r.bookingId?._id) {
                        reviewsMap[r.bookingId._id] = r;
                    } else if (r.bookingId) {
                        reviewsMap[r.bookingId] = r;
                    }
                    console.log("Mapping review:", {
                        reviewId: r._id,
                        bookingId: r.bookingId?._id || r.bookingId,
                        mapped: reviewsMap
                    });
                });
                setReviewsByBooking(reviewsMap);

                // Fetch job and seeker details for each booking
                const bookingsWithDetails = await Promise.all(
                    bookingsRes.data.map(async (booking) => {
                        try {
                            const jobResponse = await axios.get(`/job/${booking.jobId}`);
                            const seekerResponse = await axios.get(`/users/booking-info/${booking.seekerId}`);
                            return {
                                ...booking,
                                jobDetails: jobResponse.data,
                                seekerDetails: seekerResponse.data
                            };
                        } catch (error) {
                            console.error("Error fetching details:", error);
                            return booking;
                        }
                    })
                );
                setBookings(bookingsWithDetails);
            } catch (error) {
                console.error("Error fetching bookings or reviews:", error);
                toast.error("Failed to load bookings");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookingsAndReviews();
    }, [user._id]);

    const handleAcceptApplication = async (bookingId) => {
        try {
            const response = await axios.patch(`/booking/${bookingId}/status`, { status: 'accepted' });
            if (response.data) {
                // Update the bookings state to reflect the change
                setBookings(bookings.map(booking => {
                    if (booking._id === bookingId) {
                        return { ...booking, status: 'accepted' };
                    }
                    // If this booking is for the same job as the accepted one, mark it as declined
                    if (booking.jobId === bookings.find(b => b._id === bookingId)?.jobId && booking._id !== bookingId) {
                        return { ...booking, status: 'declined' };
                    }
                    return booking;
                }));
                toast.success("Application accepted successfully");
            }
        } catch (error) {
            console.error("Error accepting application:", error);
            toast.error(error.response?.data?.message || "Failed to accept application");
        }
    };

    const handleDeclineApplication = async (bookingId) => {
        try {
            await axios.patch(`/booking/${bookingId}/status`, { status: 'declined' });
            setBookings(bookings.map(booking => 
                booking._id === bookingId ? { ...booking, status: 'declined' } : booking
            ));
            toast.success("Application declined successfully");
        } catch (error) {
            console.error("Error declining application:", error);
            toast.error("Failed to decline application");
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            await axios.patch(`/booking/${bookingId}/status`, { 
                status: 'cancelled' 
            });

            // Remove the booking from state if it was deleted
            setBookings(prevBookings => 
                prevBookings.filter(booking => booking._id !== bookingId)
            );

            toast.success('Booking cancelled successfully');
        } catch (error) {
            console.error('Cancel booking error:', error);
            toast.error('Failed to cancel booking');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            // Update the endpoint to use the new user delete route
            await axios.delete(`/reviews/user/${reviewId}`);
            toast.success('Review deleted successfully');
            
            // Update reviewsByBooking state to remove the deleted review
            setReviewsByBooking(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(key => {
                    if (updated[key]._id === reviewId) {
                        delete updated[key];
                    }
                });
                return updated;
            });
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>;
    }

    // Filter bookings where the user is the poster
    const postedJobs = bookings.filter(booking => booking.posterId === user._id);

    // Separate bookings into different sections
    const activeApplications = postedJobs.filter(booking => booking.status === 'applied');
    
    const ongoingBookings = postedJobs.filter(booking => 
        ['accepted', 'in_progress', 'completed_by_seeker', 'payment_pending'].includes(booking.status) ||
        ['pending', 'awaiting_confirmation'].includes(booking.payment?.status)
    );
    
    const completedBookings = postedJobs.filter(booking => 
        booking.status === 'paid' || booking.payment?.status === 'completed'
    );
    
    const declinedBookings = postedJobs.filter(booking => booking.status === 'declined');
    const cancelledBookings = postedJobs.filter(booking => booking.status === 'cancelled');

    const renderReviewSection = (booking) => {
        console.log("Rendering review section for booking:", {
            bookingId: booking._id,
            hasReview: !!reviewsByBooking[booking._id],
            review: reviewsByBooking[booking._id],
            paymentStatus: booking.payment?.status
        });

        const review = reviewsByBooking[booking._id];
        const canShowReview = booking.status === 'paid' || 
                             booking.payment?.status === 'confirmed' || 
                             booking.payment?.status === 'completed';

        if (!canShowReview) {
            console.log("Cannot show review:", { status: booking.status, payment: booking.payment });
            return null;
        }

        return (
            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-white">Review</h4>
                    <div className="flex gap-2">
                        {review ? (
                            <>
                                <button
                                    onClick={() => navigate(`/review/${booking._id}`, { 
                                        state: { fromBookingsTab: true, isEditing: true } 
                                    })}
                                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg 
                                        hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                >
                                    <Edit2 size={20} />
                                    Edit Review
                                </button>
                                <button
                                    onClick={() => handleDeleteReview(review._id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg 
                                        hover:bg-red-600 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={20} />
                                    Delete
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate(`/review/${booking._id}`, { 
                                    state: { fromBookingsTab: true } 
                                })}
                                className="bg-yellow-500 text-white px-4 py-2 rounded-lg 
                                    hover:bg-yellow-600 transition-colors flex items-center gap-2"
                            >
                                <Star size={20} />
                                Leave Review
                            </button>
                        )}
                    </div>
                </div>
                {review && (
                    <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {[...Array(5)].map((_, index) => (
                                <Star
                                    key={index}
                                    className={`w-5 h-5 ${
                                        index < review.rating 
                                            ? "text-yellow-400 fill-current" 
                                            : "text-gray-600"
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="text-gray-300">{review.comment}</p>
                        <p className="text-sm text-gray-400 mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const renderBookingCard = (booking) => {
        return (
            <div key={booking._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {booking.jobDetails?.images && (
                    <img
                        src={`http://localhost:5000${booking.jobDetails.images}`}
                        alt={booking.jobTitle}
                        className="w-full h-48 object-cover"
                    />
                )}
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{booking.jobTitle}</h3>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">📍 {booking.jobDetails?.district || 'Not specified'}</span>
                            <span className="text-gray-400">📁 {categories[booking.jobDetails?.category] || 'Not specified'}</span>
                        </div>
                        <p className="text-gray-400">Seeker: {booking.seekerDetails?.name || booking.seekerName || 'Anonymous'}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                        <div>
                            <p className="text-green-400 font-semibold">Rs. {booking.payment.amount}</p>
                            <p className="text-sm text-gray-400">
                                Status: <span className={`${
                                    booking.status === 'applied' ? 'text-yellow-400' :
                                    booking.status === 'accepted' ? 'text-green-400' :
                                    booking.status === 'in_progress' ? 'text-blue-400' :
                                    booking.status === 'completed_by_seeker' ? 'text-purple-400' :
                                    booking.status === 'payment_pending' ? 'text-orange-400' :
                                    booking.status === 'completed' ? 'text-emerald-400' :
                                    booking.status === 'declined' ? 'text-red-400' :
                                    'text-gray-400'
                                }`}>
                                    {booking.status.split('_').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {booking.status === 'applied' && (
                                <>
                                    <button
                                        onClick={() => handleAcceptApplication(booking._id)}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleDeclineApplication(booking._id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Decline
                                    </button>
                                </>
                            )}
                            {['accepted', 'in_progress', 'completed_by_seeker', 'completed', 'payment_pending', 'paid', 'confirmed'].includes(booking.status) && (
                                <>
                                    <button
                                        onClick={() => navigate(`/booking/${booking._id}`)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        View Job
                                    </button>
                                    <button
                                        onClick={() => navigate(`/chat/${booking._id}`)}
                                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                    >
                                        <MessageCircle size={20} />
                                        Chat
                                    </button>
                                </>
                            )}
                            {booking.payment?.status === 'confirmed' || booking.payment?.status === 'completed' && !reviewsByBooking[booking._id] && (
                                <button
                                    onClick={() => navigate(`/review/${booking._id}`, { 
                                        state: { fromBookingsTab: true } 
                                    })}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                                >
                                    <Star size={20} />
                                    Review
                                </button>
                            )}
                        </div>
                    </div>
                    {renderReviewSection(booking)}
                </div>
            </div>
        );
    };

    // Update the return statement to use grid layout
    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
            
            {/* Active Applications Section */}
            {activeApplications.length > 0 && (
                <>
                    <h3 className="text-xl font-semibold mb-6">Active Applications</h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                        {activeApplications.map(renderBookingCard)}
                    </div>
                </>
            )}

            {/* Ongoing Bookings Section */}
            {ongoingBookings.length > 0 && (
                <>
                    <h3 className="text-xl font-semibold mb-6">Ongoing Bookings</h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                        {ongoingBookings.map(renderBookingCard)}
                    </div>
                </>
            )}

            {/* Completed Bookings Section */}
            {completedBookings.length > 0 && (
                <>
                    <h3 className="text-xl font-semibold mb-6">Completed Bookings</h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                        {completedBookings.map(renderBookingCard)}
                    </div>
                </>
            )}

            {/* Declined Bookings Section */}
            {declinedBookings.length > 0 && (
                <>
                    <h3 className="text-xl font-semibold mb-6">Declined Applications</h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                        {declinedBookings.map(renderBookingCard)}
                    </div>
                </>
            )}

            {/* Show message if no bookings */}
            {postedJobs.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    No applications for your posted jobs yet.
                </div>
            )}
        </div>
    );
};

export default BookingsTab;