/**
 * Navigation Types for SwasthTel App
 * 
 * This file defines all navigation route parameters and types
 * for type-safe navigation throughout the app.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ============================================
// Root Navigator Types
// ============================================

export type RootStackParamList = {
  // Auth screens
  Auth: NavigatorScreenParams<AuthStackParamList>;
  
  // Onboarding screens
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  
  // Main app screens
  Main: NavigatorScreenParams<MainStackParamList>;
};

// ============================================
// Auth Stack Types
// ============================================

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OTPVerification: {
    email: string;
    phone?: string;
  };
  ForgotPassword: undefined;
  ResetPassword: {
    token: string;
  };
};

// ============================================
// Onboarding Stack Types
// ============================================

export type OnboardingStackParamList = {
  Awareness: undefined;
  BasicInfo: undefined;
  MedicalHistory: undefined;
  EatingHabits: undefined;
  YourOil: undefined;
  OilInsights: undefined;
};

// ============================================
// Main Tabs Types
// ============================================

export type MainTabsParamList = {
  HomeTab: undefined;
  CommunityTab: undefined;
  Menu: undefined;
  PartnersTab: undefined;
  ProfileTab: undefined;
};

// ============================================
// Main Stack Types (includes tabs + detail screens)
// ============================================

export type MainStackParamList = {
  // Tabs container
  Tabs: NavigatorScreenParams<MainTabsParamList>;
  
  // Oil Tracker Screens
  OilTracker: {
    targetDate?: string;
    scannedProduct?: {
      name: string;
      brand?: string;
      oilContent?: string;
      nutritionalInfo?: any;
    };
  };
  BarcodeScanner: undefined;
  Notifications: undefined;
  DeviceManagement: undefined;
  DeviceDetail: {
    deviceId: string;
    deviceName?: string;
  };
  IoTDeviceDetail: {
    device: {
      id: string;
      name: string;
      type: string;
      status: 'connected' | 'disconnected' | 'pairing';
      lastSync: string;
      batteryLevel?: number;
    };
  };
  TrendView: {
    type?: 'daily' | 'weekly' | 'monthly';
  };
  
  // Recipe Screens
  Recipes: undefined;
  RecipeDetail: {
    recipeId: string;
    recipeName?: string;
  };
  RecipeSearch: {
    query?: string;
    category?: string;
  };
  AIRecipes: undefined;
  MealPlanner: undefined;
  Favorites: undefined;
  
  // Challenge Screens
  Challenges: undefined;
  ChallengeDetail: {
    challengeId: string;
    challengeName?: string;
  };
  Leaderboard: {
    challengeId?: string;
  };
  RewardsStore: undefined;
  
  // Education Screens
  Education: undefined;
  EducationModule: {
    moduleId: string;
    moduleName?: string;
  };
  EducationHub: undefined;
  ModuleDetail: {
    module: {
      id: string;
      title: { en: string; hi: string };
      description: { en: string; hi: string };
      duration: string;
      progress: number;
      videos: number;
      points: number;
      level: string;
      icon: string;
      color: string[];
    };
  };
  VideoLesson: {
    lesson: {
      id: string;
      title: { en: string; hi: string };
      duration: string;
      type: string;
    };
    module: {
      id: string;
      title: { en: string; hi: string };
      color: string[];
    };
  };
  Quiz: {
    lesson: {
      id: string;
      title: { en: string; hi: string };
      duration: string;
      type: string;
    };
    module: {
      id: string;
      title: { en: string; hi: string };
      color: string[];
    };
  };
  ReadingLesson: {
    lesson: {
      id: string;
      title: { en: string; hi: string };
      duration: string;
      type: string;
    };
    module: {
      id: string;
      title: { en: string; hi: string };
      color: string[];
    };
  };
  
  // Groups Screens
  Groups: undefined;
  GroupDetail: {
    groupId: string;
    groupName?: string;
  };
  
  // Community Screens
  GroupManagement: undefined;
  GroupDashboard: {
    groupId: string;
  };
  
  // Partner Screens
  PartnerDetail: {
    partnerId: string;
    partnerName?: string;
  };
  PartnerSearch: {
    query?: string;
    category?: string;
  };
  BlockchainVerification: {
    partnerId?: string;
  };
  ProductComparison: {
    productIds?: string[];
  };
  
  // Rewards Screens
  Rewards: undefined;
  
  // Profile Screens
  EditProfile: undefined;
  MyGoals: undefined;
  GoalSettings: undefined;
  PrivacySettings: undefined;
  HelpSupport: undefined;
  Settings: undefined;
  
  // Super Nani (AI Assistant)
  SuperNani: undefined;
  
  // AI Food Oil Analyzer
  FoodOilAnalyzer: undefined;
};

// ============================================
// Screen Props Types
// ============================================

// Root stack screen props
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Auth stack screen props
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Onboarding stack screen props
export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<OnboardingStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Main tabs screen props
export type MainTabsScreenProps<T extends keyof MainTabsParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabsParamList, T>,
    NativeStackScreenProps<MainStackParamList>
  >;

// Main stack screen props
export type MainStackScreenProps<T extends keyof MainStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<MainStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// ============================================
// Declaration Merging for useNavigation
// ============================================

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
