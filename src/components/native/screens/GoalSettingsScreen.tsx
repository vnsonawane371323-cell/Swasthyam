import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GoalCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  currentValue: string;
  targetValue: string;
  unit: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  onEditTarget: () => void;
}

function GoalCard({
  icon,
  title,
  currentValue,
  targetValue,
  unit,
  enabled,
  onToggle,
  onEditTarget,
}: GoalCardProps) {
  return (
    <View style={[styles.goalCard, !enabled && styles.goalCardDisabled]}>
      <View style={styles.goalHeader}>
        <View style={styles.goalInfo}>
          <View style={[styles.goalIcon, !enabled && styles.goalIconDisabled]}>
            <Ionicons name={icon} size={24} color={enabled ? '#1b4a5a' : '#9ca3af'} />
          </View>
          <Text style={[styles.goalTitle, !enabled && styles.goalTitleDisabled]}>
            {title}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#d1d5db', true: '#07A996' }}
          thumbColor="#ffffff"
        />
      </View>
      
      {enabled && (
        <View style={styles.goalDetails}>
          <View style={styles.goalValueContainer}>
            <Text style={styles.goalLabel}>Current</Text>
            <Text style={styles.goalValue}>{currentValue} {unit}</Text>
          </View>
          <View style={styles.goalValueContainer}>
            <Text style={styles.goalLabel}>Target</Text>
            <TouchableOpacity 
              style={styles.targetButton}
              onPress={onEditTarget}
            >
              <Text style={styles.targetValue}>{targetValue} {unit}</Text>
              <Ionicons name="pencil" size={14} color="#07A996" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export function GoalSettingsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [goals, setGoals] = useState({
    dailyOil: { enabled: true, current: '35', target: '30' },
    weeklyReduction: { enabled: true, current: '10', target: '15' },
    monthlyBudget: { enabled: false, current: '500', target: '400' },
    recipesCooked: { enabled: true, current: '12', target: '20' },
    challengesCompleted: { enabled: true, current: '3', target: '5' },
  });

  const [reminderTime, setReminderTime] = useState('09:00');
  const [weeklyReport, setWeeklyReport] = useState(true);

  const toggleGoal = (goalKey: string) => {
    setGoals(prev => ({
      ...prev,
      [goalKey]: {
        ...prev[goalKey as keyof typeof prev],
        enabled: !prev[goalKey as keyof typeof prev].enabled,
      },
    }));
  };

  const handleEditTarget = (goalKey: string, unit: string) => {
    Alert.prompt(
      'Edit Target',
      `Enter new target value (${unit})`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (value: string | undefined) => {
            if (value) {
              setGoals(prev => ({
                ...prev,
                [goalKey]: {
                  ...prev[goalKey as keyof typeof prev],
                  target: value,
                },
              }));
            }
          },
        },
      ],
      'plain-text',
      goals[goalKey as keyof typeof goals].target
    );
  };

  const handleSave = () => {
    Alert.alert('Success', 'Goal settings saved successfully');
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1b4a5a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Settings</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Health Goals Section */}
        <Text style={styles.sectionTitle}>Health Goals</Text>
        
        <GoalCard
          icon="water-outline"
          title="Daily Oil Intake"
          currentValue={goals.dailyOil.current}
          targetValue={goals.dailyOil.target}
          unit="ml"
          enabled={goals.dailyOil.enabled}
          onToggle={() => toggleGoal('dailyOil')}
          onEditTarget={() => handleEditTarget('dailyOil', 'ml')}
        />
        
        <GoalCard
          icon="trending-down-outline"
          title="Weekly Reduction"
          currentValue={goals.weeklyReduction.current}
          targetValue={goals.weeklyReduction.target}
          unit="%"
          enabled={goals.weeklyReduction.enabled}
          onToggle={() => toggleGoal('weeklyReduction')}
          onEditTarget={() => handleEditTarget('weeklyReduction', '%')}
        />
        
        <GoalCard
          icon="wallet-outline"
          title="Monthly Oil Budget"
          currentValue={goals.monthlyBudget.current}
          targetValue={goals.monthlyBudget.target}
          unit="₹"
          enabled={goals.monthlyBudget.enabled}
          onToggle={() => toggleGoal('monthlyBudget')}
          onEditTarget={() => handleEditTarget('monthlyBudget', '₹')}
        />

        {/* Activity Goals Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Activity Goals</Text>
        
        <GoalCard
          icon="restaurant-outline"
          title="Recipes Cooked"
          currentValue={goals.recipesCooked.current}
          targetValue={goals.recipesCooked.target}
          unit="recipes"
          enabled={goals.recipesCooked.enabled}
          onToggle={() => toggleGoal('recipesCooked')}
          onEditTarget={() => handleEditTarget('recipesCooked', 'recipes')}
        />
        
        <GoalCard
          icon="trophy-outline"
          title="Challenges Completed"
          currentValue={goals.challengesCompleted.current}
          targetValue={goals.challengesCompleted.target}
          unit="challenges"
          enabled={goals.challengesCompleted.enabled}
          onToggle={() => toggleGoal('challengesCompleted')}
          onEditTarget={() => handleEditTarget('challengesCompleted', 'challenges')}
        />

        {/* Reminders Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Reminders</Text>
        
        <View style={styles.reminderCard}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderInfo}>
              <Ionicons name="alarm-outline" size={22} color="#1b4a5a" />
              <Text style={styles.reminderText}>Daily Reminder</Text>
            </View>
            <TouchableOpacity style={styles.timeButton}>
              <Text style={styles.timeText}>{reminderTime}</Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.reminderRow, { borderTopWidth: 1, borderTopColor: '#f3f4f6' }]}>
            <View style={styles.reminderInfo}>
              <Ionicons name="document-text-outline" size={22} color="#1b4a5a" />
              <Text style={styles.reminderText}>Weekly Progress Report</Text>
            </View>
            <Switch
              value={weeklyReport}
              onValueChange={setWeeklyReport}
              trackColor={{ false: '#d1d5db', true: '#07A996' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Reset Section */}
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => Alert.alert('Reset', 'Reset all goals to default values?')}
        >
          <Ionicons name="refresh-outline" size={20} color="#ef4444" />
          <Text style={styles.resetText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#07A996',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  goalCardDisabled: {
    opacity: 0.7,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalIconDisabled: {
    backgroundColor: '#f3f4f6',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  goalTitleDisabled: {
    color: '#9ca3af',
  },
  goalDetails: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  goalValueContainer: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  targetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#07A996',
  },
  reminderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderText: {
    fontSize: 15,
    color: '#1f2937',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    padding: 16,
  },
  resetText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '500',
  },
});

export default GoalSettingsScreen;
