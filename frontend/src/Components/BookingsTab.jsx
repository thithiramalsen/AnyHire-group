import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useUserStore } from '../stores/useUserStore';
import { Plus, MapPin, FileText, Calendar } from 'lucide-react';

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

const BookingsTab = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { user } = useUserStore();
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        payment: {
            amount: ''
        },
        category: '',
        location: {
            address: '',
            coordinates: [0, 0] // Will be set by geocoding
        }
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get('/booking/user');
            if (response.data.success) {
                setBookings(response.data.bookings);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to fetch bookings');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            setFormData(prev => ({
                ...prev,
                payment: {
                    ...prev.payment,
                    amount: value
                }
            }));
        } else if (name === 'address') {
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    address: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const simpleAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                
                setFormData(prev => ({
                    ...prev,
                    location: {
                        address: simpleAddress,
                        coordinates: [longitude, latitude]
                    }
                }));
                toast.success('Location updated');
            },
            (error) => {
                console.error('Location error:', error);
                toast.error(
                    error.code === 1 ? 'Please allow location access' :
                    error.code === 2 ? 'Location unavailable' :
                    'Error getting location'
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/booking', formData);
            if (response.data.success) {
                toast.success('Booking created successfully');
                setShowCreateForm(false);
                setFormData({
                    title: '',
                    description: '',
                    payment: {
                        amount: ''
                    },
                    category: '',
                    location: {
                        address: '',
                        coordinates: [0, 0]
                    }
                });
                fetchBookings();
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            toast.error(error.response?.data?.message || 'Failed to create booking');
        }
    };

    const renderCreateForm = () => (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Create New Booking</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white h-32"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Payment Amount (Rs.)
                    </label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.payment.amount}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Category
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                        required
                    >
                        <option value="">Select a category</option>
                        {JOB_CATEGORIES.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Location Address
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="address"
                            value={formData.location.address}
                            onChange={handleInputChange}
                            className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white"
                            required
                        />
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 
                                transition-colors flex items-center gap-2"
                        >
                            <MapPin size={16} />
                            Current
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Create Booking
                    </button>
                </div>
            </form>
        </div>
    );

    const renderBookingsList = () => (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map(booking => (
                <div
                    key={booking._id}
                    className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => navigate(`/booking/${booking._id}`)}
                >
                    <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{booking.title}</h3>
                        <p className="text-gray-400 mb-4 line-clamp-2">{booking.description}</p>
                        
                        <div className="flex flex-col gap-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                <span>{booking.location.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText size={16} />
                                <span>{booking.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-emerald-500 font-semibold">
                                Rs. {booking.payment.amount}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                booking.status === 'paid' ? 'bg-emerald-500 text-white' :
                                booking.status === 'payment_pending' ? 'bg-yellow-500 text-white' :
                                booking.status === 'in_progress' ? 'bg-blue-500 text-white' :
                                booking.status === 'declined' ? 'bg-red-500 text-white' :
                                'bg-gray-500 text-white'
                            }`}>
                                {booking.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {!showCreateForm && (
                <div className="flex justify-end mb-8">
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Create Booking
                    </button>
                </div>
            )}

            {showCreateForm ? renderCreateForm() : renderBookingsList()}
        </div>
    );
};

export default BookingsTab;