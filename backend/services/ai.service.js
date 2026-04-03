// src/services/ai.service.js
// Claude AI layer:
//   enrichWithAI()    → enhances rule-based results with narrative, diet, explanation
//   analyzeWithVision() → Vision fallback when OCR text is insufficient
//   analyzeTextOnly() → direct text analysis (no rule engine)

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a clinical AI health analyst assistant.
Analyze the provided medical data and return ONLY a valid JSON object — no markdown fences, no preamble, no explanation outside the JSON.

Required structure:
{
  "health_score": <int 0-100>,
  "summary": "<2-3 sentence plain-English health summary>",
  "risk_level": "Low|Moderate|High|Critical",
  "parameters": [
    { "name": "...", "value": "...", "unit": "...", "status": "normal|high|low|borderline" }
  ],
  "oil_recommendation": {
    "daily_ml": <int>,
    "range": "<e.g. 18-22 ml/day>",
    "preferred_oils": ["..."],
    "avoid_oils": ["..."]
  },
  "risks": [
    { "severity": "danger|warning|info", "message": "..." }
  ],
  "diet_suggestions": [
    { "title": "...", "detail": "...", "icon": "<emoji>" }
  ],
  "risk_scores": {
    "cardiovascular": <0-100>,
    "diabetes": <0-100>,
    "hypertension": <0-100>,
    "inflammation": <0-100>
  },
  "why_recommendation": "<explanation of oil recommendation>",
  "nutrition_targets": { "protein": <g>, "fat": <g>, "carbs": <g> },
  "recommendations": ["<string>"]
}
Be clinically accurate. Skip parameters not present in the data.`;

/**
 * Parse JSON safely — strip markdown fences if present.
 * @param {string} text
 * @returns {Object|null}
 */
function parseJSON(text) {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

/**
 * Enrich rule-based results with Claude narrative + diet suggestions.
 * Normal path — called when OCR is sufficient and rule engine ran.
 *
 * @param {string} ocrText
 * @param {import('./risk.service.js').RiskResult} ruleResult
 * @param {Array} paramsList
 * @returns {Promise<Object|null>}
 */
export async function enrichWithAI(ocrText, ruleResult, paramsList) {
  const prompt = `
Here is the extracted text from a patient's medical report (via OCR):

--- REPORT TEXT ---
${ocrText.slice(0, 4000)}
--- END REPORT ---

Our rule-based engine extracted these findings:
- Health Score: ${ruleResult.healthScore}/100
- Risk Level: ${ruleResult.riskLevel}
- Risk Flags: ${ruleResult.riskFlags.length ? ruleResult.riskFlags.join(", ") : "None"}
- Parameters: ${JSON.stringify(paramsList)}
- Oil Limit: ${ruleResult.oilLimit} ml/day (${ruleResult.oilRange})

Analyze the full report text, validate and enhance these findings, and return the complete JSON.
`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content.map((b) => b.text ?? "").join("");
    return parseJSON(text);
  } catch (err) {
    console.error("[AI] enrichWithAI failed:", err.message);
    return null;
  }
}

/**
 * Send image directly to Claude Vision when OCR yields < 50 characters.
 *
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @param {Object|null} ruleResult
 * @returns {Promise<Object|null>}
 */
export async function analyzeWithVision(buffer, mimetype, ruleResult) {
  const base64Data = buffer.toString("base64");

  const content = [
    {
      type: "image",
      source: { type: "base64", media_type: mimetype, data: base64Data },
    },
    {
      type: "text",
      text: "Analyze this medical/blood test report image and return the complete JSON health analysis.",
    },
  ];

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });
    const text = response.content.map((b) => b.text ?? "").join("");
    return parseJSON(text);
  } catch (err) {
    console.error("[AI] analyzeWithVision failed:", err.message);
    return null;
  }
}

