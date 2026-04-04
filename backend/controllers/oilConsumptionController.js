const OilConsumption = require('../models/OilConsumption');
const DailyGoal = require('../models/DailyGoal');
const RollingScore = require('../models/RollingScore');
const Group = require('../models/Group');
const User = require('../models/User');
const { getRawOilKcal, getMultiplier, getEffectiveKcal } = require('../utils/oilCalorieUtils');
const swasthnaniService = require('../services/swasthnaniService');

function getFoodAnalyzerFallback() {
  return {
    foodName: 'Scanned Dish (Estimated)',
    oilContent: {
      totalOil: '12g',
      oilType: 'Vegetable Oil',
      estimatedMl: 12,
      calories: 108
    },
    fatBreakdown: {
      saturatedFat: '3g',
      transFat: '0g',
      polyunsaturatedFat: '3g',
      monounsaturatedFat: '6g'
    },
    healthScore: 6,
    healthTips: [
      'Use less oil while cooking and prefer steaming or grilling when possible.',
      'Pair the dish with fiber-rich vegetables to reduce overall calorie density.',
      'Track portions and avoid repeating high-oil dishes in the same day.'
    ],
    servingSize: '1 medium serving',
    cookingMethod: 'Estimated mixed cooking',
    isHealthy: true
  };
}

function getBarcodeAnalyzerFallback() {
  return {
    barcode: 'UNKNOWN',
    product_name: 'Scanned Product (Estimated)',
    brand: 'Unknown Brand',
    oil_type: 'Vegetable Oil',
    oil_brand: 'Unknown Brand',
    swasth_index: 52,
    recommendation_summary: 'This appears to be a moderately processed oil. Prefer oils with lower saturated fat and higher unsaturated fat balance.',
    better_options: [
      {
        name: 'Cold-pressed Mustard Oil',
        why_prefer: 'Richer in monounsaturated fats and commonly less refined, which may preserve beneficial compounds.'
      },
      {
        name: 'Groundnut Oil',
        why_prefer: 'Usually has a better fatty acid balance and neutral cooking performance for Indian meals.'
      }
    ],
    quantity: 'N/A',
    categories: 'Food Product',
    ingredients_text: 'Not specified',
    image_url: '',
    nutritional_info: {
      energy_kcal: null,
      fat: null,
      saturated_fat: null,
      trans_fat: null,
      cholesterol: null,
      carbohydrates: null,
      sugars: null,
      fiber: null,
      proteins: null,
      salt: null,
      sodium: null,
      unit: '100g',
      polyunsaturated_fat: null
    },
    oil_content: 'Unknown',
    additives: [],
    nutriscore_grade: null,
    nova_group: null,
    labels: 'Edible Product',
    fatty_acids: {
      sfa: null,
      tfa: null,
      pfa: null,
      is_food_product: true
    }
  };
}

function parseJsonObject(text = '') {
  let jsonText = String(text).trim();

  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '');
  }

  const firstBrace = jsonText.indexOf('{');
  const lastBrace = jsonText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonText = jsonText.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(jsonText);
}

function clamp01(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  if (numeric < 0) {
    return 0;
  }
  if (numeric > 1) {
    return 1;
  }
  return numeric;
}

function roundToThree(value) {
  return Math.round(value * 1000) / 1000;
}

function normalizeCookingMethod(raw = {}) {
  const deep = clamp01(raw.deep_fry, 0.7);
  const shallow = clamp01(raw.shallow_fry, 0.15);
  const air = clamp01(raw.air_fry, 0.1);
  const baked = clamp01(raw.baked, 0.05);

  const total = deep + shallow + air + baked;

  if (!total) {
    return {
      deep_fry: 0.7,
      shallow_fry: 0.15,
      air_fry: 0.1,
      baked: 0.05
    };
  }

  const normalized = {
    deep_fry: roundToThree(deep / total),
    shallow_fry: roundToThree(shallow / total),
    air_fry: roundToThree(air / total)
  };

  const bakedValue = roundToThree(1 - (normalized.deep_fry + normalized.shallow_fry + normalized.air_fry));

  return {
    ...normalized,
    baked: bakedValue < 0 ? 0 : bakedValue
  };
}

function normalizeFoodVisionOutput(parsed = {}) {
  const food = typeof parsed.food === 'string' && parsed.food.trim()
    ? parsed.food.trim()
    : 'unknown';

  const cooking_method = normalizeCookingMethod(parsed.cooking_method || {});
  const confidence = clamp01(parsed.confidence, 0.65);

  return {
    food,
    cooking_method,
    confidence: roundToThree(confidence)
  };
}

