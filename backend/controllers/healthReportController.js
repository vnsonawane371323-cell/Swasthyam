const HealthReport = require('../models/HealthReport');
const { analyzeReportWithGemini } = require('../services/geminiService');
const { analyzeHealth } = require('../utils/healthAnalyzer');
const fs = require('fs');

/**
 * Analyze Medical Report
 * POST /analyze-report
 */
const analyzeReport = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      fs.unlinkSync(file.path); // Clean up uploaded file
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images and PDFs are allowed.',
      });
    }

    const fileType = file.mimetype.startsWith('image') ? 'image' : 'pdf';

    // Call Gemini API to analyze report
    const extractedMetrics = await analyzeReportWithGemini(file.path, file.originalname);

    // Analyze health based on extracted metrics
    const healthAnalysis = analyzeHealth(extractedMetrics);

    // Save to database
    const healthReport = new HealthReport({
      user_id: userId,
      file_name: file.originalname,
      file_type: fileType,
      extracted_metrics: extractedMetrics,
      health_score: healthAnalysis.health_score,
      oil_limit: healthAnalysis.oil_limit,
      risk_flags: healthAnalysis.risk_flags,
      nutrition_targets: healthAnalysis.nutrition_targets,
      recommendations: healthAnalysis.recommendations,
    });

    await healthReport.save();

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.status(200).json({
      success: true,
      message: 'Report analyzed successfully',
      data: {
        report_id: healthReport._id,
        metrics: extractedMetrics,
        health_score: healthAnalysis.health_score,
        oil_limit: healthAnalysis.oil_limit,
        risk_flags: healthAnalysis.risk_flags,
        nutrition_targets: healthAnalysis.nutrition_targets,
        recommendations: healthAnalysis.recommendations,
      },
    });
  } catch (error) {
    // Clean up uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Error analyzing report:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing report',
      error: error.message,
    });
  }
};

/**
 * Get User's Health Reports
 * GET /health-reports/:userId
 */
const getHealthReports = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const reports = await HealthReport.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await HealthReport.countDocuments({ user_id: userId });

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message,
    });
  }
};

/**
 * Get Latest Health Report
 * GET /health-reports/latest/:userId
 */
const getLatestHealthReport = async (req, res) => {
  try {
    const { userId } = req.params;

    const report = await HealthReport.findOne({ user_id: userId }).sort({
      created_at: -1,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No health reports found',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching latest report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message,
    });
  }
};

/**
 * Get Single Health Report
 * GET /health-reports/:reportId
 */
const getHealthReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await HealthReport.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message,
    });
  }
};

/**
 * Delete Health Report
 * DELETE /health-reports/:reportId
 */
const deleteHealthReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await HealthReport.findByIdAndDelete(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message,
    });
  }
};

/**
 * Recalculate daily goals for user
 * POST /health/recalculate-goals
 * Triggered after profile health details are updated
 */
const recalculateGoals = async (req, res) => {
  try {
    const User = require('../models/User');
    const DailyGoal = require('../models/DailyGoal');
    
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete today's old goal to recalculate
    await DailyGoal.deleteOne({ userId, date: today });

    // Compute new daily goal using adjustedTdee if available
    const userProfile = {
      bmr: user.bmr || 1500,
      activityFactor: user.activityFactor || 1.5,
      tdee: user.adjustedTdee || user.tdee || (user.bmr || 1500) * (user.activityFactor || 1.5),
    };

    // Get or compute new goal
    const goal = await DailyGoal.getOrComputeGoal(userId, today, userProfile);

    res.status(200).json({
      success: true,
      message: 'Daily goals recalculated successfully',
      data: {
        goalKcal: goal.goalKcal,
        goalGrams: goal.goalGrams,
        goalMl: goal.goalMl,
        tdee: goal.tdee,
        sRoll: goal.sRoll,
        hRoll: goal.hRoll,
      },
    });
  } catch (error) {
    console.error('Error recalculating goals:', error);
    res.status(500).json({
      success: false,
      message: 'Error recalculating goals',
      error: error.message,
    });
  }
};

module.exports = {
  analyzeReport,
  getHealthReports,
  getLatestHealthReport,
  getHealthReportById,
  deleteHealthReport,
  recalculateGoals,
};
