const mongoose = require('mongoose');
require('dotenv').config();

const OilConsumption = require('./models/OilConsumption');
const {
  getAllowedOilKcal,
  getRawOilKcal,
  getMultiplier,
  getEffectiveKcal
} = require('./utils/oilCalorieUtils');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swasthtel')
  .then(() => console.log('MongoDB connected for migration'))
  .catch(err => console.error('MongoDB connection error:', err));

// STAGE 1 : Allowed Oil Calories for the day
//   Total Calories     = BMR x ActivityFactor
//   Allowed Oil Kcal   = Total Calories x 0.07
//                      = BMR x AF x 0.07
//   Shorthand reference: (BMR x AF) / 16 (approx)
function getAllowedOilKcalRef(bmr, activityFactor) {
  return getAllowedOilKcal(bmr, activityFactor);
}

// STAGE 2 : Raw calories from oil used
//   Raw Oil Kcal = oilAmount (g) x 9
function getRawOilKcalRef(oilAmountGrams) {
  return getRawOilKcal(oilAmountGrams);
}

// STAGE 3 : Quality adjustment
function getMultiplierRef(sfaPercent, tfaPercent, pufaPercent, k = 0.2) {
  return getMultiplier(sfaPercent, tfaPercent, pufaPercent, k);
}

function getEffectiveKcalRef(rawKcal, multiplier) {
  return getEffectiveKcal(rawKcal, multiplier);
}

async function migrateOilCalories() {
  try {
    console.log('Starting migration to update oil calorie formulas...');

    const records = await OilConsumption.find({});
    console.log(`Found ${records.length} records to update`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const record of records) {
      try {
        const oilAmount = parseFloat(record.oilAmount);
        if (isNaN(oilAmount) || oilAmount < 0) {
          skippedCount++;
          continue;
        }

        const newRawKcal = getRawOilKcalRef(oilAmount);
        const sfa = parseFloat(record.sfaPercent ?? record.oil?.sfaPercent ?? 0);
        const tfa = parseFloat(record.tfaPercent ?? record.oil?.tfaPercent ?? 0);
        const pufa = parseFloat(record.pufaPercent ?? record.oil?.pufaPercent ?? 0);

        const { harmScore, swasthIndex, multiplier } = getMultiplierRef(sfa, tfa, pufa);
        const newEffectiveKcal = getEffectiveKcalRef(newRawKcal, multiplier);

        if (isNaN(newRawKcal) || isNaN(newEffectiveKcal)) {
          skippedCount++;
          continue;
        }

        const updateFields = {
          rawKcal: newRawKcal,
          effectiveKcal: newEffectiveKcal,
          multiplier,
          harmScore,
          swasthIndex
        };

        if (record.bmr && record.activityFactor) {
          updateFields.allowedOilKcal = getAllowedOilKcalRef(
            parseFloat(record.bmr),
            parseFloat(record.activityFactor)
          );
        }

        await OilConsumption.updateOne(
          { _id: record._id },
          { $set: updateFields }
        );

        updatedCount++;
      } catch (error) {
        console.error(`Error updating record ${record._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\nMigration completed!');
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Applied formulas:');
    console.log('  Stage 1: allowedOilKcal = BMR x AF x 0.07');
    console.log('  Stage 2: rawKcal = oilAmount x 9');
    console.log('  Stage 3: effectiveKcal = rawKcal x multiplier');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateOilCalories();