function buildResponse(ruleResult, aiResult, paramsList) {
  if (aiResult && !ruleResult) return fromAIOnly(aiResult);
  if (ruleResult && !aiResult) return fromRuleOnly(ruleResult, paramsList);
  if (ruleResult && aiResult) return merge(ruleResult, aiResult, paramsList);
  return null;
}

function normalizeDetailedAnalysis(details, fallback = {}) {
  const source = details && typeof details === 'object' ? details : {};

  return {
    clinical_summary: String(source.clinical_summary || fallback.clinical_summary || '').trim(),
    key_findings: Array.isArray(source.key_findings) && source.key_findings.length > 0
      ? source.key_findings
      : (Array.isArray(fallback.key_findings) ? fallback.key_findings : []),
    critical_alerts: Array.isArray(source.critical_alerts) && source.critical_alerts.length > 0
      ? source.critical_alerts
      : (Array.isArray(fallback.critical_alerts) ? fallback.critical_alerts : []),
    oil_strategy: String(source.oil_strategy || fallback.oil_strategy || '').trim(),
    follow_up_tests: Array.isArray(source.follow_up_tests) && source.follow_up_tests.length > 0
      ? source.follow_up_tests
      : (Array.isArray(fallback.follow_up_tests) ? fallback.follow_up_tests : []),
    doctor_discussion_points: Array.isArray(source.doctor_discussion_points) && source.doctor_discussion_points.length > 0
      ? source.doctor_discussion_points
      : (Array.isArray(fallback.doctor_discussion_points) ? fallback.doctor_discussion_points : []),
  };
}

function buildLifestyleGuidance({ riskLevel, oilLimit, preferredOils, avoidOils, recommendations }) {
  const safeRisk = String(riskLevel || 'Moderate');
  const safeOilLimit = Number.isFinite(Number(oilLimit)) ? Number(oilLimit) : 25;
  const preferred = Array.isArray(preferredOils) ? preferredOils : [];
  const avoid = Array.isArray(avoidOils) ? avoidOils : [];
  const recs = Array.isArray(recommendations) ? recommendations : [];

  const base = [
    {
      title: 'Daily Oil Discipline',
      description: `Keep daily cooking oil near ${safeOilLimit} ml and avoid unmeasured pouring.`,
      action_points: [
        'Use a measuring spoon for every meal.',
        'Split oil budget across breakfast, lunch, and dinner.',
        'Avoid reusing deep-fry oil more than once.',
      ],
    },
    {
      title: 'Oil Quality Strategy',
      description: 'Improve fatty-acid profile by rotating oils and prioritizing unsaturated oils.',
      action_points: [
        preferred.length > 0 ? `Prefer: ${preferred.join(', ')}` : 'Prefer mustard, groundnut, sesame, or olive oil based on cooking style.',
        avoid.length > 0 ? `Limit/Avoid: ${avoid.join(', ')}` : 'Limit hydrogenated and repeatedly heated oils.',
        'Use shallow-cook, steam, saute, or grill more often than deep-frying.',
      ],
    },
    {
      title: 'Lifestyle Maintenance',
      description: `For ${safeRisk.toLowerCase()} risk profile, consistency matters more than short bursts of strict diet.`,
      action_points: [
        'Walk 30-45 minutes most days of the week.',
        'Plan weekly meals to reduce outside fried food frequency.',
        'Repeat key blood tests in 8-12 weeks and track changes.',
      ],
    },
  ];

  if (recs.length > 0) {
    base.push({
      title: 'Personalized Follow-up',
      description: 'These recommendations are derived from your report findings.',
      action_points: recs.slice(0, 3),
    });
  }

  return base;
}

