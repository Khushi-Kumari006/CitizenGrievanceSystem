const CommentService = require('../services/comment.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Handle POST /api/grievances/:grievanceId/comments
 */
async function addComment(req, res, next) {
  try {
    const grievanceId = parseInt(req.params.grievanceId, 10);
    const comment = await CommentService.addComment(grievanceId, req.body, req.user);
    return successResponse(res, 'Comment added successfully', { comment }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/grievances/:grievanceId/comments
 */
async function getComments(req, res, next) {
  try {
    const grievanceId = parseInt(req.params.grievanceId, 10);
    const comments = await CommentService.getCommentsByGrievanceId(grievanceId, req.user);
    return successResponse(res, 'Comments retrieved successfully', { comments });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addComment,
  getComments,
};
