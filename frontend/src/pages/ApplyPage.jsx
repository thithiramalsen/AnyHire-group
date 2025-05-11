import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
//import { useAuth } from '../stores/AuthContext';
import toast from 'react-hot-toast';
import { useUserStore } from '../stores/useUserStore';

const ApplyPage = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [categories, setCategories] = useState([]); // Add categories state
    const { user } = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both job and categories
                const [jobResponse, categoriesResponse] = await Promise.all([
                    axios.get(`/job/${jobId}`),
                    axios.get("/category")
                ]);
                
                setJob(jobResponse.data);
                setCategories(categoriesResponse.data.categories || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Error loading job details');
                setLoading(false);
            }
        };

        fetchData();
    }, [jobId]);

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => Number(cat._id) === Number(categoryId));
        return category ? category.name : "Unknown Category";
    };

    const handleApply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setApplying(true);
            // Apply for the job
            await axios.post(`/booking/apply/${jobId}`);
            
            toast.success('Application submitted successfully!');
            navigate('/my-jobs');
        } catch (error) {
            console.error('Error applying for job:', error);
            toast.error(error.response?.data?.message || 'Error submitting application');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>;
    }

    if (!job) {
        return <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-red-600">Job not found</h2>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    {job.images && (
                        <img
                            src={`http://localhost:5000${job.images}`}
                            alt={job.title}
                            className="w-full h-64 object-cover"
                        />
                    )}
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                                <div className="flex items-center space-x-4">
                                    {job.createdBy?.profileImage && (
                                        <img 
                                            src={`http://localhost:5000${job.createdBy.profileImage}`}
                                            alt={job.createdBy.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="text-gray-300 font-medium">
                                            Posted by: {job.createdBy?.name}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {job.createdBy?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">
                                Posted: {new Date(job.postedDate).toLocaleDateString()}
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Location</h3>
                                <p className="text-gray-400">{job.location}, {job.district}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Category</h3>
                                <p className="text-gray-400">{getCategoryName(job.category)}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Payment</h3>
                                <p className="text-green-400 font-semibold">Rs. {job.payment}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Deadline</h3>
                                <p className="text-gray-400">{new Date(job.deadline).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-400 whitespace-pre-line">{job.description}</p>
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
                                    className={`w-full max-w-md bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors ${
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