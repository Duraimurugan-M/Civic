require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const compression  = require('compression');
const cookieParser = require('cookie-parser');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const swaggerUi    = require('swagger-ui-express');

const connectDB    = require('./config/db');
const swaggerSpec  = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const { reminderJob, escalateJob } = require('./jobs/reminder.job');

const app = express();

// ── Trust proxy — required on Render / any reverse proxy host ──
app.set('trust proxy', 1);

// ── Connect Database ──
connectDB();

// ── Security headers ──
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// ── Compression ──
app.use(compression());

// ── CORS ──
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ── Rate limiters ──

// Strict limiter for auth routes — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General limiter for all other routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api',               generalLimiter);

// ── Body parsers ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── HTTP request logging ──
// In production: standard Apache/Nginx combined log format
// In development: colored dev format
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── API Documentation (disable in production for security) ──
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'CivicConnect API',
  }));
}

// ── Routes ──
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/complaints',  require('./routes/complaint.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/users',       require('./routes/user.routes'));
app.use('/api/analytics',   require('./routes/analytics.routes'));
app.use('/api/feedback',    require('./routes/feedback.routes'));

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    status:  'OK',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ── 404 handler ──
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error handler ──
app.use(errorHandler);

// ── Start cron jobs ──
reminderJob.start();
escalateJob.start();

// ── Start server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
  }
});