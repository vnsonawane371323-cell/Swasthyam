/**
 * Health Analysis Utility
 * Processes extracted medical data and generates actionable insights
 */

const analyzeHealth = (metrics) => {
  let health_score = 100;
  const risk_flags = [];
  let oil_limit = 40; // default ml per day
  const recommendations = [];

  // LIPID PROFILE ANALYSIS
  if (metrics.lipid_profile) {
    const { total_cholesterol, ldl, triglycerides, hdl } = metrics.lipid_profile;

    if (total_cholesterol && total_cholesterol > 200) {
      health_score -= 15;
      risk_flags.push('High Cholesterol');
      recommendations.push('Reduce saturated fat intake and increase fiber');
    }

    if (ldl && ldl > 130) {
      health_score -= 10;
      risk_flags.push('High LDL');
      oil_limit = Math.max(20, oil_limit - 10); // Reduce oil limit
      recommendations.push('Limit oil consumption to 20ml/day');
    }

    if (triglycerides && triglycerides > 150) {
      health_score -= 10;
      risk_flags.push('High Triglycerides');
      recommendations.push('Avoid fried foods and limit oil intake');
    }

    if (hdl && hdl < 40) {
      health_score -= 5;
      recommendations.push('Increase physical activity to raise HDL cholesterol');
    }
  }

  // DIABETES ANALYSIS
  if (metrics.diabetes) {
    const { hba1c, fasting_glucose, postprandial_glucose } = metrics.diabetes;

    if (hba1c && hba1c > 6.5) {
      health_score -= 20;
      risk_flags.push('Diabetes Risk');
      recommendations.push('Monitor blood sugar levels regularly');
      recommendations.push('Reduce refined carbohydrates and sugar');
    }

    if (fasting_glucose && fasting_glucose > 126) {
      health_score -= 15;
      risk_flags.push('Diabetes Risk');
    }

    if (postprandial_glucose && postprandial_glucose > 200) {
      health_score -= 10;
      recommendations.push('Space meals and avoid high-calorie foods');
    }
  }

  // LIVER FUNCTION ANALYSIS
  if (metrics.liver_function) {
    const { alt_sgpt, ast_sgot, bilirubin } = metrics.liver_function;

    if (alt_sgpt && alt_sgpt > 40) {
      health_score -= 12;
      risk_flags.push('Fatty Liver Risk');
      oil_limit = Math.max(15, oil_limit - 15); // Further reduce oil
      recommendations.push('Reduce oil to 15ml/day');
      recommendations.push('Avoid alcohol and fatty foods');
    }

    if (ast_sgot && ast_sgot > 40) {
      health_score -= 12;
      risk_flags.push('Fatty Liver Risk');
    }

    if (bilirubin && bilirubin > 1.2) {
      health_score -= 8;
      recommendations.push('Consult a hepatologist');
    }
  }

  // KIDNEY FUNCTION ANALYSIS
  if (metrics.kidney_function) {
    const { creatinine, urea, uric_acid } = metrics.kidney_function;

    if (creatinine && creatinine > 1.3) {
      health_score -= 15;
      risk_flags.push('Kidney Dysfunction');
      recommendations.push('Reduce protein intake and increase water intake');
      oil_limit = Math.max(30, oil_limit);
    }

    if (urea && urea > 45) {
      health_score -= 10;
      risk_flags.push('Kidney Dysfunction');
    }

    if (uric_acid && uric_acid > 6) {
      health_score -= 8;
      recommendations.push('Reduce purine-rich foods (red meat, seafood)');
    }
  }

  // NUTRITION ANALYSIS
  if (metrics.nutrition) {
    const { protein, albumin } = metrics.nutrition;

    if (protein && protein < 6) {
      health_score -= 8;
      risk_flags.push('Low Protein');
      recommendations.push('Increase protein intake (eggs, legumes, lean meat)');
    }

    if (albumin && albumin < 3.5) {
      health_score -= 10;
      risk_flags.push('Low Protein');
      recommendations.push('Increase nutritional intake - consult a dietitian');
    }
  }

  // CBC ANALYSIS (Complete Blood Count)
  if (metrics.cbc) {
    const { hemoglobin, wbc, platelets } = metrics.cbc;

    if (hemoglobin && hemoglobin < 12) {
      health_score -= 12;
      risk_flags.push('Anemia');
      recommendations.push('Increase iron intake (spinach, red meat, dates)');
    }

    if (wbc && (wbc < 4 || wbc > 11)) {
      health_score -= 8;
      recommendations.push('Monitor immune system health');
    }

    if (platelets && (platelets < 150 || platelets > 400)) {
      health_score -= 8;
      recommendations.push('Consult hematologist for platelet abnormality');
    }
  }

  // THYROID ANALYSIS
  if (metrics.thyroid) {
    const { tsh, t3, t4 } = metrics.thyroid;

    if (tsh && (tsh < 0.4 || tsh > 4)) {
      health_score -= 10;
      risk_flags.push('Thyroid Disorder');
      recommendations.push('Take thyroid medication as prescribed');
    }

    if (t3 && t3 < 80) {
      health_score -= 5;
      recommendations.push('Increase iodine intake for thyroid health');
    }
  }

  // VITAMIN ANALYSIS
  if (metrics.vitamins) {
    const { vitamin_d, vitamin_b12 } = metrics.vitamins;

    if (vitamin_d && vitamin_d < 20) {
      health_score -= 8;
      recommendations.push('Get more sunlight exposure or take Vitamin D supplements');
    }

    if (vitamin_b12 && vitamin_b12 < 200) {
      health_score -= 8;
      recommendations.push('Take Vitamin B12 supplements or increase dairy/meat intake');
    }
  }

  // ELECTROLYTES ANALYSIS
  if (metrics.electrolytes) {
    const { sodium, potassium } = metrics.electrolytes;

    if ((sodium && sodium < 135) || (sodium && sodium > 145)) {
      health_score -= 8;
      risk_flags.push('Electrolyte Imbalance');
      recommendations.push('Balance salt intake and drink enough water');
    }

    if ((potassium && potassium < 3.5) || (potassium && potassium > 5)) {
      health_score -= 8;
      risk_flags.push('Electrolyte Imbalance');
    }
  }

  // VITALS ANALYSIS
  if (metrics.vitals) {
    const { bmi, weight } = metrics.vitals;

    if (bmi && bmi > 30) {
      health_score -= 12;
      recommendations.push('Increase physical activity and reduce calorie intake');
      oil_limit = Math.max(25, oil_limit - 5);
    }

    if (bmi && bmi < 18.5) {
      health_score -= 8;
      recommendations.push('Increase calorie intake and focus on balanced nutrition');
    }
  }

  // Ensure health_score is between 0 and 100
  health_score = Math.max(0, Math.min(100, health_score));

  // Calculate nutrition targets based on health metrics
  let target_protein = 50; // grams
  let target_fat = 50; // grams
  let target_carbs = 200; // grams

  // Adjust based on diabetes
  if (metrics.diabetes?.hba1c && metrics.diabetes.hba1c > 6.5) {
    target_carbs = 150; // Reduce carbs for diabetics
  }

  // Adjust based on protein levels
  if (metrics.nutrition?.protein && metrics.nutrition.protein < 6) {
    target_protein = 70; // Increase protein recommendation
  }

  // Adjust based on cholesterol
  if (
    metrics.lipid_profile?.total_cholesterol &&
    metrics.lipid_profile.total_cholesterol > 200
  ) {
    target_fat = 40; // Reduce fat for high cholesterol
  }

  // Add positive recommendations for good metrics
  if (!risk_flags.length) {
    recommendations.push('Maintain current lifestyle and regular health checkups');
  }
  if (recommendations.length === 0) {
    recommendations.push('Consult with a healthcare provider for personalized advice');
  }

  return {
    health_score,
    oil_limit: Math.max(15, oil_limit), // Minimum 15 ml
    risk_flags: [...new Set(risk_flags)], // Remove duplicates
    nutrition_targets: {
      protein: target_protein,
      fat: target_fat,
      carbs: target_carbs,
    },
    recommendations: [...new Set(recommendations)], // Remove duplicates
  };
};

module.exports = {
  analyzeHealth,
};
