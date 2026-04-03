function analyzeRisk(params) {
  let deductions = 0;
  const riskFlags = [];
  const scoreBreakdown = [];
  const riskScores = {
    cardiovascular: 0,
    diabetes: 0,
    hypertension: 0,
    inflammation: 0,
  };

  const addFlag = (flag) => {
    if (!riskFlags.includes(flag)) riskFlags.push(flag);
  };

  const addDeduction = ({
    factor,
    value,
    unit,
    points,
    status,
    reason,
    oilRelated = false,
    oilImpact = '',
  }) => {
    deductions += points;
    scoreBreakdown.push({
      factor,
      value,
      unit,
      points,
      status,
      reason,
      oil_related: oilRelated,
      oil_impact: oilImpact,
    });
  };

  if (params.cholesterol != null) {
    if (params.cholesterol > 240) {
      addDeduction({
        factor: 'Total Cholesterol',
        value: params.cholesterol,
        unit: 'mg/dL',
        points: 20,
        status: 'high',
        reason: 'Total cholesterol is above 240 mg/dL.',
        oilRelated: true,
        oilImpact: 'Higher saturated and trans-fat intake can worsen cholesterol levels.',
      });
      riskScores.cardiovascular += 35;
      addFlag('High total cholesterol');
    } else if (params.cholesterol > 200) {
      addDeduction({
        factor: 'Total Cholesterol',
        value: params.cholesterol,
        unit: 'mg/dL',
        points: 10,
        status: 'borderline',
        reason: 'Total cholesterol is in the borderline high range (200-240 mg/dL).',
        oilRelated: true,
        oilImpact: 'Daily oil quality and quantity can influence cholesterol progression.',
      });
      riskScores.cardiovascular += 20;
      addFlag('Borderline cholesterol');
    }
  }

  if (params.ldl != null) {
    if (params.ldl > 160) {
      addDeduction({
        factor: 'LDL',
        value: params.ldl,
        unit: 'mg/dL',
        points: 20,
        status: 'high',
        reason: 'LDL is above 160 mg/dL.',
        oilRelated: true,
        oilImpact: 'Poor-fat-profile oils and fried foods can increase LDL burden.',
      });
      riskScores.cardiovascular += 30;
      riskScores.inflammation += 20;
      addFlag('Very high LDL');
    } else if (params.ldl > 130) {
      addDeduction({
        factor: 'LDL',
        value: params.ldl,
        unit: 'mg/dL',
        points: 12,
        status: 'high',
        reason: 'LDL is above 130 mg/dL.',
        oilRelated: true,
        oilImpact: 'Improving oil type (more MUFA/PUFA) may help control LDL.',
      });
      riskScores.cardiovascular += 20;
      addFlag('High LDL');
    }
  }

  if (params.hdl != null && params.hdl < 40) {
    addDeduction({
      factor: 'HDL',
      value: params.hdl,
      unit: 'mg/dL',
      points: 15,
      status: 'low',
      reason: 'HDL is below 40 mg/dL.',
      oilRelated: true,
      oilImpact: 'Repeated use of low-quality oils can reduce protective lipid balance.',
    });
    riskScores.cardiovascular += 25;
    addFlag('Low HDL');
  }

  if (params.triglycerides != null) {
    if (params.triglycerides > 500) {
      addDeduction({
        factor: 'Triglycerides',
        value: params.triglycerides,
        unit: 'mg/dL',
        points: 25,
        status: 'high',
        reason: 'Triglycerides are above 500 mg/dL.',
        oilRelated: true,
        oilImpact: 'Excess fried/oily food can sharply increase triglycerides.',
      });
      riskScores.cardiovascular += 35;
      riskScores.inflammation += 30;
      addFlag('Very high triglycerides');
    } else if (params.triglycerides > 200) {
      addDeduction({
        factor: 'Triglycerides',
        value: params.triglycerides,
        unit: 'mg/dL',
        points: 15,
        status: 'high',
        reason: 'Triglycerides are above 200 mg/dL.',
        oilRelated: true,
        oilImpact: 'Reducing deep-fried and high-oil meals can improve triglycerides.',
      });
      riskScores.cardiovascular += 20;
      riskScores.inflammation += 15;
      addFlag('High triglycerides');
    }
  }

  if (params.bloodSugar != null) {
    if (params.bloodSugar >= 200) {
      addDeduction({
        factor: 'Blood Sugar',
        value: params.bloodSugar,
        unit: 'mg/dL',
        points: 25,
        status: 'high',
        reason: 'Blood sugar is in diabetic range (>=200 mg/dL).',
        oilRelated: true,
        oilImpact: 'High-oil, calorie-dense food patterns can worsen insulin resistance.',
      });
      riskScores.diabetes += 70;
      addFlag('Diabetic blood sugar range');
    } else if (params.bloodSugar >= 126) {
      addDeduction({
        factor: 'Blood Sugar',
        value: params.bloodSugar,
        unit: 'mg/dL',
        points: 20,
        status: 'high',
        reason: 'Blood sugar is above 126 mg/dL.',
        oilRelated: true,
        oilImpact: 'Lower oil-heavy meals can support better glucose control.',
      });
      riskScores.diabetes += 60;
      addFlag('High blood sugar');
    } else if (params.bloodSugar >= 100) {
      addDeduction({
        factor: 'Blood Sugar',
        value: params.bloodSugar,
        unit: 'mg/dL',
        points: 10,
        status: 'borderline',
        reason: 'Blood sugar is in prediabetic range (100-125 mg/dL).',
        oilRelated: true,
        oilImpact: 'Controlling high-oil processed meals may reduce metabolic stress.',
      });
      riskScores.diabetes += 35;
      addFlag('Prediabetic blood sugar');
    }
  }

  if (params.hba1c != null) {
    if (params.hba1c >= 6.5) {
      addDeduction({
        factor: 'HbA1c',
        value: params.hba1c,
        unit: '%',
        points: 20,
        status: 'high',
        reason: 'HbA1c is in diabetic range (>=6.5%).',
        oilRelated: true,
        oilImpact: 'Sustained excess calories from oil-rich foods can worsen glycemic control.',
      });
      riskScores.diabetes += 50;
      addFlag('Diabetic HbA1c');
    } else if (params.hba1c >= 5.7) {
      addDeduction({
        factor: 'HbA1c',
        value: params.hba1c,
        unit: '%',
        points: 10,
        status: 'borderline',
        reason: 'HbA1c is in prediabetic range (5.7-6.4%).',
        oilRelated: true,
        oilImpact: 'Better oil portion control supports long-term glucose balance.',
      });
      riskScores.diabetes += 25;
      addFlag('Prediabetic HbA1c');
    }
  }

  if (params.systolicBP != null) {
    if (params.systolicBP >= 140) {
      addDeduction({
        factor: 'Systolic BP',
        value: params.systolicBP,
        unit: 'mmHg',
        points: 20,
        status: 'high',
        reason: 'Systolic blood pressure is in stage 2 range (>=140).',
        oilRelated: true,
        oilImpact: 'Frequent high-oil meals may contribute to poor vascular health and BP risk.',
      });
      riskScores.hypertension += 70;
      riskScores.cardiovascular += 20;
      addFlag('Stage 2 hypertension');
    } else if (params.systolicBP >= 130) {
      addDeduction({
        factor: 'Systolic BP',
        value: params.systolicBP,
        unit: 'mmHg',
        points: 12,
        status: 'high',
        reason: 'Systolic blood pressure is in stage 1 range (130-139).',
        oilRelated: true,
        oilImpact: 'Improved fat quality and lower oil intake can support BP-friendly eating.',
      });
      riskScores.hypertension += 45;
      riskScores.cardiovascular += 15;
      addFlag('Stage 1 hypertension');
    }
  }

  if (params.bmi != null) {
    if (params.bmi >= 35) {
      addDeduction({
        factor: 'BMI',
        value: params.bmi,
        unit: 'kg/m2',
        points: 15,
        status: 'high',
        reason: 'BMI indicates severe obesity (>=35).',
        oilRelated: true,
        oilImpact: 'Excess oil intake can increase total daily calories and weight burden.',
      });
      addFlag('Severe obesity');
    } else if (params.bmi >= 30) {
      addDeduction({
        factor: 'BMI',
        value: params.bmi,
        unit: 'kg/m2',
        points: 10,
        status: 'high',
        reason: 'BMI indicates obesity (>=30).',
        oilRelated: true,
        oilImpact: 'Reducing oil quantity can help calorie control and weight management.',
      });
      addFlag('Obesity');
    } else if (params.bmi >= 25) {
      addDeduction({
        factor: 'BMI',
        value: params.bmi,
        unit: 'kg/m2',
        points: 5,
        status: 'borderline',
        reason: 'BMI indicates overweight (25-29.9).',
        oilRelated: true,
        oilImpact: 'Moderating oil portions helps prevent further weight gain.',
      });
      addFlag('Overweight');
    }
  }

  if (params.hemoglobin != null && params.hemoglobin < 11) {
    addDeduction({
      factor: 'Hemoglobin',
      value: params.hemoglobin,
      unit: 'g/dL',
      points: 10,
      status: 'low',
      reason: 'Hemoglobin is below 11 g/dL.',
    });
    riskScores.inflammation += 15;
    addFlag('Low hemoglobin');
  }

  if (params.uricAcid != null && params.uricAcid > 7) {
    addDeduction({
      factor: 'Uric Acid',
      value: params.uricAcid,
      unit: 'mg/dL',
      points: 8,
      status: 'high',
      reason: 'Uric acid is above 7 mg/dL.',
      oilRelated: true,
      oilImpact: 'Fried and rich foods can aggravate inflammation and uric-acid burden.',
    });
    riskScores.inflammation += 20;
    addFlag('High uric acid');
  }

  Object.keys(riskScores).forEach((k) => {
    riskScores[k] = Math.min(100, Math.max(0, riskScores[k]));
  });

  const healthScore = Math.max(0, Math.min(100, 100 - deductions));

  const highChol = (params.cholesterol != null && params.cholesterol > 240)
    || (params.ldl != null && params.ldl > 130);
  const diabetic = (params.bloodSugar != null && params.bloodSugar >= 126)
    || (params.hba1c != null && params.hba1c >= 6.5);
  const critical = riskScores.cardiovascular >= 60
    || (params.ldl != null && params.ldl > 160)
    || (params.systolicBP != null && params.systolicBP >= 140);

  let riskLevel = 'Low';
  if (critical) {
    riskLevel = 'Critical';
  } else if (diabetic || (highChol && riskFlags.length >= 3)) {
    riskLevel = 'High';
  } else if (riskFlags.length >= 2 || deductions >= 20) {
    riskLevel = 'Moderate';
  }

  let oilLimit = 28;
  let oilRange = '25-30 ml/day';
  let preferredOils = ['Mustard', 'Olive', 'Groundnut', 'Sesame'];
  let avoidOils = [];
  let nutritionTargets = { protein: 60, fat: 65, carbs: 275 };

  if (riskLevel === 'Critical') {
    oilLimit = 12;
    oilRange = '10-15 ml/day';
    preferredOils = ['Flaxseed', 'Extra Virgin Olive'];
    avoidOils = ['Palm Oil', 'Coconut Oil', 'Hydrogenated Vegetable Oil'];
    nutritionTargets = { protein: 70, fat: 45, carbs: 200 };
  } else if (diabetic) {
    oilLimit = 18;
    oilRange = '15-20 ml/day';
    preferredOils = ['Mustard', 'Olive', 'Rice Bran'];
    avoidOils = ['Palm Oil', 'Coconut Oil', 'Hydrogenated Vegetable Oil'];
    nutritionTargets = { protein: 75, fat: 55, carbs: 180 };
  } else if (highChol) {
    oilLimit = 20;
    oilRange = '18-22 ml/day';
    preferredOils = ['Mustard', 'Olive', 'Sunflower'];
    avoidOils = ['Palm Oil', 'Coconut Oil', 'Hydrogenated Vegetable Oil'];
    nutritionTargets = { protein: 70, fat: 55, carbs: 220 };
  } else if (riskLevel === 'Moderate') {
    oilLimit = 23;
    oilRange = '20-25 ml/day';
    preferredOils = ['Mustard', 'Sunflower', 'Rice Bran'];
    nutritionTargets = { protein: 65, fat: 60, carbs: 250 };
  }

  const recommendations = buildRecommendations(riskLevel, riskFlags);
  const whyRecommendation = buildWhyRecommendation(riskLevel, diabetic, highChol, critical);
  const oilImpactFactors = buildOilImpactFactors(scoreBreakdown);

  return {
    healthScore,
    oilLimit,
    oilRange,
    riskLevel,
    riskFlags,
    preferredOils,
    avoidOils,
    nutritionTargets,
    recommendations,
    whyRecommendation,
    riskScores,
    scoreBreakdown,
    oilImpactFactors,
  };
}

function buildOilImpactFactors(scoreBreakdown) {
  const oilRelated = (scoreBreakdown || []).filter((item) => item.oil_related);
  const dedup = new Map();

  oilRelated.forEach((item) => {
    const key = String(item.factor || '').toLowerCase();
    const existing = dedup.get(key);
    if (!existing || item.points > existing.points) {
      dedup.set(key, item);
    }
  });

  return Array.from(dedup.values()).map((item) => ({
    factor: item.factor,
    current_value: `${item.value} ${item.unit || ''}`.trim(),
    impact_level: item.points >= 20 ? 'High' : item.points >= 10 ? 'Moderate' : 'Mild',
    from_report: item.reason,
    why_it_matters: item.oil_impact,
    suggested_action: suggestedActionForFactor(item.factor),
  }));
}

function suggestedActionForFactor(factor) {
  const key = String(factor || '').toLowerCase();

  if (key.includes('cholesterol') || key.includes('ldl') || key.includes('triglycerides')) {
    return 'Prefer unsaturated oils (mustard/olive), avoid reheated oil, and keep fried foods occasional.';
  }

  if (key.includes('hba1c') || key.includes('blood sugar')) {
    return 'Reduce oil-heavy refined meals and use measured oil portions in home-cooked food.';
  }

  if (key.includes('bp')) {
    return 'Choose low-saturated-fat oils and avoid repeated deep-frying to support cardiovascular health.';
  }

  if (key.includes('bmi')) {
    return 'Track total daily oil in ml and prioritize grilling/steaming over deep frying.';
  }

  if (key.includes('uric')) {
    return 'Limit fried foods and maintain hydration to reduce inflammatory load.';
  }

  return 'Follow an oil-controlled meal pattern and repeat labs to monitor improvement.';
}

