const express = require('express');
const grievanceController = require('../controllers/grievance.controller');
const commentController = require('../controllers/comment.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

// Grievance listings and submission
router.post('/', authenticate, grievanceController.createGrievance);
router.get('/', authenticate, grievanceController.getAllGrievances);
router.get('/my', authenticate, grievanceController.getMyGrievances);

// Individual grievance operations
router.get('/:id', authenticate, grievanceController.getGrievanceById);
router.put('/:id', authenticate, grievanceController.updateGrievance);

// Status transition and officer assignment
router.patch('/:id/status', authenticate, authorize(ROLES.OFFICER, ROLES.ADMIN), grievanceController.updateStatus);
router.put('/:id/status', authenticate, authorize(ROLES.OFFICER, ROLES.ADMIN), grievanceController.updateStatus);
router.patch('/:id/assign', authenticate, authorize(ROLES.OFFICER, ROLES.ADMIN), grievanceController.assignOfficer);
router.put('/:id/assign', authenticate, authorize(ROLES.OFFICER, ROLES.ADMIN), grievanceController.assignOfficer);

// Audit history timeline
router.get('/:id/history', authenticate, grievanceController.getStatusHistory);

// Nested comments for grievance
router.post('/:grievanceId/comments', authenticate, commentController.addComment);
router.get('/:grievanceId/comments', authenticate, commentController.getComments);

module.exports = router;
