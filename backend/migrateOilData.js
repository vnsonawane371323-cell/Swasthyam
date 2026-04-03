const mongoose = require('mongoose');
require('dotenv').config();
const { getRawOilKcal, getMultiplier, getEffectiveKcal } = require('./utils/oilCalorieUtils');

// Food Database with accurate oil content
const OIL_CONTENT_DATABASE = {
  // Deep Fried Items (High Oil)
  "samosa": { serving_g: 60, oil_g: 15, category: "deep_fried" },
  "pakora": { serving_g: 80, oil_g: 16, category: "deep_fried" },
  "poori": { serving_g: 40, oil_g: 10, category: "deep_fried" },
  "bhatura": { serving_g: 80, oil_g: 12, category: "deep_fried" },
  "vada": { serving_g: 50, oil_g: 12, category: "deep_fried" },
  "kachori": { serving_g: 60, oil_g: 14, category: "deep_fried" },
  
  // Rich Curries (High Oil)
  "butter chicken": { serving_g: 250, oil_g: 24, category: "rich_curry" },
  "paneer butter masala": { serving_g: 200, oil_g: 22, category: "rich_curry" },
  "malai kofta": { serving_g: 200, oil_g: 25, category: "rich_curry" },
  "korma": { serving_g: 250, oil_g: 23, category: "rich_curry" },
  "shahi paneer": { serving_g: 200, oil_g: 21, category: "rich_curry" },
  
  // Medium Oil Curries
  "palak paneer": { serving_g: 180, oil_g: 15, category: "gravy" },
  "chole": { serving_g: 200, oil_g: 12, category: "gravy" },
  "rajma": { serving_g: 200, oil_g: 11, category: "gravy" },
  "kadai paneer": { serving_g: 200, oil_g: 16, category: "gravy" },
  "bhindi masala": { serving_g: 200, oil_g: 13, category: "gravy" },
  "aloo matar": { serving_g: 150, oil_g: 10, category: "gravy" },
  "baingan bharta": { serving_g: 180, oil_g: 14, category: "gravy" },
  
  // Dal (Light Oil)
  "dal tadka": { serving_g: 200, oil_g: 10, category: "dal" },
  "dal fry": { serving_g: 200, oil_g: 11, category: "dal" },
  "dal makhani": { serving_g: 200, oil_g: 14, category: "dal" },
  "sambhar": { serving_g: 200, oil_g: 8, category: "dal" },
  
  // Rice Dishes
  "biryani": { serving_g: 350, oil_g: 18, category: "rice" },
  "pulao": { serving_g: 300, oil_g: 12, category: "rice" },
  "fried rice": { serving_g: 300, oil_g: 14, category: "rice" },
  "jeera rice": { serving_g: 250, oil_g: 8, category: "rice" },
  
  // Breads
  "naan": { serving_g: 80, oil_g: 6, category: "bread" },
  "roti": { serving_g: 40, oil_g: 2, category: "bread" },
  "chapati": { serving_g: 40, oil_g: 2, category: "bread" },
  "paratha": { serving_g: 60, oil_g: 8, category: "bread" },
  "aloo paratha": { serving_g: 150, oil_g: 12, category: "bread" },
  "kulcha": { serving_g: 80, oil_g: 6, category: "bread" },
  
  // South Indian
  "dosa": { serving_g: 120, oil_g: 5, category: "south_indian" },
  "masala dosa": { serving_g: 200, oil_g: 9, category: "south_indian" },
  "idli": { serving_g: 50, oil_g: 1, category: "south_indian" },
  "uttapam": { serving_g: 150, oil_g: 6, category: "south_indian" },
  
  // Tandoori/Grilled (Low Oil)
  "tandoori chicken": { serving_g: 220, oil_g: 8, category: "tandoori" },
  "paneer tikka": { serving_g: 150, oil_g: 9, category: "tandoori" },
  "chicken tikka": { serving_g: 180, oil_g: 8, category: "tandoori" },
  
  // Street Food
  "pav bhaji": { serving_g: 250, oil_g: 16, category: "street_food" },
  "vada pav": { serving_g: 100, oil_g: 12, category: "street_food" },
  "dabeli": { serving_g: 100, oil_g: 10, category: "street_food" },
};

// Calculate oil amount based on quantity and unit
function calculateOilAmount(foodName, quantity, unit) {
  const foodKey = foodName.toLowerCase().trim();
  const foodData = OIL_CONTENT_DATABASE[foodKey];
  
  if (!foodData) {
    console.warn(`Food not found in database: ${foodName}`);
    return null; // Return null if food not found
  }
  
  let grams = quantity;
  
  if (unit === 'bowls') {
    // 1 bowl = serving size
    grams = quantity * foodData.serving_g;
  } else if (unit === 'pieces') {
    // 1 piece = serving size
    grams = quantity * foodData.serving_g;
  }
  
  // Calculate oil based on proportion of serving size
  const oilPerGram = foodData.oil_g / foodData.serving_g;
  return grams * oilPerGram;
}

// Calculate canonical oil calorie fields.
function calculateSwasthaIndex(oilAmount, sfaPercent = 0, tfaPercent = 0, pufaPercent = 0) {
  const rawKcal = getRawOilKcal(oilAmount);
  const { harmScore, swasthIndex, multiplier } = getMultiplier(sfaPercent, tfaPercent, pufaPercent);
  const effectiveKcal = getEffectiveKcal(rawKcal, multiplier);

  return { rawKcal, multiplier, effectiveKcal, harmScore, swasthIndex };
}

async function migrateOilData() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/swasthtel';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Get OilConsumption model
    const OilConsumption = mongoose.model('OilConsumption', new mongoose.Schema({}, { strict: false }));
    
    // Get all oil consumption records
    const records = await OilConsumption.find({});
    console.log(`Found ${records.length} records to update`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const record of records) {
      try {
        const newOilAmount = calculateOilAmount(record.foodName, record.quantity, record.unit);
        
        if (newOilAmount === null) {
          console.log(`Skipping record ${record._id}: Food "${record.foodName}" not in new database`);
          skipped++;
          continue;
        }
        
        const sfaPercent = parseFloat(record.sfaPercent ?? 0) || 0;
        const tfaPercent = parseFloat(record.tfaPercent ?? 0) || 0;
        const pufaPercent = parseFloat(record.pufaPercent ?? 0) || 0;

        // Calculate new SwasthaIndex values
        const { rawKcal, multiplier, effectiveKcal, harmScore, swasthIndex } = calculateSwasthaIndex(
          newOilAmount,
          sfaPercent,
          tfaPercent,
          pufaPercent
        );
        
        // Update the record
        await OilConsumption.updateOne(
          { _id: record._id },
          {
            $set: {
              oilAmount: newOilAmount,
              sfaPercent,
              tfaPercent,
              pufaPercent,
              harmScore,
              swasthIndex,
              rawKcal: rawKcal,
              multiplier: multiplier,
              effectiveKcal: effectiveKcal
            }
          }
        );
        
        updated++;
        
        if (updated % 10 === 0) {
          console.log(`Updated ${updated} records...`);
        }
      } catch (err) {
        console.error(`Error updating record ${record._id}:`, err.message);
        errors++;
      }
    }
    
    console.log('\n=== Migration Complete ===');
    console.log(`Total records: ${records.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped (food not found): ${skipped}`);
    console.log(`Errors: ${errors}`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateOilData();
