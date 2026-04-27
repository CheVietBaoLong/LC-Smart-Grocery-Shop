const { Router } = require('express');
const productController = require('../controllers/product.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProductSchema, updateProductSchema, setPriceSchema } = require('../schemas/product.schema');

const router = Router();

// Public
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/price', productController.getCurrentPrice);
router.get('/:id/price/history', productController.getPriceHistory);

// Staff only
router.post('/', auth, requireRole('staff'), validate(createProductSchema), productController.createProduct);
router.patch('/:id', auth, requireRole('staff'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', auth, requireRole('staff'), productController.deleteProduct);
router.post('/:id/price', auth, requireRole('staff'), validate(setPriceSchema), productController.setNewPrice);

module.exports = router;