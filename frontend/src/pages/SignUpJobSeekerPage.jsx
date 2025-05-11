import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader, Image, ChevronDown, ChevronUp, Tags, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import axios from "../lib/axios";

const SignUpJobSeekerPage = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null,
    preferredCategories: [],
    preferredDistrict: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    image: false,
  });

  const [errors, setErrors] = useState({});
  const { signup, loading } = useUserStore();
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/category/public");
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    const validationErrors = validate(newFormData);
    setErrors(validationErrors);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validate(formData);
    setErrors(validationErrors);
  };

  const validate = (fields) => {
    const errs = {};

    if (!fields.name) {
      errs.name = "Name is required.";
    } else if (fields.name.length < 3) {
      errs.name = "Name must be at least 3 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(fields.name)) {
      errs.name = "Name can only contain letters.";
    }

    if (!fields.email) {
      errs.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(fields.email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (!fields.password) {
      errs.password = "Password is required.";
    } else if (fields.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    if (!fields.confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (fields.confirmPassword !== fields.password) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (fields.image && !fields.image.type.startsWith("image/")) {
      errs.image = "Please select a valid image file.";
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      image: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((err) => toast.error(err));
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("confirmPassword", formData.confirmPassword);
    data.append("role", "jobSeeker");
    if (formData.image) {
      data.append("image", formData.image);
    }
    if (formData.preferredCategories.length > 0) {
      data.append("preferredCategories", JSON.stringify(formData.preferredCategories));
    }
    if (formData.preferredDistrict) {
      data.append("preferredDistrict", formData.preferredDistrict);
    }

    signup(data);
  };

  const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
    "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
    "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
    "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
    "Trincomalee", "Vavuniya"
  ];

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
          Create your Job Seeker account
        </h2>
      </motion.div>

      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Full name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="John Doe"
                />
                {touched.name && errors.name && (
                  <div className="text-red-500 text-xs mt-1">{errors.name}</div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="you@example.com"
                />
                {touched.email && errors.email && (
                  <div className="text-red-500 text-xs mt-1">{errors.email}</div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="********"
                />
                {touched.password && errors.password && (
                  <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="********"
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-300">
                Profile Picture
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Image className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange("image", e.target.files[0])}
                  onBlur={() => handleBlur("image")}
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                />
                {touched.image && errors.image && (
                  <div className="text-red-500 text-xs mt-1">{errors.image}</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(!isPreferencesOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Tags size={18} />
                  <span>Additional Preferences (Optional)</span>
                </div>
                {isPreferencesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isPreferencesOpen && (
                <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Tags className="inline-block mr-2 h-4 w-4" />
                      Preferred Categories
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        const value = Number(e.target.value); // Convert to number
                        if (value && !formData.preferredCategories.includes(value)) {
                          setFormData(prev => ({
                            ...prev,
                            preferredCategories: [...prev.preferredCategories, value]
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select categories...</option>
                      {categories.map((category) => (
                        <option 
                          key={category._id} 
                          value={category._id}
                          disabled={formData.preferredCategories.includes(category._id)}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>

                    {/* Selected categories as tags */}
                    {formData.preferredCategories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.preferredCategories.map((catId) => {
                          const category = categories.find(c => c._id === catId);
                          return category ? (
                            <span
                              key={catId}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400"
                            >
                              {category.name}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    preferredCategories: prev.preferredCategories.filter(id => id !== catId)
                                  }));
                                }}
                                className="ml-1 hover:text-emerald-300"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="inline-block mr-2 h-4 w-4" />
                      Preferred District
                    </label>
                    <select
                      value={formData.preferredDistrict}
                      onChange={(e) => handleChange("preferredDistrict", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select a district</option>
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Loading ...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Sign up
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
            >
              Login here
              <ArrowRight className="inline h-4 w-4 ml-1" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpJobSeekerPage;
