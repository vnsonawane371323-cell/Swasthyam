/**
 * Health Suggestion Utility
 * Provides weight goal recommendations and health insights based on user profile
 */

export type WeightGoal = 'lose' | 'maintain' | 'gain';

export interface BMICategory {
  text: string;
  color: string;
  goal: WeightGoal;
}

/**
 * Calculate BMI from height and weight
 * @param height Height in cm
 * @param weight Weight in kg
 * @returns BMI value
 */
export function calculateBMI(height: number, weight: number): number {
  if (height <= 0 || weight <= 0) return 0;
  const heightM = height / 100; // Convert cm to meters
  return weight / (heightM * heightM);
}

/**
 * Get BMI category and suggested weight goal
 * @param bmi BMI value
 * @returns BMI category with text, color, and suggested goal
 */
export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) {
    return { text: 'Underweight', color: '#3b82f6', goal: 'gain' };
  } else if (bmi < 25) {
    return { text: 'Normal', color: '#10b981', goal: 'maintain' };
  } else if (bmi < 30) {
    return { text: 'Overweight', color: '#f59e0b', goal: 'lose' };
  } else {
    return { text: 'Obese', color: '#ef4444', goal: 'lose' };
  }
}

/**
 * Get health suggestion text based on BMI
 * @param bmi BMI value
 * @returns Health suggestion text
 */
export function getHealthSuggestionText(bmi: number): string {
  if (bmi < 18.5) {
    return 'You appear to be underweight. Gaining weight through a balanced diet can improve your overall health and energy levels.';
  } else if (bmi < 25) {
    return 'Your weight is in a healthy range. Focus on maintaining it through consistent exercise and balanced nutrition.';
  } else if (bmi < 30) {
    return 'You appear to be overweight. Losing weight through a balanced diet and exercise can significantly improve your health.';
  } else {
    return 'Your BMI indicates obesity. Weight loss is strongly recommended to reduce health risks and improve quality of life.';
  }
}

/**
 * Get background color for health suggestion card
 * @param goal Weight goal
 * @returns Hex color code
 */
export function getSuggestionBackgroundColor(goal: WeightGoal): string {
  if (goal === 'lose') return '#FEF3C7'; // Yellow
  if (goal === 'gain') return '#FED7AA'; // Orange
  return '#DBEAFE'; // Blue
}

/**
 * Get icon emoji for weight goal
 * @param goal Weight goal
 * @returns Emoji string
 */
export function getGoalIcon(goal: WeightGoal): string {
  if (goal === 'lose') return '📉';
  if (goal === 'gain') return '📈';
  return '⚖️';
}

/**
 * Calculate recommended calorie adjustment based on weight goal
 * @param goal Weight goal
 * @returns Calorie adjustment in kcal
 */
export function getCalorieAdjustment(goal: WeightGoal): number {
  if (goal === 'lose') return -500;
  if (goal === 'gain') return 500;
  return 0;
}

/**
 * Calculate oil budget based on adjusted TDEE
 * Oil budget is typically 7% of daily calorie intake
 * @param adjustedTdee Adjusted total daily energy expenditure
 * @returns Oil budget in kcal
 */
export function calculateOilBudget(adjustedTdee: number): number {
  if (adjustedTdee <= 0) return 140; // Default fallback
  return Math.round((adjustedTdee * 0.07) * 10) / 10;
}

/**
 * Get health tips based on weight goal and BMI
 * @param goal Weight goal
 * @param bmi BMI value
 * @returns Array of health tips
 */
export function getHealthTips(goal: WeightGoal, bmi: number): string[] {
  const tips: string[] = [];

  if (goal === 'lose') {
    tips.push('💪 Aim for 30-45 minutes of moderate exercise most days');
    tips.push('🥗 Focus on whole foods and reduce processed items');
    tips.push('💧 Drink plenty of water (8+ glasses daily)');
    if (bmi >= 30) {
      tips.push('⚠️ Consider consulting a healthcare provider for personalized guidance');
    }
  } else if (goal === 'gain') {
    tips.push('🥤 Consume calorie-dense whole foods like nuts, avocados, and dairy');
    tips.push('🍱 Eat more frequently (5-6 small meals per day)');
    tips.push('💪 Combine with strength training to build muscle');
  } else {
    tips.push('⚖️ Maintain consistent exercise routine (150 min/week)');
    tips.push('🥗 Continue eating a balanced, whole-food diet');
    tips.push('📊 Monitor your weight weekly to maintain consistency');
  }

  return tips;
}

/**
 * Get detailed health profile summary
 * @param bmi BMI value
 * @param age Age in years
 * @param gender Gender (male/female/other)
 * @returns Health profile summary object
 */
export function getHealthProfileSummary(bmi: number, age?: number, gender?: string) {
  const category = getBMICategory(bmi);
  const riskLevel = calculateHealthRiskLevel(bmi, age);

  return {
    category: category.text,
    bmi: bmi.toFixed(1),
    goal: category.goal,
    riskLevel,
    riskText: getRiskLevelText(riskLevel),
    suggestion: getHealthSuggestionText(bmi),
    tips: getHealthTips(category.goal, bmi),
  };
}

/**
 * Calculate health risk level (0-100 scale)
 * @param bmi BMI value
 * @param age Age in years
 * @returns Risk level 0-100
 */
function calculateHealthRiskLevel(bmi: number, age?: number): number {
  let risk = 0;

  if (bmi < 18.5) {
    risk = 40; // Underweight
  } else if (bmi < 25) {
    risk = 10; // Normal
  } else if (bmi < 30) {
    risk = 50; // Overweight
  } else {
    risk = 80; // Obese
  }

  // Age factor (increases risk for very high or very low ages)
  if (age) {
    if (age < 18 || age > 65) {
      risk += 10;
    }
  }

  return Math.min(100, risk);
}

/**
 * Get risk level text
 * @param riskLevel Risk level 0-100
 * @returns Risk level description
 */
function getRiskLevelText(riskLevel: number): string {
  if (riskLevel < 20) return 'Low';
  if (riskLevel < 40) return 'Minimal';
  if (riskLevel < 60) return 'Moderate';
  if (riskLevel < 80) return 'High';
  return 'Very High';
}