async function callOpenRouterWithFallback({ payload, title }) {
  const keys = [
    process.env.OPENROUTER_OIL_SCAN_API_KEY,
    process.env.OPENROUTER_API_KEY
  ].filter(Boolean);

  if (!keys.length) {
    return { ok: false, status: 401, text: 'No OpenRouter keys configured' };
  }

  let lastStatus = 500;
  let lastText = 'Unknown provider error';

  for (const apiKey of keys) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://swasthtel.app',
        'X-Title': title
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { ok: true, status: response.status, json: await response.json() };
    }

    lastStatus = response.status;
    lastText = await response.text();

    // If key is invalid/unknown, try next available key.
    if (response.status === 401 || response.status === 403) {
      continue;
    }

    // For non-auth failures, fail fast.
    return { ok: false, status: response.status, text: lastText };
  }

  return { ok: false, status: lastStatus, text: lastText };
}

function getGeminiApiKeys() {
  return [process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY].filter(Boolean);
}

function buildGeminiContentsFromOpenRouterMessages(messages = []) {
  const userMessage = messages.find((message) => message?.role === 'user');
  const content = Array.isArray(userMessage?.content) ? userMessage.content : [];
  const parts = [];

  for (const item of content) {
    if (item?.type === 'text' && typeof item?.text === 'string' && item.text.trim()) {
      parts.push({ text: item.text });
      continue;
    }

    if (item?.type === 'image_url' && typeof item?.image_url?.url === 'string') {
      const url = item.image_url.url;
      const match = url.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }
  }

  return [{ role: 'user', parts }];
}

function getGeminiModelFromPayload(payload = {}) {
  const raw = String(payload?.model || '').trim();
  if (!raw) {
    return process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  if (raw.includes('/')) {
    return raw.split('/').pop() || (process.env.GEMINI_MODEL || 'gemini-2.0-flash');
  }

  return raw;
}

async function callGeminiWithFallback({ payload }) {
  const keys = getGeminiApiKeys();
  if (!keys.length) {
    return { ok: false, status: 401, text: 'No Gemini keys configured' };
  }

  const contents = buildGeminiContentsFromOpenRouterMessages(payload?.messages || []);
  const model = getGeminiModelFromPayload(payload);

  let lastStatus = 500;
  let lastText = 'Unknown Gemini error';

  for (const key of keys) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: Number(payload?.temperature ?? 0.3),
          maxOutputTokens: Number(payload?.max_tokens ?? 1024)
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text)
        .filter(Boolean)
        .join('\n') || '';

      if (text) {
        return {
          ok: true,
          status: response.status,
          json: {
            choices: [
              {
                message: {
                  content: text
                }
              }
            ]
          }
        };
      }

      return { ok: false, status: 502, text: 'Empty Gemini response text' };
    }

    lastStatus = response.status;
    lastText = await response.text();

    if (response.status === 401 || response.status === 403) {
      continue;
    }

    return { ok: false, status: response.status, text: lastText };
  }

  return { ok: false, status: lastStatus, text: lastText };
}

function hasOpenRouterKeys() {
  return Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_OIL_SCAN_API_KEY);
}

function extractProviderMessage(rawText = '') {
  const text = String(rawText || '').trim();
  if (!text) {
    return 'Services are down';
  }

  try {
    const parsed = JSON.parse(text);
    const message = parsed?.error?.message || parsed?.message;
    if (message) {
      return String(message);
    }
  } catch (error) {
    // Ignore JSON parse failures and fall back to raw text.
  }

  return text.slice(0, 220);
}

async function callVisionProviderWithFallback({ payload, title }) {
  const geminiResult = await callGeminiWithFallback({ payload });
  if (geminiResult.ok) {
    return geminiResult;
  }

  if (!hasOpenRouterKeys()) {
    return geminiResult;
  }

  return callOpenRouterWithFallback({ payload, title });
}

function normalizeActivityLevel(activityLevel = '') {
  const raw = String(activityLevel || '').trim().toLowerCase().replace(/_/g, '-');
  const aliases = {
    lightly: 'lightly-active',
    moderate: 'moderately-active',
    moderately: 'moderately-active',
    very: 'very-active',
    extra: 'extra-active'
  };
  return aliases[raw] || raw;
}

function getActivityFactorFromLevel(activityLevel = '') {
  const level = normalizeActivityLevel(activityLevel);
  const factors = {
    'sedentary': 1.2,
    'low': 1.2,
    'low-active': 1.2,
    'low activity': 1.2,
    'lightly-active': 1.375,
    'lightly active': 1.375,
    'moderately-active': 1.55,
    'moderately active': 1.55,
    'moderate': 1.55,
    'very-active': 1.725,
    'very active': 1.725,
    'extra-active': 1.9,
    'extra active': 1.9
  };
  return factors[level] || 1.5;
}

function computeBmrFromProfile(user) {
  const weight = Number(user?.weight);
  const height = Number(user?.height);
  const age = Number(user?.age);
  const gender = String(user?.gender || '').toLowerCase();

  if (!weight || !height || !age) {
    return 1500;
  }

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  }

  return Math.round(bmr);
}

