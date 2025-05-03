import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useUserStore } from '../stores/useUserStore';
import { Play, MessageCircle } from 'lucide-react'; // Replace HeroIcon import with Lucide

const BookingPage = () => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            const response = await axios.get(`/booking/${bookingId}`);
            setBooking(response.data);
        } catch (error) {
            console.error('Error fetching booking:', error);
            toast.error('Error loading booking details');
        } finally {
            setLoading(false);
        }
    };

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

    const renderActionButton = () => {
        if (booking.status === 'accepted') {
            return (
                <button
                    onClick={handleStartJob}
                    className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Play size={20} /> {/* Replace PlayIcon with Lucide Play */}
                    Start Job
                </button>
            );
        }
        return null;
    };

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
                    onClick={() => {/* Chat functionality will go here */}}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <MessageCircle size={20} />
                    Chat
                </button>
            </div>
        );
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
                                <p className="text-gray-400">{booking.jobDetails?.category}</p>
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
                                {renderActionButton()}
                                {booking.dates?.started && (
                                    <p className="text-sm text-gray-400">
                                        Started on: {new Date(booking.dates.started).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;