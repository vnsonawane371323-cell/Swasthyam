require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const oilConsumptionRoutes = require('./routes/oilConsumption');
const groupRoutes = require('./routes/groups');
const healthRoutes = require('./src/routes/health.routes.js');
// const barcodeRoutes = require('./routes/barcode'); // REMOVED - Using Gemini AI directly in frontend
const { errorHandler, notFound } = require('./middleware/error');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
      : ['http://localhost:8081', 'http://localhost:19006'];
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('exp://')) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SwasthTel API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// IoT Weight Data Cache
let latestIoTData = {
  timestamp: new Date().toISOString(),
  deviceId: 'ESP32-WeightScale-001',
  weight: 65,
  temperature: 24,
  humidity: 45,
  status: 'waiting',
  batteryLevel: 92
};

// IoT Weight Data endpoint - GET (returns cached data)
app.get('/data', (req, res) => {
  res.json(latestIoTData);
});

// IoT Weight Data endpoint - POST (accepts data from ESP32)
app.post('/data', (req, res) => {
  try {
    const { deviceId, weight, temperature, humidity, batteryLevel, status } = req.body;
    
    // Update cache with new data from ESP32
    if (weight !== undefined) {
      latestIoTData = {
        timestamp: new Date().toISOString(),
        deviceId: deviceId || latestIoTData.deviceId,
        weight: parseFloat(weight),
        temperature: temperature || latestIoTData.temperature,
        humidity: humidity || latestIoTData.humidity,
        status: status || 'connected',
        batteryLevel: batteryLevel || latestIoTData.batteryLevel
      };
      
      console.log('📊 IoT Data Updated:', latestIoTData);
    }
    
    res.json({
      success: true,
      message: 'Data received',
      data: latestIoTData
    });
  } catch (error) {
    console.error('❌ Error processing IoT data:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/oil', oilConsumptionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/health', healthRoutes);
// app.use('/api/barcode', barcodeRoutes); // REMOVED - Using Gemini AI directly in frontend

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SwasthTel API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
        completeOnboarding: 'POST /api/auth/complete-onboarding',
        changePassword: 'PUT /api/auth/change-password',
        deleteAccount: 'DELETE /api/auth/account'
      },
      oil: {
        logConsumption: 'POST /api/oil/log',
        getEntries: 'GET /api/oil/entries',
        getToday: 'GET /api/oil/today',
        getWeeklyStats: 'GET /api/oil/stats/weekly',
        updateEntry: 'PUT /api/oil/:id',
        deleteEntry: 'DELETE /api/oil/:id'
      },
      // barcode: {
      //   scan: 'POST /api/barcode/scan',
      //   lookup: 'GET /api/barcode/lookup/:barcode',
      //   search: 'GET /api/barcode/search'
      // }, // DISABLED - OpenCV module removed
    }
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server on BOTH ports
const PORT = process.env.PORT || 5000;
const ESP32_PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║     SwasthTel Backend Server Started     ║
╠══════════════════════════════════════════╣
║  Main Port: ${PORT}                           ║
║  ESP32 Port: ${ESP32_PORT} (for IoT data)     ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  API: http://localhost:${PORT}              ║
╚══════════════════════════════════════════╝
  `);
});

// Start separate server on port 3000 for ESP32 POST requests
const esp32Server = app.listen(ESP32_PORT, () => {
  console.log(`✅ ESP32 IoT endpoint listening on http://172.20.10.13:${ESP32_PORT}/data`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
