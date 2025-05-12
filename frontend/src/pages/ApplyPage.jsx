import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { useUserStore } from '../stores/useUserStore';
import { MapPin, FileText, Calendar, DollarSign } from 'lucide-react';

// Import same categories as BookingsTab
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

const ApplyPage = () => {
    const { jobId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const { user } = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await axios.get(`/booking/${jobId}`);
                if (response.data.success) {
                    setBooking(response.data.booking);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching booking:', error);
                toast.error('Error loading job details');
                setLoading(false);
            }
        };

        fetchBooking();
    }, [jobId]);

    const handleApply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setApplying(true);
            const response = await axios.patch(`/booking/${jobId}/status`, {
                status: 'accepted',
                seekerId: user._id
            });

            if (response.data.success) {
                toast.success('Application submitted successfully!');
                navigate('/my-jobs'); // Redirect to MyJobs page
            }
        } catch (error) {
            console.error('Error applying for job:', error);
            toast.error(error.response?.data?.message || 'Error submitting application');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center bg-gray-800 rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-red-500">Job Not Found</h2>
                    <p className="text-gray-400 mt-2">This job listing may have been removed or is no longer available.</p>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Browse Other Jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{booking.title}</h1>
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <p className="text-gray-300 font-medium">
                                            Posted by: {booking.posterName || 'Anonymous'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">
                                Posted: {new Date(booking.dates.created).toLocaleDateString()}
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-emerald-500 mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Location</h3>
                                    <p className="text-gray-400">{booking.location.address}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-emerald-500 mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Category</h3>
                                    <p className="text-gray-400">{booking.category}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <DollarSign className="w-5 h-5 text-emerald-500 mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Payment</h3>
                                    <p className="text-emerald-400 font-semibold">
                                        Rs. {booking.payment.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-emerald-500 mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Created</h3>
                                    <p className="text-gray-400">
                                        {new Date(booking.dates.created).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-3">Description</h3>
                            <p className="text-gray-400 whitespace-pre-line leading-relaxed">
                                {booking.description}
                            </p>
                        </div>

                        <div className="border-t border-gray-700 pt-6">
                            <div className="flex flex-col items-center space-y-4">
                                <p className="text-gray-400 text-center max-w-md">
                                    By applying, you agree to complete the job according to the description 
                                    and requirements specified above.
                                </p>
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className={`w-full max-w-md bg-blue-500 text-white py-3 px-4 rounded-lg 
                                        hover:bg-blue-600 transition-colors ${
                                        applying ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {applying ? 'Submitting Application...' : 'Submit Application'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyPage;