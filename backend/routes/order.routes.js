const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = Router();

// GET /api/orders/my      — customer: get own orders
router.get('/my', auth, requireRole('customer'), orderController.getMyOrders);

// GET /api/orders         — staff only: see all orders
router.get('/', auth, requireRole('staff'), orderController.getAllOrders);

// GET /api/orders/:id     — staff or order owner (ownership checked in service)
router.get('/:id', auth, orderController.getOrderById);

// POST /api/orders        — customer only: place order
router.post('/', auth, requireRole('customer'), orderController.createOrder);

// PATCH /api/orders/:id/status  — staff only: update order status
router.patch('/:id/status', auth, requireRole('staff'), orderController.updateOrderStatus);

// PATCH /api/orders/:id/cancel  — customer or staff: cancel order
router.patch('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;