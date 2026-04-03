const express = require('express');
const router = express.Router();
const {
  logConsumption,
  logGroupConsumption,
  getConsumption,
  getTodayConsumption,
  getWeeklyStats,
  deleteConsumption,
  updateConsumption,
  computeDailyGoal,
  getUserOilStatus,
  analyzeFoodImage
} = require('../controllers/oilConsumptionController');
const { protect } = require('../middleware/auth');

// Public endpoint for AI food image analysis
router.post('/analyze-food', analyzeFoodImage);

// All routes require authentication
router.use(protect);

// SwasthaIndex endpoints
router.post('/compute-daily-goal', computeDailyGoal);
router.get('/user-oil-status', getUserOilStatus);

// Log consumption
router.post('/log', logConsumption);
router.post('/log-group', logGroupConsumption);

// Get consumption entries (with optional date filtering)
router.get('/entries', getConsumption);

// Get today's consumption
router.get('/today', getTodayConsumption);

// Get weekly stats
router.get('/stats/weekly', getWeeklyStats);

// Update consumption entry
router.put('/:id', updateConsumption);

// Delete consumption entry
router.delete('/:id', deleteConsumption);

module.exports = router;
