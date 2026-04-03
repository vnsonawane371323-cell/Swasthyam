// src/services/risk.service.js
// Rule-based clinical health risk engine.
// Deterministic scoring — no AI dependency.
//
// Oil limit priority:
//   Critical (heart risk)  → 10–15 ml/day
//   High (diabetes/chol)   → 15–20 ml/day
//   Moderate               → 20–25 ml/day
//   Low (normal)           → 25–30 ml/day

/**
 * @typedef {Object} RiskResult
 * @property {number}   healthScore
 * @property {number}   oilLimit         - ml/day (midpoint of range)
 * @property {string}   oilRange         - e.g. "18–22 ml/day"
 * @property {string}   riskLevel        - Low | Moderate | High | Critical
 * @property {string[]} riskFlags
 * @property {string[]} preferredOils
 * @property {string[]} avoidOils
 * @property {Object}   nutritionTargets - { protein, fat, carbs } in grams
 * @property {string[]} recommendations
 * @property {string}   whyRecommendation
 * @property {Object}   riskScores       - { cardiovascular, diabetes, hypertension, inflammation }
 */

/**
 * Run all clinical rules against extracted parameters.
 * @param {import('./extractor.service.js').MedicalParameters} params
 * @returns {RiskResult}
 */
export function analyzeRisk(params) {
  const flags = [];
  let deductions = 0;
  const riskScores = { cardiovascular: 0, diabetes: 0, hypertension: 0, inflammation: 0 };

  // ── Cholesterol ─────────────────────────────────────────────────────────────
  if (params.cholesterol != null) {
    if (params.cholesterol > 240) {
      flags.push("High Total Cholesterol");
      deductions += 20; riskScores.cardiovascular += 35;
    } else if (params.cholesterol > 200) {
      flags.push("Borderline Cholesterol");
      deductions += 10; riskScores.cardiovascular += 20;
    }
  }

  // ── LDL ─────────────────────────────────────────────────────────────────────
  if (params.ldl != null) {
    if (params.ldl > 160) {
      flags.push("Very High LDL (Bad Cholesterol)");
      deductions += 20; riskScores.cardiovascular += 30; riskScores.inflammation += 20;
    } else if (params.ldl > 130) {
      flags.push("High LDL Cholesterol");
      deductions += 12; riskScores.cardiovascular += 20;
    }
  }

  // ── HDL ─────────────────────────────────────────────────────────────────────
  if (params.hdl != null) {
    if (params.hdl < 40) {
      flags.push("Low HDL (Good Cholesterol)");
      deductions += 15; riskScores.cardiovascular += 25;
    } else if (params.hdl < 60) {
      riskScores.cardiovascular += 10;
    }
  }

  // ── Triglycerides ────────────────────────────────────────────────────────────
  if (params.triglycerides != null) {
    if (params.triglycerides > 500) {
      flags.push("Very High Triglycerides — Pancreatitis Risk");
      deductions += 25; riskScores.cardiovascular += 35; riskScores.inflammation += 30;
    } else if (params.triglycerides > 200) {
      flags.push("High Triglycerides");
      deductions += 15; riskScores.cardiovascular += 20; riskScores.inflammation += 15;
    } else if (params.triglycerides > 150) {
      flags.push("Borderline Triglycerides");
      deductions += 8; riskScores.cardiovascular += 10;
    }
  }

  // ── Blood Sugar ──────────────────────────────────────────────────────────────
  if (params.bloodSugar != null) {
    if (params.bloodSugar >= 200) {
      flags.push("Diabetic Range Blood Sugar");
      deductions += 25; riskScores.diabetes += 70;
    } else if (params.bloodSugar >= 126) {
      flags.push("High Fasting Blood Sugar (Diabetic)");
      deductions += 20; riskScores.diabetes += 60;
    } else if (params.bloodSugar >= 100) {
      flags.push("Pre-Diabetic Blood Sugar");
      deductions += 10; riskScores.diabetes += 35;
    }
  }

  // ── HbA1c ────────────────────────────────────────────────────────────────────
  if (params.hba1c != null) {
    if (params.hba1c >= 6.5) {
      flags.push("Diabetic HbA1c Level");
      deductions += 20; riskScores.diabetes += 50;
    } else if (params.hba1c >= 5.7) {
      flags.push("Pre-Diabetic HbA1c Level");
      deductions += 10; riskScores.diabetes += 25;
    }
  }

  // ── Blood Pressure ───────────────────────────────────────────────────────────
  if (params.systolicBP != null) {
    const highDiastolic = params.diastolicBP != null && params.diastolicBP >= 90;
    const highDiastolicS1 = params.diastolicBP != null && params.diastolicBP >= 80;
    if (params.systolicBP >= 140 || highDiastolic) {
      flags.push("High Blood Pressure (Stage 2 Hypertension)");
      deductions += 20; riskScores.hypertension += 70; riskScores.cardiovascular += 20;
    } else if (params.systolicBP >= 130 || highDiastolicS1) {
      flags.push("Elevated Blood Pressure (Stage 1 Hypertension)");
      deductions += 12; riskScores.hypertension += 45; riskScores.cardiovascular += 15;
    }
  }

  // ── BMI ─────────────────────────────────────────────────────────────────────
  if (params.bmi != null) {
    if (params.bmi >= 35) {
      flags.push("Severe Obesity (BMI ≥ 35)");
      deductions += 15; riskScores.cardiovascular += 15; riskScores.diabetes += 20;
    } else if (params.bmi >= 30) {
      flags.push("Obesity (BMI ≥ 30)");
      deductions += 10; riskScores.diabetes += 15;
    } else if (params.bmi >= 25) {
      flags.push("Overweight (BMI ≥ 25)");
      deductions += 5;
    }
  }

  // ── Hemoglobin ───────────────────────────────────────────────────────────────
  if (params.hemoglobin != null && params.hemoglobin < 11) {
    flags.push("Low Hemoglobin (Anemia)");
    deductions += 10; riskScores.inflammation += 15;
  }

  // ── Uric Acid ────────────────────────────────────────────────────────────────
  if (params.uricAcid != null && params.uricAcid > 7.0) {
    flags.push("High Uric Acid (Gout Risk)");
    deductions += 8; riskScores.inflammation += 20;
  }

  // ── Clamp scores ─────────────────────────────────────────────────────────────
  for (const k of Object.keys(riskScores)) {
    riskScores[k] = Math.min(riskScores[k], 100);
  }

  // ── Health score ─────────────────────────────────────────────────────────────
  const healthScore = Math.max(0, Math.min(100, 100 - deductions));

  // ── Risk level ───────────────────────────────────────────────────────────────
  const isHeartRisk  = riskScores.cardiovascular >= 60
    || (params.ldl != null && params.ldl > 160)
    || (params.systolicBP != null && params.systolicBP >= 140);

  const isDiabetic   = (params.bloodSugar != null && params.bloodSugar >= 126)
    || (params.hba1c != null && params.hba1c >= 6.5);

  const isHighChol   = (params.cholesterol != null && params.cholesterol > 240)
    || (params.ldl != null && params.ldl > 130);

  let riskLevel;
  if (isHeartRisk)                                   riskLevel = "Critical";
  else if (isDiabetic || (isHighChol && flags.length >= 3)) riskLevel = "High";
  else if (flags.length >= 2 || deductions >= 20)    riskLevel = "Moderate";
  else                                               riskLevel = "Low";

  // ── Oil recommendation ───────────────────────────────────────────────────────
  const { oilLimit, oilRange, preferredOils, avoidOils, whyRecommendation } =
    getOilRecommendation(riskLevel, isHeartRisk, isDiabetic, isHighChol);

  // ── Nutrition targets ────────────────────────────────────────────────────────
  const nutritionTargets = getNutritionTargets(riskLevel, isDiabetic);

  // ── Recommendations ──────────────────────────────────────────────────────────
  const recommendations = buildRecommendations(flags, isHeartRisk, isDiabetic, isHighChol, params);

  return {
    healthScore,
    oilLimit,
    oilRange,
    riskLevel,
    riskFlags: flags,
    preferredOils,
    avoidOils,
    nutritionTargets,
    recommendations,
    whyRecommendation,
    riskScores,
  };
}

// ── Oil recommendation ────────────────────────────────────────────────────────

function getOilRecommendation(riskLevel, isHeartRisk, isDiabetic, isHighChol) {
  if (isHeartRisk) return {
    oilLimit: 12,
    oilRange: "10–15 ml/day",
    preferredOils: ["Flaxseed Oil", "Extra Virgin Olive Oil"],
    avoidOils: ["Palm Oil", "Coconut Oil", "Vanaspati", "Butter"],
    whyRecommendation:
      "Your cardiovascular markers are critically elevated. Strict oil restriction with heart-healthy unsaturated fats is essential to reduce arterial inflammation.",
  };

  if (isDiabetic) return {
    oilLimit: 18,
    oilRange: "15–20 ml/day",
    preferredOils: ["Mustard Oil", "Olive Oil", "Rice Bran Oil"],
    avoidOils: ["Palm Oil", "Hydrogenated Vegetable Oil", "Coconut Oil"],
    whyRecommendation:
      "Elevated blood sugar requires reduced fat intake to prevent insulin resistance. Low-GI friendly oils with a good fatty acid profile are recommended.",
  };

  if (isHighChol) return {
    oilLimit: 20,
    oilRange: "18–22 ml/day",
    preferredOils: ["Mustard Oil", "Olive Oil", "Sunflower Oil"],
    avoidOils: ["Palm Oil", "Coconut Oil", "Ghee", "Butter"],
    whyRecommendation:
      "High cholesterol calls for reduced saturated fat intake. Unsaturated oils help maintain a healthy LDL/HDL balance.",
  };

  if (riskLevel === "Moderate") return {
    oilLimit: 23,
    oilRange: "20–25 ml/day",
    preferredOils: ["Mustard Oil", "Sunflower Oil", "Rice Bran Oil"],
    avoidOils: ["Hydrogenated Vegetable Oil", "Palm Oil"],
    whyRecommendation:
      "Moderate risk detected. A balanced oil intake with a focus on heart-healthy unsaturated fats is recommended.",
  };

  return {
    oilLimit: 28,
    oilRange: "25–30 ml/day",
    preferredOils: ["Mustard Oil", "Olive Oil", "Groundnut Oil", "Sesame Oil"],
    avoidOils: ["Hydrogenated Vegetable Oil"],
    whyRecommendation:
      "Your health parameters are within normal range. A balanced, diverse oil intake supports optimal nutrition.",
  };
}

// ── Nutrition targets ─────────────────────────────────────────────────────────

function getNutritionTargets(riskLevel, isDiabetic) {
  if (riskLevel === "Critical")      return { protein: 70, fat: 45, carbs: 200 };
  if (isDiabetic)                    return { protein: 75, fat: 55, carbs: 180 };
  if (riskLevel === "High")          return { protein: 70, fat: 55, carbs: 220 };
  if (riskLevel === "Moderate")      return { protein: 65, fat: 60, carbs: 250 };
  return                                    { protein: 60, fat: 65, carbs: 275 };
}

// ── Diet recommendations ──────────────────────────────────────────────────────

function buildRecommendations(flags, isHeartRisk, isDiabetic, isHighChol, params) {
  const recs = [];

  if (isHeartRisk) {
    recs.push("🫀 Consult a cardiologist — your cardiovascular markers need immediate attention.");
    recs.push("🚫 Eliminate fried and deep-fried foods from your diet immediately.");
    recs.push("🏃 Engage in 30–45 minutes of moderate cardio (walking, swimming) daily.");
    recs.push("🧂 Restrict sodium intake to less than 1500 mg/day.");
  }
  if (isDiabetic) {
    recs.push("🩸 Monitor fasting blood sugar daily and consult an endocrinologist.");
    recs.push("🥗 Follow a low-GI diet — include oats, lentils, and non-starchy vegetables.");
    recs.push("🍬 Eliminate added sugars, refined flour (maida), and sugary beverages.");
    recs.push("⏰ Eat small, frequent meals every 3–4 hours to stabilize blood sugar.");
  }
  if (isHighChol) {
    recs.push("🥑 Increase soluble fiber — oats, apples, beans, and barley help reduce LDL.");
    recs.push("🐟 Add omega-3 rich foods: fatty fish (salmon, mackerel), walnuts, flaxseeds.");
    recs.push("🫒 Replace butter and ghee with mustard or olive oil for cooking.");
  }
  if (params.triglycerides != null && params.triglycerides > 200) {
    recs.push("🍺 Avoid alcohol completely — it significantly raises triglyceride levels.");
    recs.push("🍞 Reduce refined carbohydrates: white bread, white rice, sugary snacks.");
  }
  if (params.hdl != null && params.hdl < 40) {
    recs.push("🥜 Include healthy fats: avocado, almonds, walnuts, and unsalted peanut butter.");
    recs.push("🚬 Quitting smoking is the single most effective way to raise HDL.");
  }
  if (params.systolicBP != null && params.systolicBP >= 130) {
    recs.push("🧂 Follow the DASH diet — reduce salt, increase potassium-rich foods.");
    recs.push("🧘 Practice daily stress management: yoga, meditation, or deep breathing.");
  }
  if (params.hemoglobin != null && params.hemoglobin < 12) {
    recs.push("🥬 Increase iron-rich foods: spinach, lentils, red meat, fortified cereals.");
    recs.push("🍊 Pair iron-rich foods with Vitamin C sources to improve absorption.");
  }
  if (params.bmi != null && params.bmi >= 30) {
    recs.push("⚖️ A 5–10% reduction in body weight can significantly improve all markers.");
  }

  if (recs.length === 0) {
    recs.push("✅ Your health parameters look good! Maintain a balanced diet and active lifestyle.");
    recs.push("💧 Stay hydrated — drink 8–10 glasses of water daily.");
    recs.push("🌿 Include a variety of fruits, vegetables, and whole grains in every meal.");
  }

  return recs.slice(0, 8);
}
