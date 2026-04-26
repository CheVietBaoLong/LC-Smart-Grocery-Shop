const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerCustomerSchema, registerStaffSchema, loginSchema } = require('../schemas/auth.schema');

const router = Router();

router.post('/register/customer', validate(registerCustomerSchema), authController.registerCustomer);
router.post('/register/staff', auth, requireRole('staff'), validate(registerStaffSchema), authController.registerStaff);
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;