function buildRecommendations(riskLevel, riskFlags) {
  const recs = [];

  if (riskLevel === 'Critical') {
    recs.push('Consult a physician promptly for clinical follow-up.');
    recs.push('Avoid fried and processed high-fat foods.');
  } else if (riskLevel === 'High') {
    recs.push('Follow a strict low-saturated-fat diet plan.');
    recs.push('Track blood glucose and lipid profile regularly.');
  } else if (riskLevel === 'Moderate') {
    recs.push('Increase daily physical activity and hydration.');
    recs.push('Prefer home-cooked meals with controlled oil portions.');
  } else {
    recs.push('Maintain current healthy lifestyle and routine checkups.');
  }

  if (riskFlags.length === 0) {
    recs.push('Continue balanced meals with vegetables, protein, and whole grains.');
  }

  return recs;
}

function buildWhyRecommendation(riskLevel, diabetic, highChol, critical) {
  if (critical) {
    return 'Critical cardiovascular risk requires tighter daily oil restriction and high-unsaturated oil choices.';
  }
  if (diabetic) {
    return 'Diabetic markers benefit from lower total oil intake and metabolically favorable oils.';
  }
  if (highChol) {
    return 'High cholesterol indicators require reduced saturated fat and cholesterol-friendly oils.';
  }
  if (riskLevel === 'Moderate') {
    return 'Moderate risk suggests controlled oil intake with a heart-healthy oil mix.';
  }
  return 'Current metrics support a standard balanced oil pattern with moderation.';
}

module.exports = {
  analyzeRisk,
};
