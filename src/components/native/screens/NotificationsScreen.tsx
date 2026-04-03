import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { notificationService, StoredNotification } from '../../../services/notificationService';

interface NotificationsScreenProps {
  navigation: any;
}

const getIconName = (type: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    'ai-tip': 'sparkles',
    'challenge': 'trophy',
    'recipe': 'restaurant',
    'milestone': 'heart',
    'group': 'people',
    'reminder': 'alert-circle',
    'oil-limit': 'warning',
  };
  return iconMap[type] || 'notifications';
};

const getGradientColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'ai-tip': '#a855f7',
    'challenge': '#f97316',
    'recipe': '#16a34a',
    'milestone': '#3b82f6',
    'group': '#eab308',
    'reminder': '#6b7280',
    'oil-limit': '#ef4444',
  };
  return colorMap[type] || '#6b7280';
};

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

// Default sample notifications when no dynamic ones exist
const defaultNotifications: StoredNotification[] = [
  {
    id: 'sample-1',
    type: 'ai-tip',
    title: 'AI Cooking Tip',
    message: 'Try steaming vegetables instead of sautéing to reduce oil by 60%',
    timestamp: Date.now() - 3600000, // 1 hour ago
    read: false,
  },
  {
    id: 'sample-2',
    type: 'challenge',
    title: 'Weekly Challenge',
    message: 'Join the "Low Oil Week" challenge and earn bonus points!',
    timestamp: Date.now() - 7200000, // 2 hours ago
    read: false,
  },
  {
    id: 'sample-3',
    type: 'recipe',
    title: 'New Recipe Recommendation',
    message: 'Air-Fried Paneer Tikka - 75% less oil than traditional recipe',
    timestamp: Date.now() - 86400000, // 1 day ago
    read: true,
  },
];

export function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<StoredNotification[]>(defaultNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    const stored = await notificationService.getNotificationsForScreen();
    // Combine stored notifications with defaults, prioritizing stored ones
    const combined = stored.length > 0 ? [...stored, ...defaultNotifications] : defaultNotifications;
    // Sort by timestamp, newest first
    combined.sort((a, b) => b.timestamp - a.timestamp);
    setNotifications(combined);
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: StoredNotification) => {
    // Mark as read
    if (!notification.read && !notification.id.startsWith('sample-')) {
      await notificationService.markAsRead(notification.id);
      await loadNotifications();
    }
    
    // Navigate based on type
    if (notification.type === 'oil-limit') {
      navigation.navigate('EducationHub');
    }
  };

  const handleMarkAllRead = async () => {
    const stored = await notificationService.getStoredNotifications();
    for (const n of stored) {
      if (!n.read) {
        await notificationService.markAsRead(n.id);
      }
    }
    await loadNotifications();
  };

  const handleClearAll = async () => {
    await notificationService.clearAllNotifications();
    setNotifications(defaultNotifications);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>{unreadCount} new updates</Text>
            </View>
          </View>
        </View>

        {/* Notifications List */}
        <View style={styles.content}>
          {notifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <Card 
                style={[
                  styles.notificationCard,
                  !notification.read ? styles.notificationCardUnread : undefined
                ]}
              >
                <View style={styles.notificationContent}>
                  <View style={[
                    styles.notificationIcon,
                    { backgroundColor: getGradientColor(notification.type) }
                  ]}>
                    <Ionicons 
                      name={getIconName(notification.type)} 
                      size={24} 
                      color="#fff" 
                    />
                  </View>
                  <View style={styles.notificationText}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle} numberOfLines={1}>
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <Badge variant="success" style={styles.newBadge}>
                          <Text style={{color: '#16a34a', fontSize: 12}}>New</Text>
                        </Badge>
                      )}
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>{formatTimeAgo(notification.timestamp)}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mark All as Read & Clear */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.markReadButton} 
            activeOpacity={0.7}
            onPress={handleMarkAllRead}
          >
            <Ionicons name="checkmark-done" size={18} color="#15803d" style={{ marginRight: 6 }} />
            <Text style={styles.markReadText}>Mark All as Read</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.markReadButton, styles.clearButton]} 
            activeOpacity={0.7}
            onPress={handleClearAll}
          >
            <Ionicons name="trash-outline" size={18} color="#6b7280" style={{ marginRight: 6 }} />
            <Text style={[styles.markReadText, styles.clearButtonText]}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#dcfce7',
    marginTop: 2,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    marginBottom: 0,
  },
  notificationCardUnread: {
    backgroundColor: '#f0fdf4',
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    gap: 10,
  },
  markReadButton: {
    backgroundColor: '#dcfce7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  markReadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803d',
  },
  clearButton: {
    backgroundColor: '#f3f4f6',
  },
  clearButtonText: {
    color: '#6b7280',
  },
});
