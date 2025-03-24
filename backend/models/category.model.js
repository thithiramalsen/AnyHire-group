import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  requiresPortfolio: {
    type: Boolean,
    default: false, // Indicates if a portfolio is required for this category
  },
});

const Category = mongoose.model("Category", categorySchema);
export default Category;