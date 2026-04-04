/**
 * AppNavigator - Main Navigation Configuration
 * 
 * This is the root navigator for the SwasthTel app.
 * It handles authentication flow, onboarding, and main app navigation.
 * 
 * Navigation Flow:
 * 1. Not Authenticated → Auth Stack (Login/Signup)
 * 2. Authenticated but not onboarded → Onboarding Flow
 * 3. Fully authenticated → Main Stack with Tabs
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Image, 
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Import types
import type { 
  RootStackParamList, 
  MainStackParamList, 
  MainTabsParamList 
} from './types';

// ============================================
// Auth & Onboarding Screens
// ============================================
import { Login } from '../components/native/Login';
import { Signup } from '../components/native/Signup';
import { OTPVerification } from '../components/native/OTPVerification';
import { OnboardingFlow } from '../components/native/OnboardingFlow';

// ============================================
// Main Tab Screens
// ============================================
import { MobileHome } from '../components/native/MobileHome';
import { MobileCommunity } from '../components/native/MobileCommunity';
import { MobilePartners } from '../components/native/MobilePartners';
import { MobileProfile } from '../components/native/MobileProfile';

// ============================================
// Feature Screens
// ============================================
import { MobileOilTracker } from '../components/native/MobileOilTracker';
import { MobileRecipes } from '../components/native/MobileRecipes';
import { MobileChallenges } from '../components/native/MobileChallenges';
import { MobileEducation } from '../components/native/MobileEducation';
import { MobileGroups } from '../components/native/MobileGroups';

// ============================================
// Detail Screens
// ============================================
import { RecipeDetailScreen } from '../components/native/screens/RecipeDetailScreen';
import { RecipeSearchScreen } from '../components/native/screens/RecipeSearchScreen';
import { AIRecipesScreen } from '../components/native/screens/AIRecipesScreen';
import { MealPlannerScreen } from '../components/native/screens/MealPlannerScreen';
import { FavoritesScreen } from '../components/native/screens/FavoritesScreen';

import { ChallengeDetailScreen } from '../components/native/screens/ChallengeDetailScreen';
import { LeaderboardScreen } from '../components/native/screens/LeaderboardScreen';
import { RewardsStoreScreen } from '../components/native/screens/RewardsStoreScreen';

import { EducationModuleScreen } from '../components/native/screens/EducationModuleScreen';
import { EducationHubScreen } from '../components/native/screens/EducationHubScreen';
import { ModuleDetailScreen } from '../components/native/screens/ModuleDetailScreen';
import { VideoLessonScreen } from '../components/native/screens/VideoLessonScreen';
import { QuizScreen } from '../components/native/screens/QuizScreen';
import { ReadingLessonScreen } from '../components/native/screens/ReadingLessonScreen';

import { DeviceManagementScreen } from '../components/native/screens/DeviceManagementScreen';
import { DeviceDetailScreen } from '../components/native/screens/DeviceDetailScreen';
import { NotificationsScreen } from '../components/native/screens/NotificationsScreen';
import { TrendViewScreen } from '../components/native/screens/TrendViewScreen';

import { GroupDetailScreen } from '../components/native/screens/GroupDetailScreen';
import { GroupDashboardScreen } from '../components/native/screens/GroupDashboardScreen';
import { GroupManagementScreen } from '../components/native/screens/GroupManagementScreen';

import { IoTDeviceDetail } from '../components/native/IoTDeviceDetail';

import { RewardsScreen } from '../components/native/screens/RewardsScreen';

import { PartnerDetailScreen } from '../components/native/screens/PartnerDetailScreen';
import { PartnerSearchScreen } from '../components/native/screens/PartnerSearchScreen';
import { BlockchainVerificationScreen } from '../components/native/screens/BlockchainVerificationScreen';
import { ProductComparisonScreen } from '../components/native/screens/ProductComparisonScreen';

import { EditProfileScreen } from '../components/native/screens/EditProfileScreen';
import { MyGoalsScreen } from '../components/native/screens/MyGoalsScreen';
import { GoalSettingsScreen } from '../components/native/screens/GoalSettingsScreen';
import { PrivacySettingsScreen } from '../components/native/screens/PrivacySettingsScreen';
import { HelpSupportScreen } from '../components/native/screens/HelpSupportScreen';
import { SettingsScreen } from '../components/native/screens/SettingsScreen';
import { BarcodeScannerScreen } from '../components/native/screens/BarcodeScannerScreen';
import { FoodOilAnalyzerScreen } from '../components/native/screens/FoodOilAnalyzerScreen';

import { SuperNaniChat } from '../components/native/SuperNaniChat';

// ============================================
// Navigator Instances
// ============================================
const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

// ============================================
// Super Nani Wrapper Screen
// ============================================
function SuperNaniScreen({ navigation }: any) {
  const handleClose = () => {
    navigation.goBack();
  };

  return <SuperNaniChat onClose={handleClose} />;
}

// ============================================
// Tab Bar Styles
// ============================================
const tabStyles = StyleSheet.create({
  activeTabBackground: {
    backgroundColor: '#1b4a5a',
    width: 65,
    height: 55,
    marginBottom: -15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveTabBackground: {
    backgroundColor: 'transparent',
    width: 65,
    height: 55,
    marginBottom: -15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  centerLogo: {
    width: 70,
    height: 70,
  },
});

// ============================================
// Main Tabs Navigator
// ============================================
interface MainTabsProps {
  language: string;
  onLogout: () => void;
}

function MainTabsNavigator({ language, onLogout }: MainTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: Platform.OS === 'ios' ? 85 : 75,
          paddingBottom: Platform.OS === 'ios' ? 20 : 12,
          paddingTop: 8,
          paddingHorizontal: 10,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#1d1d1d',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? tabStyles.activeTabBackground : tabStyles.inactiveTabBackground}>
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={24} 
                color={focused ? '#ffffff' : color} 
              />
            </View>
          ),
        }}
      >
        {(props) => <MobileHome {...props} language={language} />}
      </Tab.Screen>

      <Tab.Screen
        name="CommunityTab"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? tabStyles.activeTabBackground : tabStyles.inactiveTabBackground}>
              <Ionicons 
                name={focused ? 'people' : 'people-outline'} 
                size={24} 
                color={focused ? '#ffffff' : color} 
              />
            </View>
          ),
        }}
      >
        {(props) => <MobileCommunity {...props} language={language} />}
      </Tab.Screen>

      {/* Center Logo Button */}
      <Tab.Screen
        name="Menu"
        component={View}
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={tabStyles.centerButton}>
              <Image
                source={require('../assets/logo.png')}
                style={tabStyles.centerLogo}
                resizeMode="contain"
              />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            // Navigate to SuperNani chatbot using parent navigator
            navigation.getParent()?.navigate('SuperNani');
          },
        })}
      />

      <Tab.Screen
        name="PartnersTab"
        options={{
          title: 'Partners',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? tabStyles.activeTabBackground : tabStyles.inactiveTabBackground}>
              <Ionicons 
                name={focused ? 'storefront' : 'storefront-outline'} 
                size={24} 
                color={focused ? '#ffffff' : color} 
              />
            </View>
          ),
        }}
      >
        {(props) => <MobilePartners {...props} language={language} />}
      </Tab.Screen>

      <Tab.Screen
        name="ProfileTab"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? tabStyles.activeTabBackground : tabStyles.inactiveTabBackground}>
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={24} 
                color={focused ? '#ffffff' : color} 
              />
            </View>
          ),
        }}
      >
        {(props) => <MobileProfile {...props} language={language} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ============================================
// Main Stack Navigator (Tabs + Detail Screens)
// ============================================
interface MainStackProps {
  language: string;
  onLogout: () => void;
}

function MainStackNavigator({ language, onLogout }: MainStackProps) {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Tabs */}
      <MainStack.Screen name="Tabs">
        {(props) => <MainTabsNavigator {...props} language={language} onLogout={onLogout} />}
      </MainStack.Screen>

      {/* Oil Tracker Screens */}
      <MainStack.Screen name="OilTracker">
        {(props) => <MobileOilTracker {...props} language={language} />}
      </MainStack.Screen>
      <MainStack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
      <MainStack.Screen name="Notifications" component={NotificationsScreen} />
      <MainStack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
      <MainStack.Screen 
        name="DeviceDetail" 
        component={DeviceDetailScreen as React.ComponentType<{}>} 
      />
      <MainStack.Screen name="TrendView" component={TrendViewScreen} />
      <MainStack.Screen 
        name="IoTDeviceDetail" 
        component={IoTDeviceDetail as React.ComponentType<{}>} 
      />

      {/* Recipe Screens */}
      <MainStack.Screen name="Recipes">
        {(props) => <MobileRecipes {...props} language={language} />}
      </MainStack.Screen>
      <MainStack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <MainStack.Screen name="RecipeSearch" component={RecipeSearchScreen} />
      <MainStack.Screen name="AIRecipes" component={AIRecipesScreen} />
      <MainStack.Screen name="MealPlanner" component={MealPlannerScreen} />
      <MainStack.Screen name="Favorites" component={FavoritesScreen} />

      {/* Challenge Screens */}
      <MainStack.Screen name="Challenges">
        {(props) => <MobileChallenges {...props} language={language} />}
      </MainStack.Screen>
      <MainStack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
      <MainStack.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen as React.ComponentType<{}>} 
      />
      <MainStack.Screen name="RewardsStore" component={RewardsStoreScreen} />

      {/* Education Screens */}
      <MainStack.Screen name="Education">
        {(props) => <MobileEducation {...props} language={language} />}
      </MainStack.Screen>
      <MainStack.Screen 
        name="EducationModule" 
        component={EducationModuleScreen as React.ComponentType<{}>} 
      />
      <MainStack.Screen 
        name="EducationHub" 
        component={EducationHubScreen as React.ComponentType<{}>} 
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="ModuleDetail" 
        component={ModuleDetailScreen as React.ComponentType<{}>} 
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="VideoLesson" 
        component={VideoLessonScreen as React.ComponentType<{}>} 
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="Quiz" 
        component={QuizScreen as React.ComponentType<{}>} 
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="ReadingLesson" 
        component={ReadingLessonScreen as React.ComponentType<{}>} 
        options={{ headerShown: false }}
      />

      {/* Groups Screens */}
      <MainStack.Screen name="Groups">
        {(props) => <MobileGroups {...props} language={language} />}
      </MainStack.Screen>
      <MainStack.Screen name="GroupDetail">
        {(props) => <GroupDetailScreen {...props} language={language} />}
      </MainStack.Screen>

      {/* Rewards Screen */}
      <MainStack.Screen name="Rewards">
        {(props) => <RewardsScreen {...props} language={language} />}
      </MainStack.Screen>

      {/* Community Screens */}
      <MainStack.Screen name="GroupManagement" component={GroupManagementScreen} />
      <MainStack.Screen 
        name="GroupDashboard" 
        component={GroupDashboardScreen as React.ComponentType<{}>} 
      />

      {/* Partner Screens */}
      <MainStack.Screen name="PartnerDetail" component={PartnerDetailScreen} />
      <MainStack.Screen name="PartnerSearch" component={PartnerSearchScreen} />
      <MainStack.Screen name="BlockchainVerification" component={BlockchainVerificationScreen} />
      <MainStack.Screen name="ProductComparison" component={ProductComparisonScreen} />

      {/* Profile & Settings Screens */}
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
      <MainStack.Screen name="MyGoals" component={MyGoalsScreen} />
      <MainStack.Screen name="GoalSettings" component={GoalSettingsScreen} />
      <MainStack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <MainStack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <MainStack.Screen name="Settings" component={SettingsScreen} />

      {/* Super Nani AI Assistant */}
      <MainStack.Screen
        name="SuperNani"
        component={SuperNaniScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      {/* AI Food Oil Analyzer */}
      <MainStack.Screen
        name="FoodOilAnalyzer"
        component={FoodOilAnalyzerScreen}
        options={{
          headerShown: false,
        }}
      />
    </MainStack.Navigator>
  );
}

// ============================================
// Root Navigator (Authentication Flow)
// ============================================
export function AppNavigator() {
  const { isAuthenticated, isOnboardingComplete, isInitializing, logout, user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'login' | 'signup'>('login');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Update language from user preferences
  useEffect(() => {
    if (user?.language) {
      setSelectedLanguage(user.language);
    }
  }, [user?.language]);

  const handleLogout = async () => {
    await logout();
    setCurrentScreen('login');
  };

  // Loading Screen
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1b4a5a" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // ============================================
          // Auth Stack - User not logged in
          // ============================================
          <>
            {currentScreen === 'login' ? (
              <RootStack.Screen name="Auth">
                {(props) => (
                  <Login
                    {...props}
                    onComplete={() => {
                      // Navigation happens automatically via isAuthenticated
                    }}
                    onSignup={() => setCurrentScreen('signup')}
                    language={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                  />
                )}
              </RootStack.Screen>
            ) : (
              <RootStack.Screen name="Auth">
                {(props) => (
                  <Signup
                    {...props}
                    onComplete={() => {
                      // Navigation happens automatically via isAuthenticated
                    }}
                    onLogin={() => setCurrentScreen('login')}
                    language={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                  />
                )}
              </RootStack.Screen>
            )}
          </>
        ) : !isOnboardingComplete ? (
          // ============================================
          // Onboarding Stack - Logged in but not onboarded
          // ============================================
          <RootStack.Screen name="Onboarding">
            {(props) => (
              <OnboardingFlow
                {...props}
                onComplete={() => {
                  // Navigation happens automatically via isOnboardingComplete
                }}
                language={selectedLanguage}
              />
            )}
          </RootStack.Screen>
        ) : (
          // ============================================
          // Main Stack - Fully authenticated
          // ============================================
          <RootStack.Screen name="Main">
            {(props) => (
              <MainStackNavigator
                {...props}
                language={selectedLanguage}
                onLogout={handleLogout}
              />
            )}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafbfa',
  },
  loadingText: {
    fontSize: 18,
    color: '#1b4a5a',
    fontWeight: '600',
    marginTop: 12,
  },
});

export default AppNavigator;
