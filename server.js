require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Middleware
const errorMiddleware = require('./middleware/errorMiddleware');
const requestLogger = require('./middleware/requestLogger');
const ErrorHandler = require('./middleware/errorHandler');

const app = express();

// Trust proxy - fix for rate limiter
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Request logging
app.use(requestLogger);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// General API rate limiter - more lenient
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' || req.path.startsWith('/uploads');
  }
});

// Auth-specific rate limiter - stricter for login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 auth requests per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// Apply general rate limiter to all API routes
app.use('/api/', apiLimiter);

// Apply stricter rate limiter to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static folder for uploads
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Uploads path:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Database connection with error handling
console.log('🔄 Connecting to MongoDB...');
console.log('URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => {
  console.log('✓ MongoDB Connected Successfully');
})
.catch(err => {
  console.error('✗ MongoDB Connection Error:', err.message);
  console.error('Make sure MongoDB is running on:', process.env.MONGODB_URI);
  process.exit(1);
});

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/media', require('./routes/media'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/products', require('./routes/products'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/tutorials', require('./routes/tutorials'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/product-enquiries', require('./routes/productEnquiry'));
app.use('/api/forms', require('./routes/dynamicForms'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 404 handler
app.use('*', (req, res, next) => {
  next(new ErrorHandler(`Route ${req.originalUrl} not found`, 404));
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API: http://localhost:${PORT}/api`);
  console.log(`✓ Health: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('✗ Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('✗ Uncaught Exception:', err);
  process.exit(1);
});