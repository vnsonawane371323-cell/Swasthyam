import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

/**
 * SwasthnaniMessageCard Component
 * Displays personalized warm messages from Swasthnani after meal logging
 * Features:
 * - Animated entrance/exit
 * - Priority-based styling
 * - Action buttons for navigation
 * - Health warnings if needed
 * - Sustainability tips
 */
export const SwasthnaniMessageCard = ({ 
  message, 
  onDismiss, 
  onAction,
  visible = true,
  autoHideDelay = 8000 
}) => {
  const { isDark } = useTheme();
  const [slideAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after delay
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss?.());
  };

  if (!message || !visible) return null;

  const getToneColor = (tone) => {
    const colors = {
      positive: '#4CAF50',
      caution: '#FF9800',
      warning: '#FF6B6B',
      critical: '#D32F2F',
      neutral: '#2196F3',
    };
    return colors[tone] || colors.positive;
  };

  const getToneBackgroundColor = (tone) => {
    const bgColors = {
      positive: isDark ? '#1B5E20' : '#E8F5E9',
      caution: isDark ? '#E65100' : '#FFF3E0',
      warning: isDark ? '#B71C1C' : '#FFEBEE',
      critical: isDark ? '#7F0000' : '#FFCDD2',
      neutral: isDark ? '#0D47A1' : '#E3F2FD',
    };
    return bgColors[tone] || bgColors.positive;
  };

  const slideTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  const toneColor = getToneColor(message.tone || 'positive');
  const bgColor = getToneBackgroundColor(message.tone || 'positive');

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideTransform }],
        },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          activeOpacity={0.95}
          style={[
            styles.card,
            {
              backgroundColor: bgColor,
              borderLeftColor: toneColor,
            },
          ]}
        >
          {/* Header with emoji and title */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.emoji}>{message.emoji || '💚'}</Text>
              <View style={styles.titleText}>
                <Text
                  style={[
                    styles.title,
                    { color: isDark ? '#fff' : '#333' },
                  ]}
                >
                  {message.title || 'Swasthnani Says'}
                </Text>
                {message.subtext && (
                  <Text
                    style={[
                      styles.subtext,
                      { color: isDark ? '#bbb' : '#666' },
                    ]}
                    numberOfLines={1}
                  >
                    {message.subtext}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={handleDismiss}>
              <Ionicons
                name="close-circle"
                size={24}
                color={isDark ? '#999' : '#999'}
              />
            </TouchableOpacity>
          </View>

          {/* Main message */}
          <View style={styles.messageSection}>
            <Text
              style={[
                styles.message,
                { color: isDark ? '#e0e0e0' : '#444' },
              ]}
            >
              {message.message}
            </Text>
          </View>

          {/* Encouragement */}
          {message.encouragement && (
            <View style={styles.encouragementSection}>
              <Ionicons
                name="star"
                size={16}
                color={toneColor}
                style={styles.encouragementIcon}
              />
              <Text
                style={[
                  styles.encouragement,
                  { color: toneColor },
                ]}
              >
                {message.encouragement}
              </Text>
            </View>
          )}

          {/* Health warning if applicable */}
          {message.healthWarning && (
            <View
              style={[
                styles.warningSection,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 152, 0, 0.1)'
                    : 'rgba(255, 193, 7, 0.1)',
                  borderColor: '#FFC107',
                },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={16}
                color="#FF9800"
                style={styles.warningIcon}
              />
              <Text
                style={[
                  styles.warningText,
                  { color: isDark ? '#FFB74D' : '#E65100' },
                ]}
              >
                {message.healthWarning.message}
              </Text>
            </View>
          )}

          {/* Personalized note if applicable */}
          {message.personalizedNote && (
            <View style={styles.noteSection}>
              <Ionicons
                name="heart"
                size={16}
                color={toneColor}
                style={styles.noteIcon}
              />
              <Text
                style={[
                  styles.note,
                  { color: toneColor },
                ]}
              >
                {message.personalizedNote}
              </Text>
            </View>
          )}

          {/* Sustainability tip if applicable */}
          {message.sustainabilityTip && (
            <View
              style={[
                styles.sustainabilitySection,
                {
                  backgroundColor: isDark
                    ? 'rgba(76, 175, 80, 0.1)'
                    : 'rgba(200, 230, 201, 0.5)',
                  borderColor: '#4CAF50',
                },
              ]}
            >
              <Ionicons
                name="leaf"
                size={16}
                color="#4CAF50"
                style={styles.sustainIcon}
              />
              <Text
                style={[
                  styles.sustainText,
                  { color: isDark ? '#81C784' : '#1B5E20' },
                ]}
              >
                {message.sustainabilityTip.message}
              </Text>
            </View>
          )}

          {/* Action buttons */}
          {(message.actionText || message.actionButton) && (
            <View style={styles.actionSection}>
              {message.actionText && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: toneColor },
                  ]}
                  onPress={() => {
                    onAction?.(message.actionScreen);
                    handleDismiss();
                  }}
                >
                  <Ionicons
                    name="open"
                    size={16}
                    color="#fff"
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionButtonText}>
                    {message.actionText}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor: isDark
                      ? '#444'
                      : '#f0f0f0',
                  },
                ]}
                onPress={handleDismiss}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: isDark ? '#fff' : '#333' },
                  ]}
                >
                  Got it
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </Animated.View>
  );
};

