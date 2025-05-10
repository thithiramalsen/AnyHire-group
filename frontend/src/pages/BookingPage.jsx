import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useUserStore } from '../stores/useUserStore';
import { Play, MessageCircle, Check, CreditCard, CheckCircle2, AlertCircle, Star } from 'lucide-react'; // Replace HeroIcon import with Lucide
import Chat from '../Components/Chat';
import PaymentConfirmation from './PaymentConfirmation';

const BookingPage = () => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]); // Add categories state
    const { user } = useUserStore();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [reviewsByBooking, setReviewsByBooking] = useState({}); // Add reviews state

    const canShowReview = payment && ['confirmed', 'completed'].includes(payment.status);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!bookingId) {
                    toast.error("Invalid booking ID");
                    navigate('/bookings');
                    return;
                }

                const [bookingRes, paymentRes] = await Promise.all([
                    axios.get(`/booking/${bookingId}`),
                    axios.get(`/payment/booking/${bookingId}`).catch(err => {
                        if (err.response?.status === 404) {
                            return { data: { success: false, payment: null } };
                        }
                        throw err;
                    })
                ]);

                setBooking(bookingRes.data);
                setPayment(paymentRes.data.payment);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error(error.response?.data?.message || "Error loading booking details");
                setLoading(false);
            }
        };

        fetchData();
    }, [bookingId, navigate]);

    const handleStartJob = async () => {
        try {
            await axios.patch(`/booking/${bookingId}/status`, { 
                status: 'in_progress',
                date: new Date()
            });
            toast.success('Job started successfully!');
            fetchBooking(); // Refresh booking data
        } catch (error) {
            console.error('Error starting job:', error);
            toast.error(error.response?.data?.message || 'Error starting job');
        }
    };

    const handleCompleteJob = async () => {
        try {
            await axios.patch(`/booking/${bookingId}/status`, { 
                status: 'completed_by_seeker',
                date: new Date()
            });
            toast.success('Job marked as completed!');
            fetchBooking(); // Refresh booking data
        } catch (error) {
            console.error('Error completing job:', error);
            toast.error(error.response?.data?.message || 'Error completing job');
        }
    };

    const handleConfirmCompletion = async () => {
        try {
            // Update both booking and job status
            await Promise.all([
                axios.patch(`/booking/${bookingId}/status`, { 
                    status: 'payment_pending',
                    date: new Date()
                }),
                axios.patch(`/job/up/${booking.jobId}`, {
                    status: 'completed'
                })
            ]);
            toast.success('Job completion confirmed! Payment pending.');
            fetchBooking(); // Refresh booking data
        } catch (error) {
            console.error('Error confirming completion:', error);
            toast.error(error.response?.data?.message || 'Error confirming completion');
        }
    };

    const handleProceedToPayment = () => {
        // Navigate to payment page with booking details
        navigate(`/payment/${bookingId}`);
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => Number(cat._id) === Number(categoryId));
        return category ? category.name : "Unknown Category";
    };

    const renderActionButton = () => {
        if (booking.status === 'accepted' && user.role === 'jobSeeker') {
            return (
                <button
                    onClick={handleStartJob}
                    className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Play size={20} />
                    Start Job
                </button>
            );
        } else if (booking.status === 'in_progress' && user.role === 'jobSeeker') {
            return (
                <button
                    onClick={handleCompleteJob}
                    className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Check size={20} />
                    Complete Job
                </button>
            );
        } else if (booking.status === 'completed_by_seeker' && user.role === 'customer') {
            return (
                <button
                    onClick={handleConfirmCompletion}
                    className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Check size={20} />
                    Confirm Job Completion
                </button>
            );
        } else if (booking.status === 'payment_pending' && user.role === 'customer' && !payment) {
            return (
                <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-emerald-500 text-white py-3 px-6 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                    <CreditCard size={20} />
                    Proceed to Payment
                </button>
            );
        }
        return null;
    };

    const renderActionButtons = () => (
        <div className="flex gap-4">
            {renderActionButton()}
            
            {canShowReview && !reviewsByBooking?.[booking._id] && (
                <button
                    onClick={() => navigate(`/review/${booking._id}`)}
                    className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Star size={20} />
                    Leave Review
                </button>
            )}
            
            <button
                onClick={() => navigate(`/chat/${booking._id}`)}
                className="w-full bg-emerald-500 text-white py-3 px-6 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
            >
                <MessageCircle size={20} />
                Chat
            </button>
        </div>
    );

    const renderUserInfo = () => {
        if (!booking) return null;

        const isCustomer = user.role === 'customer';
        const relevantUser = isCustomer ? booking.seekerDetails : booking.posterDetails;

        return (
            <div className="flex items-center gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-semibold mb-1">
                        {isCustomer ? 'Job Seeker' : 'Customer'}
                    </h3>
                    <p className="text-gray-400">{relevantUser?.name}</p>
                </div>
                <button
                    onClick={() => navigate(`/chat/${booking._id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <MessageCircle size={20} />
                    Chat
                </button>
            </div>
        );
    };

    const renderPaymentSection = () => {
        if (payment) {
            return (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-400">
                                    Status: <span className={`font-semibold ${
                                        payment.status === 'completed' ? 'text-emerald-500' :
                                        payment.status === 'pending' ? 'text-yellow-500' :
                                        payment.status === 'awaiting_confirmation' ? 'text-blue-500' :
                                        payment.status === 'reported' ? 'text-red-500' :
                                        'text-gray-500'
                                    }`}>
                                        {payment.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </p>
                                <p className="text-gray-400 mt-1">
                                    Amount: <span className="text-emerald-500 font-semibold">Rs. {payment.amount}</span>
                                </p>
                                {payment.paymentType === 'payment_proof' && (
                                    <p className="text-gray-400 mt-1">
                                        Type: <span className="font-semibold">Payment Proof</span>
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    // Fix the navigation path for job seekers
                                    if (user.role === 'jobSeeker') {
                                        navigate(`/confirm-payment/${bookingId}`); // Changed from /payment/${bookingId}/confirm
                                    } else {
                                        navigate(`/payment/${bookingId}`);
                                    }
                                }}
                                className="bg-emerald-500 text-white py-2 px-6 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                            >
                                <CreditCard size={20} />
                                {user.role === 'jobSeeker' ? 'Review Payment' : 'View Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // If payment is pending and user is customer
        if (booking.status === 'payment_pending' && user?._id === booking.posterId) {
            return (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Payment Required</h2>
                    <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 mb-4">
                            Please complete the payment to proceed with the booking.
                        </p>
                        <button
                            onClick={() => navigate(`/payment/${bookingId}`)}
                            className="bg-emerald-500 text-white py-2 px-6 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                        >
                            <CreditCard size={20} />
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            );
        }

        return null;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>;
    }

    if (!booking) {
        return <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-red-600">Booking not found</h2>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    {booking.jobDetails?.images && (
                        <img
                            src={`http://localhost:5000${booking.jobDetails.images}`}
                            alt={booking.jobTitle}
                            className="w-full h-64 object-cover"
                        />
                    )}
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold">{booking.jobTitle}</h1>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                booking.status === 'accepted' ? 'bg-green-500' :
                                booking.status === 'in_progress' ? 'bg-blue-500' :
                                booking.status === 'completed_by_seeker' ? 'bg-purple-500' :
                                booking.status === 'completed' ? 'bg-emerald-500' :
                                'bg-gray-500'
                            } text-white`}>
                                {booking.status.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                            </span>
                        </div>

                        {renderUserInfo()} {/* Add this line after the header */}

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Location</h3>
                                <p className="text-gray-400">{booking.jobDetails?.location}, {booking.jobDetails?.district}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Category</h3>
                                <p className="text-gray-400">{getCategoryName(booking.jobDetails?.category)}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Payment</h3>
                                <p className="text-green-400 font-semibold">Rs. {booking.payment?.amount}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Status</h3>
                                <p className={`font-semibold ${
                                    booking.status === 'applied' ? 'text-yellow-400' :
                                    booking.status === 'accepted' ? 'text-green-400' :
                                    booking.status === 'in_progress' ? 'text-blue-400' :
                                    'text-gray-400'
                                }`}>
                                    {booking.status.split('_').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-400 whitespace-pre-line">{booking.jobDetails?.description}</p>
                        </div>

                        <div className="mt-8 border-t border-gray-700 pt-6">
                            <div className="flex flex-col items-center space-y-4">
                                {renderActionButtons()}
                                {booking.dates?.started && (
                                    <p className="text-sm text-gray-400">
                                        Started on: {new Date(booking.dates.started).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {renderPaymentSection()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;