import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const navigate = useNavigate();
    const { user } = useUserStore();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get("/job/public/approved");
                setJobs(response.data);
                setFilteredJobs(response.data);
            } catch (error) {
                console.error("Error fetching jobs:", error);
                toast.error("Failed to load jobs. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    useEffect(() => {
        const filtered = jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                job.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "" || job.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
        setFilteredJobs(filtered);
    }, [searchTerm, selectedCategory, jobs]);

    const handleApply = (jobId) => {
        if (!user) {
            toast.error("Please login to apply for jobs");
            navigate("/login");
            return;
        }

        if (user.role === "jobposter") {
            toast.error("Job posters cannot apply for jobs. Please upgrade your account.");
            navigate("/upgrade-account");
            return;
        }

        navigate(`/apply/${jobId}`);
    };

    const categories = [...new Set(jobs.map(job => job.category))];

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">Find Your Next Opportunity</h1>
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredJobs.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">No jobs found matching your criteria.</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredJobs.map((job) => (
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
                                        {user ? "Apply Now" : "Login to Apply"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobsPage; 