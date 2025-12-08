import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import Category from "../models/Category.js";
import { connectDB } from "../lib/db.js";

const router = express.Router();

// Create category
router.post("/", async (req, res) => {
  try {
    await connectDB();
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all categories
router.get("/", categoryController.getAllCategory);

// Get category by ID
router.get("/:id", categoryController.getCategoryById);

// Update category
router.put("/:id", categoryController.updateCategory);

// Delete category
router.delete("/:id", categoryController.deleteCategory);

export default router;