function fromAIOnly(ai) {
  const oil = ai.oil_recommendation || {};
  const healthScore = ai.health_score ?? 50;
  const aiRisks = Array.isArray(ai.risks) ? ai.risks : [];
  const fallbackFactors = aiRisks
    .map((risk) => String(risk?.message || '').trim())
    .filter(Boolean)
    .map((message) => ({
      factor: message,
      value: 'N/A',
      unit: '',
      points: 0,
      status: String(ai.risk_level || 'moderate').toLowerCase(),
      reason: message,
      oil_related: true,
      oil_impact: 'Potentially influenced by oil quality and portion size based on report context.',
    }));

  const baseParameters = Array.isArray(ai.parameters) ? ai.parameters : [];
  const synthesizedFactors = synthesizeFactorsFromParameters(baseParameters);
  const normalizedFactors = Array.isArray(ai.score_breakdown) && ai.score_breakdown.length > 0
    ? ai.score_breakdown
    : (fallbackFactors.length > 0 ? fallbackFactors : synthesizedFactors);

  const normalizedOilImpact = Array.isArray(ai.oil_impact_factors) && ai.oil_impact_factors.length > 0
    ? ai.oil_impact_factors
    : buildOilImpactFromFactors(normalizedFactors);

  const detailedAnalysis = normalizeDetailedAnalysis(ai.detailed_analysis, {
    clinical_summary: ai.summary || 'Detailed report interpretation was generated from AI analysis.',
    key_findings: (Array.isArray(ai.parameters) ? ai.parameters : [])
      .slice(0, 5)
      .map((param) => `${param.name}: ${param.value}${param.unit ? ` ${param.unit}` : ''} (${param.status || 'review'})`),
    critical_alerts: aiRisks
      .filter((risk) => String(risk?.severity || '').toLowerCase() === 'high')
      .map((risk) => String(risk?.message || '').trim())
      .filter(Boolean),
    oil_strategy: String(ai.why_recommendation || 'Control portion size, improve oil quality, and avoid reheated oil.'),
    follow_up_tests: ['Repeat relevant blood profile in 8-12 weeks based on your clinician advice.'],
    doctor_discussion_points: ['Review abnormal markers and medication or diet adjustments required.'],
  });

  return {
    health_score: healthScore,
    oil_limit: oil.daily_ml ?? 25,
    risk_flags: Array.isArray(ai.risks) ? ai.risks.map((r) => r.message).filter(Boolean) : [],
    nutrition_targets: ai.nutrition_targets || { protein: 65, fat: 60, carbs: 250 },
    recommendations: ai.recommendations || [],
    summary: ai.summary || '',
    risk_level: ai.risk_level || 'Moderate',
    parameters: baseParameters,
    oil_range: oil.range || '',
    preferred_oils: oil.preferred_oils || [],
    avoid_oils: oil.avoid_oils || [],
    risks: ai.risks || [],
    diet_suggestions: ai.diet_suggestions || [],
    risk_scores: ai.risk_scores || {},
    why_recommendation: ai.why_recommendation || '',
    health_score_details: {
      max_score: 100,
      final_score: healthScore,
      total_deductions: Math.max(0, 100 - healthScore),
      factors: normalizedFactors,
    },
    oil_impact_factors: normalizedOilImpact,
    detailed_analysis: detailedAnalysis,
    lifestyle_guidance: buildLifestyleGuidance({
      riskLevel: ai.risk_level || 'Moderate',
      oilLimit: oil.daily_ml ?? 25,
      preferredOils: oil.preferred_oils || [],
      avoidOils: oil.avoid_oils || [],
      recommendations: ai.recommendations || [],
    }),
  };
}

