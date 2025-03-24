import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import PortfolioForm from "./PortfolioForm";
import PortfolioItem from "./PortfolioItem";

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

export default PortfolioTab;