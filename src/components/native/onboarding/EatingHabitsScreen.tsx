import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface EatingHabitsScreenProps {
  onNext: (data: any) => void;
  onSkip: () => void;
  onBack: () => void;
  language: string;
}

const { width } = Dimensions.get('window');

export function EatingHabitsScreen({ onNext, onSkip, onBack, language }: EatingHabitsScreenProps) {
  const [mealsPerDay, setMealsPerDay] = useState('');
  const [outsideEating, setOutsideEating] = useState('');
  const [foodieLevel, setFoodieLevel] = useState('');
  const [dietType, setDietType] = useState('');
  const [cookingStyle, setCookingStyle] = useState('');

  const handleContinue = () => {
    onNext({ 
      mealsPerDay, 
      outsideEating, 
      foodieLevel,
      dietType,
      cookingStyle
    });
  };

  const isFormValid = mealsPerDay && outsideEating && foodieLevel;

  const outsideEatingOptions = [
    { value: 'rarely', label: 'Rarely (Once a month or less)', icon: '🏠' },
    { value: 'occasionally', label: 'Occasionally (2-3 times a month)', icon: '🍽️' },
    { value: 'weekly', label: 'Weekly (1-2 times a week)', icon: '🍔' },
    { value: 'frequently', label: 'Frequently (3-5 times a week)', icon: '🍕' },
    { value: 'daily', label: 'Almost Daily', icon: '🍱' }
  ];

  const foodieLevelOptions = [
    { 
      value: 'health-conscious', 
      label: 'Health Conscious', 
      subtitle: 'I prioritize nutrition and healthy eating', 
      icon: 'heart' as const
    },
    { 
      value: 'balanced', 
      label: 'Balanced Eater', 
      subtitle: 'I enjoy food but watch my health', 
      icon: 'restaurant' as const
    },
    { 
      value: 'foodie', 
      label: 'Food Lover', 
      subtitle: 'I love trying new foods and flavors', 
      icon: 'cafe' as const
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#5B5B5B" />
          </TouchableOpacity>
          <Text style={styles.stepText}>Step 3 of 6</Text>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Eating Habits</Text>
        <Text style={styles.subtitle}>Help us understand your food preferences</Text>

        <View style={styles.form}>
          {/* Meals Per Day */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How many meals do you eat per day?</Text>
            <View style={styles.gridButtons}>
              {['1-2 meals', '3 meals', '4 meals', '5+ meals'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.gridButton,
                    mealsPerDay === option && styles.gridButtonActive
                  ]}
                  onPress={() => setMealsPerDay(option)}
                >
                  <Text style={[
                    styles.gridButtonText,
                    mealsPerDay === option && styles.gridButtonTextActive
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Outside Eating Frequency */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How often do you eat outside or order food?</Text>
            <View style={styles.optionsList}>
              {outsideEatingOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    outsideEating === option.value && styles.optionCardActive
                  ]}
                  onPress={() => setOutsideEating(option.value)}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.optionLabel,
                    outsideEating === option.value && styles.optionLabelActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Foodie Level */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How would you describe yourself?</Text>
            <View style={styles.optionsList}>
              {foodieLevelOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.foodieCard,
                    foodieLevel === option.value && styles.foodieCardActive
                  ]}
                  onPress={() => setFoodieLevel(option.value)}
                >
                  <Ionicons 
                    name={option.icon} 
                    size={20} 
                    color={foodieLevel === option.value ? '#ffffff' : '#fcaf56'} 
                    style={styles.foodieIcon}
                  />
                  <View style={styles.foodieText}>
                    <Text style={[
                      styles.foodieLabel,
                      foodieLevel === option.value && styles.foodieLabelActive
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.foodieSubtitle,
                      foodieLevel === option.value && styles.foodieSubtitleActive
                    ]}>
                      {option.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Diet Type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Dietary Preference</Text>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerIconContainer}>
                <Ionicons name="leaf" size={20} color="#5B5B5B" style={styles.pickerIcon} />
              </View>
              <Picker
                selectedValue={dietType}
                onValueChange={setDietType}
                style={styles.picker}
                dropdownIconColor="#07A996"
              >
                <Picker.Item label="Select your diet type" value="" />
                <Picker.Item label="🥬 Vegetarian" value="vegetarian" />
                <Picker.Item label="🍗 Non-Vegetarian" value="non-vegetarian" />
                <Picker.Item label="🌱 Vegan" value="vegan" />
                <Picker.Item label="🥚 Eggetarian" value="eggetarian" />
                <Picker.Item label="🙏 Jain" value="jain" />
              </Picker>
            </View>
          </View>

          {/* Cooking Style */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Preferred Cooking Style</Text>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerIconContainer}>
                <Ionicons name="restaurant" size={20} color="#5B5B5B" style={styles.pickerIcon} />
              </View>
              <Picker
                selectedValue={cookingStyle}
                onValueChange={setCookingStyle}
                style={styles.picker}
                dropdownIconColor="#07A996"
              >
                <Picker.Item label="Select cooking style" value="" />
                <Picker.Item label="🍛 North Indian" value="north-indian" />
                <Picker.Item label="🥘 South Indian" value="south-indian" />
                <Picker.Item label="🍲 Bengali" value="bengali" />
                <Picker.Item label="🥗 Gujarati" value="gujarati" />
                <Picker.Item label="🧈 Punjabi" value="punjabi" />
                <Picker.Item label="🍝 Mixed/Continental" value="mixed" />
                <Picker.Item label="✨ Minimal Oil Cooking" value="minimal-oil" />
              </Picker>
            </View>
          </View>
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
    gap: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#040707',
    marginBottom: 12,
    fontWeight: '500',
  },
  gridButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridButton: {
    width: (width - 52) / 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    alignItems: 'center',
  },
  gridButtonActive: {
    backgroundColor: '#1b4a5a',
    borderColor: '#1b4a5a',
  },
  gridButtonText: {
    fontSize: 14,
    color: '#040707',
  },
  gridButtonTextActive: {
    color: '#ffffff',
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    gap: 12,
  },
  optionCardActive: {
    backgroundColor: '#1b4a5a',
    borderColor: '#1b4a5a',
  },
  optionIcon: {
    fontSize: 20,
  },
  optionLabel: {
    fontSize: 14,
    color: '#040707',
    flex: 1,
  },
  optionLabelActive: {
    color: '#ffffff',
  },
  foodieCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    gap: 12,
  },
  foodieCardActive: {
    backgroundColor: '#1b4a5a',
    borderColor: '#1b4a5a',
  },
  foodieIcon: {
    marginTop: 2,
  },
  foodieText: {
    flex: 1,
  },
  foodieLabel: {
    fontSize: 14,
    color: '#040707',
    marginBottom: 4,
  },
  foodieLabelActive: {
    color: '#ffffff',
  },
  foodieSubtitle: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  foodieSubtitleActive: {
    color: 'rgba(255, 255, 255, 0.8)',
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
});
