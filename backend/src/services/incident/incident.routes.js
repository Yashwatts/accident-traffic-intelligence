import express from 'express';
import {
  createIncidentController,
  getIncidentsController,
  getNearbyIncidentsController,
  getIncidentByIdController,
  updateIncidentController,
  deleteIncidentController,
  verifyIncidentController,
  updateIncidentStatusController,
  resolveIncidentController,
} from './incident.controller.js';
import { validate, incidentSchemas } from '../../middleware/validation.js';
import { optionalAuth, requireAuth, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// Apply optional auth to all routes (adds user to request if authenticated)
router.use(optionalAuth);

/**
 * @route   GET /api/v1/incidents/nearby
 * @desc    Get nearby incidents
 * @access  Public
 */
router.get('/nearby', getNearbyIncidentsController);

/**
 * @route   GET /api/v1/incidents
 * @desc    Get all incidents with filters
 * @access  Public
 */
router.get('/', getIncidentsController);

/**
 * @route   POST /api/v1/incidents
 * @desc    Create new incident
 * @access  Private
 */
router.post('/', requireAuth, validate(incidentSchemas.create), createIncidentController);

/**
 * @route   GET /api/v1/incidents/:id
 * @desc    Get incident by ID
 * @access  Public
 */
router.get('/:id', getIncidentByIdController);

/**
 * @route   PUT /api/v1/incidents/:id
 * @desc    Update incident
 * @access  Private (Owner)
 */
router.put('/:id', requireAuth, validate(incidentSchemas.update), updateIncidentController);

/**
 * @route   DELETE /api/v1/incidents/:id
 * @desc    Delete incident
 * @access  Private (Owner)
 */
router.delete('/:id', requireAuth, deleteIncidentController);

/**
 * @route   POST /api/v1/incidents/:id/verify
 * @desc    Verify incident (admin/responder)
 * @access  Private (Admin/Responder)
 */
router.post('/:id/verify', requireAuth, requireRole('admin', 'responder'), verifyIncidentController);

/**
 * @route   PATCH /api/v1/incidents/:id/status
 * @desc    Update incident status (admin/responder)
 * @access  Private (Admin/Responder)
 */
router.patch('/:id/status', requireAuth, requireRole('admin', 'responder'), updateIncidentStatusController);

/**
 * @route   POST /api/v1/incidents/:id/resolve
 * @desc    Resolve incident (admin/responder)
 * @access  Private (Admin/Responder)
 */
router.post('/:id/resolve', requireAuth, requireRole('admin', 'responder'), resolveIncidentController);

export default router;
