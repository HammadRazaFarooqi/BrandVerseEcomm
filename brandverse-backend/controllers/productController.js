import crypto from "crypto";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Category from "../models/Category.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Helper: Build product filters
const buildProductFilters = (query = {}, options = {}) => {
  const filters = { status: "published" };
  const {
    category,
    categorySlug,
    brand,
    tags,
    minPrice,
    maxPrice,
    search,
    isFeatured,
    isBestSeller,
    inStock,
  } = query;

  if (categorySlug) {
    filters.categorySlug = categorySlug.toLowerCase();
  } else if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filters.category = category;
    } else {
      filters.categorySlug = category.toLowerCase();
    }
  }

  if (brand && !options.skipBrand) {
    const brands = brand.split(",").map((b) => b.trim()).filter(Boolean);
    if (brands.length) filters.brand = { $in: brands };
  }

  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tagList.length) filters.tags = { $in: tagList };
  }

  const parseNumber = (val) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : undefined;
  };

  const min = parseNumber(minPrice);
  const max = parseNumber(maxPrice);
  if (!options.skipPrice && (min !== undefined || max !== undefined)) {
    filters.finalPrice = {};
    if (min !== undefined) filters.finalPrice.$gte = min;
    if (max !== undefined) filters.finalPrice.$lte = max;
  }

  if (isFeatured === "true") filters.isFeatured = true;
  if (isBestSeller === "true") filters.isBestSeller = true;
  if (inStock === "true") filters.stock = { $gt: 0 };
  if (search && !options.skipSearch) filters.$text = { $search: search };

  return filters;
};

// Helper: Determine sort
const getSortOption = (sort, hasTextSearch = false) => {
  if (hasTextSearch) return { score: { $meta: "textScore" }, createdAt: -1 };
  switch (sort) {
    case "price-asc": return { finalPrice: 1 };
    case "price-desc": return { finalPrice: -1 };
    case "best-selling": return { totalSold: -1 };
    case "newest":
    default: return { createdAt: -1 };
  }
};

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const { category, defaultQuantity, ...rest } = req.body;
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc)
      return res.status(400).json({ success: false, message: "Invalid category (not found)" });

    const quantity = Number(defaultQuantity) || 0;

    const productData = {
      ...rest,
      category: categoryDoc._id,
      stock: quantity,
      defaultQuantity: quantity,
      categorySlug: categoryDoc.slug,
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("createProduct error:", error);
    let message = "Product creation failed.";
    if (error.name === "ValidationError") {
      message = `Validation Failed: ${Object.values(error.errors).map(e => e.message).join(", ")}`;
    } else message = error.message;
    res.status(400).json({ success: false, message });
  }
};

// GET all products
export const getAllProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
    const skip = (page - 1) * limit;

    const filters = buildProductFilters(req.query);
    const hasTextSearch = Boolean(filters.$text);
    const projection = hasTextSearch ? { score: { $meta: "textScore" } } : {};
    const sort = getSortOption(req.query.sort, hasTextSearch);

    const [products, total, availableBrands, priceStats] = await Promise.all([
      Product.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .select({
          title: 1,
          slug: 1,
          price: 1,
          discountedPrice: 1,
          finalPrice: 1,
          images: 1,
          brand: 1,
          categorySlug: 1,
          tags: 1,
          stock: 1,
          ...projection,
        }),
      Product.countDocuments(filters),
      Product.distinct(
        "brand",
        buildProductFilters(req.query, { skipBrand: true, skipPrice: true, skipSearch: true })
      ),
      Product.aggregate([
        { $match: buildProductFilters(req.query, { skipPrice: true, skipSearch: true }) },
        { $group: { _id: null, min: { $min: "$finalPrice" }, max: { $max: "$finalPrice" } } },
      ]),
    ]);

    const priceRange = priceStats?.[0] || { min: 0, max: 0 };

    res.status(200).json({
      success: true,
      products,
      meta: {
        pagination: { page, limit, totalItems: total, totalPages: Math.ceil(total / limit) || 1 },
        availableFilters: { brands: availableBrands.filter(Boolean).sort(), price: priceRange },
        appliedFilters: {
          search: req.query.search || "",
          category: req.query.category || req.query.categorySlug || "",
          brand: req.query.brand || "",
          minPrice: req.query.minPrice || "",
          maxPrice: req.query.maxPrice || "",
          sort: req.query.sort || "newest",
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SEARCH products
export const searchProducts = async (req, res) => {
  try {
    const { q = "", limit = 8 } = req.query;
    const trimmedQuery = q.trim();
    if (!trimmedQuery) return res.status(200).json({ success: true, results: [] });

    const parsedLimit = Math.min(parseInt(limit, 10) || 8, 20);
    const results = await Product.find(
      { $text: { $search: trimmedQuery }, status: "published" },
      { score: { $meta: "textScore" }, title: 1, slug: 1, price: 1, discountedPrice: 1, finalPrice: 1, images: 1, brand: 1, categorySlug: 1 }
    )
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .limit(parsedLimit);

    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
