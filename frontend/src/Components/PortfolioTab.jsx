import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const PortfolioTab = () => {
    const [portfolioItems, setPortfolioItems] = useState([]);
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

        fetchPortfolioItems();
    }, []);

    const handleAddItem = () => {
        setCurrentItem({
            title: "",
            phoneNumber: "",
            email: "",
            experience: "",
            qualifications: "",
            description: "",
        });
        setIsEditing(true);
    };

    const handleEditItem = (item) => {
        setCurrentItem(item);
        setIsEditing(true);
    };

    const handleSaveItem = async (item) => {
        try {
            let response;
            if (item._id) {
                // Update existing item
                response = await axios.put(`/portfolio/${item._id}`, item);
                setPortfolioItems((prev) =>
                    prev.map((i) => (i._id === item._id ? response.data : i))
                );
            } else {
                // Add new item
                response = await axios.post("/portfolio", item);
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

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
            {isEditing ? (
                <PortfolioForm
                    item={currentItem}
                    onSave={handleSaveItem}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <>
                    <button
                        onClick={handleAddItem}
                        className="mb-4 px-4 py-2 bg-emerald-600 text-white rounded"
                    >
                        Add Portfolio Item
                    </button>
                    <div className="space-y-4">
                        {portfolioItems.map((item) => (
                            <PortfolioItem
                                key={item._id}
                                item={item}
                                onEdit={() => handleEditItem(item)}
                                onDelete={() => handleDeleteItem(item._id)}
                            />
                        ))}
                        {portfolioItems.length === 0 && (
                            <p className="text-gray-400">
                                No portfolio items added yet.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const PortfolioItem = ({ item, onEdit, onDelete }) => (
    <div className="p-4 bg-gray-800 rounded shadow">
        <p>Title: {item.title}</p>
        <p>Phone Number: {item.phoneNumber}</p>
        <p>Email: {item.email}</p>
        <p>Experience: {item.experience}</p>
        <p>Qualifications: {item.qualifications}</p>
        <p>Description: {item.description}</p>
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

const PortfolioForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(item);

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

        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-gray-300 mb-1">Description of your status</label>
                <textarea
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    required
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