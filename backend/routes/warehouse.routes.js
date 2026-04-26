const { Router } = require('express');
const warehouseController = require('../controllers/warehouse.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createWarehouseSchema, stockSchema, adjustStockSchema } = require('../schemas/warehouse.schema');

const router = Router();

router.get('/', auth, requireRole('staff'), warehouseController.getAllWarehouses);
router.get('/:id', auth, requireRole('staff'), warehouseController.getWarehouseById);
router.post('/', auth, requireRole('staff'), validate(createWarehouseSchema), warehouseController.createWarehouse);
router.patch('/:id', auth, requireRole('staff'), validate(createWarehouseSchema), warehouseController.updateWarehouse);
router.delete('/:id', auth, requireRole('staff'), warehouseController.deleteWarehouse);
router.put('/:id/stock', auth, requireRole('staff'), validate(stockSchema), warehouseController.setStock);
router.patch('/:id/stock', auth, requireRole('staff'), validate(adjustStockSchema), warehouseController.adjustStock);

module.exports = router;