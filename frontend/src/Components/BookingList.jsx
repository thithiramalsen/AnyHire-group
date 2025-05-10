import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookingList = ({ userType }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get('/bookings/me');
            // Filter bookings based on userType if specified
            const filteredBookings = userType 
                ? response.data.filter(booking => 
                    userType === 'seeker' 
                        ? booking.seekerId === user.id 
                        : booking.posterId === user.id)
                : response.data;
            
            setBookings(filteredBookings);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await axios.patch(`/bookings/${bookingId}/seeker-status`, {
                status: newStatus
            });
            fetchBookings(); // Refresh the list
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleConfirmCompletion = async (bookingId) => {
        try {
            await axios.patch(`/bookings/${bookingId}/confirm-completion`);
            fetchBookings(); // Refresh the list
        } catch (error) {
            console.error('Error confirming completion:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            payment_pending: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
            {bookings.length === 0 ? (
                <p className="text-gray-500">No bookings found.</p>
            ) : (
                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{booking.jobTitle}</h3>
                                    <p className="text-gray-600 mt-1">
                                        Created: {new Date(booking.dates.created).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                                    {booking.status.replace('_', ' ').toUpperCase()}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                        {booking.dates.started && (
                                            <p className="text-sm text-gray-600">
                                                Started: {new Date(booking.dates.started).toLocaleDateString()}
                                            </p>
                                        )}
                                        {booking.dates.completed && (
                                            <p className="text-sm text-gray-600">
                                                Completed: {new Date(booking.dates.completed).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-x-3">
                                        {user.id === booking.seekerId && booking.status !== 'payment_pending' && (
                                            <select
                                                className="border rounded px-3 py-1"
                                                value={booking.seekerStatus}
                                                onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                                                disabled={booking.status === 'payment_pending'}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        )}

                                        {user.id === booking.posterId && 
                                         booking.seekerStatus === 'completed' && 
                                         !booking.posterConfirmation && (
                                            <button
                                                onClick={() => handleConfirmCompletion(booking._id)}
                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                            >
                                                Confirm Completion
                                            </button>
                                        )}

                                        {booking.status === 'payment_pending' && (
                                            <button
                                                onClick={() => navigate(`/payment/${booking._id}`)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                            >
                                                Proceed to Payment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingList; 