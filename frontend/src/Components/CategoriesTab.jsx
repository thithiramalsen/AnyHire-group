import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/category");
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories.");
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setCurrentCategory(null);
    setCategoryName("");
    setIsEditing(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setIsEditing(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (currentCategory) {
        // Update existing category
        const response = await axios.put(`/category/${currentCategory._id}`, { name: categoryName });
        setCategories((prev) =>
          prev.map((cat) => (cat._id === currentCategory._id ? response.data.category : cat))
        );
        toast.success("Category updated successfully!");
      } else {
        // Add new category
        const response = await axios.post("/category", { name: categoryName });
        setCategories((prev) => [...prev, response.data.category]);
        toast.success("Category added successfully!");
      }
      setIsEditing(false);
      setCategoryName("");
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category.");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`/category/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      {isEditing ? (
        <div className="mb-4">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
            placeholder="Category Name"
          />
          <div className="mt-2 flex space-x-2">
            <button
              onClick={handleSaveCategory}
              className="px-4 py-2 bg-emerald-600 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleAddCategory}
          className="mb-4 px-4 py-2 bg-emerald-600 text-white rounded"
        >
          Add Category
        </button>
      )}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category._id} className="p-4 bg-gray-800 rounded shadow">
            <p>{category.name}</p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => handleEditCategory(category)}
                className="px-4 py-2 bg-emerald-600 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCategory(category._id)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-gray-400">No categories added yet.</p>
        )}
      </div>
    </div>
  );
};

export default CategoriesTab;