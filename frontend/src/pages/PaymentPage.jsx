import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await axios.get(`/api/bookings/${bookingId}`);
                setBooking(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching booking:', error);
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

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
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                <h2 className="text-3xl font-bold mb-6">Payment Details</h2>
                
                <div className="space-y-6">
                    <div className="border-b pb-4">
                        <h3 className="text-xl font-semibold mb-2">{booking.jobTitle}</h3>
                        <p className="text-gray-600">Booking ID: {booking._id}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Service Amount</span>
                            <span className="font-semibold">${booking.payment.amount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Platform Fee (5%)</span>
                            <span className="font-semibold">${(booking.payment.amount * 0.05).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
                            <span>Total Amount</span>
                            <span>${(booking.payment.amount * 1.05).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <p className="text-center text-gray-600 mb-4">
                            This is a demo payment page. In a real application, this would integrate with a payment gateway.
                        </p>
                        <button 
                            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={() => alert('Payment gateway integration would go here!')}
                        >
                            Proceed to Payment Gateway
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage; 