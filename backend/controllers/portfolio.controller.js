import Portfolio from "../models/portfolio.model.js";
import Category from "../models/category.model.js";

export const getPortfolioItems = async (req, res) => {
    try {
        const portfolioItems = await Portfolio.find({ user: req.user._id });
        res.json(portfolioItems);
    } catch (error) {
        console.error("Error fetching portfolio items:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const createPortfolioItem = async (req, res) => {

    console.log("Request body:", req.body);
    console.log("Type of phoneNumber:", typeof req.body.phoneNumber);

    try {
        console.log("Request body:", req.body);
        console.log("Uploaded files:", req.files);

        const {
            title,
            phoneNumber,
            email,
            experience,
            qualifications,
            description,
            categories,
        } = req.body;

        //const categoryIds = categories.map((id) => mongoose.Types.ObjectId(id));

        // Validate categories
        const selectedCategories = await Category.find({ _id: { $in: categories } });
        const requiresPortfolio = selectedCategories.some(
            (category) => category.requiresPortfolio
        );

        // Determine portfolio status
        const status = requiresPortfolio ? "pending" : "approved";

        // Handle file uploads
        const images = req.files?.images?.map((file) => `/uploads/${file.filename}`) || [];
        const files = req.files?.files?.map((file) => `/uploads/${file.filename}`) || [];

        console.log("Images:", images);
        console.log("Files:", files);

        const newPortfolioItem = await Portfolio.create({
            user: req.user._id,
            title,
            phoneNumber,
            email,
            experience,
            qualifications,
            description,
            categories,
            images,
            files,
            status,
        });

        console.log("New portfolio item created:", newPortfolioItem);

        res.status(201).json(newPortfolioItem);
    } catch (error) {
        console.error("Error creating portfolio item:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const updatePortfolioItem = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            phoneNumber,
            email,
            experience,
            qualifications,
            description, // Updated field
        } = req.body;

        const updatedPortfolioItem = await Portfolio.findOneAndUpdate(
            { _id: id, user: req.user._id },
            {
                title,
                phoneNumber,
                email,
                experience,
                qualifications,
                description, // Updated field
            },
            { new: true, runValidators: true }
        );

        if (!updatedPortfolioItem) {
            return res.status(404).json({ message: "Portfolio item not found" });
        }

        res.json(updatedPortfolioItem);
    } catch (error) {
        console.error("Error updating portfolio item:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const deletePortfolioItem = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPortfolioItem = await Portfolio.findOneAndDelete({
            _id: id,
            user: req.user._id,
        });

        if (!deletedPortfolioItem) {
            return res.status(404).json({ message: "Portfolio item not found" });
        }

        res.json({ message: "Portfolio item deleted successfully" });
    } catch (error) {
        console.error("Error deleting portfolio item:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};