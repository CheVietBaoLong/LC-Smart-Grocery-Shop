const { Router } = require('express');
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateUserSchema } = require('../schemas/user.schema');

const router = Router();

router.get('/', auth, requireRole('staff'), userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);
router.patch('/:id', auth, validate(updateUserSchema), userController.updateUser);
router.delete('/:id', auth, requireRole('staff'), userController.deleteUser);

router.post('/deposit', auth, requireRole('customer'), userController.deposit);

module.exports = router;