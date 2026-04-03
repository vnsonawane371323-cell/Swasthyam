const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const {
  analyzeReport,
  getHealthReports,
  getLatestHealthReport,
  getHealthReportById,
  deleteHealthReport,
  recalculateGoals,
} = require('../controllers/healthReportController');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../cache/health-reports');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

/**
 * POST /api/health/analyze-report
 * Analyze medical report using Gemini AI
 */
router.post('/analyze-report', [protect, upload.single('report')], analyzeReport);

/**
 * GET /api/health/reports/:userId
 * Get all health reports for a user
 */
router.get('/reports/:userId', [protect], getHealthReports);

/**
 * GET /api/health/reports/latest/:userId
 * Get latest health report for a user
 */
router.get('/reports/latest/:userId', [protect], getLatestHealthReport);

/**
 * GET /api/health/report/:reportId
 * Get single health report
 */
router.get('/report/:reportId', [protect], getHealthReportById);

/**
 * DELETE /api/health/report/:reportId
 * Delete health report
 */
router.delete('/report/:reportId', [protect], deleteHealthReport);

/**
 * POST /api/health/recalculate-goals
 * Recalculate daily oil and calorie limits after profile update
 */
router.post('/recalculate-goals', [protect], recalculateGoals);

module.exports = router;
