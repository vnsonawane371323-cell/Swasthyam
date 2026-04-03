require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const OilConsumption = require('./models/OilConsumption');
const DailyGoal = require('./models/DailyGoal');
const { getRawOilKcal, getMultiplier, getEffectiveKcal } = require('./utils/oilCalorieUtils');

// Demo accounts data
const demoAccounts = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@demo.com',
    password: 'demo123',
    phone: '+919876543210',
    age: 28,
    gender: 'female',
    height: 162,
    weight: 58,
    activityLevel: 'moderately-active',
    activityFactor: 1.5,
    bmr: 1350,
    dailyOilLimit: 45,
    isOnboardingComplete: true,
    onboardingStep: 6
  },
  {
    name: 'Rahul Patel',
    email: 'rahul.patel@demo.com',
    password: 'demo123',
    phone: '+919876543211',
    age: 35,
    gender: 'male',
    height: 175,
    weight: 78,
    activityLevel: 'moderately-active',
    activityFactor: 1.5,
    bmr: 1750,
    dailyOilLimit: 50,
    isOnboardingComplete: true,
    onboardingStep: 6
  },
  {
    name: 'Anjali Reddy',
    email: 'anjali.reddy@demo.com',
    password: 'demo123',
    phone: '+919876543212',
    age: 42,
    gender: 'female',
    height: 158,
    weight: 65,
    activityLevel: 'lightly-active',
    activityFactor: 1.3,
    bmr: 1280,
    dailyOilLimit: 40,
    isOnboardingComplete: true,
    onboardingStep: 6
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@demo.com',
    password: 'demo123',
    phone: '+919876543213',
    age: 52,
    gender: 'male',
    height: 170,
    weight: 85,
    activityLevel: 'lightly-active',
    activityFactor: 1.3,
    bmr: 1650,
    dailyOilLimit: 42,
    isOnboardingComplete: true,
    onboardingStep: 6
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer@demo.com',
    password: 'demo123',
    phone: '+919876543214',
    age: 31,
    gender: 'female',
    height: 165,
    weight: 60,
    activityLevel: 'very-active',
    activityFactor: 1.7,
    bmr: 1400,
    dailyOilLimit: 55,
    isOnboardingComplete: true,
    onboardingStep: 6
  }
];

// Sample food data for consumption logs
const sampleMeals = [
  { name: 'Aloo Paratha', oil: 12, meal: 'Breakfast' },
  { name: 'Poha', oil: 8, meal: 'Breakfast' },
  { name: 'Dal Tadka', oil: 10, meal: 'Lunch' },
  { name: 'Paneer Butter Masala', oil: 18, meal: 'Lunch' },
  { name: 'Samosa', oil: 15, meal: 'Snack' },
  { name: 'Pakora', oil: 12, meal: 'Snack' },
  { name: 'Roti with Sabzi', oil: 8, meal: 'Dinner' },
  { name: 'Biryani', oil: 18, meal: 'Dinner' },
  { name: 'Dosa', oil: 10, meal: 'Breakfast' },
  { name: 'Puri Bhaji', oil: 16, meal: 'Breakfast' }
];

const oilTypes = [
  'Sunflower Oil',
  'Mustard Oil',
  'Groundnut Oil',
  'Rice Bran Oil',
  'Olive Oil'
];

const OIL_FAT_PROFILES = {
  'Olive Oil': { sfaPercent: 14, tfaPercent: 0, pufaPercent: 11 },
  'Mustard Oil': { sfaPercent: 7, tfaPercent: 0, pufaPercent: 21 },
  'Groundnut Oil': { sfaPercent: 17, tfaPercent: 0, pufaPercent: 32 },
  'Rice Bran Oil': { sfaPercent: 20, tfaPercent: 0, pufaPercent: 33 },
  'Sunflower Oil': { sfaPercent: 10, tfaPercent: 0, pufaPercent: 66 }
};

function computeOilCalories(grams, oilType) {
  const profile = OIL_FAT_PROFILES[oilType] || { sfaPercent: 0, tfaPercent: 0, pufaPercent: 0 };
  const rawKcal = getRawOilKcal(grams);
  const { harmScore, swasthIndex, multiplier } = getMultiplier(
    profile.sfaPercent,
    profile.tfaPercent,
    profile.pufaPercent
  );

  return {
    ...profile,
    harmScore,
    swasthIndex,
    rawKcal,
    multiplier,
    effectiveKcal: getEffectiveKcal(rawKcal, multiplier)
  };
}

