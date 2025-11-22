const assignmentService = require('../services/assignment.service');
const { successResponse } = require('../utils/response.util');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

/**
 * Trigger Lead Distribution
 * POST /api/admin/assignments/distribute
 */
const triggerDistribution = asyncHandler(async (req, res) => {
  const result = await assignmentService.distributeLeads();
  return successResponse(res, result, 'Leads distributed successfully');
});

module.exports = {
  triggerDistribution,
};
