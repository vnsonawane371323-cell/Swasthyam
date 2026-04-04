import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Notification types
export type NotificationType = 
  | 'oil-exceeded' 
  | 'oil-warning' 
  | 'oil-limit'
  | 'ai-tip' 
  | 'challenge' 
  | 'recipe' 
  | 'milestone' 
  | 'group' 
  | 'reminder'
  | 'education';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  data?: {
    screen?: string;
    moduleId?: string;
    oilAmount?: number;
    goalAmount?: number;
  };
}

// StoredNotification for NotificationsScreen compatibility
export interface StoredNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Suggested learning modules for different scenarios
export const LEARNING_MODULES = {
  oilExceeded: [
    {
      id: 'healthy-oil-guide',
      title: 'Understanding Healthy Oil Usage',
      description: 'Learn the science behind daily oil limits and heart health',
      duration: '5 min',
      screen: 'EducationHub',
    },
    {
      id: 'low-oil-cooking',
      title: 'Low-Oil Cooking Techniques',
      description: 'Master air frying, steaming, and grilling methods',
      duration: '8 min',
      screen: 'EducationHub',
    },
    {
      id: 'oil-alternatives',
      title: 'Healthier Oil Alternatives',
      description: 'Discover which oils are best for different cooking methods',
      duration: '6 min',
      screen: 'EducationHub',
    },
  ],
};

const NOTIFICATIONS_STORAGE_KEY = '@swasthtel_notifications';

class NotificationService {
  private notificationCallbacks: Array<(notification: AppNotification) => void> = [];

