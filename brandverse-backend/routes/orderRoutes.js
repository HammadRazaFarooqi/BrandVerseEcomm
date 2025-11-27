// --- routes/orderRoutes.js (Final Fix) ---

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/checkout', orderController.upload.single('paymentProof'), orderController.createOrder);

// 1. Static Route (Get by Email) - Pehle aana chahiye
router.get('/customer', orderController.getOrdersByCustomerEmail);

// Admin routes (Inmein /admin/ prefix hai, isliye koi conflict nahi hai)
router.get('/admin/orders', orderController.getAllOrders);
router.get('/admin/orders/stats', orderController.getOrderStats);
router.put('/admin/orders/:id/status', orderController.updateOrderStatus);
router.delete('/admin/orders/:id', orderController.deleteOrder);

// 2. Parameter Route (Get by ID) - Hamesha neeche aana chahiye
router.get('/:id', orderController.getOrderById); // Assuming base path is /api/order

module.exports = router;