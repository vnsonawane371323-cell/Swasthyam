const mongoose = require('mongoose');
const { getAllowedOilKcal } = require('../utils/oilCalorieUtils');

/**
 * DailyGoal Schema - Stores computed daily oil calorie limits
 * Based on SwasthaIndex Oil Limit System
 */
const dailyGoalSchema = new mongoose.Schema({
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
  // TDEE and rolling scores
  tdee: {
    type: Number,
    required: true
  },
  sRoll: {
    type: Number, // 7-day rolling Swastha Score
    required: true,
    min: 0,
    max: 100
  },
  hRoll: {
    type: Number, // 7-day rolling Harm Index
    required: true,
    min: 0,
    max: 100
  },
  // Intermediate calculations
  vBase: {
    type: Number,
    required: true
  },
  ha: {
    type: Number, // Harm Adjustment factor
    required: true
  },
  vAdj: {
    type: Number,
    required: true
  },
  // Final goal
  goalKcal: {
    type: Number,
    required: true
  },
  goalGrams: {
    type: Number,
    required: true
  },
  goalMl: {
    type: Number,
    required: true
  },
  // Tracking
  cumulativeEffKcal: {
    type: Number,
    default: 0
  },
  eventsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for unique user+date
dailyGoalSchema.index({ userId: 1, date: 1 }, { unique: true });

/**
 * Get or compute daily goal for a user on a specific date
 */
dailyGoalSchema.statics.getOrComputeGoal = async function(userId, date, userProfile) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  const { bmr, activityFactor = 1.5, tdee = 0 } = userProfile;
  const expectedTdee = Number(tdee) > 0 ? Number(tdee) : (bmr * activityFactor);
  const expectedStage1Goal = Math.round(expectedTdee * 0.07 * 100) / 100;
  
  // Check if goal already exists
  let goal = await this.findOne({ userId, date: dateOnly });
  
  if (goal) {
    // Refresh same-day goal if profile changed or stored goal is from older formula logic.
    if (Math.abs((goal.tdee || 0) - expectedTdee) >= 1 || Math.abs((goal.goalKcal || 0) - expectedStage1Goal) >= 1) {
      const rollingScores = await mongoose.model('RollingScore').getRollingScores(userId, dateOnly);
      const goalData = computeDailyGoal(bmr, activityFactor, rollingScores.sRoll, rollingScores.hRoll, expectedTdee);

      goal.tdee = goalData.tdee;
      goal.sRoll = rollingScores.sRoll;
      goal.hRoll = rollingScores.hRoll;
      goal.vBase = goalData.vBase;
      goal.ha = goalData.ha;
      goal.vAdj = goalData.vAdj;
      goal.goalKcal = goalData.goalKcal;
      goal.goalGrams = goalData.goalGrams;
      goal.goalMl = goalData.goalMl;
      await goal.save();
    }
    return goal;
  }
  
  // Compute new goal
  // Get rolling scores (default for new users)
  const rollingScores = await mongoose.model('RollingScore').getRollingScores(userId, dateOnly);
  
  const goalData = computeDailyGoal(bmr, activityFactor, rollingScores.sRoll, rollingScores.hRoll, expectedTdee);
  
  goal = await this.create({
    userId,
    date: dateOnly,
    tdee: goalData.tdee,
    sRoll: rollingScores.sRoll,
    hRoll: rollingScores.hRoll,
    vBase: goalData.vBase,
    ha: goalData.ha,
    vAdj: goalData.vAdj,
    goalKcal: goalData.goalKcal,
    goalGrams: goalData.goalGrams,
    goalMl: goalData.goalMl
  });
  
  return goal;
};

/**
 * Update cumulative effective calories
 */
dailyGoalSchema.methods.addEffectiveCalories = async function(effKcal) {
  this.cumulativeEffKcal += effKcal;
  this.eventsCount += 1;
  await this.save();
  return this;
};

/**
 * Get status of goal (remaining, fill%, etc)
 */
dailyGoalSchema.methods.getStatus = function() {
  const remainingKcal = Math.max(0, this.goalKcal - this.cumulativeEffKcal);
  const remainingMl = remainingKcal / 9;
  const fillPercent = (this.cumulativeEffKcal / this.goalKcal) * 100;
  const overage = Math.max(0, this.cumulativeEffKcal - this.goalKcal);
  const status = this.cumulativeEffKcal <= this.goalKcal ? 'within_limit' : 'over_limit';
  
  return {
    goalKcal: this.goalKcal,
    goalMl: this.goalMl,
    cumulativeEffKcal: this.cumulativeEffKcal,
    remainingKcal: Math.round(remainingKcal * 100) / 100,
    remainingMl: Math.round(remainingMl * 100) / 100,
    fillPercent: Math.round(fillPercent * 10) / 10,
    overage: Math.round(overage * 100) / 100,
    eventsCount: this.eventsCount,
    status
  };
};

// Helper function to compute daily goal
function computeDailyGoal(bmr, activityFactor, sRoll, hRoll, tdeeOverride = 0) {
  const tdee = Number(tdeeOverride) > 0 ? Number(tdeeOverride) : (bmr * activityFactor);
  const goalKcal = Math.round(tdee * 0.07 * 100) / 100;
  const vBase = goalKcal;
  const ha = 1;
  const vAdj = goalKcal;
  const goalGrams = goalKcal / 9;
  const goalMl = goalGrams / 0.9;
  
  return {
    tdee: Math.round(tdee * 10) / 10,
    vBase: Math.round(vBase * 10) / 10,
    ha: Math.round(ha * 100) / 100,
    vAdj: Math.round(vAdj * 10) / 10,
    goalKcal: Math.round(goalKcal * 100) / 100,
    goalGrams: Math.round(goalGrams * 10) / 10,
    goalMl: Math.round(goalMl * 10) / 10
  };
}

module.exports = mongoose.model('DailyGoal', dailyGoalSchema);
