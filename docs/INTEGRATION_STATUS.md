# SwasthaIndex Oil System - Integration Summary

## ✅ Completed Integration

### Documentation
1. **SWASTHAINDEX_OIL_SYSTEM.md** - Complete mathematical specification and API reference
   - One-line summary and plain-language explanation
   - Full mathematical formulas with default parameters
   - REST API design with JSON schemas
   - Database schema definitions
   - Integration code snippets (Python Flask, Node.js Express)
   - UI microcopy and layout guidelines
   - Worked numerical example
   - Tests checklist

2. **FRONTEND_INTEGRATION.md** - Frontend integration guide
   - Component update instructions
   - API client changes
   - UI display modifications
   - Utility functions
   - Progressive enhancement roadmap
   - Testing checklist

### Backend Implementation

#### New Models
1. **DailyGoal.js** (`/backend/models/DailyGoal.js`)
   - Stores computed daily oil calorie limits
   - Methods: `getOrComputeGoal`, `addEffectiveCalories`, `getStatus`
   - Auto-computes goal based on TDEE and rolling scores

2. **RollingScore.js** (`/backend/models/RollingScore.js`)
   - Tracks daily Swastha Score and Harm Index
   - Methods: `getRollingScores`, `updateDailyScore`, `computeHarmIndex`
   - 7-day rolling average computation
   - Oil harm score lookup table

#### Updated Models
3. **OilConsumption.js** - Added SwasthaIndex fields:
   - `harmScore` (0-100)
   - `rawKcal` (grams × 9)
   - `multiplier` (1.0-1.5)
   - `effectiveKcal` (raw × multiplier)
   - Updated `getDailyTotal` to include effective calories

4. **User.js** - Added metabolic fields:
   - `bmr` (Basal Metabolic Rate)
   - `activityFactor` (1.2-2.0)
   - `tdee` (Total Daily Energy Expenditure)

#### New Utilities
5. **swasthaIndex.js** (`/backend/utils/swasthaIndex.js`)
   - Core calculation functions
   - `computeDailyGoal(bmr, activityFactor, sRoll, hRoll)`
   - `computeMultiplier(harmScore)`
   - `computeEffectiveCalories(grams, harmScore)`
   - `computeGoalStatus(goalKcal, cumulativeEffKcal)`
   - `computeBMR(weight, height, age, gender)` - Mifflin-St Jeor formula
   - UI helper functions: `getFillColor`, `getHexColor`

#### Updated Controllers
6. **oilConsumptionController.js** - Enhanced with SwasthaIndex:
   - `logConsumption` - Now computes and stores effective calories
   - `computeDailyGoal` - NEW: POST endpoint for goal computation
   - `getUserOilStatus` - NEW: GET endpoint for current status

#### Updated Routes
7. **oilConsumption.js** - Added new endpoints:
   - `POST /oil-consumption/compute-daily-goal`
   - `GET /oil-consumption/user-oil-status?date=YYYY-MM-DD`

### Frontend (Partially Integrated)

#### Existing Components Updated
1. **MobileOilTracker.tsx** - Has edit/delete functionality, meal grouping
   - Ready for effective calorie display
   - Needs: API response integration for multiplier/effectiveKcal

2. **MobileHome.tsx** - Calendar navigation, daily totals
   - Ready for SwasthaIndex status display
   - Needs: Call getUserOilStatus API, update progress colors

#### Utility Files Created
3. **Frontend swasthaIndex.ts** - Documented in FRONTEND_INTEGRATION.md
   - Needs creation with harm score lookup and multiplier calculation

## 📋 Next Steps for Full Integration

### Backend (Remaining)
1. **Database Migration Script**
   - Backfill `harmScore`, `rawKcal`, `multiplier`, `effectiveKcal` for existing entries
   - Initialize `rolling_scores` table with defaults
   - Compute initial `bmr` for users with height/weight/age

2. **Scheduled Jobs**
   - Daily goal computation at midnight
   - Rolling score updates
   - Weekly Swastha Score calculation (meal analysis)

3. **API Enhancements**
   - Batch endpoint for weekly goal computation
   - Admin endpoint to adjust CONSTANTS
   - Analytics endpoint for harm score distribution

### Frontend (Remaining)
1. **Create swasthaIndex.ts utility**
   - Copy functions from FRONTEND_INTEGRATION.md
   - Add to `/src/utils/swasthaIndex.ts`

2. **Update MobileHome.tsx**
   - Replace raw consumption with effective calories
   - Add color-coded progress bar
   - Call `getUserOilStatus` API
   - Display harm-adjusted remaining ml

3. **Update MobileOilTracker.tsx**
   - Show multiplier badge on each entry
   - Display effective vs raw calories
   - Add harm score indicator
   - Update success message with effective calorie info

4. **Update apiService**
   - Add `computeDailyGoal()` method
   - Add `getUserOilStatus()` method
   - Update `logOilConsumption()` response type

5. **Add UI Components**
   - EffectiveCaloriesTooltip component
   - HarmScoreBadge component
   - GoalStatusCard component

6. **Onboarding Updates**
   - Add BMR/activity level collection
   - Explain effective calories concept
   - Show oil harm score education

### Testing (Remaining)
1. **Backend Tests**
   - Unit tests for swasthaIndex utility functions
   - Integration tests for new endpoints
   - Test boundary conditions (S_roll extremes, etc.)

2. **Frontend Tests**
   - Component tests for updated displays
   - E2E test: log oil → verify effective calories
   - Test color transitions at thresholds

## 🎯 Immediate Action Items

**Priority 1 (This Week):**
1. Create frontend `swasthaIndex.ts` utility
2. Update `apiService` with new methods
3. Integrate `getUserOilStatus` in MobileHome
4. Display effective calories in MobileOilTracker
5. Add harm score badges

**Priority 2 (Next Week):**
1. Database migration for existing data
2. Add effective calorie tooltips
3. Implement daily goal computation job
4. Add onboarding screens for BMR/activity
5. Create comprehensive tests

**Priority 3 (Week 3):**
1. Analytics dashboard for oil health metrics
2. Education module explaining system
3. Comparative harm score visualizations
4. Weekly/monthly effective calorie trends

## 📊 System Health Checks

Before going live, verify:
- [ ] All new models have proper indexes
- [ ] API endpoints return correct status codes
- [ ] Default values (S=70, H=40) are sensible
- [ ] Multiplier never exceeds M_MAX (1.5)
- [ ] Goal stays within bounds (V_MIN, V_MAX)
- [ ] Frontend displays match backend calculations
- [ ] Error messages are user-friendly
- [ ] Loading states prevent double-submissions

## 🔄 Rollout Strategy

**Stage 1: Silent Launch (Internal)**
- Enable for team accounts only
- Monitor effective calorie calculations
- Validate goal adjustments make sense

**Stage 2: Beta (10% users)**
- A/B test: Show effective vs raw calories
- Collect feedback on clarity
- Adjust messaging if needed

**Stage 3: Full Release**
- Roll out to all users
- Add in-app tutorial
- Monitor support tickets for confusion

**Rollback Plan:**
- Backend: Toggle flag `USE_SWASTHA_INDEX = false`
- Frontend: Fall back to displaying raw ml only
- Database: Keep raw values alongside effective

## 📞 Support

For integration questions:
- Backend: Refer to `/docs/SWASTHAINDEX_OIL_SYSTEM.md`
- Frontend: Refer to `/docs/FRONTEND_INTEGRATION.md`
- API Examples: See code snippets in system doc
- Formula Questions: Check "Worked Example" section
