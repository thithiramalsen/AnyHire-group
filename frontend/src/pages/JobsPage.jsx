import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { MapPin, FileText, Calendar, SendHorizontal } from 'lucide-react';

const JobsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAvailableBookings();
    }, []);

    const fetchAvailableBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/booking/available');
            
            if (response.data.success) {
                setBookings(response.data.bookings);
            }
        } catch (error) {
            console.error('Error fetching available bookings:', error);
            toast.error('Failed to fetch available jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (e, bookingId) => {
        e.stopPropagation(); // Prevent card click navigation
        navigate(`/apply/${bookingId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center bg-gray-800 rounded-lg p-8">
                    <h2 className="text-2xl font-bold mb-4">No Available Jobs</h2>
                    <p className="text-gray-400">Check back later for new opportunities!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Available Jobs</h1>
                <button 
                    onClick={fetchAvailableBookings}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 
                        transition-colors flex items-center gap-2"
                >
                    Refresh
                </button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map(booking => (
                    <div
                        key={booking._id}
                        onClick={() => navigate(`/booking/${booking._id}`)}
                        className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer 
                            hover:bg-gray-700 transition-colors border border-gray-700 hover:border-emerald-500"
                    >
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-2 text-white">
                                {booking.title}
                            </h3>
                            <p className="text-gray-400 mb-4 line-clamp-2">
                                {booking.description}
                            </p>
                            
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
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-emerald-500 font-semibold text-lg">
                                        Rs. {booking.payment.amount.toLocaleString()}
                                    </span>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 
                                        rounded-full text-xs font-semibold">
                                        Available
                                    </span>
                                </div>
                                
                                <button
                                    onClick={(e) => handleApply(e, booking._id)}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 
                                        rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <SendHorizontal size={16} />
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobsPage;