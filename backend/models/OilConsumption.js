const mongoose = require('mongoose');
const {
  getAllowedOilKcal,
  getRawOilKcal,
  getMultiplier,
  getEffectiveKcal
} = require('../utils/oilCalorieUtils');

const oilConsumptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  foodName: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  oilType: {
    type: String,
    required: [true, 'Oil type is required'],
    enum: [
      'Sunflower Oil',
      'Rice Bran Oil',
      'Mustard Oil',
      'Groundnut Oil',
      'Olive Oil',
      'Coconut Oil',
      'Sesame Oil',
      'Ghee',
      'Butter',
      'Palm Oil',
      'Palmolein Oil',
      'Soybean Oil',
      'Canola Oil',
      'Corn Oil',
      'Cottonseed Oil',
      'Safflower Oil',
      'Vegetable Oil'
    ]
  },
  oilAmount: {
    type: Number,
    required: [true, 'Oil amount is required'],
    min: [0, 'Oil amount cannot be negative']
  },
  oilAmountUnit: {
    type: String,
    enum: ['ml', 'g'],
    default: 'ml'
  },
  sfaPercent: {
    type: Number,
    default: 0
  },
  tfaPercent: {
    type: Number,
    default: 0
  },
  pufaPercent: {
    type: Number,
    default: 0
  },
  // SwasthaIndex fields
  harmScore: {
    type: Number,
    min: 0,
    max: 100
  },
  rawKcal: {
    type: Number
  },
  multiplier: {
    type: Number,
    default: 1.0,
    min: 1.0,
    max: 2.0
  },
  effectiveKcal: {
    type: Number
  },
  totalCalories: {
    type: Number,
    min: [0, 'Total calories cannot be negative']
  },
  swasthIndex: {
    type: Number
  },
  allowedOilKcal: {
    type: Number
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['grams', 'bowls', 'pieces']
  },
  mealType: {
    type: String,
    required: [true, 'Meal type is required'],
    enum: ['Breakfast', 'Lunch', 'Snack', 'Dinner']
  },
  members: [{
    type: String,
    trim: true
  }],
  // Group logging fields
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    index: true
  },
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isGroupLog: {
    type: Boolean,
    default: false
  },
  consumedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  verified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying by user and date
oilConsumptionSchema.index({ userId: 1, consumedAt: -1 });

// Virtual for formatted time
oilConsumptionSchema.virtual('formattedTime').get(function() {
  return this.consumedAt.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
});

// Virtual for date string
oilConsumptionSchema.virtual('dateString').get(function() {
  return this.consumedAt.toDateString();
});

// Keep all oil calorie fields in sync before persisting.
oilConsumptionSchema.pre('save', function(next) {
  const oilAmount = Number(this.oilAmount) || 0;
  const oilAmountUnit = this.oilAmountUnit === 'g' ? 'g' : 'ml';
  const oilAmountGrams = oilAmountUnit === 'ml' ? oilAmount * 0.92 : oilAmount;
  const sfa = Number(this.sfaPercent) || 0;
  const tfa = Number(this.tfaPercent) || 0;
  const pufa = Number(this.pufaPercent) || 0;

  const rawKcal = getRawOilKcal(oilAmountGrams);
  const { harmScore, swasthIndex, multiplier } = getMultiplier(sfa, tfa, pufa);
  const effectiveKcal = getEffectiveKcal(rawKcal, multiplier);

  this.rawKcal = rawKcal;
  this.harmScore = harmScore;
  this.swasthIndex = swasthIndex;
  this.multiplier = multiplier;
  this.effectiveKcal = effectiveKcal;

  if (this.bmr !== undefined && this.activityFactor !== undefined) {
    this.allowedOilKcal = getAllowedOilKcal(this.bmr, this.activityFactor);
  }

  next();
});

// Method retained for compatibility with existing callers.
oilConsumptionSchema.statics.computeMultiplier = function(sfaPercent = 0, tfaPercent = 0, pufaPercent = 0, k = 0.2) {
  return getMultiplier(sfaPercent, tfaPercent, pufaPercent, k).multiplier;
};

// Method to get daily total for a user (including effective calories)
oilConsumptionSchema.statics.getDailyTotal = async function(userId, date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        consumedAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalOil: { $sum: '$oilAmount' },
        totalRawKcal: { $sum: '$rawKcal' },
        totalEffKcal: { $sum: '$effectiveKcal' },
        totalCalories: { $sum: { $ifNull: ['$totalCalories', 0] } },
        count: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { 
    totalOil: 0, 
    totalRawKcal: 0, 
    totalEffKcal: 0, 
    totalCalories: 0,
    count: 0 
  };
};

// Method to get weekly stats
oilConsumptionSchema.statics.getWeeklyStats = async function(userId) {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        consumedAt: { $gte: weekAgo, $lte: today }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$consumedAt' }
        },
        totalOil: { $sum: '$oilAmount' },
        totalCalories: { $sum: { $ifNull: ['$totalCalories', 0] } },
        entries: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

module.exports = mongoose.model('OilConsumption', oilConsumptionSchema);
