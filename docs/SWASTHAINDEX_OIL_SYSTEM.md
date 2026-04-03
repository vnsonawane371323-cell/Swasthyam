# SwasthaIndex Oil Limit System – Integration Toolkit

## One-line summary

A personalized daily oil calorie limit system that adjusts based on user metabolism (TDEE), Swastha Score (dietary quality), and Harm Index (oil quality), applying higher penalties to unhealthy oils to guide consumption toward health targets.

---

## Mathematical core (formula set)

### Base formulas

```
TDEE = BMR × ActivityFactor

V_base = R_fat × R_visible × TDEE
  where R_fat = 0.25 (fat calories as % of TDEE)
        R_visible = 0.25 (visible oils as % of fat calories)

HA = (100 - H_roll) / 100
  where H_roll = 7-day rolling average Harm Index
        HA ∈ [HA_min, HA_max] = [0.5, 1.8]

V_adj = V_base × (αS × (S_roll/100) + αH × HA)
  where S_roll = 7-day rolling average Swastha Score
        αS = 0.6 (weight for Swastha Score)
        αH = 0.9 (weight for Harm Adjustment)

OilCalories_limit = clamp(V_adj, V_min × TDEE, V_max × TDEE)
  where V_min = 0.02 (minimum 2% of TDEE)
        V_max = 0.12 (maximum 12% of TDEE)

G = OilCalories_limit (in kcal per day)
```

### Effective calories per event

```
M(h) = 1 + k × (h/100)^2
  where h = Harm Index of oil (0-100)
        k = 0.3 (penalty weight)
        M(h) ∈ [1.0, M_max] = [1.0, 1.5]

EffCal_event = (grams × 9) × M(h)
```

### Cumulative effective calories

```
C_eff(t) = Σ EffCal_event for all events on date t

Fill% = (C_eff(t) / G) × 100

Remaining_kcal = max(0, G - C_eff(t))
Remaining_ml = Remaining_kcal / 9
Overage = max(0, C_eff(t) - G)
```

### Rolling averages (7-day window)

**Simple average:**
```
S_roll = (1/n) Σ S_i  for i in last n days
H_roll = (1/n) Σ H_i  for i in last n days
  where n = 7
```

**Exponential weighted (alternative):**
```
S_roll(t) = m × S(t) + (1-m) × S_roll(t-1)
H_roll(t) = m × H(t) + (1-m) × H_roll(t-1)
  where m = 0.3 (smoothing factor)
```

### Default parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| R_fat | 0.25 | Fat calories as % of TDEE |
| R_visible | 0.25 | Visible oils as % of fat |
| αS | 0.6 | Swastha Score weight |
| αH | 0.9 | Harm Adjustment weight |
| k | 0.3 | Harm penalty multiplier |
| M_max | 1.5 | Max penalty multiplier |
| V_min | 0.02 | Min oil % of TDEE |
| V_max | 0.12 | Max oil % of TDEE |
| HA_min | 0.5 | Min harm adjustment |
| HA_max | 1.8 | Max harm adjustment |
| m | 0.3 | EMA smoothing weight |
| window | 7 days | Rolling average period |

---

## Plain-language explanation

The SwasthaIndex oil system calculates a personalized daily oil calorie budget based on three factors: your body's energy needs (TDEE), your overall diet quality (Swastha Score), and the healthiness of oils you consume (Harm Index).

It starts with a base allocation—typically 6.25% of your daily calories—then adjusts up or down. If you eat a balanced diet (high Swastha Score) and use healthy oils (low Harm Index), your limit increases. Poor diet quality or unhealthy oils reduce your allowance.

When you log oil consumption, the system applies a "penalty multiplier" to unhealthy oils. For example, 10g of mustard oil (low harm) counts close to its actual 90 kcal, but 10g of palm oil (high harm) might count as 120+ kcal. This "effective calorie" approach fills your daily budget faster when you use harmful oils, naturally steering you toward healthier choices.

The system recalculates your daily goal each morning using the past 7 days' average scores, ensuring gradual adaptation rather than sudden swings from a single bad day.

---

## Daily goal rules (behavior)