  async initializeLocalNotifications(): Promise<void> {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1b4a5a',
          sound: 'default',
        });
      }

      const settings = await Notifications.getPermissionsAsync();
      if (settings.status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    } catch (error) {
      console.error('[NotificationService] Failed to initialize local notifications:', error);
    }
  }

  private async sendLocalNotification(notification: AppNotification): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          sound: true,
          data: notification.data || {},
        },
        trigger: null,
      });
    } catch (error) {
      console.error('[NotificationService] Failed to send local notification:', error);
    }
  }

  private isSameDay(isoTimeA: string, isoTimeB: string): boolean {
    const a = new Date(isoTimeA);
    const b = new Date(isoTimeB);

    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return false;

    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  // Subscribe to notifications
  subscribe(callback: (notification: AppNotification) => void) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers
  private notifySubscribers(notification: AppNotification) {
    this.notificationCallbacks.forEach(callback => callback(notification));
  }

  // Generate unique ID
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current timestamp
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  // Store notification
  async storeNotification(notification: AppNotification): Promise<void> {
    try {
      const stored = await this.getStoredNotifications();
      const updated = [notification, ...stored].slice(0, 50); // Keep last 50
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[NotificationService] Failed to store notification:', error);
    }
  }

  // Get stored notifications
  async getStoredNotifications(): Promise<AppNotification[]> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[NotificationService] Failed to get notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const stored = await this.getStoredNotifications();
      const updated = stored.map(n => 
        n.id === notificationId ? { ...n, unread: false } : n
      );
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[NotificationService] Failed to mark as read:', error);
    }
  }

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    try {
      const stored = await this.getStoredNotifications();
      const updated = stored.map(n => ({ ...n, unread: false }));
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[NotificationService] Failed to mark all as read:', error);
    }
  }

  // Clear all notifications
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } catch (error) {
      console.error('[NotificationService] Failed to clear notifications:', error);
    }
  }

  // Check oil consumption and trigger notifications if exceeded
  async checkOilExceeded(
    currentAmount: number,
    goalAmount: number,
    showAlert: boolean = true
  ): Promise<{ exceeded: boolean; notification?: AppNotification }> {
    if (!Number.isFinite(currentAmount) || !Number.isFinite(goalAmount) || goalAmount <= 0) {
      return { exceeded: false };
    }

    const existingNotifications = await this.getStoredNotifications();
    const nowIso = this.getTimestamp();
    const exceeded = currentAmount > goalAmount;
    const percentOver = Math.round(((currentAmount - goalAmount) / goalAmount) * 100);

    if (exceeded) {
      const alreadySentToday = existingNotifications.some(
        n => n.type === 'oil-exceeded' && this.isSameDay(n.time, nowIso)
      );

      if (alreadySentToday) {
        return { exceeded: true };
      }

      // Get a random learning module suggestion
      const modules = LEARNING_MODULES.oilExceeded;
      const suggestedModule = modules[Math.floor(Math.random() * modules.length)];

      const notification: AppNotification = {
        id: this.generateId(),
        type: 'oil-exceeded',
        title: '⚠️ Daily Oil Limit Exceeded!',
        message: `You've consumed ${currentAmount}ml oil today, which is ${percentOver}% over your ${goalAmount}ml goal. Watch "${suggestedModule.title}" to learn healthier cooking methods.`,
        time: this.getTimestamp(),
        unread: true,
        data: {
          screen: suggestedModule.screen,
          moduleId: suggestedModule.id,
          oilAmount: currentAmount,
          goalAmount: goalAmount,
        },
      };

      // Store the notification
      await this.storeNotification(notification);

      // Notify subscribers
      this.notifySubscribers(notification);

      // Show native OS notification banner/list entry
      await this.sendLocalNotification(notification);

      // Show alert if requested
      if (showAlert) {
        this.showOilExceededAlert(currentAmount, goalAmount, suggestedModule);
      }

      return { exceeded: true, notification };
    }

    // Check for warning (80% of goal)
    const warningThreshold = goalAmount * 0.8;
    if (currentAmount >= warningThreshold && currentAmount <= goalAmount) {
      const warningAlreadySentToday = existingNotifications.some(
        n => n.type === 'oil-warning' && this.isSameDay(n.time, nowIso)
      );

      if (warningAlreadySentToday) {
        return { exceeded: false };
      }

      const percentUsed = Math.round((currentAmount / goalAmount) * 100);
      
      const notification: AppNotification = {
        id: this.generateId(),
        type: 'oil-warning',
        title: '⚡ Approaching Oil Limit',
        message: `You've used ${percentUsed}% of your daily oil limit (${currentAmount}ml / ${goalAmount}ml). Try to be mindful with remaining meals.`,
        time: this.getTimestamp(),
        unread: true,
        data: {
          oilAmount: currentAmount,
          goalAmount: goalAmount,
        },
      };

      await this.storeNotification(notification);
      this.notifySubscribers(notification);
      await this.sendLocalNotification(notification);
    }

    return { exceeded: false };
  }

  // Show oil exceeded alert with learning module suggestion
  private showOilExceededAlert(
    currentAmount: number,
    goalAmount: number,
    suggestedModule: { id: string; title: string; description: string; duration: string }
  ) {
    const percentOver = Math.round(((currentAmount - goalAmount) / goalAmount) * 100);

    Alert.alert(
      '⚠️ Oil Limit Exceeded!',
      `You've consumed ${currentAmount}ml today, which is ${percentOver}% over your ${goalAmount}ml daily goal.\n\n📚 Suggested Learning:\n"${suggestedModule.title}"\n${suggestedModule.description}\n⏱️ ${suggestedModule.duration}`,
      [
        {
          text: 'Dismiss',
          style: 'cancel',
        },
        {
          text: 'Watch Now',
          onPress: () => {
            // This will be handled by the component that shows the alert
            console.log('[NotificationService] User wants to watch:', suggestedModule.id);
          },
        },
      ],
      { cancelable: true }
    );
  }

  // Create a custom notification
  async createNotification(
    type: NotificationType,
    title: string,
    message: string,
    data?: AppNotification['data']
  ): Promise<AppNotification> {
    const notification: AppNotification = {
      id: this.generateId(),
      type,
      title,
      message,
      time: this.getTimestamp(),
      unread: true,
      data,
    };

    await this.storeNotification(notification);
    this.notifySubscribers(notification);
    await this.sendLocalNotification(notification);

    return notification;
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const notifications = await this.getStoredNotifications();
    return notifications.filter(n => n.unread).length;
  }

  // Get notifications in StoredNotification format for NotificationsScreen
  async getNotificationsForScreen(): Promise<StoredNotification[]> {
    const notifications = await this.getStoredNotifications();
    return notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      timestamp: new Date(n.time).getTime(),
      read: !n.unread,
    }));
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    await this.clearAll();
  }

  // Check and notify oil excess - convenience method with navigation support
  async checkAndNotifyOilExcess(
    consumedKcal: number,
    goalKcal: number,
    navigation?: any
  ): Promise<boolean> {
    // Convert kcal to ml (roughly 9 kcal per ml of oil)
    const consumedMl = Math.round(consumedKcal / 9);
    const goalMl = Math.round(goalKcal / 9);
    
    const result = await this.checkOilExceeded(consumedMl, goalMl, false);
    
    if (result.exceeded && navigation) {
      const modules = LEARNING_MODULES.oilExceeded;
      const suggestedModule = modules[Math.floor(Math.random() * modules.length)];
      const percentOver = Math.round(((consumedMl - goalMl) / goalMl) * 100);
      
      Alert.alert(
        '⚠️ Daily Oil Limit Exceeded!',
        `You've consumed ${consumedMl}ml oil today (${percentOver}% over your ${goalMl}ml goal).\n\n📚 Learn healthier cooking methods to reduce oil usage.`,
        [
          { text: 'Dismiss', style: 'cancel' },
          {
            text: '📖 View Learning Module',
            onPress: () => {
              try {
                navigation.navigate('EducationHub');
              } catch (e) {
                console.log('[NotificationService] Navigation error:', e);
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
    
    return result.exceeded;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
