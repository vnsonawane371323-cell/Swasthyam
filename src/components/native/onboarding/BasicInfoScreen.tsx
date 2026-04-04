import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import {
  calculateBMI,
  getBMICategory,
  getHealthSuggestionText,
  getSuggestionBackgroundColor as getSuggestionBackgroundColorByGoal,
  getGoalIcon
} from '../../../utils/healthSuggestions';

interface BasicInfoScreenProps {
  onNext: (data: any) => void;
  onSkip: () => void;
  onBack: () => void;
  language: string;
}

const weightGoalOptions = [
  {
    value: 'lose',
    label: 'Lose Weight',
    icon: '📉',
    description: 'Reduce by 500 cal/day',
  },
  {
    value: 'maintain',
    label: 'Maintain Weight',
    icon: '⚖️',
    description: 'Keep current weight',
  },
  {
    value: 'gain',
    label: 'Gain Weight',
    icon: '📈',
    description: 'Add 500 cal/day',
  },
];

// Function to suggest weight goal based on BMI and health profile
function suggestWeightGoal(bmi: number): string {
  return getBMICategory(bmi).goal;
}

// Function to get health suggestion text
function getHealthSuggestion(bmi: number): string {
  return getHealthSuggestionText(bmi);
}

export function BasicInfoScreen({ onNext, onSkip, onBack, language }: BasicInfoScreenProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [dailyCaloriesInput, setDailyCaloriesInput] = useState('');
  const [calorieGoal, setCalorieGoal] = useState<'lose' | 'maintain' | 'gain' | ''>('');
  const [suggestedGoal, setSuggestedGoal] = useState<string>('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);
  const [adjustedTdee, setAdjustedTdee] = useState<number | null>(null);

  // Calculate BMI and BMR when inputs change
  useEffect(() => {
    if (weight && height && age && gender) {
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const ageNum = parseInt(age);
      
      if (weightNum > 0 && heightNum > 0 && ageNum > 0) {
        // Calculate BMI
        const calculatedBmi = calculateBMI(heightNum, weightNum);
        setBmi(calculatedBmi);
        
        // Calculate BMR using Mifflin-St Jeor equation
        let calculatedBmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum;
        if (gender === 'male') {
          calculatedBmr += 5;
        } else if (gender === 'female') {
          calculatedBmr -= 161;
        }
        setBmr(Math.round(calculatedBmr));
        
        // Suggest weight goal based on BMI
        const suggestion = suggestWeightGoal(calculatedBmi);
        setSuggestedGoal(suggestion);
        
        // Calculate TDEE if activity level is selected
        if (activityLevel) {
          const activityFactors: Record<string, number> = {
            'sedentary': 1.2,
            'low': 1.2,
            'lightly-active': 1.375,
            'moderately-active': 1.55,
            'very-active': 1.725,
            'extra-active': 1.9
          };
          const manualCalories = parseFloat(dailyCaloriesInput);
          if (!isNaN(manualCalories) && manualCalories > 0) {
            setTdee(Math.round(manualCalories));
          } else {
            const factor = activityFactors[activityLevel] || 1.5;
            setTdee(Math.round(calculatedBmr * factor));
          }
        }
      }
    } else {
      setBmi(null);
      setBmr(null);
      setTdee(null);
      setSuggestedGoal('');
    }
  }, [weight, height, age, gender, activityLevel, dailyCaloriesInput]);

  // Calculate adjusted TDEE when calorie goal changes
  useEffect(() => {
    if (tdee && calorieGoal) {
      let adjusted = tdee;
      if (calorieGoal === 'lose') {
        adjusted = tdee - 500;
      } else if (calorieGoal === 'gain') {
        adjusted = tdee + 500;
      }
      setAdjustedTdee(adjusted);
    } else {
      setAdjustedTdee(null);
    }
  }, [tdee, calorieGoal]);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Underweight', color: '#3b82f6' };
    if (bmi < 25) return { text: 'Normal', color: '#10b981' };
    if (bmi < 30) return { text: 'Overweight', color: '#f59e0b' };
    return { text: 'Obese', color: '#ef4444' };
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return '#3b82f6';
    if (bmi < 25) return '#10b981';
    if (bmi < 30) return '#f59e0b';
    return '#ef4444';
  };

  const handleContinue = () => {
    const activityFactors: Record<string, number> = {
      'sedentary': 1.2,
      'low': 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
      'extra-active': 1.9
    };
    const activityFactor = activityFactors[activityLevel] || 1.5;
    
    onNext({ 
      name, 
      age: parseInt(age), 
      gender, 
      weight: parseFloat(weight), 
      height: parseFloat(height), 
      bmi,
      bmr,
      activityLevel,
      activityFactor,
      tdee,
      calorieGoal: calorieGoal || suggestedGoal,
      adjustedTdee
    });
  };

  const isFormValid = name && age && gender && weight && height && activityLevel && (calorieGoal || suggestedGoal);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#5B5B5B" />
          </TouchableOpacity>
          <Text style={styles.stepText}>Step 1 of 6</Text>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '16.67%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Let's Get Started</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Age Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Gender Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerIconContainer}>
                <Ionicons name="person" size={20} color="#5B5B5B" style={styles.pickerIcon} />
              </View>
              <Picker
                selectedValue={gender}
                onValueChange={setGender}
                style={styles.picker}
                dropdownIconColor="#07A996"
              >
                <Picker.Item label="Select gender" value="" />
                <Picker.Item label="👨 Male" value="male" />
                <Picker.Item label="👩 Female" value="female" />
                <Picker.Item label="🧑 Other" value="other" />
                <Picker.Item label="🤐 Prefer not to say" value="prefer-not-to-say" />
              </Picker>
            </View>
          </View>

          {/* Height Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="Enter your height in cm"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Weight Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter your weight in kg"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Activity Level Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Activity Level</Text>
            <Text style={styles.helperText}>How active are you on a daily basis?</Text>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerIconContainer}>
                <Ionicons name="fitness" size={20} color="#5B5B5B" style={styles.pickerIcon} />
              </View>
              <Picker
                selectedValue={activityLevel}
                onValueChange={setActivityLevel}
                style={styles.picker}
                dropdownIconColor="#07A996"
              >
                <Picker.Item label="Select activity level" value="" />
                <Picker.Item label="🛋️ Sedentary (little to no exercise)" value="sedentary" />
                <Picker.Item label="🧑‍💼 Low Activity (desk/office lifestyle)" value="low" />
                <Picker.Item label="🚶 Lightly Active (1-3 days/week)" value="lightly-active" />
                <Picker.Item label="🏃 Moderately Active (3-5 days/week)" value="moderately-active" />
                <Picker.Item label="💪 Very Active (6-7 days/week)" value="very-active" />
                <Picker.Item label="🏋️ Extra Active (athlete/physical job)" value="extra-active" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Daily Calories (optional)</Text>
            <Text style={styles.helperText}>Enter if you want exact calorie target (e.g., 1900)</Text>
            <TextInput
              style={styles.input}
              value={dailyCaloriesInput}
              onChangeText={setDailyCaloriesInput}
              placeholder="Enter total daily calories"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Metabolic Info Display */}
          {bmr !== null && (
            <View style={styles.metabolicCard}>
              <View style={styles.metabolicHeader}>
                <Ionicons name="fitness" size={20} color="#1b4a5a" />
                <Text style={styles.metabolicTitle}>Your Metabolic Profile</Text>
              </View>
              
              <View style={styles.metabolicRow}>
                <Text style={styles.metabolicLabel}>BMI</Text>
                <View style={styles.metabolicValueContainer}>
                  <Text style={styles.metabolicValue}>{bmi?.toFixed(1)}</Text>
                  <Text style={[styles.metabolicCategory, { color: getBMICategory(bmi!).color }]}>
                    {getBMICategory(bmi!).text}
                  </Text>
                </View>
              </View>
              
              <View style={styles.metabolicRow}>
                <Text style={styles.metabolicLabel}>BMR</Text>
                <View style={styles.metabolicValueContainer}>
                  <Text style={styles.metabolicValue}>{bmr} kcal/day</Text>
                  <Text style={styles.metabolicSubtext}>Your resting metabolism</Text>
                </View>
              </View>
              
              {tdee && (
                <View style={styles.metabolicRow}>
                  <Text style={styles.metabolicLabel}>TDEE</Text>
                  <View style={styles.metabolicValueContainer}>
                    <Text style={styles.metabolicValue}>{tdee} kcal/day</Text>
                    <Text style={styles.metabolicSubtext}>Your daily calorie needs</Text>
                  </View>
                </View>
              )}

              {adjustedTdee && calorieGoal && (
                <View style={styles.metabolicRow}>
                  <Text style={styles.metabolicLabel}>Adjusted Goal</Text>
                  <View style={styles.metabolicValueContainer}>
                    <Text style={styles.metabolicValue}>{adjustedTdee} kcal/day</Text>
                    <Text style={styles.metabolicSubtext}>Your target intake</Text>
                  </View>
                </View>
              )}
              
              <View style={styles.metabolicInfo}>
                <Ionicons name="information-circle" size={16} color="#3b82f6" />
                <Text style={styles.metabolicInfoText}>
                  Your personalized oil limit will be calculated based on these values
                </Text>
              </View>
            </View>
          )}

          {/* Health Suggestion */}
          {bmi !== null && (
            <View style={[styles.healthSuggestionCard, { backgroundColor: getSuggestionBackgroundColorByGoal(suggestedGoal as any) }]}>
              <View style={styles.suggestionHeader}>
                <Text style={[styles.suggestionIcon, { fontSize: 24 }]}>
                  {getGoalIcon(suggestedGoal as any)}
                </Text>
                <Text style={styles.suggestionTitle}>Health Recommendation</Text>
              </View>
              <Text style={styles.suggestionText}>
                {getHealthSuggestion(bmi!)}
              </Text>
            </View>
          )}

          {/* Weight Goal Selection */}
          {bmi !== null && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Weight Goal</Text>
              <Text style={styles.helperText}>
                {suggestedGoal ? `We recommend: ${weightGoalOptions.find(o => o.value === suggestedGoal)?.label}` : 'Select your preferred weight goal'}
              </Text>
              <View style={styles.goalOptionsContainer}>
                {weightGoalOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.goalOption,
                      calorieGoal === option.value && styles.goalOptionSelected,
                      calorieGoal === '' && suggestedGoal === option.value && styles.goalOptionSuggested,
                    ]}
                    onPress={() => setCalorieGoal(option.value as 'lose' | 'maintain' | 'gain')}
                  >
                    <Text style={styles.goalOptionIcon}>{option.icon}</Text>
                    <Text style={styles.goalOptionLabel}>{option.label}</Text>
                    <Text style={styles.goalOptionDescription}>{option.description}</Text>
                    {calorieGoal === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!isFormValid}
        >
          <Text style={[styles.continueButtonText, !isFormValid && styles.continueButtonTextDisabled]}>
            Continue
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
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
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#040707',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#040707',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#07A996',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#07A996',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerIconContainer: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  pickerIcon: {
    marginTop: 2,
  },
  picker: {
    height: 50,
    flex: 1,
    color: '#2D3748',
    fontSize: 16,
  },
  bmiCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  bmiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bmiLabel: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#040707',
  },
  bmiCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  bmiProgress: {
    height: 8,
    backgroundColor: '#E7F2F1',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  bmiProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E7F2F1',
  },
  continueButton: {
    backgroundColor: '#1b4a5a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonDisabled: {
    backgroundColor: '#E7F2F1',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#5B5B5B',
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#5B5B5B',
    fontSize: 14,
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  metabolicCard: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 16,
  },
  metabolicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  metabolicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  metabolicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  metabolicLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  metabolicValueContainer: {
    alignItems: 'flex-end',
  },
  metabolicValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b4a5a',
  },
  metabolicCategory: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  metabolicSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  metabolicInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
  },
  metabolicInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#3b82f6',
    lineHeight: 16,
  },
  healthSuggestionCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  suggestionIcon: {
    fontSize: 24,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  suggestionText: {
    fontSize: 13,
    color: '#5B5B5B',
    lineHeight: 18,
  },
  goalOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  goalOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  goalOptionSelected: {
    borderColor: '#10b981',
    backgroundColor: '#F0FDF4',
  },
  goalOptionSuggested: {
    borderColor: '#3b82f6',
    backgroundColor: '#F0F9FF',
  },
  goalOptionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  goalOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1b4a5a',
    textAlign: 'center',
    marginBottom: 2,
  },
  goalOptionDescription: {
    fontSize: 10,
    color: '#5B5B5B',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
