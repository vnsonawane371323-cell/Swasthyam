/**
 * Swasthnani Messages Service
 * Generates warm, personalized messages from Swasthnani (app mascot)
 * for meal logging, health feedback, and encouragement
 */

class SwasthnaniService {
  /**
   * Main message generator for meal logging
   * @param {Object} mealData - Meal consumption details
   * @param {number} mealData.oilAmount - Oil amount in grams
   * @param {string} mealData.foodName - Name of food logged
   * @param {string} mealData.mealType - breakfast, lunch, dinner, snack
   * @param {string} mealData.oilType - Type of oil (mustard, sunflower, etc)
   * @param {number} mealData.harmScore - Health harm score (0-100)
   * @param {Object} mealData.dailyStatus - Status from DailyGoal
   * @param {number} mealData.dailyStatus.limitKcal - Daily oil calorie limit
   * @param {number} mealData.dailyStatus.consumedKcal - Total consumed today
   * @param {number} mealData.dailyStatus.remainingKcal - Remaining budget
   * @param {string} mealData.userHealthStatus - User's health condition (normal, prediabetic, diabetic, etc)
   * @returns {Object} Message object with title, message, emoji, encouragement
   */
  generateMealLoggingMessage(mealData) {
    const {
      oilAmount,
      foodName,
      mealType,
      oilType,
      harmScore = 50,
      dailyStatus = {},
      userHealthStatus = 'normal'
    } = mealData;

    const {
      limitKcal = 450,
      consumedKcal = 0,
      remainingKcal = limitKcal
    } = dailyStatus;

    // Calculate consumption percentage
    const consumedPercent = (consumedKcal / limitKcal) * 100;
    const mealPercent = (consumedKcal - (consumedKcal - oilAmount * 9)) / limitKcal * 100;

    let message = {
      emoji: '💚',
      title: 'Great logging!',
      message: '',
      subtext: '',
      encouragement: '',
      icon: 'checkmark-circle',
      tone: 'positive'
    };

    // Base contextual message
    const foodContext = this.getFoodContext(foodName, mealType, oilType, harmScore);
    message.message = foodContext.message;

    // Budget awareness messages
    if (consumedPercent >= 90) {
      // Almost at limit
      message.emoji = '⚠️';
      message.icon = 'alert-circle';
      message.tone = 'caution';
      message.title = 'Approaching limit';
      message.subtext = `You're at ${Math.round(consumedPercent)}% of your daily oil limit. ${remainingKcal < 50 ? 'Consider lighter meals next!' : 'Be mindful of remaining meals.'}`;
      
      if (userHealthStatus === 'fatty-liver' || userHealthStatus === 'high-cholesterol') {
        message.encouragement = 'For your health, please stick to lighter cooking methods for upcoming meals.';
      } else {
        message.encouragement = "You're doing well! Just be mindful of remaining meals.";
      }
    } else if (consumedPercent >= 70) {
      // Getting close
      message.emoji = '👍';
      message.icon = 'happy';
      message.title = 'On track!';
      message.subtext = `${Math.round(remainingKcal)} kcal remaining - wise choice!`;
      message.encouragement = this.getEncouragement('moderate-progress', userHealthStatus);
    } else if (consumedPercent >= 50) {
      // Halfway there
      message.emoji = '✨';
      message.icon = 'sparkles';
      message.title = 'Perfect balance!';
      message.subtext = `Halfway through your budget with room for more. ${remainingKcal} kcal left!`;
      message.encouragement = this.getEncouragement('good-progress', userHealthStatus);
    } else if (consumedPercent < 20) {
      // Just started
      message.emoji = '🌱';
      message.icon = 'leaf';
      message.title = 'Fresh start!';
      message.subtext = `Great choice for ${mealType}! Plenty of budget left for the day.`;
      message.encouragement = this.getEncouragement('light-meal', userHealthStatus);
    } else {
      // Normal progress
      message.emoji = '😊';
      message.icon = 'happy';
      message.title = 'Well done!';
      message.subtext = `You've consumed ${Math.round(mealPercent)}% in this meal. ${remainingKcal} kcal left.`;
      message.encouragement = this.getEncouragement('normal-progress', userHealthStatus);
    }

    // Health-specific personalization
    if (userHealthStatus && userHealthStatus !== 'normal') {
      message = this.personalizeHealthMessage(message, userHealthStatus, harmScore);
    }

    // Harm score warning if needed
    if (harmScore > 70) {
      message.healthWarning = this.getHealthWarning(harmScore, oilType, userHealthStatus);
    }

    return message;
  }

