const { Router } = require('express');
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = Router();

// GET /api/users          — staff only
router.get('/', auth, requireRole('staff'), userController.getAllUsers);

// GET /api/users/:id      — staff or owner (ownership checked in service)
router.get('/:id', auth, userController.getUserById);

// PATCH /api/users/:id    — staff or owner (ownership checked in service)
router.patch('/:id', auth, userController.updateUser);

// DELETE /api/users/:id   — staff only
router.delete('/:id', auth, requireRole('staff'), userController.deleteUser);

module.exports = router;