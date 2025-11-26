const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/checkout', orderController.upload.single('paymentProof'), orderController.createOrder);


router.get('/order/:id', orderController.getOrderById);

// Admin routes
router.get('/admin/orders', orderController.getAllOrders);
router.get('/admin/orders/stats', orderController.getOrderStats);
router.put('/admin/orders/:id/status', orderController.updateOrderStatus);
router.delete('/admin/orders/:id', orderController.deleteOrder);

module.exports = router;
