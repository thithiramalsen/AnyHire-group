import Portfolio from "../models/portfolio.model.js";

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
    try {
        const {
            title,
            phoneNumber,
            email,
            experience,
            qualifications,
            description, // Updated field
        } = req.body;

        const newPortfolioItem = await Portfolio.create({
            user: req.user._id,
            title,
            phoneNumber,
            email,
            experience,
            qualifications,
            description, // Updated field
        });

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