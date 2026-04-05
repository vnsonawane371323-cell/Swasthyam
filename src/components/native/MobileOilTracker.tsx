import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  SafeAreaView,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Progress } from './Progress';
import { calculateSwasthaIndex } from '../../utils/swasthaIndex';
import { searchFood, calculateOilAmount, FoodItem } from '../../data/foodDatabase';
import apiService from '../../services/api';
import { getWeightData } from '../../services/iotService';
import { notificationService } from '../../services/notificationService';
import { t } from '../../i18n';

interface MobileOilTrackerProps {
  navigation?: any;
  route?: { params?: { targetDate?: string } };
}

interface OilEntry {
  id: string;
  dish: string;
  amount: number;
  oil: string;
  time: string;
  mealType: string;
  quantity: number;
  unit: string;
  verified: boolean;
  date: string;
  consumedAt?: string;
}

const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// IoT Jar Constants
const JAR_WEIGHT = 262; // grams (empty jar weight)
const TOTAL_CAPACITY = 500; // ml capacity (500ml jar when filled)
const OIL_DENSITY = 0.91; // g/ml - density of cooking oil
const MAX_OIL_WEIGHT = TOTAL_CAPACITY * OIL_DENSITY; // 455g - max net oil weight when jar is full

// Calculate jar fill percentage (0-100%) based on net oil weight
const getFillPercentage = (netOilReading: number): number => {
  return Math.min(
    100,
    Math.max(0, (netOilReading / MAX_OIL_WEIGHT) * 100)
  );
};

// Calculate remaining ml of oil in jar
const getRemainingMl = (netOilReading: number): number => {
  const fillPercent = getFillPercentage(netOilReading);
  return Math.round((fillPercent / 100) * TOTAL_CAPACITY * 10) / 10;
};

// Subtract jar weight from raw reading
const getNetOilReading = (rawReading: number): number => {
  return Math.max(0, rawReading - JAR_WEIGHT);
};

