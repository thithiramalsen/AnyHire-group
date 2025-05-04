import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import PortfolioModalForm from "./PortfolioModalForm";
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Image, 
    FileText, 
    Phone, 
    Mail, 
    Briefcase, 
    Award, 
    Tag,
    Filter,
    Clock
} from "lucide-react";

const PortfolioTab = () => {
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleSaveItem = async (formData, images, files) => {
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach((key) => {
                if (key === "categories") {
                    formData[key].forEach((category) => formDataToSend.append("categories", category));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            images.forEach((image) => formDataToSend.append("images", image));
            files.forEach((file) => formDataToSend.append("files", file));

            let response;
            if (currentItem?._id) {
                response = await axios.put(`/portfolio/${currentItem._id}`, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setPortfolioItems((prev) =>
                    prev.map((i) => (i._id === currentItem._id ? response.data : i))
                );
            } else {
                response = await axios.post("/portfolio", formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setPortfolioItems((prev) => [...prev, response.data]);
            }

            setIsModalOpen(false);
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
        setSelectedCategory(categoryId === "" ? "" : Number(categoryId));
    };

    const filteredPortfolioItems = selectedCategory
        ? portfolioItems.filter((item) => {
            const itemCategoryIds = Array.isArray(item.categories) 
                ? item.categories.map(id => Number(id))
                : [];
            return itemCategoryIds.includes(Number(selectedCategory));
        })
        : portfolioItems;

    const pendingPortfolios = portfolioItems.filter((item) => item.status === "pending");

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-emerald-500">Portfolio Management</h1>
                <button
                    onClick={handleAddItem}
                    className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Portfolio Item</span>
                </button>
            </div>

            {/* Filter Section */}
            <div className="mb-8 bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                    <Filter size={20} className="text-emerald-500" />
                    <label className="text-lg font-semibold">Filter Portfolios</label>
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => handleFilterByCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {filteredPortfolioItems.map((item) => (
                    <PortfolioItem
                        key={item._id}
                        item={item}
                        categories={categories}
                        onEdit={() => handleEditItem(item)}
                        onDelete={() => handleDeleteItem(item._id)}
                    />
                ))}
            </div>

            {/* Pending Portfolios Section */}
            <div className="mt-12">
                <div className="flex items-center space-x-2 mb-6">
                    <Clock size={24} className="text-emerald-500" />
                    <h2 className="text-2xl font-bold">Pending Approval</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingPortfolios.map((item) => (
                        <PortfolioItem
                            key={item._id}
                            item={item}
                            categories={categories}
                            onEdit={() => handleEditItem(item)}
                            onDelete={() => handleDeleteItem(item._id)}
                        />
                    ))}
                </div>
            </div>

            <PortfolioModalForm
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setCurrentItem(null);
                }}
                onSave={handleSaveItem}
                item={currentItem}
            />
        </div>
    );
};

const PortfolioItem = ({ item, onEdit, onDelete, categories }) => {
    const categoryNames = item.categories
        .map(categoryId => {
            const category = categories.find(cat => Number(cat._id) === Number(categoryId));
            return category ? category.name : "";
        })
        .filter(name => name !== "")
        .join(", ");

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
            {/* Images Carousel */}
            {item.images && item.images.length > 0 && (
                <div className="relative h-48 bg-gray-900">
                    <img
                        src={`http://localhost:5000${item.images[0]}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    {item.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-50 rounded text-xs">
                            +{item.images.length - 1} more
                        </div>
                    )}
                </div>
            )}

            <div className="p-6">
                {/* Title and Status */}
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-emerald-400">{item.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                        item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                    }`}>
                        {item.status}
                    </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-gray-300">
                        <Phone size={16} className="text-emerald-500" />
                        <span>{item.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                        <Mail size={16} className="text-emerald-500" />
                        <span>{item.email}</span>
                    </div>
                </div>

                {/* Experience and Qualifications */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                        <Briefcase size={16} className="text-emerald-500" />
                        <span className="font-semibold">Experience:</span>
                        <span>{item.experience}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Award size={16} className="text-emerald-500" />
                        <span className="font-semibold">Qualifications:</span>
                        <span>{item.qualifications}</span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 mb-4">{item.description}</p>

                {/* Categories */}
                <div className="flex items-center space-x-2 mb-4">
                    <Tag size={16} className="text-emerald-500" />
                    <div className="flex flex-wrap gap-2">
                        {categoryNames.split(", ").map((category, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-700 rounded-full text-sm">
                                {category}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    <button
                        onClick={onEdit}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                        <Edit2 size={16} />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PortfolioTab;