import * as incidentService from './incident.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { getIO } from '../../websocket/index.js';

/**
 * Create new incident
 * POST /api/v1/incidents
 */
export const createIncidentController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const incident = await incidentService.createIncident(req.body, userId);

    // Emit socket event for new incident to all admins
    // Admins will see only incidents from their state when they query
    const io = getIO();
    io.to('admin').emit('incident:created', {
      incident,
      message: 'New incident reported',
      type: 'incident_created',
      state: incident.state
    });

    return ApiResponse.created(res, incident, 'Incident reported successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all incidents with filters
 * GET /api/v1/incidents
 */
export const getIncidentsController = async (req, res, next) => {
  try {
    // If user is admin, filter by their assigned state
    const options = { ...req.query };
    
    if (req.user?.role === 'admin' && req.user?.adminInfo?.assignedState) {
      options.state = req.user.adminInfo.assignedState;
    }
    
    // If reportedBy is specified, use it (for citizen filtering)
    if (req.query.reportedBy) {
      options.reportedBy = req.query.reportedBy;
    }

    const result = await incidentService.getIncidents({}, options);

    return ApiResponse.success(res, result, 'Incidents retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get nearby incidents
 * GET /api/v1/incidents/nearby
 */
export const getNearbyIncidentsController = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      throw ApiError.badRequest('Latitude and longitude are required');
    }

    const incidents = await incidentService.getNearbyIncidents(
      lat,
      lng,
      radius,
      req.query
    );

    return ApiResponse.success(res, incidents, 'Nearby incidents retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get incident by ID
 * GET /api/v1/incidents/:id
 */
export const getIncidentByIdController = async (req, res, next) => {
  try {
    const incident = await incidentService.getIncidentById(req.params.id);

    return ApiResponse.success(res, incident, 'Incident retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update incident
 * PUT /api/v1/incidents/:id
 */
export const updateIncidentController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const incident = await incidentService.updateIncident(
      req.params.id,
      req.body,
      userId
    );

    return ApiResponse.success(res, incident, 'Incident updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete incident
 * DELETE /api/v1/incidents/:id
 */
export const deleteIncidentController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const result = await incidentService.deleteIncident(req.params.id, userId);

    return ApiResponse.success(res, result, 'Incident deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Verify incident
 * POST /api/v1/incidents/:id/verify
 */
export const verifyIncidentController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const incident = await incidentService.verifyIncident(req.params.id, userId);

    // Populate reportedBy to get reporter details
    await incident.populate('reportedBy', 'firstName lastName email');

    // Emit socket event to the reporter
    const io = getIO();
    if (incident.reportedBy && incident.reportedBy._id) {
      io.to(`user:${incident.reportedBy._id}`).emit('incident:verified', {
        incident,
        message: 'Your incident has been verified',
        type: 'incident_verified'
      });
    }

    return ApiResponse.success(res, incident, 'Incident verified successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update incident status
 * PATCH /api/v1/incidents/:id/status
 */
export const updateIncidentStatusController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { status, notes } = req.body;
    const incident = await incidentService.updateIncidentStatus(
      req.params.id,
      { status, notes },
      userId,
      userRole
    );

    return ApiResponse.success(res, incident, 'Incident status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve incident
 * POST /api/v1/incidents/:id/resolve
 */
export const resolveIncidentController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { notes } = req.body;
    const incident = await incidentService.resolveIncident(req.params.id, userId, notes);

    // Populate reportedBy to get reporter details
    await incident.populate('reportedBy', 'firstName lastName email');

    // Emit socket event to the reporter
    const io = getIO();
    if (incident.reportedBy && incident.reportedBy._id) {
      io.to(`user:${incident.reportedBy._id}`).emit('incident:resolved', {
        incident,
        message: 'Your incident has been resolved',
        type: 'incident_resolved'
      });
    }

    return ApiResponse.success(res, incident, 'Incident resolved successfully');
  } catch (error) {
    next(error);
  }
};
