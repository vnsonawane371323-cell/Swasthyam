import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ThemeMode } from '../../../context/ThemeContext';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
  destructive?: boolean;
  colors: any;
}

function SettingItem({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  rightElement, 
  showArrow = true,
  destructive = false,
  colors
}: SettingItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.borderLight }]} 
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[
        styles.iconContainer, 
        { backgroundColor: destructive ? colors.error + '15' : colors.primary + '15' }
      ]}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={destructive ? colors.error : colors.primary} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: destructive ? colors.error : colors.text }]}>
          {title}
        </Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightElement || (showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      ))}
    </TouchableOpacity>
  );
}

function SettingSection({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>{children}</View>
    </View>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  const handleThemeChange = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  const handleThemeSelect = () => {
    Alert.alert(
      'Theme',
      'Choose your preferred theme',
      [
        { text: 'Light', onPress: () => setThemeMode('light') },
        { text: 'Dark', onPress: () => setThemeMode('dark') },
        { text: 'System', onPress: () => setThemeMode('system') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache? This will not delete your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared successfully') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Handle account deletion
          } 
        },
      ]
    );
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Section */}
        <SettingSection title="Account" colors={colors}>
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => navigation.navigate('EditProfile')}
            colors={colors}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy Settings"
            subtitle="Manage your privacy preferences"
            onPress={() => navigation.navigate('PrivacySettings')}
            colors={colors}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => {}}
            colors={colors}
          />
        </SettingSection>

        {/* Preferences Section */}
        <SettingSection title="Preferences" colors={colors}>
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive daily reminders and updates"
            showArrow={false}
            colors={colors}
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle={`Theme: ${getThemeLabel()}`}
            showArrow={false}
            colors={colors}
            rightElement={
              <View style={styles.themeControl}>
                <TouchableOpacity 
                  onPress={handleThemeSelect}
                  style={[styles.themeButton, { backgroundColor: colors.primary + '15' }]}
                >
                  <Text style={[styles.themeButtonText, { color: colors.primary }]}>{getThemeLabel()}</Text>
                </TouchableOpacity>
                <Switch
                  value={isDark}
                  onValueChange={handleThemeChange}
                  trackColor={{ false: colors.border, true: colors.success }}
                  thumbColor="#ffffff"
                />
              </View>
            }
          />
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Login"
            subtitle="Use fingerprint or face ID"
            showArrow={false}
            colors={colors}
            rightElement={
              <Switch
                value={biometrics}
                onValueChange={setBiometrics}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => {}}
            colors={colors}
          />
        </SettingSection>

        {/* Goals Section */}
        <SettingSection title="Health Goals" colors={colors}>
          <SettingItem
            icon="fitness-outline"
            title="My Goals"
            subtitle="View and manage your health goals"
            onPress={() => navigation.navigate('MyGoals')}
            colors={colors}
          />
          <SettingItem
            icon="analytics-outline"
            title="Goal Settings"
            subtitle="Configure goal tracking preferences"
            onPress={() => navigation.navigate('GoalSettings')}
            colors={colors}
          />
        </SettingSection>

        {/* Devices Section */}
        <SettingSection title="Connected Devices" colors={colors}>
          <SettingItem
            icon="hardware-chip-outline"
            title="Device Management"
            subtitle="Manage your smart kitchen devices"
            onPress={() => navigation.navigate('DeviceManagement')}
            colors={colors}
          />
        </SettingSection>

        {/* Support Section */}
        <SettingSection title="Support" colors={colors}>
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="FAQs and customer support"
            onPress={() => navigation.navigate('HelpSupport')}
            colors={colors}
          />
          <SettingItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => {}}
            colors={colors}
          />
          <SettingItem
            icon="shield-outline"
            title="Privacy Policy"
            onPress={() => {}}
            colors={colors}
          />
          <SettingItem
            icon="star-outline"
            title="Rate the App"
            onPress={() => {}}
            colors={colors}
          />
        </SettingSection>

        {/* Data Section */}
        <SettingSection title="Data" colors={colors}>
          <SettingItem
            icon="cloud-download-outline"
            title="Export Data"
            subtitle="Download your health data"
            onPress={() => {}}
            colors={colors}
          />
          <SettingItem
            icon="trash-outline"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
            colors={colors}
          />
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="Danger Zone" colors={colors}>
          <SettingItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            destructive
            colors={colors}
          />
        </SettingSection>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.textTertiary }]}>SwasthTel v1.0.0</Text>
          <Text style={[styles.appCopyright, { color: colors.textTertiary }]}>© 2025 SwasthTel. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  themeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
  },
});

export default SettingsScreen;
