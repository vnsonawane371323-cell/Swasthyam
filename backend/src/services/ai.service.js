const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are a clinical AI analyst. Return ONLY valid JSON with these fields:
health_score, summary, risk_level, parameters[], oil_recommendation{daily_ml, range, preferred_oils[], avoid_oils[]},
risks[{severity, message}], diet_suggestions[{title, detail, icon}],
risk_scores{cardiovascular, diabetes, hypertension, inflammation},
why_recommendation, nutrition_targets{protein,fat,carbs}, recommendations[]`; 

function safeParseJSON(raw) {
  try {
    const normalized = String(raw || '').replace(/```json|```/g, '').trim();
    return JSON.parse(normalized);
  } catch (_err) {
    return null;
  }
}

function getAvailableOpenRouterKeys() {
  return [process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_OIL_SCAN_API_KEY].filter(Boolean);
}

async function callOpenRouterWithFallback(messages) {
  const keys = getAvailableOpenRouterKeys();
  if (keys.length === 0) return null;

  for (const key of keys) {
    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: 'google/gemini-2.0-flash-001',
          messages,
          temperature: 0.2,
          max_tokens: 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://swasthtel.app',
            'X-Title': 'SwasthTel Health Report Analyzer',
          },
          timeout: 45000,
        }
      );

      return response?.data?.choices?.[0]?.message?.content || null;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        continue;
      }
      return null;
    }
  }

  return null;
}

async function enrichWithAI(ocrText, ruleResult, paramsList) {
  try {
    const prompt = `OCR Text:\n${String(ocrText || '').slice(0, 6000)}\n\nRule Findings:\n${JSON.stringify({ ruleResult, paramsList })}`;

    const text = await callOpenRouterWithFallback([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ]);

    if (!text) return null;

    return safeParseJSON(text);
  } catch (_err) {
    return null;
  }
}

async function analyzeWithVision(buffer, mimetype, ruleResult) {
  try {
    const base64 = buffer.toString('base64');

    const text = await callOpenRouterWithFallback([
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this medical report image. Context from rule engine (if any): ${JSON.stringify(ruleResult || null)}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimetype};base64,${base64}`,
            },
          },
        ],
      },
    ]);

    if (!text) return null;

    return safeParseJSON(text);
  } catch (_err) {
    return null;
  }
}

module.exports = {
  enrichWithAI,
  analyzeWithVision,
};
