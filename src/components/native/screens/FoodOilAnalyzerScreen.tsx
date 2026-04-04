import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../../services/api';
import { notificationService } from '../../../services/notificationService';

// Conditionally import FileSystem only for native platforms
let FileSystem: any = null;
if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system/legacy');
}

const { width } = Dimensions.get('window');

interface NutritionData {
  foodName: string;
  oilContent: {
    totalOil: string;
    oilType: string;
    estimatedMl: number;
    calories: number;
  };
  fatBreakdown: {
    saturatedFat: string;
    transFat: string;
    polyunsaturatedFat: string;
    monounsaturatedFat: string;
  };
  healthScore: number;
  healthTips: string[];
  servingSize: string;
  cookingMethod: string;
  isHealthy: boolean;
}

interface LogFormData {
  foodName: string;
  oilType: string;
  oilAmount: number;
  quantity: number;
  unit: 'grams' | 'bowls' | 'pieces';
  mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
}

const OIL_TYPES = [
  'Sunflower Oil', 'Mustard Oil', 'Coconut Oil', 'Olive Oil', 
  'Groundnut Oil', 'Rice Bran Oil', 'Ghee', 'Vegetable Oil', 'Other'
];

const MEAL_TYPES: Array<'Breakfast' | 'Lunch' | 'Snack' | 'Dinner'> = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

const UNITS: Array<'grams' | 'bowls' | 'pieces'> = ['grams', 'bowls', 'pieces'];

const parseOilAmountFromText = (text?: string) => {
  if (!text) return null;
  const match = text.match(/([0-9]*\.?[0-9]+)\s*(ml|g|gram|grams)/i);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const unitRaw = match[2].toLowerCase();
  const unit: 'ml' | 'g' = unitRaw === 'ml' ? 'ml' : 'g';
  return { amount, unit };
};

