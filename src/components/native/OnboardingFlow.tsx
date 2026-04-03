import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { AwarenessScreen } from './onboarding/AwarenessScreen';
import { BasicInfoScreen } from './onboarding/BasicInfoScreen';
import { MedicalHistoryScreen } from './onboarding/MedicalHistoryScreen';
import { EatingHabitsScreen } from './onboarding/EatingHabitsScreen';
import { YourOilScreen } from './onboarding/YourOilScreen';
import { OilInsightsScreen } from './onboarding/OilInsightsScreen';
import { useAuth } from '../../context/AuthContext';

interface OnboardingFlowProps {
  onComplete: () => void;
  language: string;
}

export function OnboardingFlow({ onComplete, language }: OnboardingFlowProps) {
  const { completeOnboarding, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [userData, setUserData] = useState<any>({});

  const handleNext = (screenNumber: number, data: any) => {
    // Save data from current screen
    setUserData({
      ...userData,
      [`screen${screenNumber}`]: data
    });
    
    // Move to next screen
    if (screenNumber < 5) {
      setCurrentScreen(screenNumber + 1);
    } else {
      handleComplete();
    }
  };

  const handleStart = () => {
    setCurrentScreen(1);
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleSkip = () => {
    if (currentScreen < 5) {
      setCurrentScreen(currentScreen + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    console.log('Onboarding completed with data:', userData);
    
    // Transform collected data into the format expected by the backend
    const basicInfo = userData.screen1 || {};
    const medicalData = userData.screen2 || {};
    const eatingHabits = userData.screen3 || {};
    const oilPreferences = userData.screen4 || {};
    
    // Transform medical conditions into the required format
    const medicalHistory = medicalData.medicalConditions 
      ? Object.entries(medicalData.medicalConditions).map(([condition, severity]) => ({
          condition,
          severity: severity as string
        }))
      : [];
    
    const onboardingData = {
      // Basic Info
      name: basicInfo.name || '',
      age: basicInfo.age ? parseInt(basicInfo.age) : undefined,
      gender: basicInfo.gender || '',
      height: basicInfo.height ? parseFloat(basicInfo.height) : undefined,
      weight: basicInfo.weight ? parseFloat(basicInfo.weight) : undefined,
      bmr: basicInfo.bmr ? Number(basicInfo.bmr) : undefined,
      activityLevel: basicInfo.activityLevel || undefined,
      activityFactor: basicInfo.activityFactor ? Number(basicInfo.activityFactor) : undefined,
      tdee: basicInfo.tdee ? Number(basicInfo.tdee) : undefined,
      
      // Medical History
      medicalHistory,
      reportType: medicalData.reportType || '',
      
      // Eating Habits
      mealsPerDay: eatingHabits.mealsPerDay || '',
      frequencyToEatOutside: eatingHabits.outsideEating || '',
      foodieLevel: eatingHabits.foodieLevel || '',
      dietaryPreference: eatingHabits.dietType || '',
      preferredCookingStyle: eatingHabits.cookingStyle || '',
      
      // Oil Preferences
      currentOils: oilPreferences.currentOils || [],
      monthlyOilConsumption: oilPreferences.monthlyConsumption ? parseFloat(oilPreferences.monthlyConsumption) : undefined,
      oilBudget: oilPreferences.budget || '',
    };
    
    try {
      const response = await completeOnboarding(onboardingData);
      
      if (response.success) {
        onComplete();
      } else {
        Alert.alert(
          'Error',
          response.message || 'Failed to save your data. Please try again.',
          [
            { text: 'Retry', onPress: handleComplete },
            { text: 'Skip', onPress: onComplete }
          ]
        );
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Your data may not have been saved.',
        [
          { text: 'Retry', onPress: handleComplete },
          { text: 'Continue Anyway', onPress: onComplete }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {currentScreen === 0 && (
        <AwarenessScreen
          onStart={handleStart}
          language={language}
        />
      )}
      
      {currentScreen === 1 && (
        <BasicInfoScreen
          onNext={(data) => handleNext(1, data)}
          onSkip={handleSkip}
          onBack={handleBack}
          language={language}
        />
      )}
      
      {currentScreen === 2 && (
        <MedicalHistoryScreen
          onNext={(data) => handleNext(2, data)}
          onSkip={handleSkip}
          onBack={handleBack}
          language={language}
          userData={userData}
        />
      )}
      
      {currentScreen === 3 && (
        <EatingHabitsScreen
          onNext={(data) => handleNext(3, data)}
          onSkip={handleSkip}
          onBack={handleBack}
          language={language}
        />
      )}
      
      {currentScreen === 4 && (
        <YourOilScreen
          onNext={(data) => handleNext(4, data)}
          onSkip={handleSkip}
          onBack={handleBack}
          language={language}
        />
      )}
      
      {currentScreen === 5 && (
        <OilInsightsScreen
          onComplete={handleComplete}
          onBack={handleBack}
          language={language}
          userData={userData}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
});
