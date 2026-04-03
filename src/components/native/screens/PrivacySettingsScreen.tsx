import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Button } from '../Button';

interface PrivacySettingsScreenProps {
  navigation: any;
}

export function PrivacySettingsScreen({ navigation }: PrivacySettingsScreenProps) {
  const [settings, setSettings] = useState({
    shareAnonymousData: true,
    publicProfile: false,
    showInLeaderboard: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <View style={styles.titleRow}>
                <Ionicons name="shield-checkmark" size={24} color="#fff" />
                <Text style={styles.headerTitle}>Privacy & Settings</Text>
              </View>
              <Text style={styles.headerSubtitle}>Manage your data preferences</Text>
            </View>
          </View>
        </View>
        <View style={styles.content}>
          <Card>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Data Sharing</Text>
            </View>
            {[
              { key: 'shareAnonymousData', label: 'Share Anonymous Data', desc: 'Help public health research' },
              { key: 'publicProfile', label: 'Public Profile', desc: 'Visible to other users' },
              { key: 'showInLeaderboard', label: 'Show in Leaderboard', desc: 'Visible in challenge rankings' },
            ].map(item => (
              <View key={item.key} style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDesc}>{item.desc}</Text>
                </View>
                <Switch value={settings[item.key as keyof typeof settings]} onValueChange={(val) => setSettings({...settings, [item.key]: val})} />
              </View>
            ))}
          </Card>
          <Card>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications" size={20} color="#f97316" />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Weekly reports & updates' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Daily reminders & tips' },
              { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Important alerts only' },
            ].map(item => (
              <View key={item.key} style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDesc}>{item.desc}</Text>
                </View>
                <Switch value={settings[item.key as keyof typeof settings]} onValueChange={(val) => setSettings({...settings, [item.key]: val})} />
              </View>
            ))}
          </Card>
          <Card style={styles.dangerCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trash" size={20} color="#ef4444" />
              <Text style={styles.dangerTitle}>Danger Zone</Text>
            </View>
            <Button onPress={() => {}} variant="outline" style={styles.deleteButton}>
              <Text style={{color: '#dc2626', fontSize: 14, fontWeight: '500'}}>Delete Account</Text>
            </Button>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#6b7280', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#d1d5db', marginTop: 2 },
  content: { padding: 16, gap: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  settingInfo: { flex: 1, marginRight: 12 },
  settingLabel: { fontSize: 16, fontWeight: '500', color: '#111827', marginBottom: 4 },
  settingDesc: { fontSize: 12, color: '#6b7280' },
  dangerCard: { borderColor: '#fecaca' },
  dangerTitle: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
  deleteButton: { borderColor: '#fecaca' },
});
