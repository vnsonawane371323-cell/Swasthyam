const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const SYSTEM_PROMPT = `You are a clinical AI analyst specialized in Indian health reports and oil-consumption guidance.
Return ONLY valid JSON (no markdown, no extra text) with this exact schema:
{
  "health_score": number,
  "summary": string,
  "risk_level": "Low"|"Moderate"|"High",
  "parameters": [
    {"name": string, "value": string|number, "unit": string, "status": "normal"|"borderline"|"high"|"low"|"critical", "reference_range": string, "clinical_note": string}
  ],
  "oil_recommendation": {
    "daily_ml": number,
    "range": string,
    "preferred_oils": string[],
    "avoid_oils": string[]
  },
  "risks": [{"severity": "low"|"moderate"|"high", "message": string}],
  "diet_suggestions": [{"title": string, "detail": string, "icon": string}],
  "risk_scores": {"cardiovascular": number, "diabetes": number, "hypertension": number, "inflammation": number},
  "why_recommendation": string,
  "nutrition_targets": {"protein": number, "fat": number, "carbs": number},
  "recommendations": string[],
  "score_breakdown": [{"factor": string, "value": string, "unit": string, "points": number, "status": string, "reason": string, "oil_related": boolean, "oil_impact": string}],
  "oil_impact_factors": [{"factor": string, "current_value": string, "impact_level": "Mild"|"Moderate"|"High", "from_report": string, "why_it_matters": string, "suggested_action": string}],
  "detailed_analysis": {
    "clinical_summary": string,
    "key_findings": string[],
    "critical_alerts": string[],
    "oil_strategy": string,
    "follow_up_tests": string[],
    "doctor_discussion_points": string[]
  }
}
Rules:
- Be specific to values in the report; do not use generic statements.
- If a value is missing, state assumptions explicitly in clinical_note.
- Keep recommendations practical for daily Indian cooking habits.
- Always provide a detailed_analysis object with at least 3 key_findings.`;

function safeParseJSON(raw) {
  try {
    const normalized = String(raw || '').replace(/```json|```/g, '').trim();

    try {
      return JSON.parse(normalized);
    } catch (_firstErr) {
      const firstBrace = normalized.indexOf('{');
      const lastBrace = normalized.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const sliced = normalized.slice(firstBrace, lastBrace + 1);
        return JSON.parse(sliced);
      }
    }

    return null;
  } catch (_err) {
    return null;
  }
}

function getGeminiApiKeys() {
  return [process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY].filter(Boolean);
}

function mapMessagesToGeminiContents(messages) {
  const safeMessages = Array.isArray(messages) ? messages : [];

  return safeMessages
    .filter((msg) => msg && msg.role !== 'system')
    .map((msg) => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts = [];

      if (typeof msg.content === 'string') {
        parts.push({ text: msg.content });
      } else if (Array.isArray(msg.content)) {
        msg.content.forEach((item) => {
          if (!item) return;

          if (item.type === 'text' && item.text) {
            parts.push({ text: item.text });
            return;
          }

          if (item.type === 'image_url' && item.image_url && item.image_url.url) {
            const url = String(item.image_url.url);
            const match = url.match(/^data:(.+?);base64,(.+)$/);

            if (match) {
              parts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2],
                },
              });
            }
          }
        });
      }

      return { role, parts };
    })
    .filter((entry) => Array.isArray(entry.parts) && entry.parts.length > 0);
}

async function callGeminiDirect(messages) {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  const contents = mapMessagesToGeminiContents(messages);
  if (contents.length === 0) return null;

  for (const key of keys) {
    try {
      const endpoint = `${GEMINI_API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${key}`;
      const response = await axios.post(
        endpoint,
        {
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2500,
            responseMimeType: 'application/json',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      const parts = response?.data?.candidates?.[0]?.content?.parts || [];
      const text = parts
        .map((part) => part?.text)
        .filter(Boolean)
        .join('\n')
        .trim();

      if (text) return text;
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

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];

    const text = (await callGeminiDirect(messages)) || (await callOpenRouterWithFallback(messages));

    if (!text) return null;

    return safeParseJSON(text);
  } catch (_err) {
    return null;
  }
}

async function analyzeWithVision(buffer, mimetype, ruleResult) {
  try {
    const base64 = buffer.toString('base64');

    const messages = [
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
    ];

    const text = (await callGeminiDirect(messages)) || (await callOpenRouterWithFallback(messages));

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
