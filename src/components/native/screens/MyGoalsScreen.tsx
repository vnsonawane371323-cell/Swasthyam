import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Progress } from '../Progress';

interface MyGoalsScreenProps {
  navigation: any;
}

export function MyGoalsScreen({ navigation }: MyGoalsScreenProps) {
  const goals = [
    { id: 1, title: 'Daily Oil Limit', current: 280, target: 350, unit: 'ml', progress: 80, status: 'On Track' },
    { id: 2, title: 'Weekly Oil Limit', current: 1800, target: 2500, unit: 'ml', progress: 72, status: 'On Track' },
    { id: 3, title: 'Monthly Oil Limit', current: 6500, target: 10000, unit: 'ml', progress: 65, status: 'Great!' },
  ];

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
                <Ionicons name="trophy" size={24} color="#fff" />
                <Text style={styles.headerTitle}>My Goals</Text>
              </View>
              <Text style={styles.headerSubtitle}>Track & manage your targets</Text>
            </View>
          </View>
        </View>
        <View style={styles.content}>
          {goals.map(goal => (
            <Card key={goal.id}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Badge variant={goal.progress > 70 ? 'success' : 'warning'}>
                  <Text style={{color: goal.progress > 70 ? '#16a34a' : '#eab308', fontSize: 12}}>{goal.status}</Text>
                </Badge>
              </View>
              <View style={styles.goalValues}>
                <Text style={styles.goalCurrent}>{goal.current}</Text>
                <Text style={styles.goalTarget}> / {goal.target} {goal.unit}</Text>
              </View>
              <Progress value={goal.progress} style={styles.goalProgress} />
              <Text style={styles.goalPercent}>{goal.progress}% of goal achieved</Text>
            </Card>
          ))}
          <Card>
            <Text style={styles.sectionTitle}>Adjust Goals</Text>
            <Text style={styles.adjustText}>Tap on a goal to adjust your targets</Text>
          </Card>
          <Button onPress={() => {}}>
            <Text style={{color: '#fff', fontSize: 14, fontWeight: '500'}}>Save Goals</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  header: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#dbeafe', marginTop: 2 },
  content: { padding: 16, gap: 16 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  goalTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  goalValues: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  goalCurrent: { fontSize: 24, fontWeight: '700', color: '#111827' },
  goalTarget: { fontSize: 16, color: '#6b7280' },
  goalProgress: { marginBottom: 8 },
  goalPercent: { fontSize: 12, color: '#6b7280' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  adjustText: { fontSize: 14, color: '#6b7280' },
});
