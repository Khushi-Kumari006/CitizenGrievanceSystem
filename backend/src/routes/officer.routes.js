const express = require('express');
const officerController = require('../controllers/officer.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(ROLES.OFFICER, ROLES.ADMIN));

router.get('/dashboard', officerController.getDashboard);
router.get('/grievances', officerController.getAssignedGrievances);

module.exports = router;