1. **Goal computation:** Daily goal `G` is computed once per day at midnight (or on first app open of the day) using the 7-day rolling averages of Swastha Score and Harm Index up to the previous day.

2. **Goal freeze:** Once computed for day `t`, the goal remains fixed for that entire day regardless of new meals logged during day `t`.

3. **Goal update:** The next day's goal (day `t+1`) incorporates the scores from day `t` into the rolling average, potentially adjusting the limit.

4. **Bootstrap period:** For new users with fewer than 7 days of data, use the available days' average or a default initialization (S=70, H=40) until sufficient history exists.

5. **Manual override:** Admins or advanced users can manually override `G` for a specific day (e.g., fasting day, special event) without affecting rolling calculations.

---

## Cumulative and effective calories logic

### Per-event effective calories

Each oil consumption event has:
- **Raw calories:** `RawCal = grams × 9 kcal/g`
- **Harm multiplier:** `M(h) = 1 + 0.3 × (h/100)^2` capped at 1.5
- **Effective calories:** `EffCal = RawCal × M(h)`

**Example:**
- 10g mustard oil (h=20): `M = 1 + 0.3×(0.2)^2 = 1.012` → `EffCal ≈ 91 kcal`
- 10g palm oil (h=80): `M = 1 + 0.3×(0.8)^2 = 1.192` → `EffCal ≈ 107 kcal`

### Cumulative tracking

`C_eff(t)` sums all `EffCal` events logged on day `t`. After each event:
1. Compute `EffCal_event`
2. Update `C_eff(t) += EffCal_event`
3. Recalculate `Fill% = (C_eff(t) / G) × 100`
4. Update UI with remaining budget: `Remaining_ml = (G - C_eff(t)) / 9`

If `C_eff(t) > G`, the user is in overage—display negative remaining or warning color.

---

## Rolling averages

### Simple 7-day average

```python
S_roll = sum(S[t-6:t+1]) / 7
H_roll = sum(H[t-6:t+1]) / 7
```

Fetch the last 7 days' `swastha_score` and `harm_index` from the database, compute mean.

### Exponential weighted moving average (EWMA)

```python
# Initialize with first day or default
S_roll = 70  # default
H_roll = 40  # default

# Update daily
S_roll_new = 0.3 * S_today + 0.7 * S_roll_old
H_roll_new = 0.3 * H_today + 0.7 * H_roll_old
```

EWMA gives more weight to recent days while maintaining historical context. Use this for smoother transitions.

**Storage:** Store `S_roll` and `H_roll` in the `daily_goals` table for quick retrieval.

---

## Calibration guidance

Use a 20–50 row pilot dataset with known user profiles and expected behavior. Validate parameters:

1. **Baseline check:** For a reference user (TDEE=2000, S=70, H=40), verify `G ≈ 125 kcal` (6.25% of TDEE).

2. **Swastha sensitivity:** Increase `S_roll` by +20 points. Expected: `G` should increase by ~10-15%. If change is too small, increase `αS`. If too large, decrease `αS`.

3. **Harm sensitivity:** Increase `H_roll` by +20 points (worse oils). Expected: `G` should decrease by ~12-18%. Adjust `αH` if needed.

4. **Penalty multiplier:** Log 10g of high-harm oil (h=80). Expected: `EffCal ≈ 107 kcal` (19% penalty). Verify `M(80) ≈ 1.19`. Adjust `k` if penalty feels too harsh or lenient.

5. **Boundary enforcement:** Test extremes (S=20, H=90 and S=100, H=10). Verify `G` stays within [0.02×TDEE, 0.12×TDEE].

6. **Rolling average stability:** Simulate 7 days of data, change one day dramatically. Verify goal changes gradually (not a spike).

Iterate `αS`, `αH`, `k` within ±20% of defaults until observed behavior matches target.

---

## API design (REST)

### a. POST /compute_daily_goal

**Request:**
```json
{
  "user_id": "user123",
  "bmr": 1500,
  "activity_factor": 1.55,
  "S_roll": 70,
  "H_roll": 40,
  "date": "2025-12-07"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "goal_kcal": 125.5,
    "goal_grams": 13.9,
    "goal_ml": 15.4,
    "tdee": 2325,
    "v_base": 145.3,
    "ha": 1.6,
    "v_adj": 125.5,
    "date": "2025-12-07"
  }
}
```

**Example payload:**
```bash
curl -X POST https://api.example.com/compute_daily_goal \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "bmr": 1500,
    "activity_factor": 1.55,
    "S_roll": 70,
    "H_roll": 40,
    "date": "2025-12-07"
  }'
```

---

### b. POST /log_oil_event

**Request:**
```json
{
  "user_id": "user123",
  "oil_type": "Mustard Oil",
  "grams": 10,
  "harm_score": 20,
  "meal_type": "Lunch",
  "timestamp": "2025-12-07T13:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event_id": "evt_789",
    "raw_kcal": 90,
    "multiplier": 1.012,
    "effective_kcal": 91.08,
    "cumulative_eff_kcal": 106.08,
    "goal_kcal": 125.5,
    "remaining_kcal": 19.42,
    "remaining_ml": 2.16,
    "fill_percent": 84.5,
    "overage": 0,
    "status": "within_limit"
  }
}
```

**Example payload:**
```bash
curl -X POST https://api.example.com/log_oil_event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "oil_type": "Mustard Oil",
    "grams": 10,
    "harm_score": 20,
    "meal_type": "Lunch",
    "timestamp": "2025-12-07T13:30:00Z"
  }'
```

---

### c. GET /user_oil_status

**Request:**
```
GET /user_oil_status?user_id=user123&date=2025-12-07
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "date": "2025-12-07",
    "goal_kcal": 125.5,
    "cumulative_eff_kcal": 106.08,
    "remaining_kcal": 19.42,
    "remaining_ml": 2.16,
    "fill_percent": 84.5,
    "overage": 0,
    "events_count": 3,
    "status": "within_limit"
  }
}
```

**Example:**
```bash
curl "https://api.example.com/user_oil_status?user_id=user123&date=2025-12-07"
```

---

## Database schema (minimal)

### users table

```sql
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  bmr DECIMAL(8,2) NOT NULL,
  activity_factor DECIMAL(3,2) DEFAULT 1.5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);
```

### oil_events table

```sql
CREATE TABLE oil_events (
  event_id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  oil_type VARCHAR(100) NOT NULL,
  grams DECIMAL(6,2) NOT NULL,
  harm_score INT NOT NULL,
  meal_type VARCHAR(20),
  raw_kcal DECIMAL(8,2) NOT NULL,
  multiplier DECIMAL(4,3) NOT NULL,
  effective_kcal DECIMAL(8,2) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_user_date (user_id, timestamp),
  INDEX idx_timestamp (timestamp)
);
```

### daily_goals table

```sql
CREATE TABLE daily_goals (
  goal_id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  tdee DECIMAL(8,2) NOT NULL,
  s_roll DECIMAL(5,2) NOT NULL,
  h_roll DECIMAL(5,2) NOT NULL,
  v_base DECIMAL(8,2) NOT NULL,
  ha DECIMAL(4,2) NOT NULL,
  v_adj DECIMAL(8,2) NOT NULL,
  goal_kcal DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  UNIQUE KEY unique_user_date (user_id, date),
  INDEX idx_user_date (user_id, date)
);
```

### rolling_scores table

```sql
CREATE TABLE rolling_scores (
  score_id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  swastha_score DECIMAL(5,2) NOT NULL,
  harm_index DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  UNIQUE KEY unique_user_date (user_id, date),
  INDEX idx_user_date (user_id, date)
);
```

---

## Integration snippets

### Python (Flask) – /log_oil_event

