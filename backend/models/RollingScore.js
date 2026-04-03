const mongoose = require('mongoose');

/**
 * RollingScore Schema - Stores daily Swastha Score and Harm Index
 * Used to compute 7-day rolling averages
 */
const rollingScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  swasthaScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 70 // Default for new users
  },
  harmIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 40 // Default for new users
  },
  // Optional: store raw data used to compute scores
  mealsCount: {
    type: Number,
    default: 0
  },
  oilEvents: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for unique user+date
rollingScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

/**
 * Get 7-day rolling averages for a user
 */
rollingScoreSchema.statics.getRollingScores = async function(userId, endDate = new Date()) {
  const dateOnly = new Date(endDate);
  dateOnly.setHours(0, 0, 0, 0);
  
  // Get previous 6 days (today not included in rolling avg for next day's goal)
  const startDate = new Date(dateOnly);
  startDate.setDate(startDate.getDate() - 6);
  
  const scores = await this.find({
    userId,
    date: { $gte: startDate, $lte: dateOnly }
  }).sort({ date: 1 }).limit(7);
  
  // If less than 7 days, use defaults
  if (scores.length === 0) {
    return { sRoll: 70, hRoll: 40, daysAvailable: 0 };
  }
  
  const sSum = scores.reduce((sum, s) => sum + s.swasthaScore, 0);
  const hSum = scores.reduce((sum, s) => sum + s.harmIndex, 0);
  
  return {
    sRoll: Math.round((sSum / scores.length) * 100) / 100,
    hRoll: Math.round((hSum / scores.length) * 100) / 100,
    daysAvailable: scores.length
  };
};

/**
 * Update or create daily score
 */
rollingScoreSchema.statics.updateDailyScore = async function(userId, date, swasthaScore, harmIndex) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  const score = await this.findOneAndUpdate(
    { userId, date: dateOnly },
    {
      $set: {
        swasthaScore,
        harmIndex,
        $inc: { oilEvents: 1 }
      }
    },
    { upsert: true, new: true }
  );
  
  return score;
};

/**
 * Compute Swastha Score based on meals (simplified)
 * In production, this would analyze meal composition, nutrients, etc.
 */
rollingScoreSchema.statics.computeSwasthaScore = async function(userId, date) {
  // Placeholder: actual implementation would analyze meals
  // For now, return a baseline score
  return 70;
};

/**
 * Compute Harm Index based on oil consumption
 * Average harm score of all oils used that day
 */
rollingScoreSchema.statics.computeHarmIndex = async function(userId, date) {
  const OilConsumption = mongoose.model('OilConsumption');
  
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  const nextDay = new Date(dateOnly);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const events = await OilConsumption.find({
    userId,
    consumedAt: { $gte: dateOnly, $lt: nextDay }
  });
  
  if (events.length === 0) {
    return 40; // Default if no oil consumed
  }
  
  // Get harm scores for oils
  const harmScores = events.map(e => getOilHarmScore(e.oilType));
  const avgHarm = harmScores.reduce((sum, h) => sum + h, 0) / harmScores.length;
  
  return Math.round(avgHarm * 10) / 10;
};

/**
 * Get harm score for an oil type (0-100, higher = more harmful)
 */
function getOilHarmScore(oilType) {
  const harmScores = {
    'Olive Oil': 10,
    'Mustard Oil': 20,
    'Groundnut Oil': 25,
    'Sesame Oil': 25,
    'Rice Bran Oil': 30,
    'Canola Oil': 35,
    'Sunflower Oil': 40,
    'Safflower Oil': 40,
    'Corn Oil': 45,
    'Soybean Oil': 50,
    'Ghee': 55,
    'Coconut Oil': 60,
    'Butter': 65,
    'Cottonseed Oil': 70,
    'Palm Oil': 80,
    'Palmolein Oil': 85,
    'Vegetable Oil': 50 // Generic
  };
  
  return harmScores[oilType] || 50;
}

module.exports = mongoose.model('RollingScore', rollingScoreSchema);
module.exports.getOilHarmScore = getOilHarmScore;
