const { Router } = require('express');
const addressController = require('../controllers/address.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { addressSchema, cardSchema } = require('../schemas/address.schema');

const router = Router();

router.get('/addresses', auth, requireRole('customer'), addressController.getMyAddresses);
router.post('/addresses', auth, requireRole('customer'), validate(addressSchema), addressController.addAddress);
router.delete('/addresses/:addressId', auth, requireRole('customer'), addressController.removeAddress);

router.get('/cards', auth, requireRole('customer'), addressController.getMyCards);
router.post('/cards', auth, requireRole('customer'), validate(cardSchema), addressController.addCard);
router.delete('/cards/:cardId', auth, requireRole('customer'), addressController.removeCard);

module.exports = router;