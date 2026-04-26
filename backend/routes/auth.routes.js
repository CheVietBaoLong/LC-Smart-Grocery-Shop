const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

// POST /api/auth/registerCustomer
router.post('/register/customer', authController.registerCustomer);


// POST /api/auth/registerStaff
router.post('/register/staff', authController.registerStaff);


// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;