import Order from "../models/Order.js";
import cloudinary from "../src/config/cloudinary.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload folder exists
const uploadDir = path.join(__dirname, '../uploads/payment-proofs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Only JPEG, PNG, GIF allowed'), false);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Create order
export const createOrder = async (req, res) => {
  try {
    const orderData = JSON.parse(req.body.orderData);

    if (!orderData.customer || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ success: false, message: "Customer info and cart items are required." });
    }

    let paymentProofUrl = null;
    if (orderData.paymentMethod === "bank") {
      if (!req.file) return res.status(400).json({ success: false, message: "Payment proof required for bank transfer." });

      const uploadRes = await cloudinary.uploader.upload(req.file.path, { folder: "payment_proofs", resource_type: "image" });
      paymentProofUrl = uploadRes.secure_url;

      // delete local file
      fs.unlink(req.file.path, err => { if (err) console.error("Failed to delete local file:", err); });
    }

    const newOrder = await Order.create({ ...orderData, paymentProof: paymentProofUrl, status: "processing", createdAt: new Date() });

    return res.status(201).json({ success: true, message: "Order placed successfully.", orderId: newOrder._id, orderNumber: newOrder.orderNumber });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ success: false, message: "Failed to create order.", error: error.message });
  }
};

// --- Other APIs (getAllOrders, getOrderById, updateOrderStatus, deleteOrder, getOrderStats)
// Convert all `export const xxx` → `export const xxx` and replace `require` with `import` as above.
// The logic remains unchanged.

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter options
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod;
    }
    if (req.query.search) {
      filter.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { 'customer.email': { $regex: req.query.search, $options: 'i' } },
        { 'customer.phone': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items._id', 'title price images');

    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items._id', 'title price images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Update order status (for admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Delete order (for admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

// Get order statistics (for admin dashboard)
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const codOrders = await Order.countDocuments({ paymentMethod: 'cod' });
    const bankOrders = await Order.countDocuments({ paymentMethod: 'bank' });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        ordersByStatus: {
          processing: processingOrders,
          confirmed: confirmedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByPayment: {
          cod: codOrders,
          bank: bankOrders
        }
      }
    });

  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};

// --- In your orderController.js (Add this new function) ---

// Get orders by Customer Email (For user profile)
export const getOrdersByCustomerEmail = async (req, res) => {
  try {
      const email = req.query.email; // Expecting email as query parameter
      if (!email) {
          return res.status(400).json({
              success: false,
              message: 'Email query parameter is required.'
          });
      }
      
      // Pagination (optional, but good practice)
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Filter for customer email (case-insensitive search)
      const filter = {
          'customer.email': { $regex: email, $options: 'i' }
      };

      const orders = await Order.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      const totalOrders = await Order.countDocuments(filter);

      res.status(200).json({
          success: true,
          data: orders,
          pagination: {
              currentPage: page,
              totalPages: Math.ceil(totalOrders / limit),
              totalOrders,
              limit
          }
      });

  } catch (error) {
      console.error('Error fetching orders by email:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to fetch customer orders',
          error: error.message
      });
  }
};

// --- orderController.js file mein is function ko export karna na bhulein ---
// Example: export { createOrder, getAllOrders, getOrderById, ..., getOrdersByCustomerEmail };