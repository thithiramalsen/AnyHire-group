import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ApplicationList = ({ jobId }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useEffect;

    useEffect(() => {
        fetchApplications();
    }, [jobId]);

    const fetchApplications = async () => {
        try {
            const response = await axios.get(`/api/job/${jobId}/applications`);
            setApplications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, status) => {
        try {
            await axios.patch(`/api/job/${jobId}/applications/${applicationId}`, {
                status
            });
            fetchApplications(); // Refresh the list
        } catch (error) {
            console.error('Error updating application status:', error);
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
        <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Applications</h3>
            {applications.length === 0 ? (
                <p className="text-gray-500">No applications yet.</p>
            ) : (
                applications.map((application) => (
                    <div key={application._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-lg font-semibold">
                                    {application.seekerId.name}
                                </h4>
                                <p className="text-gray-600">
                                    {application.seekerId.email}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Applied: {new Date(application.appliedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(application.status)}`}>
                                {application.status.toUpperCase()}
                            </div>
                        </div>

                        {application.status === 'pending' && (
                            <div className="flex space-x-3 mt-4">
                                <button
                                    onClick={() => handleStatusUpdate(application._id, 'accepted')}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(application._id, 'declined')}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Decline
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default ApplicationList; 