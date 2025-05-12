import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
    User, 
    Mail, 
    Upload, 
    Trash2, 
    Edit2, 
    Save, 
    X, 
    AlertTriangle 
} from "lucide-react";
//import UserReports from './UserReports';

const ProfileTab = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({ name: "", email: "" });
    const [imageFile, setImageFile] = useState(null);
    const navigate = useNavigate();

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get("/auth/profile");
                console.log(response.data); // Debug: Check the profile data
                setProfile(response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, []);

    const handleImageUpload = async () => {
        if (!imageFile) {
            toast.error("Please select an image to upload.");
            return;
        }

        // Image validation
        if (!imageFile.type.startsWith("image/")) {
            toast.error("Please select a valid image file.");
            return;
        }

        const formData = new FormData();
        formData.append("image", imageFile);

        try {
            const response = await axios.post("/auth/profile/pfp", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setProfile((prev) => ({ ...prev, image: response.data.image }));
            toast.success("Profile picture updated successfully!");
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            toast.error("Failed to upload profile picture.");
        }
    };

    const handleImageDelete = async () => {
        try {
            await axios.delete("/auth/profile/pfp");
            setProfile((prev) => ({ ...prev, image: null }));
            toast.success("Profile picture deleted successfully!");
        } catch (error) {
            console.error("Error deleting profile picture:", error);
            toast.error("Failed to delete profile picture.");
        }
    };

    const handleAccountDelete = async () => {
        toast((t) => (
            <span>
                Are you sure you want to delete your account?
                <button
                    onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await axios.delete("/auth/profile");
                            toast.success("Account deleted successfully!");
                            navigate("/signup"); // Redirect to signup page or any other page
                        } catch (error) {
                            console.error("Error deleting account:", error);
                            toast.error("Failed to delete account.");
                        }
                    }}
                    className="ml-2 px-4 py-2 bg-red-600 text-white rounded"
                >
                    Yes
                </button>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="ml-2 px-4 py-2 bg-gray-600 text-white rounded"
                >
                    No
                </button>
            </span>
        ));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800 rounded-lg shadow-lg p-8">
                    <h2 className="text-3xl font-bold mb-8 text-center text-emerald-500">My Profile</h2>

                    {/* Profile Picture Section */}
                    <div className="mb-8">
                        <div className="text-center">
                            <div className="relative inline-block">
                                <img
                                    src={`http://localhost:5000/uploads/${profile.image || "default-profile.png"}`}
                                    alt="Profile"
                                    className="w-40 h-40 rounded-full object-cover mx-auto mb-4 border-4 border-emerald-500"
                                />
                                {profile.image && (
                                    <button
                                        onClick={handleImageDelete}
                                        className="absolute bottom-0 right-0 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                        title="Delete profile picture"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upload Profile Picture */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center space-x-4">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
                                >
                                    <Upload size={20} />
                                    <span>Choose Image</span>
                                </label>
                            </div>
                            {imageFile && (
                                <button
                                    onClick={handleImageUpload}
                                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                                >
                                    <Save size={20} />
                                    <span>Upload</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="bg-gray-900 rounded-lg p-6">
                        {isEditing ? (
                            <EditProfileForm
                                profile={profile}
                                setProfile={setProfile}
                                onCancel={() => setIsEditing(false)}
                            />
                        ) : (
                            <ViewProfile profile={profile} onEdit={() => setIsEditing(true)} setProfile={setProfile} />
                        )}
                    </div>

                    {/* Delete Account Button */}
                    <div className="mt-8 pt-6 border-t border-gray-700">
                        <button
                            onClick={handleAccountDelete}
                            className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            <AlertTriangle size={20} />
                            <span>Delete Account</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Reports Section 
            <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Reports</h3>
                <UserReports userId={profile._id} />
            </div>*/}
        </div>
    );
};

const ViewProfile = ({ profile, onEdit, setProfile }) => (
    <div className="space-y-6">
        <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
            <User className="text-emerald-500" size={24} />
            <div className="flex-1">
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-lg">{profile.name}</p>
            </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
            <Mail className="text-emerald-500" size={24} />
            <div className="flex-1">
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-lg">{profile.email}</p>
            </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
            <User className="text-emerald-500" size={24} />
            <div className="flex-1">
                <p className="text-sm text-gray-400">Role</p>
                <div className="flex items-center gap-4">
                    <p className="text-lg capitalize">{profile.role}</p>
                    {profile.role === 'customer' && (
                        <div className="flex flex-col space-y-2">
                        </div>
                    )}
                </div>
            </div>
        </div>
        <button
            onClick={onEdit}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
            <Edit2 size={20} />
            <span>Edit Profile</span>
        </button>
    </div>
);

const EditProfileForm = ({ profile, setProfile, onCancel }) => {
    const [formData, setFormData] = useState(profile);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Name validation
        const nameRegex = /^[A-Za-z\s]+$/;
        if (formData.name.length < 3) {
            toast.error("Name must be at least 3 characters long.");
            return;
        }
        if (!nameRegex.test(formData.name)) {
            toast.error("Name can only contain letters.");
            return;
        }

        try {
            // Send updated data to the backend
            const response = await axios.put("/auth/profile", formData);
            setProfile(response.data); // Update the profile state with the new data
            toast.success("Profile updated successfully!"); // Success toast
            onCancel(); // Close the edit form
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile. Please try again."); // Error toast
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="flex items-center space-x-2 text-gray-300 mb-2">
                    <User size={20} />
                    <span>Name</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                />
            </div>
            <div>
                <label className="flex items-center space-x-2 text-gray-300 mb-2">
                    <Mail size={20} />
                    <span>Email</span>
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                />
            </div>
            <div className="flex space-x-4">
                <button
                    type="submit"
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                    <Save size={20} />
                    <span>Save Changes</span>
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    <X size={20} />
                    <span>Cancel</span>
                </button>
            </div>
        </form>
    );
};

export default ProfileTab;