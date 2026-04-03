import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface OilInsightsScreenProps {
  onComplete: () => void;
  onBack: () => void;
  language: string;
  userData: any;
}

export function OilInsightsScreen({ onComplete, onBack, language, userData }: OilInsightsScreenProps) {
  const [dailyOilGoal, setDailyOilGoal] = useState('');
  const [idealConsumption, setIdealConsumption] = useState(0);
  const [currentEstimate, setCurrentEstimate] = useState(0);
  const [reductionNeeded, setReductionNeeded] = useState(0);

  useEffect(() => {
    // Calculate ideal oil consumption based on user data
    const calculateIdealConsumption = () => {
      const basicInfo = userData?.screen1 || {};
      const medicalHistory = userData?.screen2 || {};
      const eatingHabits = userData?.screen3 || {};

      let baseConsumption = 25;
      
      const age = parseInt(basicInfo.age) || 30;
      if (age > 50) baseConsumption -= 3;
      else if (age < 18) baseConsumption -= 5;

      if (basicInfo.gender === 'female') baseConsumption -= 2;

      const bmi = basicInfo.bmi || 0;
      if (bmi > 30) baseConsumption -= 8;
      else if (bmi > 25) baseConsumption -= 5;
      else if (bmi < 18.5) baseConsumption += 3;

      const conditions = medicalHistory?.medicalConditions || {};
      const conditionCount = Object.keys(conditions).length;
      baseConsumption -= conditionCount * 2;

      Object.values(conditions).forEach((severity: any) => {
        if (severity === 'severe') baseConsumption -= 3;
        else if (severity === 'moderate') baseConsumption -= 2;
      });

      if (eatingHabits.outsideEating === 'frequently' || eatingHabits.outsideEating === 'daily') {
        baseConsumption -= 3;
      }
      if (eatingHabits.foodieLevel === 'health-conscious') {
        baseConsumption -= 2;
      }

      baseConsumption = Math.max(15, baseConsumption);
      return Math.round(baseConsumption);
    };

    const calculateCurrentEstimate = () => {
      const eatingHabits = userData?.screen3 || {};
      let estimate = 35;

      if (eatingHabits.mealsPerDay === '1-2 meals') estimate -= 5;
      else if (eatingHabits.mealsPerDay === '5+ meals') estimate += 5;

      if (eatingHabits.outsideEating === 'daily') estimate += 8;
      else if (eatingHabits.outsideEating === 'frequently') estimate += 5;
      else if (eatingHabits.outsideEating === 'rarely') estimate -= 5;

      if (eatingHabits.foodieLevel === 'health-conscious') estimate -= 5;
      else if (eatingHabits.foodieLevel === 'foodie') estimate += 3;

      return Math.round(estimate);
    };

    const ideal = calculateIdealConsumption();
    const current = calculateCurrentEstimate();
    
    setIdealConsumption(ideal);
    setCurrentEstimate(current);
    setReductionNeeded(Math.max(0, current - ideal));
    setDailyOilGoal(ideal.toString());
  }, [userData]);

  const handleComplete = () => {
    onComplete();
  };

  const oilProducts = userData?.screen4?.oilProducts || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#5B5B5B" />
          </TouchableOpacity>
          <Text style={styles.stepText}>Step 5 of 6</Text>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '83.33%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your Oil Insights</Text>
        <Text style={styles.subtitle}>Based on your profile, here's your personalized recommendation</Text>

        {/* How We Calculate */}
        <LinearGradient
          colors={['#1b4a5a', '#2a5a6a']}
          style={styles.gradientCard}
        >
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#ffffff" />
            <Text style={styles.infoHeaderText}>How We Calculate Your Ideal Oil Consumption</Text>
          </View>
          <Text style={styles.infoText}>
            We use a comprehensive algorithm that considers your age, gender, BMI, medical conditions, 
            eating habits, and activity level. Our recommendation aligns with WHO guidelines and is 
            personalized to help you achieve optimal health while reducing oil consumption by 10%.
          </Text>
        </LinearGradient>

        {/* Current vs Ideal */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Current Estimate</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{currentEstimate}</Text>
              <Text style={styles.statUnit}>g/day</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFillRed, { width: '85%' }]} />
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Ideal Target</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{idealConsumption}</Text>
              <Text style={styles.statUnit}>g/day</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFillGreen, { width: '65%' }]} />
            </View>
          </View>
        </View>

        {/* Reduction Needed */}
        {reductionNeeded > 0 && (
          <View style={styles.reductionCard}>
            <View style={styles.reductionIcon}>
              <Ionicons name="trending-down" size={24} color="#ffffff" />
            </View>
            <View style={styles.reductionText}>
              <Text style={styles.reductionTitle}>Reduction Goal</Text>
              <Text style={styles.reductionSubtitle}>
                Reduce by {reductionNeeded}g per day ({((reductionNeeded/currentEstimate) * 100).toFixed(0)}%)
              </Text>
            </View>
          </View>
        )}

        {/* Your Oils */}
        {oilProducts.length > 0 && (
          <View style={styles.oilsCard}>
            <View style={styles.oilsHeader}>
              <Ionicons name="water" size={20} color="#1b4a5a" />
              <Text style={styles.oilsTitle}>Your Cooking Oils</Text>
            </View>
            <View style={styles.oilsList}>
              {oilProducts.map((oil: any, index: number) => (
                <View key={index} style={styles.oilItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.oilText}>{oil.brand} {oil.type} - {oil.volume}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Key Factors */}
        <View style={styles.factorsCard}>
          <Text style={styles.factorsTitle}>Key Factors Considered</Text>
          <View style={styles.factorsList}>
            {userData?.screen1?.bmi && (
              <View style={styles.factorRow}>
                <Text style={styles.factorLabel}>BMI</Text>
                <Text style={styles.factorValue}>{userData.screen1.bmi.toFixed(1)}</Text>
              </View>
            )}
            {userData?.screen2?.medicalConditions && Object.keys(userData.screen2.medicalConditions).length > 0 && (
              <View style={styles.factorRow}>
                <Text style={styles.factorLabel}>Medical Conditions</Text>
                <Text style={styles.factorValue}>{Object.keys(userData.screen2.medicalConditions).length}</Text>
              </View>
            )}
            {userData?.screen3?.mealsPerDay && (
              <View style={styles.factorRow}>
                <Text style={styles.factorLabel}>Meals Per Day</Text>
                <Text style={styles.factorValue}>{userData.screen3.mealsPerDay}</Text>
              </View>
            )}
            {userData?.screen3?.outsideEating && (
              <View style={styles.factorRow}>
                <Text style={styles.factorLabel}>Outside Eating</Text>
                <Text style={[styles.factorValue, styles.capitalize]}>{userData.screen3.outsideEating}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Set Your Goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Ionicons name="flag" size={20} color="#1b4a5a" />
            <Text style={styles.goalTitle}>Set Your Daily Oil Goal</Text>
          </View>
          <Text style={styles.goalSubtitle}>Adjust your target if needed</Text>
          
          <View style={styles.goalInput}>
            <TextInput
              style={styles.goalTextInput}
              value={dailyOilGoal}
              onChangeText={setDailyOilGoal}
              keyboardType="numeric"
            />
            <Text style={styles.goalUnit}>grams/day</Text>
          </View>

          {dailyOilGoal && parseInt(dailyOilGoal) > idealConsumption + 5 && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                This is higher than recommended. Consider setting a lower goal for better health.
              </Text>
            </View>
          )}
        </View>

        {/* Health Benefits */}
        <View style={styles.benefitsCard}>
          <View style={styles.benefitsHeader}>
            <Ionicons name="heart" size={20} color="#10b981" />
            <Text style={styles.benefitsTitle}>Expected Health Benefits</Text>
          </View>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.benefitText}>Reduced risk of heart disease and stroke</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.benefitText}>Better cholesterol levels and blood pressure</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.benefitText}>Improved weight management</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.benefitText}>Supporting India's 10% oil reduction goal</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Complete Setup & Start Journey</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E7F2F1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1b4a5a',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#040707',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#5B5B5B',
    marginBottom: 24,
  },
  gradientCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    padding: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#5B5B5B',
    marginBottom: 8,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#040707',
  },
  statUnit: {
    fontSize: 14,
    color: '#5B5B5B',
    marginBottom: 4,
  },
  progressFillRed: {
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  progressFillGreen: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  reductionCard: {
    backgroundColor: 'rgba(252, 175, 86, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252, 175, 86, 0.3)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  reductionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#fcaf56',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reductionText: {
    flex: 1,
  },
  reductionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  reductionSubtitle: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  oilsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  oilsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  oilsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
  },
  oilsList: {
    gap: 8,
  },
  oilItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oilText: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  factorsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  factorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 12,
  },
  factorsList: {
    gap: 8,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorLabel: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  factorValue: {
    fontSize: 14,
    color: '#040707',
    fontWeight: '500',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#5B5B5B',
    marginBottom: 16,
  },
  goalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  goalTextInput: {
    flex: 1,
    backgroundColor: '#fafbfa',
    borderWidth: 1,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#040707',
    textAlign: 'center',
  },
  goalUnit: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#92400e',
  },
  benefitsCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 12,
    padding: 16,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#065f46',
    flex: 1,
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E7F2F1',
  },
  completeButton: {
    backgroundColor: '#1b4a5a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
