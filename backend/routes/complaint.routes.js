/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Complaint management
 */

/**
 * @swagger
 * /complaints:
 *   get:
 *     summary: Get all complaints (filtered by role)
 *     tags: [Complaints]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, assigned, in_progress, resolved, rejected, escalated] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: priority
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of complaints }
 *
 *   post:
 *     summary: Create a new complaint (citizen only)
 *     tags: [Complaints]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, category, latitude, longitude]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               priority: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               address: { type: string }
 *               images: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       201: { description: Complaint created }
 *
 * /complaints/check-duplicate:
 *   post:
 *     summary: Check for duplicate complaints nearby
 *     tags: [Complaints]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               category: { type: string }
 *     responses:
 *       200: { description: Duplicate check result }
 *
 * /complaints/{id}:
 *   get:
 *     summary: Get complaint by ID with timeline
 *     tags: [Complaints]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Complaint details with status logs }
 *       404: { description: Complaint not found }
 *
 * /complaints/{id}/status:
 *   put:
 *     summary: Update complaint status (staff/admin)
 *     tags: [Complaints]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *               note: { type: string }
 *               assignedTo: { type: string }
 *               beforeImage: { type: string, format: binary }
 *               afterImage: { type: string, format: binary }
 *     responses:
 *       200: { description: Status updated }
 *
 * /complaints/{id}/support:
 *   post:
 *     summary: Support an existing complaint (citizen)
 *     tags: [Complaints]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Supported successfully }
 *
 * /complaints/map:
 *   get:
 *     summary: Get all complaints for map display
 *     tags: [Complaints]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Complaints with coordinates }
 */

const router = require('express').Router();
const {
  createComplaint, getComplaints, getComplaintById,
  updateComplaintStatus, supportComplaint, getMapComplaints,
  checkDuplicate, deleteComplaint,
} = require('../controllers/complaint.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/map', protect, getMapComplaints);
router.post('/check-duplicate', protect, checkDuplicate);
router.get('/', protect, getComplaints);
router.post('/', protect, authorize('citizen'), upload.array('images', 5), createComplaint);
router.get('/:id', protect, getComplaintById);
router.put('/:id/status', protect, authorize('staff', 'supervisor', 'admin'),
  upload.fields([{ name: 'beforeImage', maxCount: 1 }, { name: 'afterImage', maxCount: 1 }]),
  updateComplaintStatus);
router.post('/:id/support', protect, authorize('citizen'), supportComplaint);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
