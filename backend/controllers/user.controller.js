import User from "../models/user.model.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password from response
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        await user.save();

        // Return updated user without password
        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete user
        await User.findByIdAndDelete(id);

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}; 