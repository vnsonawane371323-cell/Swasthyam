const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const medicalConditionSchema = new mongoose.Schema({
  condition: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    default: 'mild'
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Basic Authentication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Basic Info (Onboarding Step 1)
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  age: {
    type: Number,
    min: [1, 'Age must be at least 1'],
    max: [150, 'Age cannot exceed 150']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say', '']
  },
  height: {
    type: Number, // in cm
    min: [30, 'Height must be at least 30 cm'],
    max: [300, 'Height cannot exceed 300 cm']
  },
  weight: {
    type: Number, // in kg
    min: [1, 'Weight must be at least 1 kg'],
    max: [500, 'Weight cannot exceed 500 kg']
  },
  bmi: {
    type: Number,
    min: 0
  },
  
  // Medical History (Onboarding Step 2)
  medicalHistory: [medicalConditionSchema],
  reportType: {
    type: String,
    trim: true
  },
  
  // Eating Habits (Onboarding Step 3)
  mealsPerDay: {
    type: String,
    trim: true
  },
  frequencyToEatOutside: {
    type: String,
    enum: ['rarely', 'occasionally', 'weekly', 'frequently', 'daily', '']
  },
  foodieLevel: {
    type: String,
    enum: ['health-conscious', 'balanced', 'foodie', '']
  },
  dietaryPreference: {
    type: String,
    trim: true
  },
  preferredCookingStyle: {
    type: String,
    trim: true
  },
  
  // Oil Preferences (Onboarding Step 4)
  currentOils: [{
    type: String,
    trim: true
  }],
  monthlyOilConsumption: {
    type: Number,
    min: 0
  },
  oilBudget: {
    type: String,
    trim: true
  },
  
  // Additional Preferences
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi']
  },
  
  // Onboarding Status
  isOnboardingComplete: {
    type: Boolean,
    default: false
  },
  onboardingStep: {
    type: Number,
    default: 0,
    min: 0,
    max: 6
  },
  
  // App Data
  dailyOilLimit: {
    type: Number,
    default: 50 // ml
  },
  healthRiskLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // SwasthaIndex metabolic data
  bmr: {
    type: Number, // Basal Metabolic Rate in kcal
    min: 800,
    max: 4000
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'low', 'low-active', 'lightly-active', 'moderately-active', 'very-active', 'extra-active', ''],
    default: 'moderately-active'
  },
  activityFactor: {
    type: Number,
    default: 1.5, // Moderate activity
    min: 1.2,
    max: 2.0
  },
  tdee: {
    type: Number // Total Daily Energy Expenditure (computed)
  },
  calorieGoal: {
    type: String,
    enum: ['lose', 'maintain', 'gain', ''],
    default: 'maintain'
  },
  adjustedTdee: {
    type: Number // TDEE adjusted based on weight goal (-500 for lose, 0 for maintain, +500 for gain)
  },
  
  // Profile
  avatar: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  
  // Family Members (linked users)
  familyMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    relation: {
      type: String,
      enum: ['spouse', 'parent', 'child', 'sibling', 'other'],
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Social Authentication
  googleId: {
    type: String,
    sparse: true,
    index: true
  },
  facebookId: {
    type: String,
    sparse: true,
    index: true
  },
  appleId: {
    type: String,
    sparse: true,
    index: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook', 'apple'],
    default: 'local'
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance (email index is automatic due to unique: true)
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(12);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate BMI before saving if height and weight are provided
userSchema.pre('save', function(next) {
  if (this.weight && this.height) {
    const heightInMeters = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// Static method to find user by email with password
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email }).select('+password');
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }
  
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