export function MobileOilTracker({ navigation, route }: MobileOilTrackerProps) {
  const [showLogEntry, setShowLogEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'grams' | 'bowls' | 'pieces'>('grams');
  const [mealType, setMealType] = useState('');
  const [editingEntry, setEditingEntry] = useState<OilEntry | null>(null);
  const targetDateParam = route?.params?.targetDate;
  const [logDate, setLogDate] = useState<Date>(targetDateParam ? new Date(targetDateParam) : new Date());
  
  // Tab state for Manual Entry vs IoT Device
  const [activeTab, setActiveTab] = useState<'manual' | 'iot'>('manual');
  
  // IoT Device state
  const [iotDevices, setIotDevices] = useState<Array<{
    id: string;
    name: string;
    type: string;
    status: 'connected' | 'disconnected' | 'pairing';
    lastSync: string;
    batteryLevel?: number;
    latestReading?: number;
  }>>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [iotDish, setIotDish] = useState('');
  const [iotMealType, setIotMealType] = useState<'Breakfast' | 'Lunch' | 'Snack' | 'Dinner'>('Lunch');
  const [iotCookingMethod, setIotCookingMethod] = useState<'deep_fry' | 'shallow_fry' | 'saute' | 'boil'>('saute');
  const [iotReuseCount, setIotReuseCount] = useState('0');
  const [iotSelectedOil, setIotSelectedOil] = useState('');
  const [iotReadingInputType, setIotReadingInputType] = useState<'weight' | 'volume'>('weight');
  const [iotLastAnalysis, setIotLastAnalysis] = useState<null | {
    oilType: string;
    finalMl: number;
    calories: number;
    feedback: string;
    suggestion: string;
  }>(null);
  
  // Group logging state
  const [adminGroups, setAdminGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  // Update log date if navigation param changes (e.g., from calendar tap)
  useEffect(() => {
    if (targetDateParam) {
      setLogDate(new Date(targetDateParam));
    }
  }, [targetDateParam]);
  const [entries, setEntries] = useState<OilEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [personalizedLimit, setPersonalizedLimit] = useState<number | null>(null);
  const [personalizedGoalKcal, setPersonalizedGoalKcal] = useState<number | null>(null);

  const recentFoodItems = React.useMemo(() => {
    const seen = new Set<string>();
    const recent: FoodItem[] = [];
    entries.forEach((entry) => {
      if (!seen.has(entry.dish)) {
        const match = searchFood('').find(f => f.name === entry.dish);
        if (match) {
          seen.add(entry.dish);
          recent.push(match);
        }
      }
    });
    return recent;
  }, [entries]);

  const selectedDay = getLocalDateKey(logDate);
  // Calculate selected day's total from entries
  const dayEntries = entries.filter(entry => {
    const entryDate = entry.consumedAt ? new Date(entry.consumedAt) : new Date(entry.date);
    const entryDay = isNaN(entryDate.getTime()) ? entry.date : getLocalDateKey(entryDate);
    return entryDay === selectedDay;
  });
  const dayTotal = dayEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const dayTotalCal = Math.round(dayTotal * 9);
  const dayTarget = personalizedLimit || 40; // Use personalized limit or fallback to 40ml
  const dayTargetCal = (typeof personalizedGoalKcal === 'number' && Number.isFinite(personalizedGoalKcal))
    ? Math.round(personalizedGoalKcal)
    : Math.round(dayTarget * 8.1);
  const percentage = (dayTotal / dayTarget) * 100;

  // Load entries when date changes
  useEffect(() => {
    loadEntries();
  }, [logDate]);

  // Load admin groups on mount
  useEffect(() => {
    loadAdminGroups();
  }, []);

  // preload all foods
  useEffect(() => {
    handleSearch('');
  }, []);

  // Load IoT devices on mount
  useEffect(() => {
    loadIotDevices();
  }, []);

  const loadIotDevices = async () => {
    try {
      const reading = await getWeightData();
      const deviceId = String(reading?.deviceId || 'ESP32-UNKNOWN');
      const rawReadingValue = Number(reading?.oilAmount ?? reading?.weight ?? 0);
      const netOilReading = getNetOilReading(rawReadingValue);
      const isReachable = Number.isFinite(netOilReading) && netOilReading > 0;

      setIotDevices([{
        id: deviceId,
        name: 'ESP32 Smart Oil Tracker',
        type: 'oil_dispenser',
        status: isReachable ? 'connected' : 'disconnected',
        lastSync: String(reading?.timestamp || new Date().toISOString()),
        batteryLevel: Number.isFinite(Number(reading?.batteryLevel)) ? Number(reading?.batteryLevel) : undefined,
        latestReading: Number.isFinite(netOilReading) ? Math.round(netOilReading * 10) / 10 : undefined,
      }]);
    } catch (error) {
      console.error('Error loading IoT devices:', error);
      setIotDevices([]);
    }
  };

  const handleScanForDevices = async () => {
    try {
      setIsScanning(true);
      const reading = await getWeightData();
      const deviceId = String(reading?.deviceId || 'ESP32-UNKNOWN');
      const rawReadingValue = Number(reading?.oilAmount ?? reading?.weight ?? 0);
      const netOilReading = getNetOilReading(rawReadingValue);
      const isReachable = Number.isFinite(netOilReading) && netOilReading > 0;

      if (isReachable) {
        setIotDevices([{
          id: deviceId,
          name: 'ESP32 Smart Oil Tracker',
          type: 'oil_dispenser',
          status: 'connected',
          lastSync: String(reading?.timestamp || new Date().toISOString()),
          batteryLevel: Number.isFinite(Number(reading?.batteryLevel)) ? Number(reading?.batteryLevel) : undefined,
          latestReading: Math.round(netOilReading * 10) / 10,
        }]);
        Alert.alert('Scan Complete', 'ESP32 device found and connected successfully.');
      } else {
        Alert.alert('Scan Complete', 'No reachable ESP32 device found. Ensure device and backend are online.');
      }
    } catch (error) {
      Alert.alert('Scan Failed', 'Unable to reach ESP32 or backend. Check network and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handlePairDevice = async (deviceId: string) => {
    try {
      setIsPairing(true);
      const reading = await getWeightData();
      const rawReadingValue = Number(reading?.oilAmount ?? reading?.weight ?? 0);
      const netOilReading = getNetOilReading(rawReadingValue);
      const isReachable = Number.isFinite(netOilReading) && netOilReading > 0;

      if (!isReachable) {
        Alert.alert('Pairing Failed', 'Device not reachable. Keep ESP32 powered on and connected to Wi-Fi.');
        return;
      }

      setIotDevices(prev => prev.map(d =>
        d.id === deviceId
          ? {
              ...d,
              status: 'connected' as const,
              lastSync: String(reading?.timestamp || new Date().toISOString()),
              batteryLevel: Number.isFinite(Number(reading?.batteryLevel)) ? Number(reading?.batteryLevel) : d.batteryLevel,
              latestReading: Math.round(netOilReading * 10) / 10,
            }
          : d
      ));

      Alert.alert('Success', 'ESP32 device paired and connected successfully.');
    } catch (error) {
      Alert.alert('Pairing Failed', 'Unable to pair with ESP32 right now. Please retry.');
    } finally {
      setIsPairing(false);
    }
  };

  const handleDisconnectDevice = (deviceId: string) => {
    Alert.alert(
      'Disconnect Device',
      'Are you sure you want to disconnect this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setIotDevices(prev => prev.map(d => 
              d.id === deviceId ? { ...d, status: 'disconnected' as const } : d
            ));
          },
        },
      ]
    );
  };

  const handleSyncDevice = async (deviceId: string) => {
    try {
      setIsLoading(true);
      const reading = await getWeightData();
      const rawReadingValue = Number(reading?.oilAmount ?? reading?.weight ?? 0);
      const netOilReading = getNetOilReading(rawReadingValue);
      
      // Update last sync time
      setIotDevices(prev => prev.map(d => 
        d.id === deviceId
          ? {
              ...d,
              lastSync: String(reading?.timestamp || new Date().toISOString()),
              latestReading: Number.isFinite(netOilReading) ? Math.round(netOilReading * 10) / 10 : d.latestReading,
              batteryLevel: Number.isFinite(Number(reading?.batteryLevel)) ? Number(reading?.batteryLevel) : d.batteryLevel,
            }
          : d
      ));
      
      // Reload entries to show any new data
      await loadEntries();
      Alert.alert('Sync Complete', `Latest ESP32 reading: ${Number.isFinite(netOilReading) ? Math.round(netOilReading * 10) / 10 : 0}g (after jar weight)`);
    } catch (error) {
      Alert.alert('Error', 'Failed to sync device data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminGroups = async () => {
    try {
      const response = await apiService.getAdminGroups();
      if (response.success && response.data) {
        setAdminGroups(response.data);
      }
    } catch (error) {
      console.error('Error loading admin groups:', error);
    }
  };

  const handleGroupChange = async (groupId: string | null) => {
    setSelectedGroup(groupId);
    setSelectedMembers(new Set());
    
    if (groupId) {
      try {
        const response = await apiService.getGroup(groupId);
        if (response.success && response.data) {
          const activeMembers = response.data.members.filter(m => m.status === 'active');
          setGroupMembers(activeMembers);
        }
      } catch (error) {
        console.error('Error loading group members:', error);
      }
    } else {
      setGroupMembers([]);
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const base = searchFood(query);
    // Put recent matches on top when query empty or matches
    if (!query) {
      const recentSet = new Set(recentFoodItems.map(f => f.id));
      const merged = [...recentFoodItems, ...base.filter(f => !recentSet.has(f.id))];
      setSearchResults(merged);
    } else {
      // For queried list, keep order as found
      setSearchResults(base);
    }
  };

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const dateOnly = getLocalDateKey(logDate);
      
      // Fetch personalized oil status
      const statusResponse = await apiService.getUserOilStatus(dateOnly);
      if (statusResponse.success && statusResponse.data) {
        setPersonalizedLimit(statusResponse.data.goalMl);
        setPersonalizedGoalKcal(
          typeof statusResponse.data.goalKcal === 'number' && Number.isFinite(statusResponse.data.goalKcal)
            ? statusResponse.data.goalKcal
            : null
        );
      }
      
      const response = await apiService.getTodayOilConsumption(dateOnly);
      if (response.success && response.data) {
        // Transform API entries to local format
        const formattedEntries: OilEntry[] = response.data.entries.map(entry => ({
          id: entry._id, // Store the actual MongoDB _id for deletion
          dish: entry.foodName,
          amount: entry.oilAmount,
          oil: entry.oilType,
          time: new Date(entry.consumedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          mealType: entry.mealType,
          quantity: entry.quantity,
          unit: entry.unit,
          verified: entry.verified,
          date: new Date(entry.consumedAt).toDateString(),
          consumedAt: entry.consumedAt,
        }));
        formattedEntries.sort((a, b) => {
          const dateA = a.consumedAt ? new Date(a.consumedAt).getTime() : 0;
          const dateB = b.consumedAt ? new Date(b.consumedAt).getTime() : 0;
          return dateB - dateA;
        });
        setEntries(formattedEntries);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    // Set default unit based on food type
    if (food.countable) {
      setUnit('pieces');
    } else if (food.category === 'dal' || food.category === 'gravy' || food.category === 'rich_curry') {
      setUnit('bowls');
    } else {
      setUnit('grams');
    }
  };

  const handleEditEntry = (entry: OilEntry) => {
    const food = searchFood('').find(f => f.name === entry.dish);
    if (food) {
      setEditingEntry(entry);
      setSelectedFood(food);
      setQuantity(entry.quantity.toString());
      setUnit(entry.unit as 'grams' | 'bowls' | 'pieces');
      setMealType(entry.mealType);
      setShowLogEntry(true);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await apiService.deleteOilEntry(entryId);
              if (response.success) {
                Alert.alert('Success', 'Entry deleted successfully');
                // Reload entries from server
                await loadEntries();
              } else {
                Alert.alert('Error', 'Failed to delete entry');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete entry');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLog = async () => {
    if (!selectedFood || !quantity || !mealType) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // If group mode and no members selected
    if (selectedGroup && selectedMembers.size === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    try {
      setIsLoading(true);
      const oilAmount = calculateOilAmount(selectedFood, parseFloat(quantity), unit);
      
      // Scale totalCalories and oilCalories based on quantity
      const scalingFactor = (() => {
        const quantityNumber = parseFloat(quantity);
        if (unit === 'bowls' || (unit === 'pieces' && selectedFood.countable)) {
          return quantityNumber; // Direct multiplication for bowls/pieces
        } else {
          // For grams: quantity is in grams, serving is in grams
          return quantityNumber / (selectedFood.servingGrams || 100);
        }
      })();
      
      const scaledTotalCalories = selectedFood.totalCalories ? Math.round(selectedFood.totalCalories * scalingFactor) : 0;
      const scaledOilCalories = selectedFood.oilCalories ? Math.round(selectedFood.oilCalories * scalingFactor) : 0;
      
      const dateOnly = getLocalDateKey(logDate);
      const consumedAt = `${dateOnly}T12:00:00Z`;

      // Group logging
      if (selectedGroup && selectedMembers.size > 0) {
        const consumptionData = Array.from(selectedMembers).map(userId => ({
          userId,
          foodName: selectedFood.name,
          oilType: 'Vegetable Oil',
          oilAmount,
          quantity: parseFloat(quantity),
          unit,
          mealType: mealType as 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner',
          totalCalories: scaledTotalCalories,
          oilCalories: scaledOilCalories,
        }));

        const response = await apiService.logGroupConsumption(selectedGroup, consumptionData);
        
        if (response.success) {
          const caloriesLogged = Math.round(oilAmount * 9);
          Alert.alert(
            'Success', 
            `Logged ${caloriesLogged} cal (${oilAmount.toFixed(1)}ml) for ${selectedMembers.size} member(s)`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate back to Home to refresh progress bars
                  console.log('🛢️ [OilTracker] Going back to Home after group log');
                  navigation.goBack();
                }
              }
            ]
          );
          
          // Reset form
          setSelectedFood(null);
          setQuantity('');
          setMealType('');
          setSelectedGroup(null);
          setSelectedMembers(new Set());
          setGroupMembers([]);
          setShowLogEntry(false);
          loadEntries(); // Reload entries to show updated data
        } else {
          Alert.alert('Error', response.message || 'Failed to log group consumption');
        }
      } else {
        // Individual logging
        const response = await apiService.logOilConsumption({
          foodName: selectedFood.name,
          oilType: 'Vegetable Oil',
          oilAmount,
          quantity: parseFloat(quantity),
          unit,
          mealType: mealType as 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner',
          consumedAt,
          totalCalories: scaledTotalCalories,
          oilCalories: scaledOilCalories,
        });

        if (response.success && response.data) {
          // Add the new entry to local state using the MongoDB _id
          const newEntry: OilEntry = {
            id: (response.data as any).entry?._id || response.data._id || Date.now().toString(), // Use the actual MongoDB ID
            dish: selectedFood.name,
            amount: Math.round(oilAmount * 10) / 10,
            oil: 'Vegetable Oil',
            time: new Date(consumedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            mealType,
            quantity: parseFloat(quantity),
            unit,
            verified: true,
            date: new Date(consumedAt).toDateString(),
            consumedAt,
          };
          
          if (editingEntry) {
            // Update existing entry - reload from server to get fresh data
            await loadEntries();
            Alert.alert('Success', 'Entry updated successfully', [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate back to Home to refresh progress bars
                  console.log('🛢️ [OilTracker] Going back to Home after edit');
                  navigation.goBack();
                }
              }
            ]);
          } else {
            // Reload entries from server to get the proper MongoDB ID
            await loadEntries();
            const caloriesLogged = Math.round(oilAmount * 9);
            Alert.alert('Success', `Logged ${caloriesLogged} cal (${oilAmount.toFixed(1)}ml)`, [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate back to Home to refresh progress bars
                  console.log('🛢️ [OilTracker] Going back to Home after log. Oil amount:', oilAmount, 'ml');
                  navigation.goBack();
                }
              }
            ]);
          }
          
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
          
          // Reset form
          setSelectedFood(null);
          setQuantity('');
          setMealType('');
          setEditingEntry(null);
          setShowLogEntry(false);
        } else {
          Alert.alert('Error', response.message || 'Failed to log consumption');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to log consumption');
      console.error('Error logging:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIotLog = async () => {
    try {
      const primaryDevice = iotDevices.find(d => d.status === 'connected' && typeof d.latestReading === 'number');
      const readingValue = Number(primaryDevice?.latestReading ?? 0);

      if (!Number.isFinite(readingValue) || readingValue <= 0) {
        Alert.alert('No IoT Reading', 'Please sync your device first to fetch a valid reading.');
        return;
      }

      setIsLoading(true);

      const analyzePayload: any = {
        cooking_method: iotCookingMethod,
        reuse_count: Math.max(0, Math.floor(Number(iotReuseCount) || 0)),
        dish: iotDish.trim() || 'IoT Logged Oil',
      };

      if (iotSelectedOil.trim()) {
        analyzePayload.user_selected_oil = iotSelectedOil.trim();
      }

      if (iotReadingInputType === 'weight') {
        analyzePayload.weight_grams = readingValue;
      } else {
        analyzePayload.volume_ml = readingValue;
      }

      const analysisResponse = await apiService.analyzeIotOil(analyzePayload);
      if (!analysisResponse.success || !analysisResponse.data) {
        Alert.alert('Error', analysisResponse.message || 'Failed to analyze IoT oil usage.');
        return;
      }

      const analysis = analysisResponse.data;
      const dateOnly = getLocalDateKey(logDate);
      const consumedAt = `${dateOnly}T12:00:00Z`;

      const logResponse = await apiService.logOilConsumption({
        foodName: iotDish.trim() || 'IoT Logged Oil',
        oilType: analysis.oil_type,
        oilAmount: analysis.final_adjusted_volume_ml,
        quantity: 1,
        unit: 'pieces',
        mealType: iotMealType,
        consumedAt,
        totalCalories: Math.round(analysis.calories),
        oilCalories: Math.round(analysis.calories),
      });

      if (!logResponse.success) {
        Alert.alert('Error', logResponse.message || 'Failed to log IoT consumption.');
        return;
      }

      setIotLastAnalysis({
        oilType: analysis.oil_type,
        finalMl: analysis.final_adjusted_volume_ml,
        calories: analysis.calories,
        feedback: analysis.feedback,
        suggestion: analysis.suggestion,
      });

      // Optimistically update jar level in UI after logging consumption.
      const consumedMl = Number(analysis.final_adjusted_volume_ml) || 0;
      const consumedGrams = consumedMl * OIL_DENSITY;
      if (consumedGrams > 0) {
        setIotDevices(prev =>
          prev.map(d => {
            if (d.id !== primaryDevice?.id || typeof d.latestReading !== 'number') {
              return d;
            }

            return {
              ...d,
              latestReading: Math.max(0, Math.round((d.latestReading - consumedGrams) * 10) / 10),
            };
          })
        );
      }

      await loadEntries();
      Alert.alert(
        'IoT Oil Logged',
        `${analysis.feedback}\n\nLogged: ${analysis.final_adjusted_volume_ml.toFixed(1)} ml (${Math.round(analysis.calories)} kcal)\nSuggestion: ${analysis.suggestion}`
      );
    } catch (error) {
      console.error('IoT log error:', error);
      Alert.alert('Error', 'Failed to log IoT oil usage.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1b4a5a', '#0f3a47']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => navigation?.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="water" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.title}>{t('navigation.oilTracker')}</Text>
              <Text style={styles.subtitle}>{t('oilTracker.title')}</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>{t('oilTracker.totalToday')}</Text>
          <View style={styles.progressValues}>
            <Text style={styles.progressCurrent}>{dayTotalCal} cal</Text>
            <Text style={styles.progressTarget}>/ {dayTargetCal} cal</Text>
          </View>
          <Progress value={percentage} style={styles.progressBar} />
          <Text style={styles.progressRemaining}>
            {Math.max(0, dayTargetCal - dayTotalCal)} cal {t('home.remaining')}
          </Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'manual' && styles.tabActive]}
            onPress={() => setActiveTab('manual')}
          >
            <Ionicons 
              name="create-outline" 
              size={20} 
              color={activeTab === 'manual' ? '#ffffff' : '#5B5B5B'} 
            />
            <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>
              Manual Entry
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'iot' && styles.tabActive]}
            onPress={() => setActiveTab('iot')}
          >
            <Ionicons 
              name="hardware-chip-outline" 
              size={20} 
              color={activeTab === 'iot' ? '#ffffff' : '#5B5B5B'} 
            />
            <Text style={[styles.tabText, activeTab === 'iot' && styles.tabTextActive]}>
              IoT Device
            </Text>
          </TouchableOpacity>
        </View>

        {/* IoT Device Tab Content */}
        {activeTab === 'iot' && (
          <View style={styles.iotContainer}>
            {/* Connected Devices Section */}
            <View style={styles.iotSection}>
              <Text style={styles.iotSectionTitle}>Connected Devices</Text>
              {iotDevices.length === 0 ? (
                <Card style={styles.iotEmptyCard}>
                  <CardContent style={styles.iotEmptyContent}>
                    <Ionicons name="hardware-chip-outline" size={48} color="#d1d5db" />
                    <Text style={styles.iotEmptyText}>No devices connected</Text>
                    <Text style={styles.iotEmptySubtext}>Scan for nearby smart oil dispensers</Text>
                  </CardContent>
                </Card>
              ) : (
                iotDevices.map((device) => (
                  <TouchableOpacity 
                    key={device.id} 
                    onPress={() => navigation?.navigate('IoTDeviceDetail', { device })}
                    activeOpacity={0.7}
                  >
                  <Card style={styles.iotDeviceCard}>
                    <CardContent style={styles.iotDeviceContent}>
                      <View style={styles.iotDeviceHeader}>
                        <View style={[
                          styles.iotDeviceIcon,
                          device.status === 'connected' && styles.iotDeviceIconConnected,
                          device.status === 'disconnected' && styles.iotDeviceIconDisconnected,
                        ]}>
                          <Ionicons 
                            name={device.type === 'oil_dispenser' ? 'water' : 'hardware-chip'} 
                            size={24} 
                            color={device.status === 'connected' ? '#16a34a' : '#9ca3af'} 
                          />
                        </View>
                        <View style={styles.iotDeviceInfo}>
                          <Text style={styles.iotDeviceName}>{device.name}</Text>
                          <View style={styles.iotDeviceStatus}>
                            <View style={[
                              styles.statusDot,
                              device.status === 'connected' && styles.statusDotConnected,
                              device.status === 'disconnected' && styles.statusDotDisconnected,
                              device.status === 'pairing' && styles.statusDotPairing,
                            ]} />
                            <Text style={styles.iotDeviceStatusText}>
                              {device.status === 'connected' ? 'Connected' : 
                               device.status === 'disconnected' ? 'Disconnected' : 'Pairing...'}
                            </Text>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        {device.batteryLevel !== undefined && (
                          <View style={styles.batteryIndicator}>
                            <Ionicons 
                              name={device.batteryLevel > 50 ? 'battery-full' : 
                                    device.batteryLevel > 20 ? 'battery-half' : 'battery-dead'} 
                              size={20} 
                              color={device.batteryLevel > 20 ? '#16a34a' : '#ef4444'} 
                            />
                            <Text style={styles.batteryText}>{device.batteryLevel}%</Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.iotDeviceDetails}>
                        <Text style={styles.iotDeviceLastSync}>
                          Last sync: {new Date(device.lastSync).toLocaleString()}
                        </Text>
                        {typeof device.latestReading === 'number' && (
                          <>
                            <Text style={styles.iotDeviceLastSync}>
                              Latest sensor reading: {device.latestReading}g (net oil)
                            </Text>
                            <Text style={styles.iotDeviceLastSync}>
                              Jar fill: {getFillPercentage(device.latestReading).toFixed(1)}%
                            </Text>
                            {/* Visual Jar Fill Indicator */}
                            <View style={styles.jarFillContainer}>
                              <View style={styles.jarFillBackground}>
                                <View 
                                  style={[
                                    styles.jarFillBar,
                                    { 
                                      height: `${getFillPercentage(device.latestReading)}%`,
                                      backgroundColor: getFillPercentage(device.latestReading) > 80 ? '#ef4444' : 
                                                       getFillPercentage(device.latestReading) > 50 ? '#f5a623' : 
                                                       '#10b981'
                                    }
                                  ]}
                                />
                              </View>
                              <Text style={styles.jarFillLabel}>
                                {getRemainingMl(device.latestReading)}ml remaining (out of {TOTAL_CAPACITY}ml)
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                      
                      <View style={styles.iotDeviceActions}>
                        {device.status === 'connected' ? (
                          <>
                            <TouchableOpacity 
                              style={styles.iotActionButton}
                              onPress={() => handleSyncDevice(device.id)}
                            >
                              <Ionicons name="sync" size={18} color="#3b82f6" />
                              <Text style={styles.iotActionButtonText}>Sync Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={[styles.iotActionButton, styles.iotActionButtonDanger]}
                              onPress={() => handleDisconnectDevice(device.id)}
                            >
                              <Ionicons name="close-circle" size={18} color="#ef4444" />
                              <Text style={[styles.iotActionButtonText, styles.iotActionButtonTextDanger]}>
                                Disconnect
                              </Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <TouchableOpacity 
                            style={[styles.iotActionButton, styles.iotActionButtonPrimary]}
                            onPress={() => handlePairDevice(device.id)}
                            disabled={isPairing}
                          >
                            <Ionicons name="bluetooth" size={18} color="#ffffff" />
                            <Text style={styles.iotActionButtonTextPrimary}>
                              {isPairing ? 'Pairing...' : 'Reconnect'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </CardContent>
                  </Card>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Scan for Devices Button */}
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanForDevices}
              disabled={isScanning}
            >
              <View style={styles.scanButtonContent}>
                <View style={styles.scanButtonIcon}>
                  <Ionicons 
                    name={isScanning ? 'radio' : 'search'} 
                    size={28} 
                    color="#ffffff" 
                  />
                </View>
                <View style={styles.scanButtonTextContainer}>
                  <Text style={styles.scanButtonText}>
                    {isScanning ? 'Scanning...' : 'Scan for Devices'}
                  </Text>
                  <Text style={styles.scanButtonSubtext}>
                    Discover ESP32 tracker and connect
                  </Text>
                </View>
                {isScanning ? (
                  <Ionicons name="ellipsis-horizontal" size={24} color="rgba(255,255,255,0.8)" />
                ) : (
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                )}
              </View>
            </TouchableOpacity>

            {/* How it Works Section */}
            <Card style={styles.howItWorksCard}>
              <CardContent style={styles.howItWorksContent}>
                <Text style={styles.howItWorksTitle}>How IoT Tracking Works</Text>
                <View style={styles.howItWorksStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Connect Your Device</Text>
                    <Text style={styles.stepDescription}>
                      Pair your smart oil dispenser via Bluetooth
                    </Text>
                  </View>
                </View>
                <View style={styles.howItWorksStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Automatic Tracking</Text>
                    <Text style={styles.stepDescription}>
                      Oil usage is measured and logged automatically
                    </Text>
                  </View>
                </View>
                <View style={styles.howItWorksStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Sync & Review</Text>
                    <Text style={styles.stepDescription}>
                      Data syncs to your account for health insights
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            <Card style={styles.logCard}>
              <CardContent style={styles.logContent}>
                <View style={styles.logHeader}>
                  <Text style={styles.logTitle}>Log Oil from IoT</Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Latest Sensor Reading</Text>
                  <Text style={styles.iotDeviceLastSync}>
                    {(() => {
                      const reading = iotDevices.find(d => d.status === 'connected' && typeof d.latestReading === 'number')?.latestReading;
                      const fillPct = typeof reading === 'number' ? getFillPercentage(reading).toFixed(1) : 0;
                      return typeof reading === 'number' ? `${reading}g (${fillPct}% filled)` : 'No synced reading available';
                    })()}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Reading Type</Text>
                  <View style={styles.mealTypeButtons}>
                    <TouchableOpacity
                      style={[styles.mealButton, iotReadingInputType === 'weight' && styles.mealButtonActive]}
                      onPress={() => setIotReadingInputType('weight')}
                    >
                      <Text style={[styles.mealButtonText, iotReadingInputType === 'weight' && styles.mealButtonTextActive]}>
                        Weight (g)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.mealButton, iotReadingInputType === 'volume' && styles.mealButtonActive]}
                      onPress={() => setIotReadingInputType('volume')}
                    >
                      <Text style={[styles.mealButtonText, iotReadingInputType === 'volume' && styles.mealButtonTextActive]}>
                        Volume (ml)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Dish (optional)</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="e.g., Aloo Sabzi"
                    value={iotDish}
                    onChangeText={setIotDish}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Fallback Oil (optional)</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="mustard_oil / sunflower_oil / olive_oil / coconut_oil / ghee"
                    value={iotSelectedOil}
                    onChangeText={setIotSelectedOil}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Cooking Method</Text>
                  <View style={styles.mealTypeButtons}>
                    {[
                      { key: 'deep_fry', label: 'Deep Fry' },
                      { key: 'shallow_fry', label: 'Shallow Fry' },
                      { key: 'saute', label: 'Saute' },
                      { key: 'boil', label: 'Boil' },
                    ].map((method) => (
                      <TouchableOpacity
                        key={method.key}
                        style={[styles.mealButton, iotCookingMethod === method.key && styles.mealButtonActive]}
                        onPress={() => setIotCookingMethod(method.key as any)}
                      >
                        <Text style={[styles.mealButtonText, iotCookingMethod === method.key && styles.mealButtonTextActive]}>
                          {method.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Reuse Count</Text>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={iotReuseCount}
                    onChangeText={setIotReuseCount}
                    placeholder="0"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Meal Type</Text>
                  <View style={styles.mealTypeButtons}>
                    {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((meal) => (
                      <TouchableOpacity
                        key={meal}
                        style={[styles.mealButton, iotMealType === meal && styles.mealButtonActive]}
                        onPress={() => setIotMealType(meal as 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner')}
                      >
                        <Text style={[styles.mealButtonText, iotMealType === meal && styles.mealButtonTextActive]}>
                          {meal}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {iotLastAnalysis && (
                  <View style={styles.warningCard}>
                    <Text style={styles.warningText}>
                      Last analysis: {iotLastAnalysis.oilType}, {iotLastAnalysis.finalMl.toFixed(1)} ml, {Math.round(iotLastAnalysis.calories)} kcal.
                    </Text>
                    <Text style={styles.warningText}>{iotLastAnalysis.feedback}</Text>
                    <Text style={styles.warningText}>{iotLastAnalysis.suggestion}</Text>
                  </View>
                )}

                <Button onPress={handleIotLog} style={styles.saveButton}>
                  {isLoading ? 'Processing...' : 'Analyze + Log IoT Oil'}
                </Button>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Manual Entry Tab Content */}
        {activeTab === 'manual' && (
          <>
        {/* Log Entry Form - Always Visible */}
        {showLogEntry && (
          <Card style={styles.logCard}>
            <CardContent style={styles.logContent}>
              <View style={styles.logHeader}>
                <Text style={styles.logTitle}>{editingEntry ? t('oilTracker.addEntry') : t('oilTracker.addEntry')}</Text>
                <TouchableOpacity onPress={() => {
                  setShowLogEntry(false);
                  setEditingEntry(null);
                  setSelectedFood(null);
                  setQuantity('');
                  setMealType('');
                }}>
                  <Ionicons name="close" size={24} color="#5B5B5B" />
                </TouchableOpacity>
              </View>

              {/* Food List with search */}
              {!selectedFood && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Select Food Item</Text>
                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#5B5B5B" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search for dish..."
                      value={searchQuery}
                      onChangeText={handleSearch}
                    />
                  </View>
                  <ScrollView style={styles.searchResults} nestedScrollEnabled>
                    {searchResults.map((food) => (
                      <TouchableOpacity
                        key={food.id}
                        style={styles.searchResultItem}
                        onPress={() => handleSelectFood(food)}
                      >
                        <View style={styles.searchResultContent}>
                          <Text style={styles.searchResultName}>{food.name}</Text>
                          <Text style={styles.searchResultCategory}>{food.category} • {food.oilGrams}g oil per {food.servingGrams}g</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Selected Food Details */}
              {selectedFood && (
                <>
                  <View style={styles.selectedFoodCard}>
                    <View style={styles.selectedFoodHeader}>
                      <View style={styles.selectedFoodInfo}>
                        <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                        <Text style={styles.selectedFoodMeta}>
                          {selectedFood.category} • {selectedFood.oilGrams}g oil per serving
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => setSelectedFood(null)}>
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Quantity Input */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Quantity</Text>
                    <View style={styles.quantityRow}>
                      <TextInput
                        style={styles.quantityInput}
                        placeholder="Enter quantity"
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                      />
                      <View style={styles.unitButtons}>
                        {selectedFood.countable && (
                          <TouchableOpacity
                            style={[styles.unitButton, unit === 'pieces' && styles.unitButtonActive]}
                            onPress={() => setUnit('pieces')}
                          >
                            <Text style={[styles.unitButtonText, unit === 'pieces' && styles.unitButtonTextActive]}>
                              Pieces
                            </Text>
                          </TouchableOpacity>
                        )}
                        {(selectedFood.category === 'dal' || selectedFood.category === 'gravy' || selectedFood.category === 'rich_curry') && (
                          <TouchableOpacity
                            style={[styles.unitButton, unit === 'bowls' && styles.unitButtonActive]}
                            onPress={() => setUnit('bowls')}
                          >
                            <Text style={[styles.unitButtonText, unit === 'bowls' && styles.unitButtonTextActive]}>
                              Bowls
                            </Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.unitButton, unit === 'grams' && styles.unitButtonActive]}
                          onPress={() => setUnit('grams')}
                        >
                          <Text style={[styles.unitButtonText, unit === 'grams' && styles.unitButtonTextActive]}>
                            Grams
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {quantity && (
                      <>
                        {(unit === 'bowls' || unit === 'pieces') && (
                          <Text style={styles.gramEquivalent}>
                            = {parseFloat(quantity) * selectedFood.servingGrams}g
                          </Text>
                        )}
                        <Text style={styles.oilEstimate}>
                          ≈ {Math.round(calculateOilAmount(selectedFood, parseFloat(quantity), unit) * 9)} cal ({calculateOilAmount(selectedFood, parseFloat(quantity), unit).toFixed(1)}g oil)
                        </Text>
                      </>
                    )}
                  </View>

                  {/* Meal Type */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Meal Type</Text>
                    <View style={styles.mealTypeButtons}>
                      {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((meal) => (
                        <TouchableOpacity
                          key={meal}
                          style={[styles.mealButton, mealType === meal && styles.mealButtonActive]}
                          onPress={() => setMealType(meal)}
                        >
                          <Text style={[styles.mealButtonText, mealType === meal && styles.mealButtonTextActive]}>
                            {meal}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Group Logging Section */}
                  {!editingEntry && adminGroups.length > 0 && (
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Group Logging</Text>
                      <View style={styles.groupToggleRow}>
                        <TouchableOpacity
                          style={[styles.groupToggle, !selectedGroup && styles.groupToggleActive]}
                          onPress={() => handleGroupChange(null)}
                        >
                          <Ionicons 
                            name="person" 
                            size={20} 
                            color={!selectedGroup ? '#1b4a5a' : '#9ca3af'} 
                          />
                          <Text style={[styles.groupToggleText, !selectedGroup && styles.groupToggleTextActive]}>
                            Log for Self
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.groupToggle, selectedGroup && styles.groupToggleActive]}
                          onPress={() => {
                            if (adminGroups.length > 0) {
                              handleGroupChange(adminGroups[0]._id);
                            }
                          }}
                        >
                          <Ionicons 
                            name="people" 
                            size={20} 
                            color={selectedGroup ? '#1b4a5a' : '#9ca3af'} 
                          />
                          <Text style={[styles.groupToggleText, selectedGroup && styles.groupToggleTextActive]}>
                            Log for Members
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {selectedGroup && (
                        <>
                          {/* Group Selector */}
                          <View style={styles.groupSelector}>
                            <Text style={styles.groupSelectorLabel}>Select Group</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupChips}>
                              {adminGroups.map((group) => (
                                <TouchableOpacity
                                  key={group._id}
                                  style={[
                                    styles.groupChip,
                                    selectedGroup === group._id && styles.groupChipActive
                                  ]}
                                  onPress={() => handleGroupChange(group._id)}
                                >
                                  <Text style={[
                                    styles.groupChipText,
                                    selectedGroup === group._id && styles.groupChipTextActive
                                  ]}>
                                    {group.name}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>

                          {/* Member Selection */}
                          {groupMembers.length > 0 && (
                            <View style={styles.memberSelection}>
                              <Text style={styles.memberSelectionLabel}>Select Members</Text>
                              <View style={styles.memberList}>
                                {groupMembers.map((member) => (
                                  <TouchableOpacity
                                    key={member.userId._id}
                                    style={[
                                      styles.memberItem,
                                      selectedMembers.has(member.userId._id) && styles.memberItemSelected
                                    ]}
                                    onPress={() => toggleMemberSelection(member.userId._id)}
                                  >
                                    <View style={styles.memberAvatar}>
                                      <Ionicons name="person" size={20} color="#1b4a5a" />
                                    </View>
                                    <View style={styles.memberDetails}>
                                      <Text style={styles.memberName}>
                                        {member.userId.name || member.userId.email}
                                      </Text>
                                      <Text style={styles.memberEmail}>{member.userId.email}</Text>
                                    </View>
                                    {selectedMembers.has(member.userId._id) && (
                                      <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                                    )}
                                  </TouchableOpacity>
                                ))}
                              </View>
                              {selectedMembers.size > 0 && (
                                <View style={styles.selectedCount}>
                                  <Text style={styles.selectedCountText}>
                                    {selectedMembers.size} member(s) selected
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  )}
                </>
              )}

              <View style={styles.buttonRow}>
                <Button
                  variant="outline"
                  onPress={() => {
                    setShowLogEntry(false);
                    setEditingEntry(null);
                    setSelectedFood(null);
                    setQuantity('');
                    setMealType('');
                  }}
                  style={styles.cancelButton}
                >
                  {t('common.cancel')}
                </Button>
                <Button onPress={handleLog} style={styles.saveButton}>
                  {editingEntry ? t('common.save') : t('common.save')}
                </Button>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Log Entry Button */}
        <TouchableOpacity
          style={styles.logButton}
          onPress={() => setShowLogEntry(!showLogEntry)}
        >
          <View style={styles.logButtonContent}>
            <View style={styles.logButtonIcon}>
              <Ionicons name="add-circle" size={28} color="#ffffff" />
            </View>
            <View style={styles.logButtonTextContainer}>
              <Text style={styles.logButtonText}>{t('oilTracker.addEntry')}</Text>
              <Text style={styles.logButtonSubtext}>Track what you cooked today</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </TouchableOpacity>

        {/* Recent Entries by Meal Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Entries</Text>
          {dayEntries.length === 0 ? (
            <Card style={styles.entryCard}>
              <CardContent style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No entries yet</Text>
                <Text style={styles.emptySubtext}>Start tracking your oil consumption</Text>
              </CardContent>
            </Card>
          ) : (
            ['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(meal => {
              const group = dayEntries.filter(e => e.mealType === meal);
              if (group.length === 0) return null;
              return (
                <View key={meal} style={{ marginBottom: 16 }}>
                  <View style={styles.mealDivider}>
                    <View style={styles.mealDividerLine} />
                    <Text style={styles.mealGroupTitle}>{meal}</Text>
                    <View style={styles.mealDividerLine} />
                  </View>
                  {group.map((entry) => (
                    <Card key={entry.id} style={styles.entryCard}>
                      <CardContent style={styles.entryContent}>
                        <View style={styles.entryHeader}>
                          <View style={styles.entryTitleRow}>
                            <Text style={styles.entryDish}>{entry.dish}</Text>
                            {entry.verified && (
                              <Badge variant="success">
                                <View style={styles.badgeContent}>
                                  <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
                                  <Text style={styles.badgeText}>{t('groups.verified')}</Text>
                                </View>
                              </Badge>
                            )}
                          </View>
                          <View style={styles.entryActions}>
                            <TouchableOpacity onPress={() => handleEditEntry(entry)} style={styles.actionButton}>
                              <Ionicons name="create-outline" size={20} color="#3b82f6" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)} style={styles.actionButton}>
                              <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={styles.entryDetails}>
                          <Text style={styles.entryDetail}>
                            {Math.round(entry.amount * 9)} cal ({entry.amount}ml) • {entry.oil}
                          </Text>
                          <Text style={styles.entryDetail}>
                            {entry.quantity} {entry.unit}
                          </Text>
                          <Text style={styles.entryTime}>{entry.time}</Text>
                        </View>
                      </CardContent>
                    </Card>
                  ))}
                </View>
              );
            })
          )}
        </View>
          </>
        )}

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  datePill: {
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  progressValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  progressCurrent: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressTarget: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBar: {
    marginBottom: 8,
  },
  progressRemaining: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  logButton: {
    marginBottom: 24,
    backgroundColor: '#1b4a5a',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logButtonIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logButtonTextContainer: {
    flex: 1,
  },
  logButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  logButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logCard: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffffffff',
    backgroundColor: '#ffffffff',
  },
  logContent: {
    padding: 16,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#5B5B5B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  oilSwasthaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    gap: 10,
  },
  oilSwasthaBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oilSwasthaScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  oilSwasthaDetails: {
    flex: 1,
  },
  oilSwasthaCategory: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  oilSwasthaExplanation: {
    fontSize: 12,
    color: '#5B5B5B',
    lineHeight: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#040707',
  },
  searchResults: {
    maxHeight: 200,
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 2,
  },
  searchResultCategory: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  selectedFoodCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  selectedFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedFoodInfo: {
    flex: 1,
  },
  selectedFoodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  selectedFoodMeta: {
    fontSize: 14,
    color: '#3b82f6',
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  unitButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  unitButtonActive: {
    backgroundColor: '#1b4a5a',
    borderColor: '#1b4a5a',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B5B5B',
  },
  unitButtonTextActive: {
    color: '#ffffff',
  },
  gramEquivalent: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 6,
  },
  oilEstimate: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 4,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mealButtonActive: {
    backgroundColor: '#fcaf56',
    borderColor: '#fcaf56',
  },
  mealButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B5B5B',
  },
  mealButtonTextActive: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B5B5B',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  section: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 16,
  },
  mealDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  mealDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  mealGroupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b3b4c',
    paddingHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entryCard: {
    marginBottom: 12,
  },
  entryContent: {
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  entryDish: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    flex: 1,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#16a34a',
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  entryDetail: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  entryTime: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 16,
  },
  memberOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7F2F1',
  },
  memberName: {
    fontSize: 16,
    color: '#040707',
  },
  doneButton: {
    marginTop: 16,
  },
  groupToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  groupToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  groupToggleActive: {
    backgroundColor: '#E7F2F1',
    borderColor: '#1b4a5a',
  },
  groupToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  groupToggleTextActive: {
    color: '#1b4a5a',
  },
  groupSelector: {
    marginTop: 12,
  },
  groupSelectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B5B5B',
    marginBottom: 8,
  },
  groupChips: {
    flexDirection: 'row',
  },
  groupChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  groupChipActive: {
    backgroundColor: '#1b4a5a',
    borderColor: '#1b4a5a',
  },
  groupChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B5B5B',
  },
  groupChipTextActive: {
    color: '#ffffff',
  },
  memberSelection: {
    marginTop: 16,
  },
  memberSelectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B5B5B',
    marginBottom: 12,
  },
  memberList: {
    gap: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  memberItemSelected: {
    backgroundColor: '#E7F2F1',
    borderColor: '#16a34a',
    borderWidth: 2,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberDetails: {
    flex: 1,
  },
  memberEmail: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  selectedCount: {
    backgroundColor: '#E7F2F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#1b4a5a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B5B5B',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  // IoT Device Styles
  iotContainer: {
    flex: 1,
  },
  iotSection: {
    marginBottom: 20,
  },
  iotSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 12,
  },
  iotEmptyCard: {
    marginBottom: 12,
  },
  iotEmptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iotEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B5B5B',
    marginTop: 12,
  },
  iotEmptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  iotDeviceCard: {
    marginBottom: 12,
  },
  iotDeviceContent: {
    padding: 16,
  },
  iotDeviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iotDeviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iotDeviceIconConnected: {
    backgroundColor: '#dcfce7',
  },
  iotDeviceIconDisconnected: {
    backgroundColor: '#fee2e2',
  },
  iotDeviceInfo: {
    flex: 1,
  },
  iotDeviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  iotDeviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
  },
  statusDotConnected: {
    backgroundColor: '#16a34a',
  },
  statusDotDisconnected: {
    backgroundColor: '#ef4444',
  },
  statusDotPairing: {
    backgroundColor: '#f59e0b',
  },
  iotDeviceStatusText: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  batteryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryText: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  iotDeviceDetails: {
    marginBottom: 12,
  },
  iotDeviceLastSync: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  jarFillContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  jarFillBackground: {
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'flex-end',
  },
  jarFillBar: {
    width: '100%',
    borderRadius: 10,
    transition: 'all 0.3s ease',
  },
  jarFillLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1b4a5a',
    textAlign: 'center',
    marginTop: 8,
  },
  iotDeviceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iotActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iotActionButtonPrimary: {
    backgroundColor: '#1b4a5a',
    borderColor: '#1b4a5a',
  },
  iotActionButtonDanger: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  iotActionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  iotActionButtonTextPrimary: {
    color: '#ffffff',
  },
  iotActionButtonTextDanger: {
    color: '#ef4444',
  },
  scanButton: {
    marginBottom: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scanButtonIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonTextContainer: {
    flex: 1,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  scanButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
  howItWorksCard: {
    marginBottom: 20,
  },
  howItWorksContent: {
    padding: 16,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 16,
  },
  howItWorksStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1b4a5a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#5B5B5B',
    lineHeight: 18,
  },
});