function getUserProfileForGoal(user) {
  const storedBmr = Number(user?.bmr);
  const computedBmr = computeBmrFromProfile(user);
  const bmr = storedBmr > 0 ? storedBmr : computedBmr;

  const normalizedLevel = normalizeActivityLevel(user?.activityLevel);
  const mappedFactor = getActivityFactorFromLevel(normalizedLevel);
  const storedFactor = Number(user?.activityFactor);
  const activityFactor = normalizedLevel ? mappedFactor : (storedFactor || 1.5);
  
  // Use adjustedTdee if available (when calorieGoal is set), otherwise use default tdee
  const adjustedTdee = Number(user?.adjustedTdee);
  const defaultTdee = Number(user?.tdee) || 0;
  const tdee = adjustedTdee > 0 ? adjustedTdee : defaultTdee;

  return { bmr, activityFactor, tdee };
}

function normalizeOilAmountUnit(unit) {
  const value = String(unit || 'ml').trim().toLowerCase();
  if (value === 'g' || value === 'gram' || value === 'grams') return 'g';
  return 'ml';
}

function toOilAmountGrams(amount, unit) {
  const numericAmount = Number(amount) || 0;
  const normalizedUnit = normalizeOilAmountUnit(unit);
  return normalizedUnit === 'ml' ? numericAmount * 0.92 : numericAmount;
}

const IOT_OIL_DENSITY = {
  mustard_oil: 0.91,
  sunflower_oil: 0.92,
  olive_oil: 0.91,
  coconut_oil: 0.92,
  ghee: 0.96,
};

const IOT_METHOD_FACTOR = {
  deep_fry: 1.25,
  shallow_fry: 1.15,
  saute: 1.05,
  boil: 1.0,
};

const IOT_HEALTH_SCORE = {
  mustard_oil: 7,
  sunflower_oil: 6,
  olive_oil: 8,
  coconut_oil: 5,
  ghee: 4,
};

const KNOWN_OILS = Object.keys(IOT_OIL_DENSITY);

function normalizeOilType(rawOil = '') {
  const oil = String(rawOil || '').trim().toLowerCase();
  if (!oil) return '';

  if (oil.includes('mustard')) return 'mustard_oil';
  if (oil.includes('sunflower')) return 'sunflower_oil';
  if (oil.includes('olive')) return 'olive_oil';
  if (oil.includes('coconut')) return 'coconut_oil';
  if (oil.includes('ghee')) return 'ghee';

  return KNOWN_OILS.includes(oil) ? oil : '';
}

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function buildIotSuggestion({ oilType, finalVolumeMl, recommendedMl, cookingMethod }) {
  const overBy = finalVolumeMl - recommendedMl;
  const reducePercent = overBy > 0 ? Math.min(60, Math.max(10, Math.round((overBy / finalVolumeMl) * 100))) : 0;

  const methodSuggestion = cookingMethod === 'deep_fry'
    ? 'Switch to saute or shallow-fry for Indian home cooking to cut absorbed oil.'
    : cookingMethod === 'shallow_fry'
      ? 'Try saute with a measured spoon to control oil better.'
      : 'Continue low-oil techniques and measure oil before cooking.';

  const betterOil = oilType === 'ghee' || oilType === 'coconut_oil'
    ? 'Consider mustard_oil or olive_oil for better fatty-acid balance in daily cooking.'
    : '';

  if (finalVolumeMl > recommendedMl) {
    return `Reduce visible oil by about ${reducePercent}% next time. ${methodSuggestion}${betterOil ? ` ${betterOil}` : ''}`;
  }

  return `Good control on visible oil. ${methodSuggestion}${betterOil ? ` ${betterOil}` : ''}`;
}

async function detectOilFromImage(base64Image) {
  try {
    if (!base64Image || typeof base64Image !== 'string') {
      return { oil_type: '', brand: '', confidence: 0 };
    }

    if (!process.env.OPENROUTER_OIL_SCAN_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return { oil_type: '', brand: '', confidence: 0 };
    }

    const prompt = `Detect edible oil from this image and return ONLY valid JSON:
{
  "oil_type": "mustard_oil|sunflower_oil|olive_oil|coconut_oil|ghee|unknown",
  "brand": "string",
  "confidence": number
}
Rules:
- confidence must be between 0 and 1
- if uncertain, set oil_type to "unknown" and confidence below 0.8`;

    const providerResult = await callOpenRouterWithFallback({
      title: 'SwasthTel IoT Oil Detector',
      payload: {
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 256,
        temperature: 0.1
      }
    });

    if (!providerResult.ok) {
      return { oil_type: '', brand: '', confidence: 0 };
    }

    const generatedText = providerResult?.json?.choices?.[0]?.message?.content;
    if (!generatedText) {
      return { oil_type: '', brand: '', confidence: 0 };
    }

    const parsed = parseJsonObject(generatedText);
    const normalizedOilType = normalizeOilType(parsed?.oil_type);
    const confidence = Math.max(0, Math.min(1, Number(parsed?.confidence) || 0));

    return {
      oil_type: normalizedOilType,
      brand: String(parsed?.brand || '').trim(),
      confidence,
    };
  } catch (error) {
    return { oil_type: '', brand: '', confidence: 0 };
  }
}

