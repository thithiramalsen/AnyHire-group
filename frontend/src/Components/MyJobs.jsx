import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import { MessageCircle } from 'lucide-react';
import Chat from './Chat';

const MyJobs = () => {
    const [activeApplications, setActiveApplications] = useState([]);
    const [pendingApplications, setPendingApplications] = useState([]);
    const [categories, setCategories] = useState([]); // Add categories state
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useUserStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both applications and categories
                const [applicationsResponse, categoriesResponse] = await Promise.all([
                    axios.get("/booking/my-applications"),
                    axios.get("/category")
                ]);
                
                // Set categories
                setCategories(categoriesResponse.data.categories || []);

                // Separate active and pending applications
                const active = applicationsResponse.data.filter(job => job.isActiveApplication);
                const pending = applicationsResponse.data.filter(job => 
                    !job.isActiveApplication && 
                    !job.isJobTaken && 
                    job.status === 'applied'
                );
                
                setActiveApplications(active);
                setPendingApplications(pending);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load your applications");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCancelApplication = async (bookingId) => {
        try {
            // Show confirmation toast
            const confirmed = await new Promise((resolve) => {
                toast.custom((t) => (
                    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                        <p className="text-white mb-4">Are you sure you want to cancel this application?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    resolve(false);
                                }}
                                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                No
                            </button>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    resolve(true);
                                }}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                ), { duration: 5000 });
            });

            if (!confirmed) return;

            await axios.patch(`/booking/${bookingId}/status`, { status: 'cancelled' });
            setPendingApplications(prev => prev.filter(job => job._id !== bookingId));
            toast.success("Application cancelled successfully");
        } catch (error) {
            console.error("Error cancelling application:", error);
            toast.error("Failed to cancel application");
        }
    };

    // Add getCategoryName helper function
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => Number(cat._id) === Number(categoryId));
        return category ? category.name : "Unknown Category";
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>;
    }

    const renderJobCard = (job) => (
        <div key={job._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {job.images && (
                <img
                    src={`http://localhost:5000${job.images}`}
                    alt={job.title}
                    className="w-full h-48 object-cover"
                />
            )}
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                <div className="space-y-2 mb-4">
                    <p className="text-gray-400 line-clamp-2">{job.description}</p>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">📍 {job.district}</span>
                        <span className="text-gray-400">📁 {getCategoryName(job.category)}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <div>
                        <p className="text-green-400 font-semibold">Rs. {job.payment}</p>
                        <p className="text-sm text-gray-400">
                            Status: <span className={`${
                                job.status === 'applied' ? 'text-yellow-400' : 
                                job.status === 'accepted' ? 'text-green-400' : 
                                job.status === 'declined' ? 'text-red-400' :
                                job.status === 'in_progress' ? 'text-blue-400' :
                                job.status === 'completed_by_seeker' ? 'text-purple-400' :
                                job.status === 'completed' ? 'text-emerald-400' :
                                'text-gray-400'
                            }`}>
                                {job.status.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                            </span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {job.status === 'applied' && (
                            <button
                                onClick={() => handleCancelApplication(job._id)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        {job.isActiveApplication && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/booking/${job._id}`)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    View Job
                                </button>
                                <button
                                    onClick={() => navigate(`/chat/${job._id}`)}
                                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                >
                                    <MessageCircle size={20} />
                                    Chat
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            {activeApplications.length > 0 && (
                <>
                    <h2 className="text-2xl font-bold mb-6">Active Applications</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                        {activeApplications.map(renderJobCard)}
                    </div>
                </>
            )}

            {pendingApplications.length > 0 && (
                <>
                    <h2 className="text-2xl font-bold mb-6">Pending Applications</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pendingApplications.map(renderJobCard)}
                    </div>
                </>
            )}

            {activeApplications.length === 0 && pendingApplications.length === 0 && (
                <div className="text-center text-gray-500 mt-8">You haven't applied for any jobs yet.</div>
            )}
        </div>
    );
};

export default MyJobs;