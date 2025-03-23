import Category from "../models/category.model.js";

// Controller to get all categories
export const getAllCategories = async (req, res, next) => {
  let categories;

  // Get all categories
  try {
    categories = await Category.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  // Categories not found
  if (!categories) {
    return res.status(404).json({ message: "Categories not found" });
  }

  // Display all categories
  return res.status(200).json({ categories });
};

// Controller to add a new category
export const addCategory = async (req, res, next) => {
  const { name } = req.body;
  let category;

  // Create a new category
  try {
    category = new Category({ name });
    await category.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to add category" });
  }

  // Successfully added category
  return res.status(201).json({ category });
};

// Controller to get a category by ID
export const getCategoryById = async (req, res, next) => {
  const id = req.params.id;
  let category;

  // Get category by ID
  try {
    category = await Category.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  // Category not found
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Display the category
  return res.status(200).json({ category });
};

// Controller to update a category by ID
export const updateCategory = async (req, res, next) => {
  const id = req.params.id;
  const { name } = req.body;
  let category;

  // Update category by ID
  try {
    category = await Category.findByIdAndUpdate(id, { name }, { new: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to update category" });
  }

  // Unable to update category
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Successfully updated category
  return res.status(200).json({ category });
};

// Controller to delete a category by ID
export const deleteCategory = async (req, res, next) => {
  const id = req.params.id;
  let category;

  // Delete category by ID
  try {
    category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to delete category" });
  }

  // Successfully deleted category
  return res.status(200).json({ message: "Category successfully deleted" });
};