import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import axios from "../lib/axios";

const PortfolioModalForm = ({ isOpen, onClose, onSave, item = null }) => {
    const { user } = useUserStore();
    const [formData, setFormData] = useState({
        title: "",
        phoneNumber: "",
        email: user?.email || "",
        experience: "",
        qualifications: "",
        description: "",
        categories: [],
    });
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("/category");
                setCategories(response.data.categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to load categories");
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                title: item.title || "",
                phoneNumber: item.phoneNumber || "",
                email: item.email || user?.email || "",
                experience: item.experience || "",
                qualifications: item.qualifications || "",
                description: item.description || "",
                categories: item.categories || [],
            });
        }
    }, [item, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        const categoryId = Number(value);
        
        setFormData(prev => ({
            ...prev,
            categories: checked
                ? [...prev.categories, categoryId]
                : prev.categories.filter(id => id !== categoryId)
        }));
    };

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!formData.phoneNumber.match(/^\d{10}$/)) {
            toast.error("Phone number must be 10 digits");
            return;
        }
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error("Invalid email address");
            return;
        }
        if (!formData.experience.trim()) {
            toast.error("Experience is required");
            return;
        }
        if (!formData.qualifications.trim()) {
            toast.error("Qualifications are required");
            return;
        }
        if (!formData.description.trim()) {
            toast.error("Description is required");
            return;
        }

        onSave(formData, images, files);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">
                        {item ? "Edit Portfolio" : "Add Portfolio"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Phone Number</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Experience</label>
                        <textarea
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Qualifications</label>
                        <textarea
                            name="qualifications"
                            value={formData.qualifications}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Categories</label>
                        <div className="space-y-2">
                            {categories.map((category) => {
                                const categoryId = Number(category._id);
                                const isChecked = formData.categories.includes(categoryId);
                                return (
                                    <div key={categoryId} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`category-${categoryId}`}
                                            value={categoryId}
                                            checked={isChecked}
                                            onChange={handleCategoryChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor={`category-${categoryId}`} className="text-gray-300">
                                            {category.name}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Upload Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Upload Files</label>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 text-white rounded"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PortfolioModalForm; 