/**
 * EXAMPLE: Integrating Swasthnani Messages with Help Notifications
 * 
 * This example shows how to:
 * 1. Receive Swasthnani messages from the API
 * 2. Display them to the user in the UI
 * 3. Store them in the notification system
 * 4. Handle user interactions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SwasthnaniMessageCard,
  SwasthnaniMessageInline,
} from '../components/native/SwasthnaniMessageCard';
import { helpNotificationsService } from '../services/helpNotificationsService';
import api from '../services/api';

/**
 * Example 1: Basic Meal Logging with Swasthnani Message
 * 
 * User logs a meal → Backend generates Swasthnani message
 * → Frontend displays it → Optionally saves to notifications
 */
export function MealLoggerExample() {
  const [showMessage, setShowMessage] = useState(false);
  const [swasthnaniMessage, setSwasthnaniMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogMeal = async (mealData) => {
    try {
      setLoading(true);

      // API call to log meal
      const response = await api.post('/oilConsumption/log', {
        foodName: mealData.foodName,
        oilType: mealData.oilType,
        oilAmount: mealData.oilAmount,
        oilAmountUnit: 'g',
        quantity: mealData.quantity,
        unit: mealData.unit,
        mealType: mealData.mealType,
        sfaPercent: mealData.sfaPercent,
        tfaPercent: mealData.tfaPercent,
        pufaPercent: mealData.pufaPercent,
      });

      // Extract Swasthnani message from response
      const { swasthnaniMessage: message } = response.data.data;

      if (message) {
        // Display message in UI
        setSwasthnaniMessage(message);
        setShowMessage(true);

        // Optionally: Save to notifications for later viewing
        await helpNotificationsService.sendSwasthnaniMessage(message);

        console.log('✅ Meal logged! Swasthnani message received');
      }
    } catch (error) {
      console.error('❌ Error logging meal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageDismiss = () => {
    setShowMessage(false);
  };

  const handleMessageAction = (actionScreen) => {
    // Navigate to action screen
    console.log('Navigation to:', actionScreen);
    // navigation.navigate(actionScreen);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Logging your meal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal Logger</Text>

      {/* Meal logging form would go here */}

      <TouchableOpacity
        style={styles.logButton}
        onPress={() =>
          handleLogMeal({
            foodName: 'Dal Fry',
            oilType: 'Mustard',
            oilAmount: 15,
            quantity: 1,
            unit: 'serving',
            mealType: 'lunch',
            sfaPercent: 15,
            tfaPercent: 0,
            pufaPercent: 25,
          })
        }
      >
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.logButtonText}>Log Meal</Text>
      </TouchableOpacity>

      {/* Swasthnani Message Display */}
      <SwasthnaniMessageCard
        message={swasthnaniMessage}
        visible={showMessage}
        onDismiss={handleMessageDismiss}
        onAction={handleMessageAction}
        autoHideDelay={8000}
      />
    </View>
  );
}

/**
 * Example 2: Displaying Message Inline in Budget Screen
 * 
 * Shows Swasthnani message as part of the daily budget UI
 * 🏳️ No modal, just part of the screen
 */
export function BudgetScreenWithSwasthnaniExample() {
  const [dailyMessage, setDailyMessage] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);

  React.useEffect(() => {
    loadDailyStats();
  }, []);

  const loadDailyStats = async () => {
    try {
      // Get today's consumption
      const response = await api.get('/oilConsumption/today');
      const { status } = response.data.data;

      // Simulate getting end-of-day message from backend
      // In real app, this would come from API
      if (status.consumedKcal >= status.limitKcal) {
        setDailyMessage({
          emoji: '✅',
          title: 'Daily Complete!',
          message: `You used ${Math.round(status.consumedKcal)} kcal of your ${Math.round(status.limitKcal)} kcal budget.`,
          tone: 'positive',
        });
      }

      setDailyStats(status);
    } catch (error) {
      console.error('Error loading daily stats:', error);
    }
  };

  if (!dailyStats) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Daily Budget Info */}
      <View style={styles.budgetCard}>
        <Text style={styles.budgetLabel}>Today's Oil Budget</Text>
        <View style={styles.progressBar}>
          {/* Progress bar visualization */}
        </View>
        <Text style={styles.budgetStats}>
          {Math.round(dailyStats.consumedKcal)} / {Math.round(dailyStats.limitKcal)} kcal
        </Text>
      </View>

      {/* Swasthnani Message Inline */}
      {dailyMessage && <SwasthnaniMessageInline message={dailyMessage} />}

      {/* Other content... */}
    </ScrollView>
  );
}

/**
 * Example 3: Health-Based Personalization
 * 
 * Show different Swasthnani messages based on health condition
 */
export function HealthPersonalizationExample() {
  const healthConditions = {
    normal: {
      emoji: '💚',
      title: 'Great choice!',
      message: 'This meal keeps you on track for your health goals.',
    },
    'fatty-liver': {
      emoji: '💫',
      title: 'Smart choice for your liver',
      message: 'Reduced oil consumption is crucial for your liver health. Keep it up!',
      personalizedNote: 'Your liver is healing. This meal supports recovery.',
      tone: 'positive',
    },
    diabetes: {
      emoji: '🩺',
      title: 'Great for blood sugar',
      message: 'This meal helps maintain stable blood glucose levels.',
      personalizedNote: 'Maintaining stable blood sugar with this choice.',
      tone: 'positive',
    },
    'high-cholesterol': {
      emoji: '❤️',
      title: 'Heart-healthy choice',
      message: 'Lower oil intake helps manage your cholesterol levels.',
      personalizedNote: 'Your cholesterol management is important. This meal helps!',
      healthWarning: {
        level: 'medium',
        message: 'Consider reducing high-saturated-fat oils like ghee.',
      },
      tone: 'caution',
    },
  };

  use this example to show how to select message based on user health status:

  const userHealthStatus = 'fatty-liver'; // From user profile
  const message = healthConditions[userHealthStatus];

  return (
    <View style={styles.container}>
      <SwasthnaniMessageInline message={message} />
    </View>
  );
}

/**
 * Example 4: Budget Warning Flow
 * 
 * When user approaches daily limit, show warning message
 */
export function BudgetWarningExample() {
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);

  const handleMealLoggedWithWarning = async (mealData) => {
    try {
      const response = await api.post('/oilConsumption/log', mealData);
      const { swasthnaniMessage, consumed, limit } = response.data.data;

      // Check if budget is critical
      const percentUsed = (consumed / limit) * 100;

      if (percentUsed >= 90) {
        // Show warning message
        setWarningMessage({
          emoji: '⚠️',
          icon: 'alert-circle',
          title: 'Budget Alert',
          message: `You're at ${Math.round(percentUsed)}% of your daily limit.`,
          subtext: `${Math.round(limit - consumed)} kcal remaining.`,
          tone: 'warning',
          actionText: 'View Tips',
          actionScreen: 'Help',
        });
        setShowWarning(true);

        // Save warning to notifications
        await helpNotificationsService.sendSwasthnaniMessage(warningMessage);
      } else {
        // Regular message
        setWarningMessage(swasthnaniMessage);
        setShowWarning(true);

        // Save to notifications
        await helpNotificationsService.sendSwasthnaniMessage(swasthnaniMessage);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <SwasthnaniMessageCard
        message={warningMessage}
        visible={showWarning}
        onDismiss={() => setShowWarning(false)}
        onAction={(screen) => console.log('Navigate to:', screen)}
        autoHideDelay={warningMessage?.tone === 'warning' ? 12000 : 8000}
      />
    </View>
  );
}

/**
 * Example 5: Notification History (Swasthnani Messages)
 * 
 * View all previous Swasthnani messages in notification center
 */
export function SwasthnaniMessageHistoryExample() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);

      // Get all stored notifications
      const allNotifications = await helpNotificationsService.getStoredNotifications();

      // Filter for swasthnani-message type
      const swasthnaniMessages = allNotifications.filter(
        (n) => n.type === 'swasthnani-message'
      );

      setMessages(swasthnaniMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Swasthnani's Messages</Text>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="happy-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No messages yet. Log a meal to get started!</Text>
        </View>
      ) : (
        messages.map((message) => (
          <TouchableOpacity
            key={message.id}
            style={[
              styles.messageCard,
              {
                borderLeftColor:
                  message.priority === 'high'
                    ? '#FF6B6B'
                    : message.priority === 'medium'
                    ? '#FF9800'
                    : '#4CAF50',
              },
            ]}
          >
            <View style={styles.messageHeader}>
              <Text style={styles.messageTitle}>{message.title}</Text>
              <Text style={styles.messageTime}>
                {new Date(message.timestamp).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.messageContent}>{message.message}</Text>
            {!message.read && (
              <View style={styles.unreadIndicator}>
                <Text style={styles.unreadBadge}>NEW</Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 16,
  },
  logButton: {
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  budgetCard: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  budgetStats: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  messageCard: {
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messageContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  unreadIndicator: {
    marginTop: 8,
  },
  unreadBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9800',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
});
