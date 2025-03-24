import { useState } from "react";
import { toast } from "react-hot-toast";

const PortfolioForm = ({ item, categories, onSave, onCancel }) => {
    const [formData, setFormData] = useState(item);
    const [selectedCategories, setSelectedCategories] = useState(item.categories || []);
    const [images, setImages] = useState([]);
    const [files, setFiles] = useState([]);

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedCategories((prev) => [...prev, value]);
        } else {
            setSelectedCategories((prev) => prev.filter((category) => category !== value));
        }
    };

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error("Title is required.");
            return;
        }
        if (!formData.phoneNumber.match(/^\d{10}$/)) {
            toast.error("Phone number must be 10 digits.");
            return;
        }
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error("Invalid email address.");
            return;
        }
        if (!formData.experience.trim()) {
            toast.error("Experience is required.");
            return;
        }
        if (!formData.qualifications.trim()) {
            toast.error("Qualifications are required.");
            return;
        }
        if (!formData.description.trim()) {
            toast.error("Description is required.");
            return;
        }

        onSave({ ...formData, categories: selectedCategories }, images, files);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg"
        >
            <h2 className="text-xl font-bold text-white mb-4">Portfolio Form</h2>
            <div>
                <label className="block text-gray-300 mb-1">Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-1">Phone Number</label>
                <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-1">Experience</label>
                <textarea
                    value={formData.experience}
                    onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-1">Qualifications</label>
                <textarea
                    value={formData.qualifications}
                    onChange={(e) =>
                        setFormData({ ...formData, qualifications: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-1">Categories</label>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <div key={category._id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`category-${category._id}`}
                                value={category._id}
                                checked={selectedCategories.includes(category._id)}
                                onChange={handleCategoryChange}
                                className="mr-2"
                            />
                            <label htmlFor={`category-${category._id}`} className="text-gray-300">
                                {category.name}
                            </label>
                        </div>
                    ))}
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
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default PortfolioForm;