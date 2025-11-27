// --- routes/orderRoutes.js ---
import express from "express";
import {
  upload,
  createOrder,
  getOrdersByCustomerEmail,
  getAllOrders,
  getOrderStats,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
} from "../controllers/orderController.js";

const router = express.Router();

// CHECKOUT (multipart/form-data)
router.post("/checkout", upload.single("paymentProof"), createOrder);

// Static routes FIRST
router.get("/customer", getOrdersByCustomerEmail);

// Admin routes
router.get("/admin/orders", getAllOrders);
router.get("/admin/orders/stats", getOrderStats);
router.put("/admin/orders/:id/status", updateOrderStatus);
router.delete("/admin/orders/:id", deleteOrder);

// Parameter routes LAST
router.get("/:id", getOrderById);

export default router;
