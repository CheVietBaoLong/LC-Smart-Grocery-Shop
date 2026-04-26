const { Router } = require('express');
const warehouseController = require('../controllers/warehouse.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = Router();

// All warehouse routes are staff only
router.get('/', auth, requireRole('staff'), warehouseController.getAllWarehouses);
router.get('/:id', auth, requireRole('staff'), warehouseController.getWarehouseById);
router.post('/', auth, requireRole('staff'), warehouseController.createWarehouse);
router.patch('/:id', auth, requireRole('staff'), warehouseController.updateWarehouse);
router.delete('/:id', auth, requireRole('staff'), warehouseController.deleteWarehouse);

// Stock management
router.put('/:id/stock', auth, requireRole('staff'), warehouseController.setStock);
router.patch('/:id/stock', auth, requireRole('staff'), warehouseController.adjustStock);

module.exports = router;