exports.analyzeIotOil = async (req, res) => {
  try {
    const {
      image,
      weight_grams,
      volume_ml,
      user_selected_oil,
      cooking_method,
      reuse_count,
      dish,
    } = req.body || {};

    const parsedWeight = Number(weight_grams);
    const parsedVolume = Number(volume_ml);
    const hasWeight = Number.isFinite(parsedWeight) && parsedWeight > 0;
    const hasVolume = Number.isFinite(parsedVolume) && parsedVolume > 0;

    if (!hasWeight && !hasVolume) {
      return res.status(400).json({
        success: false,
        message: 'Either weight_grams or volume_ml must be provided',
      });
    }

    if (!Object.prototype.hasOwnProperty.call(IOT_METHOD_FACTOR, cooking_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cooking_method. Use deep_fry, shallow_fry, saute, or boil',
      });
    }

    const parsedReuseCount = Math.max(0, Math.floor(Number(reuse_count) || 0));

    const detected = await detectOilFromImage(image);
    let oilType = '';
    let confidence = 0;

    if (detected.oil_type && detected.confidence >= 0.8) {
      oilType = detected.oil_type;
      confidence = detected.confidence;
    } else {
      const selected = normalizeOilType(user_selected_oil);
      oilType = selected || 'sunflower_oil';
      confidence = detected.confidence || (selected ? 0.79 : 0.5);
    }

    const density = IOT_OIL_DENSITY[oilType] || IOT_OIL_DENSITY.sunflower_oil;
    const inputType = hasWeight ? 'weight' : 'volume';
    const normalizedVolumeMl = hasWeight ? (parsedWeight / density) : parsedVolume;

    const methodFactor = IOT_METHOD_FACTOR[cooking_method] || 1;
    const reuseFactor = 1 + (0.02 * parsedReuseCount);
    const finalAdjustedVolumeMl = normalizedVolumeMl * methodFactor * reuseFactor;
    const calories = finalAdjustedVolumeMl * 9;
    const healthScore = IOT_HEALTH_SCORE[oilType] || 6;

    const recommendedPerMealMl = 10;
    const feedback = finalAdjustedVolumeMl > recommendedPerMealMl
      ? 'You used more oil than recommended'
      : 'Healthy oil usage';

    const suggestion = buildIotSuggestion({
      oilType,
      finalVolumeMl: finalAdjustedVolumeMl,
      recommendedMl: recommendedPerMealMl,
      cookingMethod: cooking_method,
      dish,
    });

    return res.status(200).json({
      success: true,
      data: {
        oil_type: oilType,
        confidence: round2(confidence),
        input_type: inputType,
        normalized_volume_ml: round2(normalizedVolumeMl),
        final_adjusted_volume_ml: round2(finalAdjustedVolumeMl),
        calories: round2(calories),
        health_score: healthScore,
        feedback,
        suggestion,
      }
    });
  } catch (error) {
    console.error('[IoTOilAnalyzer] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze oil usage',
    });
  }
};

