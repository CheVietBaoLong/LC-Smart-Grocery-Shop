const { Router } = require('express');
const productController = require('../controllers/product.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = Router();

// Public — anyone can browse products
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/price', productController.getCurrentPrice);
router.get('/:id/price/history', productController.getPriceHistory);

// Staff only — product management
router.post('/', auth, requireRole('staff'), productController.createProduct);
router.patch('/:id', auth, requireRole('staff'), productController.updateProduct);
router.delete('/:id', auth, requireRole('staff'), productController.deleteProduct);
router.post('/:id/price', auth, requireRole('staff'), productController.setNewPrice);

module.exports = router;