function fromRuleOnly(rule, paramsList) {
  const normalizedFactors = (rule.scoreBreakdown && rule.scoreBreakdown.length > 0)
    ? rule.scoreBreakdown
    : synthesizeFactorsFromParameters(paramsList || []);

  const normalizedOilImpact = (rule.oilImpactFactors && rule.oilImpactFactors.length > 0)
    ? rule.oilImpactFactors
    : buildOilImpactFromFactors(normalizedFactors);

  const detailedAnalysis = normalizeDetailedAnalysis(null, {
    clinical_summary: `${rule.riskLevel} risk profile was inferred from extracted report parameters using clinical rules.`,
    key_findings: (paramsList || []).slice(0, 6).map((param) => `${param.name}: ${param.value}${param.unit ? ` ${param.unit}` : ''} (${param.status || 'review'})`),
    critical_alerts: (rule.riskFlags || []).slice(0, 4),
    oil_strategy: rule.whyRecommendation || 'Use measured oil portions and switch to unsaturated oils for daily cooking.',
    follow_up_tests: ['Repeat the key abnormal blood parameters in 8-12 weeks as advised by your doctor.'],
    doctor_discussion_points: ['Discuss whether current risk profile needs medication, dietary, or activity intervention.'],
  });

  return {
    health_score: rule.healthScore,
    oil_limit: rule.oilLimit,
    risk_flags: rule.riskFlags,
    nutrition_targets: rule.nutritionTargets,
    recommendations: rule.recommendations,
    summary: `${rule.riskLevel} risk identified using clinical rule analysis.`,
    risk_level: rule.riskLevel,
    parameters: paramsList || [],
    oil_range: rule.oilRange,
    preferred_oils: rule.preferredOils,
    avoid_oils: rule.avoidOils,
    risks: (rule.riskFlags || []).map((flag) => ({ severity: 'warning', message: flag })),
    diet_suggestions: [],
    risk_scores: rule.riskScores || {},
    why_recommendation: rule.whyRecommendation || '',
    health_score_details: {
      max_score: 100,
      final_score: rule.healthScore,
      total_deductions: Math.max(0, 100 - rule.healthScore),
      factors: normalizedFactors,
    },
    oil_impact_factors: normalizedOilImpact,
    detailed_analysis: detailedAnalysis,
    lifestyle_guidance: buildLifestyleGuidance({
      riskLevel: rule.riskLevel,
      oilLimit: rule.oilLimit,
      preferredOils: rule.preferredOils,
      avoidOils: rule.avoidOils,
      recommendations: rule.recommendations,
    }),
  };
}

function merge(rule, ai, paramsList) {
  const aiOil = ai.oil_recommendation || {};
  const aiRisks = Array.isArray(ai.risks) ? ai.risks : [];
  const ruleRisks = (rule.riskFlags || []).map((flag) => ({ severity: 'warning', message: flag }));

  const seen = new Set();
  const dedupedRisks = [...aiRisks, ...ruleRisks].filter((risk) => {
    const msg = String(risk?.message || '').trim().toLowerCase();
    if (!msg || seen.has(msg)) return false;
    seen.add(msg);
    return true;
  });

  const resolvedParameters = (Array.isArray(ai.parameters) && ai.parameters.length > 0)
    ? ai.parameters
    : (paramsList || []);

  const mergedFactors = (Array.isArray(ai.score_breakdown) && ai.score_breakdown.length > 0)
    ? ai.score_breakdown
    : ((rule.scoreBreakdown && rule.scoreBreakdown.length > 0)
      ? rule.scoreBreakdown
      : synthesizeFactorsFromParameters(resolvedParameters));

  const mergedOilFactors = (Array.isArray(ai.oil_impact_factors) && ai.oil_impact_factors.length > 0)
    ? ai.oil_impact_factors
    : ((rule.oilImpactFactors && rule.oilImpactFactors.length > 0)
      ? rule.oilImpactFactors
      : buildOilImpactFromFactors(mergedFactors));

  const detailedAnalysis = normalizeDetailedAnalysis(ai.detailed_analysis, {
    clinical_summary: ai.summary || `${rule.riskLevel} risk identified from extracted report values with AI interpretation.`,
    key_findings: resolvedParameters
      .slice(0, 6)
      .map((param) => `${param.name}: ${param.value}${param.unit ? ` ${param.unit}` : ''} (${param.status || 'review'})`),
    critical_alerts: dedupedRisks
      .filter((risk) => String(risk?.severity || '').toLowerCase() === 'high')
      .map((risk) => String(risk?.message || '').trim())
      .filter(Boolean),
    oil_strategy: ai.why_recommendation || rule.whyRecommendation || 'Keep daily oil measured and favor unsaturated oil rotation.',
    follow_up_tests: ['Repeat key blood markers in 8-12 weeks and compare trend.'],
    doctor_discussion_points: ['Review high-risk parameters and whether treatment plan changes are needed.'],
  });

  return {
    health_score: rule.healthScore,
    oil_limit: rule.oilLimit,
    risk_flags: rule.riskFlags,
    nutrition_targets: ai.nutrition_targets || rule.nutritionTargets,
    recommendations: (Array.isArray(ai.recommendations) && ai.recommendations.length > 0)
      ? ai.recommendations
      : rule.recommendations,
    summary: ai.summary || `${rule.riskLevel} risk identified from extracted report values.`,
    risk_level: rule.riskLevel,
    parameters: resolvedParameters,
    oil_range: rule.oilRange,
    preferred_oils: (Array.isArray(aiOil.preferred_oils) && aiOil.preferred_oils.length > 0)
      ? aiOil.preferred_oils
      : rule.preferredOils,
    avoid_oils: (Array.isArray(aiOil.avoid_oils) && aiOil.avoid_oils.length > 0)
      ? aiOil.avoid_oils
      : rule.avoidOils,
    risks: dedupedRisks,
    diet_suggestions: ai.diet_suggestions || [],
    risk_scores: rule.riskScores || {},
    why_recommendation: ai.why_recommendation || rule.whyRecommendation || '',
    health_score_details: {
      max_score: 100,
      final_score: rule.healthScore,
      total_deductions: Math.max(0, 100 - rule.healthScore),
      factors: mergedFactors,
    },
    oil_impact_factors: mergedOilFactors,
    detailed_analysis: detailedAnalysis,
    lifestyle_guidance: buildLifestyleGuidance({
      riskLevel: rule.riskLevel,
      oilLimit: rule.oilLimit,
      preferredOils: (Array.isArray(aiOil.preferred_oils) && aiOil.preferred_oils.length > 0) ? aiOil.preferred_oils : rule.preferredOils,
      avoidOils: (Array.isArray(aiOil.avoid_oils) && aiOil.avoid_oils.length > 0) ? aiOil.avoid_oils : rule.avoidOils,
      recommendations: (Array.isArray(ai.recommendations) && ai.recommendations.length > 0) ? ai.recommendations : rule.recommendations,
    }),
  };
}

