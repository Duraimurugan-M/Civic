/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: John Doe }
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: "Pass@123" }
 *               aadhaarNumber: { type: string }
 *               role: { type: string, enum: [citizen, staff, supervisor, admin] }
 *     responses:
 *       201: { description: Registration successful }
 *       400: { description: Email already registered }
 *
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 *
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Current user data }
 *
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out }
 */

const router = require('express').Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updateFullProfile,
  changePassword,
} = require('../controllers/auth.controller');
const { protect }  = require('../middleware/auth');
const validate     = require('../middleware/validate');
const upload       = require('../middleware/upload');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

router.post('/register',       validate(registerSchema), register);
router.post('/login',          validate(loginSchema),    login);
router.post('/logout',         logout);
router.get ('/me',             protect, getMe);
router.put ('/profile',        protect, upload.single('avatar'), updateProfile);
router.put ('/full-profile',   protect, upload.single('avatar'), updateFullProfile);
router.put ('/change-password',protect, changePassword);

module.exports = router;