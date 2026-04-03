const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { validateSignup, validateLogin, validateOnboarding, sanitizeString } = require('../utils/validators');
const { asyncHandler } = require('../middleware/error');

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
    sedentary: 1.2,
    low: 1.2,
    'low-active': 1.2,
    'lightly-active': 1.375,
    'moderately-active': 1.55,
    'very-active': 1.725,
    'extra-active': 1.9
  };
  return factors[level] || 1.5;
}

function computeBmrFromProfile(age, height, weight, gender) {
  const ageNum = Number(age);
  const heightNum = Number(height);
  const weightNum = Number(weight);
  if (!ageNum || !heightNum || !weightNum) return null;

  let bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum;
  const g = String(gender || '').toLowerCase();
  if (g === 'male') bmr += 5;
  else if (g === 'female') bmr -= 161;
  return Math.round(bmr);
}

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  
  // Validate input
  const validation = validateSignup({ email, password, name });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists',
      errors: { email: 'Email already registered' }
    });
  }
  
  // Create user
  const user = await User.create({
    email: email.toLowerCase().trim(),
    password,
    name: name ? sanitizeString(name) : undefined,
    isOnboardingComplete: false,
    onboardingStep: 0
  });
  
  // Generate token
  const token = generateToken(user);
  
  // Send response
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: user.toPublicJSON()
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  const validation = validateLogin({ email, password });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  try {
    // Find user and verify password
    const user = await User.findByCredentials(email.toLowerCase().trim(), password);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user);
    
    // Send response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      errors: { credentials: 'Invalid email or password' }
    });
  }
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    user: user.toPublicJSON()
  });
});

/**
 * @desc    Update user profile / onboarding data
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    age,
    gender,
    height,
    weight,
    bmr,
    activityLevel,
    activityFactor,
    tdee,
    calorieGoal,
    adjustedTdee,
    medicalHistory,
    mealsPerDay,
    frequencyToEatOutside,
    foodieLevel,
    dietaryPreference,
    preferredCookingStyle,
    currentOils,
    monthlyOilConsumption,
    oilBudget,
    language,
    isOnboardingComplete,
    onboardingStep,
    phoneNumber,
    avatar
  } = req.body;
  
  // Validate onboarding data
  const validation = validateOnboarding({ age, height, weight, gender });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  // Build update object
  const updateData = {};
  
  if (name !== undefined) updateData.name = sanitizeString(name);
  if (age !== undefined) updateData.age = Number(age);
  if (gender !== undefined) updateData.gender = gender;
  if (height !== undefined) updateData.height = Number(height);
  if (weight !== undefined) updateData.weight = Number(weight);
  if (bmr !== undefined) updateData.bmr = Number(bmr);
  if (activityLevel !== undefined) {
    const normalizedLevel = normalizeActivityLevel(activityLevel);
    updateData.activityLevel = normalizedLevel;
    updateData.activityFactor = getActivityFactorFromLevel(normalizedLevel);
  } else if (activityFactor !== undefined) {
    updateData.activityFactor = Number(activityFactor);
  }
  if (tdee !== undefined) updateData.tdee = Number(tdee);
  if (calorieGoal !== undefined) {
    const validGoals = ['lose', 'maintain', 'gain'];
    if (validGoals.includes(calorieGoal)) {
      updateData.calorieGoal = calorieGoal;
      // Calculate adjustedTdee based on calorie goal
      const baseTdee = tdee || req.user.tdee || Number(updateData.tdee) || 2000;
      const goalAdjustment = calorieGoal === 'lose' ? -500 : calorieGoal === 'gain' ? 500 : 0;
      updateData.adjustedTdee = Math.round(Number(baseTdee) + goalAdjustment);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid calorie goal. Must be one of: lose, maintain, gain'
      });
    }
  }
  if (adjustedTdee !== undefined) updateData.adjustedTdee = Number(adjustedTdee);
  if (medicalHistory !== undefined) updateData.medicalHistory = medicalHistory;
  if (mealsPerDay !== undefined) updateData.mealsPerDay = mealsPerDay;
  if (frequencyToEatOutside !== undefined) updateData.frequencyToEatOutside = frequencyToEatOutside;
  if (foodieLevel !== undefined) updateData.foodieLevel = foodieLevel;
  if (dietaryPreference !== undefined) updateData.dietaryPreference = sanitizeString(dietaryPreference);
  if (preferredCookingStyle !== undefined) updateData.preferredCookingStyle = sanitizeString(preferredCookingStyle);
  if (currentOils !== undefined) updateData.currentOils = currentOils;
  if (monthlyOilConsumption !== undefined) updateData.monthlyOilConsumption = Number(monthlyOilConsumption);
  if (oilBudget !== undefined) updateData.oilBudget = oilBudget;
  if (language !== undefined) updateData.language = language;
  if (isOnboardingComplete !== undefined) updateData.isOnboardingComplete = isOnboardingComplete;
  if (onboardingStep !== undefined) updateData.onboardingStep = Number(onboardingStep);
  if (phoneNumber !== undefined) updateData.phoneNumber = sanitizeString(phoneNumber);
  if (avatar !== undefined) updateData.avatar = avatar;
  
  // Calculate BMI if height and weight are provided
  if (updateData.height && updateData.weight) {
    const heightInMeters = updateData.height / 100;
    updateData.bmi = parseFloat((updateData.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }

  const resolvedAge = updateData.age !== undefined ? updateData.age : req.user.age;
  const resolvedHeight = updateData.height !== undefined ? updateData.height : req.user.height;
  const resolvedWeight = updateData.weight !== undefined ? updateData.weight : req.user.weight;
  const resolvedGender = updateData.gender !== undefined ? updateData.gender : req.user.gender;
  const computedBmr = computeBmrFromProfile(resolvedAge, resolvedHeight, resolvedWeight, resolvedGender);
  if (computedBmr) {
    if (updateData.bmr === undefined) {
      updateData.bmr = computedBmr;
    }
    if (tdee === undefined) {
      const resolvedActivityFactor = updateData.activityFactor !== undefined
        ? updateData.activityFactor
        : Number(req.user.activityFactor) || 1.5;
      updateData.tdee = Math.round((Number(updateData.bmr) || computedBmr) * resolvedActivityFactor);
    }
  }
  
  // Calculate health risk based on medical history and BMI
  if (updateData.medicalHistory || updateData.bmi) {
    const user = await User.findById(req.user._id);
    const medicalConditions = updateData.medicalHistory || user.medicalHistory || [];
    const bmi = updateData.bmi || user.bmi || 22;
    
    // Simple health risk calculation
    let riskScore = 0;
    
    // BMI risk
    if (bmi < 18.5 || bmi >= 30) riskScore += 25;
    else if (bmi >= 25) riskScore += 15;
    
    // Medical conditions risk
    medicalConditions.forEach(condition => {
      switch (condition.severity) {
        case 'severe': riskScore += 20; break;
        case 'moderate': riskScore += 12; break;
        case 'mild': riskScore += 5; break;
      }
    });
    
    updateData.healthRiskLevel = Math.min(100, riskScore);
    
    // Adjust daily oil limit based on risk
    if (riskScore > 50) {
      updateData.dailyOilLimit = 30;
    } else if (riskScore > 25) {
      updateData.dailyOilLimit = 40;
    } else {
      updateData.dailyOilLimit = 50;
    }
  }
  
  // Update user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: user.toPublicJSON()
  });
});

/**
 * @desc    Complete onboarding with all data
 * @route   POST /api/auth/complete-onboarding
 * @access  Private
 */
const completeOnboarding = asyncHandler(async (req, res) => {
  const {
    // Basic Info (Step 1)
    name,
    age,
    gender,
    height,
    weight,
    bmr,
    activityLevel,
    activityFactor,
    tdee,
    calorieGoal,
    adjustedTdee,
    
    // Medical History (Step 2)
    medicalHistory,
    reportType,
    
    // Eating Habits (Step 3)
    mealsPerDay,
    frequencyToEatOutside,
    foodieLevel,
    dietaryPreference,
    preferredCookingStyle,
    
    // Oil Preferences (Steps 4-5)
    currentOils,
    monthlyOilConsumption,
    oilBudget
  } = req.body;
  
  // Validate
  const validation = validateOnboarding({ age, height, weight, gender });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  // Build update object
  const updateData = {
    isOnboardingComplete: true,
    onboardingStep: 6
  };
  
  if (name) updateData.name = sanitizeString(name);
  if (age) updateData.age = Number(age);
  if (gender) updateData.gender = gender;
  if (height) updateData.height = Number(height);
  if (weight) updateData.weight = Number(weight);
  if (bmr) updateData.bmr = Number(bmr);
  if (activityLevel) {
    const normalizedLevel = normalizeActivityLevel(activityLevel);
    updateData.activityLevel = normalizedLevel;
    updateData.activityFactor = getActivityFactorFromLevel(normalizedLevel);
  } else if (activityFactor) {
    updateData.activityFactor = Number(activityFactor);
  }
  if (tdee !== undefined) {
    updateData.tdee = Number(tdee);
  }

  const computedBmr = computeBmrFromProfile(updateData.age, updateData.height, updateData.weight, updateData.gender);
  if (computedBmr) {
    if (updateData.bmr === undefined) {
      updateData.bmr = computedBmr;
    }
    if (updateData.tdee === undefined) {
      const resolvedActivityFactor = updateData.activityFactor || 1.5;
      updateData.tdee = Math.round((Number(updateData.bmr) || computedBmr) * resolvedActivityFactor);
    }
  } else if (tdee !== undefined) {
    updateData.tdee = Number(tdee);
  }
  
  // Handle calorie goal
  if (calorieGoal !== undefined) {
    const validGoals = ['lose', 'maintain', 'gain'];
    if (validGoals.includes(calorieGoal)) {
      updateData.calorieGoal = calorieGoal;
      // Calculate adjustedTdee based on calorie goal
      const baseTdee = updateData.tdee || 2000;
      const goalAdjustment = calorieGoal === 'lose' ? -500 : calorieGoal === 'gain' ? 500 : 0;
      updateData.adjustedTdee = Math.round(baseTdee + goalAdjustment);
    }
  } else {
    // Default to maintain calorie goal
    updateData.calorieGoal = 'maintain';
    updateData.adjustedTdee = updateData.tdee || 2000;
  }
  if (adjustedTdee !== undefined) updateData.adjustedTdee = Number(adjustedTdee);
  
  if (medicalHistory) updateData.medicalHistory = medicalHistory;
  if (reportType) updateData.reportType = reportType;
  if (mealsPerDay) updateData.mealsPerDay = mealsPerDay;
  if (frequencyToEatOutside) updateData.frequencyToEatOutside = frequencyToEatOutside;
  if (foodieLevel) updateData.foodieLevel = foodieLevel;
  if (dietaryPreference) updateData.dietaryPreference = sanitizeString(dietaryPreference);
  if (preferredCookingStyle) updateData.preferredCookingStyle = sanitizeString(preferredCookingStyle);
  if (currentOils) updateData.currentOils = currentOils;
  if (monthlyOilConsumption) updateData.monthlyOilConsumption = Number(monthlyOilConsumption);
  if (oilBudget) updateData.oilBudget = oilBudget;
  
  // Calculate BMI
  if (updateData.height && updateData.weight) {
    const heightInMeters = updateData.height / 100;
    updateData.bmi = parseFloat((updateData.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  
  // Calculate health risk
  const medicalConditions = updateData.medicalHistory || [];
  const bmi = updateData.bmi || 22;
  
  let riskScore = 0;
  
  if (bmi < 18.5 || bmi >= 30) riskScore += 25;
  else if (bmi >= 25) riskScore += 15;
  
  medicalConditions.forEach(condition => {
    switch (condition.severity) {
      case 'severe': riskScore += 20; break;
      case 'moderate': riskScore += 12; break;
      case 'mild': riskScore += 5; break;
    }
  });
  
  updateData.healthRiskLevel = Math.min(100, riskScore);
  
  if (riskScore > 50) {
    updateData.dailyOilLimit = 30;
  } else if (riskScore > 25) {
    updateData.dailyOilLimit = 40;
  } else {
    updateData.dailyOilLimit = 50;
  }
  
  // Update user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );
  
  res.json({
    success: true,
    message: 'Onboarding completed successfully',
    user: user.toPublicJSON()
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current and new password'
    });
  }
  
  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  
  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }
  
  // Validate new password
  const { validatePassword } = require('../utils/validators');
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Password validation failed',
      errors: { password: passwordValidation.errors.join('. ') }
    });
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Generate new token
  const token = generateToken(user);
  
  res.json({
    success: true,
    message: 'Password changed successfully',
    token
  });
});

/**
 * @desc    Delete account
 * @route   DELETE /api/auth/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  
  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

/**
 * @desc    Social authentication (Google, Facebook, Apple)
 * @route   POST /api/auth/social
 * @access  Public
 */
const socialAuth = asyncHandler(async (req, res) => {
  const { provider, accessToken, identityToken, user: socialUser } = req.body;
  
  // Validate provider
  const validProviders = ['google', 'facebook', 'apple'];
  if (!provider || !validProviders.includes(provider)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid authentication provider'
    });
  }
  
  // Validate required fields
  if (!socialUser || !socialUser.id) {
    return res.status(400).json({
      success: false,
      message: 'User data is required'
    });
  }
  
  // For Apple, identityToken is required; for others, accessToken
  if (provider === 'apple' && !identityToken) {
    return res.status(400).json({
      success: false,
      message: 'Identity token is required for Apple sign in'
    });
  }
  
  if ((provider === 'google' || provider === 'facebook') && !accessToken) {
    return res.status(400).json({
      success: false,
      message: 'Access token is required'
    });
  }
  
  try {
    // Create a provider-specific ID field
    const providerIdField = `${provider}Id`;
    
    // Check if user exists with this social ID
    let user = await User.findOne({ [providerIdField]: socialUser.id });
    
    // If not found by social ID, check by email
    if (!user && socialUser.email) {
      user = await User.findOne({ email: socialUser.email.toLowerCase() });
      
      // If found by email, link the social account
      if (user) {
        user[providerIdField] = socialUser.id;
        if (!user.avatar && socialUser.picture) {
          user.avatar = socialUser.picture;
        }
        await user.save();
      }
    }
    
    // If still not found, create new user
    if (!user) {
      // Generate a random password for social auth users
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      
      user = await User.create({
        email: socialUser.email?.toLowerCase() || `${provider}_${socialUser.id}@social.auth`,
        password: randomPassword,
        name: socialUser.name || undefined,
        avatar: socialUser.picture || undefined,
        [providerIdField]: socialUser.id,
        authProvider: provider,
        isOnboardingComplete: false,
        onboardingStep: 0
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign in successful`,
      token,
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error(`Social auth error (${provider}):`, error);
    res.status(500).json({
      success: false,
      message: 'Social authentication failed. Please try again.'
    });
  }
});

/**
 * @desc    Search users by email or name
 * @route   GET /api/auth/search-users
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }
  
  // Search by email or name, exclude current user
  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { email: { $regex: query, $options: 'i' } },
      { name: { $regex: query, $options: 'i' } }
    ]
  })
  .select('_id email name avatar')
  .limit(10);
  
  res.json({
    success: true,
    users: users.map(u => ({
      _id: u._id,
      email: u.email,
      name: u.name || 'Unknown',
      avatar: u.avatar
    }))
  });
});

/**
 * @desc    Add family member
 * @route   POST /api/auth/family
 * @access  Private
 */
const addFamilyMember = asyncHandler(async (req, res) => {
  const { userId, relation } = req.body;
  
  if (!userId || !relation) {
    return res.status(400).json({
      success: false,
      message: 'User ID and relation are required'
    });
  }
  
  const validRelations = ['spouse', 'parent', 'child', 'sibling', 'other'];
  if (!validRelations.includes(relation)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid relation type'
    });
  }
  
  // Check if user exists
  const memberToAdd = await User.findById(userId);
  if (!memberToAdd) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Get current user
  const user = await User.findById(req.user._id);
  
  // Check if already a family member
  const alreadyMember = user.familyMembers?.some(
    member => member.user.toString() === userId
  );
  
  if (alreadyMember) {
    return res.status(400).json({
      success: false,
      message: 'User is already a family member'
    });
  }
  
  // Add family member
  if (!user.familyMembers) {
    user.familyMembers = [];
  }
  
  user.familyMembers.push({
    user: userId,
    relation,
    addedAt: new Date()
  });
  
  await user.save();
  
  // Get updated user with populated family members
  const updatedUser = await User.findById(req.user._id)
    .populate('familyMembers.user', '_id email name avatar');
  
  res.json({
    success: true,
    message: 'Family member added successfully',
    user: updatedUser.toPublicJSON()
  });
});

/**
 * @desc    Remove family member
 * @route   DELETE /api/auth/family/:userId
 * @access  Private
 */
const removeFamilyMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(req.user._id);
  
  if (!user.familyMembers || user.familyMembers.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No family members found'
    });
  }
  
  const memberIndex = user.familyMembers.findIndex(
    member => member.user.toString() === userId
  );
  
  if (memberIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Family member not found'
    });
  }
  
  user.familyMembers.splice(memberIndex, 1);
  await user.save();
  
  res.json({
    success: true,
    message: 'Family member removed successfully',
    user: user.toPublicJSON()
  });
});

/**
 * @desc    Get family members
 * @route   GET /api/auth/family
 * @access  Private
 */
const getFamilyMembers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('familyMembers.user', '_id email name avatar dailyOilLimit');
  
  const familyMembers = (user.familyMembers || []).map(member => ({
    _id: member.user?._id,
    email: member.user?.email,
    name: member.user?.name || 'Unknown',
    avatar: member.user?.avatar,
    relation: member.relation,
    addedAt: member.addedAt,
    dailyOilLimit: member.user?.dailyOilLimit || 50
  }));
  
  res.json({
    success: true,
    familyMembers
  });
});

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  completeOnboarding,
  changePassword,
  deleteAccount,
  socialAuth,
  searchUsers,
  addFamilyMember,
  removeFamilyMember,
  getFamilyMembers
};
