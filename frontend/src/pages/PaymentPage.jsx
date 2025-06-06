import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useUserStore } from '../stores/useUserStore';
import { Trash2, PenSquare, Upload, FileText, CheckCircle, Star, RefreshCw } from 'lucide-react';

const PaymentPage = () => {
    const { bookingId } = useParams();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        paymentType: '',
        paymentMethod: '',
        discountCode: '' // Add this
    });

    const [discountInfo, setDiscountInfo] = useState(null);
    const [originalAmount, setOriginalAmount] = useState(null);

    const [paymentDetails, setPaymentDetails] = useState({
        originalAmount: null,
        currentAmount: null,
        discountApplied: null
    });

    const validateDiscountCode = async () => {
        try {
            const discountRes = await axios.post('/payment/calculate-discount', {
                bookingId,
                discountCode: form.discountCode
            });
            
            if (discountRes.data.success) {
                const { originalAmount, discountedAmount, discountValue } = discountRes.data.data;
                
                setPaymentDetails({
                    originalAmount,
                    currentAmount: discountedAmount,
                    discountApplied: discountValue
                });

                setDiscountInfo({
                    ...discountRes.data.data,
                    isApplied: true
                });
                
                toast.success('Discount code applied successfully!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid discount code');
            setDiscountInfo(null);
            setPaymentDetails({
                originalAmount: null,
                currentAmount: null,
                discountApplied: null
            });
        }
    };

    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const { user } = useUserStore();
    

    useEffect(() => {
        const fetchPayment = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/payment/booking/${bookingId}`);
                setPayment(res.data.payment);
            } catch (err) {
                if (err.response?.status === 404) {
                    setPayment(null);
                } else {
                    toast.error(err.response?.data?.message || 'Error loading payment');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchPayment();
    }, [bookingId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('File size should be less than 5MB');
                return;
            }
            if (!['application/pdf'].includes(file.type)) {
                toast.error('Only PDF files are allowed');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (!form.paymentType) {
                toast.error('Please select a payment type');
                setSubmitting(false);
                return;
            }

            // First create the payment with discount info
            const paymentRes = await axios.post('/payment/initialize', {
                ...form,
                bookingId,
                amount: discountInfo?.discountedAmount || payment?.amount,
                discountInfo: discountInfo ? {
                    originalAmount,
                    discountValue: discountInfo.value,
                    discountCode: discountInfo.code,
                    awardId: discountInfo.awardId
                } : null
            });

            if (!paymentRes.data.success || !paymentRes.data.payment?._id) {
                throw new Error('Failed to create payment');
            }

            const paymentId = paymentRes.data.payment._id;

            // Handle file upload if payment type is payment_proof
            if (form.paymentType === 'payment_proof') {
                if (!selectedFile) {
                    toast.error('Please select a proof file');
                    setSubmitting(false);
                    return;
                }

                const formData = new FormData();
                formData.append('paymentProof', selectedFile);

                await axios.post(`/payment/${paymentId}/proof`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            toast.success('Payment initiated successfully!');
            // Refetch payment info to update the UI
            const res = await axios.get(`/payment/booking/${bookingId}`);
            setPayment(res.data.payment);
        } catch (err) {
            console.error('Payment error:', err);
            toast.error(err.response?.data?.message || 'Error creating payment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setSelectedFile(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setSelectedFile(null);
    };

    const handleUpdateProof = async () => {
        if (!selectedFile) {
            toast.error('Please select a new proof file');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('paymentProof', selectedFile);

            await axios.post(`/payment/${payment._id}/proof`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Payment proof updated successfully!');
            const res = await axios.get(`/payment/booking/${bookingId}`);
            setPayment(res.data.payment);
            setIsEditing(false);
            setSelectedFile(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating payment proof');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this payment? This will reset the booking status to payment pending.')) {
            return;
        }

        try {
            await axios.delete(`/payment/${payment._id}/customer`);
            toast.success('Payment deleted successfully');
            navigate(`/booking/${bookingId}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error deleting payment');
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
            await axios.patch(`/payment/${payment._id}/complete`);
            await axios.patch(`/booking/${payment.bookingId}/status`, {
                status: 'completed'
            });
            toast.success('Booking completed successfully!');
            navigate(`/booking/${payment.bookingId}`);
        } catch (error) {
            console.error('Error completing booking:', error);
            toast.error(error.response?.data?.message || 'Failed to complete booking');
        }
    };

    const handleRetryPayment = async () => {
        try {
            await axios.post(`/payment/${payment._id}/retry`);
            toast.success('Payment reset successfully');
            // Refetch payment to update the UI
            const res = await axios.get(`/payment/booking/${bookingId}`);
            setPayment(res.data.payment);
        } catch (error) {
            console.error('Error retrying payment:', error);
            toast.error(error.response?.data?.message || 'Failed to retry payment');
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    if (!payment) {
        // Show payment form
        return (
            <div className="max-w-lg mx-auto bg-gray-800 rounded-lg p-8 mt-10">
                <button onClick={() => navigate(-1)} className="mb-4 text-emerald-400">&larr; Back to Booking</button>
                <h2 className="text-2xl font-bold mb-6">Make a Payment</h2>

                {paymentDetails.currentAmount && (
                    <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Amount:</span>
                            <div className="text-right">
                                <span className="text-gray-400 line-through mr-2">
                                    Rs. {paymentDetails.originalAmount}
                                </span>
                                <span className="text-emerald-400 font-medium">
                                    Rs. {paymentDetails.currentAmount}
                                </span>
                            </div>
                        </div>
                        {paymentDetails.discountApplied && (
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-gray-400">Discount Applied:</span>
                                <span className="text-emerald-400">
                                    -{paymentDetails.discountApplied}%
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2">Payment Type</label>
                        <select
                            name="paymentType"
                            value={form.paymentType}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-white"
                            required
                        >
                            <option value="">Select type</option>
                            <option value="manual">Manual</option>
                            <option value="payment_proof">Payment Proof</option>
                            <option value="card">Card</option>
                        </select>
                    </div>

                    {form.paymentType === 'payment_proof' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="proof-upload"
                                />
                                <label
                                    htmlFor="proof-upload"
                                    className="flex flex-col items-center justify-center cursor-pointer"
                                >
                                    <Upload className="w-8 h-8 text-emerald-500 mb-2" />
                                    <span className="text-sm text-gray-400">
                                        {selectedFile ? selectedFile.name : 'Upload payment proof (PDF only, max 5MB)'}
                                    </span>
                                </label>
                            </div>
                            {selectedFile && (
                                <p className="text-sm text-emerald-500">
                                    ✓ File selected: {selectedFile.name}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block mb-2">Discount Code (Optional)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="discountCode"
                                value={form.discountCode}
                                onChange={handleChange}
                                placeholder="Enter discount code"
                                className="flex-1 p-2 rounded bg-gray-700 text-white"
                            />
                            <button
                                type="button"
                                onClick={validateDiscountCode}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                        {discountInfo && (
                            <div className="text-sm text-emerald-400">
                                Discount applied: {discountInfo.value}% off
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-500 text-white py-2 px-6 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={submitting || (form.paymentType === 'payment_proof' && !selectedFile)}
                    >
                        {submitting ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                </form>
            </div>
        );
    }

    // Show payment details if payment exists
    return (
        <div className="max-w-lg mx-auto bg-gray-800 rounded-lg p-8 mt-10">
            <button onClick={() => navigate(-1)} className="mb-4 text-emerald-400">&larr; Back to Booking</button>
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
            <div className="space-y-6">
                <div className="grid gap-4">
                    <div className="flex justify-between mb-2">
                        <span className="font-semibold">Booking ID:</span>
                        <span>{payment.bookingId}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="font-semibold">Amount:</span>
                        <div className="text-right">
                            {payment.discountApplied && (
                                <span className="text-sm text-gray-400 line-through mr-2">
                                    Rs. {payment.originalAmount}
                                </span>
                            )}
                            <span className="text-emerald-400 font-medium">
                                Rs. {payment.amount}
                            </span>
                        </div>
                    </div>
                    {payment.discountApplied && (
                        <div className="flex justify-between mb-2 text-sm">
                            <span className="text-gray-400">Discount Applied:</span>
                            <span className="text-emerald-400">
                                -{payment.discountValue}%
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between mb-2">
                        <span className="font-semibold">Type:</span>
                        <span>{payment.paymentType}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="font-semibold">Status:</span>
                        <span>{payment.status}</span>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                    <div className="flex gap-4">
                        {payment.status === 'confirmed' && (
                            <button
                                onClick={handleCompleteBooking}
                                className="flex-1 bg-emerald-500 text-white py-3 px-6 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={20} />
                                Complete Booking
                            </button>
                        )}
                        {payment.status === 'reported' && (
                            <button
                                onClick={handleRetryPayment}
                                className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={20} />
                                Try Payment Again
                            </button>
                        )}
                        {payment.paymentType === 'manual' && payment.status !== 'confirmed' && (
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={20} />
                                Cancel Payment
                            </button>
                        )}
                        <button
                            onClick={() => navigate(`/review/${payment.bookingId}`)}
                            className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Star size={20} />
                            Leave Review
                        </button>
                    </div>
                </div>

                {payment.paymentType === 'payment_proof' && (
                    <div className="border-t border-gray-700 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Payment Proof</h3>
                            <div className="space-x-2">
                                {!isEditing && (
                                    <>
                                        <button
                                            onClick={handleEdit}
                                            className="text-blue-400 hover:text-blue-500"
                                        >
                                            <PenSquare size={20} />
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="text-red-400 hover:text-red-500"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="proof-upload"
                                    />
                                    <label
                                        htmlFor="proof-upload"
                                        className="flex flex-col items-center justify-center cursor-pointer"
                                    >
                                        <Upload className="w-8 h-8 text-emerald-500 mb-2" />
                                        <span className="text-sm text-gray-400">
                                            {selectedFile ? selectedFile.name : 'Upload new payment proof (PDF only, max 5MB)'}
                                        </span>
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateProof}
                                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                        disabled={!selectedFile}
                                    >
                                        Update Proof
                                    </button>
                                </div>
                            </div>
                        ) : (
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
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;