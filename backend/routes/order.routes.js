const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createOrderSchema, updateStatusSchema } = require('../schemas/order.schema');

const router = Router();

router.get('/my', auth, requireRole('customer'), orderController.getMyOrders);
router.get('/', auth, requireRole('staff'), orderController.getAllOrders);
router.get('/:id', auth, orderController.getOrderById);
router.post('/', auth, requireRole('customer'), validate(createOrderSchema), orderController.createOrder);
router.patch('/:id/status', auth, requireRole('staff'), validate(updateStatusSchema), orderController.updateOrderStatus);
router.patch('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;