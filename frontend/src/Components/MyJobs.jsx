import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import { MapPin, FileText, Calendar, DollarSign } from 'lucide-react';

// Use the same hardcoded categories as other components
const JOB_CATEGORIES = [
    'Cleaning',
    'Gardening',
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Moving',
    'Pet Care',
    'Computer Repair',
    'Teaching',
    'Cooking',
    'Driving',
    'Other'
];

const MyJobs = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useUserStore();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/booking/user');
            
            if (response.data.success) {
                setBookings(response.data.bookings);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to load your jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            const confirmed = await new Promise((resolve) => {
                toast.custom((t) => (
                    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                        <p className="text-white mb-4">Are you sure you want to cancel this job?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    resolve(false);
                                }}
                                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                No
                            </button>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    resolve(true);
                                }}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                ), { duration: 5000 });
            });

            if (!confirmed) return;

            await axios.patch(`/booking/${bookingId}/status`, { status: 'cancelled' });
            await fetchBookings(); // Refresh the list
            toast.success("Job cancelled successfully");
        } catch (error) {
            console.error("Error cancelling job:", error);
            toast.error("Failed to cancel job");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const renderBookingCard = (booking) => (
        <div key={booking._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{booking.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-2">{booking.description}</p>
                
                <div className="flex flex-col gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-emerald-500" />
                        <span>{booking.location.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-emerald-500" />
                        <span>{booking.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-emerald-500" />
                        <span>{new Date(booking.dates.created).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-emerald-500" />
                        <span className="font-semibold">Rs. {booking.payment.amount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                            booking.status === 'accepted' ? 'bg-blue-500/10 text-blue-500' :
                            booking.status === 'in_progress' ? 'bg-purple-500/10 text-purple-500' :
                            booking.status === 'completed_by_seeker' ? 'bg-cyan-500/10 text-cyan-500' :
                            booking.status === 'payment_pending' ? 'bg-orange-500/10 text-orange-500' :
                            booking.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                            booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                            'bg-gray-500/10 text-gray-500'
                        }`}>
                            {booking.status.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                        </span>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/booking/${booking._id}`)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                                    transition-colors"
                            >
                                View Details
                            </button>
                            
                            {booking.status === 'pending' && (
                                <button
                                    onClick={() => handleCancelBooking(booking._id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                                        transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">My Jobs</h2>
            {bookings.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.map(renderBookingCard)}
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    You don't have any jobs yet.
                </div>
            )}
        </div>
    );
};

export default MyJobs;