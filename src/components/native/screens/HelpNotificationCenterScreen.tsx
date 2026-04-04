import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { helpNotificationsService, HelpNotification } from '../../services/helpNotificationsService';

type FilterType = 'all' | 'unread' | 'help-tip' | 'learning-reminder' | 'health-alert' | 'oil-reminder' | 'medical-reminder';

export function HelpNotificationCenterScreen({ navigation }: { navigation: any }) {
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState<HelpNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<HelpNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    },
    header: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#444' : '#e0e0e0',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: isDarkMode ? '#aaa' : '#666',
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#444' : '#e0e0e0',
    },
    filterButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
    },
    filterButtonActive: {
      backgroundColor: '#4CAF50',
    },
    filterText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDarkMode ? '#aaa' : '#666',
    },
    filterTextActive: {
      color: '#fff',
    },
    notificationItem: {
      marginHorizontal: 12,
      marginVertical: 8,
      borderRadius: 12,
      padding: 12,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      borderLeftWidth: 4,
      borderLeftColor: '#4CAF50',
    },
    notificationItemUnread: {
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f9f9f9',
      borderLeftColor: '#FF9800',
    },
    notificationItemHighPriority: {
      borderLeftColor: '#f44336',
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    notificationTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
      flex: 1,
    },
    notificationMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: isDarkMode ? '#4a4a4a' : '#e8f5e9',
    },
    priorityText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#4CAF50',
    },
    priorityTextHigh: {
      color: '#f44336',
    },
    notificationMessage: {
      fontSize: 13,
      color: isDarkMode ? '#ccc' : '#555',
      lineHeight: 20,
      marginBottom: 10,
    },
    notificationFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    timestamp: {
      fontSize: 12,
      color: isDarkMode ? '#888' : '#999',
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: '#4CAF50',
      borderRadius: 6,
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 30,
    },
    emptyStateIcon: {
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#aaa' : '#999',
      textAlign: 'center',
      marginBottom: 8,
    },
    emptyStateSubtext: {
      fontSize: 13,
      color: isDarkMode ? '#777' : '#bbb',
      textAlign: 'center',
    },
    actionBar: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#444' : '#e0e0e0',
      gap: 8,
    },
    actionBarButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f5f5f5',
    },
    actionBarButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDarkMode ? '#aaa' : '#666',
    },
  });

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
    
    // Subscribe to new notifications
    const unsubscribe = helpNotificationsService.subscribe((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    });

    return unsubscribe;
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilter();
  }, [notifications, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notifs = await helpNotificationsService.getStoredNotifications();
      setNotifications(notifs);
      
      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = notifications;

    if (filter === 'unread') {
      filtered = notifications.filter(n => !n.read);
    } else if (filter !== 'all') {
      filtered = notifications.filter(n => n.type === filter);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await helpNotificationsService.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await helpNotificationsService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = async () => {
    await helpNotificationsService.clearAllNotifications();
    setNotifications([]);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'help-tip': 'bulb',
      'learning-reminder': 'book',
      'health-alert': 'alert-circle',
      'oil-reminder': 'hourglass',
      'medical-reminder': 'medical',
      'cooking-tip': 'flame',
      'iot-guide': 'wifi',
      'calculation-help': 'calculator',
    };
    return iconMap[type] || 'notifications';
  };

  const renderNotificationItem = ({ item }: { item: HelpNotification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.notificationItemUnread,
        item.priority === 'high' && styles.notificationItemHighPriority,
      ]}
      onPress={() => !item.read && handleMarkAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons
            name={getTypeIcon(item.type)}
            size={20}
            color={item.priority === 'high' ? '#f44336' : '#4CAF50'}
          />
          <Text style={styles.notificationTitle}>{item.title}</Text>
        </View>
        {!item.read && (
          <View style={{ marginLeft: 8 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#FF9800',
              }}
            />
          </View>
        )}
      </View>

      <Text style={styles.notificationMessage}>{item.message}</Text>

      <View style={styles.notificationFooter}>
        <View>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={styles.priorityBadge}>
            <Text style={[
              styles.priorityText,
              item.priority === 'high' && styles.priorityTextHigh,
            ]}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
          {item.actionText && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (item.actionScreen) {
                  navigation.navigate(item.actionScreen);
                }
              }}
            >
              <Text style={styles.actionButtonText}>{item.actionText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Tips</Text>
        <Text style={styles.headerSubtitle}>
          {unreadCount > 0 ? `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {['all', 'unread', 'help-tip', 'learning-reminder', 'health-alert', 'oil-reminder'].map(
          (f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                filter === f && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(f as FilterType)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f === 'all' ? '📊 All' : f === 'unread' ? '🔔 Unread' : f === 'help-tip' ? '💡 Tips' : f === 'learning-reminder' ? '📚 Learn' : f === 'health-alert' ? '🏥 Health' : '⏰ Reminders'}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="checkmark-circle"
            size={48}
            color={isDarkMode ? '#555' : '#ddd'}
            style={styles.emptyStateIcon}
          />
          <Text style={styles.emptyStateText}>No notifications</Text>
          <Text style={styles.emptyStateSubtext}>
            {filter === 'unread' ? 'All notifications read' : 'No notifications to show'}
          </Text>
        </View>
      )}

      {notifications.length > 0 && (
        <View style={styles.actionBar}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.actionBarButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.actionBarButtonText}>✓ Mark All Read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBarButton, { backgroundColor: isDarkMode ? '#4a3a3a' : '#ffe8e8' }]}
            onPress={handleClearAll}
          >
            <Text style={[styles.actionBarButtonText, { color: isDarkMode ? '#ff9999' : '#d32f2f' }]}>🗑️ Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
