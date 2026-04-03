// src/services/response.service.js
// Merges rule engine output and AI result into the final API response shape.
// Exactly matches the TypeScript MedicalReportAnalysis interface in the RN frontend.

/**
 * Build the unified response from whatever combination of results we have.
 * Priority: rule engine for hard numbers, AI for narrative.
 *
 * @param {import('./risk.service.js').RiskResult|null} ruleResult
 * @param {Object|null} aiResult
 * @param {Array} paramsList
 * @returns {Object|null}
 */
export function buildResponse(ruleResult, aiResult, paramsList) {
  if (aiResult && !ruleResult)  return fromAIOnly(aiResult);
  if (ruleResult && !aiResult)  return fromRuleOnly(ruleResult, paramsList);
  if (ruleResult && aiResult)   return merge(ruleResult, aiResult, paramsList);
  return null;
}

// ── Vision-only path (OCR failed, no rule engine) ─────────────────────────────

function fromAIOnly(ai) {
  const oil = ai.oil_recommendation ?? {};
  const healthScore = ai.health_score ?? 50;
  const aiRisks = Array.isArray(ai.risks) ? ai.risks : [];
  const fallbackFactors = aiRisks
    .map(r => String(r?.message || '').trim())
    .filter(Boolean)
    .map(message => ({
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

  return {
    // Core TypeScript interface fields
    health_score:       healthScore,
    oil_limit:          oil.daily_ml ?? 25,
    risk_flags:         (ai.risks ?? []).filter(r => r.severity === "danger").map(r => r.message),
    nutrition_targets:  ai.nutrition_targets ?? { protein: 65, fat: 60, carbs: 250 },
    recommendations:    ai.recommendations ?? [],
    // Extended fields
    summary:            ai.summary ?? "",
    risk_level:         ai.risk_level ?? "Moderate",
    parameters:         baseParameters,
    oil_range:          oil.range ?? "",
    preferred_oils:     oil.preferred_oils ?? [],
    avoid_oils:         oil.avoid_oils ?? [],
    risks:              ai.risks ?? [],
    diet_suggestions:   ai.diet_suggestions ?? [],
    risk_scores:        ai.risk_scores ?? {},
    why_recommendation: ai.why_recommendation ?? "",
    health_score_details: {
      max_score: 100,
      final_score: healthScore,
      total_deductions: Math.max(0, 100 - healthScore),
      factors: normalizedFactors,
    },
    oil_impact_factors: normalizedOilImpact,
  };
}

// ── Rule-only path (AI call failed) ──────────────────────────────────────────

function fromRuleOnly(rule, paramsList) {
  const normalizedFactors = (rule.scoreBreakdown && rule.scoreBreakdown.length > 0)
    ? rule.scoreBreakdown
    : synthesizeFactorsFromParameters(paramsList || []);

  const normalizedOilImpact = (rule.oilImpactFactors && rule.oilImpactFactors.length > 0)
    ? rule.oilImpactFactors
    : buildOilImpactFromFactors(normalizedFactors);

  return {
    health_score:       rule.healthScore,
    oil_limit:          rule.oilLimit,
    risk_flags:         rule.riskFlags,
    nutrition_targets:  rule.nutritionTargets,
    recommendations:    rule.recommendations,
    summary:            `${rule.riskLevel} health risk detected. ${rule.riskFlags.length} issue(s) identified.`,
    risk_level:         rule.riskLevel,
    parameters:         paramsList,
    oil_range:          rule.oilRange,
    preferred_oils:     rule.preferredOils,
    avoid_oils:         rule.avoidOils,
    risks:              rule.riskFlags.map(f => ({ severity: "danger", message: f })),
    diet_suggestions:   [],
    risk_scores:        rule.riskScores,
    why_recommendation: rule.whyRecommendation,
    health_score_details: {
      max_score: 100,
      final_score: rule.healthScore,
      total_deductions: Math.max(0, 100 - rule.healthScore),
      factors: normalizedFactors,
    },
    oil_impact_factors: normalizedOilImpact,
  };
}

// ── Merged path (both available — best quality) ───────────────────────────────

function merge(rule, ai, paramsList) {
  const aiOil = ai.oil_recommendation ?? {};

  // Merge risk lists — rule flags + AI risks, deduplicated
  const aiRisks   = ai.risks ?? [];
  const ruleRisks = rule.riskFlags.map(f => ({ severity: "danger", message: f }));
  const seen      = new Set();
  const allRisks  = [...aiRisks, ...ruleRisks].filter(r => {
    const key = (r.message ?? "").slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const resolvedParameters = ai.parameters?.length ? ai.parameters : paramsList;

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

  return {
    // Core TypeScript interface — rule engine wins for numbers (deterministic)
    health_score:       rule.healthScore,
    oil_limit:          rule.oilLimit,
    risk_flags:         rule.riskFlags,
    nutrition_targets:  ai.nutrition_targets ?? rule.nutritionTargets,
    recommendations:    ai.recommendations?.length ? ai.recommendations : rule.recommendations,
    // Extended — AI wins for narrative
    summary:            ai.summary || `${rule.riskLevel} risk. ${rule.riskFlags.length} flag(s) found.`,
    risk_level:         rule.riskLevel,
    parameters:         resolvedParameters,
    oil_range:          rule.oilRange,
    preferred_oils:     aiOil.preferred_oils?.length ? aiOil.preferred_oils : rule.preferredOils,
    avoid_oils:         aiOil.avoid_oils?.length ? aiOil.avoid_oils : rule.avoidOils,
    risks:              allRisks.slice(0, 8),
    diet_suggestions:   ai.diet_suggestions ?? [],
    risk_scores:        rule.riskScores,
    why_recommendation: ai.why_recommendation || rule.whyRecommendation,
    health_score_details: {
      max_score: 100,
      final_score: rule.healthScore,
      total_deductions: Math.max(0, 100 - rule.healthScore),
      factors: mergedFactors,
    },
    oil_impact_factors: mergedOilFactors,
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
