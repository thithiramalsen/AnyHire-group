import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import axios from "../lib/axios";
import { AlertCircle } from "lucide-react";

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

    const [touched, setTouched] = useState({
        title: false,
        phoneNumber: false,
        email: false,
        experience: false,
        qualifications: false,
        description: false,
        categories: false,
        images: false,
        files: false,
    });

    const [errors, setErrors] = useState({});
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

    const validate = (fields) => {
        const errs = {};

        if (!fields.title?.trim()) {
            errs.title = "Title is required";
        } else if (fields.title.length < 3) {
            errs.title = "Title must be at least 3 characters";
        }

        if (!fields.phoneNumber) {
            errs.phoneNumber = "Phone number is required";
        } else if (!fields.phoneNumber.match(/^\d{10}$/)) {
            errs.phoneNumber = "Phone number must be exactly 10 digits";
        }

        if (!fields.email) {
            errs.email = "Email is required";
        } else if (!fields.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errs.email = "Please enter a valid email address";
        }

        if (!fields.experience?.trim()) {
            errs.experience = "Experience is required";
        } else if (fields.experience.length < 10) {
            errs.experience = "Experience description must be at least 10 characters";
        }

        if (!fields.qualifications?.trim()) {
            errs.qualifications = "Qualifications are required";
        } else if (fields.qualifications.length < 10) {
            errs.qualifications = "Qualifications must be at least 10 characters";
        }

        if (!fields.description?.trim()) {
            errs.description = "Description is required";
        } else if (fields.description.length < 20) {
            errs.description = "Description must be at least 20 characters";
        }

        if (fields.categories.length === 0) {
            errs.categories = "Please select at least one category";
        }

        return errs;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (touched[name]) {
            const validationErrors = validate({
                ...formData,
                [name]: value
            });
            setErrors(prev => ({
                ...prev,
                [name]: validationErrors[name]
            }));
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
        
        const validationErrors = validate(formData);
        setErrors(prev => ({
            ...prev,
            [field]: validationErrors[field]
        }));
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        const categoryId = Number(value);
        
        const updatedCategories = checked
            ? [...formData.categories, categoryId]
            : formData.categories.filter(id => id !== categoryId);

        setFormData(prev => ({
            ...prev,
            categories: updatedCategories
        }));

        if (touched.categories) {
            const validationErrors = validate({
                ...formData,
                categories: updatedCategories
            });
            setErrors(prev => ({
                ...prev,
                categories: validationErrors.categories
            }));
        }
    };

    const handleImageChange = (e) => {
        const selectedFiles = [...e.target.files];
        
        const invalidFiles = selectedFiles.filter(file => !file.type.startsWith('image/'));
        if (invalidFiles.length > 0) {
            setErrors(prev => ({
                ...prev,
                images: "Please select only image files"
            }));
            return;
        }

        setImages(selectedFiles);
        setErrors(prev => ({ ...prev, images: undefined }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = [...e.target.files];
        
        const invalidFiles = selectedFiles.filter(file => !file.type);
        if (invalidFiles.length > 0) {
            setErrors(prev => ({
                ...prev,
                files: "Invalid file type selected"
            }));
            return;
        }

        setFiles(selectedFiles);
        setErrors(prev => ({ ...prev, files: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setTouched({
            title: true,
            phoneNumber: true,
            email: true,
            experience: true,
            qualifications: true,
            description: true,
            categories: true,
            images: true,
            files: true,
        });

        const validationErrors = validate(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        onSave(formData, images, files);
    };

    const ErrorMessage = ({ error }) => {
        if (!error) return null;
        
        return (
            <div className="flex items-center gap-1 text-red-400 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
            </div>
        );
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
                            onBlur={() => handleBlur('title')}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded transition-colors ${
                                errors.title ? 'border-red-500' : 'border-gray-600'
                            }`}
                        />
                        <ErrorMessage error={touched.title && errors.title} />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Phone Number</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('phoneNumber')}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded transition-colors ${
                                errors.phoneNumber ? 'border-red-500' : 'border-gray-600'
                            }`}
                        />
                        <ErrorMessage error={touched.phoneNumber && errors.phoneNumber} />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('email')}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded transition-colors ${
                                errors.email ? 'border-red-500' : 'border-gray-600'
                            }`}
                        />
                        <ErrorMessage error={touched.email && errors.email} />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Experience</label>
                        <textarea
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('experience')}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded transition-colors ${
                                errors.experience ? 'border-red-500' : 'border-gray-600'
                            }`}
                        />
                        <ErrorMessage error={touched.experience && errors.experience} />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Qualifications</label>
                        <textarea
                            name="qualifications"
                            value={formData.qualifications}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('qualifications')}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded transition-colors ${
                                errors.qualifications ? 'border-red-500' : 'border-gray-600'
                            }`}
                        />
                        <ErrorMessage error={touched.qualifications && errors.qualifications} />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('description')}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded transition-colors ${
                                errors.description ? 'border-red-500' : 'border-gray-600'
                            }`}
                        />
                        <ErrorMessage error={touched.description && errors.description} />
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
                                            onBlur={() => handleBlur('categories')}
                                            className="mr-2"
                                        />
                                        <label htmlFor={`category-${categoryId}`} className="text-gray-300">
                                            {category.name}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                        <ErrorMessage error={touched.categories && errors.categories} />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Upload Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            onBlur={() => handleBlur('images')}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded transition-colors ${
                                errors.images ? 'border-red-500' : 'border-gray-600'
                            }`}
                        />
                        <ErrorMessage error={touched.images && errors.images} />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Upload Files</label>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            onBlur={() => handleBlur('files')}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded transition-colors ${
                                errors.files ? 'border-red-500' : 'border-gray-600'
                            }`}
                        />
                        <ErrorMessage error={touched.files && errors.files} />
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