// Log oil consumption
exports.logConsumption = async (req, res, next) => {
  try {
    const { foodName, oilType, oilAmount, oilAmountUnit, quantity, unit, mealType, members, consumedAt, sfaPercent, tfaPercent, pufaPercent, totalCalories, oilCalories } = req.body;

    // Validate required fields
    if (!foodName || !oilType || oilAmount === undefined || !quantity || !unit || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const consumeDate = consumedAt ? new Date(consumedAt) : new Date();
    const dateOnly = new Date(consumeDate);
    dateOnly.setHours(0, 0, 0, 0);

    // Get or compute daily goal
    const userProfile = getUserProfileForGoal(req.user);
    const dailyGoal = await DailyGoal.getOrComputeGoal(req.user._id, dateOnly, userProfile);

    const amountValue = parseFloat(oilAmount);
    const normalizedOilAmountUnit = normalizeOilAmountUnit(oilAmountUnit);
    const oilAmountGrams = toOilAmountGrams(amountValue, normalizedOilAmountUnit);
    const sfa = parseFloat(sfaPercent ?? 0) || 0;
    const tfa = parseFloat(tfaPercent ?? 0) || 0;
    const pufa = parseFloat(pufaPercent ?? 0) || 0;
    const rawKcal = getRawOilKcal(oilAmountGrams);
    const { harmScore, swasthIndex, multiplier } = getMultiplier(sfa, tfa, pufa);
    const effectiveKcal = getEffectiveKcal(rawKcal, multiplier);
    const normalizedTotalCalories = Number(totalCalories);
    const hasProvidedTotalCalories = Number.isFinite(normalizedTotalCalories) && normalizedTotalCalories >= 0;
    
    // If totalCalories not provided, default to rawKcal (oil calories are part of total)
    const resolvedTotalCalories = hasProvidedTotalCalories ? normalizedTotalCalories : rawKcal;
    
    // Use provided oilCalories if available, otherwise use calculated rawKcal
    const normalizedOilCalories = Number(oilCalories);
    const hasProvidedOilCalories = Number.isFinite(normalizedOilCalories) && normalizedOilCalories >= 0;
    const resolvedOilCalories = hasProvidedOilCalories ? normalizedOilCalories : rawKcal;

    // Create new consumption entry
    const consumption = await OilConsumption.create({
      userId: req.user._id,
      foodName,
      oilType,
      oilAmount: amountValue,
      oilAmountUnit: normalizedOilAmountUnit,
      sfaPercent: sfa,
      tfaPercent: tfa,
      pufaPercent: pufa,
      harmScore,
      swasthIndex,
      rawKcal,
      multiplier,
      effectiveKcal,
      totalCalories: resolvedTotalCalories,
      oilCalories: resolvedOilCalories,
      quantity: parseFloat(quantity),
      unit,
      mealType,
      members: members || [],
      consumedAt: consumeDate
    });

    // Update daily goal cumulative
    await dailyGoal.addEffectiveCalories(effectiveKcal);

    // Get status
    const status = dailyGoal.getStatus();

    // Get user's health status for personalized message
    const user = await User.findById(req.user._id);
    const userHealthStatus = user.healthStatus || 'normal';

    // Generate Swasthnani message
    const swasthnaniMessage = swasthnaniService.generateMealLoggingMessage({
      oilAmount: oilAmountGrams,
      foodName,
      mealType,
      oilType,
      harmScore,
      dailyStatus: status,
      userHealthStatus
    });

    res.status(201).json({
      success: true,
      message: 'Oil consumption logged successfully',
      data: {
        eventId: consumption._id,
        entry: consumption,
        rawKcal,
        multiplier,
        effectiveKcal,
        totalCalories: resolvedTotalCalories,
        ...status,
        swasthnaniMessage
      }
    });
  } catch (error) {
    next(error);
  }
};

// Bulk log consumption for group members
exports.logGroupConsumption = async (req, res, next) => {
  try {
    const { groupId, consumptionData } = req.body;
    // consumptionData format: [{ userId, foodName, oilType, oilAmount, quantity, unit, mealType, consumedAt }]

    if (!groupId || !consumptionData || !Array.isArray(consumptionData) || consumptionData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Group ID and consumption data array are required'
      });
    }

    // Verify group exists and user is admin
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can log consumption for members'
      });
    }

    const results = [];
    const errors = [];

    for (const item of consumptionData) {
      try {
        const { userId, foodName, oilType, oilAmount, oilAmountUnit, quantity, unit, mealType, consumedAt, sfaPercent, tfaPercent, pufaPercent, totalCalories, oilCalories } = item;

        // Validate required fields
        if (!userId || !foodName || !oilType || oilAmount === undefined || !quantity || !unit || !mealType) {
          errors.push({ userId, error: 'Missing required fields' });
          continue;
        }

        // Verify user is group member
        if (!group.isMember(userId)) {
          errors.push({ userId, error: 'User is not an active member of the group' });
          continue;
        }

        const consumeDate = consumedAt ? new Date(consumedAt) : new Date();
        const dateOnly = new Date(consumeDate);
        dateOnly.setHours(0, 0, 0, 0);

        // Get user profile
        const user = await User.findById(userId);
        if (!user) {
          errors.push({ userId, error: 'User not found' });
          continue;
        }

        // Get or compute daily goal for this user
        const userProfile = getUserProfileForGoal(user);
        const dailyGoal = await DailyGoal.getOrComputeGoal(userId, dateOnly, userProfile);

        const amountValue = parseFloat(oilAmount);
        const normalizedOilAmountUnit = normalizeOilAmountUnit(oilAmountUnit);
        const oilAmountGrams = toOilAmountGrams(amountValue, normalizedOilAmountUnit);
        const sfa = parseFloat(sfaPercent ?? 0) || 0;
        const tfa = parseFloat(tfaPercent ?? 0) || 0;
        const pufa = parseFloat(pufaPercent ?? 0) || 0;
        const rawKcal = getRawOilKcal(oilAmountGrams);
        const { harmScore, swasthIndex, multiplier } = getMultiplier(sfa, tfa, pufa);
        const effectiveKcal = getEffectiveKcal(rawKcal, multiplier);
        const normalizedTotalCalories = Number(totalCalories);
        const hasProvidedTotalCalories = Number.isFinite(normalizedTotalCalories) && normalizedTotalCalories >= 0;
        
        // If totalCalories not provided, default to rawKcal
        const resolvedTotalCalories = hasProvidedTotalCalories ? normalizedTotalCalories : rawKcal;
        
        // Use provided oilCalories if available, otherwise use calculated rawKcal
        const normalizedOilCalories = Number(oilCalories);
        const hasProvidedOilCalories = Number.isFinite(normalizedOilCalories) && normalizedOilCalories >= 0;
        const resolvedOilCalories = hasProvidedOilCalories ? normalizedOilCalories : rawKcal;

        // Create new consumption entry
        const consumption = await OilConsumption.create({
          userId,
          foodName,
          oilType,
          oilAmount: amountValue,
          oilAmountUnit: normalizedOilAmountUnit,
          sfaPercent: sfa,
          tfaPercent: tfa,
          pufaPercent: pufa,
          harmScore,
          swasthIndex,
          rawKcal,
          multiplier,
          effectiveKcal,
          totalCalories: resolvedTotalCalories,
          oilCalories: resolvedOilCalories,
          quantity: parseFloat(quantity),
          unit,
          mealType,
          consumedAt: consumeDate,
          groupId,
          loggedBy: req.user._id,
          isGroupLog: true
        });

        // Update daily goal cumulative
        await dailyGoal.addEffectiveCalories(effectiveKcal);

        results.push({
          userId,
          consumptionId: consumption._id,
          effectiveKcal,
          totalCalories: resolvedTotalCalories
        });
      } catch (error) {
        errors.push({ userId: item.userId, error: error.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Logged ${results.length} consumption entries`,
      data: {
        logged: results,
        errors
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get consumption entries
exports.getConsumption = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 50, page = 1 } = req.query;

    // Build query
    const query = { userId: req.user._id };

    // Add date filtering if provided
    if (startDate || endDate) {
      query.consumedAt = {};
      if (startDate) {
        query.consumedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.consumedAt.$lte = end;
      }
    }

    // Get entries with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const entries = await OilConsumption.find(query)
      .sort({ consumedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await OilConsumption.countDocuments(query);

    // Get today's total
    const dailyTotal = await OilConsumption.getDailyTotal(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        entries,
        dailyTotal: dailyTotal.totalOil,
        dailyTotalCalories: dailyTotal.totalCalories,
        dailyOilCalories: dailyTotal.totalRawKcal,
        dailyEffectiveCalories: dailyTotal.totalEffKcal,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get today's consumption
exports.getTodayConsumption = async (req, res, next) => {
  try {
    const dateParam = req.query.date ? new Date(req.query.date) : new Date();
    dateParam.setHours(0, 0, 0, 0);

    const start = new Date(dateParam);
    const end = new Date(dateParam);
    end.setHours(23, 59, 59, 999);

    console.log('🛢️ [getTodayConsumption] CALLED');
    console.log('🛢️ [getTodayConsumption] req.query.date:', req.query.date);
    console.log('🛢️ [getTodayConsumption] Searching for entries between:', start.toISOString(), 'and', end.toISOString());

    const entries = await OilConsumption.find({
      userId: req.user._id,
      consumedAt: { $gte: start, $lte: end }
    })
    .sort({ consumedAt: -1 })
    .lean();

    console.log('🛢️ [getTodayConsumption] Found entries:', entries.length);
    if (entries.length > 0) {
      entries.forEach((entry, idx) => {
        console.log(`  Entry ${idx}: consumedAt=${entry.consumedAt}, rawKcal=${entry.rawKcal}`);
      });
    }

    const dailyTotal = await OilConsumption.getDailyTotal(req.user._id, dateParam);
    
    console.log('🛢️ [Backend] getTodayConsumption for user:', req.user._id);
    console.log('🛢️ [Backend] Requested date:', req.query.date);
    console.log('🛢️ [Backend] Date range:', start.toISOString(), 'to', end.toISOString());
    console.log('🛢️ [Backend] Entries found:', entries.length);
    if (entries.length > 0) {
      console.log('🛢️ [Backend] First entry consumedAt:', entries[0].consumedAt);
      console.log('🛢️ [Backend] Last entry consumedAt:', entries[entries.length - 1].consumedAt);
    }
    console.log('🛢️ [Backend] Daily total:', dailyTotal);

    const responseData = {
      entries,
      dailyTotal: dailyTotal.totalOil,
      dailyTotalCalories: dailyTotal.totalCalories,
      dailyOilCalories: dailyTotal.totalOilCalories,
      dailyEffectiveCalories: dailyTotal.totalEffKcal,
      count: entries.length
    };
    
    console.log('🛢️ [Backend] Response data:', responseData);

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

// Get weekly stats
exports.getWeeklyStats = async (req, res, next) => {
  try {
    const stats = await OilConsumption.getWeeklyStats(req.user._id);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Delete consumption entry
exports.deleteConsumption = async (req, res, next) => {
  try {
    const { id } = req.params;

    const consumption = await OilConsumption.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!consumption) {
      return res.status(404).json({
        success: false,
        message: 'Consumption entry not found'
      });
    }

    await consumption.deleteOne();

    // Get updated daily total
    const dailyTotal = await OilConsumption.getDailyTotal(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Consumption entry deleted successfully',
      data: {
        dailyTotal: dailyTotal.totalOil,
        dailyTotalCalories: dailyTotal.totalCalories,
        dailyOilCalories: dailyTotal.totalRawKcal,
        dailyEffectiveCalories: dailyTotal.totalEffKcal
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update consumption entry
exports.updateConsumption = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { foodName, oilType, oilAmount, oilAmountUnit, quantity, unit, mealType, members, totalCalories } = req.body;

    const consumption = await OilConsumption.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!consumption) {
      return res.status(404).json({
        success: false,
        message: 'Consumption entry not found'
      });
    }

    // Update fields if provided
    if (foodName) consumption.foodName = foodName;
    if (oilType) consumption.oilType = oilType;
    if (oilAmount !== undefined) consumption.oilAmount = parseFloat(oilAmount);
    if (oilAmountUnit !== undefined) consumption.oilAmountUnit = normalizeOilAmountUnit(oilAmountUnit);
    if (quantity !== undefined) consumption.quantity = parseFloat(quantity);
    if (unit) consumption.unit = unit;
    if (mealType) consumption.mealType = mealType;
    if (members !== undefined) consumption.members = members;
    if (totalCalories !== undefined) {
      const normalizedTotalCalories = Number(totalCalories);
      if (!Number.isFinite(normalizedTotalCalories) || normalizedTotalCalories < 0) {
        return res.status(400).json({
          success: false,
          message: 'totalCalories must be a non-negative number'
        });
      }
      consumption.totalCalories = normalizedTotalCalories;
    }

    await consumption.save();

    // Get updated daily total
    const dailyTotal = await OilConsumption.getDailyTotal(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Consumption entry updated successfully',
      data: {
        entry: consumption,
        dailyTotal: dailyTotal.totalOil,
        dailyTotalCalories: dailyTotal.totalCalories,
        dailyOilCalories: dailyTotal.totalRawKcal,
        dailyEffectiveCalories: dailyTotal.totalEffKcal
      }
    });
  } catch (error) {
    next(error);
  }
};

// Compute daily goal (SwasthaIndex endpoint)
exports.computeDailyGoal = async (req, res, next) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const userProfile = getUserProfileForGoal(req.user);

    const dailyGoal = await DailyGoal.getOrComputeGoal(req.user._id, targetDate, userProfile);

    res.status(200).json({
      success: true,
      data: {
        goalKcal: dailyGoal.goalKcal,
        goalGrams: dailyGoal.goalGrams,
        goalMl: dailyGoal.goalMl,
        tdee: dailyGoal.tdee,
        vBase: dailyGoal.vBase,
        ha: dailyGoal.ha,
        vAdj: dailyGoal.vAdj,
        sRoll: dailyGoal.sRoll,
        hRoll: dailyGoal.hRoll,
        date: dailyGoal.date
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user oil status (SwasthaIndex endpoint)
exports.getUserOilStatus = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const userProfile = getUserProfileForGoal(req.user);

    const dailyGoal = await DailyGoal.getOrComputeGoal(req.user._id, targetDate, userProfile);
    const status = dailyGoal.getStatus();

    res.status(200).json({
      success: true,
      data: {
        userId: req.user._id,
        date: targetDate,
        ...status
      }
    });
  } catch (error) {
    next(error);
  }
};

// Analyze food image and return perception-only cooking insights.
exports.analyzeFoodImage = async (req, res, next) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image || typeof base64Image !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'base64Image is required'
      });
    }

    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.OPENROUTER_OIL_SCAN_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Services are down'
      });
    }

    const prompt = `You are an advanced computer vision assistant integrated into a mobile app feature called "Scan Your Food".

Your ONLY responsibility is to analyze the given food image and extract structured visual insights.
You MUST NOT perform any nutritional calculations, oil estimation, or assumptions beyond visual inference.

PRIMARY OBJECTIVE
From the input food image, identify:
1) food name
2) cooking method probabilities
3) confidence score

Return STRICT JSON output only.

STEP 1: FOOD IDENTIFICATION
- Identify the primary food item in the image.
- If multiple items exist, select the most prominent or central item.
- Use common Indian food names where applicable.
- Output a single string in "food".

STEP 2: COOKING METHOD CLASSIFICATION
Estimate probability distribution across all four methods:
- deep_fry
- shallow_fry
- air_fry
- baked

Rules:
- Each value must be between 0 and 1.
- Sum must equal exactly 1.0.
- Do not assign equal probabilities unless truly uncertain.

Visual cues:
1) Surface texture:
   - rough, bubbly, crispy -> deep fry likely
   - smooth, dry -> baked or air fry
   - slight oil patches -> shallow fry