```python
from flask import Flask, request, jsonify
import math
from datetime import datetime

app = Flask(__name__)

# Constants
K_PENALTY = 0.3
M_MAX = 1.5

def compute_multiplier(harm_score):
    """Compute penalty multiplier M(h)"""
    h_norm = harm_score / 100.0
    m = 1 + K_PENALTY * (h_norm ** 2)
    return min(m, M_MAX)

@app.route('/log_oil_event', methods=['POST'])
def log_oil_event():
    data = request.json
    user_id = data['user_id']
    grams = float(data['grams'])
    harm_score = int(data['harm_score'])
    oil_type = data['oil_type']
    meal_type = data.get('meal_type', 'Other')
    timestamp = data.get('timestamp', datetime.utcnow().isoformat())
    
    # Compute effective calories
    raw_kcal = grams * 9.0
    multiplier = compute_multiplier(harm_score)
    effective_kcal = raw_kcal * multiplier
    
    # Fetch today's goal from DB (pseudo-code)
    goal_kcal = db.get_daily_goal(user_id, timestamp[:10])['goal_kcal']
    
    # Get cumulative effective calories for today
    cumulative_eff_kcal = db.get_cumulative_eff(user_id, timestamp[:10]) + effective_kcal
    
    # Save event to DB
    event_id = f"evt_{int(datetime.utcnow().timestamp())}"
    db.insert_oil_event({
        'event_id': event_id,
        'user_id': user_id,
        'oil_type': oil_type,
        'grams': grams,
        'harm_score': harm_score,
        'meal_type': meal_type,
        'raw_kcal': raw_kcal,
        'multiplier': multiplier,
        'effective_kcal': effective_kcal,
        'timestamp': timestamp
    })
    
    # Compute remaining and status
    remaining_kcal = max(0, goal_kcal - cumulative_eff_kcal)
    remaining_ml = remaining_kcal / 9.0
    fill_percent = (cumulative_eff_kcal / goal_kcal) * 100
    overage = max(0, cumulative_eff_kcal - goal_kcal)
    status = 'within_limit' if cumulative_eff_kcal <= goal_kcal else 'over_limit'
    
    return jsonify({
        'success': True,
        'data': {
            'event_id': event_id,
            'raw_kcal': round(raw_kcal, 2),
            'multiplier': round(multiplier, 3),
            'effective_kcal': round(effective_kcal, 2),
            'cumulative_eff_kcal': round(cumulative_eff_kcal, 2),
            'goal_kcal': round(goal_kcal, 2),
            'remaining_kcal': round(remaining_kcal, 2),
            'remaining_ml': round(remaining_ml, 2),
            'fill_percent': round(fill_percent, 1),
            'overage': round(overage, 2),
            'status': status
        }
    })
```

---

### JavaScript (Node/Express) – /compute_daily_goal

