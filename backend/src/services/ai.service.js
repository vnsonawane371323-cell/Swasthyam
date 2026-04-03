const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

async function enrichWithAI(ocrText, ruleResult, paramsList) {
  try {
    const prompt = `OCR Text:\n${String(ocrText || '').slice(0, 6000)}\n\nRule Findings:\n${JSON.stringify({ ruleResult, paramsList })}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (response.content || [])
      .map((block) => (block && block.type === 'text' ? block.text : ''))
      .join('');

    return safeParseJSON(text);
  } catch (_err) {
    return null;
  }
}

async function analyzeWithVision(buffer, mimetype, ruleResult) {
  try {
    const base64 = buffer.toString('base64');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimetype,
                data: base64,
              },
            },
            {
              type: 'text',
              text: `Analyze this medical report image. Context from rule engine (if any): ${JSON.stringify(ruleResult || null)}`,
            },
          ],
        },
      ],
    });

    const text = (response.content || [])
      .map((block) => (block && block.type === 'text' ? block.text : ''))
      .join('');

    return safeParseJSON(text);
  } catch (_err) {
    return null;
  }
}

module.exports = {
  enrichWithAI,
  analyzeWithVision,
};
