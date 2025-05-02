import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";

const JobsTab = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get("/job/getApproved");
                setJobs(response.data);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleApply = (jobId) => {
        navigate(`/apply/${jobId}`);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>;
    }

    if (jobs.length === 0) {
        return <div className="text-center text-gray-500 mt-8">No jobs found.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Available Jobs</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
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
                                    <span className="text-gray-400">📁 {job.category}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                                <div>
                                    <p className="text-green-400 font-semibold">Rs. {job.payment}</p>
                                    <p className="text-sm text-gray-400">
                                        Due: {new Date(job.deadline).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleApply(job._id)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobsTab;