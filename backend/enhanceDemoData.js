require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const OilConsumption = require('./models/OilConsumption');
const DailyGoal = require('./models/DailyGoal');
const Group = require('./models/Group');
const { getRawOilKcal, getMultiplier, getEffectiveKcal } = require('./utils/oilCalorieUtils');

// Expanded Indian meals with proper categorization
const indianMeals = {
  breakfast: [
    { name: 'Idli Sambhar', oil: 6, type: 'Light' },
    { name: 'Dosa', oil: 8, type: 'Light' },
    { name: 'Upma', oil: 7, type: 'Light' },
    { name: 'Poha', oil: 6, type: 'Light' },
    { name: 'Aloo Paratha', oil: 12, type: 'Heavy' },
    { name: 'Methi Paratha', oil: 11, type: 'Heavy' },
    { name: 'Puri Bhaji', oil: 16, type: 'Heavy' },
    { name: 'Bread Toast with Butter', oil: 4, type: 'Light' },
    { name: 'Masala Dosa', oil: 10, type: 'Medium' },
    { name: 'Uttapam', oil: 8, type: 'Light' },
    { name: 'Medu Vada', oil: 14, type: 'Heavy' },
    { name: 'Sabudana Khichdi', oil: 9, type: 'Medium' }
  ],
  lunch: [
    { name: 'Dal Tadka', oil: 8, type: 'Light' },
    { name: 'Dal Fry', oil: 9, type: 'Light' },
    { name: 'Rajma Chawal', oil: 10, type: 'Medium' },
    { name: 'Chole Bhature', oil: 18, type: 'Heavy' },
    { name: 'Paneer Butter Masala', oil: 16, type: 'Heavy' },
    { name: 'Palak Paneer', oil: 12, type: 'Medium' },
    { name: 'Aloo Gobi', oil: 10, type: 'Medium' },
    { name: 'Baingan Bharta', oil: 11, type: 'Medium' },
    { name: 'Bhindi Masala', oil: 10, type: 'Medium' },
    { name: 'Mixed Veg Curry', oil: 9, type: 'Light' },
    { name: 'Kadhi Chawal', oil: 8, type: 'Light' },
    { name: 'Biryani', oil: 15, type: 'Heavy' },
    { name: 'Pulao', oil: 10, type: 'Medium' },
    { name: 'Fried Rice', oil: 12, type: 'Medium' },
    { name: 'Dal Makhani', oil: 13, type: 'Heavy' },
    { name: 'Sambhar', oil: 7, type: 'Light' }
  ],
  snack: [
    { name: 'Samosa', oil: 14, type: 'Heavy' },
    { name: 'Pakora', oil: 13, type: 'Heavy' },
    { name: 'Vada Pav', oil: 12, type: 'Heavy' },
    { name: 'Bread Pakora', oil: 11, type: 'Heavy' },
    { name: 'Kachori', oil: 15, type: 'Heavy' },
    { name: 'Bhajiya', oil: 13, type: 'Heavy' },
    { name: 'Aloo Tikki', oil: 10, type: 'Medium' },
    { name: 'Dhokla', oil: 5, type: 'Light' },
    { name: 'Idli', oil: 4, type: 'Light' },
    { name: 'Khakhra', oil: 3, type: 'Light' },
    { name: 'Roasted Peanuts', oil: 2, type: 'Light' },
    { name: 'Bhel Puri', oil: 6, type: 'Light' }
  ],
  dinner: [
    { name: 'Roti with Sabzi', oil: 7, type: 'Light' },
    { name: 'Chapati with Dal', oil: 6, type: 'Light' },
    { name: 'Khichdi', oil: 8, type: 'Light' },
    { name: 'Vegetable Pulao', oil: 9, type: 'Light' },
    { name: 'Paneer Curry with Roti', oil: 12, type: 'Medium' },
    { name: 'Mix Veg with Chapati', oil: 8, type: 'Light' },
    { name: 'Dal Chawal', oil: 7, type: 'Light' },
    { name: 'Rajma with Rice', oil: 10, type: 'Medium' },
    { name: 'Kadhi with Roti', oil: 8, type: 'Light' },
    { name: 'Aloo Paratha', oil: 11, type: 'Medium' },
    { name: 'Dosa with Chutney', oil: 7, type: 'Light' },
    { name: 'Upma', oil: 6, type: 'Light' }
  ]
};

const healthyOils = ['Olive Oil', 'Mustard Oil', 'Groundnut Oil', 'Rice Bran Oil'];
const moderateOils = ['Sunflower Oil', 'Canola Oil'];
const lessHealthyOils = ['Vegetable Oil', 'Palm Oil'];

