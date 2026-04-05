const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const geocodingRoutes = require('./routes/geocoding');
const stripeCheckoutRoutes = require('./routes/stripe');
const stripeWebhookRoutes = require('./routes/stripeWebhook');

const app = express();

app.use(helmet());

const parseCorsOrigins = () => {
  const fromEnv = process.env.CORS_ORIGINS;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.split(',').map((o) => o.trim()).filter(Boolean);
  }
  if (process.env.NODE_ENV === 'production') {
    return ['https://your-frontend-domain.com'];
  }
  return [
    'http://localhost:3000',
    'http://localhost:19006',
    'exp://localhost:19000',
    'http://127.0.0.1:19006',
  ];
};

app.use(cors({
  origin: parseCorsOrigins(),
  credentials: true
}));

app.use('/api/stripe', stripeWebhookRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Local Shop API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', stripeCheckoutRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/geocoding', geocodingRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

module.exports = app;
