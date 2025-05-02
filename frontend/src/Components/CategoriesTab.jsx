import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, Search, RefreshCw } from "lucide-react";

const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/category");
      setCategories(response.data.categories);
      toast.success("Categories loaded successfully");
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    if (!categoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      if (currentCategory) {
        const response = await axios.put(`/category/${currentCategory._id}`, { 
          name: categoryName.trim() 
        });
        setCategories((prev) =>
          prev.map((cat) => (cat._id === currentCategory._id ? response.data.category : cat))
        );
        toast.success("Category updated successfully!");
      } else {
        const response = await axios.post("/category", { 
          name: categoryName.trim() 
        });
        setCategories((prev) => [...prev, response.data.category]);
        toast.success("Category added successfully!");
      }
      setIsEditing(false);
      setCategoryName("");
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.message || "Failed to save category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await axios.delete(`/category/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const filteredAndSortedCategories = categories
    .filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });

  return (
    <div className="p-6 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Categories Management</h2>
          <div className="flex gap-2">
            <button
              onClick={fetchCategories}
              className="flex items-center px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleAddCategory}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              disabled={isEditing}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {isEditing && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              {currentCategory ? "Edit Category" : "Add New Category"}
            </h3>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white"
              placeholder="Category Name"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                {currentCategory ? "Update" : "Save"}
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Category List</h3>
            <button
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              className="text-gray-400 hover:text-white"
            >
              Sort {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
          
          <div className="divide-y divide-gray-700">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading categories...</div>
            ) : filteredAndSortedCategories.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {searchTerm ? "No categories found" : "No categories added yet"}
              </div>
            ) : (
              filteredAndSortedCategories.map((category) => (
                <div key={category._id} className="p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{category.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-gray-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-gray-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesTab;