import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Modal,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateSwasthaIndex } from '../../utils/swasthaIndex';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from './LanguageSelector';
import { t } from '../../i18n';

interface MobileProfileProps {
  onLogout?: () => void;
  navigation?: any;
}

const { width } = Dimensions.get('window');

// Family members data
const familyMembers = [
  {
    id: 1,
    name: 'Rajesh Sharma',
    relation: 'Self',
    age: 42,
    gender: 'Male',
    dailyConsumption: 35,
    weeklyAvg: 38,
    status: 'On Target',
    avatar: 'RS'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    relation: 'Spouse',
    age: 38,
    gender: 'Female',
    dailyConsumption: 28,
    weeklyAvg: 30,
    status: 'Excellent',
    avatar: 'PS'
  },
  {
    id: 3,
    name: 'Aarav Sharma',
    relation: 'Son',
    age: 14,
    gender: 'Male',
    dailyConsumption: 32,
    weeklyAvg: 34,
    status: 'On Target',
    avatar: 'AS'
  },
  {
    id: 4,
    name: 'Ananya Sharma',
    relation: 'Daughter',
    age: 10,
    gender: 'Female',
    dailyConsumption: 25,
    weeklyAvg: 26,
    status: 'Excellent',
    avatar: 'AN'
  }
];

// Current oil being used
const currentOil = {
  id: 1,
  name: 'Fortune Rice Bran Oil',
  brand: 'Fortune',
  type: 'Rice Bran',
  volume: '5L',
  price: 775,
  purchaseDate: 'Nov 15, 2025',
  gst: '5%',
  tfa: '<2%',
  pufa: '32%',
  mufa: '47%',
  sfa: '21%',
  badges: ['Fortified', 'Healthy Choice', 'Heart Safe'],
  remaining: '2.8L',
  daysLeft: 18,
  avgDailyUse: '155ml',
  certifications: ['FSSAI', 'ISO 22000', 'BIS'],
  nutritionPer100ml: {
    energy: '884 kcal',
    protein: '0g',
    carbs: '0g',
    fat: '100g',
    cholesterol: '0mg',
    vitamins: ['Vitamin A', 'Vitamin D', 'Vitamin E']
  }
};

// Achievements
const achievements = [
  { id: 1, title: '10% Oil Reduction', icon: 'analytics', unlocked: true, points: 100, date: 'Nov 20, 2025' },
  { id: 2, title: '30-Day Streak', icon: 'flame', unlocked: true, points: 150, date: 'Nov 25, 2025' },
  { id: 3, title: 'Family Champion', icon: 'people', unlocked: true, points: 200, date: 'Nov 28, 2025' },
  { id: 4, title: 'Health Hero', icon: 'heart', unlocked: true, points: 120, date: 'Nov 10, 2025' },
  { id: 5, title: 'Community Leader', icon: 'trophy', unlocked: false, points: 300, date: 'Locked' },
  { id: 6, title: 'Recipe Master', icon: 'star', unlocked: false, points: 180, date: 'Locked' },
];

// Rewards
const rewards = [
  { id: 1, name: 'Amazon Voucher ₹500', points: 5000, available: true },
  { id: 2, name: 'SwasthTel Premium Oil Kit', points: 3000, available: true },
  { id: 3, name: 'Health Check-up Package', points: 8000, available: false },
  { id: 4, name: 'Recipe Book Bundle', points: 2000, available: true },
];

// Medical reports
const medicalReports = [
  {
    id: 1,
    name: 'Lipid Profile Test',
    date: 'Nov 28, 2025',
    type: 'Blood Test',
    status: 'analyzed',
    metrics: {
      totalCholesterol: { value: 185, unit: 'mg/dL', status: 'normal' },
      ldl: { value: 110, unit: 'mg/dL', status: 'normal' },
      hdl: { value: 55, unit: 'mg/dL', status: 'good' },
      triglycerides: { value: 140, unit: 'mg/dL', status: 'normal' }
    }
  },
  {
    id: 2,
    name: 'Complete Blood Count',
    date: 'Oct 15, 2025',
    type: 'Blood Test',
    status: 'analyzed'
  },
  {
    id: 3,
    name: 'HbA1c Test',
    date: 'Sep 20, 2025',
    type: 'Diabetes Screening',
    status: 'analyzed'
  }
];

export function MobileProfile({ onLogout, navigation }: MobileProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'myoil' | 'healthreports' | 'settings'>('profile');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showUploadReport, setShowUploadReport] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangeOil, setShowChangeOil] = useState(false);
  
  // Current oil state
  const [currentOilType, setCurrentOilType] = useState('Rice Bran Oil');
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Change oil form state
  const [newOilName, setNewOilName] = useState('');
  const [newOilBrand, setNewOilBrand] = useState('');
  const [newOilType, setNewOilType] = useState('');
  const [newOilVolume, setNewOilVolume] = useState('');
  
  // Groups state
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  
  // Get user from AuthContext
  const { user } = useAuth();

  const cpsScore = 847;
  const totalPoints = 3450;
  const userName = user?.name || user?.email || "User";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "U";

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await apiService.getMyGroups();
      if (response.success && response.data) {
        setGroups(response.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleChangeOil = async (selectedOil: string) => {
    try {
      // Update local state immediately for instant UI update
      setCurrentOilType(selectedOil);
      
      // Update database
      const apiService = require('../../services/api').default;
      const response = await apiService.updateCurrentOil(selectedOil);
      
      if (response.success) {
        Alert.alert('Success', `Oil changed to ${selectedOil}`);
      } else {
        // Revert if API call failed
        setCurrentOilType(currentOilType);
        Alert.alert('Error', response.message || 'Failed to update oil');
      }
      
      setShowChangeOil(false);
    } catch (error) {
      // Revert on error
      setCurrentOilType(currentOilType);
      Alert.alert('Error', 'Failed to update oil. Please try again.');
      console.error('Error updating oil:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userStats}>
                CPS Score: {cpsScore} • {totalPoints} pts
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
                {t('profile.myProfile')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'myoil' && styles.tabActive]}
              onPress={() => setActiveTab('myoil')}
            >
              <Text style={[styles.tabText, activeTab === 'myoil' && styles.tabTextActive]}>
                {t('profile.myOil')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'healthreports' && styles.tabActive]}
              onPress={() => setActiveTab('healthreports')}
            >
              <Text style={[styles.tabText, activeTab === 'healthreports' && styles.tabTextActive]}>
                {t('profile.healthReports')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
              onPress={() => setActiveTab('settings')}
            >
              <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
                {t('profile.settings')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <View style={styles.content}>
            {/* Personal Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
                <TouchableOpacity onPress={() => navigation?.navigate('EditProfile')}>
                  <Text style={styles.editButton}>{t('profile.edit')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={20} color="#1b4a5a" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{t('profile.phone')}</Text>
                    <Text style={styles.infoValue}>{user?.phoneNumber || 'Not provided'}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={20} color="#1b4a5a" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{t('profile.email')}</Text>
                    <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={20} color="#1b4a5a" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Age</Text>
                    <Text style={styles.infoValue}>{user?.age ? `${user.age} years` : 'Not provided'}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="male-female" size={20} color="#1b4a5a" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>{user?.gender || 'Not provided'}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="fitness" size={20} color="#1b4a5a" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Height / Weight</Text>
                    <Text style={styles.infoValue}>
                      {user?.height ? `${user.height} cm` : 'N/A'} / {user?.weight ? `${user.weight} kg` : 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="analytics" size={20} color="#1b4a5a" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>BMI</Text>
                    <Text style={styles.infoValue}>{user?.bmi ? user.bmi.toFixed(1) : 'Not calculated'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Household Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.householdDetails')}</Text>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Ionicons name="home" size={20} color="#1b4a5a" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{t('profile.address')}</Text>
                    <Text style={styles.infoValue}>Mumbai, Maharashtra</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="people" size={20} color="#1b4a5a" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{t('profile.familySize')}</Text>
                    <Text style={styles.infoValue}>4 {t('profile.members')}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="water" size={20} color="#1b4a5a" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{t('profile.avgConsumption')}</Text>
                    <Text style={styles.infoValue}>120 ml</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* My Groups */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('profile.myGroups')}</Text>
                <TouchableOpacity onPress={() => navigation?.navigate('Groups')}>
                  <Text style={styles.addButton}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {loadingGroups ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1b4a5a" />
                </View>
              ) : groups.length === 0 ? (
                <TouchableOpacity 
                  style={styles.emptyGroupCard}
                  onPress={() => navigation?.navigate('Groups')}
                >
                  <Ionicons name="people-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyGroupTitle}>No Groups Yet</Text>
                  <Text style={styles.emptyGroupSubtitle}>
                    Create or join a group to track oil consumption with family or friends
                  </Text>
                  <View style={styles.createGroupButton}>
                    <Ionicons name="add" size={20} color="#ffffff" />
                    <Text style={styles.createGroupButtonText}>Create Group</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                groups.slice(0, 3).map((group) => {
                  const adminId = typeof group.admin === 'string' ? group.admin : group.admin?._id;
                  const isAdmin = adminId === user?._id;
                  const memberCount = group.members?.length || 0;
                  const activeMemberCount = group.members?.filter((m: any) => m.status === 'active').length || 0;
                  
                  return (
                    <TouchableOpacity
                      key={group._id}
                      style={styles.memberCard}
                      onPress={() => navigation?.navigate('GroupDetail', { 
                        groupId: group._id,
                        groupName: group.name 
                      })}
                    >
                      <View style={[styles.memberAvatar, { backgroundColor: group.type === 'family' ? '#e0f2fe' : '#fef3c7' }]}>
                        <Ionicons 
                          name={group.type === 'family' ? 'home' : group.type === 'school' ? 'school' : 'people'} 
                          size={24} 
                          color={group.type === 'family' ? '#0284c7' : '#f59e0b'} 
                        />
                      </View>
                      <View style={styles.memberInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.memberName}>{group.name}</Text>
                          {isAdmin && (
                            <View style={styles.adminBadge}>
                              <Text style={styles.adminBadgeText}>Admin</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.memberDetails}>
                          {group.type.charAt(0).toUpperCase() + group.type.slice(1)} • {activeMemberCount} active members
                        </Text>
                        {group.description && (
                          <Text style={styles.groupDescription} numberOfLines={1}>
                            {group.description}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                    </TouchableOpacity>
                  );
                })
              )}
              
              {groups.length > 3 && (
                <TouchableOpacity 
                  style={styles.groupViewAllButton}
                  onPress={() => navigation?.navigate('Groups')}
                >
                  <Text style={styles.groupViewAllButtonText}>View All {groups.length} Groups</Text>
                  <Ionicons name="arrow-forward" size={16} color="#1b4a5a" />
                </TouchableOpacity>
              )}
            </View>

            {/* Verification */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.verification')}</Text>
              <LinearGradient
                colors={['#dcfce7', '#d1fae5']}
                style={styles.verificationCard}
              >
                <View style={styles.verificationRow}>
                  <Ionicons name="shield-checkmark" size={24} color="#16a34a" />
                  <View style={styles.verificationInfo}>
                    <Text style={styles.verificationTitle}>{t('profile.aadhaarVerified')}</Text>
                    <Text style={styles.verificationSubtitle}>XXXX-XXXX-4567</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                </View>
                <View style={styles.divider} />
                <View style={styles.verificationRow}>
                  <Ionicons name="call" size={24} color="#16a34a" />
                  <View style={styles.verificationInfo}>
                    <Text style={styles.verificationTitle}>{t('profile.phoneVerified')}</Text>
                    <Text style={styles.verificationSubtitle}>{user?.phoneNumber || user?.email || 'Not verified'}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                </View>
              </LinearGradient>
            </View>

            {/* Achievements */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('profile.achievementsCPS')}</Text>
                <View style={styles.cpsBadge}>
                  <Text style={styles.cpsText}>{cpsScore}</Text>
                </View>
              </View>
              
              <LinearGradient
                colors={['#fef3c7', '#fde68a']}
                style={styles.cpsCard}
              >
                <Text style={styles.cpsTitle}>Community Performance Score</Text>
                <Text style={styles.cpsScore}>{cpsScore}</Text>
                <Text style={styles.cpsRank}>Top 15% in your community</Text>
              </LinearGradient>

              <View style={styles.achievementsGrid}>
                {achievements.map((achievement) => (
                  <View
                    key={achievement.id}
                    style={[
                      styles.achievementCard,
                      !achievement.unlocked && styles.achievementLocked
                    ]}
                  >
                    <Ionicons
                      name={achievement.icon as any}
                      size={32}
                      color={achievement.unlocked ? '#fcaf56' : '#d1d5db'}
                    />
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementPoints}>+{achievement.points}</Text>
                    {achievement.unlocked && (
                      <View style={styles.unlockedBadge}>
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Rewards - Navigate to Full Screen */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('profile.rewards')}</Text>
                <TouchableOpacity
                  onPress={() => navigation?.navigate('Rewards')}
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                  <Ionicons name="chevron-forward" size={16} color="#1b4a5a" />
                </TouchableOpacity>
              </View>

              {/* Rewards Preview Card */}
              <TouchableOpacity
                style={styles.rewardsPreviewCard}
                onPress={() => navigation?.navigate('Rewards')}
              >
                <LinearGradient
                  colors={['#1b4a5a', '#0f3a47']}
                  style={styles.rewardsGradient}
                >
                  <View style={styles.rewardsPreviewHeader}>
                    <View>
                      <Text style={styles.rewardsPreviewTitle}>Government Rewards & Benefits</Text>
                      <Text style={styles.rewardsPreviewSubtitle}>Unlock utility bill concessions</Text>
                    </View>
                    <Ionicons name="trophy" size={32} color="#fcaf56" />
                  </View>

                  <View style={styles.rewardsPreviewGrid}>
                    <View style={styles.rewardsPreviewItem}>
                      <Text style={styles.rewardsPreviewLabel}>Electricity</Text>
                      <Text style={styles.rewardsPreviewValue}>Up to 40% off</Text>
                    </View>
                    <View style={styles.rewardsPreviewItem}>
                      <Text style={styles.rewardsPreviewLabel}>Water Tax</Text>
                      <Text style={styles.rewardsPreviewValue}>Up to 25% off</Text>
                    </View>
                  </View>

                  <View style={styles.rewardsPreviewFooter}>
                    <View style={styles.pointsBadge}>
                      <Ionicons name="star" size={16} color="#fcaf56" />
                      <Text style={styles.pointsText}>{totalPoints} pts</Text>
                    </View>
                    <View style={styles.viewRewardsButton}>
                      <Text style={styles.viewRewardsText}>View All Rewards</Text>
                      <Ionicons name="chevron-forward" size={16} color="#1b4a5a" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Quick Partner Rewards Preview */}
              {rewards.slice(0, 2).map((reward) => (
                <View key={reward.id} style={styles.rewardCard}>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardName}>{reward.name}</Text>
                    <Text style={styles.rewardPoints}>{reward.points} points</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.redeemButton,
                      !reward.available && styles.redeemButtonDisabled
                    ]}
                    disabled={!reward.available}
                  >
                    <Text style={styles.redeemText}>
                      {reward.available ? t('profile.redeemReward') : t('profile.notEnough')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Ionicons name="log-out" size={20} color="#ffffff" />
              <Text style={styles.logoutText}>{t('profile.logout')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* My Oil Tab */}
        {activeTab === 'myoil' && (
          <View style={styles.content}>
            {/* Current Oil Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.currentOil')}</Text>
              <View style={styles.oilCard}>
                <View style={styles.oilHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.oilName}>{currentOilType}</Text>
                    <Text style={styles.oilBrand}>{currentOil.brand}</Text>
                    {(() => {
                      const swasthaData = calculateSwasthaIndex(currentOilType);
                      return (
                        <View style={styles.swasthaIndexContainer}>
                          <View style={[styles.swasthaIndexBadge, { backgroundColor: swasthaData.color }]}>
                            <Text style={styles.swasthaIndexScore}>{swasthaData.swastha_index}</Text>
                            <Text style={styles.swasthaIndexLabel}>Swastha Index</Text>
                          </View>
                          <View style={styles.swasthaRating}>
                            <Text style={[styles.swasthaRatingText, { color: swasthaData.color }]}>
                              {swasthaData.rating_category}
                            </Text>
                            <Text style={styles.swasthaExplanation}>{swasthaData.explanation}</Text>
                          </View>
                        </View>
                      );
                    })()}
                  </View>
                </View>

                <View style={styles.oilStats}>
                  <View style={styles.oilStat}>
                    <Text style={styles.oilStatLabel}>{t('profile.remaining')}</Text>
                    <Text style={styles.oilStatValue}>{currentOil.remaining}</Text>
                  </View>
                  <View style={styles.oilStat}>
                    <Text style={styles.oilStatLabel}>{t('profile.daysLeft')}</Text>
                    <Text style={styles.oilStatValue}>{currentOil.daysLeft}</Text>
                  </View>
                  <View style={styles.oilStat}>
                    <Text style={styles.oilStatLabel}>{t('profile.avgDailyUse')}</Text>
                    <Text style={styles.oilStatValue}>{currentOil.avgDailyUse}</Text>
                  </View>
                </View>

                <View style={styles.oilDetails}>
                  <Text style={styles.oilDetailText}>
                    <Text style={styles.oilDetailLabel}>{t('profile.purchased')}: </Text>
                    {currentOil.purchaseDate}
                  </Text>
                  <Text style={styles.oilDetailText}>
                    <Text style={styles.oilDetailLabel}>GST: </Text>
                    {currentOil.gst}
                  </Text>
                  <Text style={styles.oilDetailText}>
                    <Text style={styles.oilDetailLabel}>TFA: </Text>
                    {currentOil.tfa}
                  </Text>
                </View>

                <View style={styles.oilBadges}>
                  {currentOil.badges.map((badge, index) => (
                    <View key={index} style={styles.oilBadge}>
                      <Text style={styles.oilBadgeText}>{badge}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Nutritional Profile */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.nutritionalProfile')}</Text>
              <View style={styles.card}>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>PUFA</Text>
                  <View style={styles.nutritionBar}>
                    <View style={[styles.nutritionFill, { width: currentOil.pufa as any }]} />
                  </View>
                  <Text style={styles.nutritionValue}>{currentOil.pufa}</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>MUFA</Text>
                  <View style={styles.nutritionBar}>
                    <View style={[styles.nutritionFill, { width: currentOil.mufa as any, backgroundColor: '#3b82f6' }]} />
                  </View>
                  <Text style={styles.nutritionValue}>{currentOil.mufa}</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>SFA</Text>
                  <View style={styles.nutritionBar}>
                    <View style={[styles.nutritionFill, { width: currentOil.sfa as any, backgroundColor: '#ef4444' }]} />
                  </View>
                  <Text style={styles.nutritionValue}>{currentOil.sfa}</Text>
                </View>
              </View>
            </View>

            {/* Nutrition Facts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.nutritionFacts')}</Text>
              <View style={styles.card}>
                {Object.entries(currentOil.nutritionPer100ml).map(([key, value], index) => (
                  <View key={index}>
                    {index > 0 && <View style={styles.divider} />}
                    <View style={styles.nutritionFactRow}>
                      <Text style={styles.nutritionFactLabel}>{key}</Text>
                      <Text style={styles.nutritionFactValue}>
                        {Array.isArray(value) ? value.join(', ') : value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Certifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.certifications')}</Text>
              <View style={styles.certificationsRow}>
                {currentOil.certifications.map((cert, index) => (
                  <View key={index} style={styles.certificationBadge}>
                    <Ionicons name="shield-checkmark" size={20} color="#16a34a" />
                    <Text style={styles.certificationText}>{cert}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Change Oil Button */}
            <TouchableOpacity 
              style={styles.changeOilButton}
              onPress={() => setShowChangeOil(true)}
            >
              <Ionicons name="water" size={20} color="#ffffff" />
              <Text style={styles.changeOilText}>{t('profile.changeOil')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Health Reports Tab */}
        {activeTab === 'healthreports' && (
          <View style={styles.content}>
            {/* Upload Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('profile.healthReportsTitle')}</Text>
                <TouchableOpacity onPress={() => setShowUploadReport(true)}>
                  <Text style={styles.uploadButton}>{t('profile.uploadReport')}</Text>
                </TouchableOpacity>
              </View>
              <LinearGradient
                colors={['#fef3c7', '#fde68a']}
                style={styles.uploadCard}
              >
                <Ionicons name="cloud-upload" size={32} color="#f59e0b" />
                <Text style={styles.uploadTitle}>Upload New Health Report</Text>
                <Text style={styles.uploadSubtitle}>
                  Get AI-powered insights on oil consumption
                </Text>
              </LinearGradient>
            </View>

            {/* Latest Report */}
            {medicalReports.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile.latestReport')}</Text>
                <View style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View>
                      <Text style={styles.reportName}>{medicalReports[0].name}</Text>
                      <Text style={styles.reportDate}>{medicalReports[0].date}</Text>
                    </View>
                    <View style={styles.analyzedBadge}>
                      <Text style={styles.analyzedText}>{t('profile.analyzed')}</Text>
                    </View>
                  </View>

                  {medicalReports[0].metrics && (
                    <View style={styles.metricsGrid}>
                      {Object.entries(medicalReports[0].metrics).map(([key, metric]: [string, any]) => (
                        <View key={key} style={styles.metricCard}>
                          <Text style={styles.metricLabel}>{key}</Text>
                          <Text style={styles.metricValue}>
                            {metric.value} {metric.unit}
                          </Text>
                          <Text style={[
                            styles.metricStatus,
                            metric.status === 'normal' && styles.metricNormal,
                            metric.status === 'good' && styles.metricGood
                          ]}>
                            {metric.status}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* All Reports */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.allReports')}</Text>
              {medicalReports.map((report) => (
                <TouchableOpacity key={report.id} style={styles.reportListCard}>
                  <View style={styles.reportIcon}>
                    <Ionicons name="document-text" size={24} color="#1b4a5a" />
                  </View>
                  <View style={styles.reportListInfo}>
                    <Text style={styles.reportListName}>{report.name}</Text>
                    <Text style={styles.reportListDate}>{report.date}</Text>
                    <Text style={styles.reportListType}>{report.type}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <View style={styles.content}>
            {/* Account Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
              <View style={styles.card}>
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => navigation?.navigate('EditProfile')}
                >
                  <Ionicons name="person-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.editProfile')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.updatePersonalInfo')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => navigation?.navigate('PrivacySettings')}
                >
                  <Ionicons name="shield-checkmark-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.privacy')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.managePrivacy')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.settingRow}>
                  <Ionicons name="lock-closed-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.changePassword')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.updatePassword')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.preferences')}</Text>
              <View style={styles.card}>
                <View style={styles.settingRow}>
                  <Ionicons name="notifications-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.pushNotifications')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.dailyReminders')}</Text>
                  </View>
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: '#d1d5db', true: '#16a34a' }}
                    thumbColor="#ffffff"
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <Ionicons name="moon-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.darkMode')}</Text>
                  </View>
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: '#d1d5db', true: '#16a34a' }}
                    thumbColor="#ffffff"
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <Ionicons name="finger-print-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.biometricLogin')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.useBiometric')}</Text>
                  </View>
                  <Switch
                    value={biometrics}
                    onValueChange={setBiometrics}
                    trackColor={{ false: '#d1d5db', true: '#16a34a' }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>
            </View>

            {/* Language Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
              <LanguageSelector />
            </View>

            {/* Health Goals Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.healthGoals')}</Text>
              <View style={styles.card}>
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => navigation?.navigate('MyGoals')}
                >
                  <Ionicons name="fitness-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.myGoals')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.viewManageGoals')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => navigation?.navigate('GoalSettings')}
                >
                  <Ionicons name="analytics-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.goalSettings')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.configureGoals')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Groups Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.myGroupsTitle')}</Text>
              <View style={styles.card}>
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => navigation?.navigate('Groups')}
                >
                  <Ionicons name="people-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.myGroups')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.manageGroups')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Connected Devices Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.connectedDevices')}</Text>
              <View style={styles.card}>
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => navigation?.navigate('DeviceManagement')}
                >
                  <Ionicons name="hardware-chip-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.deviceManagement')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.manageDevices')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Support Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.support')}</Text>
              <View style={styles.card}>
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => navigation?.navigate('HelpSupport')}
                >
                  <Ionicons name="help-circle-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.helpAndSupport')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.faqsSupport')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.settingRow}>
                  <Ionicons name="document-text-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.termsOfService')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.settingRow}>
                  <Ionicons name="shield-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.privacyPolicy')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.settingRow}>
                  <Ionicons name="star-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.rateApp')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Data Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.data')}</Text>
              <View style={styles.card}>
                <TouchableOpacity style={styles.settingRow}>
                  <Ionicons name="cloud-download-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.exportData')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.downloadData')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => {
                    Alert.alert(
                      t('profile.clearCache'),
                      t('profile.freeStorage'),
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared successfully') },
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#1b4a5a" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>{t('profile.clearCache')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.freeStorage')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Danger Zone Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.dangerZone')}</Text>
              <View style={styles.card}>
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => {
                    Alert.alert(
                      t('profile.deleteAccount'),
                      t('profile.permanentlyDelete'),
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: () => {
                            // Handle account deletion
                          } 
                        },
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingText, { color: '#ef4444' }]}>{t('profile.deleteAccount')}</Text>
                    <Text style={styles.settingSubtext}>{t('profile.permanentlyDelete')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* App Info */}
            <View style={styles.appInfo}>
              <Text style={styles.appVersion}>{t('profile.appVersion')}</Text>
              <Text style={styles.appCopyright}>{t('profile.copyright')}</Text>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Ionicons name="log-out" size={20} color="#ffffff" />
              <Text style={styles.logoutText}>{t('profile.logout')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Change Oil Modal */}
      <Modal
        visible={showChangeOil}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChangeOil(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change/Update Oil</Text>
              <TouchableOpacity onPress={() => setShowChangeOil(false)}>
                <Ionicons name="close" size={24} color="#5B5B5B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Oil Type</Text>
                <View style={styles.oilTypeList}>
                  {[
                    'Sunflower Oil',
                    'Rice Bran Oil',
                    'Mustard Oil',
                    'Groundnut Oil',
                    'Olive Oil',
                    'Coconut Oil',
                    'Sesame Oil',
                    'Ghee',
                    'Butter',
                    'Palm Oil',
                    'Palmolein Oil',
                    'Soybean Oil',
                    'Canola Oil',
                    'Corn Oil',
                    'Cottonseed Oil',
                    'Safflower Oil',
                    'Vegetable Oil',
                  ].map((oil) => {
                    const swasthaData = calculateSwasthaIndex(oil);
                    const isSelected = newOilType === oil;
                    return (
                      <TouchableOpacity
                        key={oil}
                        style={[styles.oilTypeItem, isSelected && styles.oilTypeItemSelected]}
                        onPress={() => handleChangeOil(oil)}
                      >
                        <View style={styles.oilTypeItemContent}>
                          <View style={styles.oilTypeItemLeft}>
                            <Text style={[styles.oilTypeItemName, isSelected && styles.oilTypeItemNameSelected]}>
                              {oil}
                            </Text>
                            <Text style={styles.oilTypeItemCategory}>{swasthaData.rating_category}</Text>
                          </View>
                          <View style={[styles.oilTypeItemBadge, { backgroundColor: swasthaData.color }]}>
                            <Text style={styles.oilTypeItemScore}>{swasthaData.swastha_index}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  header: {
    backgroundColor: '#1b4a5a',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fcaf56',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userStats: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 30,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 26,
  },
  tabActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1b4a5a',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  editButton: {
    fontSize: 14,
    color: '#1b4a5a',
    fontWeight: '500',
  },
  addButton: {
    fontSize: 14,
    color: '#1b4a5a',
    fontWeight: '500',
  },
  uploadButton: {
    fontSize: 14,
    color: '#fcaf56',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 74, 90, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#5B5B5B',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#040707',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E7F2F1',
    marginVertical: 12,
  },
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 74, 90, 0.1)',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E7F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b4a5a',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  memberDetails: {
    fontSize: 13,
    color: '#5B5B5B',
    marginBottom: 8,
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberStat: {
    fontSize: 13,
    color: '#1b4a5a',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusExcellent: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '500',
  },
  verificationCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 2,
  },
  verificationSubtitle: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  cpsBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cpsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  cpsCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  cpsTitle: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 8,
  },
  cpsScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  cpsRank: {
    fontSize: 13,
    color: '#78350f',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: (width - 64) / 3,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 74, 90, 0.1)',
    position: 'relative',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementTitle: {
    fontSize: 11,
    color: '#040707',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  achievementPoints: {
    fontSize: 12,
    color: '#fcaf56',
    fontWeight: '600',
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointsText: {
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  rewardsPreviewCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rewardsGradient: {
    padding: 20,
  },
  rewardsPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  rewardsPreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  rewardsPreviewSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rewardsPreviewGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  rewardsPreviewItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
  },
  rewardsPreviewLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  rewardsPreviewValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  rewardsPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewRewardsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fcaf56',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewRewardsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  rewardCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 74, 90, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  rewardPoints: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  redeemButton: {
    backgroundColor: '#1b4a5a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  redeemButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  redeemText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingText: {
    fontSize: 14,
    color: '#040707',
    fontWeight: '500',
  },
  settingSubtext: {
    fontSize: 12,
    color: '#5B5B5B',
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  appVersion: {
    fontSize: 12,
    color: '#5B5B5B',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 11,
    color: '#9ca3af',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  oilCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(27, 74, 90, 0.1)',
  },
  oilHeader: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  oilName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  oilBrand: {
    fontSize: 14,
    color: '#5B5B5B',
    marginBottom: 12,
  },
  swasthaIndexContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  swasthaIndexBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 75,
    maxWidth: 90,
  },
  swasthaIndexScore: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  swasthaIndexLabel: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 2,
  },
  swasthaRating: {
    flex: 1,
  },
  swasthaRatingText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  swasthaExplanation: {
    fontSize: 11,
    color: '#5B5B5B',
    lineHeight: 16,
  },
  healthScoreBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  healthScoreLabel: {
    fontSize: 10,
    color: '#16a34a',
  },
  oilStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  oilStat: {
    flex: 1,
    minWidth: 90,
    backgroundColor: '#fafbfa',
    borderRadius: 12,
    padding: 12,
  },
  oilStatLabel: {
    fontSize: 11,
    color: '#5B5B5B',
    marginBottom: 4,
  },
  oilStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  oilDetails: {
    marginBottom: 16,
  },
  oilDetailText: {
    fontSize: 13,
    color: '#040707',
    marginBottom: 6,
  },
  oilDetailLabel: {
    fontWeight: '600',
    color: '#5B5B5B',
  },
  oilBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  oilBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  oilBadgeText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  nutritionLabel: {
    width: 50,
    fontSize: 13,
    fontWeight: '600',
    color: '#040707',
  },
  nutritionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E7F2F1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  nutritionFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 4,
  },
  nutritionValue: {
    width: 50,
    fontSize: 13,
    fontWeight: '600',
    color: '#1b4a5a',
    textAlign: 'right',
  },
  nutritionFactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  nutritionFactLabel: {
    fontSize: 13,
    color: '#5B5B5B',
    textTransform: 'capitalize',
  },
  nutritionFactValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#040707',
  },
  certificationsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  certificationBadge: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  certificationText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 4,
  },
  changeOilButton: {
    backgroundColor: '#1b4a5a',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  changeOilText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  uploadCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78350f',
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#78350f',
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(27, 74, 90, 0.1)',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  analyzedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  analyzedText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 64) / 2,
    backgroundColor: '#fafbfa',
    borderRadius: 12,
    padding: 12,
  },
  metricLabel: {
    fontSize: 11,
    color: '#5B5B5B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  metricStatus: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metricNormal: {
    color: '#16a34a',
  },
  metricGood: {
    color: '#2563eb',
  },
  reportListCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 74, 90, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E7F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportListInfo: {
    flex: 1,
  },
  reportListName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  reportListDate: {
    fontSize: 12,
    color: '#5B5B5B',
    marginBottom: 2,
  },
  reportListType: {
    fontSize: 11,
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#040707',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#040707',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#040707',
  },
  pickerContainer: {
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#040707',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  swasthaPreview: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  swasthaPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 12,
  },
  swasthaPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  swasthaPreviewBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  swasthaPreviewScore: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  swasthaPreviewLabel: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 2,
  },
  swasthaPreviewDetails: {
    flex: 1,
  },
  swasthaPreviewCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  swasthaPreviewExplanation: {
    fontSize: 12,
    color: '#5B5B5B',
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B5B5B',
  },
  saveModalButton: {
    flex: 1,
    backgroundColor: '#1b4a5a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  oilTypeList: {
    gap: 8,
  },
  oilTypeItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  oilTypeItemSelected: {
    borderColor: '#1b4a5a',
    backgroundColor: '#f0f9ff',
  },
  oilTypeItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  oilTypeItemLeft: {
    flex: 1,
  },
  oilTypeItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  oilTypeItemNameSelected: {
    color: '#1b4a5a',
  },
  oilTypeItemCategory: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  oilTypeItemBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  oilTypeItemScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGroupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(27, 74, 90, 0.1)',
    alignItems: 'center',
  },
  emptyGroupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyGroupSubtitle: {
    fontSize: 14,
    color: '#5B5B5B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  createGroupButton: {
    backgroundColor: '#1b4a5a',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createGroupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  adminBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 10,
    color: '#f59e0b',
    fontWeight: '600',
  },
  groupDescription: {
    fontSize: 12,
    color: '#5B5B5B',
    marginTop: 4,
  },
  groupViewAllButton: {
    backgroundColor: '#E7F2F1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  groupViewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b4a5a',
  },
});