/**
 * Inline Swasthnani Message - Compact version for embedding in screens
 */
export const SwasthnaniMessageInline = ({ message }) => {
  const { isDark } = useTheme();

  if (!message) return null;

  const getToneColor = (tone) => {
    const colors = {
      positive: '#4CAF50',
      caution: '#FF9800',
      warning: '#FF6B6B',
      critical: '#D32F2F',
    };
    return colors[tone] || colors.positive;
  };

  const toneColor = getToneColor(message.tone || 'positive');

  return (
    <View
      style={[
        styles.inlineContainer,
        {
          backgroundColor: isDark ? '#333' : '#f9f9f9',
          borderLeftColor: toneColor,
        },
      ]}
    >
      <View style={styles.inlineHeader}>
        <Text style={styles.inlineEmoji}>{message.emoji || '💚'}</Text>
        <Text
          style={[
            styles.inlineTitle,
            { color: isDark ? '#fff' : '#333' },
          ]}
        >
          {message.title}
        </Text>
      </View>
      {message.message && (
        <Text
          style={[
            styles.inlineMessage,
            { color: isDark ? '#ddd' : '#666' },
          ]}
        >
          {message.message}
        </Text>
      )}
      {message.subtext && (
        <Text
          style={[
            styles.inlineSubtext,
            { color: isDark ? '#999' : '#999' },
          ]}
        >
          {message.subtext}
        </Text>
      )}
    </View>
  );
};

/**
 * Swasthnani Avatar Badge - Shows Swasthnani with message bubble
 */
export const SwasthnaniAvatarBubble = ({ 
  message, 
  onDismiss,
  size = 'medium' 
}) => {
  const { isDark } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const sizeConfig = {
    small: { avatar: 40, bubble: 12, message: 12 },
    medium: { avatar: 60, bubble: 14, message: 13 },
    large: { avatar: 80, bubble: 16, message: 14 },
  };

  const config = sizeConfig[size];

  return (
    <Animated.View
      style={[
        styles.avatarBubbleContainer,
        { opacity: fadeAnim },
      ]}
    >
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          {
            width: config.avatar,
            height: config.avatar,
            backgroundColor: isDark ? '#FF6B6B' : '#FF9800',
          },
        ]}
      >
        <Text style={{ fontSize: config.avatar * 0.6 }}>🧘</Text>
      </View>

      {/* Message bubble */}
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isDark ? '#333' : '#fff',
            borderColor: isDark ? '#666' : '#ddd',
          },
        ]}
      >
        <Text
          style={[
            styles.bubbleMessage,
            { fontSize: config.message, color: isDark ? '#fff' : '#333' },
          ]}
        >
          {message.message || message.title}
        </Text>
        {onDismiss && (
          <TouchableOpacity
            style={styles.bubbleClose}
            onPress={onDismiss}
          >
            <Ionicons name="close" size={14} color="#999" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    borderLeftWidth: 6,
    borderRadius: 12,
    margin: 16,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
    marginTop: 4,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 12,
    marginBottom: 4,
  },
  messageSection: {
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  encouragementSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
  },
  encouragementIcon: {
    marginRight: 8,
  },
  encouragement: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
  },
  noteIcon: {
    marginRight: 8,
  },
  note: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  sustainabilitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  sustainIcon: {
    marginRight: 8,
  },
  sustainText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  actionSection: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Inline styles
  inlineContainer: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inlineEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  inlineTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  inlineMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  inlineSubtext: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // Avatar bubble styles
  avatarBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  messageBubble: {
    maxWidth: width - 80,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bubbleMessage: {
    flex: 1,
    fontWeight: '500',
  },
  bubbleClose: {
    marginLeft: 8,
  },
});

export default SwasthnaniMessageCard;
