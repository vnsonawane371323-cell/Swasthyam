# SwasthaIndex Frontend Integration Guide

## Overview
This guide explains how to integrate SwasthaIndex effective calories throughout the React Native mobile app.

## Key Display Changes

### 1. Oil Tracker Card (Home Screen)
**Current:** Shows raw ml consumption
**New:** Show effective calories with remaining ml

```typescript
// Update display to show:
- Primary: "{remaining_ml} ml" (from effective calories)
- Secondary: "{fill_percent}% of {goal_ml}ml daily limit"
- Tooltip icon with explanation of effective calories
- Color based on fill percentage (green/amber/orange/red)
```

### 2. Progress Bar
**Color thresholds:**
- 0-70%: Green (#16a34a)
- 71-90%: Amber (#f59e0b)
- 91-100%: Orange (#ea580c)
- >100%: Red (#dc2626)

### 3. Oil Log Entries
**Add indicators:**
- Show harm score badge for each oil (color-coded)
- Display effective calories vs raw calories
- Visual indicator: "×1.15" multiplier badge for high-harm oils

## API Integration

### Frontend API Client Updates

```typescript
// src/services/api.ts

export interface OilLogResponse {
  success: boolean;
  data: {
    eventId: string;
    entry: any;
    rawKcal: number;
    multiplier: number;
    effectiveKcal: number;
    goalKcal: number;
    cumulativeEffKcal: number;
    remainingKcal: number;
    remainingMl: number;
    fillPercent: number;
    overage: number;
    status: 'within_limit' | 'over_limit';
  };
}

export interface DailyGoalResponse {
  success: boolean;
  data: {
    goalKcal: number;
    goalMl: number;
    tdee: number;
    sRoll: number;
    hRoll: number;
    date: string;
  };
}

// Add new API methods
async computeDailyGoal(date?: string): Promise<DailyGoalResponse> {
  return this.post('/oil-consumption/compute-daily-goal', { date });
}

async getUserOilStatus(date?: string): Promise<OilStatusResponse> {
  return this.get('/oil-consumption/user-oil-status', { params: { date } });
}
```

## Component Updates

### MobileHome.tsx

```typescript
// Replace dailyConsumption state
const [oilStatus, setOilStatus] = useState({
  goalMl: 50,
  remainingMl: 30,
  fillPercent: 40,
  cumulativeEffKcal: 0,
  status: 'within_limit'
});

// Update fetch function
useEffect(() => {
  const fetchOilStatus = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await apiService.getUserOilStatus(dateStr);
      if (response.success) {
        setOilStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching oil status:', error);
    }
  };
  fetchOilStatus();
}, [selectedDate]);

// Update UI display
<View style={styles.oilCard}>
  <Text style={styles.oilAmount}>
    {oilStatus.remainingMl.toFixed(1)} ml
  </Text>
  <Text style={styles.oilLabel}>
    {oilStatus.fillPercent.toFixed(1)}% of {oilStatus.goalMl.toFixed(1)}ml
  </Text>
  <Progress 
    value={oilStatus.fillPercent} 
    color={getFillColor(oilStatus.fillPercent)}
  />
</View>
```

### MobileOilTracker.tsx

```typescript
// Update state to track effective calories
const [goalStatus, setGoalStatus] = useState({
  goalKcal: 0,
  goalMl: 0,
  remainingKcal: 0,
  remainingMl: 0,
  fillPercent: 0,
  cumulativeEffKcal: 0
});

// After logging oil
const handleLog = async () => {
  // ... existing validation ...
  
  const response = await apiService.logOilConsumption({
    foodName: selectedFood.name,
    oilType: selectedFood.oilType,
    oilAmount,
    quantity: parseFloat(quantity),
    unit,
    mealType,
    consumedAt,
  });

  if (response.success) {
    // Update goal status from response
    setGoalStatus({
      goalKcal: response.data.goalKcal,
      goalMl: response.data.goalMl,
      remainingKcal: response.data.remainingKcal,
      remainingMl: response.data.remainingMl,
      fillPercent: response.data.fillPercent,
      cumulativeEffKcal: response.data.cumulativeEffKcal
    });

    // Show effective vs raw calories in alert
    Alert.alert(
      'Success',
      `Logged ${oilAmount.toFixed(1)}ml of ${selectedFood.oilType}\n` +
      `Raw: ${response.data.rawKcal.toFixed(0)} kcal\n` +
      `Effective: ${response.data.effectiveKcal.toFixed(0)} kcal (×${response.data.multiplier.toFixed(2)})\n` +
      `Remaining: ${response.data.remainingMl.toFixed(1)} ml`
    );
  }
};

// Display harm score indicator for each oil
function OilHarmBadge({ oilType }: { oilType: string }) {
  const harmScore = getOilHarmScore(oilType);
  const color = harmScore < 30 ? 'green' : harmScore < 60 ? 'amber' : 'red';
  
  return (
    <Badge variant={color}>
      <Text>H: {harmScore}</Text>
    </Badge>
  );
}
```

## Utility Functions

### src/utils/swasthaIndex.ts

```typescript
// Frontend utilities matching backend logic

export function getOilHarmScore(oilType: string): number {
  const harmScores: Record<string, number> = {
    'Olive Oil': 10,
    'Mustard Oil': 20,
    'Groundnut Oil': 25,
    'Sesame Oil': 25,
    'Rice Bran Oil': 30,
    'Canola Oil': 35,
    'Sunflower Oil': 40,
    'Safflower Oil': 40,
    'Corn Oil': 45,
    'Soybean Oil': 50,
    'Ghee': 55,
    'Coconut Oil': 60,
    'Butter': 65,
    'Cottonseed Oil': 70,
    'Palm Oil': 80,
    'Palmolein Oil': 85,
    'Vegetable Oil': 50
  };
  return harmScores[oilType] || 50;
}

export function getFillColor(fillPercent: number): string {
  if (fillPercent <= 70) return '#16a34a';
  if (fillPercent <= 90) return '#f59e0b';
  if (fillPercent <= 100) return '#ea580c';
  return '#dc2626';
}

export function computeMultiplier(harmScore: number): number {
  const K = 0.3;
  const M_MAX = 1.5;
  const hNorm = harmScore / 100;
  return Math.min(1 + K * (hNorm ** 2), M_MAX);
}

export function estimateEffectiveCalories(grams: number, harmScore: number): number {
  const rawKcal = grams * 9;
  const multiplier = computeMultiplier(harmScore);
  return rawKcal * multiplier;
}
```

## UI Microcopy

### Home Card Tooltip
```
"Your oil limit is personalized based on your metabolism and diet quality. 
Healthier oils count closer to actual calories, while less healthy oils count 
higher, encouraging better choices."
```

### Oil Tracker Info Section
```
Title: "Understanding Your Oil Limit"
Body: "We track 'effective calories' - healthier oils like mustard and olive 
count near their actual calories, but less healthy oils like palm count 20-50% 
higher. This helps you stay within your personalized daily limit while guiding 
you toward healthier choices."
```

### Entry Detail View
```
Raw Calories: {rawKcal} kcal
Multiplier: ×{multiplier.toFixed(2)}
Effective Calories: {effectiveKcal} kcal
Harm Score: {harmScore}/100
```

## Progressive Enhancement

### Phase 1: Display Changes (Immediate)
- Update Home card to show remainingMl from effective calories
- Add color-coded progress bar
- Display harm scores on oil entries

### Phase 2: Full Integration (Week 2)
- Implement daily goal computation on app open
- Add effective calorie tooltips and explanations
- Show multiplier indicators in real-time

### Phase 3: Education (Week 3)
- Add onboarding screen explaining effective calories
- Implement "Oil Health Score" education module
- Show comparative harm scores in oil selection

## Testing Checklist

- [ ] Home screen displays effective calories correctly
- [ ] Progress bar colors match fill thresholds
- [ ] Oil log shows harm scores for all oil types
- [ ] Daily goal updates at midnight
- [ ] Multiplier calculations match backend
- [ ] Overage displays correctly (negative remaining)
- [ ] Error handling for missing BMR/activity factor
- [ ] Smooth transition when switching dates

## Migration Notes

**Backward Compatibility:**
- Existing oil logs without effectiveKcal will display raw calories
- Default BMR (1500) and activity factor (1.5) used if user hasn't set them
- Rolling scores default to S=70, H=40 for new users

**Data Sync:**
- Run migration script to compute effectiveKcal for existing entries
- Recompute daily goals for the last 7 days
- Initialize rolling scores table with default values
