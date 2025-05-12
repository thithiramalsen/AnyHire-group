import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { Search, Filter, Eye, Download, User, Calendar, Trash2 } from 'lucide-react';

const PaymentsManagement = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            console.debug('[PaymentsManagement] Fetching payments...');
            const response = await axios.get('/payment');
            console.debug('[PaymentsManagement] Payments response:', response.data);
            setPayments(response.data.payments || []);
        } catch (error) {
            console.error('[PaymentsManagement] Error fetching payments:', error);
            toast.error('Failed to load payments');
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (paymentId) => {
        if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingId(paymentId);
            await axios.delete(`/payment/admin/${paymentId}`);
            toast.success('Payment deleted successfully');
            setPayments(payments.filter(p => p._id !== paymentId));
        } catch (error) {
            console.error('Error deleting payment:', error);
            toast.error(error.response?.data?.message || 'Failed to delete payment');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDownloadProof = async (payment) => {
        try {
            if (!payment.proofPath) {
                toast.error('No proof file available');
                return;
            }

            const response = await axios.get(`/payment/${payment._id}/proof`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', payment.proofFilename || 'payment-proof');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading proof:', error);
            toast.error('Failed to download proof');
        }
    };

    const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
        try {
            await axios.patch(`/payment/admin/${paymentId}/status`, { status: newStatus });
            toast.success('Payment status updated successfully');
            fetchPayments(); // Refresh the list
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast.error(error.response?.data?.message || 'Failed to update payment status');
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = 
            String(payment._id).includes(searchTerm) ||
            String(payment.bookingId).includes(searchTerm) ||
            payment.booking?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.booking?.posterDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.booking?.seekerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        const matchesType = typeFilter === 'all' || payment.paymentType === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500';
            case 'pending': return 'bg-yellow-500';
            case 'awaiting_confirmation': return 'bg-blue-500';
            case 'reported': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-full overflow-hidden">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Payments Management</h2>
                <div className="text-sm text-gray-400">
                    Total Payments: {filteredPayments.length}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by ID, job title, or user name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="awaiting_confirmation">Awaiting Confirmation</option>
                        <option value="completed">Completed</option>
                        <option value="reported">Reported</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                    >
                        <option value="all">All Types</option>
                        <option value="manual">Manual</option>
                        <option value="payment_proof">Payment Proof</option>
                        <option value="card">Card</option>
                    </select>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <table className="min-w-[1200px] w-full">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-24">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-64">Booking</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-28">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-28">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-28">Method</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-32">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-32">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-64">Users</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredPayments.map((payment) => (
                                <tr key={payment._id} className="hover:bg-gray-700/50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-white">#{payment._id}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-sm text-white">
                                            {payment.booking?.jobTitle || payment.bookingId?.title || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            ID: #{payment.bookingId?._id || payment.bookingId || 'N/A'}
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-400">
                                            <User className="h-4 w-4 mr-1" />
                                            {payment.booking?.posterDetails?.name || payment.bookingId?.posterId?.name || 'Unknown'} → 
                                            {payment.booking?.seekerDetails?.name || payment.bookingId?.seekerId?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-sm text-emerald-500">Rs. {payment.amount}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-400 capitalize">
                                            {payment.paymentType?.replace('_', ' ') || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-400 capitalize">
                                            {payment.paymentMethod?.replace('-', ' ') || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <select
                                            value={payment.status}
                                            onChange={(e) => handleUpdatePaymentStatus(payment._id, e.target.value)}
                                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="awaiting_confirmation">Awaiting Confirmation</option>
                                            <option value="completed">Completed</option>
                                            <option value="reported">Reported</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-400">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm">
                                                <span className="text-emerald-500 font-medium mr-2">Job Seeker:</span>
                                                <span className="text-gray-300">
                                                    {payment.booking?.seekerDetails?.name || payment.bookingId?.seekerId?.name || 'Unknown'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <span className="text-blue-500 font-medium mr-2">Customer:</span>
                                                <span className="text-gray-300">
                                                    {payment.booking?.posterDetails?.name || payment.bookingId?.posterId?.name || 'Unknown'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-400">
                                                <User className="h-4 w-4 mr-1" />
                                                <span className="text-xs">
                                                    {payment.booking?.seekerDetails?.email || payment.bookingId?.seekerId?.email || 'No email'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => window.location.href = `/booking/${payment.bookingId}`}
                                                className="text-emerald-500 hover:text-emerald-400"
                                                title="View Booking Details"
                                            >
                                                <Eye size={20} />
                                            </button>
                                            {payment.proofPath && (
                                                <button
                                                    onClick={() => handleDownloadProof(payment)}
                                                    className="text-blue-500 hover:text-blue-400"
                                                    title="Download Payment Proof"
                                                >
                                                    <Download size={20} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(payment._id)}
                                                className="text-red-500 hover:text-red-400"
                                                title="Delete Payment"
                                                disabled={deletingId === payment._id}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="md:hidden text-sm text-gray-400 text-center mt-2">
                Scroll horizontally to view all data
            </div>
        </div>
    );
};

export default PaymentsManagement;