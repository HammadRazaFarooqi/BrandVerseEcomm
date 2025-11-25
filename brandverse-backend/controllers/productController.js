const crypto = require("crypto");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User"); // You'll need to create this model
const Category = require("../models/Category");
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000"; // Fallback URL

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
    if (brands.length) {
      filters.brand = { $in: brands };
    }
  }

  if (tags) {
    const tagList = tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    if (tagList.length) {
      filters.tags = { $in: tagList };
    }
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

  if (isFeatured === "true") {
    filters.isFeatured = true;
  }

  if (isBestSeller === "true") {
    filters.isBestSeller = true;
  }

  if (inStock === "true") {
    filters.stock = { $gt: 0 };
  }

  if (search && !options.skipSearch) {
    filters.$text = { $search: search };
  }

  return filters;
};

const getSortOption = (sort, hasTextSearch = false) => {
  if (hasTextSearch) {
    return { score: { $meta: "textScore" }, createdAt: -1 };
  }

  switch (sort) {
    case "price-asc":
      return { finalPrice: 1 };
    case "price-desc":
      return { finalPrice: -1 };
    case "best-selling":
      return { totalSold: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { category, defaultQuantity, ...rest } = req.body;

    // Find category ObjectId by slug or name
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    // Ensure quantity is a number >= 0
    const quantity = Number(defaultQuantity) || 0;

    const productData = {
      ...rest,
      category: categoryDoc._id,
      stock: quantity,          // total stock
      defaultQuantity: quantity, // store quantity for reference
      categorySlug: categoryDoc.slug,
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("createProduct error", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
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
        {
          $group: {
            _id: null,
            min: { $min: "$finalPrice" },
            max: { $max: "$finalPrice" },
          },
        },
      ]),
    ]);

    const priceRange = priceStats?.[0] || { min: 0, max: 0 };

    res.status(200).json({
      success: true,
      products,
      meta: {
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit) || 1,
        },
        availableFilters: {
          brands: availableBrands.filter(Boolean).sort(),
          price: {
            min: priceRange.min ?? 0,
            max: priceRange.max ?? 0,
          },
        },
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

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate required environment variables

// exports.createCheckoutSession = async (req, res) => {
//   try {
//     const { customer, items, totalAmount } = req.body;

//     // Validate required fields
//     if (!customer || !items || !totalAmount) {
//       return res.status(400).json({
//         error: "Missing required fields",
//       });
//     }

//     // Find or create user in MongoDB
//     let user = await User.findOne({ email: customer.email });

//     if (!user) {
//       // Generate a temporary password and username for new users
//       const tempPassword = crypto.randomBytes(8).toString("hex");
//       const username =
//         customer.email.split("@")[0] +
//         "_" +
//         crypto.randomBytes(4).toString("hex");

      
//     // Return the checkout URL
//     return res.status(200).json({
//       url: session.url,
//       sessionId: session.id,
//     });
//   } catch (error) {
//     console.error("Checkout session creation failed:", error);
//     return res.status(500).json({
//       error: "Failed to create checkout session",
//       details: error.message,
//     });
//   }
// };
// Webhook to handle successful payments

exports.searchProducts = async (req, res) => {
  try {
    const { q = "", limit = 8 } = req.query;
    const trimmedQuery = q.trim();

    if (!trimmedQuery) {
      return res.status(200).json({ success: true, results: [] });
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 8, 20);

    const results = await Product.find(
      { $text: { $search: trimmedQuery }, status: "published" },
      {
        score: { $meta: "textScore" },
        title: 1,
        slug: 1,
        price: 1,
        discountedPrice: 1,
        finalPrice: 1,
        images: 1,
        brand: 1,
        categorySlug: 1,
      }
    )
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .limit(parsedLimit);

    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