async function createDemoAccounts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected');

    // Clear existing demo accounts
    await User.deleteMany({ email: { $in: demoAccounts.map(a => a.email) } });
    console.log('Cleared existing demo accounts');

    for (const accountData of demoAccounts) {
      console.log(`\nCreating account for ${accountData.name}...`);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(accountData.password, 10);
      
      // Create user
      const user = await User.create({
        ...accountData,
        password: hashedPassword,
        authProvider: 'local',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`✓ User created: ${user.email}`);

      // Generate 30 days of consumption data
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);

        // Random number of meals per day (1-3)
        const numMeals = Math.floor(Math.random() * 3) + 1;
        
        let dailyTotal = 0;
        const consumptions = [];

        for (let j = 0; j < numMeals; j++) {
          const meal = sampleMeals[Math.floor(Math.random() * sampleMeals.length)];
          const oilType = oilTypes[Math.floor(Math.random() * oilTypes.length)];
          const variation = 0.8 + Math.random() * 0.4; // ±20% variation
          const oilAmount = Math.round(meal.oil * variation * 10) / 10;
          
          const calories = computeOilCalories(oilAmount, oilType);
          
          // Set consumption time based on meal type
          let hour = 12;
          if (meal.meal === 'Breakfast') hour = 8;
          else if (meal.meal === 'Lunch') hour = 13;
          else if (meal.meal === 'Snack') hour = 17;
          else if (meal.meal === 'Dinner') hour = 20;
          
          const consumedAt = new Date(date);
          consumedAt.setHours(hour, 0, 0, 0);

          const consumption = await OilConsumption.create({
            userId: user._id,
            foodName: meal.name,
            oilType: oilType,
            oilAmount: oilAmount,
            sfaPercent: calories.sfaPercent,
            tfaPercent: calories.tfaPercent,
            pufaPercent: calories.pufaPercent,
            harmScore: calories.harmScore,
            swasthIndex: calories.swasthIndex,
            rawKcal: calories.rawKcal,
            multiplier: calories.multiplier,
            effectiveKcal: calories.effectiveKcal,
            quantity: 1,
            unit: 'pieces',
            mealType: meal.meal,
            consumedAt: consumedAt,
            verified: true,
            isGroupLog: false,
            members: []
          });

          consumptions.push(consumption);
          dailyTotal += calories.effectiveKcal;
        }

        // Create daily goal entry with all required fields
        const goalKcal = Math.round(accountData.dailyOilLimit * 9);
        const goalGrams = goalKcal / 9;
        const tdee = accountData.bmr * accountData.activityFactor;
        const sRoll = 70; // Default Swastha Score
        const hRoll = 40; // Default Harm Index
        const vBase = tdee * 0.25 * 0.25; // 6.25% of TDEE
        const ha = (100 - hRoll) / 100;
        const vAdj = vBase * (0.6 * (sRoll / 100) + 0.9 * ha);
        
        await DailyGoal.create({
          userId: user._id,
          date: date,
          tdee: tdee,
          sRoll: sRoll,
          hRoll: hRoll,
          vBase: vBase,
          ha: ha,
          vAdj: vAdj,
          goalKcal: goalKcal,
          goalGrams: goalGrams,
          goalMl: accountData.dailyOilLimit,
          cumulativeEffKcal: dailyTotal,
          eventsCount: consumptions.length,
          remainingKcal: Math.max(0, goalKcal - dailyTotal),
          remainingMl: Math.max(0, accountData.dailyOilLimit - (dailyTotal / 9)),
          fillPercent: (dailyTotal / goalKcal) * 100,
          overage: Math.max(0, dailyTotal - goalKcal),
          status: dailyTotal > goalKcal ? 'over_limit' : 'within_limit'
        });
      }

      console.log(`✓ Created 30 days of consumption data`);
    }

    console.log('\n✅ All demo accounts created successfully!\n');
    console.log('='.repeat(60));
    console.log('DEMO ACCOUNT CREDENTIALS');
    console.log('='.repeat(60));
    demoAccounts.forEach(account => {
      console.log(`\nName: ${account.name}`);
      console.log(`Email: ${account.email}`);
      console.log(`Password: ${account.password}`);
      console.log(`Phone: ${account.phone}`);
    });
    console.log('\n' + '='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo accounts:', error);
    process.exit(1);
  }
}

createDemoAccounts();