2) Color:
   - dark golden to brown -> deep fry likely
   - light golden -> fresh oil or baked
   - pale -> baked or undercooked
3) Oil shine:
   - glossy -> deep fry bias
   - matte -> air fry or baked bias
4) Structure:
   - puffy + crispy -> deep fry
   - flat + dry -> baked
   - slight oily patches -> shallow fry
5) Background context (only if clearly visible):
   - street setup -> deep fry bias
   - kitchen/home -> mixed
   - restaurant plating -> moderate

STEP 3: CONFIDENCE SCORE
Provide "confidence" between 0 and 1.

Confidence guidance:
- high (0.8 to 1.0): clear image, single item, strong indicators
- medium (0.6 to 0.8): slight blur, mixed signals
- low (<0.6): poor lighting, occlusion, overlapping foods

Output template:
{
  "food": "string",
  "cooking_method": {
    "deep_fry": number,
    "shallow_fry": number,
    "air_fry": number,
    "baked": number
  },
  "confidence": number
}

Validation:
- valid JSON only
- no extra fields
- no missing fields
- probabilities sum exactly to 1.0
- confidence must be between 0 and 1`;

    const providerResult = await callVisionProviderWithFallback({
      title: 'SwasthTel Food Oil Analyzer',
      payload: {
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1024,
        temperature: 0.3
      }
    });

    if (!providerResult.ok) {
      const providerMessage = extractProviderMessage(providerResult.text || '');
      console.error('[FoodAnalyzer] Provider error:', providerResult.status, String(providerResult.text || '').slice(0, 300));
      const statusCode = providerResult.status >= 400 && providerResult.status < 500 ? providerResult.status : 503;

      return res.status(statusCode).json({
        success: false,
        message: providerMessage || 'Services are down'
      });
    }

    const data = providerResult.json;
    const generatedText = data?.choices?.[0]?.message?.content;

    if (!generatedText) {
      return res.status(503).json({
        success: false,
        message: 'Services are down'
      });
    }

    const parsed = parseJsonObject(generatedText);
    const normalized = normalizeFoodVisionOutput(parsed);

    return res.status(200).json({
      success: true,
      data: normalized
    });
  } catch (error) {
    console.error('[FoodAnalyzer] Controller error:', error.message);

    return res.status(503).json({
      success: false,
      message: 'Services are down'
    });
  }
};

// Analyze barcode/product image and return product-focused nutrition estimate.
exports.analyzeBarcodeImage = async (req, res, next) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image || typeof base64Image !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'base64Image is required'
      });
    }

    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.OPENROUTER_OIL_SCAN_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Services are down'
      });
    }

    const prompt = `You are a Product Information Expert with barcode scanning capabilities.