function synthesizeFactorsFromParameters(parameters) {
  const list = Array.isArray(parameters) ? parameters : [];

  if (list.length === 0) {
    return [{
      factor: 'Report Quality',
      value: 'N/A',
      unit: '',
      points: 0,
      status: 'info',
      reason: 'No measurable parameters were extracted from this report.',
      oil_related: false,
      oil_impact: '',
    }];
  }

  return list.map((param) => ({
    factor: param.name,
    value: param.value,
    unit: param.unit || '',
    points: 0,
    status: String(param.status || 'info'),
    reason: `${param.name} is currently marked as ${String(param.status || 'info')}.`,
    oil_related: isOilSensitiveFactor(param.name),
    oil_impact: isOilSensitiveFactor(param.name)
      ? `${param.name} can shift with oil quality and daily oil quantity.`
      : '',
  }));
}

function buildOilImpactFromFactors(factors) {
  const list = Array.isArray(factors) ? factors : [];
  const oilRelated = list.filter((factor) => factor && factor.oil_related);

  if (oilRelated.length === 0) {
    return [{
      factor: 'No major oil-sensitive abnormality detected',
      current_value: 'Stable',
      impact_level: 'Mild',
      from_report: 'Current extracted metrics do not show a strong oil-driven abnormal pattern.',
      why_it_matters: 'Maintaining oil moderation helps preserve this profile.',
      suggested_action: 'Continue measured oil intake and periodic monitoring.',
    }];
  }

  return oilRelated.map((factor) => ({
    factor: factor.factor,
    current_value: `${factor.value || 'N/A'}${factor.unit ? ` ${factor.unit}` : ''}`.trim(),
    impact_level: factor.points >= 20 ? 'High' : factor.points >= 10 ? 'Moderate' : 'Mild',
    from_report: factor.reason,
    why_it_matters: factor.oil_impact || `${factor.factor} may be influenced by fat quality and oil quantity.`,
    suggested_action: 'Use measured daily oil portions and prefer unsaturated oils.',
  }));
}

function isOilSensitiveFactor(name) {
  const key = String(name || '').toLowerCase();
  return (
    key.includes('cholesterol')
    || key.includes('ldl')
    || key.includes('hdl')
    || key.includes('triglycerides')
    || key.includes('blood sugar')
    || key.includes('hba1c')
    || key.includes('bmi')
    || key.includes('bp')
    || key.includes('uric')
  );
}

module.exports = {
  buildResponse,
};
