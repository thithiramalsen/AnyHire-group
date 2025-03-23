import Portfolio from "../models/portfolio.model.js";

export const getPortfolio = async (req, res) => {
    try {
        const portfolioItems = await Portfolio.find({  });
        res.json(portfolioItems);
    } catch (error) {
        console.error("Error fetching portfolio items:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPortfolioItems = async (req, res) => {
    try {
        const portfolioItems = await Portfolio.findById(req.params.id);
        res.json(portfolioItems);
    } catch (error) {
        console.error("Error fetching portfolio items:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserPortfolio = async (req, res) => {
    try {
        const category  = req.body.category;
        const id = req.body.id;
        const portfolioItem = await Portfolio.findOne({user:id,category});
        if (!portfolioItem) {
            return res.status(404).json({ message: "Portfolio item not found" });
        }
        res.json(portfolioItem);
    } catch (error) {
        console.error("Error fetching user portfolio:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};



export const createPortfolioItem = async (req, res) => {
    try {
        const {
            category,
            phoneNumber,
            email,
            experience,
            qualifications,
            description, // Updated field
        } = req.body;

        const newPortfolioItem = await Portfolio.create({
            user: req.user._id,
            category,
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
        const id = req.params.id;
        const {
            category,
            phoneNumber,
            email,
            experience,
            qualifications,
            description,
        } = req.body;

        console.log(req.body);

        // Find the portfolio item by ID and user ID
        const portfolioItem = await Portfolio.findOne({ user:id});

        if (!portfolioItem) {
            return res.status(404).json({ message: "Portfolio item not found" });
        }

        // Update the fields
        portfolioItem.category = category;
        portfolioItem.phoneNumber = phoneNumber;
        portfolioItem.email = email;
        portfolioItem.experience = experience;
        portfolioItem.qualifications = qualifications;
        portfolioItem.description = description;

        // Save the updated portfolio item
        const updatedPortfolioItem = await portfolioItem.save();

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