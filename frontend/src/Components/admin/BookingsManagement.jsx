import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { Search, Filter, Eye, Trash2 } from 'lucide-react'; // Updated import

const BookingsManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get('/booking');
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBooking = (bookingId) => {
        toast((t) => (
            <div className="flex items-center gap-4">
                <p className="text-white">Are you sure you want to delete this booking?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            deleteBooking(bookingId);
                            toast.dismiss(t.id);
                        }}
                        className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
        });
    };

    const deleteBooking = async (bookingId) => {
        try {
            await axios.delete(`/api/booking/${bookingId}`);
            toast.success('Booking deleted successfully');
            fetchBookings(); // Refresh the list
        } catch (error) {
            console.error('Error deleting booking:', error);
            toast.error('Failed to delete booking');
        }
    };

    const handleUpdateBookingStatus = async (bookingId, newStatus) => {
        try {
            await axios.patch(`/booking/admin/${bookingId}/status`, { status: newStatus });
            toast.success('Booking status updated successfully');
            fetchBookings(); // Refresh the list
        } catch (error) {
            console.error('Error updating booking status:', error);
            toast.error(error.response?.data?.message || 'Failed to update booking status');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = 
            booking.jobId?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.posterId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.seekerId?.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'applied': return 'bg-yellow-500';
            case 'accepted': return 'bg-green-500';
            case 'in_progress': return 'bg-blue-500';
            case 'completed_by_seeker': return 'bg-purple-500';
            case 'payment_pending': return 'bg-orange-500';
            case 'completed': return 'bg-emerald-500';
            case 'declined': return 'bg-red-500';
            case 'cancelled': return 'bg-gray-500';
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                    >
                        <option value="all">All Status</option>
                        <option value="applied">Applied</option>
                        <option value="accepted">Accepted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed_by_seeker">Completed by Seeker</option>
                        <option value="payment_pending">Payment Pending</option>
                        <option value="completed">Completed</option>
                        <option value="declined">Declined</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Job Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Job Seeker</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">{booking.jobId?.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-400">{booking.posterId?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-400">{booking.seekerId?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-emerald-500">Rs. {booking.payment?.amount}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                            {booking.status.split('_').map(word => 
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-400">
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => window.location.href = `/booking/${booking._id}`}
                                                className="text-emerald-500 hover:text-emerald-400"
                                                title="View Details"
                                            >
                                                <Eye size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBooking(booking._id)}
                                                className="text-red-500 hover:text-red-400"
                                                title="Delete Booking"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                                                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                                            >
                                                <option value="applied">Applied</option>
                                                <option value="accepted">Accepted</option>
                                                <option value="declined">Declined</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed_by_seeker">Completed by Seeker</option>
                                                <option value="completed">Completed</option>
                                                <option value="payment_pending">Payment Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BookingsManagement;