const OilConsumption = require('../models/OilConsumption');
const DailyGoal = require('../models/DailyGoal');
const RollingScore = require('../models/RollingScore');
const Group = require('../models/Group');
const User = require('../models/User');
const { getRawOilKcal, getMultiplier, getEffectiveKcal } = require('../utils/oilCalorieUtils');

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
        ...status
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

// Analyze food image and return oil-focused nutrition estimate.
exports.analyzeFoodImage = async (req, res, next) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image || typeof base64Image !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'base64Image is required'
      });
    }

    if (!process.env.OPENROUTER_OIL_SCAN_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return res.status(200).json({
        success: true,
        data: getFoodAnalyzerFallback(),
        message: 'AI key not configured on backend. Returned estimated fallback analysis.'
      });
    }

    const prompt = `You are a nutrition extraction assistant.
Analyze this food image and return ONLY a valid JSON object with this shape:
{
  "foodName": "Name of the food/dish",
  "oilContent": {
    "totalOil": "estimated total oil/fat content, e.g. 15g",
    "oilType": "likely oil type",
    "estimatedMl": number,
    "calories": number
  },
  "fatBreakdown": {
    "saturatedFat": "string",
    "transFat": "string",
    "polyunsaturatedFat": "string",
    "monounsaturatedFat": "string"
  },
  "healthScore": number,
  "healthTips": ["tip1", "tip2", "tip3"],
  "servingSize": "string",
  "cookingMethod": "string",
  "isHealthy": boolean
}`;

    const providerResult = await callOpenRouterWithFallback({
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
      console.error('[FoodAnalyzer] OpenRouter error:', providerResult.status, String(providerResult.text || '').slice(0, 300));

      return res.status(200).json({
        success: true,
        data: getFoodAnalyzerFallback(),
        message: `AI provider error (${providerResult.status}). Returned estimated fallback analysis.`
      });
    }

    const data = providerResult.json;
    const generatedText = data?.choices?.[0]?.message?.content;

    if (!generatedText) {
      return res.status(200).json({
        success: true,
        data: getFoodAnalyzerFallback(),
        message: 'AI response was empty. Returned estimated fallback analysis.'
      });
    }

    const parsed = parseJsonObject(generatedText);

    return res.status(200).json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error('[FoodAnalyzer] Controller error:', error.message);

    return res.status(200).json({
      success: true,
      data: getFoodAnalyzerFallback(),
      message: 'Analysis service temporarily unavailable. Returned estimated fallback analysis.'
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

    if (!process.env.OPENROUTER_OIL_SCAN_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return res.status(200).json({
        success: true,
        data: getBarcodeAnalyzerFallback(),
        message: 'AI key not configured on backend. Returned estimated fallback analysis.'
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

    const providerResult = await callOpenRouterWithFallback({
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
      console.error('[BarcodeAnalyzer] OpenRouter error:', providerResult.status, String(providerResult.text || '').slice(0, 300));

      return res.status(200).json({
        success: true,
        data: getBarcodeAnalyzerFallback(),
        message: `AI provider error (${providerResult.status}). Returned estimated fallback analysis.`
      });
    }

    const data = providerResult.json;
    const generatedText = data?.choices?.[0]?.message?.content;

    if (!generatedText) {
      return res.status(200).json({
        success: true,
        data: getBarcodeAnalyzerFallback(),
        message: 'AI response was empty. Returned estimated fallback analysis.'
      });
    }

    const parsed = parseJsonObject(generatedText);

    return res.status(200).json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error('[BarcodeAnalyzer] Controller error:', error.message);

    return res.status(200).json({
      success: true,
      data: getBarcodeAnalyzerFallback(),
      message: 'Analysis service temporarily unavailable. Returned estimated fallback analysis.'
    });
  }
};
