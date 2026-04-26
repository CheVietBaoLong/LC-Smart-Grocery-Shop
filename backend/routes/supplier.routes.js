const { Router } = require('express');
const supplierController = require('../controllers/supplier.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = Router();

// All supplier routes are staff only
router.get('/', auth, requireRole('staff'), supplierController.getAllSuppliers);
router.get('/:id', auth, requireRole('staff'), supplierController.getSupplierById);
router.post('/', auth, requireRole('staff'), supplierController.createSupplier);
router.patch('/:id', auth, requireRole('staff'), supplierController.updateSupplier);
router.delete('/:id', auth, requireRole('staff'), supplierController.deleteSupplier);

// Supply relationships
router.post('/:id/supplies', auth, requireRole('staff'), supplierController.addSupply);
router.get('/product/:productId/supplies', auth, requireRole('staff'), supplierController.getSuppliesByProduct);

module.exports = router;