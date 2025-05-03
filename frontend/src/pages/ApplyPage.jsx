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
    const { user } = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchJob();
    }, [jobId]);

    const fetchJob = async () => {
        try {
            const response = await axios.get(`/job/${jobId}`);
            setJob(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching job:', error);
            setLoading(false);
            toast.error('Error loading job details');
        }
    };

    const handleApply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setApplying(true);
            await axios.post(`/booking/apply/${jobId}`);
            toast.success('Application submitted successfully!');
            navigate('/my-jobs');
        } catch (error) {
            console.error('Error applying for job:', error);
            toast.error(error.response?.data?.message || 'Error submitting application');
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
                                <p className="text-gray-400">
                                    Posted by: {job.posterDetails?.name}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Location</h3>
                                <p className="text-gray-400">{job.location}, {job.district}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Category</h3>
                                <p className="text-gray-400">{job.category}</p>
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