const { Router } = require('express');
const addressController = require('../controllers/address.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = Router();

// Address management — /api/me/addresses (any authenticated user)
router.get('/addresses', auth, addressController.getMyAddresses);
router.post('/addresses', auth, addressController.addAddress);
router.delete('/addresses/:addressId', auth, addressController.removeAddress);

// Customer payment cards — /api/me/cards
router.get('/cards', auth, requireRole('customer'), addressController.getMyCards);
router.post('/cards', auth, requireRole('customer'), addressController.addCard);
router.delete('/cards/:cardId', auth, requireRole('customer'), addressController.removeCard);

module.exports = router;