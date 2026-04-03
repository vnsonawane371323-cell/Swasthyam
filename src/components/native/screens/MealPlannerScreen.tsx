import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

interface MealPlannerScreenProps {
  navigation: any;
}

export function MealPlannerScreen({ navigation }: MealPlannerScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const mealPlan = {
    breakfast: { name: 'Steamed Idli', oil: '0g' },
    lunch: { name: 'Grilled Paneer Salad', oil: '5g' },
    snack: { name: 'Air-Fried Samosa', oil: '3g' },
    dinner: { name: 'Baked Fish with Vegetables', oil: '7g' },
  };

  const weeklyProjection = {
    totalOil: '1.2 KG',
    savings: '₹350',
    status: 'On Track',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Meal Planner</Text>
              <Text style={styles.headerSubtitle}>Plan your healthy week</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.weeklyStats}>
            {Object.entries(weeklyProjection).map(([key, value]) => (
              <View key={key} style={styles.statBox}>
                <Text style={styles.statLabel}>{key === 'totalOil' ? 'This Week' : key === 'savings' ? 'Savings' : 'Status'}</Text>
                <Text style={styles.statValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.content}>
          <Card>
            <View style={styles.calendarPlaceholder}>
              <Ionicons name="calendar" size={48} color="#d1d5db" />
              <Text style={styles.placeholderText}>Calendar view</Text>
            </View>
          </Card>
          <Text style={styles.dateTitle}>
            <Ionicons name="calendar-outline" size={16} color="#16a34a" /> {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          {Object.entries(mealPlan).map(([type, meal]) => (
            <Card key={type}>
              <View style={styles.mealRow}>
                <View style={styles.mealInfo}>
                  <View style={styles.mealIcon}>
                    <Ionicons name="restaurant" size={20} color="#16a34a" />
                  </View>
                  <View>
                    <Text style={styles.mealType}>{type}</Text>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Badge variant="success" style={styles.oilBadge}>
                      <Text style={{color: '#16a34a', fontSize: 12}}>{meal.oil} oil</Text>
                    </Badge>
                  </View>
                </View>
                <Text style={styles.editButton}>Edit</Text>
              </View>
            </Card>
          ))}
          <Button onPress={() => navigation.navigate('Recipes')}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>Add Recipe to Plan</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  header: { backgroundColor: '#16a34a', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, gap: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#dcfce7', marginTop: 2 },
  weeklyStats: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#dcfce7', marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '600', color: '#fff' },
  content: { padding: 16, gap: 16 },
  calendarPlaceholder: { height: 200, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', borderRadius: 8 },
  placeholderText: { fontSize: 14, color: '#9ca3af', marginTop: 8 },
  dateTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  mealRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mealInfo: { flexDirection: 'row', gap: 12, flex: 1 },
  mealIcon: { width: 40, height: 40, backgroundColor: '#dcfce7', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  mealType: { fontSize: 12, color: '#6b7280', textTransform: 'capitalize' },
  mealName: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 2 },
  oilBadge: { marginTop: 4 },
  editButton: { fontSize: 14, color: '#16a34a', fontWeight: '600' },
});
