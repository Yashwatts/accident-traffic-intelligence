import { Incident } from './incident.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

/**
 * Create a new incident
 */
export const createIncident = async (incidentData, userId) => {
  const incident = new Incident({
    ...incidentData,
    reportedBy: userId,
    status: 'pending',
  });

  await incident.save();

  logger.info('Incident created', {
    incidentId: incident._id,
    type: incident.type,
    userId,
  });

  return incident;
};

/**
 * Get incidents with filters and pagination
 */
export const getIncidents = async (filters = {}, options = {}) => {
  const {
    type,
    severity,
    status,
    limit = 10,
    page = 1,
    sortBy = '-createdAt',
  } = options;

  const query = {};

  if (type && type !== 'all') query.type = type;
  if (severity && severity !== 'all') query.severity = severity;
  if (status && status !== 'all') query.status = status;

  const skip = (page - 1) * limit;

  const [incidents, total] = await Promise.all([
    Incident.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reportedBy', 'firstName lastName email')
      .lean(),
    Incident.countDocuments(query),
  ]);

  return {
    incidents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get nearby incidents using geospatial query
 */
export const getNearbyIncidents = async (lat, lng, radius = 10, filters = {}) => {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: radius * 1000, // Convert km to meters
      },
    },
  };

  if (filters.type && filters.type !== 'all') query.type = filters.type;
  if (filters.severity && filters.severity !== 'all') query.severity = filters.severity;
  if (filters.status && filters.status !== 'all') query.status = filters.status;

  const incidents = await Incident.find(query)
    .limit(100)
    .populate('reportedBy', 'firstName lastName')
    .lean();

  return incidents;
};

/**
 * Get incident by ID
 */
export const getIncidentById = async (incidentId) => {
  const incident = await Incident.findById(incidentId)
    .populate('reportedBy', 'firstName lastName email phoneNumber')
    .populate('verifiedBy', 'firstName lastName');

  if (!incident) {
    throw ApiError.notFound('Incident not found');
  }

  return incident;
};

/**
 * Update incident
 */
export const updateIncident = async (incidentId, updateData, userId) => {
  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw ApiError.notFound('Incident not found');
  }

  // Only allow owner or admin to update
  if (incident.reportedBy.toString() !== userId) {
    throw ApiError.forbidden('Not authorized to update this incident');
  }

  Object.assign(incident, updateData);
  incident.updateCount += 1;
  await incident.save();

  logger.info('Incident updated', {
    incidentId: incident._id,
    userId,
  });

  return incident;
};

/**
 * Delete incident
 */
export const deleteIncident = async (incidentId, userId) => {
  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw ApiError.notFound('Incident not found');
  }

  // Only allow owner or admin to delete
  if (incident.reportedBy.toString() !== userId) {
    throw ApiError.forbidden('Not authorized to delete this incident');
  }

  await incident.deleteOne();

  logger.info('Incident deleted', {
    incidentId,
    userId,
  });

  return { message: 'Incident deleted successfully' };
};

/**
 * Verify incident (admin/responder only)
 */
export const verifyIncident = async (incidentId, userId) => {
  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw ApiError.notFound('Incident not found');
  }

  incident.verified = true;
  incident.verifiedBy = userId;
  incident.verifiedAt = new Date();
  incident.status = 'active';
  await incident.save();

  logger.info('Incident verified', {
    incidentId,
    userId,
  });

  return incident;
};

/**
 * Resolve incident (admin/responder only)
 */
export const resolveIncident = async (incidentId, userId, notes) => {
  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw ApiError.notFound('Incident not found');
  }

  incident.status = 'resolved';
  incident.resolvedBy = userId;
  incident.resolvedAt = new Date();
  if (notes) {
    incident.resolutionNotes = notes;
  }
  await incident.save();

  logger.info('Incident resolved', {
    incidentId,
    userId,
  });

  return incident;
};
