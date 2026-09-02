const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

// Current user profile & password
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/change-password', authenticate, userController.changePassword);

// Admin-only user management
router.get('/', authenticate, authorize(ROLES.ADMIN), userController.getUsers);
router.post('/', authenticate, authorize(ROLES.ADMIN), userController.createUser);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), userController.updateUser);

module.exports = router;
