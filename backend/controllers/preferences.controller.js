import User from "../models/user.model.js";

export const updateUserPreferences = async (req, res) => {
    try {
        const { id } = req.params;
        const { preferredCategories, preferredDistrict } = req.body;

        console.log("Updating preferences for user:", {
            userId: id,
            preferredCategories,
            preferredDistrict
        });

        const user = await User.findByIdAndUpdate(
            id,
            { preferredCategories, preferredDistrict },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error updating preferences:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};