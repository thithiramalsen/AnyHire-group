import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { useUserStore } from '../stores/useUserStore';

const BookingDetailsPage = () => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const { user } = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await axios.get(`/booking/${bookingId}`);
                setBooking(response.data.booking);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching booking:', error);
                toast.error('Error loading booking details');
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    const handleAcceptBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setProcessing(true);
            // Update booking status to accepted and set the seekerId
            await axios.patch(`/booking/${bookingId}/status`, {
                status: 'accepted'
            });
            
            toast.success('Booking accepted successfully!');
            navigate('/my-bookings');
        } catch (error) {
            console.error('Error accepting booking:', error);
            toast.error(error.response?.data?.message || 'Error accepting booking');
        } finally {
            setProcessing(false);
        }
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
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{booking.title}</h1>
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <p className="text-gray-300 font-medium">
                                            Posted by: {booking.posterName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">
                                Posted: {new Date(booking.dates.created).toLocaleDateString()}
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Location</h3>
                                <p className="text-gray-400">{booking.location.address}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Category</h3>
                                <p className="text-gray-400">{booking.category}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Payment</h3>
                                <p className="text-green-400 font-semibold">Rs. {booking.payment.amount}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-400 whitespace-pre-line">{booking.description}</p>
                        </div>

                        <div className="border-t border-gray-700 pt-6">
                            <div className="flex flex-col items-center space-y-4">
                                <p className="text-gray-400 text-center max-w-md">
                                    By accepting this booking, you agree to complete the work according to the description 
                                    and requirements specified above.
                                </p>
                                <button
                                    onClick={handleAcceptBooking}
                                    disabled={processing || booking.status !== 'pending'}
                                    className={`w-full max-w-md bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors ${
                                        (processing || booking.status !== 'pending') ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {processing ? 'Processing...' : 
                                     booking.status !== 'pending' ? 'Booking Not Available' : 
                                     'Accept Booking'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsPage; 