Analyze this product image carefully:
1. FIRST: Look for any barcode (EAN-13, UPC, QR code, etc.) and read the numbers
2. THEN: Identify the product from the image, packaging, and any visible text

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "barcode": "the barcode number if visible (13 digits for EAN-13, 12 for UPC) or null if not readable",
  "product_name": "full product name",
  "brand": "brand/manufacturer name",
  "oil_type": "oil type if this is an oil product (e.g., Mustard Oil, Sunflower Oil), else null",
  "oil_brand": "oil brand extracted from label (if visible), else null",
  "swasth_index": number,
  "recommendation_summary": "short summary explaining health quality of this oil",
  "better_options": [
    { "name": "better oil option 1", "why_prefer": "reason" },
    { "name": "better oil option 2", "why_prefer": "reason" }
  ],
  "quantity": "e.g., 1L, 500ml, 1kg",
  "product_type": "e.g., Sunflower Oil, Mustard Oil, Refined Oil, Cooking Oil",
  "categories": "e.g., Edible Oil, Cooking Oil, Food Product",
  "ingredients": "list of ingredients if visible or known",
  "nutritional_info": {
    "energy_kcal": number or null,
    "fat": number or null,
    "saturated_fat": number or null,
    "trans_fat": number or null,
    "polyunsaturated_fat": number or null,
    "carbohydrates": number or null,
    "proteins": number or null,
    "sodium": number or null
  },
  "sfa": "saturated fat value with unit (e.g., '12g') or null",
  "tfa": "trans fat value with unit (e.g., '0g') or null",
  "pfa": "polyunsaturated fat value with unit (e.g., '25g') or null",
  "health_tips": ["tip1", "tip2", "tip3"],
  "is_food_product": true
}

