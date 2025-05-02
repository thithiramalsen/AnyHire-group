import mongoose from "mongoose";
import Counter from './counter.model.js';

const categorySchema = new mongoose.Schema({
  _id: { type: Number },
  name: {
    type: String,
    required: true,
  },
  requiresPortfolio: {
    type: Boolean,
    default: false, // Indicates if a portfolio is required for this category
  },
});

// Add pre-save middleware to handle auto-incrementing
categorySchema.pre('save', async function(next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'categoryId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;