  /**
   * Get contextual message based on food type and meal
   */
  getFoodContext(foodName, mealType, oilType, harmScore) {
    const mealTimeContext = {
      breakfast: 'Starting your day right',
      lunch: 'Fueling your afternoon',
      dinner: 'Wrapping up your day well',
      snack: 'Keeping it light',
      other: 'Good logging'
    };

    const harmMessage = harmScore > 70 
      ? ' (high in saturated fats - consider moderating)'
      : harmScore > 50 
      ? ' (moderate oil quality)'
      : ' (good oil choice!)';

    return {
      message: `${mealTimeContext[mealType] || mealTimeContext.other} with "${foodName}" using ${oilType}${harmMessage}`
    };
  }

  /**
   * Get encouragement messages based on consumption pattern
   */
  getEncouragement(pattern, healthStatus) {
    const encouragements = {
      'light-meal': [
        'Light meals are a smart choice for your health!',
        'Great way to balance your nutrition today.',
        'Your body will thank you for this wise choice.',
        'Every light meal counts toward your wellness goal!',
        'Excellent nutritional awareness!'
      ],
      'good-progress': [
        'You\'re making smart choices today!',
        'Your consistency is building better habits.',
        'Keep up this balanced approach!',
        'You\'re on your way to better health!',
        'This dedication shows real commitment.'
      ],
      'moderate-progress': [
        'You\'re doing great! Just a little mindful.',
        'Stay aware and you\'ll hit your goals!',
        'Your efforts are paying off!',
        'Keep balancing just like this!',
        'You\'ve got this under control!'
      ]
    };

    const healthSpecific = {
      'high-cholesterol': [
        'Lower oil intake helps manage cholesterol levels.',
        'Every meal is an opportunity to improve your health numbers.',
        'This choice supports your heart health.',
        'Your doctor would approve of this choice!',
        'You\'re actively managing your cholesterol.'
      ],
      'diabetes': [
        'Controlling oil intake helps manage blood sugar.',
        'This balanced meal supports stable glucose levels.',
        'Your pancreas thanks you for these choices.',
        'Consistency in portion control is key to managing diabetes.',
        'You\'re taking the right steps for better health.'
      ],
      'fatty-liver': [
        'Reduced oil consumption is crucial for your liver health.',
        'Every gram less oil helps your liver recover.',
        'Your liver is healing with these choices.',
        'This is exactly what your liver needs right now.',
        'You\'re taking the most important step for your recovery.'
      ],
      'prediabetic': [
        'These choices prevent progression to diabetes.',
        'You\'re reversing the trend with each meal!',
        'Prevention starts with choices like these.',
        'Your future self will thank you!',
        'You\'re taking control of your health destiny.'
      ]
    };

    const baseMsgs = encouragements[pattern] || encouragements['good-progress'];
    const healthMsgs = healthSpecific[healthStatus] || [];

    // Mix base and health-specific messages
    const allMsgs = [...baseMsgs, ...healthMsgs];
    return allMsgs[Math.floor(Math.random() * allMsgs.length)];
  }

  /**
   * Personalize message based on health status
   */
  personalizeHealthMessage(message, healthStatus, harmScore) {
    const healthContexts = {
      'high-cholesterol': {
        emoji: '❤️',
        icon: 'heart',
        extra: 'Your cholesterol management is important. This meal helps!'
      },
      'diabetes': {
        emoji: '🩺',
        icon: 'medical',
        extra: 'Maintaining stable blood sugar with this choice.'
      },
      'prediabetic': {
        emoji: '⚡',
        icon: 'flash',
        extra: 'Prevention is better than cure. Great choice!'
      },
      'fatty-liver': {
        emoji: '💫',
        icon: 'medical',
        extra: 'Your liver is healing. This meal supports recovery.'
      },
      'hypertension': {
        emoji: '💪',
        icon: 'medical',
        extra: 'Lower oil intake helps manage blood pressure.'
      }
    };

    if (healthContexts[healthStatus]) {
      const context = healthContexts[healthStatus];
      message.emoji = context.emoji;
      message.icon = context.icon;
      message.personalizedNote = context.extra;
    }

    return message;
  }

  /**
   * Health warning for high harm scores
   */
  getHealthWarning(harmScore, oilType, healthStatus) {
    if (harmScore > 80) {
      return {
        level: 'high',
        icon: '⚠️',
        message: `${oilType} has a high harm score (${harmScore}/100). Consider switching to healthier oils like mustard or olive oil.`,
        actionable: true
      };
    } else if (harmScore > 70) {
      return {
        level: 'medium',
        icon: '⚡',
        message: `${oilType} has elevated saturated fats. Moderate your consumption of this oil.`,
        actionable: true
      };
    } else if (harmScore > 60) {
      return {
        level: 'info',
        icon: 'ℹ️',
        message: `${oilType} has some saturated fats. Balance with lighter meals.`,
        actionable: false
      };
    }
    return null;
  }

