const { Router } = require('express');
const supplierController = require('../controllers/supplier.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createSupplierSchema, updateSupplierSchema, addSupplySchema } = require('../schemas/supplier.schema');

const router = Router();

router.get('/', auth, requireRole('staff'), supplierController.getAllSuppliers);
router.get('/:id', auth, requireRole('staff'), supplierController.getSupplierById);
router.post('/', auth, requireRole('staff'), validate(createSupplierSchema), supplierController.createSupplier);
router.patch('/:id', auth, requireRole('staff'), validate(updateSupplierSchema), supplierController.updateSupplier);
router.delete('/:id', auth, requireRole('staff'), supplierController.deleteSupplier);
router.post('/:id/supplies', auth, requireRole('staff'), validate(addSupplySchema), supplierController.addSupply);
router.get('/product/:productId/supplies', auth, requireRole('staff'), supplierController.getSuppliesByProduct);

module.exports = router;