/**
 * Screen Exports Index
 * 
 * Central export file for all screens in the app.
 * This makes imports cleaner throughout the navigation.
 */

// ============================================
// Auth Screens
// ============================================
export { Login } from './Login';
export { Signup } from './Signup';
export { OTPVerification } from './OTPVerification';
export { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';

// ============================================
// Onboarding Screens
// ============================================
export { OnboardingFlow } from './OnboardingFlow';
export { AwarenessScreen } from './onboarding/AwarenessScreen';
export { BasicInfoScreen } from './onboarding/BasicInfoScreen';
export { MedicalHistoryScreen } from './onboarding/MedicalHistoryScreen';
export { EatingHabitsScreen } from './onboarding/EatingHabitsScreen';
export { YourOilScreen } from './onboarding/YourOilScreen';
export { OilInsightsScreen } from './onboarding/OilInsightsScreen';

// ============================================
// Main Tab Screens
// ============================================
export { MobileHome } from './MobileHome';
export { MobileCommunity } from './MobileCommunity';
export { MobilePartners } from './MobilePartners';
export { MobileProfile } from './MobileProfile';

// ============================================
// Feature Screens
// ============================================
export { MobileOilTracker } from './MobileOilTracker';
export { MobileRecipes } from './MobileRecipes';
export { MobileChallenges } from './MobileChallenges';
export { MobileEducation } from './MobileEducation';
export { MobileGroups } from './MobileGroups';

// ============================================
// Detail Screens
// ============================================
export { RecipeDetailScreen } from './screens/RecipeDetailScreen';
export { RecipeSearchScreen } from './screens/RecipeSearchScreen';
export { AIRecipesScreen } from './screens/AIRecipesScreen';
export { MealPlannerScreen } from './screens/MealPlannerScreen';
export { FavoritesScreen } from './screens/FavoritesScreen';

export { ChallengeDetailScreen } from './screens/ChallengeDetailScreen';
export { LeaderboardScreen } from './screens/LeaderboardScreen';
export { RewardsStoreScreen } from './screens/RewardsStoreScreen';

export { EducationModuleScreen } from './screens/EducationModuleScreen';

export { DeviceManagementScreen } from './screens/DeviceManagementScreen';
export { DeviceDetailScreen } from './screens/DeviceDetailScreen';
export { NotificationsScreen } from './screens/NotificationsScreen';
export { TrendViewScreen } from './screens/TrendViewScreen';

export { GroupDetailScreen } from './screens/GroupDetailScreen';
export { GroupDashboardScreen } from './screens/GroupDashboardScreen';
export { GroupManagementScreen } from './screens/GroupManagementScreen';

export { IoTDeviceDetail } from './IoTDeviceDetail';

export { PartnerDetailScreen } from './screens/PartnerDetailScreen';
export { PartnerSearchScreen } from './screens/PartnerSearchScreen';
export { BlockchainVerificationScreen } from './screens/BlockchainVerificationScreen';
export { ProductComparisonScreen } from './screens/ProductComparisonScreen';

export { EditProfileScreen } from './screens/EditProfileScreen';
export { MyGoalsScreen } from './screens/MyGoalsScreen';
export { PrivacySettingsScreen } from './screens/PrivacySettingsScreen';
export { HelpSupportScreen } from './screens/HelpSupportScreen';
export { SettingsScreen } from './screens/SettingsScreen';
export { GoalSettingsScreen } from './screens/GoalSettingsScreen';

// ============================================
// Utility/Modal Screens
// ============================================
export { SuperNani } from './SuperNani';
export { SuperNaniChat } from './SuperNaniChat';
export { HamburgerMenu } from './HamburgerMenu';

// ============================================
// UI Components
// ============================================
export { Button } from './Button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { Input } from './Input';
export { Badge } from './Badge';
export { Progress } from './Progress';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export { WebView } from './WebView';
export { default as LanguageSelector } from './LanguageSelector';
