import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const ProfileTab = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({ name: "", email: "" });

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get("/auth/profile");
                setProfile(response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            {isEditing ? (
                <EditProfileForm
                    profile={profile}
                    setProfile={setProfile}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <ViewProfile profile={profile} onEdit={() => setIsEditing(true)} />
            )}
        </div>
    );
};

const ViewProfile = ({ profile, onEdit }) => (
    <div>
        <p>Name: {profile.name}</p>
        <p>Email: {profile.email}</p>
        <button
            onClick={onEdit}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded"
        >
            Edit Profile
        </button>
    </div>
);

const EditProfileForm = ({ profile, setProfile, onCancel }) => {
    const [formData, setFormData] = useState(profile);

    const handleSubmit = async (e) => {
        e.preventDefault();

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
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-gray-300 mb-1">Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-1">Email</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
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

export default ProfileTab;