Swasth Index rules:
- Return swasth_index on a 0-100 scale where higher is healthier.
- Use ingredients quality, refinement level, and fatty acid balance.
- 0-30: poor, 31-55: moderate, 56-75: good, 76-100: excellent.
- Always include at least 2 items in better_options with clear practical reasons.`;

    const providerResult = await callVisionProviderWithFallback({
      title: 'SwasthTel Barcode Scanner',
      payload: {
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1024,
        temperature: 0.3
      }
    });

    if (!providerResult.ok) {
      const providerMessage = extractProviderMessage(providerResult.text || '');
      console.error('[BarcodeAnalyzer] Provider error:', providerResult.status, String(providerResult.text || '').slice(0, 300));
      const statusCode = providerResult.status >= 400 && providerResult.status < 500 ? providerResult.status : 503;

      return res.status(statusCode).json({
        success: false,
        message: providerMessage || 'Services are down'
      });
    }

    const data = providerResult.json;
    const generatedText = data?.choices?.[0]?.message?.content;

    if (!generatedText) {
      return res.status(503).json({
        success: false,
        message: 'Services are down'
      });
    }

    const parsed = parseJsonObject(generatedText);

    return res.status(200).json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error('[BarcodeAnalyzer] Controller error:', error.message);

    return res.status(503).json({
      success: false,
      message: 'Services are down'
    });
  }
};
