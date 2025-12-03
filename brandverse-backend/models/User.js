import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const addressSchema = new Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: { type: String, default: "US" },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new Schema({
  username: { type: String, trim: true },
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: String,
  addresses: [addressSchema],
  role: { type: String, enum: ["user", "admin"], default: "user" },
  cart: [{ productId: { type: Schema.Types.ObjectId, ref: "Product" }, quantity: { type: Number, default: 1 } }],
  orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  otp: {
    code: String,
    expiresAt: Date,
  },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  passwordReset: {
    token: { type: String },
    expiresAt: { type: Date }
  },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date }
});

// Update timestamps
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Full name virtual
userSchema.virtual("fullName").get(function () {
  return this.firstName && this.lastName ? `${this.firstName} ${this.lastName}` : this.username;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export default mongoose.model("User", userSchema);
