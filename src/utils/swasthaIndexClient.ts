/**
 * SwasthaIndex Oil Limit System - Frontend Utilities
 * Provides client-side calculations and helpers for the oil tracking system
 */

// Oil harm scores (0-100, higher = more harmful)
const OIL_HARM_SCORES: Record<string, number> = {
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

/**
 * Get harm score for an oil type
 */
export function getOilHarmScore(oilType: string): number {
  return OIL_HARM_SCORES[oilType] || 50;
}

/**
 * Compute penalty multiplier for a given harm score
 * Formula: M(h) = 1 + 0.3 × (h/100)²
 * Range: [1.0, 1.5]
 */
export function computeMultiplier(harmScore: number): number {
  const K_PENALTY = 0.3;
  const M_MAX = 1.5;
  const hNorm = harmScore / 100;
  const m = 1 + K_PENALTY * (hNorm ** 2);
  return Math.min(m, M_MAX);
}

/**
 * Estimate effective calories for an oil amount
 */
export function estimateEffectiveCalories(grams: number, harmScore: number): number {
  const rawKcal = grams * 9;
  const multiplier = computeMultiplier(harmScore);
  return rawKcal * multiplier;
}

/**
 * Get fill color based on percentage
 * Thresholds: 0-70% green, 71-90% amber, 91-100% orange, >100% red
 */
export function getFillColor(fillPercent: number): string {
  if (fillPercent <= 70) return '#16a34a'; // green
  if (fillPercent <= 90) return '#f59e0b'; // amber
  if (fillPercent <= 100) return '#ea580c'; // orange
  return '#dc2626'; // red
}

/**
 * Get harm category for display
 */
export function getHarmCategory(harmScore: number): {
  label: string;
  color: string;
} {
  if (harmScore < 30) {
    return { label: 'Healthy', color: '#16a34a' };
  } else if (harmScore < 60) {
    return { label: 'Moderate', color: '#f59e0b' };
  } else {
    return { label: 'High Risk', color: '#dc2626' };
  }
}

/**
 * Format calorie display with effective indicator
 */
export function formatCalorieDisplay(
  rawKcal: number,
  effectiveKcal: number,
  multiplier: number
): string {
  if (Math.abs(effectiveKcal - rawKcal) < 1) {
    return `${Math.round(rawKcal)} kcal`;
  }
  return `${Math.round(effectiveKcal)} kcal (×${multiplier.toFixed(2)})`;
}

/**
 * Get status message based on fill percentage
 */
export function getStatusMessage(fillPercent: number, remainingMl: number): string {
  if (fillPercent <= 70) {
    return `Great! You have ${remainingMl.toFixed(1)}ml remaining.`;
  } else if (fillPercent <= 90) {
    return `Careful! Only ${remainingMl.toFixed(1)}ml remaining.`;
  } else if (fillPercent <= 100) {
    return `Almost at your limit! ${remainingMl.toFixed(1)}ml left.`;
  } else {
    return `You've exceeded your daily limit by ${Math.abs(remainingMl).toFixed(1)}ml.`;
  }
}

/**
 * Compute Swastha Index score for display
 * Simplified version - actual calculation done on backend
 */
export function computeSwasthaIndex(
  oilHealth: number, // 0-100
  dietQuality: number, // 0-100
  activityLevel: number // 0-100
): number {
  return Math.round(
    0.4 * oilHealth +
    0.4 * dietQuality +
    0.2 * activityLevel
  );
}

/**
 * Get Swastha Index category
 */
export function getSwasthaCategory(score: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (score >= 80) {
    return { label: 'Excellent', color: '#16a34a', emoji: '🌟' };
  } else if (score >= 60) {
    return { label: 'Good', color: '#22c55e', emoji: '✅' };
  } else if (score >= 40) {
    return { label: 'Fair', color: '#f59e0b', emoji: '⚠️' };
  } else {
    return { label: 'Needs Work', color: '#dc2626', emoji: '🔴' };
  }
}

/**
 * Format ml remaining with proper pluralization
 */
export function formatMlRemaining(ml: number): string {
  const rounded = Math.round(ml * 10) / 10;
  if (rounded <= 0) {
    return `${Math.abs(rounded)}ml over limit`;
  }
  return `${rounded}ml remaining`;
}

/**
 * Get BMR estimate (Mifflin-St Jeor equation)
 * For frontend validation/preview only
 */
export function estimateBMR(
  weight: number, // kg
  height: number, // cm
  age: number, // years
  gender: 'male' | 'female'
): number {
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(bmr);
}

/**
 * Get activity factor from description
 */
export function getActivityFactor(level: string): number {
  const factors: Record<string, number> = {
    'sedentary': 1.2,
    'lightly-active': 1.375,
    'moderately-active': 1.55,
    'very-active': 1.725,
    'extra-active': 1.9
  };
  return factors[level] || 1.5;
}

/**
 * Estimate daily oil goal (client-side preview)
 * For display only - actual computation done on backend
 */
export function estimateDailyGoal(
  bmr: number,
  activityFactor: number,
  swasthaScore: number = 70,
  harmIndex: number = 40
): {
  goalKcal: number;
  goalMl: number;
} {
  const tdee = bmr * activityFactor;
  const vBase = 0.25 * 0.25 * tdee; // 6.25% of TDEE
  const ha = Math.max(0.5, Math.min(1.8, (100 - harmIndex) / 100));
  const vAdj = vBase * (0.6 * (swasthaScore / 100) + 0.9 * ha);
  const goalKcal = Math.max(0.02 * tdee, Math.min(0.12 * tdee, vAdj));
  const goalMl = goalKcal / 9 / 0.9;
  
  return {
    goalKcal: Math.round(goalKcal * 100) / 100,
    goalMl: Math.round(goalMl * 10) / 10
  };
}

export default {
  getOilHarmScore,
  computeMultiplier,
  estimateEffectiveCalories,
  getFillColor,
  getHarmCategory,
  formatCalorieDisplay,
  getStatusMessage,
  computeSwasthaIndex,
  getSwasthaCategory,
  formatMlRemaining,
  estimateBMR,
  getActivityFactor,
  estimateDailyGoal
};
