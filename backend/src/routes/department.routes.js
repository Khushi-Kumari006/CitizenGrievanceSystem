const express = require('express');
const departmentController = require('../controllers/department.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

// Public / Read access to departments
router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Admin-only management routes
router.post('/', authenticate, authorize(ROLES.ADMIN), departmentController.createDepartment);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), departmentController.updateDepartment);

module.exports = router;
