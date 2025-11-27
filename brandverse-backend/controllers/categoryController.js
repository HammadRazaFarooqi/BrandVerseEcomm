const crypto = require("crypto");
const Category = require("../models/Category");
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000"; // Fallback URL

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all category
exports.getAllCategory = async (req, res) => {
  try {
    const category = await Category.find();
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Update Category

exports.updateCategory = async (req, res) => {
  try {
    // Get the category ID from the URL parameters (e.g., /api/categories/:id)
    const categoryId = req.params.id;

    // Find the category by ID and update it with the new data from req.body
    // { new: true } ensures the updated document is returned
    // { runValidators: true } ensures Mongoose schema rules are applied on update
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      req.body,
      { new: true, runValidators: true }
    );

    // Check if the category was found and updated
    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    // Respond with the success message and the updated category object
    res.status(200).json({ success: true, category: updatedCategory });
  } catch (error) {
    // Handle validation errors (e.g., trying to set a required field to null) or other database errors
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get a single Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a Category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
