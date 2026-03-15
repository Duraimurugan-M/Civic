require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const { reminderJob, escalateJob } = require('./jobs/reminder.job');

const app = express();

// Connect DB
connectDB();

// Security
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 20000, message: 'Too many requests' }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'CivicConnect API' }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/feedback', require('./routes/feedback.routes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', env: process.env.NODE_ENV }));

// Error handler
app.use(errorHandler);

// Start cron jobs
reminderJob.start();
escalateJob.start();
console.log('⏰ Cron jobs started');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
