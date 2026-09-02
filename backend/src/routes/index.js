const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const departmentRoutes = require('./department.routes');
const categoryRoutes = require('./category.routes');
const userRoutes = require('./user.routes');
const grievanceRoutes = require('./grievance.routes');
const officerRoutes = require('./officer.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

// Mount Health check routes
router.use('/health', healthRoutes);

// Mount Authentication routes
router.use('/auth', authRoutes);

// Mount Department routes
router.use('/departments', departmentRoutes);

// Mount Grievance Category routes
router.use('/categories', categoryRoutes);

// Mount User Management routes
router.use('/users', userRoutes);

// Mount Grievance routes (includes comments & status history)
router.use('/grievances', grievanceRoutes);

// Mount Officer specific routes
router.use('/officer', officerRoutes);

// Mount Admin specific routes
router.use('/admin', adminRoutes);

module.exports = router;
