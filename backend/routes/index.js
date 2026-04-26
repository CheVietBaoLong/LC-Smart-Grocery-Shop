const { Router } = require('express');

const authRoutes      = require('./auth.routes');
const userRoutes      = require('./user.routes');
const productRoutes   = require('./product.routes');
const orderRoutes     = require('./order.routes');
const warehouseRoutes = require('./warehouse.routes');
const supplierRoutes  = require('./supplier.routes');
const meRoutes        = require('./me.routes');
const router = Router();

router.use('/auth',       authRoutes);
router.use('/users',      userRoutes);
router.use('/products',   productRoutes);
router.use('/orders',     orderRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/suppliers',  supplierRoutes);
router.use('/me',         meRoutes);

module.exports = router;