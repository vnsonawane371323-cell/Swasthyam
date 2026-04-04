require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const OilConsumption = require('./models/OilConsumption');
const { getRawOilKcal, getMultiplier, getEffectiveKcal } = require('./utils/oilCalorieUtils');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB connected');
  
  try {
    // Find Priya's account
    const priya = await User.findOne({ email: 'priya.sharma@demo.com' });
    if (!priya) {
      console.log('❌ Priya account not found. Please run createDemoAccounts.js first');
      process.exit(1);
    }
    
    console.log(`✅ Found Priya: ${priya.name}`);
    
    // Clear today's entries for Priya
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await OilConsumption.deleteMany({
      userId: priya._id,
      consumedAt: { $gte: today, $lt: tomorrow }
    });
    console.log('🗑️ Cleared today\'s entries');
    
    // Sample meals for today
    const mealsToday = [
      {
        foodName: 'Aloo Paratha (Breakfast)',
        oilAmount: 12,
        oilType: 'Mustard Oil',
        mealType: 'Breakfast',
        quantity: 2,
        unit: 'pieces',
        time: 8,
        sfa: 15,
        tfa: 0,
        pufa: 25
      },
      {
        foodName: 'Dal Makhani (Lunch)',
        oilAmount: 18,
        oilType: 'Mustard Oil',
        mealType: 'Lunch',
        quantity: 1,
        unit: 'bowls',
        time: 12,
        sfa: 12,
        tfa: 0,
        pufa: 22
      },
      {
        foodName: 'Paneer Tikka (Snack)',
        oilAmount: 8,
        oilType: 'Vegetable Oil',
        mealType: 'Snack',
        quantity: 5,
        unit: 'pieces',
        time: 15,
        sfa: 18,
        tfa: 2,
        pufa: 20
      },
      {
        foodName: 'Chicken Curry with Rice (Dinner)',
        oilAmount: 15,
        oilType: 'Sunflower Oil',
        mealType: 'Dinner',
        quantity: 1,
        unit: 'bowls',
        time: 19,
        sfa: 10,
        tfa: 1,
        pufa: 28
      }
    ];
    
    // Log each meal
    for (const meal of mealsToday) {
      const consumedAt = new Date(today);
      consumedAt.setHours(meal.time, Math.floor(Math.random() * 60), 0, 0);
      
      // Calculate nutrition
      const rawKcal = getRawOilKcal(meal.oilAmount);
      const { harmScore, swasthIndex, multiplier } = getMultiplier(meal.sfa, meal.tfa, meal.pufa);
      const effectiveKcal = getEffectiveKcal(rawKcal, multiplier);
      
      const entry = await OilConsumption.create({
        userId: priya._id,
        foodName: meal.foodName,
        oilType: meal.oilType,
        oilAmount: meal.oilAmount,
        oilAmountUnit: 'g',
        sfaPercent: meal.sfa,
        tfaPercent: meal.tfa,
        pufaPercent: meal.pufa,
        harmScore,
        swasthIndex,
        rawKcal,
        multiplier,
        effectiveKcal,
        totalCalories: rawKcal * 1.5, // Estimate total meal calories
        oilCalories: rawKcal,
        quantity: meal.quantity,
        unit: meal.unit,
        mealType: meal.mealType,
        consumedAt
      });
      
      console.log(`✅ Logged ${meal.foodName}: ${meal.oilAmount}g oil, ${rawKcal}cal`);
    }
    
    // Get daily total
    const dailyTotal = await OilConsumption.getDailyTotal(priya._id, today);
    console.log(`\n📊 Today's Summary:`);
    console.log(`   Total Oil: ${Math.round(dailyTotal.totalOil)}g`);
    console.log(`   Total Oil Calories: ${Math.round(dailyTotal.totalOilCalories)}cal`);
    console.log(`   Total Effective Calories: ${Math.round(dailyTotal.totalEffKcal)}cal`);
    console.log(`   Daily Entries: ${dailyTotal.count}`);
    
    // Calculate estimated daily goal based on Priya's profile
    const estimatedDailyLimit = (priya.dailyOilLimit || 45) * 9; // Convert ml to calories
    const progressPercent = Math.round((dailyTotal.totalOilCalories / estimatedDailyLimit) * 100);
    
    console.log(`\n🎯 Daily Goal (Estimated):`);
    console.log(`   Oil Limit: ${estimatedDailyLimit}cal`);
    console.log(`   Current Progress: ${progressPercent}%`);
    
    console.log('\n✅ Sample data created successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
