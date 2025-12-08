import Order from "../models/Order.js";
import cloudinary from "../src/config/cloudinary.js";
import multer from "multer";
import { orderStatusEmailTemplate, adminOrderNotificationTemplate, orderConfirmationTemplate } from "../src/utils/emailTemplates.js";
import { connectDB } from "../lib/db.js";
import { sendMail } from "../src/utils/mailer.js";

// MEMORY STORAGE (Required for Vercel / Serverless)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Invalid image type"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ---------------- CREATE ORDER -------------------
export const createOrder = async (req, res) => {
  try {
    await connectDB();
    
    // Parse incoming JSON string from FormData
    const orderData = JSON.parse(req.body.orderData);
    
    if (!orderData.customer || !orderData.items?.length) {
      return res.status(400).json({
        success: false,
        message: "Customer info and cart items are required",
      });
    }

    let paymentProofUrl = null;
    
    // Only handle payment proof if payment method is bank
    if (orderData.paymentMethod === "bank" && req.file) {
      // Upload directly to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "payment_proofs",
            resource_type: "image",
          },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      paymentProofUrl = uploadResult.secure_url;
    }

    // Save order to MongoDB
    const newOrder = await Order.create({
      ...orderData,
      paymentProof: paymentProofUrl,
      status: "processing",
      createdAt: new Date(),
    });
    // Email sending promises
    const emailPromises = [];

    // ✅ Send order confirmation email to CUSTOMER
    const customerEmailPromise = sendMail({
      to: orderData.customer.email,
      subject: "Order Confirmation - Affi Mall",
      html: orderConfirmationTemplate(
        orderData.customer.firstName,
        newOrder._id,
        newOrder.orderNumber,
        orderData.items,
        orderData.totalAmount,
        orderData.paymentMethod
      ),
    })
      .then(() => {
        return { type: 'customer', success: true };
      })
      .catch((error) => {
        console.error("❌ Customer email failed:", error.message);
        return { type: 'customer', success: false, error: error.message };
      });

    emailPromises.push(customerEmailPromise);

    // ✅ Send order notification email to ADMIN
    const adminEmailPromise = sendMail({
      to: "affimall50@gmail.com",
      subject: `New Order Received - #${newOrder.orderNumber}`,
      html: adminOrderNotificationTemplate(
        newOrder._id,
        newOrder.orderNumber,
        orderData.customer,
        orderData.items,
        orderData.totalAmount,
        orderData.paymentMethod,
        paymentProofUrl
      ),
    })
      .then(() => {
        return { type: 'admin', success: true };
      })
      .catch((error) => {
        console.error("❌ Admin email failed:", error.message);
        console.error("Full admin email error:", error);
        return { type: 'admin', success: false, error: error.message };
      });

    emailPromises.push(adminEmailPromise);

    // Wait for all emails to complete (but don't fail the order if emails fail)
    const emailResults = await Promise.allSettled(emailPromises);
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      emailStatus: {
        customer: emailResults[0]?.value?.success || false,
        admin: emailResults[1]?.value?.success || false,
      }
    });
    
  } catch (error) {
    console.error("❌ Order creation failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};
// --- Other APIs ---

export const getAllOrders = async (req, res) => {
  try {
    await connectDB();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("items._id", "title price images");

    res.status(200).json({
      success: true,
      data: orders,
      message: "Orders fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    await connectDB();
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

export const updateOrderStatus = async (req, res) => {
  try {
    await connectDB();
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
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // ✅ Send status update email to customer
    try {
      await sendMail({
        to: order.customer.email,
        subject: `Order Status Update - ${order.orderNumber}`,
        html: orderStatusEmailTemplate(
          order.customer.firstName,
          order.orderNumber,
          status.charAt(0).toUpperCase() + status.slice(1) // Capitalize first letter
        ),
      });
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
      // Don't fail the status update if email fails - just log it
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
    await connectDB();
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
    await connectDB();
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

// Get orders by Customer Email (For user profile)
export const getOrdersByCustomerEmail = async (req, res) => {
  try {
    await connectDB();
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