/**
 * SwasthaIndex Oil Limit System Utilities
 * Contains core calculation functions for the oil tracking system
 */
const { getAllowedOilKcal, getRawOilKcal, getMultiplier, getEffectiveKcal } = require('./oilCalorieUtils');

// System constants (can be overridden via config)
const CONSTANTS = {
  R_FAT: 0.25,          // Fat calories as % of TDEE
  R_VISIBLE: 0.25,      // Visible oils as % of fat
  ALPHA_S: 0.6,         // Swastha Score weight
  ALPHA_H: 0.9,         // Harm Adjustment weight
  K_PENALTY: 0.3,       // Harm penalty multiplier
  M_MAX: 1.5,           // Max penalty multiplier
  V_MIN: 0.02,          // Min oil % of TDEE
  V_MAX: 0.12,          // Max oil % of TDEE
  HA_MIN: 0.5,          // Min harm adjustment
  HA_MAX: 1.8,          // Max harm adjustment
  EMA_WEIGHT: 0.3,      // Exponential moving average weight
  ROLLING_WINDOW: 7     // Days for rolling average
};

/**
 * Compute daily oil calorie goal based on SwasthaIndex formula
 * @param {number} bmr - Basal Metabolic Rate in kcal
 * @param {number} activityFactor - Activity multiplier (1.2-2.0)
 * @param {number} sRoll - 7-day rolling Swastha Score (0-100)
 * @param {number} hRoll - 7-day rolling Harm Index (0-100)
 * @returns {object} Goal data including kcal, grams, ml, and intermediates
 */
function computeDailyGoal(bmr, activityFactor, sRoll, hRoll) {
  const { HA_MIN, HA_MAX } = CONSTANTS;

  // 1. Compute TDEE
  const tdee = bmr * activityFactor;

  // 2. Stage 1 target: 7% of TDEE
  const goalKcal = getAllowedOilKcal(bmr, activityFactor);
  const vBase = goalKcal;
  const ha = clamp((100 - hRoll) / 100, HA_MIN, HA_MAX);
  const vAdj = goalKcal;

  // 3. Convert to grams and ml (oil density ≈ 0.9 g/ml)
  const goalGrams = goalKcal / 9;
  const goalMl = goalGrams / 0.9;
  
  return {
    tdee: round(tdee, 1),
    vBase: round(vBase, 1),
    ha: round(ha, 2),
    vAdj: round(vAdj, 1),
    goalKcal: round(goalKcal, 2),
    goalGrams: round(goalGrams, 1),
    goalMl: round(goalMl, 1)
  };
}

/**
 * Compute quality multiplier from fatty-acid percentages.
 * @param {number} sfaPercent
 * @param {number} tfaPercent
 * @param {number} pufaPercent
 * @param {number} k
 * @returns {number}
 */
function computeMultiplier(sfaPercent = 0, tfaPercent = 0, pufaPercent = 0, k = 0.2) {
  return getMultiplier(sfaPercent, tfaPercent, pufaPercent, k).multiplier;
}

/**
 * Compute effective calories for an oil consumption event
 * @param {number} grams - Amount of oil in grams
 * @param {number} sfaPercent
 * @param {number} tfaPercent
 * @param {number} pufaPercent
 * @param {number} k
 * @returns {object} Raw kcal, multiplier, and effective kcal
 */
function computeEffectiveCalories(grams, sfaPercent = 0, tfaPercent = 0, pufaPercent = 0, k = 0.2) {
  const rawKcal = getRawOilKcal(grams);
  const { harmScore, swasthIndex, multiplier } = getMultiplier(sfaPercent, tfaPercent, pufaPercent, k);
  const effectiveKcal = getEffectiveKcal(rawKcal, multiplier);

  return {
    rawKcal,
    harmScore,
    swasthIndex,
    multiplier,
    effectiveKcal
  };
}

/**
 * Compute status metrics for a daily goal
 * @param {number} goalKcal - Daily goal in kcal
 * @param {number} cumulativeEffKcal - Cumulative effective calories consumed
 * @param {number} eventsCount - Number of oil events logged
 * @returns {object} Status including remaining, fill%, overage
 */
function computeGoalStatus(goalKcal, cumulativeEffKcal, eventsCount = 0) {
  const remainingKcal = Math.max(0, goalKcal - cumulativeEffKcal);
  const remainingMl = remainingKcal / 9;
  const fillPercent = (cumulativeEffKcal / goalKcal) * 100;
  const overage = Math.max(0, cumulativeEffKcal - goalKcal);
  const status = cumulativeEffKcal <= goalKcal ? 'within_limit' : 'over_limit';
  
  return {
    goalKcal: round(goalKcal, 2),
    goalMl: round(goalKcal / 9 / 0.9, 1),
    cumulativeEffKcal: round(cumulativeEffKcal, 2),
    remainingKcal: round(remainingKcal, 2),
    remainingMl: round(remainingMl / 0.9, 2),
    fillPercent: round(fillPercent, 1),
    overage: round(overage, 2),
    eventsCount,
    status
  };
}

/**
 * Get color for UI based on fill percentage
 * @param {number} fillPercent - Fill percentage (0-100+)
 * @returns {string} Color code (green/amber/orange/red)
 */
function getFillColor(fillPercent) {
  if (fillPercent <= 70) return 'green';
  if (fillPercent <= 90) return 'amber';
  if (fillPercent <= 100) return 'orange';
  return 'red';
}

/**
 * Get hex color for UI
 * @param {string} color - Color name
 * @returns {string} Hex code
 */
function getHexColor(color) {
  const colors = {
    green: '#16a34a',
    amber: '#f59e0b',
    orange: '#ea580c',
    red: '#dc2626'
  };
  return colors[color] || colors.green;
}

/**
 * Compute Mifflin-St Jeor BMR
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR in kcal/day
 */
function computeBMR(weight, height, age, gender) {
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return round(bmr, 0);
}

/**
 * Get activity factor from activity level
 * @param {string} activityLevel - Activity description
 * @returns {number} Activity factor (1.2-2.0)
 */
function getActivityFactor(activityLevel) {
  const factors = {
    sedentary: 1.2,
    'lightly active': 1.375,
    'moderately active': 1.55,
    'very active': 1.725,
    'extra active': 1.9
  };
  return factors[activityLevel?.toLowerCase()] || 1.5;
}

// Utility functions
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, decimals) {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

module.exports = {
  CONSTANTS,
  computeDailyGoal,
  computeMultiplier,
  computeEffectiveCalories,
  computeGoalStatus,
  getFillColor,
  getHexColor,
  computeBMR,
  getActivityFactor,
  clamp,
  round
};
