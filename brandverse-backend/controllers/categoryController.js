import crypto from "crypto";
import Category from "../models/Category.js";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

import { connectDB } from "../lib/db.js";
// Create a new category
export const createCategory = async (req, res) => {
  try {
    await connectDB();
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all categories
export const getAllCategory = async (req, res) => {
  try {
    await connectDB();
    const category = await Category.find();
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    await connectDB();
    const categoryId = req.params.id;
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    res.status(200).json({ success: true, category: updatedCategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get a single Category by ID
export const getCategoryById = async (req, res) => {
  try {
    await connectDB();
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a Category by ID
export const deleteCategory = async (req, res) => {
  try {
    await connectDB();
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
