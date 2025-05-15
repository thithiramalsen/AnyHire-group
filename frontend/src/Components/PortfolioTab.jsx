import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import PortfolioModalForm from "./PortfolioModalForm";
import PortfolioItem from "./PortfolioItem";
import { 
    Plus, 
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

export default PortfolioTab;