  /**
   * Generate budget warning message
   */
  generateBudgetWarning(remainingKcal, limitKcal, mealType) {
    const percentRemaining = (remainingKcal / limitKcal) * 100;

    if (percentRemaining <= 5) {
      return {
        emoji: '🛑',
        icon: 'close-circle',
        title: 'Budget exhausted',
        message: 'You\'ve reached your daily oil limit. Plan for light, oil-free meals next.',
        tone: 'critical'
      };
    } else if (percentRemaining <= 15) {
      return {
        emoji: '⚠️',
        icon: 'alert-circle',
        title: 'Critical budget',
        message: `Only ${Math.round(remainingKcal)} kcal left. Choose boiling or grilling for upcoming meals.`,
        tone: 'warning'
      };
    } else if (percentRemaining <= 30) {
      return {
        emoji: '👀',
        icon: 'eye',
        title: 'Budget low',
        message: `${Math.round(remainingKcal)} kcal remaining. Switch to lighter cooking methods.`,
        tone: 'caution'
      };
    }
    return null;
  }

  /**
   * Generate motivational message for daily goal completion
   */
  generateDailyCompletionMessage(dailyConsumption, dailyLimit, healthStatus) {
    const consumedPercent = (dailyConsumption / dailyLimit) * 100;

    let message = {
      emoji: '🌟',
      icon: 'star',
      title: 'Daily Summary',
      message: '',
      tone: 'positive'
    };

    if (consumedPercent <= 50) {
      message.emoji = '🏆';
      message.title = 'Exceptional!';
      message.message = `You stayed ${Math.round(100 - consumedPercent)}% under your limit today. Outstanding discipline!`;
    } else if (consumedPercent <= 75) {
      message.emoji = '⭐';
      message.title = 'Excellent!';
      message.message = `You stayed within range (${Math.round(consumedPercent)}% of limit). Great job managing portions!`;
    } else if (consumedPercent <= 95) {
      message.emoji = '✅';
      message.title = 'Perfect Balance!';
      message.message = `You used ${Math.round(consumedPercent)}% of your daily limit. Well controlled!`;
    } else if (consumedPercent <= 110) {
      message.emoji = '📈';
      message.title = 'Slightly Over';
      message.message = `You exceeded by ${Math.round(consumedPercent - 100)}%. Tomorrow is a fresh start!`;
    } else {
      message.emoji = '🔄';
      message.title = 'Reflection Time';
      message.message = `You've exceeded your limit by ${Math.round(consumedPercent - 100)}%. Review today's choices for tomorrow.`;
      message.tone = 'neutral';
    }

    // Health-specific closing
    if (healthStatus && healthStatus !== 'normal') {
      message.healthMessage = this.getDailyHealthSummary(consumedPercent, healthStatus);
    }

    return message;
  }

  /**
   * Health-specific daily summary
   */
  getDailyHealthSummary(consumedPercent, healthStatus) {
    const summaries = {
      'fatty-liver': consumedPercent < 100 
        ? '✨ Your liver is healing. Keep this up!' 
        : '⚠️ Exceeding limits impacts liver recovery. Reset tomorrow.',
      'diabetes': consumedPercent < 100 
        ? '💚 This helps maintain stable blood sugar.' 
        : '⚠️ Managing portions is crucial for diabetes control.',
      'high-cholesterol': consumedPercent < 100 
        ? '❤️ These choices support your heart health.' 
        : '⚠️ Consistency helps manage cholesterol levels.',
      'hypertension': consumedPercent < 100 
        ? '💪 Great for blood pressure management.' 
        : '⚠️ Each day matters for hypertension control.'
    };

    return summaries[healthStatus] || 'Keep up your consistency!';
  }

  /**
   * Generate eco/sustainability message
   */
  generateSustainabilityMessage(oilType, quantity) {
    const sustainabilityTips = {
      'coconut': 'Coconut oil farms impact ecosystems. Consider using jars multiple times.',
      'palm': 'Palm oil farming affects rainforests. Reduce usage or choose certified sustainable brands.',
      'mustard': '♻️ Mustard oil is locally grown and sustainable! Great choice.',
      'sunflower': '♻️ Sunflower seeds are efficient crops. Good for you and the planet.',
      'groundnut': '♻️ Local favorite that\'s also sustainable! Supporting local farming.',
      'olive': '♻️ Mediterranean olive oil with minimal environmental impact when sourced responsibly.'
    };

    if (sustainabilityTips[oilType.toLowerCase()]) {
      return {
        icon: '🌍',
        message: sustainabilityTips[oilType.toLowerCase()]
      };
    }
    return null;
  }

