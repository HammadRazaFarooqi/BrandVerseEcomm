import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true }
    }
  },
  items: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    images: [String],
    selectedSize: { type: String, default: null },
    quantity: { type: Number, required: true, default: 1 }
  }],
  paymentMethod: { type: String, enum: ['cod', 'bank'], required: true, default: 'cod' },
  paymentProof: { type: String, default: null }, // URL from Cloudinary
  status: { type: String, enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  totalAmount: { type: Number, required: true },
  orderNumber: { type: String, unique: true }
}, { timestamps: true });

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const random = Math.floor(Math.random() * 9000 + 1000); // 4-digit random
    this.orderNumber = `ORD-${Date.now()}-${random}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
