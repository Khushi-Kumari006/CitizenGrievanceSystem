const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

// Public / Read access to categories
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-only management routes
router.post('/', authenticate, authorize(ROLES.ADMIN), categoryController.createCategory);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), categoryController.updateCategory);

module.exports = router;