  /**
   * Generate encouragement for streak maintenance
   */
  generateStreakMessage(consecutiveDaysOnTarget, personalBest) {
    const messages = {
      1: '🌱 New streak started! You\'re building momentum.',
      2: '📈 2 days! Habits are forming.',
      3: '🔥 3-day streak! This is how habits stick.',
      5: '⭐ 5-day streak! You\'re legendary!',
      7: '🎉 One week! You\'re crushing this!',
      10: '💪 10 days! Unstoppable!',
      14: '👑 Two weeks! You\'re a pro!',
      30: '🏆 One month! Life-changing!',
      60: '🌟 Two months! You\'ve transformed!',
      90: '💎 Three months! Legendary commitment!',
      365: '👨‍🚀 One year! You\'re unstoppable!'
    };

    let message = messages[consecutiveDaysOnTarget] || 
                 (consecutiveDaysOnTarget > 365 ? '🚀 This is now your lifestyle!' : '🎯 You\'re crushing your goals!');

    if (personalBest && consecutiveDaysOnTarget > personalBest) {
      message += ' New personal best!';
    }

    return {
      emoji: '🔥',
      icon: 'flame',
      message,
      motivational: true
    };
  }

  /**
   * Generate weekly progress message
   */
  generateWeeklyProgressMessage(weeklyStats, weeklyLimit) {
    const weeklyAvg = weeklyStats.totalOil / 7;
    const dailyLimit = weeklyLimit / 7;
    const adherencePercent = (weeklyAvg / dailyLimit) * 100;

    let message = {
      emoji: '📊',
      icon: 'stats-chart',
      title: 'Weekly Summary',
      message: '',
      tone: 'positive'
    };

    if (adherencePercent < 50) {
      message.emoji = '🏅';
      message.title = 'Outstanding Week!';
      message.message = `You averaged ${Math.round(weeklyAvg)}g/day - ${Math.round(100 - adherencePercent)}% below target. Exceptional!`;
    } else if (adherencePercent < 80) {
      message.emoji = '⭐';
      message.title = 'Great Week!';
      message.message = `You averaged ${Math.round(weeklyAvg)}g/day. Consistent and controlled!`;
    } else if (adherencePercent < 100) {
      message.emoji = '✅';
      message.title = 'Good Week!';
      message.message = `You averaged ${Math.round(weeklyAvg)}g/day - nearly perfect adherence!`;
    } else if (adherencePercent < 120) {
      message.emoji = '📈';
      message.title = 'Slightly High Week';
      message.message = `You averaged ${Math.round(weeklyAvg)}g/day - ${Math.round(adherencePercent - 100)}% above limit. Next week, tighten up!`;
    } else {
      message.emoji = '⚠️';
      message.title = 'Exceeded Goals';
      message.message = `You averaged ${Math.round(weeklyAvg)}g/day - significantly above target. Refocus for next week.`;
      message.tone = 'caution';
    }

    return message;
  }

  /**
   * Get personalized tip based on usage patterns
   */
  generatePersonalizedTip(userHabits) {
    const {
      favoriteCookingMethod,
      healthIssues,
      adherenceRate,
      averageOilPerMeal
    } = userHabits;

    const tips = [
      'Try air frying instead of deep frying - saves 25% oil without sacrificing taste!',
      'Grill vegetables instead of sautéing - zero added oil needed.',
      'Use cooking sprays for non-stick - cover the pan with less oil.',
      'Temper spices in dry pan first - enhances flavor with minimal oil.',
      'Steam proteins, then sear quickly - best of both.',
      'Invest in a good non-stick pan - use 30% less oil.',
      'Bake instead of fry - healthier and faster.',
      'Mix oils: 50% olive + 50% mustard = optimal nutrition.',
      'Track not just quantity, but quality - choose oils with better fat profiles.',
      'Batch cook with minimal oil - versatile meals ready to go.'
    ];

    let selectedTip = tips[Math.floor(Math.random() * tips.length)];

    // Health-specific tips
    if (healthIssues && healthIssues.includes('fatty-liver')) {
      selectedTip = 'Steam or boil meals - saves your liver, saves oil!';
    } else if (healthIssues && healthIssues.includes('diabetes')) {
      selectedTip = 'Protein-first meals keep blood sugar stable and use less oil.';
    } else if (healthIssues && healthIssues.includes('high-cholesterol')) {
      selectedTip = 'Switch to mustard or olive oil - better fatty acid profiles.';
    }

    // If exceeding limits
    if (adherenceRate > 100) {
      selectedTip = 'You\'ve been over budget lately. Try reducing oil by 20% - you won\'t miss it!';
    }

    return {
      icon: '💡',
      emoji: '✨',
      message: selectedTip,
      source: 'Swasthnani\'s Tip'
    };
  }
}

module.exports = new SwasthnaniService();