```javascript
const express = require('express');
const app = express();
app.use(express.json());

// Constants
const R_FAT = 0.25;
const R_VISIBLE = 0.25;
const ALPHA_S = 0.6;
const ALPHA_H = 0.9;
const V_MIN = 0.02;
const V_MAX = 0.12;
const HA_MIN = 0.5;
const HA_MAX = 1.8;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function computeDailyGoal(bmr, activityFactor, sRoll, hRoll) {
  // 1. Compute TDEE
  const tdee = bmr * activityFactor;
  
  // 2. Base oil calories
  const vBase = R_FAT * R_VISIBLE * tdee;
  
  // 3. Harm adjustment
  const ha = clamp((100 - hRoll) / 100, HA_MIN, HA_MAX);
  
  // 4. Adjusted oil calories
  const vAdj = vBase * (ALPHA_S * (sRoll / 100) + ALPHA_H * ha);
  
  // 5. Apply min/max bounds
  const goalKcal = clamp(vAdj, V_MIN * tdee, V_MAX * tdee);
  
  // 6. Convert to grams and ml (oil density ≈ 0.9 g/ml)
  const goalGrams = goalKcal / 9;
  const goalMl = goalGrams / 0.9;
  
  return {
    goal_kcal: Math.round(goalKcal * 100) / 100,
    goal_grams: Math.round(goalGrams * 10) / 10,
    goal_ml: Math.round(goalMl * 10) / 10,
    tdee: Math.round(tdee * 10) / 10,
    v_base: Math.round(vBase * 10) / 10,
    ha: Math.round(ha * 100) / 100,
    v_adj: Math.round(vAdj * 10) / 10
  };
}

app.post('/compute_daily_goal', (req, res) => {
  const { user_id, bmr, activity_factor, S_roll, H_roll, date } = req.body;
  
  // Compute goal
  const result = computeDailyGoal(bmr, activity_factor, S_roll, H_roll);
  
  // Save to DB (pseudo-code)
  // db.saveDailyGoal(user_id, date, result);
  
  res.json({
    success: true,
    data: {
      ...result,
      date: date || new Date().toISOString().split('T')[0]
    }
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## UI microcopy & layout

### Home card text

**Title:** "Oil Tracker"

**Primary number:** `{remaining_ml} ml` (large, bold)

**Secondary line:** `{fill_percent}% of {goal_ml}ml daily limit`

**Tooltip:** "Your personalized oil limit adjusts based on diet quality and oil healthiness. Harmful oils count more toward your limit."

### Color thresholds (progress bar)

| Fill % | Color | Hex |
|--------|-------|-----|
| 0-70% | Green | #16a34a |
| 71-90% | Amber | #f59e0b |
| 91-100% | Orange | #ea580c |
| >100% | Red | #dc2626 |

### User-facing explanation of effective calories

"Effective calories help you track oil impact more accurately—healthier oils like mustard count closer to actual calories, while less healthy oils like palm count higher, encouraging better choices."

---

## Worked example

### Inputs
- **User:** BMR = 1500, ActivityFactor = 1.55
- **Rolling scores:** S_roll = 70, H_roll = 40
- **Prior cumulative:** C_eff = 15 kcal (from morning tea)
- **New event:** 10g oil, H = 70 (palm oil)

### Step-by-step calculation

**1. Compute daily goal (done at midnight):**
```
TDEE = 1500 × 1.55 = 2325 kcal
V_base = 0.25 × 0.25 × 2325 = 145.3 kcal
HA = (100 - 40) / 100 = 0.6 → clamp to [0.5, 1.8] = 0.6
V_adj = 145.3 × (0.6 × 0.7 + 0.9 × 0.6) = 145.3 × (0.42 + 0.54) = 139.5 kcal
G = clamp(139.5, 0.02×2325, 0.12×2325) = clamp(139.5, 46.5, 279) = 139.5 kcal
```
**Daily goal: G = 139.5 kcal (15.5 ml)**

**2. Log oil event (lunch):**
```
RawCal = 10 × 9 = 90 kcal
M(70) = 1 + 0.3 × (70/100)^2 = 1 + 0.3 × 0.49 = 1.147
EffCal = 90 × 1.147 = 103.2 kcal
```

**3. Update cumulative:**
```
C_eff_new = 15 + 103.2 = 118.2 kcal
```

**4. Compute status:**
```
Fill% = (118.2 / 139.5) × 100 = 84.7%
Remaining_kcal = 139.5 - 118.2 = 21.3 kcal
Remaining_ml = 21.3 / 9 = 2.37 ml
Overage = max(0, 118.2 - 139.5) = 0
Status = within_limit (fill < 100%)
```

### Final output
- **Goal:** 139.5 kcal (15.5 ml)
- **EffCal added:** 103.2 kcal (14.7% penalty applied)
- **New cumulative:** 118.2 kcal
- **Fill:** 84.7% (Amber zone)
- **Remaining:** 21.3 kcal (2.37 ml)
- **Overage:** 0

**UI displays:** "2.4 ml remaining (85% of 15.5ml limit)" in amber color.

---

## Tests checklist

1. **Correct EffCal computation:** For grams=10, h=50, verify `M(50) = 1.075` and `EffCal = 96.75 kcal`.

2. **Multiplier caps enforced:** For h=100, verify `M(100) = 1.3` is capped at `M_max = 1.5`.

3. **Goal boundary enforcement:** For extreme inputs (S=10, H=90), verify `G >= V_min × TDEE` and `G <= V_max × TDEE`.

4. **Rolling average accuracy:** Given 7 days of S=[60,65,70,75,70,68,72], verify `S_roll = 68.57`.

5. **Cumulative tracking:** Log 3 events (EffCal=50, 40, 30), verify `C_eff = 120` and Fill% = `(120/G)×100`.

6. **Overage detection:** If `C_eff = 150` and `G = 130`, verify `Overage = 20` and `status = 'over_limit'`.

---

## How to use this output

Copy the API schemas into your Swagger/OpenAPI docs, paste the formulas into your engineering wiki, use the code snippets as starter templates for backend routes, and share the plain-language section with product/design teams. The worked example and tests validate your implementation.
