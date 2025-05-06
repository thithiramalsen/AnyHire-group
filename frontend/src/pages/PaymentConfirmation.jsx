import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, FileText, Star, Home, Search } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';

const PaymentConfirmation = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [loading, setLoading] = useState(true);
    const [payment, setPayment] = useState(null);
    const [notes, setNotes] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        console.log('PaymentConfirmation mounted with bookingId:', bookingId);
        console.log('Current user:', user);

        // Redirect if not a job seeker
        if (user && user.role !== 'jobSeeker') {
            console.log('User is not a job seeker, redirecting to /bookings');
            navigate('/bookings');
            return;
        }

        if (!bookingId) {
            console.log('No bookingId provided');
            toast.error('Invalid booking ID');
            navigate('/bookings');
            return;
        }

        const fetchPayment = async () => {
            console.log('Fetching payment for booking:', bookingId);
            try {
                const response = await axios.get(`/payment/booking/${bookingId}`);
                console.log('Payment response:', response.data);
                
                if (!response.data || !response.data.payment) {
                    console.log('No payment data received');
                    toast.error('No payment has been made for this booking yet.');
                    navigate('/bookings');
                    return;
                }
                setPayment(response.data.payment);
            } catch (error) {
                console.error('Error fetching payment:', error);
                console.error('Error details:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                toast.error(error.response?.data?.message || 'Failed to load payment details');
                navigate('/bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [bookingId, navigate, user]);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await axios.post(`/payment/${payment._id}/confirm`, {
                confirmed: true,
                notes
            });
            toast.success('Payment confirmed successfully');
            navigate('/bookings');
        } catch (error) {
            console.error('Confirmation error:', error);
            toast.error(error.response?.data?.message || 'Failed to confirm payment');
        } finally {
            setLoading(false);
        }
    };

    const handleReport = async () => {
        setLoading(true);
        try {
            await axios.post(`/payment/${payment._id}/confirm`, {
                confirmed: false,
                notes
            });
            toast.success('Payment reported successfully');
            navigate('/bookings');
        } catch (error) {
            console.error('Report error:', error);
            toast.error(error.response?.data?.message || 'Failed to report payment');
        } finally {
            setLoading(false);
            setShowReportModal(false);
        }
    };

    const handleDownloadProof = async () => {
        try {
            const response = await axios.get(`/payment/${payment._id}/proof`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', payment.proofFilename || 'payment-proof.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Error downloading proof file');
        }
    };

    const handleCompleteBooking = async () => {
        try {
            await axios.post(`/payment/${payment._id}/complete`);
            await axios.patch(`/booking/${payment.bookingId}/status`, {
                status: 'completed'
            });
            toast.success('Booking completed successfully!');
            navigate('/bookings');
        } catch (error) {
            console.error('Error completing booking:', error);
            toast.error(error.response?.data?.message || 'Failed to complete booking');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
                    >
                        <ArrowLeft size={20} />
                        Back to Booking
                    </button>
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-red-500">Payment not found</h2>
                        <p className="text-gray-400 mt-2">The payment details could not be loaded.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
                >
                    <ArrowLeft size={20} />
                    Back to Booking
                </button>

                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Payment Confirmation</h2>
                        <div className="grid grid-cols-2 gap-4 text-gray-400">
                            <div>
                                <p className="text-sm">Amount</p>
                                <p className="font-medium text-white">Rs. {payment.amount}</p>
                            </div>
                            <div>
                                <p className="text-sm">Payment Type</p>
                                <p className="font-medium text-white capitalize">
                                    {(payment.paymentType || '').replace('_', ' ')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm">Status</p>
                                <p className={`font-medium ${
                                    payment.status === 'confirmed' ? 'text-emerald-500' :
                                    payment.status === 'pending' ? 'text-yellow-500' :
                                    payment.status === 'awaiting_confirmation' ? 'text-blue-500' :
                                    payment.status === 'reported' ? 'text-red-500' :
                                    'text-white'
                                }`}>
                                    {payment.status.toUpperCase().replace('_', ' ')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm">Date</p>
                                <p className="font-medium text-white">
                                    {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {payment.paymentType === 'payment_proof' && (
                        <div className="border-t border-gray-700 pt-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4">Payment Proof</h3>
                            <div className="bg-gray-900 rounded-lg p-4">
                                <button 
                                    onClick={handleDownloadProof}
                                    className="w-full flex items-center gap-3 text-gray-400 hover:text-emerald-500 transition-colors"
                                >
                                    <FileText size={20} />
                                    <span className="flex-1 text-left truncate">
                                        {payment.proofFilename || 'Payment proof document'}
                                    </span>
                                </button>
                                <p className="text-xs text-gray-500 mt-2">
                                    Click to download
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Only show confirm/report UI if payment exists and is awaiting confirmation */}
                    {payment.status === 'awaiting_confirmation' && (
                        <div className="space-y-4 border-t border-gray-700 pt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any notes about the payment..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    rows="3"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="flex-1 bg-emerald-500 text-white py-3 px-6 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 size={20} /> Confirm Payment
                                </button>
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    disabled={loading}
                                    className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle size={20} /> Report Fake Payment
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Show status if already confirmed or reported */}
                    {payment.status === 'confirmed' && (
                        <div className="border-t border-gray-700 pt-6 mt-6">
                            <div className="flex items-center gap-2 text-emerald-500 mb-4">
                                <CheckCircle2 size={24} /> Payment has been confirmed
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate(`/review/${payment.bookingId}`)}
                                    className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Star size={20} />
                                    Leave Review
                                </button>
                                <button
                                    onClick={() => navigate('/jobs')}
                                    className="flex-1 bg-emerald-500 text-white py-3 px-6 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Search size={20} />
                                    Find More Jobs
                                </button>
                            </div>
                        </div>
                    )}
                    {payment.status === 'reported' && (
                        <div className="flex items-center gap-2 text-red-500 mt-6">
                            <AlertCircle size={24} /> Payment has been reported as fake
                        </div>
                    )}
                </div>

                {/* Report Modal */}
                {showReportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                            <div className="flex items-center gap-2 text-red-500 mb-4">
                                <AlertCircle size={24} />
                                <h3 className="text-lg font-semibold">Report Payment Issue</h3>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Are you sure you want to report this payment? This will mark the payment as invalid and notify the customer.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReport}
                                    disabled={loading}
                                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        'Report Payment'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentConfirmation;