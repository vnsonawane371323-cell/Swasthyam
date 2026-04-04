/**
 * Help & Support Notification Handlers
 * Location: src/services/helpNotificationsService.ts
 * 
 * This service manages notifications related to:
 * - Help & Support tips
 * - Learning reminders
 * - Health alerts
 * - Oil tracking reminders
 * - Medical report reminders
 * - Cooking tips
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface HelpNotification {
  id: string;
  type: 'help-tip' | 'learning-reminder' | 'health-alert' | 'oil-reminder' | 'medical-reminder' | 'cooking-tip' | 'iot-guide' | 'calculation-help' | 'swasthnani-message';
  category: 'getting-started' | 'oil-tracking' | 'cooking-methods' | 'oil-types' | 'calculations' | 'iot-tracker' | 'medical-reports' | 'faq';
  title: string;
  message: string;
  actionText?: string;
  actionScreen?: string;
  timestamp: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

const HELP_NOTIFICATIONS_KEY = '@swasthtel_help_notifications';
const HELP_PREFERENCES_KEY = '@swasthtel_help_preferences';

// Help Tips Database
export const HELP_TIPS = {
  // Getting Started
  'getting-started': [
    {
      title: '🎯 Complete Your Profile',
      message: 'A complete health profile helps us give you personalized oil recommendations.',
      actionText: 'Update Profile',
      screen: 'Profile',
    },
    {
      title: '📱 Enable Notifications',
      message: 'Get reminders for your daily oil tracking and health tips.',
      actionText: 'Settings',
      screen: 'Settings',
    },
  ],

  // Oil Tracking
  'oil-tracking': [
    {
      title: '🍳 Log Your Oils Regularly',
      message: 'Regular logging helps track patterns and gives better recommendations.',
      actionText: 'Oil Tracker',
      screen: 'OilTracker',
    },
    {
      title: '💡 Use IoT Scale for Precision',
      message: 'Connect your smart scale for automatic and accurate oil measurements.',
      actionText: 'Connect Device',
      screen: 'IoTSetup',
    },
    {
      title: '📊 Check Your Weekly Average',
      message: 'Your 7-day rolling average matters more than daily fluctuations.',
      actionText: 'View Trends',
      screen: 'Analytics',
    },
  ],

  // Cooking Methods
  'cooking-methods': [
    {
      title: '🥘 Saute is Your Friend',
      message: 'Saute uses only 5% more oil than base. Perfect for daily healthy cooking.',
      actionText: 'Learn More',
      screen: 'Help',
    },
    {
      title: '💧 Boil for Healthiest Option',
      message: 'Boiling (factor 1.0) absorbs NO extra oil. Best for heart health.',
      actionText: 'Cooking Guide',
      screen: 'Help',
    },
    {
      title: '⚠️ Deep Fry Less Often',
      message: 'Deep fry uses 25% more oil. Save for special occasions only.',
      actionText: 'View Guide',
      screen: 'Help',
    },
  ],

  // Oil Types
  'oil-types': [
    {
      title: '🌱 Mustard Oil Daily',
      message: 'Score 7/10 - Best for daily Indian cooking. Anti-inflammatory & traditional.',
      actionText: 'Oil Comparison',
      screen: 'Help',
    },
    {
      title: '🫒 Olive Oil Premium',
      message: 'Score 8/10 - Highest quality. Use for special meals or fresh use.',
      actionText: 'Learn Benefits',
      screen: 'Help',
    },
    {
      title: '🧈 Ghee Occasionally',
      message: 'Score 4/10 - High saturated fat. Save for celebrations only.',
      actionText: 'Health Info',
      screen: 'Help',
    },
  ],

  // Calculations
  'calculations': [
    {
      title: '📐 Know Your Daily Budget',
      message: 'Your personalized budget = TDEE × 0.07 (ICMR standard)',
      actionText: 'Calculate Now',
      screen: 'Help',
    },
    {
      title: '⚖️ All Oils = 9 kcal/gram',
      message: 'Raw calories same for all oils. Quality multiplier adjusts based on health.',
      actionText: 'Formulas',
      screen: 'Help',
    },
    {
      title: '🔄 Reuse Reduces Quality',
      message: 'Each reuse loses 5% quality. Discard oil after 3 reuses for safety.',
      actionText: 'Learn More',
      screen: 'Help',
    },
  ],

  // IoT Tracker
  'iot-tracker': [
    {
      title: '🔌 Connect Your Smart Scale',
      message: 'WiFi-enabled scale for automatic, precise oil measurements (0.1g accuracy).',
      actionText: 'Setup Guide',
      screen: 'Help',
    },
    {
      title: '⚙️ Calibrate Your Device',
      message: 'Use known 1kg weight for accuracy. Calibrate yearly or if readings seem off.',
      actionText: 'Calibration',
      screen: 'IoTSetup',
    },
    {
      title: '💾 Sync Data Automatically',
      message: 'IoT readings sync instantly. No manual entry needed. Perfect for busy cooking!',
      actionText: 'View Settings',
      screen: 'Settings',
    },
  ],

  // Medical Reports
  'medical-reports': [
    {
      title: '📋 Upload Medical Report',
      message: 'AI analyzes your health. Automatic oil limit adjustments based on conditions.',
      actionText: 'Upload Now',
      screen: 'MedicalReports',
    },
    {
      title: '🩺 High Cholesterol?',
      message: 'Reduce oil by 25-35%. Upload report for personalized limit.',
      actionText: 'Health Info',
      screen: 'Help',
    },
    {
      title: '🔬 Fatty Liver Warning',
      message: 'Critical condition. Reduce oil to 10ml/day maximum. Must follow doctor.',
      actionText: 'Details',
      screen: 'Help',
    },
  ],

  // FAQ
  'faq': [
    {
      title: '❓ Why Deep Fry 1.25?',
      message: 'Food fully immersed absorbs 25% more oil than base. High heat + long time.',
      actionText: 'Read FAQ',
      screen: 'Help',
    },
    {
      title: '❓ Can I Exceed Daily Goal?',
      message: 'Occasional overages OK. The 7-day rolling average matters more for health.',
      actionText: 'FAQ Section',
      screen: 'Help',
    },
    {
      title: '❓ Stop Eating Oil?',
      message: 'No! Need 15-30ml daily for vitamin absorption & hormone production.',
      actionText: 'Learn Why',
      screen: 'Help',
    },
  ],
};

class HelpNotificationsService {
  private callbacks: Array<(notification: HelpNotification) => void> = [];

  // Generate unique ID
  private generateId(): string {
    return `help_notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Subscribe to notifications
  subscribe(callback: (notification: HelpNotification) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers
  private notifySubscribers(notification: HelpNotification) {
    this.callbacks.forEach(callback => callback(notification));
  }

  // Store notification
  async storeNotification(notification: HelpNotification): Promise<void> {
    try {
      const stored = await this.getStoredNotifications();
      const updated = [notification, ...stored].slice(0, 100); // Keep last 100
      await AsyncStorage.setItem(HELP_NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[HelpNotificationsService] Failed to store:', error);
    }
  }

  // Get stored notifications
  async getStoredNotifications(): Promise<HelpNotification[]> {
    try {
      const stored = await AsyncStorage.getItem(HELP_NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[HelpNotificationsService] Failed to get:', error);
      return [];
    }
  }

  // Mark as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const stored = await this.getStoredNotifications();
      const updated = stored.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem(HELP_NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[HelpNotificationsService] Failed to mark as read:', error);
    }
  }

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    try {
      const stored = await this.getStoredNotifications();
      const updated = stored.map(n => ({ ...n, read: true }));
      await AsyncStorage.setItem(HELP_NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[HelpNotificationsService] Failed to mark all read:', error);
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const notifications = await this.getStoredNotifications();
    return notifications.filter(n => !n.read).length;
  }

  // Get notifications filtered by category
  async getNotificationsByCategory(category: string): Promise<HelpNotification[]> {
    const notifications = await this.getStoredNotifications();
    return notifications.filter(n => n.category === category).slice(0, 20);
  }

  // Send help tip
  async sendHelpTip(
    category: keyof typeof HELP_TIPS,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<HelpNotification | null> {
    const tips = HELP_TIPS[category];
    if (!tips || tips.length === 0) return null;

    // Get random tip
    const tip = tips[Math.floor(Math.random() * tips.length)];

    const notification: HelpNotification = {
      id: this.generateId(),
      type: 'help-tip',
      category: category as any,
      title: tip.title,
      message: tip.message,
      actionText: tip.actionText,
      actionScreen: tip.screen,
      timestamp: Date.now(),
      read: false,
      priority,
    };

    await this.storeNotification(notification);
    this.notifySubscribers(notification);

    return notification;
  }

  // Send learning reminder
  async sendLearningReminder(
    topic: string,
    message: string,
    screen: string = 'Help'
  ): Promise<HelpNotification> {
    const notification: HelpNotification = {
      id: this.generateId(),
      type: 'learning-reminder',
      category: 'getting-started',
      title: `📚 Learn: ${topic}`,
      message,
      actionText: 'Read Guide',
      actionScreen: screen,
      timestamp: Date.now(),
      read: false,
      priority: 'medium',
    };

    await this.storeNotification(notification);
    this.notifySubscribers(notification);

    return notification;
  }

  // Send health alert
  async sendHealthAlert(
    condition: string,
    recommendation: string,
    severity: 'low' | 'medium' | 'high'
  ): Promise<HelpNotification> {
    const priorityMap = {
      low: 'low' as const,
      medium: 'medium' as const,
      high: 'high' as const,
    };

    const notification: HelpNotification = {
      id: this.generateId(),
      type: 'health-alert',
      category: 'medical-reports',
      title: `🏥 ${condition}`,
      message: recommendation,
      actionText: severity === 'high' ? 'See Details' : 'Learn More',
      actionScreen: 'Help',
      timestamp: Date.now(),
      read: false,
      priority: priorityMap[severity],
    };

    await this.storeNotification(notification);
    this.notifySubscribers(notification);

    if (severity === 'high') {
      this.showAlert(notification.title, notification.message);
    }

    return notification;
  }

  // Send oil tracking reminder
  async sendOilReminderNotification(
    timeOfDay: 'morning' | 'afternoon' | 'evening'
  ): Promise<HelpNotification> {
    const messageMap = {
      morning: 'Good morning! Plan your oil usage for today. Know your budget before cooking.',
      afternoon: 'Midday check: How much oil have you used so far? Track to stay on goal.',
      evening: 'Evening update: Log remaining meals and check if you\'re on track.',
    };

    const notification: HelpNotification = {
      id: this.generateId(),
      type: 'oil-reminder',
      category: 'oil-tracking',
      title: `⏰ ${timeOfDay === 'morning' ? 'Morning' : timeOfDay === 'afternoon' ? 'Afternoon' : 'Evening'} Oil Check`,
      message: messageMap[timeOfDay],
      actionText: 'Log Oil',
      actionScreen: 'OilTracker',
      timestamp: Date.now(),
      read: false,
      priority: 'medium',
    };

    await this.storeNotification(notification);
    this.notifySubscribers(notification);

    return notification;
  }

  // Send medical report reminder
  async sendMedicalReportReminder(
    lastReportDaysAgo: number
  ): Promise<HelpNotification> {
    const message = lastReportDaysAgo > 365
      ? `Your last medical report was ${Math.floor(lastReportDaysAgo / 365)} year(s) ago. Time for an annual checkup!`
      : `Your last medical report was ${lastReportDaysAgo} days ago. Periodic updates help us refine your recommendations.`;

    const notification: HelpNotification = {
      id: this.generateId(),
      type: 'medical-reminder',
      category: 'medical-reports',
      title: '📋 Update Medical Report',
      message,
      actionText: 'Upload Now',
      actionScreen: 'MedicalReports',
      timestamp: Date.now(),
      read: false,
      priority: lastReportDaysAgo > 365 ? 'high' : 'medium',
    };

    await this.storeNotification(notification);
    this.notifySubscribers(notification);

    if (lastReportDaysAgo > 365) {
      this.showAlert(notification.title, notification.message);
    }

    return notification;
  }

  // Send cooking tip
  async sendCookingTip(
    method: 'deep_fry' | 'shallow_fry' | 'saute' | 'boil'
  ): Promise<HelpNotification> {
    const tipMap = {
      deep_fry: {
        title: '🔥 Deep Fry Tip',
        message: 'Using 25% more oil? Reserve for special occasions. Try saute or boil for daily cooking.',
        actionText: 'Healthier Methods',
      },
      shallow_fry: {
        title: '🍳 Shallow Fry Tip',
        message: 'Using 15% more oil. Even better: Switch to saute for weekday meals.',
        actionText: 'Learn Methods',
      },
      saute: {
        title: '✨ Great Choice!',
        message: 'Saute uses only 5% more oil. Perfect for healthy daily cooking with great taste.',
        actionText: 'View Tips',
      },
      boil: {
        title: '💧 Healthiest!',
        message: 'Boiling uses NO extra oil absorption. Best option for heart health. Keep it up!',
        actionText: 'Learn More',
      },
    };

    const tip = tipMap[method];

    const notification: HelpNotification = {
      id: this.generateId(),
      type: 'cooking-tip',
      category: 'cooking-methods',
      title: tip.title,
      message: tip.message,
      actionText: tip.actionText,
      actionScreen: 'Help',
      timestamp: Date.now(),
      read: false,
      priority: 'low',
    };

    await this.storeNotification(notification);
    this.notifySubscribers(notification);

    return notification;
  }

  // Send IoT setup guide
  async sendIoTGuideNotification(): Promise<HelpNotification> {
    const notification: HelpNotification = {
      id: this.generateId(),
      type: 'iot-guide',
      category: 'iot-tracker',
      title: '🔌 Setup Smart Scale',
      message: 'Connect your WiFi scale for automatic, precise oil measurements. 5-minute setup.',
      actionText: 'Setup Guide',
      actionScreen: 'Help',
      timestamp: Date.now(),
      read: false,
      priority: 'medium',
    };

    await this.storeNotification(notification);
    this.notifySubscribers(notification);

    return notification;
  }

  // Send calculation help
  async sendCalculationHelpNotification(
    topic: 'budget' | 'calories' | 'tdee' | 'harm-score'
  ): Promise<HelpNotification> {
    const topicMap = {
      budget: {
        title: '💰 Your Daily Oil Budget',
        message: 'Calculate: (BMR × Activity Factor) × 0.07. Example: 2600 × 0.07 = 182 kcal ≈ 22ml/day',
      },
      calories: {
        title: '📊 Oil Calorie Calculation',
        message: 'All oils = 9 kcal/gram. Quality multiplier adjusts based on fatty acid profile.',
      },
      tdee: {
        title: '⚡ TDEE Formula',
        message: 'Total Daily Energy = BMR × Activity Factor. BMR uses Mifflin-St Jeor equation.',
      },
      'harm-score': {
        title: '⚠️ Harm Score',
        message: 'Score = (SFA% × 0.35) + (TFA% × 0.40) + (PUFA% × 0.25). Shows health impact.',
      },
    };

    const data = topicMap[topic];

    const notification: HelpNotification = {
      id: this.generateId(),
      type: 'calculation-help',
      category: 'calculations',
      title: data.title,
      message: data.message,
      actionText: 'View Formula',
      actionScreen: 'Help',
      timestamp: Date.now(),
      read: false,
      priority: 'low',
    };

    await this.storeNotification(notification);
    this.notifySubscribers(notification);

    return notification;
  }

  // Get preferences
  async getPreferences(): Promise<any> {
    try {
      const prefs = await AsyncStorage.getItem(HELP_PREFERENCES_KEY);
      return prefs ? JSON.parse(prefs) : {
        enableHelpTips: true,
        enableReminders: true,
        enableHealthAlerts: true,
        tipFrequency: 'daily', // daily, weekly, never
      };
    } catch (error) {
      console.error('[HelpNotificationsService] Failed to get preferences:', error);
      return {};
    }
  }

  // Update preferences
  async updatePreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem(HELP_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('[HelpNotificationsService] Failed to save preferences:', error);
    }
  }

  // Swasthnani Message Handler
  async sendSwasthnaniMessage(swasthnaniMessage: any): Promise<HelpNotification> {
    try {
      const notification: HelpNotification = {
        id: Date.now().toString(),
        type: 'swasthnani-message',
        category: 'oil-tracking',
        title: swasthnaniMessage.title || 'Swasthnani Says',
        message: swasthnaniMessage.message || '',
        actionText: swasthnaniMessage.actionText,
        actionScreen: swasthnaniMessage.actionScreen,
        timestamp: Date.now(),
        read: false,
        priority: this.getTonePriority(swasthnaniMessage.tone),
      };

      await this.storeNotification(notification);
      this.notifySubscribers(notification);

      return notification;
    } catch (error) {
      console.error('[HelpNotificationsService] Failed to send Swasthnani message:', error);
      throw error;
    }
  }

  // Convert tone to priority
  private getTonePriority(tone: string): 'low' | 'medium' | 'high' {
    const priorities: any = {
      'positive': 'low',
      'caution': 'medium',
      'warning': 'high',
      'critical': 'high',
      'neutral': 'low',
    };
    return priorities[tone] || 'low';
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HELP_NOTIFICATIONS_KEY);
    } catch (error) {
      console.error('[HelpNotificationsService] Failed to clear:', error);
    }
  }

  // Show native alert
  private showAlert(title: string, message: string) {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }
}

// Export singleton instance
export const helpNotificationsService = new HelpNotificationsService();
export default helpNotificationsService;
