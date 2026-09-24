require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const { errorHandler } = require('./src/middlewares/errorHandler');

const app = express();

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ─── Rate Limiting ────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: 'Too many requests. Please try again after 15 minutes.', errorCode: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests.', errorCode: 'RATE_LIMIT_EXCEEDED' },
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ─── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'FleetSphere API is running.', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth',          require('./src/routes/authRoutes'));
app.use('/api/users',         require('./src/routes/userRoutes'));
app.use('/api/organizations', require('./src/routes/organizationRoutes'));
app.use('/api/branches',      require('./src/routes/branchRoutes'));
app.use('/api/vehicles',      require('./src/routes/vehicleRoutes'));
app.use('/api/drivers',       require('./src/routes/driverRoutes'));
app.use('/api/routes',        require('./src/routes/routeRoutes'));
app.use('/api/trips',         require('./src/routes/tripRoutes'));
app.use('/api/fuel',          require('./src/routes/fuelRoutes'));
app.use('/api/maintenance',   require('./src/routes/maintenanceRoutes'));
app.use('/api/incidents',     require('./src/routes/incidentRoutes'));
app.use('/api/expenses',      require('./src/routes/expenseRoutes'));
app.use('/api/documents',     require('./src/routes/documentRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/audit-logs',    require('./src/routes/auditRoutes'));
app.use('/api/dashboard',     require('./src/routes/dashboardRoutes'));

// ─── 404 Handler ──────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.`, errorCode: 'NOT_FOUND' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
