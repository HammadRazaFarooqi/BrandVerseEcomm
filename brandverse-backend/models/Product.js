const mongoose = require("mongoose");
const slugify = require("slugify");

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, trim: true },
    color: { type: String, trim: true, default: "NOCOLOR" },
    quantity: { type: Number, default: 0 },
    sku: { type: String, trim: true },
    price: { type: Number, min: 0 },
    image: { type: String, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountedPrice: {
      type: Number,
      min: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "PKR",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    // categorySlug: {
    //   type: String,
    //   trim: true,
    //   lowercase: true,
    // },
    brand: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: {
      primary: {
        type: String,
        required: true,
      },
      gallery: {
        type: [String],
        default: [],
      },
    },
    availableSizes: {
      type: [variantSchema],
      default: [],
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    totalSold: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (!this.discountedPrice || this.discountedPrice > this.price) {
    this.discountedPrice = undefined;
    this.discountRate = 0;
  }

  this.finalPrice = this.discountedPrice ?? this.price;
  next();
});

productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};
  const set = update.$set || {};

  const incomingTitle = set.title ?? update.title;
  if (incomingTitle && !set.slug && !update.slug) {
    set.slug = slugify(incomingTitle, { lower: true, strict: true });
  }

  const priceSource =
    set.discountedPrice ??
    update.discountedPrice ??
    set.price ??
    update.price;

  if (priceSource !== undefined) {
    set.finalPrice =
      set.discountedPrice ?? update.discountedPrice ?? set.price ?? update.price ?? priceSource;
  }

  update.$set = set;
  this.setUpdate(update);
  next();
});

productSchema.index(
  {
    title: "text",
    description: "text",
    brand: "text",
    tags: "text",
  },
  {
    weights: { title: 5, brand: 3, tags: 3, description: 1 },
    name: "product_text_index",
  }
);
// productSchema.index({ slug: 1 });
// productSchema.index({ categorySlug: 1 });
productSchema.index({ finalPrice: 1 });

module.exports = mongoose.model("Product", productSchema);