export function FoodOilAnalyzerScreen() {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Log modal states
  const [showLogModal, setShowLogModal] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [logForm, setLogForm] = useState<LogFormData>({
    foodName: '',
    oilType: 'Vegetable Oil',
    oilAmount: 0,
    quantity: 1,
    unit: 'pieces',
    mealType: 'Lunch',
  });

  const analyzeImageWithAI = async (base64Image: string): Promise<NutritionData> => {
    console.log('[FoodAnalyzer] Sending image to backend analyzer...');

    const response = await apiService.analyzeFoodImage(base64Image);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Food analysis failed');
    }

    return response.data;
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      setError(null);
      setNutritionData(null);

      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Gallery permission is needed to select photos.');
          return;
        }
      }

      const result = await (useCamera
        ? ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          }));

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        await analyzeFood(uri);
      }
    } catch (err: any) {
      console.error('Image picker error:', err);
      setError('Failed to select image. Please try again.');
    }
  };

  const analyzeFood = async (uri: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      let base64Image: string;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        if (!FileSystem) {
          throw new Error('FileSystem not available');
        }
        base64Image = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
      }

      const data = await analyzeImageWithAI(base64Image);
      setNutritionData(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'Failed to analyze food. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setImageUri(null);
    setNutritionData(null);
    setError(null);
    setLogSuccess(false);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 7) return '#22c55e';
    if (score >= 4) return '#f59e0b';
    return '#ef4444';
  };

  const openLogModal = () => {
    if (nutritionData) {
      // Pre-fill form with detected data
      setLogForm({
        foodName: nutritionData.foodName,
        oilType: nutritionData.oilContent.oilType || 'Vegetable Oil',
        oilAmount: nutritionData.oilContent.estimatedMl || 0,
        quantity: 1,
        unit: 'pieces',
        mealType: getCurrentMealType(),
      });
      setShowLogModal(true);
    }
  };

  const openManualEntry = () => {
    // Open log modal with empty/default form for manual entry (NO AI)
    setLogForm({
      foodName: '',
      oilType: 'Vegetable Oil',
      oilAmount: 0,
      quantity: 1,
      unit: 'pieces',
      mealType: getCurrentMealType(),
    });
    setImageUri(null);
    setNutritionData(null);
    setError(null);
    setShowLogModal(true);
  };

  const getCurrentMealType = (): 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 18) return 'Snack';
    return 'Dinner';
  };

  const handleLogOil = async () => {
    if (!logForm.foodName.trim() || logForm.oilAmount <= 0) {
      Alert.alert('Error', 'Please fill in food name and oil amount');
      return;
    }

    setIsLogging(true);
    try {
      const parsedOil = parseOilAmountFromText(nutritionData?.oilContent?.totalOil);
      const payloadOilAmount = parsedOil?.amount || logForm.oilAmount;
      const payloadOilUnit: 'ml' | 'g' = parsedOil?.unit || 'ml';

      const response = await apiService.logOilConsumption({
        foodName: logForm.foodName,
        oilType: logForm.oilType,
        oilAmount: payloadOilAmount,
        oilAmountUnit: payloadOilUnit,
        quantity: logForm.quantity,
        unit: logForm.unit,
        mealType: logForm.mealType,
      });

      if (response.success) {
        setLogSuccess(true);
        setShowLogModal(false);
        
        // Check if user has exceeded their daily oil limit
        try {
          const statusResponse = await apiService.getUserOilStatus();
          if (statusResponse.success && statusResponse.data) {
            const { cumulativeEffKcal, goalKcal } = statusResponse.data;
            await notificationService.checkAndNotifyOilExcess(
              cumulativeEffKcal,
              goalKcal,
              navigation
            );
          }
        } catch (checkErr) {
          console.log('Could not check oil status:', checkErr);
        }
        
        Alert.alert(
          '✅ Logged Successfully!',
          `${logForm.foodName} (${logForm.oilAmount}ml oil) has been added to your daily log.`,
          [{ 
            text: 'OK',
            onPress: () => {
              // Navigate back to Home to refresh progress bars
              console.log('🍽️ [FoodAnalyzer] Going back to Home after log. Oil amount:', logForm.oilAmount, 'ml');
              navigation.goBack();
            }
          }]
        );
      } else {
        throw new Error('Failed to log');
      }
    } catch (err: any) {
      console.error('Log error:', err);
      Alert.alert('Error', 'Failed to log oil consumption. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const renderLogModal = () => (
    <Modal
      visible={showLogModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowLogModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log to Oil Tracker</Text>
            <TouchableOpacity onPress={() => setShowLogModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Food Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Food Name</Text>
              <TextInput
                style={styles.formInput}
                value={logForm.foodName}
                onChangeText={(text) => setLogForm(prev => ({ ...prev, foodName: text }))}
                placeholder="Enter food name"
              />
            </View>

            {/* Oil Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Oil Amount (ml)</Text>
              <TextInput
                style={styles.formInput}
                value={logForm.oilAmount.toString()}
                onChangeText={(text) => setLogForm(prev => ({ ...prev, oilAmount: parseFloat(text) || 0 }))}
                keyboardType="numeric"
                placeholder="Enter oil amount in ml"
              />
            </View>

            {/* Oil Type */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Oil Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {OIL_TYPES.map((oil) => (
                  <TouchableOpacity
                    key={oil}
                    style={[
                      styles.chip,
                      logForm.oilType === oil && styles.chipSelected
                    ]}
                    onPress={() => setLogForm(prev => ({ ...prev, oilType: oil }))}
                  >
                    <Text style={[
                      styles.chipText,
                      logForm.oilType === oil && styles.chipTextSelected
                    ]}>{oil}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Meal Type */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Meal Type</Text>
              <View style={styles.mealTypeContainer}>
                {MEAL_TYPES.map((meal) => (
                  <TouchableOpacity
                    key={meal}
                    style={[
                      styles.mealTypeButton,
                      logForm.mealType === meal && styles.mealTypeButtonSelected
                    ]}
                    onPress={() => setLogForm(prev => ({ ...prev, mealType: meal }))}
                  >
                    <Ionicons
                      name={
                        meal === 'Breakfast' ? 'sunny' :
                        meal === 'Lunch' ? 'restaurant' :
                        meal === 'Snack' ? 'cafe' : 'moon'
                      }
                      size={20}
                      color={logForm.mealType === meal ? '#fff' : '#666'}
                    />
                    <Text style={[
                      styles.mealTypeText,
                      logForm.mealType === meal && styles.mealTypeTextSelected
                    ]}>{meal}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quantity & Unit */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Quantity</Text>
                <TextInput
                  style={styles.formInput}
                  value={logForm.quantity.toString()}
                  onChangeText={(text) => setLogForm(prev => ({ ...prev, quantity: parseInt(text) || 1 }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Unit</Text>
                <View style={styles.unitContainer}>
                  {UNITS.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        logForm.unit === unit && styles.unitButtonSelected
                      ]}
                      onPress={() => setLogForm(prev => ({ ...prev, unit }))}
                    >
                      <Text style={[
                        styles.unitText,
                        logForm.unit === unit && styles.unitTextSelected
                      ]}>{unit}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Log Button */}
          <TouchableOpacity
            style={[styles.logButton, isLogging && styles.logButtonDisabled]}
            onPress={handleLogOil}
            disabled={isLogging}
          >
            {isLogging ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle" size={22} color="#fff" />
                <Text style={styles.logButtonText}>Add to Daily Log</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1b4a5a" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1b4a5a', '#0f3a47']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="sparkles" size={28} color="#fcaf56" />
          <Text style={styles.headerTitle}>AI Food Oil Analyzer</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions Card */}
        {!imageUri && (
          <View style={styles.instructionsCard}>
            <LinearGradient
              colors={['#d946ef', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.instructionsGradient}
            >
              <Ionicons name="restaurant" size={40} color="#fff" />
              <Text style={styles.instructionsTitle}>Analyze Your Food</Text>
              <Text style={styles.instructionsText}>
                Take a photo of your meal or select from gallery to get detailed oil content analysis
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Image Preview */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.analyzingText}>Analyzing food...</Text>
              </View>
            )}
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Action Buttons */}
        {!nutritionData && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => pickImage(true)}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={['#1b4a5a', '#0f3a47']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="camera" size={32} color="#fff" />
                <Text style={styles.actionButtonText}>Take Photo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => pickImage(false)}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={['#07A996', '#059669']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="images" size={32} color="#fff" />
                <Text style={styles.actionButtonText}>Gallery</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={openManualEntry}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="create" size={32} color="#fff" />
                <Text style={styles.actionButtonText}>Manual Entry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Results */}
        {nutritionData && (
          <View style={styles.resultsContainer}>
            {/* Food Name Card */}
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="fast-food" size={24} color="#1b4a5a" />
                <Text style={styles.resultTitle}>Detected Food</Text>
              </View>
              <Text style={styles.foodName}>{nutritionData.foodName}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="flame" size={16} color="#f59e0b" />
                  <Text style={styles.metaText}>{nutritionData.cookingMethod}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="resize" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>{nutritionData.servingSize}</Text>
                </View>
              </View>
            </View>

            {/* Oil Content Card */}
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="water" size={24} color="#f59e0b" />
                <Text style={styles.resultTitle}>Oil Content</Text>
              </View>
              <View style={styles.oilContentGrid}>
                <View style={styles.oilItem}>
                  <Text style={styles.oilValue}>{nutritionData.oilContent.totalOil}</Text>
                  <Text style={styles.oilLabel}>Total Oil</Text>
                </View>
                <View style={styles.oilItem}>
                  <Text style={styles.oilValue}>{nutritionData.oilContent.estimatedMl} ml</Text>
                  <Text style={styles.oilLabel}>Volume</Text>
                </View>
                <View style={styles.oilItem}>
                  <Text style={styles.oilValue}>{nutritionData.oilContent.calories}</Text>
                  <Text style={styles.oilLabel}>Calories</Text>
                </View>
              </View>
              <View style={styles.oilTypeRow}>
                <Ionicons name="beaker" size={16} color="#6b7280" />
                <Text style={styles.oilTypeText}>Oil Type: {nutritionData.oilContent.oilType}</Text>
              </View>
            </View>

            {/* Fat Breakdown Card */}
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="pie-chart" size={24} color="#8b5cf6" />
                <Text style={styles.resultTitle}>Fat Breakdown</Text>
              </View>
              <View style={styles.fatGrid}>
                <View style={styles.fatItem}>
                  <View style={[styles.fatDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.fatLabel}>Saturated</Text>
                  <Text style={styles.fatValue}>{nutritionData.fatBreakdown.saturatedFat}</Text>
                </View>
                <View style={styles.fatItem}>
                  <View style={[styles.fatDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={styles.fatLabel}>Trans Fat</Text>
                  <Text style={styles.fatValue}>{nutritionData.fatBreakdown.transFat}</Text>
                </View>
                <View style={styles.fatItem}>
                  <View style={[styles.fatDot, { backgroundColor: '#22c55e' }]} />
                  <Text style={styles.fatLabel}>Polyunsat.</Text>
                  <Text style={styles.fatValue}>{nutritionData.fatBreakdown.polyunsaturatedFat}</Text>
                </View>
                <View style={styles.fatItem}>
                  <View style={[styles.fatDot, { backgroundColor: '#3b82f6' }]} />
                  <Text style={styles.fatLabel}>Monounsat.</Text>
                  <Text style={styles.fatValue}>{nutritionData.fatBreakdown.monounsaturatedFat}</Text>
                </View>
              </View>
            </View>

            {/* Health Score Card */}
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="heart" size={24} color="#ec4899" />
                <Text style={styles.resultTitle}>Health Score</Text>
              </View>
              <View style={styles.healthScoreContainer}>
                <View style={[styles.healthScoreCircle, { borderColor: getHealthScoreColor(nutritionData.healthScore) }]}>
                  <Text style={[styles.healthScoreValue, { color: getHealthScoreColor(nutritionData.healthScore) }]}>
                    {nutritionData.healthScore}
                  </Text>
                  <Text style={styles.healthScoreMax}>/10</Text>
                </View>
                <View style={[styles.healthBadge, { backgroundColor: nutritionData.isHealthy ? '#dcfce7' : '#fef2f2' }]}>
                  <Ionicons 
                    name={nutritionData.isHealthy ? 'checkmark-circle' : 'alert-circle'} 
                    size={16} 
                    color={nutritionData.isHealthy ? '#22c55e' : '#ef4444'} 
                  />
                  <Text style={[styles.healthBadgeText, { color: nutritionData.isHealthy ? '#22c55e' : '#ef4444' }]}>
                    {nutritionData.isHealthy ? 'Healthy Choice' : 'High Oil Content'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Health Tips Card */}
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="bulb" size={24} color="#f59e0b" />
                <Text style={styles.resultTitle}>Health Tips</Text>
              </View>
              {nutritionData.healthTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#07A996" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>

            {/* Log to Oil Tracker Button */}
            {!logSuccess ? (
              <TouchableOpacity style={styles.logToTrackerButton} onPress={openLogModal}>
                <LinearGradient
                  colors={['#07A996', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.logToTrackerGradient}
                >
                  <Ionicons name="add-circle" size={24} color="#fff" />
                  <View style={styles.logToTrackerTextContainer}>
                    <Text style={styles.logToTrackerText}>Log to Oil Tracker</Text>
                    <Text style={styles.logToTrackerSubtext}>Add {nutritionData.oilContent.estimatedMl}ml to your daily log</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.loggedSuccessBanner}>
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <Text style={styles.loggedSuccessText}>Added to your daily oil log!</Text>
              </View>
            )}

            {/* Analyze Another Button */}
            <TouchableOpacity style={styles.resetButton} onPress={resetAnalysis}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.resetButtonText}>Analyze Another Food</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Log Modal */}
      {renderLogModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionsCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  instructionsGradient: {
    padding: 24,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#ef4444',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonGradient: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultsContainer: {
    gap: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  foodName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1b4a5a',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  oilContentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  oilItem: {
    alignItems: 'center',
  },
  oilValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f59e0b',
  },
  oilLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  oilTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  oilTypeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  fatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    gap: 8,
  },
  fatDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  fatLabel: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
  },
  fatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  healthScoreContainer: {
    alignItems: 'center',
    gap: 12,
  },
  healthScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  healthScoreValue: {
    fontSize: 36,
    fontWeight: '800',
  },
  healthScoreMax: {
    fontSize: 14,
    color: '#9ca3af',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  healthBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b4a5a',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
  // Log to Tracker Button
  logToTrackerButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#07A996',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logToTrackerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  logToTrackerTextContainer: {
    flex: 1,
  },
  logToTrackerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  logToTrackerSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  loggedSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  loggedSuccessText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#22c55e',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b4a5a',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#040707',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#1b4a5a',
  },
  chipText: {
    fontSize: 13,
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  mealTypeButtonSelected: {
    backgroundColor: '#1b4a5a',
  },
  mealTypeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  mealTypeTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  unitContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  unitButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  unitButtonSelected: {
    backgroundColor: '#1b4a5a',
  },
  unitText: {
    fontSize: 12,
    color: '#666',
  },
  unitTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07A996',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logButtonDisabled: {
    opacity: 0.6,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default FoodOilAnalyzerScreen;
