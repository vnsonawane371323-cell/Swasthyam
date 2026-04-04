# SwasthTel - Help & Support Guide

**Version**: 1.0  
**Last Updated**: April 2026  
**Language Support**: English, Hindi

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Application Features](#application-features)
3. [Oil Tracking System](#oil-tracking-system)
4. [IoT Tracker & Connection Guide](#iot-tracker--connection-guide)
5. [Cooking Methods Explained](#cooking-methods-explained)
6. [Oil Types & Health Properties](#oil-types--health-properties)
7. [Calculations & Formulas](#calculations--formulas)
8. [Medical Report Analyzer](#medical-report-analyzer)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Getting Started

### What is SwasthTel?

SwasthTel is a personalized health tracking application designed specifically for Indian households to monitor and optimize cooking oil consumption. The app uses advanced calculations based on health metrics to provide personalized oil consumption recommendations.

**Key Objectives:**
- ✅ Track daily oil consumption with precision
- ✅ Monitor health through medical reports
- ✅ Optimize dietary oil intake based on health status
- ✅ Provide culturally relevant cooking suggestions
- ✅ Build a community of health-conscious users

### Initial Setup

1. **Download & Install**: Get SwasthTel from your app store
2. **Create Account**: Sign up with email or social authentication
3. **Onboarding**: Complete 3-step health profile setup
   - Enter personal health information (age, weight, height, gender)
   - Specify activity level
   - Confirm daily cooking oil preferences
4. **Grant Permissions**: Allow camera access for scanning (if needed)
5. **Start Tracking**: Begin logging your daily oil consumption

---

## Application Features

### 1. **Dashboard/Home Screen**
- **Health Summary Card**: Quick overview of your health status
- **Daily Oil Goal**: Personalized recommendation based on health profile
- **Recent Logs**: View your last 5 oil consumption entries
- **Quick Actions**: Fast access to common tasks

### 2. **Oil Consumption Tracker**
- Log oil consumption from:
  - Manual entry (weight or volume)
  - Barcode scanning (packaged oils)
  - IoT device reading (smart weight scale)
  - Food dish entry (automatic oil estimation)
- Real-time calorie calculation
- Daily progress tracking with visual indicators

### 3. **IoT Device Integration**
- Connect smart weight scales via WiFi
- Get real-time oil readings
- Automatic data logging
- Historical data tracking

### 4. **Barcode Scanner**
- Scan oil bottles to get nutritional information
- Get SwasthaIndex score (health rating 0-100)
- View fatty acid composition
- Get alternative product suggestions

### 5. **Medical Report Analyzer**
- Upload medical/lab reports (PDF or images)
- AI-powered health analysis using Google Gemini
- Automatic oil limit recommendations based on health conditions
- Risk flag identification
- Personalized nutrition recommendations

### 6. **Analytics & Trends**
- 7-day rolling average of oil consumption
- Weekly comparison charts
- Monthly trend analysis
- Health score progression
- Goal achievement tracking

### 7. **Community Features**
- Join or create health groups
- Share challenges with friends
- Compete on leaderboards
- Get community tips and recipes

### 8. **Multilingual Support**
- Available in English and Hindi
- Easy language switching in settings
- All content translated including medical terms

---

## Oil Tracking System

### How Oil Tracking Works

The oil tracking system is built on a sophisticated health-aware framework called **SwasthaIndex System**.

#### Basic Flow:

1. **User enters oil consumption** (weight or volume)
2. **Oil properties are retrieved** (type, density, fatty acids)
3. **Health conditions are analyzed** (liver, kidney, cholesterol levels)
4. **Calculations determine**:
   - Raw calories (9 kcal per gram of oil)
   - Quality-adjusted calories (based on fatty acids)
   - Effective calories (health-adjusted multiplier)
   - Daily goal remaining
5. **Feedback is provided** with practical suggestions

### Logging Methods

#### Method 1: Manual Entry
- **Weight**: Enter in grams (g)
- **Volume**: Enter in milliliters (ml)
- Oil is automatically converted using density: `volume (ml) × 0.92 = weight (g)`

#### Method 2: Barcode Scanning
- Point camera at oil bottle barcode
- App identifies the product
- Fetches nutritional information
- You confirm the amount used

#### Method 3: Dish Entry
- Log by meal (e.g., "Aloo Gobi", "Dhokla")
- App estimates oil content based on dish type
- You confirm or adjust the estimate

#### Method 4: IoT Device Reading
- Connect smart weight scale
- Place oil container on scale
- Reading automatically synced
- Specify cooking method used
- Log with one tap

---

## IoT Tracker & Connection Guide

### What is IoT Tracking?

IoT (Internet of Things) tracking uses smart devices like WiFi-enabled weight scales to directly measure oil consumption. This eliminates manual entry errors and provides precise measurements.

### Supported Devices

**Currently Supported:**
- ESP32-based WiFi Weight Scales
- Generic IoT scales with WiFi connectivity
- Custom calibrated scales with 0.1g precision

### Connection Setup Guide

#### Step 1: Hardware Preparation
1. Obtain a WiFi-enabled smart weight scale
2. Ensure it has power or batteries installed
3. Verify scale is in WiFi mode (check device manual)

#### Step 2: Scale WiFi Connection
1. Access scale's configuration interface (via USB or physical buttons)
2. Select your home WiFi network
3. Enter WiFi password
4. Confirm connection (usually indicated by LED)
5. Note the scale's IP address or device name

#### Step 3: App Connection
1. Open SwasthTel app
2. Go to **Settings → IoT Devices**
3. Tap **Add New Devices**
4. Grant WiFi permission to app
5. Enter scale IP address or device name
6. Tap **Connect**
7. Confirm connection with test reading

#### Step 4: Calibration
1. Place known weight (1kg) on scale
2. Check reading on app
3. If deviation >5g, adjust via calibration menu
4. Save calibration settings

### Using IoT Tracker

#### Logging Oil with IoT Device:

1. **Place oil container** on connected scale
2. **Note the reading** (should appear in app automatically)
3. **Select a cooking option**:
   - Cooking method (deep fry, shallow fry, saute, boil)
   - Reuse count (number of times oil has been reused)
   - Oil type (if auto-detection failed)
   - Dish name (optional, for records)
4. **Tap "Log"**
5. **Review results**:
   - Adjusted volume calculation
   - Calorie estimate
   - Health feedback
   - Suggestions for improvement

#### Example Scenario:
```
Initial Reading: 150g of oil
Cooking Method Selected: Shallow Fry
Reuse Count: 2 (oil reused twice)
Oil Type: Sunflower Oil

Calculation:
- Base Volume: 150g ÷ 0.92 = 163 ml
- Cooking Factor: 163 × 1.15 = 187 ml (shallow fry absorbs 15% more)
- Reuse Degradation: 187 × 0.95 = 177 ml (reused oil loses 5% quality)
- Final Adjusted: 177 ml
- Calories: 177 × 9 ÷ 10 = ~160 kcal
- Health Score Impact: Based on your profile
```

### IoT Device Troubleshooting

| Problem | Solution |
|---------|----------|
| Device not connecting | Verify WiFi is on, check IP address, restart scale |
| Reading shows incorrect | Recalibrate scale with known weight |
| Connection drops | Check WiFi signal strength, move closer to router |
| App not recognizing device | Check scale is on same network, update app |
| Reading changes frequently | Wait for scale to stabilize (30 seconds) |

### Connection Tips

- **Best Results**: Place scale on flat, hard surface
- **WiFi Quality**: Ensure 2.4 GHz WiFi signal is strong
- **Calibration**: Redo annually or if readings seem off
- **Data Privacy**: All readings are encrypted and stored locally first

---

## Cooking Methods Explained

Understanding cooking methods is crucial because different cooking techniques use and retain different amounts of oil.

### 1. Deep Fry (तेल में डूबा कर तलना)

**What it is:**
- Cooking food completely immersed in hot oil
- Oil temperature: 160-190°C
- Food is submerged throughout cooking

**Common dishes:**
- Samosa, Pakora, Jalebi
- Fried chicken, Momos
- Bhajiya, Matthi Kachori

**Oil Absorption:**
- **Factor: 1.25** (Most oil retained)
- ~550ml oil in oil → ~688ml oil in food
- 25% more oil than base volume

**Why Higher Factor?**
- Food stays immersed in oil longest
- Maximum oil clings to surface
- Oil penetrates deep into food
- Highest calorie impact

**Health Consideration:**
- Most oil absorption → Most calories
- Most saturated fat transfer
- Best to minimize frequency
- Use less oil per session

**Better Oil Choice:**
- Sunflower oil (lighter)
- Olive oil (partially if temperature allows)
- Avoid ghee and coconut oil (too rich)

---

### 2. Shallow Fry (तेल में हल्का तलना)

**What it is:**
- Cooking with oil reaching halfway up food
- Oil temperature: 150-170°C
- Food partially submerged or turned over

**Common dishes:**
- Paneer tikka, Vegetables
- Seafood
- Cutlets, Kebabs, Tikkis

**Oil Absorption:**
- **Factor: 1.15** (Moderate oil retained)
- ~450ml oil in oil → ~518ml oil in food
- 15% more oil than base volume

**Why Moderate Factor?**
- Food contacts oil on 1-2 sides
- Moderate oil retention time
- Surface sealing but not deep penetration
- Mid-range calorie impact

**Health Consideration:**
- More practical than deep fry
- Better for home cooking
- Medium oil absorption
- Good balance between taste and health

**Recommended Oils:**
- Sunflower oil (best)
- Mustard oil (traditional)
- Groundnut oil
- Olive oil

---

### 3. Saute (हल्का तेल डालकर पकाना)

**What it is:**
- Quick cooking with small amount of oil
- Oil temperature: 110-140°C
- Frequent stirring/tossing

**Common dishes:**
- Vegetable stir-fry
- Stir-fried greens
- Quick vegetable curry prep
- Onions/garlic base preparation

**Oil Absorption:**
- **Factor: 1.05** (Minimal oil retained)
- ~450ml oil in oil → ~473ml oil in food
- Only 5% more oil than base volume

**Why Low Factor?**
- Food not immersed
- Quick cooking time
- Minimal surface contact
- Oil mainly for heat transfer
- Lowest calorie impact

**Health Consideration:**
- Best for daily use
- Significant oil savings
- Minimal fat transfer
- Healthiest cooking method

**Recommended Oils:**
- **Any oil suitable**
- Mustard oil (traditional, flavorful)
- Olive oil (high quality)
- Coconut oil (for specific dishes)

**Pro Tips:**
- Use measured oil (1-2 tablespoons)
- Cook on high heat briefly
- Keep food moving to prevent sticking

---

### 4. Boil (उबालना - Oil Factor: 1.0)

**What it is:**
- Cooking in water with minimal oil
- Water temperature: 100°C (boiling)
- Oil used only for flavor/heat

**Common dishes:**
- Dal preparations
- Boiled vegetables
- Rice dishes
- Soup-based curries

**Oil Absorption:**
- **Factor: 1.0** (No extra absorption)
- ~450ml oil in oil → ~450ml oil in food
- Oil amount unchanged

**Why No Factor?**
- Oil floats on water surface
- Minimal food-oil contact
- Water heat does the cooking
- Oil used for flavor only

**Health Consideration:**
- Most heart-healthy option
- Minimal fat intake
- Suitable for restricted diets
- Recommended for diabetes/hypertension patients

**Recommended Oils:**
- **Any oil works**
- Mustard oil (flavor)
- Ground nut oil (neutral)
- Olive oil (Mediterranean style)
- Coconut oil (moderation)

**Pro Tips:**
- Add oil at end for flavor
- Use quality oil for taste without quantity
- Good for medical conditions requiring oil reduction

---

## Oil Types & Health Properties

### Overview Table

| Oil Type | Density | Health Score | Best For | Avoid If |
|----------|---------|--------------|----------|----------|
| Mustard Oil | 0.91 g/ml | 7/10 | Daily cooking | None (very safe) |
| Sunflower Oil | 0.92 g/ml | 6/10 | General purpose | Inflammatory conditions |
| Olive Oil | 0.91 g/ml | 8/10 | Premium/salads | High heat cooking |
| Coconut Oil | 0.92 g/ml | 5/10 | Special dishes | High cholesterol |
| Ghee | 0.96 g/ml | 4/10 | Special occasions | High cholesterol/liver disease |

---

### 1. Mustard Oil (सरसों का तेल) - **RECOMMENDED**

**Properties:**
- **Density**: 0.91 g/ml (1 ml = 0.91g)
- **Health Score**: 7/10 (High)
- **Taste**: Pungent, spicy (traditional Indian)

**Fatty Acid Composition:**
- Saturated Fat: ~11%
- Trans Fat: ~0%
- Polyunsaturated Fat: ~21%
- Monounsaturated Fat: ~60%

**Health Benefits:**
✅ Highest monounsaturated fat (heart-friendly)  
✅ Anti-inflammatory properties  
✅ Rich in omega-3 fatty acids  
✅ Glucosinolates (may have anti-cancer properties)  
✅ Traditional Indian medicine approval  

**Research Backing:**
- NIN (National Institute of Nutrition) recommends for Indian diets
- ICMR (Indian Council of Medical Research): Part of traditional Indian medicine
- Heart Foundation: Supports cardiovascular health due to high MUFA content

**Best For:**
- Daily cooking
- All cooking methods (especially boil, saute, shallow-fry)
- Vegetable curries
- Dals

**Avoid If:**
- Rare allergies (very uncommon)

**Storage Tips:**
- Keep in cool, dark place
- Aroma naturally strong (normal)
- Can last 1-2 years if stored properly

---

### 2. Sunflower Oil (सूरजमुखी का तेल)

**Properties:**
- **Density**: 0.92 g/ml (1 ml = 0.92g)
- **Health Score**: 6/10 (Moderate)
- **Taste**: Mild, neutral

**Fatty Acid Composition:**
- Saturated Fat: ~10%
- Trans Fat: ~0%
- Polyunsaturated Fat: ~68%
- Monounsaturated Fat: ~19%

**Health Benefits:**
✅ Good source of Vitamin E (antioxidant)  
✅ Low saturated fat  
✅ High PUFA content  
⚠️ Very high omega-6 (may cause inflammation if overused)  

**Research Backing:**
- Can raise oxidative stress if reused multiple times
- Better when used fresh
- American Heart Association: Acceptable for cooking

**Best For:**
- General cooking
- Baking
- Packaged foods

**Concerns:**
⚠️ May develop trans fats when reused  
⚠️ High omega-6 to omega-3 ratio  

**Reuse Recommendation:**
- Maximum 2-3 times for safety
- Discard if color darkens significantly

---

### 3. Olive Oil (जैतून का तेल) - **PREMIUM CHOICE**

**Properties:**
- **Density**: 0.91 g/ml
- **Health Score**: 8/10 (Very High)
- **Taste**: Rich, fruity (extra virgin)

**Fatty Acid Composition:**
- Saturated Fat: ~14%
- Trans Fat: ~0%
- Polyunsaturated Fat: ~10%
- Monounsaturated Fat: ~71%

**Health Benefits:**
✅ Highest monounsaturated fats  
✅ Polyphenols with anti-inflammatory effects  
✅ Supports cardiovascular health  
✅ Recommended by Mediterranean diet experts  
✅ Anti-cancer properties (research ongoing)  

**Research Backing:**
- WHO: Recommends for Mediterranean diet
- Harvard School of Public Health: Top-rated oil for health
- PREDIMED Study: Shows cardiovascular benefits
- Multiple studies: Lower heart disease risk

**Best For:**
- Salads (extra virgin)
- Low-medium heat cooking
- Finishing dishes
- Medical diets

**Avoid If:**
- High-heat cooking (smoke point 190°C)
- Very tight budget (premium price)

**Storage Tips:**
- Keep in cool, dark place
- Use within 2 years
- Extra virgin olive oil: Use fresh, minimal heating

---

### 4. Coconut Oil (नारियल का तेल)

**Properties:**
- **Density**: 0.92 g/ml
- **Health Score**: 5/10 (Fair)
- **Taste**: Coconutty (virgin), neutral (refined)

**Fatty Acid Composition:**
- Saturated Fat: **92%** (Highest among oils!)
- Trans Fat: Trace
- Polyunsaturated Fat: ~2%
- Monounsaturated Fat: ~6%

**Health Concerns:**
⚠️ 92% saturated fat (problematic for cholesterol)  
⚠️ Can raise LDL cholesterol  
⚠️ May increase cardiovascular risk in excess  

**Benefits (Balanced View):**
✅ MCT (Medium Chain Triglycerides) absorbed faster  
✅ May have antimicrobial properties  
✅ Good for hair/skin health  

**Research:**
- Mixed findings, mostly caution about saturated fat
- WHO: Use sparingly for cooking
- Dietitians: Maximum 2-3 tablespoons per week
- Not recommended for daily cooking

**Best For:**
- Special meals (desserts, traditional sweets)
- Occasional cooking (1-2 times/week)
- Coconut-specific dishes (regional cuisines)
- Hair oil massage

**Avoid If:**
- High cholesterol
- Cardiovascular disease
- Fatty liver disease
- Weight management needed
- Diabetes

**Recommended Limit:**
- **Maximum**: 15-20ml per week (less than 3ml/day)
- **Frequency**: 1-2 times per week maximum

---

### 5. Ghee (घी - Clarified Butter)

**Properties:**
- **Density**: 0.96 g/ml
- **Health Score**: 4/10 (Poor for daily use)
- **Taste**: Rich, buttery, aromatic

**Fatty Acid Composition:**
- Saturated Fat: **62%**
- Trans Fat: ~7% (naturally present)
- Polyunsaturated Fat: ~5%
- Monounsaturated Fat: ~29%

**Special Compounds:**
- CLA (Conjugated Linoleic Acid): ~5%
- Butyric acid: Anti-inflammatory in small amounts
- Fat-soluble vitamins: A, D, E, K

**Health Concerns:**
⚠️ High saturated fat  
⚠️ Contains trans fat  
⚠️ High calorie density (9.6 kcal/gram)  
⚠️ Can raise cholesterol  

**Ayurvedic View:**
✅ Considered medicinal in traditional medicine  
✅ May improve digestion in small amounts  
✅ Used in Ayurvedic treatments  

**Research:**
- Limited modern research
- Traditional use well-documented
- High saturated fat is primary concern for modern diet
- Indian Heart Association: Very limited use only

**Best For:**
- Festival/celebration meals
- Religious occasions
- Traditional sweets (moderation)
- Medical/Ayurvedic treatments

**Avoid If:**
- High cholesterol
- Cardiovascular disease
- Metabolic syndrome
- Weight loss needed
- Fatty liver disease

**Recommended Limit:**
- **Maximum**: 5-10ml per week
- **Frequency**: Special occasions only
- **Daily**: Should be < 0.5ml per day

---

## Calculations & Formulas

### Section 1: Basic Oil Calorie Calculation

#### Formula 1.1: Raw Oil Calories
```
Raw Calories = Oil Weight (grams) × 9

Example:
If you consume 20g of any oil
Raw Calories = 20 × 9 = 180 kcal
```

**Explanation:**
- All pure oils contain 9 kcal per gram
- This is true for all oils (mustard, sunflower, olive, etc.)
- Established by USDA nutritional database

**Research:**
- Standard USDA nutritional value
- International nutritional databases confirm
- Macronutrient energy: 1g fat = 9 kcal (vs protein/carbs = 4 kcal)

---

#### Formula 1.2: Volume to Weight Conversion
```
Weight (grams) = Volume (ml) × Oil Density (g/ml)

Example for Sunflower Oil:
150 ml × 0.92 = 138 grams

Example for Mustard Oil:
150 ml × 0.91 = 136.5 grams
```

**Why Different Densities?**
- Different oils have slightly different molecular structure
- Affects how much mass fits in same volume
- Used by manufacturers globally

**Density Reference:**
- Standard range: 0.91-0.96 g/ml
- Most cooking oils: 0.91-0.93 g/ml
- Used in IoT scale calculations

---

### Section 2: Health-Adjusted Oil Calorie Calculation

#### Formula 2.1: Harm Score (Fatty Acid Impact)
```
Harm Score = (SFA% × 0.35) + (TFA% × 0.40) + (PUFA% × 0.25)

Where:
- SFA% = Saturated Fat percentage
- TFA% = Trans Fat percentage  
- PUFA% = Polyunsaturated Fat percentage

Weight assignments:
- Trans Fat: 0.40 (Most harmful - highest weight)
- Saturated Fat: 0.35 (Moderately harmful)
- Polyunsaturated Fat: 0.25 (Least harmful - actually beneficial)
```

**Example: Mustard Oil**
```
SFA = 11%, TFA = 0%, PUFA = 21%
Harm Score = (11 × 0.35) + (0 × 0.40) + (21 × 0.25)
           = 3.85 + 0 + 5.25
           = 9.1
```

**Example: Ghee**
```
SFA = 62%, TFA = 7%, PUFA = 5%
Harm Score = (62 × 0.35) + (7 × 0.40) + (5 × 0.25)
           = 21.7 + 2.8 + 1.25
           = 25.75 (Much higher - worse for health)
```

**Research Backing:**
- WHO Guidelines: Trans fat most harmful
- USDA Dietary Guidelines: Minimize saturated fat
- Nutritional Science: PUFA beneficial for heart health
- Scoring reflects cardiovascular impact

---

#### Formula 2.2: SwasthaIndex Score
```
SwasthaIndex Score = 100 - Harm Score

Example: Mustard Oil
SwasthaIndex = 100 - 9.1 = 90.9 (Excellent)

Example: Ghee
SwasthaIndex = 100 - 25.75 = 74.25 (Fair)
```

**Score Interpretation:**
- **90-100**: Excellent (Mustard, Olive oils)
- **80-89**: Very Good (Sunflower oil)
- **70-79**: Good (Coconut oil)
- **Below 70**: Fair (Ghee - occasional use only)

**Clinical Relevance:**
- Higher score = Better for cardiovascular health
- Used by doctors to recommend oils
- Part of Indian dietary guidelines

---

#### Formula 2.3: Quality Multiplier (Oil Quality Factor)
```
Quality Multiplier = 1 + (k × Harm Score / 100)

Where k = 0.2 (default penalty weight)

Example: Mustard Oil
Harm Score = 9.1
Multiplier = 1 + (0.2 × 9.1 / 100)
           = 1 + 0.0182
           = 1.0182

Example: Ghee
Harm Score = 25.75
Multiplier = 1 + (0.2 × 25.75 / 100)
           = 1 + 0.0515
           = 1.0515
```

**Meaning:**
- Multiplier > 1.0 means health penalty
- Multiplier closer to 1.0 = better quality
- Shows how many caloric "penalties" oil carries

**Example:**
- 100 kcal of mustard oil (multiplier 1.018) = similar 100 kcal effective
- 100 kcal of ghee (multiplier 1.052) = ~105 kcal effective (higher health cost)

---

#### Formula 2.4: Effective Calorie Calculation
```
Effective Calories = Raw Calories × Quality Multiplier

Example with Mustard Oil (20g):
Raw Calories = 20 × 9 = 180 kcal
Multiplier = 1.0182
Effective Calories = 180 × 1.0182 = 183.3 kcal

Example with Ghee (20g):
Raw Calories = 20 × 9 = 180 kcal
Multiplier = 1.0515
Effective Calories = 180 × 1.0515 = 189.3 kcal (9 more kcal penalty)
```

**Why This Matters:**
- Quantifies health cost of oil choice
- Ghee carries ~5% higher health penalty
- Guides app scoring and recommendations

---

### Section 3: Total Calorie Requirement Calculation

#### Formula 3.1: Basal Metabolic Rate (BMR) - Mifflin-St Jeor Equation

**For Males:**
```
BMR = (10 × Weight_kg) + (6.25 × Height_cm) - (5 × Age_years) + 5

Example: 75kg male, 175cm, 35 years
BMR = (10 × 75) + (6.25 × 175) - (5 × 35) + 5
    = 750 + 1093.75 - 175 + 5
    = 1673.75 ≈ 1674 kcal/day
```

**For Females:**
```
BMR = (10 × Weight_kg) + (6.25 × Height_cm) - (5 × Age_years) - 161

Example: 65kg female, 165cm, 30 years
BMR = (10 × 65) + (6.25 × 165) - (5 × 30) - 161
    = 650 + 1031.25 - 150 - 161
    = 1370.25 ≈ 1370 kcal/day
```

**Research Backing:**
- Mifflin-St Jeor: Most accurate for BMR (2005 study)
- Used by: Mayo Clinic, WHO, Dietitians
- Accuracy: ±10-20% for most people
- Based on: 400+ test subjects, robust methodology

---

#### Formula 3.2: Total Daily Energy Expenditure (TDEE)
```
TDEE = BMR × Activity Factor

Where Activity Factors are:
- Sedentary (little/no exercise): 1.2
- Lightly active (light exercise 1-3 days/week): 1.375
- Moderately active (moderate exercise 3-5 days/week): 1.55
- Very active (intense exercise 6-7 days/week): 1.725
- Extra active (physical job + intense exercise): 1.9
```

**Example:**
```
BMR = 1674 kcal (from above)
Activity Level = Moderately Active
Activity Factor = 1.55
TDEE = 1674 × 1.55 = 2,594.7 ≈ 2595 kcal/day
```

**Research:**
- Activity factors based on: WHO, American Heart Association
- Consensus among: Major medical institutions
- Validated by: Numerous fitness and medical studies

---

#### Formula 3.3: Daily Oil Calorie Budget (ICMR Recommendation)
```
Daily Oil Budget = TDEE × 0.07

Where 0.07 = 7% (ICMR recommended oil calorie percentage)

Example using above TDEE:
Daily Oil Budget = 2595 × 0.07 = 181.65 ≈ 182 kcal/day
```

**Calculation Steps:**
```
1. Oil Budget = 182 kcal
2. Weight of Oil = 182 ÷ 9 = 20.2 grams
3. Volume of Oil (using 0.92 density) = 20.2 ÷ 0.92 = 22 ml/day
```

**Research & Guidelines:**
- **ICMR (Indian Council of Medical Research)**: 7% of total calories
- **American Heart Association**: Maximum 25-35% from total fat, ~7% from oil
- **WHO**: Limit free sugars + oils to 10% of total energy
- **Indian Heart Association**: 20-30ml per day for general population

**Why 7%?**
- Provides enough fat for vitamin absorption (A, D, E, K)
- Maintains digestive health
- Supports hormone production
- Prevents inflammation
- Balances against saturated fat risks

---

### Section 4: Cooking Method Impact Calculation

#### Formula 4.1: Cooking Method Absorption Factor

```
Final Oil Volume = Initial Oil Volume × Cooking Method Factor

Factors:
- Deep Fry: 1.25 (oil absorption 25% increase)
- Shallow Fry: 1.15 (oil absorption 15% increase)
- Saute: 1.05 (oil absorption 5% increase)
- Boil: 1.0 (no additional absorption)
```

**Scientific Explanation:**

**Deep Fry (1.25 factor):**
- Food submerged → maximum surface area in contact with oil
- Extended contact time (5-10 minutes typically)
- Higher temperature (160-190°C) accelerates oil absorption
- Oil penetrates coating and food interior
- ~25% of oil ends up in food (rest stays in pan)

```
Example:
Initial oil: 200ml
After deep fry: 200 × 1.25 = 250ml absorbed in food
Remaining: 200ml - (200ml - 50ml absorbed) = 50ml left in pan
```

**Shallow Fry (1.15 factor):**
- Food partially immersed, turned over
- Moderate contact time (8-10 minutes)
- Medium temperature (150-170°C)
- Oil coats outside, minimal interior penetration
- ~15% additional oil absorption

```
Example:
Initial oil: 200ml
After shallow fry: 200 × 1.15 = 230ml absorbed
Remaining in pan: 200 - 30 = 170ml
```

**Saute (1.05 factor):**
- Quick cooking, constant motion
- Minimal contact time (3-5 minutes)
- Medium-high heat (110-140°C)
- Oil used primarily for heat transfer
- ~5% additional absorption

```
Example:
Initial oil: 200ml
After saute: 200 × 1.05 = 210ml absorbed
Remaining: 200 - 10 = 190ml (most oil returns to pan)
```

**Boil (1.0 factor):**
- No additional absorption
- Oil floats on top of water
- Minimal food-oil contact
- Oil used only for flavor
- No absorption increase

```
Example:
Initial oil: 200ml
After boil: 200 × 1.0 = 200ml (oil unchanged)
```

---

#### Formula 4.2: Oil Reuse Degradation Factor

```
Final Oil Quality = Base Volume × (1 - 0.05 × Reuse Count)

Where:
- 0.05 = 5% quality loss per reuse
- Reuse Count = Number of times oil has been reused
```

**Reuse Count Interpretation:**
- **0**: Fresh oil (100% quality)
- **1**: Oil used once, reused once (95% quality)
- **2**: Oil used twice, reused twice (90% quality)
- **3**: Oil used thrice, reused thrice (85% quality)

**Example:**
```
Initial adjusted volume: 177ml
Reuse count: 2
Final volume = 177 × (1 - 0.05 × 2)
             = 177 × (1 - 0.10)
             = 177 × 0.90
             = 159.3ml
```

**Why 5% per Reuse?**
- Rancidity development gradually with heating
- Accumulation of free fatty acids
- Oxidation products increase
- Smoke point lowers
- Nutritional degradation
- Safety concerns after multiple reuses

**Reuse Guidelines:**
```
Sunflower Oil:
- Fresh: Use immediately ✓
- 1st reuse: Safe for 1-2 times
- 2nd reuse: Use cautiously
- 3rd+ reuse: Discard (oils degrade)

Mustard Oil:
- More oxidation-resistant than sunflower
- Can tolerate 2-3 reuses safely
- Traditional practice allows limited reuse

Olive Oil:
- Do not reuse (deteriorates quickly)
- Use fresh only

Ghee:
- Can be reused if stored properly
- Strain through cheesecloth
- Maximum 4-5 uses before discard
```

---

### Section 5: SwasthaIndex Daily Goal System

#### Formula 5.1: Base Oil Goal Calculation
```
Base Oil Goal (kcal/day) = BMR × Activity Factor × 0.07

This is the TDEE-based approach (Section 3.3 repeated for complete context)

Example:
BMR = 1674 kcal
Activity Factor = 1.55
TDEE = 1674 × 1.55 = 2595 kcal
Oil Goal = 2595 × 0.07 = 182 kcal/day = ~20g = ~22ml
```

---

#### Formula 5.2: Health-Adjusted Oil Goal (SwasthaIndex Adjustment)

**If health issues detected:**
```
Adjusted Oil Goal = Base Oil Goal × Health Adjustment Factor

Health Adjustment Factor based on conditions:
- High Cholesterol (>200): 0.75 (reduce by 25%)
- High LDL (>130): 0.67 (reduce by 33%)
- Diabetes (HbA1c >6.5): 0.80 (reduce by 20%)
- Fatty Liver (ALT >40): 0.50 (reduce by 50%)
- Kidney Disease: Varies by stage
- Multiple conditions: Lowest factor applies
```

**Example with High Cholesterol:**
```
Base Oil Goal = 182 kcal/day
Health Factor = 0.75
Adjusted Goal = 182 × 0.75 = 136.5 kcal/day ≈ 15g ≈ 16ml

Reduction = 182 - 136.5 = 45.5 kcal/day (about 5g or 5ml less)
```

**Example with Fatty Liver (Most Restrictive):**
```
Base Oil Goal = 182 kcal/day
Health Factor = 0.50
Adjusted Goal = 182 × 0.50 = 91 kcal/day ≈ 10g ≈ 11ml

Recommendation: 15ml/day maximum, strongly reduce oil intake
```

---

#### Formula 5.3: Rolling 7-Day Average Calculation

```
Rolling Average = (Sum of last 7 days oil consumption) ÷ 7

Example:
Day 1: 180 kcal
Day 2: 195 kcal
Day 3: 160 kcal
Day 4: 185 kcal
Day 5: 175 kcal
Day 6: 190 kcal
Day 7: 170 kcal

Total = 1255 kcal
Rolling Average = 1255 ÷ 7 = 179.3 kcal/day

This rolling average is compared to your daily goal
(e.g., 182 kcal) to track performance
```

**Why 7-Day Rolling?**
- Smooths daily variations
- Accounts for cooking pattern changes
- More representative than single day
- Used in all trend tracking

---

### Section 6: Swasth Index Oil Limit Health System (Advanced)

#### Formula 6.1: Comprehensive Health Score Calculation

The app calculates health score (0-100) based on medical report analysis:

```
Initial Health Score = 100

DEDUCTION FOR CONDITIONS:
- Total Cholesterol >200: -15 points
- LDL >130: -10 points
- Triglycerides >150: -10 points
- Diabetes (HbA1c >6.5): -20 points
- Fatty Liver (ALT >40): -12 points
- Kidney Dysfunction (Creatinine >1.3): -15 points
- Low Vitamin B12: -8 points
- Thyroid Issues: -10 points
- Obesity (BMI >30): -10 points
- Nutritional Deficiency: -5 to -10 points

Maximum deductions prevent score from going below 0
```

**Example Calculation:**
```
Patient has:
- High cholesterol (200)
- High triglycerides (160)
- Overweight BMI

Score = 100 - 15 - 10 - 10 = 65/100

Oil Limit Recommendation = 15ml/day (50% of normal)
All oil types rated as moderate risk
```

---

#### Formula 6.2: Harm Adjustment Index (HAI)

```
HAI = (100 - Rolling Health Score) / 100

Clamped between 0.5 and 1.8

Example:
Rolling Health Score = 75
HAI = (100 - 75) / 100 = 25 / 100 = 0.25

Adjusted to bounds: HAI = 0.5 (minimum)
```

**Meaning:**
- Higher HAI = More oil restriction needed
- HAI < 1.0 = Person is healthy
- HAI > 1.0 = More strict limits needed

---

#### Formula 6.3: Final Personalized Oil Recommendation

```
Personalized Oil Goal = Base Oil Goal × HAI factor

Example:
Base Oil Goal = 182 kcal/day
HAI = 0.75 (mild health issues)
Personalized Goal = 182 × 0.75 = 136.5 kcal/day

With health issues:
Base Oil Goal = 182 kcal/day
HAI = 1.5 (moderate health concerns)
Personalized Goal = 182 × 1.5 = 273 kcal/day (TEMPORARY INCREASE for stress-related needs)
```

**App Displays:**
- **Green Zone**: 0-80% of goal (optimal)
- **Yellow Zone**: 80-100% of goal (at limit)
- **Red Zone**: >100% of goal (exceeded)

---

## Medical Report Analyzer

### What It Does

The Medical Report Analyzer uses AI (Google Gemini 2.0 Flash) to:
1. Read your medical/lab reports (PDF or images)
2. Extract key health metrics
3. Analyze health status automatically
4. Provide personalized oil consumption recommendations
5. Identify health risks
6. Suggest nutrition adjustments

### How to Upload a Report

**Step 1: Prepare Report**
- Take clear photo of medical report, OR
- Have PDF of report ready
- Ensure all sections visible
- Good lighting for images

**Step 2: Access Feature**
- Open SwasthTel app
- Go to **Profile** → **Medical Reports**
- Tap **Upload New Report**

**Step 3: Select File**
- Tap **Photo** (for camera image)
- Or tap **Document** (for PDF)
- Grant camera/file permissions if needed
- Select or capture your report

**Step 4: Review & Submit**
- Check preview looks clear
- Tap **Analyze Report**
- Wait 30-60 seconds for AI analysis
- Review results

### Understanding Results

#### Health Score
- **90-100**: Excellent health
- **70-89**: Good health
- **50-69**: Fair health, medical attention recommended
- **Below 50**: Serious health issues, consult doctor

#### Oil Recommendation
- Based on health conditions found
- Shows specific ml/day limit
- Adjusts as health improves
- Updates with new reports

#### Risk Flags
- **Red flags**: Immediate concern (e.g., "Diabetes Risk")
- **Yellow flags**: Monitor closely (e.g., "High Cholesterol")
- **Blue flags**: Note for tracking (e.g., "Vitamin Deficiency")

#### Nutrition Recommendations
- Suggested daily protein intake
- Suggested daily fat intake
- Suggested daily carbohydrate intake
- Based on your health conditions and goals

---

### Supported Medical Tests

The analyzer can extract data from:

**Lipid Profile:**
- Total Cholesterol
- LDL (Bad cholesterol)
- HDL (Good cholesterol)
- Triglycerides
- VLDL

**Blood Sugar:**
- Fasting glucose
- Post-prandial glucose
- HbA1c (3-month average)

**Liver Function:**
- ALT (SGPT)
- AST (SGOT)
- Bilirubin
- Albumin

**Kidney Function:**
- Creatinine
- Urea
- Uric Acid
- GFR (Glomerular Filtration Rate)

**Blood Count:**
- Red Blood Cells (RBC)
- White Blood Cells (WBC)
- Platelets
- Hemoglobin
- Hematocrit

**Thyroid Function:**
- TSH
- T3
- T4

**Vitamins & Minerals:**
- Vitamin B12
- Vitamin D
- Iron (Serum Iron)
- Calcium
- Potassium

**Others:**
- BMI (if provided)
- Blood Pressure
- Any custom markers

---

## Troubleshooting

### General App Issues

| Issue | Solution |
|-------|----------|
| App crashes on startup | Clear cache: Settings → App → Clear Cache, then restart |
| Slow performance | Close other apps, check WiFi connection, restart device |
| Cannot create account | Check internet, try email instead of social login |
| Forgot password | Tap "Forgot Password" on login screen, reset via email |
| Data not syncing | Check internet, try logout then login |

### Oil Tracking Issues

| Issue | Solution |
|-------|----------|
| Oil log not saving | Check internet, ensure all fields filled, try again |
| Incorrect calorie calculation | Verify oil type selected, check cooking method, review formula |
| Cannot scan barcode | Ensure camera permissions granted, wipe lens, check lighting |
| Weight scale not connecting | Verify scale is on WiFi, check same network, restart scale |

### Medical Report Issues

| Issue | Solution |
|-------|----------|
| Report won't upload | Check file size (<10MB), try PDF instead of image, clear cache |
| Analysis taking too long | Wait up to 2 minutes, check internet speed, try again |
| Couldn't detect health metrics | Ensure all report fields visible, image is clear, report is recent |

### IoT Tracker Issues

See "IoT Device Troubleshooting" section above for detailed solutions.

---

## FAQ

### General Questions

**Q: Is SwasthTel free?**
A: The basic app is free with ads. Premium features available with subscription.

**Q: How often should I update my health profile?**
A: Update after every medical checkup, or at least every 6 months.

**Q: Can I change my activity level?**
A: Yes, go to **Settings → Profile → Activity Level** to update.

**Q: Is my health data private?**
A: All data is encrypted. Reports are stored locally first. Only synced when you log in.

---

### Oil Tracking Questions

**Q: What's the difference between shallow fry and saute?**
A: Shallow fry keeps oil at mid-level with less movement (factor 1.15). Saute uses quick motion with less oil (factor 1.05). Saute uses less oil overall.

**Q: Can I exceed my daily oil goal sometimes?**
A: Occasional overages are fine. The 7-day rolling average matters more. Consistent excess is unhealthy.

**Q: Why does ghee have lower health score?**
A: Ghee has 62% saturated fat vs mustard oil's 11%. More saturated fat increases cardiovascular risk.

**Q: Should I stop eating oil?**
A: No! 0% oil is unhealthy. You need 15-30ml daily for vitamin absorption and hormonal health.

---

### Cooking Method Questions

**Q: Which cooking method is healthiest?**
A: **Boil** (factor 1.0) absorbs no additional oil. **Saute** (factor 1.05) is practical and healthy. Both preferred for daily cooking.

**Q: Can I reuse oil?**
A: Limited reuse is safe (1-2 times). Each reuse reduces quality by 5%. Discard after 3 reuses.

**Q: What's the difference between deep fry and shallow fry visually?**
A: Deep fry = food fully submerged in oil. Shallow fry = oil comes halfway up food, which is turned over.

**Q: Why is deep fry factor 1.25 but shallow is 1.15?**
A: Deep fry has more oil-food contact, higher temperature, longer cooking. Food absorbs more oil.

---

### IoT Tracker Questions

**Q: How accurate is the weight scale?**
A: Good scales are accurate to ±5g. Calibrate with known weights for best results.

**Q: Can I use any WiFi scale?**
A: We support ESP32-based and standard WiFi scales. Check compatibility before purchase.

**Q: What if scale connection drops?**
A: Reconnect via Settings → IoT Devices. Data syncs when reconnected.

**Q: Can I use multiple scales?**
A: Yes! Add multiple devices in Settings. Choose active scale for each log.

---

### Calculation Questions

**Q: Why is my oil budget different from friends?**
A: BMR, activity level, health conditions vary. Your personalized goal is calculated just for you.

**Q: How is my health score calculated?**
A: Medical conditions detected (cholesterol, diabetes, etc.) reduce your base score of 100. Lower conditions = lower deductions.

**Q: What's the formula for my daily oil goal?**
A: Daily Oil Goal = (BMR × Activity Factor) × 0.07. See Calculations section for details.

**Q: Why does oil type matter in calories?**
A: Different oils have different fatty acids. Quality multiplier adjusts calories based on saturated/trans fat content.

---

### Medical Report Questions

**Q: How often should I upload reports?**
A: Annual checkup minimum. More frequent if you have health conditions requiring monitoring.

**Q: Can I upload past reports?**
A: Yes, but recent reports are more relevant. App may ask you to confirm date.

**Q: What if my report isn't recognized?**
A: Ensure good image quality, all text visible, update app to latest version, try again.

**Q: Does the app replace a doctor?**
A: No! App provides insights only. Always follow doctor's advice for medical conditions.

---

### Account & Settings Questions

**Q: How do I change language to Hindi?**
A: Go to **Settings → Language** and select Hindi (हिन्दी).

**Q: Can I export my data?**
A: Premium feature allows CSV export. Go to **Settings → Data Export**.

**Q: How do I delete my account?**
A: Go to **Settings → Advanced → Delete Account**. Irreversible, deletes all data.

**Q: Can I add family members?**
A: Use **Groups** feature to invite family members and track together.

---

## Additional Resources

### Related Documents

- [Onboarding Guide](FRONTEND_INTEGRATION.md)
- [IoT Integration Guide](ESP32_SETUP.md)
- [Medical Report Analyzer](MEDICAL_REPORT_ANALYZER.md)
- [Architecture Diagram](ARCHITECTURE_DIAGRAM.txt)
- [Barcode Scanner Guide](BARCODE_SCANNER_INTEGRATION.md)

### External Resources

**Health & Nutrition:**
- ICMR (Indian Council of Medical Research): https://icmr.gov.in
- American Heart Association: https://www.heart.org
- WHO Nutrition Guidelines: https://www.who.int
- Indian Heart Association Oil Guidelines: https://www.indianheartfoundation.org

**Oil Science:**
- USDA Nutritional Database: https://fdc.nal.usda.gov
- Mediterranean Diet Research: https://predimed.es
- Trans Fat Studies: FDA and American Heart Association publications

**Medical Testing:**
- Understand Lab Reports: Ask your doctor or reference LabCorp/Quest docs
- Common Tests Explained: Mayo Clinic health library

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 2026 | Initial comprehensive guide |

---

## Support Contact

**Need Help?**
- 📧 Email: support@swasthtel.app
- 💬 In-app Chat: **Help → Contact Support**
- 📱 Phone: +91-XXX-XXXXX (during business hours)
- 🌐 Website: https://www.swasthtel.app

---

**Disclaimer**: This guide provides general information. Always consult healthcare professionals for medical decisions. SwasthTel is a tracking tool, not a medical device.

**Last Updated**: April 5, 2026  
**Status**: Complete & Ready for Production
