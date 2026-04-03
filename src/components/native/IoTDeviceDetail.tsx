import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { t } from '../../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface IoTDeviceDetailProps {
  navigation?: any;
  route?: {
    params?: {
      device: {
        id: string;
        name: string;
        type: string;
        status: 'connected' | 'disconnected' | 'pairing';
        lastSync: string;
        batteryLevel?: number;
      };
    };
  };
}

interface OilUsageData {
  date: string;
  amount: number;
}

export function IoTDeviceDetail({ navigation, route }: IoTDeviceDetailProps) {
  const device = route?.params?.device;
  
  // Oil dispenser state
  const [totalCapacity] = useState(1000); // ml
  const [currentLevel, setCurrentLevel] = useState(750); // ml remaining
  const [oilConsumedToday, setOilConsumedToday] = useState(45); // ml consumed today
  const [oilConsumedWeek, setOilConsumedWeek] = useState(280); // ml consumed this week
  
  // Animation for oil level
  const oilLevelAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  
  // Graph time range
  const [graphRange, setGraphRange] = useState<'day' | 'week' | 'month'>('week');
  
  // Oil usage history data
  const [usageHistory] = useState<OilUsageData[]>([
    { date: '2025-12-03', amount: 35 },
    { date: '2025-12-04', amount: 42 },
    { date: '2025-12-05', amount: 38 },
    { date: '2025-12-06', amount: 55 },
    { date: '2025-12-07', amount: 48 },
    { date: '2025-12-08', amount: 62 },
    { date: '2025-12-09', amount: 45 },
  ]);
  
  // Logging form state
  const [showLogForm, setShowLogForm] = useState(false);
  const [dishName, setDishName] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [oilAmount, setOilAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedReading, setSelectedReading] = useState<string | null>(null);
  
  // Automatic readings from IoT device (mock data)
  const [automaticReadings] = useState([
    { id: 'r1', amount: 18, timestamp: '2025-12-09T08:32:00', status: 'unlogged' },
    { id: 'r2', amount: 12, timestamp: '2025-12-09T12:45:00', status: 'unlogged' },
    { id: 'r3', amount: 22, timestamp: '2025-12-09T14:20:00', status: 'unlogged' },
    { id: 'r4', amount: 8, timestamp: '2025-12-08T19:30:00', status: 'logged' },
    { id: 'r5', amount: 15, timestamp: '2025-12-08T13:15:00', status: 'logged' },
  ]);
  
  // Family members (mock data)
  const [familyMembers] = useState([
    { id: '1', name: 'Self' },
    { id: '2', name: 'Spouse' },
    { id: '3', name: 'Child 1' },
    { id: '4', name: 'Child 2' },
  ]);

  // Animate oil level on mount
  useEffect(() => {
    const percentage = (currentLevel / totalCapacity) * 100;
    Animated.timing(oilLevelAnim, {
      toValue: percentage,
      duration: 1500,
      useNativeDriver: false,
    }).start();
    
    // Wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [currentLevel, totalCapacity]);

  const oilLevelHeight = oilLevelAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const waveTranslate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const getOilLevelColor = (): readonly [string, string] => {
    const percentage = (currentLevel / totalCapacity) * 100;
    if (percentage > 60) return ['#fbbf24', '#f59e0b'] as const;
    if (percentage > 30) return ['#fb923c', '#ea580c'] as const;
    return ['#ef4444', '#dc2626'] as const;
  };

  const getMaxUsage = () => {
    return Math.max(...usageHistory.map(d => d.amount), 1);
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectReading = (reading: typeof automaticReadings[0]) => {
    setSelectedReading(reading.id);
    setOilAmount(reading.amount.toString());
  };

  const formatReadingTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
  };

  const handleLogOil = () => {
    if (!dishName || !selectedMeal || selectedMembers.length === 0 || !oilAmount) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    Alert.alert(
      'Success',
      `Logged ${oilAmount}ml for ${dishName} (${selectedMeal}) for ${selectedMembers.length} member(s)`,
      [{ text: 'OK', onPress: () => {
        setShowLogForm(false);
        setDishName('');
        setSelectedMeal('');
        setSelectedMembers([]);
        setOilAmount('');
        setNotes('');
        setSelectedReading(null);
      }}]
    );
  };

  const handleRefillDispenser = () => {
    Alert.alert(
      'Refill Dispenser',
      'Mark the dispenser as refilled?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Refilled',
          onPress: () => {
            setCurrentLevel(totalCapacity);
            Alert.alert('Success', 'Dispenser marked as full');
          }
        },
      ]
    );
  };

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Device not found</Text>
          <Button onPress={() => navigation?.goBack()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

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
              <Ionicons name="hardware-chip" size={24} color="#ffffff" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>{device.name}</Text>
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusDot,
                  device.status === 'connected' && styles.statusDotConnected,
                ]} />
                <Text style={styles.subtitle}>
                  {device.status === 'connected' ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 3D Oil Dispenser Visualization */}
        <Card style={styles.dispenserCard}>
          <CardContent style={styles.dispenserContent}>
            <Text style={styles.dispenserTitle}>Oil Level</Text>
            
            <View style={styles.dispenserContainer}>
              {/* Dispenser Jar - Inverted */}
              <View style={styles.jarContainer}>
                {/* Jar Cap (now at top) */}
                <View style={styles.jarCapTop} />
                
                {/* Jar Neck (now at top) */}
                <View style={styles.jarNeckTop} />
                
                {/* Jar Body */}
                <View style={styles.jar}>
                  {/* Oil Level - fills from bottom */}
                  <Animated.View 
                    style={[
                      styles.oilLevelInverted,
                      { height: oilLevelHeight }
                    ]}
                  >
                    <LinearGradient
                      colors={getOilLevelColor()}
                      style={styles.oilGradient}
                    >
                      {/* Wave Effect */}
                      <Animated.View 
                        style={[
                          styles.waveTop,
                          { transform: [{ translateY: waveTranslate }] }
                        ]}
                      />
                    </LinearGradient>
                  </Animated.View>
                  
                  {/* Level Markers */}
                  <View style={styles.levelMarkers}>
                    <View style={styles.markerRow}>
                      <View style={styles.marker} />
                      <Text style={styles.markerText}>1000ml</Text>
                    </View>
                    <View style={styles.markerRow}>
                      <View style={styles.marker} />
                      <Text style={styles.markerText}>750ml</Text>
                    </View>
                    <View style={styles.markerRow}>
                      <View style={styles.marker} />
                      <Text style={styles.markerText}>500ml</Text>
                    </View>
                    <View style={styles.markerRow}>
                      <View style={styles.marker} />
                      <Text style={styles.markerText}>250ml</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{currentLevel}ml</Text>
                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalCapacity - currentLevel}ml</Text>
                  <Text style={styles.statLabel}>Used</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Math.round((currentLevel / totalCapacity) * 100)}%</Text>
                  <Text style={styles.statLabel}>Level</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.refillButton}
              onPress={handleRefillDispenser}
            >
              <Ionicons name="refresh" size={18} color="#1b4a5a" />
              <Text style={styles.refillButtonText}>Mark as Refilled</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Today's Consumption */}
        <View style={styles.consumptionRow}>
          <Card style={styles.consumptionCard}>
            <CardContent style={styles.consumptionContent}>
              <View style={styles.consumptionIcon}>
                <Ionicons name="today" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.consumptionValue}>{oilConsumedToday}ml</Text>
              <Text style={styles.consumptionLabel}>Today</Text>
            </CardContent>
          </Card>
          <Card style={styles.consumptionCard}>
            <CardContent style={styles.consumptionContent}>
              <View style={[styles.consumptionIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="calendar" size={24} color="#16a34a" />
              </View>
              <Text style={styles.consumptionValue}>{oilConsumedWeek}ml</Text>
              <Text style={styles.consumptionLabel}>This Week</Text>
            </CardContent>
          </Card>
        </View>

        {/* Usage Graph */}
        <Card style={styles.graphCard}>
          <CardContent style={styles.graphContent}>
            <View style={styles.graphHeader}>
              <Text style={styles.graphTitle}>Usage History</Text>
              <View style={styles.graphRangeButtons}>
                {(['day', 'week', 'month'] as const).map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.rangeButton,
                      graphRange === range && styles.rangeButtonActive
                    ]}
                    onPress={() => setGraphRange(range)}
                  >
                    <Text style={[
                      styles.rangeButtonText,
                      graphRange === range && styles.rangeButtonTextActive
                    ]}>
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bar Chart */}
            <View style={styles.chartContainer}>
              {usageHistory.map((data, index) => {
                const barHeight = (data.amount / getMaxUsage()) * 120;
                const dayName = new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <View key={data.date} style={styles.barContainer}>
                    <Text style={styles.barValue}>{data.amount}</Text>
                    <View style={styles.barWrapper}>
                      <LinearGradient
                        colors={['#1b4a5a', '#2d6a7a']}
                        style={[styles.bar, { height: barHeight }]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{dayName}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.graphStats}>
              <View style={styles.graphStatItem}>
                <Text style={styles.graphStatLabel}>Average</Text>
                <Text style={styles.graphStatValue}>
                  {Math.round(usageHistory.reduce((a, b) => a + b.amount, 0) / usageHistory.length)}ml/day
                </Text>
              </View>
              <View style={styles.graphStatItem}>
                <Text style={styles.graphStatLabel}>Total</Text>
                <Text style={styles.graphStatValue}>
                  {usageHistory.reduce((a, b) => a + b.amount, 0)}ml
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Log Oil Button */}
        <TouchableOpacity
          style={styles.logOilButton}
          onPress={() => setShowLogForm(!showLogForm)}
        >
          <View style={styles.logOilButtonContent}>
            <View style={styles.logOilButtonIcon}>
              <Ionicons name="add-circle" size={28} color="#ffffff" />
            </View>
            <View style={styles.logOilButtonTextContainer}>
              <Text style={styles.logOilButtonText}>Log Oil Usage</Text>
              <Text style={styles.logOilButtonSubtext}>Add dish and family details</Text>
            </View>
            <Ionicons 
              name={showLogForm ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="rgba(255,255,255,0.8)" 
            />
          </View>
        </TouchableOpacity>

        {/* Log Form */}
        {showLogForm && (
          <Card style={styles.logFormCard}>
            <CardContent style={styles.logFormContent}>
              <Text style={styles.logFormTitle}>Log Oil Consumption</Text>

              {/* Automatic Readings Section */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select a Reading from Device</Text>
                <Text style={styles.formHint}>Tap a reading to auto-fill the amount</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.readingsScroll}
                >
                  {automaticReadings.filter(r => r.status === 'unlogged').map((reading) => (
                    <TouchableOpacity
                      key={reading.id}
                      style={[
                        styles.readingCard,
                        selectedReading === reading.id && styles.readingCardSelected
                      ]}
                      onPress={() => handleSelectReading(reading)}
                    >
                      <View style={styles.readingAmountContainer}>
                        <Ionicons 
                          name="water" 
                          size={18} 
                          color={selectedReading === reading.id ? '#ffffff' : '#f59e0b'} 
                        />
                        <Text style={[
                          styles.readingAmount,
                          selectedReading === reading.id && styles.readingAmountSelected
                        ]}>
                          {reading.amount}ml
                        </Text>
                      </View>
                      <Text style={[
                        styles.readingTime,
                        selectedReading === reading.id && styles.readingTimeSelected
                      ]}>
                        {formatReadingTime(reading.timestamp)}
                      </Text>
                      {selectedReading === reading.id && (
                        <View style={styles.readingCheckmark}>
                          <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* Previously Logged Readings */}
                {automaticReadings.filter(r => r.status === 'logged').length > 0 && (
                  <View style={styles.loggedReadingsSection}>
                    <Text style={styles.loggedReadingsTitle}>Previously Logged</Text>
                    <View style={styles.loggedReadingsList}>
                      {automaticReadings.filter(r => r.status === 'logged').map((reading) => (
                        <View key={reading.id} style={styles.loggedReadingItem}>
                          <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                          <Text style={styles.loggedReadingText}>
                            {reading.amount}ml • {formatReadingTime(reading.timestamp)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Oil Amount - Manual Override */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Oil Amount (ml) *</Text>
                <View style={styles.oilAmountRow}>
                  <TextInput
                    style={[
                      styles.oilAmountInput,
                      selectedReading && styles.oilAmountInputSelected
                    ]}
                    value={oilAmount}
                    onChangeText={(text) => {
                      setOilAmount(text);
                      setSelectedReading(null);
                    }}
                    keyboardType="numeric"
                    placeholder="Select reading or enter manually"
                  />
                  {oilAmount && (
                    <TouchableOpacity 
                      style={styles.clearAmountButton}
                      onPress={() => {
                        setOilAmount('');
                        setSelectedReading(null);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Dish Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dish Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={dishName}
                  onChangeText={setDishName}
                  placeholder="e.g., Dal Tadka, Aloo Paratha"
                />
              </View>

              {/* Meal Type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Meal Type *</Text>
                <View style={styles.mealButtons}>
                  {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((meal) => (
                    <TouchableOpacity
                      key={meal}
                      style={[
                        styles.mealButton,
                        selectedMeal === meal && styles.mealButtonActive
                      ]}
                      onPress={() => setSelectedMeal(meal)}
                    >
                      <Text style={[
                        styles.mealButtonText,
                        selectedMeal === meal && styles.mealButtonTextActive
                      ]}>
                        {meal}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Family Members */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Family Members *</Text>
                <View style={styles.memberChips}>
                  {familyMembers.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberChip,
                        selectedMembers.includes(member.id) && styles.memberChipActive
                      ]}
                      onPress={() => toggleMember(member.id)}
                    >
                      <Ionicons 
                        name={selectedMembers.includes(member.id) ? "checkmark-circle" : "person-outline"} 
                        size={16} 
                        color={selectedMembers.includes(member.id) ? "#ffffff" : "#5B5B5B"} 
                      />
                      <Text style={[
                        styles.memberChipText,
                        selectedMembers.includes(member.id) && styles.memberChipTextActive
                      ]}>
                        {member.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.formInput, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any additional notes..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Submit Button */}
              <View style={styles.formButtons}>
                <Button
                  variant="outline"
                  onPress={() => setShowLogForm(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleLogOil}
                  style={styles.submitButton}
                >
                  Log Oil
                </Button>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Device Info */}
        <Card style={styles.deviceInfoCard}>
          <CardContent style={styles.deviceInfoContent}>
            <Text style={styles.deviceInfoTitle}>Device Information</Text>
            <View style={styles.deviceInfoRow}>
              <Text style={styles.deviceInfoLabel}>Device ID</Text>
              <Text style={styles.deviceInfoValue}>{device.id}</Text>
            </View>
            <View style={styles.deviceInfoRow}>
              <Text style={styles.deviceInfoLabel}>Battery</Text>
              <View style={styles.batteryRow}>
                <Ionicons 
                  name={device.batteryLevel && device.batteryLevel > 50 ? 'battery-full' : 'battery-half'} 
                  size={18} 
                  color={device.batteryLevel && device.batteryLevel > 20 ? '#16a34a' : '#ef4444'} 
                />
                <Text style={styles.deviceInfoValue}>{device.batteryLevel || 85}%</Text>
              </View>
            </View>
            <View style={styles.deviceInfoRow}>
              <Text style={styles.deviceInfoLabel}>Last Sync</Text>
              <Text style={styles.deviceInfoValue}>
                {new Date(device.lastSync).toLocaleString()}
              </Text>
            </View>
            <View style={styles.deviceInfoRow}>
              <Text style={styles.deviceInfoLabel}>Firmware</Text>
              <Text style={styles.deviceInfoValue}>v2.1.4</Text>
            </View>
          </CardContent>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5B5B5B',
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
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  statusDotConnected: {
    backgroundColor: '#16a34a',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dispenserCard: {
    marginBottom: 16,
  },
  dispenserContent: {
    padding: 20,
    alignItems: 'center',
  },
  dispenserTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 20,
  },
  dispenserContainer: {
    alignItems: 'center',
    width: '100%',
  },
  jarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  jar: {
    width: 120,
    height: 180,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#d1d5db',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  oilLevel: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  oilGradient: {
    flex: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  wave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  levelMarkers: {
    position: 'absolute',
    right: -50,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  markerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marker: {
    width: 8,
    height: 2,
    backgroundColor: '#9ca3af',
  },
  markerText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  jarNeck: {
    width: 50,
    height: 15,
    backgroundColor: '#d1d5db',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  jarCap: {
    width: 60,
    height: 25,
    backgroundColor: '#1b4a5a',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#040707',
  },
  statLabel: {
    fontSize: 12,
    color: '#5B5B5B',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#d1d5db',
  },
  refillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#E7F2F1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1b4a5a',
  },
  refillButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  consumptionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  consumptionCard: {
    flex: 1,
  },
  consumptionContent: {
    padding: 16,
    alignItems: 'center',
  },
  consumptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  consumptionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#040707',
  },
  consumptionLabel: {
    fontSize: 13,
    color: '#5B5B5B',
    marginTop: 4,
  },
  graphCard: {
    marginBottom: 16,
  },
  graphContent: {
    padding: 16,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
  },
  graphRangeButtons: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  rangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  rangeButtonActive: {
    backgroundColor: '#1b4a5a',
  },
  rangeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B5B5B',
  },
  rangeButtonTextActive: {
    color: '#ffffff',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#5B5B5B',
    fontWeight: '600',
  },
  barWrapper: {
    height: 120,
    width: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#5B5B5B',
  },
  graphStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  graphStatItem: {
    alignItems: 'center',
  },
  graphStatLabel: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  graphStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#040707',
    marginTop: 4,
  },
  logOilButton: {
    marginBottom: 16,
    backgroundColor: '#1b4a5a',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logOilButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logOilButtonIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logOilButtonTextContainer: {
    flex: 1,
  },
  logOilButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  logOilButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
  logFormCard: {
    marginBottom: 16,
  },
  logFormContent: {
    padding: 16,
  },
  logFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B5B5B',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#040707',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  oilAmountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  oilAmountInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#040707',
  },
  autoDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  autoDetectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  mealButtons: {
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
  memberChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  memberChipActive: {
    backgroundColor: '#1b4a5a',
    borderColor: '#1b4a5a',
  },
  memberChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B5B5B',
  },
  memberChipTextActive: {
    color: '#ffffff',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  deviceInfoCard: {
    marginBottom: 16,
  },
  deviceInfoContent: {
    padding: 16,
  },
  deviceInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 16,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  deviceInfoLabel: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  deviceInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomPadding: {
    height: 40,
  },
  // Inverted jar styles
  jarCapTop: {
    width: 60,
    height: 20,
    backgroundColor: '#1b4a5a',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  jarNeckTop: {
    width: 50,
    height: 12,
    backgroundColor: '#d1d5db',
  },
  oilLevelInverted: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  waveTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  // Automatic readings styles
  formHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  readingsScroll: {
    marginBottom: 12,
  },
  readingCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 100,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  readingCardSelected: {
    backgroundColor: '#1b4a5a',
    borderColor: '#1b4a5a',
  },
  readingAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  readingAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
  },
  readingAmountSelected: {
    color: '#ffffff',
  },
  readingTime: {
    fontSize: 11,
    color: '#a16207',
  },
  readingTimeSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  readingCheckmark: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  loggedReadingsSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  loggedReadingsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  loggedReadingsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  loggedReadingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  loggedReadingText: {
    fontSize: 12,
    color: '#166534',
  },
  oilAmountInputSelected: {
    borderColor: '#1b4a5a',
    borderWidth: 2,
    backgroundColor: '#f0f9ff',
  },
  clearAmountButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
});
