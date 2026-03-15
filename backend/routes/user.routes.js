const router = require('express').Router();
const {
  getUsers,
  getUserById,
  createStaff,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createStaffSchema } = require('../validators/auth.validator');

// Admin creates staff or supervisor directly
router.post('/create-staff', protect, authorize('admin'), validate(createStaffSchema), createStaff);

// Get all users (with filters)
router.get('/', protect, authorize('admin', 'supervisor'), getUsers);

// Get single user full profile
router.get('/:id', protect, authorize('admin'), getUserById);

// Update user role/department/status
router.put('/:id', protect, authorize('admin'), updateUser);

// Deactivate user
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;