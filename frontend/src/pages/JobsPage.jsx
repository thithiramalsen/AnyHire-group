import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import Footer from '../Components/Footer';
import { motion } from 'framer-motion';
import { Search, Briefcase, MapPin, Calendar, DollarSign } from 'lucide-react';

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const navigate = useNavigate();
    const { user } = useUserStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsResponse, categoriesResponse] = await Promise.all([
                    axios.get("/job/public/approved"),
                    axios.get("/category/public")
                ]);
                
                setJobs(jobsResponse.data);
                setCategories(categoriesResponse.data.categories);
                setFilteredJobs(jobsResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load jobs. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
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

    const handleAddToCart = async (jobId) => {
        if (!user) {
            toast.error("Please login to add jobs to cart");
            navigate("/login");
            return;
        }

        if (user.role !== "jobSeeker") {
            toast.error("Only job seekers can add jobs to cart");
            return;
        }

        try {
            await axios.post(`/cart/add/${jobId}`);
            toast.success("Job added to cart successfully");
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to add job to cart");
            }
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => Number(cat._id) === Number(categoryId));
        return category ? category.name : "Unknown Category";
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <div className="flex-grow">
                {/* Hero Section */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                                Find Your Perfect Job Match
                            </h1>
                            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                                Discover thousands of job opportunities from top employers. Whether you're looking for your next career move 
                                or a freelance project, AnyHire connects you with the right opportunities.
                            </p>
                            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search jobs..."
                                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Jobs Grid */}
                <div className="container mx-auto px-4 py-12">
                    {filteredJobs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-gray-400 py-12"
                        >
                            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
                            <p>Try adjusting your search criteria or check back later for new opportunities.</p>
                        </motion.div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredJobs.map((job, index) => (
                                <motion.div
                                    key={job._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
                                >
                                    {job.images && (
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={`http://localhost:5000${job.images}`}
                                                alt={job.title}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-emerald-400 transition-colors">
                                            {job.title}
                                        </h3>
                                        <div className="space-y-3 mb-4">
                                            <p className="text-gray-400 line-clamp-2">{job.description}</p>
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.district}
                                                </span>
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <Briefcase className="w-4 h-4" />
                                                    {getCategoryName(job.category)}
                                                </span>
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(job.deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-5 h-5 text-emerald-400" />
                                                <span className="text-emerald-400 font-semibold">Rs. {job.payment}</span>
                                            </div>
                                            <div className="space-x-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleAddToCart(job._id)}
                                                    className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                                                >
                                                    Add to Cart
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleApply(job._id)}
                                                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                                >
                                                    {user ? "Apply Now" : "Login to Apply"}
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default JobsPage;