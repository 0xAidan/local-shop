const requiredInProduction = [
  'MONGODB_URI',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing = requiredInProduction.filter((key) => !process.env[key]);

  if (isProduction && missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (isProduction && process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    console.error('JWT_SECRET must be changed in production');
    process.exit(1);
  }

  if (isProduction && process.env.STRIPE_SKIP_PAYMENTS === 'true') {
    console.error('STRIPE_SKIP_PAYMENTS must not be enabled in production');
    process.exit(1);
  }

  if (isProduction && !process.env.CORS_ORIGINS && !process.env.ADMIN_WEB_URL) {
    console.warn('⚠️ Set CORS_ORIGINS or ADMIN_WEB_URL for production admin access');
  }
};

const getCorsOrigins = () => {
  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
  }

  if (process.env.NODE_ENV === 'production') {
    return [
      process.env.ADMIN_WEB_URL,
      process.env.MERCHANT_WEB_URL,
    ].filter(Boolean);
  }

  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:19006',
    'exp://localhost:19000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002',
  ];
};

module.exports = {
  validateEnv,
  getCorsOrigins,
};
