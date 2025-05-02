import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import PortfolioModalForm from "./PortfolioModalForm";

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
        // Convert empty string to null for "All Categories"
        setSelectedCategory(categoryId === "" ? "" : Number(categoryId));
    };

    const filteredPortfolioItems = selectedCategory
    ? portfolioItems.filter((item) => {
        // Ensure categories is always an array of numbers
        const itemCategoryIds = Array.isArray(item.categories) 
            ? item.categories.map(id => Number(id))
            : [];
        
        // Debug logging
        console.log({
            portfolioTitle: item.title,
            rawCategories: item.categories,
            parsedCategoryIds: itemCategoryIds,
            selectedCategory: Number(selectedCategory),
            categoriesType: typeof item.categories,
            isArray: Array.isArray(item.categories),
            matchFound: itemCategoryIds.includes(Number(selectedCategory))
        });
        
        return itemCategoryIds.includes(Number(selectedCategory));
    })
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

            {/* Modal Form */}
            <PortfolioModalForm
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setCurrentItem(null);
                }}
                onSave={handleSaveItem}
                item={currentItem}
            />

            {/* Existing Portfolios Section */}
            <hr className="my-8 border-gray-600" />
            <h2 className="text-2xl font-bold mb-4">Existing Portfolios</h2>
            <div className="mb-4">
                
                <label className="block text-gray-300 mb-1">Filter by Category</label>
                <select
                    value={selectedCategory}
                    onChange={(e) => {
                        const value = e.target.value;
                        console.log('Selected category value:', value);
                        handleFilterByCategory(value);
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option
                            key={category._id}
                            value={category._id}
                        >
                            {`${category.name} (ID: ${category._id})`}
                        </option>
                    ))}
                </select>

            </div>

            <div className="space-y-4">
                {filteredPortfolioItems.map((item) => (
                    <PortfolioItem
                        key={item._id}
                        item={item}
                        categories={categories}
                        onEdit={() => handleEditItem(item)}
                        onDelete={() => handleDeleteItem(item._id)}
                    />
                ))}
                {filteredPortfolioItems.length === 0 && (
                    <p className="text-gray-400">No portfolio items found.</p>
                )}
            </div>

            {/* Portfolios Awaiting Approval Section */}
            <hr className="my-8 border-gray-600" />
            <h2 className="text-2xl font-bold mb-4">Portfolios Awaiting Approval</h2>
            <div className="space-y-4">
                {pendingPortfolios.map((item) => (
                    <PortfolioItem
                        key={item._id}
                        item={item}
                        categories={categories}
                        onEdit={() => handleEditItem(item)}
                        onDelete={() => handleDeleteItem(item._id)}
                    />
                ))}
                {pendingPortfolios.length === 0 && (
                    <p className="text-gray-400">No portfolios awaiting approval.</p>
                )}
            </div>
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

export default PortfolioTab;