const { Router } = require('express');
const addressController = require('../controllers/address.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = Router();

// Customer address management — /api/me/addresses
router.get('/addresses', auth, requireRole('customer'), addressController.getMyAddresses);
router.post('/addresses', auth, requireRole('customer'), addressController.addAddress);
router.delete('/addresses/:addressId', auth, requireRole('customer'), addressController.removeAddress);

// Customer payment cards — /api/me/cards
router.get('/cards', auth, requireRole('customer'), addressController.getMyCards);
router.post('/cards', auth, requireRole('customer'), addressController.addCard);
router.delete('/cards/:cardId', auth, requireRole('customer'), addressController.removeCard);

module.exports = router;