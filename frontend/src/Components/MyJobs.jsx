import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyJobs = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get('/api/job/applications/me');
            setApplications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-green-100 text-green-800',
            declined: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">My Applications</h2>
            {applications.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
                    <Link 
                        to="/jobs" 
                        className="text-blue-500 hover:text-blue-600"
                    >
                        Browse Available Jobs
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {applications.map((app) => (
                        <div key={app.jobId} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Link 
                                        to={`/jobs/${app.jobId}`}
                                        className="text-xl font-semibold hover:text-blue-500"
                                    >
                                        {app.jobTitle}
                                    </Link>
                                    <p className="text-gray-600 mt-1">
                                        Applied: {new Date(app.application.appliedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(app.application.status)}`}>
                                    {app.application.status.toUpperCase()}
                                </div>
                            </div>

                            {app.application.status === 'accepted' && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-green-600 font-semibold mb-2">
                                        Your application has been accepted!
                                    </p>
                                    <Link
                                        to="/bookings"
                                        className="text-blue-500 hover:text-blue-600"
                                    >
                                        View Booking Details →
                                    </Link>
                                </div>
                            )}

                            {app.application.status === 'declined' && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-gray-600">
                                        Unfortunately, your application was not selected for this position.
                                        Keep trying - there are many other opportunities available!
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyJobs; 