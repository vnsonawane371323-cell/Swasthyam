# Swasthnani Warm Messages Integration Guide

**Feature**: Personalized warm messages from Swasthnani (app mascot) after every meal is logged  
**Status**: ✅ Ready to Integrate  
**Date**: April 5, 2026

---

## Overview

Swasthnani is the app's AI character who provides warm, encouraging, personalized messages after each meal is logged. Messages adapt based on:
- 💧 Current oil consumption vs. daily limit
- ❤️ User's health status (diabetes, fatty liver, high cholesterol, etc.)
- 🍳 Cooking method and oil type
- 📊 Daily progress and budget remaining
- 🎯 Consistency patterns and streaks

---

## Architecture

### Backend Flow

1. **User logs meal** → `POST /api/oilConsumption/log`
2. **Controller receives meal data** → `oilConsumptionController.logConsumption()`
3. **Swasthnani Service generates message** → `swasthnaniService.generateMealLoggingMessage()`
4. **Response includes message data** → Sent to frontend

### Frontend Flow

1. **Received Swasthnani message** from API response
2. **Display component** → `SwasthnaniMessageCard`
3. **User views/accepts message** → Can dismiss or take action
4. **Notification saved** → `helpNotificationsService` stores as "swasthnani-message"

---

## Components

### 1. Backend Service: `swasthnaniService.js`

**Location**: `backend/services/swasthnaniService.js`

**Main Methods**:

#### `generateMealLoggingMessage(mealData)`
Generates warm message after meal logging
```javascript
const message = swasthnaniService.generateMealLoggingMessage({
  oilAmount: 15,           // grams
  foodName: 'Dal Fry',
  mealType: 'lunch',
  oilType: 'Mustard',
  harmScore: 45,           // 0-100
  dailyStatus: {
    limitKcal: 450,
    consumedKcal: 120,
    remainingKcal: 330
  },
  userHealthStatus: 'normal'
});
```

**Returns**:
```javascript
{
  emoji: '💚',
  icon: 'checkmark-circle',
  title: 'Great logging!',
  message: 'Starting your day right with "Dal Fry" using Mustard (good oil choice!)',
  subtext: 'You\'ve consumed 26% in this meal. 330 kcal left.',
  encouragement: 'Your consistency is building better habits.',
  tone: 'positive',
  healthWarning: null,
  personalizedNote: null,
  sustainabilityTip: null
}
```

#### `generateBudgetWarning(remainingKcal, limitKcal, mealType)`
Warning when approaching limit
```javascript
const warning = swasthnaniService.generateBudgetWarning(20, 450);
// Returns: { emoji: '⚠️', title: 'Critical budget', ... }
```

#### `generateDailyCompletionMessage(dailyConsumption, dailyLimit, healthStatus)`
End-of-day summary
```javascript
const daily = swasthnaniService.generateDailyCompletionMessage(400, 450);
// Returns: { emoji: '✅', title: 'Perfect Balance!', ... }
```

#### `generateStreakMessage(consecutiveDaysOnTarget, personalBest)`
Encouragement for consistency
```javascript
const streak = swasthnaniService.generateStreakMessage(7);
// Returns: { emoji: '🎉', message: 'One week! You\'re crushing this!', ... }
```

#### Other Methods:
- `generateWeeklyProgressMessage()` - Weekly summary
- `generatePersonalizedTip()` - Custom tips based on habits
- `generateSustainabilityMessage()` - Eco-friendly suggestions
- `getDailyHealthSummary()` - Health-specific closing

---

### 2. Backend Integration: `oilConsumptionController.js`

**Updated**: `logConsumption()` endpoint now includes Swasthnani message

```javascript
// In exports.logConsumption = async (req, res, next) => {

// Get user's health status
const user = await User.findById(req.user._id);
const userHealthStatus = user.healthStatus || 'normal';

// Generate Swasthnani message
const swasthnaniMessage = swasthnaniService.generateMealLoggingMessage({
  oilAmount: oilAmountGrams,
  foodName,
  mealType,
  oilType,
  harmScore,
  dailyStatus: status,
  userHealthStatus
});

// Include in response
res.status(201).json({
  success: true,
  message: 'Oil consumption logged successfully',
  data: {
    ...otherData,
    swasthnaniMessage  // ← NEW
  }
});
```

---

### 3. Frontend Components

#### `SwasthnaniMessageCard.tsx` - Full Screen Modal

**Location**: `src/components/native/SwasthnaniMessageCard.tsx`

**Features**:
- Animated slide-in from bottom
- Auto-dismiss after 8 seconds (configurable)
- Tone-based color coding (positive/caution/warning/critical)
- Action buttons for navigation
- Health warnings display
- Encouragement highlights
- Sustainability tips

**Usage**:
```typescript
import { SwasthnaniMessageCard } from '../components/native/SwasthnaniMessageCard';
import { useState } from 'react';

export function MealLoggerScreen() {
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);

  const handleMealLogged = async (mealData) => {
    try {
      const response = await fetch('/api/oilConsumption/log', {
        method: 'POST',
        body: JSON.stringify(mealData)
      });
      
      const result = await response.json();
      
      // Display Swasthnani message
      setCurrentMessage(result.data.swasthnaniMessage);
      setShowMessage(true);
      
      // Trigger notification
      await helpNotificationsService.sendSwasthnaniNotification(
        result.data.swasthnaniMessage
      );
    } catch (error) {
      console.error('Error logging meal:', error);
    }
  };

  const handleMessageAction = (actionScreen) => {
    // Navigate to screen if action is defined
    navigation.navigate(actionScreen);
  };

  return (
    <>
      {/* Your meal logger UI */}
      
      {/* Swasthnani Message Card */}
      <SwasthnaniMessageCard
        message={currentMessage}
        visible={showMessage}
        onDismiss={() => setShowMessage(false)}
        onAction={handleMessageAction}
        autoHideDelay={8000}
      />
    </>
  );
}
```

---

#### `SwasthnaniMessageInline.tsx` - Embedded in Screen

Compact version for within screens:

```typescript
import { SwasthnaniMessageInline } from '../components/native/SwasthnaniMessageCard';

export function BudgetScreen() {
  const [dailyMessage, setDailyMessage] = useState(null);

  useEffect(() => {
    // Get end-of-day message
    const message = swasthnaniService.generateDailyCompletionMessage(
      dailyConsumption,
      dailyLimit,
      userHealthStatus
    );
    setDailyMessage(message);
  }, []);

  return (
    <View>
      {/* Inline message display */}
      <SwasthnaniMessageInline message={dailyMessage} />
      
      {/* Other content */}
    </View>
  );
}
```

---

#### `SwasthnaniAvatarBubble.tsx` - Chat Bubble Style

Avatar with message bubble:

```typescript
import { SwasthnaniAvatarBubble } from '../components/native/SwasthnaniMessageCard';

export function HealthReportScreen() {
  return (
    <View>
      <SwasthnaniAvatarBubble
        message={swasthnaniMessage}
        size="medium"
        onDismiss={() => setShowBubble(false)}
      />
    </View>
  );
}
```

---

## Message Types

### 1. Meal Logging Message (Most Common)

**When**: Every meal is logged  
**Tone**: Positive, encouraging  
**Duration**: 8 seconds auto-dismiss

```javascript
{
  emoji: '💚',
  title: 'Great logging!',
  message: 'Starting your day right...',
  encouragement: 'Your consistency is building better habits.',
  tone: 'positive',
  subtext: '330 kcal remaining'
}
```

---

### 2. Budget Warning Message

**When**: User approaches or exceeds daily limit  
**Tone**: Caution or warning  
**Duration**: 10 seconds auto-dismiss (requires acknowledgment)

```javascript
{
  emoji: '⚠️',
  title: 'Critical budget',
  message: 'Only 20 kcal left. Choose boiling or grilling...',
  tone: 'caution',
  actionText: 'Show Cooking Methods',
  actionScreen: 'Help'
}
```

---

### 3. Health Alert Message

**When**: Health condition detected  
**Tone**: Warning  
**Duration**: Persistent (manual dismiss)

```javascript
{
  emoji: '🩺',
  title: 'Health Alert',
  message: 'High cholesterol detected...',
  healthWarning: {
    level: 'high',
    message: '...'
  },
  personalizedNote: 'Your cholesterol management is important...',
  tone: 'warning'
}
```

---

### 4. Daily Summary Message

**When**: End of day  
**Tone**: Varies (positive/caution/neutral)

```javascript
{
  emoji: '✅',
  title: 'Perfect Balance!',
  message: 'You used 95% of your daily limit. Well controlled!',
  tone: 'positive',
  healthMessage: 'Your heart thanks you for these choices.'
}
```

---

### 5. Streak Message

**When**: User hits consistency milestone  
**Tone**: Celebratory  
**Duration**: 6 seconds auto-dismiss

```javascript
{
  emoji: '🎉',
  title: 'One week!',
  message: 'You\'re crushing this! 7-day streak!',
  motivational: true,
  tone: 'positive'
}
```

---

## Integration Steps

### Step 1: Update API Response

✅ **Already done in controller**

The `logConsumption` endpoint now returns:
```json
{
  "success": true,
  "data": {
    "eventId": "...",
    "entry": {...},
    "swasthnaniMessage": {
      "emoji": "💚",
      "title": "Great logging!",
      "message": "Starting your day right...",
      ...
    }
  }
}
```

---

### Step 2: Import Component in Screen

```typescript
import SwasthnaniMessageCard, { 
  SwasthnaniMessageInline,
  SwasthnaniAvatarBubble 
} from '../components/native/SwasthnaniMessageCard';
```

---

### Step 3: Display Message After Meal Logging

```typescript
const handleMealSubmit = async (mealData) => {
  try {
    const response = await mealLogger.logMeal(mealData);
    
    // Extract Swasthnani message
    const { swasthnaniMessage } = response.data;
    
    // Show message
    setCurrentMessage(swasthnaniMessage);
    setShowMessage(true);
    
    // Optional: Save to notifications
    await helpNotificationsService.sendSwasthnaniNotification(swasthnaniMessage);
  } catch (error) {
    handleError(error);
  }
};
```

---

### Step 4: Handle Message Actions

```typescript
const handleMessageAction = (actionScreen) => {
  if (actionScreen) {
    navigation.navigate(actionScreen);
  }
  setShowMessage(false);
};
```

---

## Health-Based Personalization

Messages automatically personalize based on `user.healthStatus`:

### Fatty Liver
```javascript
emoji: '💫'
personalizedNote: 'Your liver is healing. This meal supports recovery.'
encouragement: 'Every gram less oil helps your liver recover.'
```

### Diabetes
```javascript
emoji: '🩺'
personalizedNote: 'Maintaining stable blood sugar with this choice.'
encouragement: 'Controlling oil intake helps manage blood sugar.'
```

### High Cholesterol
```javascript
emoji: '❤️'
personalizedNote: 'Your cholesterol management is important...'
encouragement: 'Lower oil intake helps manage cholesterol levels.'
```

### High Blood Pressure
```javascript
emoji: '💪'
personalizedNote: 'Lower oil intake helps manage blood pressure.'
encouragement: 'Every healthy choice supports your wellbeing.'
```

---

## Styling & Theming

All components support dark/light mode:

```typescript
const { isDark } = useTheme();

// Automatically adapts:
// - Background colors
// - Text colors
// - Border colors
// - Icon colors
```

**Tone-based colors**:
- `positive` → Green (#4CAF50)
- `caution` → Orange (#FF9800)
- `warning` → Red (#FF6B6B)
- `critical` → Dark Red (#D32F2F)
- `neutral` → Blue (#2196F3)

---

## Advanced Features

### Sustainability Tips

Messages can include eco-friendly suggestions:

```javascript
const message = {
  ...,
  sustainabilityTip: {
    icon: '🌍',
    message: 'Mustard oil is locally grown and sustainable! Great choice.'
  }
};
```

---

### Encouragement Database

50+ contextual encouragements by:
- Consumption pattern (light/good/moderate)
- Health status (diabetes/fatty-liver/etc)
- Consistency (streaks, personal bests)

Example:
```javascript
'fantastic-consistency': [
  'Your dedication shows real commitment.',
  'You\'re building better habits!',
  'This is how lifestyle changes happen.',
]
```

---

### Auto-Dismiss Behavior

**Default: 8 seconds**

Customize per message:

```typescript
<SwasthnaniMessageCard
  message={msg}
  autoHideDelay={6000}  // 6 seconds
  onDismiss={handleDismiss}
/>
```

Critical messages (warnings) require manual dismiss.

---

## API Endpoints

### Backend

**Log meal with Swasthnani message**:
```
POST /api/oilConsumption/log
Body: { foodName, oilType, oilAmount, mealType, ... }
Response: { data: { swasthnaniMessage: {...} } }
```

---

## Error Handling

```typescript
try {
  const response = await api.logMeal(mealData);
  const message = response.data.swasthnaniMessage;
  
  if (!message) {
    console.warn('No Swasthnani message in response');
    // Show default message
  }
  
  setCurrentMessage(message);
} catch (error) {
  console.error('Failed to get Swasthnani message:', error);
  // Fall back to generic success message
}
```

---

## Testing

### Manual Testing

```typescript
// Test message generation directly
import swasthnaniService from '../services/swasthnaniService';

const testMessage = swasthnaniService.generateMealLoggingMessage({
  oilAmount: 15,
  foodName: 'Test Meal',
  mealType: 'lunch',
  oilType: 'Mustard',
  harmScore: 45,
  dailyStatus: { limitKcal: 450, consumedKcal: 100, remainingKcal: 350 },
  userHealthStatus: 'normal'
});

console.log(testMessage);
// Inspect: emoji, title, message, tone, etc.
```

### Component Testing

```typescript
test('SwasthnaniMessageCard displays message', () => {
  const message = {
    emoji: '💚',
    title: 'Test',
    message: 'Test message',
    tone: 'positive'
  };

  const { getByText } = render(
    <SwasthnaniMessageCard message={message} visible={true} />
  );

  expect(getByText('Test')).toBeTruthy();
  expect(getByText('Test message')).toBeTruthy();
});
```

---

## Performance Considerations

- **Message generation**: O(1) complexity, runs instantly
- **Database queries**: Minimal (only user health status lookup)
- **UI rendering**: Smooth animation (uses `useNativeDriver`)
- **Memory**: Message object ~1KB, negligible impact
- **Battery**: Auto-dismiss prevents screen staying on

---

## Future Enhancements

1. **Voice Messages**: Swasthnani can speak encouragement
2. **Avatar Animation**: Swasthnani avatar reacts to messages
3. **Habits Learning**: Gets smarter over weeks/months
4. **Challenge Mode**: Compete with friends for best messages
5. **Customized Tone**: User can select message intensity
6. **Cultural Variations**: Different cultures get culturally relevant messages

---

## Troubleshooting

### Message Not Showing

1. Check if `swasthnaniMessage` is in API response
2. Verify component mounting/visibility state
3. Check `autoHideDelay` not firing too fast
4. Ensure `onDismiss` callback is defined

### Wrong Message for Health Status

1. Verify `user.healthStatus` is set in database
2. Check health status value matches enum exactly
3. Test with known health status value

### Message Text Truncated

1. Adjust `numberOfLines` prop
2. Check font size for screen size
3. Ensure parent width is set

---

## Files Reference

- **Backend**: `backend/services/swasthnaniService.js`
- **Backend**: `backend/controllers/oilConsumptionController.js` (updated)
- **Frontend**: `src/components/native/SwasthnaniMessageCard.tsx`
- **Frontend**: Integration in meal logging screens

---

**Status**: ✅ Production Ready  
**Last Updated**: April 5, 2026