const OIL_FAT_PROFILES = {
  'Olive Oil': { sfaPercent: 14, tfaPercent: 0, pufaPercent: 11 },
  'Mustard Oil': { sfaPercent: 7, tfaPercent: 0, pufaPercent: 21 },
  'Groundnut Oil': { sfaPercent: 17, tfaPercent: 0, pufaPercent: 32 },
  'Rice Bran Oil': { sfaPercent: 20, tfaPercent: 0, pufaPercent: 33 },
  'Canola Oil': { sfaPercent: 8, tfaPercent: 0, pufaPercent: 28 },
  'Sunflower Oil': { sfaPercent: 10, tfaPercent: 0, pufaPercent: 66 },
  'Vegetable Oil': { sfaPercent: 15, tfaPercent: 0, pufaPercent: 50 },
  'Palm Oil': { sfaPercent: 50, tfaPercent: 0, pufaPercent: 10 }
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

// Generate meals showing progress (higher oil usage in Nov, lower in Dec)
function generateMealsForMonth(month, accountProfile) {
  const isNovember = month === 11; // 0-indexed
  const today = new Date();
  const year = 2025;
  
  let endDay;
  if (month === 11) {
    endDay = 30; // All of November
  } else if (month === 12) {
    endDay = Math.min(today.getDate(), 31); // December up to today (9th)
  }
  
  const meals = [];
  
  for (let day = 1; day <= endDay; day++) {
    const date = new Date(year, month - 1, day); // month-1 because Date is 0-indexed
    
    // Skip some days randomly (80% meal logging rate)
    if (Math.random() < 0.2) continue;
    
    // Determine meal preference based on progress
    // November: More heavy meals (less conscious)
    // December: More light meals (showing improvement)
    const heavyMealChance = isNovember ? 0.5 : 0.2; // 50% heavy in Nov, 20% in Dec
    const lightMealChance = isNovember ? 0.2 : 0.5; // 20% light in Nov, 50% in Dec
    
    // Breakfast
    const breakfastOptions = indianMeals.breakfast;
    const breakfastType = Math.random() < heavyMealChance ? 'Heavy' : 
                         Math.random() < lightMealChance ? 'Light' : 'Medium';
    const breakfast = breakfastOptions.filter(m => m.type === breakfastType)[
      Math.floor(Math.random() * breakfastOptions.filter(m => m.type === breakfastType).length)
    ] || breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)];
    
    meals.push({
      meal: breakfast,
      mealType: 'Breakfast',
      date: new Date(date.setHours(8, 0, 0, 0))
    });
    
    // Lunch
    const lunchOptions = indianMeals.lunch;
    const lunchType = Math.random() < heavyMealChance ? 'Heavy' : 
                     Math.random() < lightMealChance ? 'Light' : 'Medium';
    const lunch = lunchOptions.filter(m => m.type === lunchType)[
      Math.floor(Math.random() * lunchOptions.filter(m => m.type === lunchType).length)
    ] || lunchOptions[Math.floor(Math.random() * lunchOptions.length)];
    
    meals.push({
      meal: lunch,
      mealType: 'Lunch',
      date: new Date(date.setHours(13, 0, 0, 0))
    });
    
    // Snack (60% chance)
    if (Math.random() < 0.6) {
      const snackOptions = indianMeals.snack;
      const snackType = Math.random() < heavyMealChance ? 'Heavy' : 'Light';
      const snack = snackOptions.filter(m => m.type === snackType)[
        Math.floor(Math.random() * snackOptions.filter(m => m.type === snackType).length)
      ] || snackOptions[Math.floor(Math.random() * snackOptions.length)];
      
      meals.push({
        meal: snack,
        mealType: 'Snack',
        date: new Date(date.setHours(17, 0, 0, 0))
      });
    }
    
    // Dinner
    const dinnerOptions = indianMeals.dinner;
    const dinnerType = Math.random() < heavyMealChance ? 'Medium' : 'Light'; // Dinner usually lighter
    const dinner = dinnerOptions.filter(m => m.type === dinnerType)[
      Math.floor(Math.random() * dinnerOptions.filter(m => m.type === dinnerType).length)
    ] || dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)];
    
    meals.push({
      meal: dinner,
      mealType: 'Dinner',
      date: new Date(date.setHours(20, 0, 0, 0))
    });
  }
  
  return meals;
}

