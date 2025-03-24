import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const PortfolioTab = () => {
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        const fetchPortfolioItems = async () => {
            try {
                const response = await axios.get("/portfolio");
                setPortfolioItems(response.data);
            } catch (error) {
                console.error("Error fetching portfolio items:", error);
                toast.error("Failed to load portfolio items.");
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await axios.get("/category");
                setCategories(response.data.categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to load categories.");
            }
        };

        fetchPortfolioItems();
        fetchCategories();
    }, []);

    const handleAddItem = () => {
        setCurrentItem({
            title: "",
            phoneNumber: "",
            email: "",
            experience: "",
            qualifications: "",
            description: "",
            categories: [],
            images: [],
            files: [],
        });
        setIsEditing(true);
    };

    const handleEditItem = (item) => {
        setCurrentItem(item);
        setIsEditing(true);
    };

    const handleSaveItem = async (item, images, files) => {
        try {
            const formData = new FormData();
            Object.keys(item).forEach((key) => {
                if (key === "categories") {
                    item[key].forEach((category) => formData.append("categories", category));
                } else {
                    formData.append(key, item[key]);
                }
            });

            images.forEach((image) => formData.append("images", image));
            files.forEach((file) => formData.append("files", file));

            let response;
            if (item._id) {
                response = await axios.put(`/portfolio/${item._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setPortfolioItems((prev) =>
                    prev.map((i) => (i._id === item._id ? response.data : i))
                );
            } else {
                response = await axios.post("/portfolio", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setPortfolioItems((prev) => [...prev, response.data]);
            }

            setIsEditing(false);
            setCurrentItem(null);
            toast.success("Portfolio item saved successfully!");
        } catch (error) {
            console.error("Error saving portfolio item:", error);
            toast.error("Failed to save portfolio item.");
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`/portfolio/${id}`);
            setPortfolioItems((prev) => prev.filter((item) => item._id !== id));
            toast.success("Portfolio item deleted.");
        } catch (error) {
            console.error("Error deleting portfolio item:", error);
            toast.error("Failed to delete portfolio item.");
        }
    };

    const handleFilterByCategory = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const filteredPortfolioItems = selectedCategory
        ? portfolioItems.filter((item) =>
            item.categories.includes(selectedCategory)
        )
        : portfolioItems;

    const pendingPortfolios = portfolioItems.filter((item) => item.status === "pending");

    return (
        <div>
            {/* Add Portfolio Item Section */}
            <h2 className="text-2xl font-bold mb-4">Add Portfolio Item</h2>
            <div className="mb-8">
                <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-emerald-600 text-white rounded"
                >
                    Add Portfolio Item
                </button>
            </div>

            {/* Render PortfolioForm if Editing */}
            {isEditing ? (
                <PortfolioForm
                    item={currentItem}
                    categories={categories} // Pass categories as a prop
                    onSave={handleSaveItem}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <>
                    {/* Separator */}
                    <hr className="my-8 border-gray-600" />

                    {/* Existing Portfolios Section */}
                    <h2 className="text-2xl font-bold mb-4">Existing Portfolios</h2>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-1">Filter by Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleFilterByCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-4">
                        {filteredPortfolioItems.map((item) => (
                            <PortfolioItem
                                key={item._id}
                                item={item}
                                categories={categories} // Pass categories as a prop
                                onEdit={() => handleEditItem(item)}
                                onDelete={() => handleDeleteItem(item._id)}
                            />
                        ))}
                        {filteredPortfolioItems.length === 0 && (
                            <p className="text-gray-400">No portfolio items found.</p>
                        )}
                    </div>

                    {/* Separator */}
                    <hr className="my-8 border-gray-600" />

                    {/* Portfolios Awaiting Approval Section */}
                    <h2 className="text-2xl font-bold mb-4">Portfolios Awaiting Approval</h2>
                    <div className="space-y-4">
                        {pendingPortfolios.map((item) => (
                            <PortfolioItem
                                key={item._id}
                                item={item}
                                categories={categories} // Pass categories as a prop
                                onEdit={() => handleEditItem(item)}
                                onDelete={() => handleDeleteItem(item._id)}
                            />
                        ))}
                        {pendingPortfolios.length === 0 && (
                            <p className="text-gray-400">No portfolios awaiting approval.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const PortfolioItem = ({ item, onEdit, onDelete, categories }) => {
    const categoryNames = item.categories
        .map(categoryId => {
            const category = categories.find(cat => cat._id === categoryId);
            return category ? category.name : "";
        })
        .filter(name => name !== "")
        .join(", ");

    return (
        <div className="p-4 bg-gray-800 rounded shadow">
            <p>Title: {item.title}</p>
            <p>Phone Number: {item.phoneNumber}</p>
            <p>Email: {item.email}</p>
            <p>Experience: {item.experience}</p>
            <p>Qualifications: {item.qualifications}</p>
            <p>Description: {item.description}</p>
            <p>Categories: {categoryNames}</p>
            <p>Status: {item.status}</p>

            {/* Display Images */}
            {item.images && item.images.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-bold">Images:</h3>
                    <div className="flex space-x-2">
                        {item.images.map((image, index) => (
                            <img
                                key={index}
                                src={`http://localhost:5000${image}`}
                                alt={`Portfolio Image ${index + 1}`}
                                className="w-32 h-32 object-cover rounded"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Display Files */}
            {item.files && item.files.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-bold">Files:</h3>
                    <ul className="list-disc list-inside">
                        {item.files.map((file, index) => (
                            <li key={index}>
                                <a
                                    href={`http://localhost:5000${file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:underline"
                                >
                                    {`File ${index + 1}`}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-4 flex space-x-2">
                <button
                    onClick={onEdit}
                    className="px-4 py-2 bg-emerald-600 text-white rounded"
                >
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

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

export default PortfolioTab;