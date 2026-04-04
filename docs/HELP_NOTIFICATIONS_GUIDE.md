# Help & Support Notifications Implementation Guide

**Date**: April 5, 2026  
**Components**: Notification Service + Notification Center Screen  
**Status**: ✅ Ready to Integrate

---

## Overview

A comprehensive notification system for Help & Support that includes:
- 📚 Help tips and learning reminders
- 🏥 Health alerts based on medical data
- ⏰ Oil tracking reminders
- 💡 Cooking tips
- 📋 Medical report follow-ups
- 🔌 IoT setup guides
- 📐 Calculation help notifications

---

## Files Created

### 1. Help Notifications Service
**File**: `src/services/helpNotificationsService.ts`  
**Purpose**: Core notification management

**Features:**
- Subscription system for real-time notifications
- Multiple notification types (8+ types)
- Priority levels (low, medium, high)
- Persistent storage (AsyncStorage)
- Category filtering
- Preference management

**Notification Types:**
- `help-tip`: Random tips from knowledge base
- `learning-reminder`: Learning module suggestions
- `health-alert`: Medical condition alerts
- `oil-reminder`: Daily oil tracking reminders
- `medical-reminder`: Medical report follow-ups
- `cooking-tip`: Method-specific tips
- `iot-guide`: IoT device setup
- `calculation-help`: Formula explanations

---

### 2. Notification Center Screen
**File**: `src/components/native/screens/HelpNotificationCenterScreen.tsx`  
**Purpose**: Display all notifications with filtering

**Features:**
- Filter by type (All, Unread, Help Tips, Reminders, Alerts, etc.)
- Real-time updates
- Mark as read/unread
- Clear all notifications
- Priority-based visual indicators
- Time-based display (e.g., "5m ago")
- Action buttons to navigate to relevant screens
- Dark mode support

---

## Usage Examples

### Example 1: Send Help Tip When User Opens App

```typescript
// In App.tsx or home screen component
import { helpNotificationsService } from '../services/helpNotificationsService';

useEffect(() => {
  // Send random help tip on app open
  const sendDailyTip = async () => {
    const prefs = await helpNotificationsService.getPreferences();
    
    if (prefs.enableHelpTips) {
      const categories = ['oil-tracking', 'cooking-methods', 'calculations'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      await helpNotificationsService.sendHelpTip(randomCategory, 'medium');
    }
  };
  
  sendDailyTip();
}, []);
```

---

### Example 2: Alert User About High Cholesterol

```typescript
// In medical report upload handler
import { helpNotificationsService } from '../services/helpNotificationsService';

const handleMedicalReportAnalysis = async (healthMetrics) => {
  if (healthMetrics.totalCholesterol > 200) {
    await helpNotificationsService.sendHealthAlert(
      'High Cholesterol Detected',
      'Reduce oil intake by 25-35%. Upload report for personalized limit. Consider olive or mustard oil.',
      'high'  // severity: 'low' | 'medium' | 'high'
    );
  }
};
```

---

### Example 3: Send Oil Tracking Reminder

```typescript
// Use in scheduled task or daily reminder
import { helpNotificationsService } from '../services/helpNotificationsService';

// Morning reminder
await helpNotificationsService.sendOilReminderNotification('morning');

// Afternoon check-in
await helpNotificationsService.sendOilReminderNotification('afternoon');

// Evening update
await helpNotificationsService.sendOilReminderNotification('evening');
```

---

### Example 4: Suggest Learning Based on Cooking Method

```typescript
// In oil logger when user selects deep fry
import { helpNotificationsService } from '../services/helpNotificationsService';

const handleCookingMethodSelected = async (method) => {
  if (method === 'deep_fry') {
    // Send tip
    await helpNotificationsService.sendCookingTip('deep_fry');
    
    // Also send learning reminder
    await helpNotificationsService.sendLearningReminder(
      'Healthier Cooking Methods',
      'Deep fry uses 25% more oil. Learn saute (5% more) and boil (0% more) techniques.',
      'Help'
    );
  }
};
```

---

### Example 5: Medical Report Follow-up Reminder

```typescript
// Schedule yearly check (e.g., in profile screen)
import { helpNotificationsService } from '../services/helpNotificationsService';

const lastReportDate = new Date('2025-01-15');
const daysSince = Math.floor((Date.now() - lastReportDate.getTime()) / 86400000);

if (daysSince > 365) {
  await helpNotificationsService.sendMedicalReportReminder(daysSince);
}
```

---

### Example 6: IoT Setup Prompt

```typescript
// When user hasn't connected IoT device
import { helpNotificationsService } from '../services/helpNotificationsService';

const showIoTSetupPrompt = async () => {
  await helpNotificationsService.sendIoTGuideNotification();
};
```

---

### Example 7: Send Calculation Help

```typescript
// When user is confused about their budget
import { helpNotificationsService } from '../services/helpNotificationsService';

const showBudgetCalculation = async () => {
  await helpNotificationsService.sendCalculationHelpNotification('budget');
  // Or: 'calories', 'tdee', 'harm-score'
};
```

---

## Integration Steps

### Step 1: Add Notification Center to Navigation

```typescript
// In navigation/AppNavigator.tsx
import { HelpNotificationCenterScreen } from '../components/native/screens/HelpNotificationCenterScreen';

<Stack.Screen 
  name="HelpNotificationCenter" 
  component={HelpNotificationCenterScreen} 
  options={{ title: 'Notifications' }}
/>
```

---

### Step 2: Add Notification Badge to Header

```typescript
// In navigation header or tabs
import { helpNotificationsService } from '../services/helpNotificationsService';
import { useEffect, useState } from 'react';

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      const count = await helpNotificationsService.getUnreadCount();
      setUnreadCount(count);
    };

    loadUnreadCount();

    // Subscribe to real-time updates
    const unsubscribe = helpNotificationsService.subscribe(async () => {
      const count = await helpNotificationsService.getUnreadCount();
      setUnreadCount(count);
    });

    return unsubscribe;
  }, []);

  return unreadCount > 0 ? (
    <View style={{ 
      position: 'absolute', 
      right: 0, 
      top: 0,
      backgroundColor: '#f44336',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
        {unreadCount}
      </Text>
    </View>
  ) : null;
}
```

---

### Step 3: Add Notification Tab Button

```typescript
// In profile or settings
import { useNavigation } from '@react-navigation/native';
import { helpNotificationsService } from '../services/helpNotificationsService';

export function NotificationSettingsButton() {
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      const count = await helpNotificationsService.getUnreadCount();
      setUnreadCount(count);
    };
    updateCount();
  }, []);

  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('HelpNotificationCenter')}
      style={{ 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600' }}>📫 Notifications</Text>
      {unreadCount > 0 && (
        <Text style={{ 
          backgroundColor: '#FF9800', 
          color: '#fff', 
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 'bold'
        }}>
          {unreadCount}
        </Text>
      )}
    </TouchableOpacity>
  );
}
```

---

### Step 4: Load Notifications When App Starts

```typescript
// In App.tsx
import { helpNotificationsService } from './services/helpNotificationsService';

useEffect(() => {
  // Load stored notifications on app start
  const loadNotifications = async () => {
    const notifications = await helpNotificationsService.getStoredNotifications();
    console.log(`Loaded ${notifications.length} help notifications`);
  };

  loadNotifications();

  // Send welcome tip for new users
  const isFirstTime = await AsyncStorage.getItem('@first_time_app');
  if (!isFirstTime) {
    await helpNotificationsService.sendHelpTip('getting-started', 'high');
    await AsyncStorage.setItem('@first_time_app', 'false');
  }
}, []);
```

---

## Notification Types & Use Cases

### Help Tip
**When**: Random helpful information  
**Examples**:
- "Know your daily oil budget"
- "Saute uses 5% more oil"
- "Ghee is high in saturated fat"

```typescript
await helpNotificationsService.sendHelpTip('cooking-methods', 'low');
```

---

### Learning Reminder
**When**: Suggest educational content  
**Examples**:
- After logging deep fry: "Learn healthier cooking"
- After medical report with high cholesterol: "Learn about oil quality"

```typescript
await helpNotificationsService.sendLearningReminder(
  'Low-Oil Cooking Techniques',
  'Master air frying, steaming, and grilling methods',
  'Help'
);
```

---

### Health Alert
**When**: Medical condition detected  
**Examples**:
- High cholesterol: "Reduce oil 25-35%"
- Diabetes: "Monitor carbs and oil"
- Fatty Liver: "Critical - 10ml/day max"

```typescript
await helpNotificationsService.sendHealthAlert(
  'Fatty Liver Disease Detected',
  'Reduce oil to 10ml/day. Consult your doctor. Avoid ghee and coconut oil.',
  'high'
);
```

---

### Oil Reminder
**When**: Daily tracking prompts  
**Timing**: Morning, Afternoon, Evening

```typescript
await helpNotificationsService.sendOilReminderNotification('morning');
```

---

### Medical Reminder
**When**: Report follow-up needed  
**Trigger**: >365 days since last report

```typescript
const lastReport = 400; // days ago
await helpNotificationsService.sendMedicalReportReminder(lastReport);
```

---

### Cooking Tip
**When**: Method-specific advice  
**Trigger**: When user selects cooking method

```typescript
await helpNotificationsService.sendCookingTip('saute');
// Messages vary by method: deep_fry, shallow_fry, saute, boil
```

---

### IoT Guide
**When**: Setup assistance  
**Trigger**: When user hasn't connected device

```typescript
await helpNotificationsService.sendIoTGuideNotification();
```

---

### Calculation Help
**When**: Formula explanations  
**Types**: budget, calories, tdee, harm-score

```typescript
await helpNotificationsService.sendCalculationHelpNotification('budget');
```

---

## Preferences Management

### Get Current Preferences

```typescript
const prefs = await helpNotificationsService.getPreferences();
// Returns: {
//   enableHelpTips: true,
//   enableReminders: true,
//   enableHealthAlerts: true,
//   tipFrequency: 'daily' // daily, weekly, never
// }
```

---

### Update Preferences

```typescript
await helpNotificationsService.updatePreferences({
  enableHelpTips: true,
  enableReminders: true,
  enableHealthAlerts: true,
  tipFrequency: 'weekly',  // Reduce frequency
});
```

---

## Data Structure

```typescript
interface HelpNotification {
  id: string;
  type: 'help-tip' | 'learning-reminder' | 'health-alert' | 'oil-reminder' | 'medical-reminder' | 'cooking-tip' | 'iot-guide' | 'calculation-help';
  category: 'getting-started' | 'oil-tracking' | 'cooking-methods' | 'oil-types' | 'calculations' | 'iot-tracker' | 'medical-reports' | 'faq';
  title: string;
  message: string;
  actionText?: string;        // e.g., "Learn More"
  actionScreen?: string;      // e.g., "Help"
  timestamp: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}
```

---

## Persistence

All notifications are stored in AsyncStorage:
- **Key**: `@swasthtel_help_notifications`
- **Capacity**: Last 100 notifications
- **Automatic cleanup**: Older notifications removed automatically

---

## Filtering Options

Users can filter by:
- 📊 All notifications
- 🔔 Unread only
- 💡 Help tips
- 📚 Learning reminders
- 🏥 Health alerts
- ⏰ Oil reminders
- 📋 Medical reminders

---

## Best Practices

### 1. **Don't Overwhelm Users**
```typescript
// ❌ Bad: Send too many high-priority alerts
await sendHealthAlert(..., 'high');  // Every time

// ✅ Good: Reserve high-priority for critical issues
if (condition === 'fatty_liver') {
  await sendHealthAlert(..., 'high');  // Only for critical
}
```

---

### 2. **Respect User Preferences**
```typescript
// ✅ Good: Check preferences before sending
const prefs = await helpNotificationsService.getPreferences();
if (prefs.enableHelpTips) {
  await sendHelpTip(...);
}
```

---

### 3. **Use Action Buttons Strategically**
```typescript
// ✅ Good: Include navigational action
await helpNotificationsService.sendHelpTip(
  'cooking-methods',
  'medium',
  // Notification includes actionText and actionScreen
);
```

---

### 4. **Group Related Notifications**
```typescript
// ✅ Good: Category-based grouping
await sendHealthAlert('condition', 'message', 'high');
// User can filter by category

// ❌ Bad: Individual unrelated alerts
```

---

## Testing

### Manually Trigger Notifications

```typescript
// In development, use React Native console:

// Send help tip
helpNotificationsService.sendHelpTip('oil-tracking', 'medium');

// Send health alert
helpNotificationsService.sendHealthAlert('Test Condition', 'Test message', 'high');

// Send oil reminder
helpNotificationsService.sendOilReminderNotification('morning');

// Get unread count
(async () => {
  const count = await helpNotificationsService.getUnreadCount();
  console.log('Unread:', count);
})();

// Get all notifications
(async () => {
  const notifs = await helpNotificationsService.getStoredNotifications();
  console.log('All notifications:', notifs);
})();
```

---

## Troubleshoots

### Notifications Not Showing?
1. Check preferences: `getPreferences()`
2. Verify timestamp is current
3. Ensure `storeNotification()` is called
4. Check AsyncStorage permissions

### Can't Navigate to Screen?
1. Verify screen name in navigation
2. Ensure `actionScreen` matches registered route
3. Check navigation prop is passed

### Too Many Notifications?
1. Add frequency throttling
2. Filter by category
3. Update user preferences
4. Implement notification deduplication

---

## Future Enhancements

1. **Push Notifications**: Send native push alerts
2. **Scheduled Reminders**: Cron-based scheduling
3. **A/B Testing**: Test different message variations
4. **Smart Timing**: Send at optimal times
5. **Personalization**: Based on user behavior
6. **Analytics**: Track notification engagement

---

**Status**: ✅ Production Ready  
**Last Updated**: April 5, 2026