async function enhanceAccounts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected\n');

    const demoEmails = [
      'priya.sharma@demo.com',
      'rahul.patel@demo.com',
      'anjali.reddy@demo.com',
      'vikram.singh@demo.com',
      'meera.iyer@demo.com'
    ];

    // Create groups
    console.log('Creating demo groups...\n');
    
    const users = await User.find({ email: { $in: demoEmails } });
    
    // Family Group
    const familyGroup = await Group.create({
      name: 'Sharma Family',
      admin: users[0]._id, // Priya is admin
      members: [
        { userId: users[0]._id, role: 'admin', status: 'active' },
        { userId: users[2]._id, role: 'member', status: 'active' }
      ],
      type: 'family',
      description: 'Our family health journey'
    });
    console.log('✓ Created: Sharma Family (Admin: Priya)');

    // Friends Group
    const friendsGroup = await Group.create({
      name: 'Health Warriors',
      admin: users[1]._id, // Rahul is admin
      members: [
        { userId: users[1]._id, role: 'admin', status: 'active' },
        { userId: users[4]._id, role: 'member', status: 'active' }
      ],
      type: 'community',
      description: 'Friends supporting each other in health journey'
    });
    console.log('✓ Created: Health Warriors (Admin: Rahul)');

    // Community Group
    const workGroup = await Group.create({
      name: 'Office Wellness Group',
      admin: users[3]._id, // Vikram is admin
      members: [
        { userId: users[3]._id, role: 'admin', status: 'active' },
        { userId: users[0]._id, role: 'member', status: 'active' },
        { userId: users[1]._id, role: 'member', status: 'active' }
      ],
      type: 'community',
      description: 'Staying healthy at work together'
    });
    console.log('✓ Created: Office Wellness Group (Admin: Vikram)\n');

    // Delete existing November and December data
    const novStart = new Date('2025-11-01');
    const decEnd = new Date('2025-12-10');
    
    for (const user of users) {
      await OilConsumption.deleteMany({
        userId: user._id,
        consumedAt: { $gte: novStart, $lt: decEnd }
      });
      await DailyGoal.deleteMany({
        userId: user._id,
        date: { $gte: novStart, $lt: decEnd }
      });
    }
    console.log('Cleared existing November-December data\n');

    // Add meals for each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`Processing ${user.name}...`);
      
      const accountData = {
        bmr: user.bmr || 1500,
        activityFactor: user.activityFactor || 1.5,
        dailyOilLimit: user.dailyOilLimit || 45
      };

      // Oil preference based on user (showing progression to healthier oils)
      let oilPreference = [];
      if (i === 0 || i === 4) { // Priya and Meera use healthier oils
        oilPreference = healthyOils;
      } else if (i === 1 || i === 2) { // Rahul and Anjali use moderate oils
        oilPreference = [...healthyOils, ...moderateOils];
      } else { // Vikram still uses less healthy oils sometimes
        oilPreference = [...moderateOils, ...lessHealthyOils];
      }

      // Generate November meals (higher oil usage)
      const novemberMeals = generateMealsForMonth(11, accountData);
      console.log(`  November: ${novemberMeals.length} meals`);
      
      for (const mealEntry of novemberMeals) {
        const oilType = oilPreference[Math.floor(Math.random() * oilPreference.length)];
        const variation = 0.9 + Math.random() * 0.3; // Higher variation (90-120%)
        const oilAmount = Math.round(mealEntry.meal.oil * variation * 10) / 10;
        
        const calories = computeOilCalories(oilAmount, oilType);
        
        await OilConsumption.create({
          userId: user._id,
          foodName: mealEntry.meal.name,
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
          mealType: mealEntry.mealType,
          consumedAt: mealEntry.date,
          verified: true,
          isGroupLog: false,
          members: []
        });
      }

      // Generate December meals (showing improvement - lower oil usage)
      const decemberMeals = generateMealsForMonth(12, accountData);
      console.log(`  December: ${decemberMeals.length} meals`);
      
      for (const mealEntry of decemberMeals) {
        // Use healthier oils more in December
        const healthierOils = [...healthyOils, ...moderateOils];
        const oilType = healthierOils[Math.floor(Math.random() * healthierOils.length)];
        const variation = 0.75 + Math.random() * 0.2; // Lower variation (75-95%) - improvement!
        const oilAmount = Math.round(mealEntry.meal.oil * variation * 10) / 10;
        
        const calories = computeOilCalories(oilAmount, oilType);
        
        await OilConsumption.create({
          userId: user._id,
          foodName: mealEntry.meal.name,
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
          mealType: mealEntry.mealType,
          consumedAt: mealEntry.date,
          verified: true,
          isGroupLog: false,
          members: []
        });
      }

      console.log(`  ✓ Completed ${user.name}\n`);
    }

    console.log('='.repeat(60));
    console.log('✅ All demo accounts enhanced successfully!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log('• November: Higher oil consumption (establishing baseline)');
    console.log('• December: Lower oil consumption (showing progress)');
    console.log('• Proper Indian meals throughout');
    console.log('• 3 groups created with proper memberships');
    console.log('\n👥 Groups:');
    console.log('• Sharma Family (Priya, Anjali)');
    console.log('• Health Warriors (Rahul, Meera)');
    console.log('• Office Wellness Group (Vikram, Priya, Rahul)');
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

enhanceAccounts();

