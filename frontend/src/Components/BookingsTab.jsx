import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Chat from './Chat';

const BookingsTab = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get("/booking/me");
                // Fetch job details for each booking
                const bookingsWithDetails = await Promise.all(
                    response.data.map(async (booking) => {
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
                console.error("Error fetching bookings:", error);
                toast.error("Failed to load bookings");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleAcceptApplication = async (bookingId) => {
        try {
            await axios.patch(`/booking/${bookingId}/status`, { status: 'accepted' });
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
        } catch (error) {
            console.error("Error accepting application:", error);
            toast.error("Failed to accept application");
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

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>;
    }

    // Filter bookings where the user is the poster
    const postedJobs = bookings.filter(booking => booking.posterId === user._id);

    // Separate bookings into different sections
    const activeBookings = postedJobs.filter(booking => 
        ['applied', 'accepted', 'in_progress', 'completed_by_seeker', 'completed'].includes(booking.status)
    );
    const declinedBookings = postedJobs.filter(booking => booking.status === 'declined');
    const cancelledBookings = postedJobs.filter(booking => booking.status === 'cancelled');

    if (postedJobs.length === 0) {
        return <div className="text-center text-gray-500 mt-8">No applications for your posted jobs yet.</div>;
    }

    const renderBookingCard = (booking) => (
        <div key={booking._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                <div className="flex gap-4">
                    {/* Job Image */}
                    {booking.jobDetails?.images && (
                        <div className="w-24 h-24 flex-shrink-0">
                            <img
                                src={`http://localhost:5000${booking.jobDetails.images}`}
                                alt={booking.jobTitle}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>
                    )}
                    
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">{booking.jobTitle}</h3>
                                <div className="space-y-1 text-sm text-gray-400">
                                    <p>Job ID: #{booking.jobId}</p>
                                    <p>Location: {booking.jobDetails?.district || 'Not specified'}</p>
                                    <p>Category: {booking.jobDetails?.category || 'Not specified'}</p>
                                    <p>Seeker: {booking.seekerDetails?.name || booking.seekerName || 'Anonymous'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-green-400 font-semibold">Rs. {booking.payment.amount}</p>
                                <p className="text-sm text-gray-400">
                                    Applied: {new Date(booking.dates.applied).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-700">
                            <div>
                                <p className="text-sm text-gray-400">
                                    Status: <span className={`${
                                        booking.status === 'applied' ? 'text-yellow-400' : 
                                        booking.status === 'accepted' ? 'text-green-400' : 
                                        booking.status === 'declined' ? 'text-red-400' :
                                        booking.status === 'in_progress' ? 'text-blue-400' :
                                        booking.status === 'completed_by_seeker' ? 'text-purple-400' :
                                        booking.status === 'completed' ? 'text-emerald-400' :
                                        booking.status === 'cancelled' ? 'text-gray-400' :
                                        'text-gray-400'
                                    }`}>
                                        {booking.status.split('_').map(word => 
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}
                                    </span>
                                </p>
                            </div>
                            <div className="space-x-2">
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
                                {['accepted', 'in_progress', 'completed_by_seeker', 'completed', 'payment_pending', 'paid'].includes(booking.status) && (
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
                                {booking.status === 'accepted' && (
                                    <button
                                        onClick={() => handleCancelBooking(booking._id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
            
            {/* Active Bookings Section */}
            <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Active Applications</h3>
                {activeBookings.length > 0 ? (
                    activeBookings.map(renderBookingCard)
                ) : (
                    <p className="text-gray-400 text-center py-4">No active applications.</p>
                )}
            </div>

            {/* Declined Bookings Section */}
            {declinedBookings.length > 0 && (
                <div className="mt-8 space-y-6">
                    <h3 className="text-xl font-semibold mb-4">Declined Applications</h3>
                    {declinedBookings.map(renderBookingCard)}
                </div>
            )}

            {/* Cancelled Bookings Section */}
            {cancelledBookings.length > 0 && (
                <div className="mt-8 space-y-6">
                    <h3 className="text-xl font-semibold mb-4">Cancelled Bookings</h3>
                    {cancelledBookings.map(renderBookingCard)}
                </div>
            )}
        </div>
    );
};

export default BookingsTab;