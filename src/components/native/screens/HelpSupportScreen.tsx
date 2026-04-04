import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HELP_CONTENT = {
  gettingStarted: {
    title: 'Getting Started',
    icon: 'play-circle',
    items: [
      {
        title: 'What is SwasthTel?',
        subtitle: 'Learn about the app',
        content: 'SwasthTel is a personalized health tracking application designed to monitor and optimize cooking oil consumption. Track daily oil, monitor health through medical reports, and get culturally relevant cooking suggestions.',
      },
      {
        title: 'Initial Setup',
        subtitle: '5 steps to get started',
        content: '1. Download & Install\n2. Create Account\n3. Complete 3-step onboarding\n4. Grant Permissions\n5. Start Tracking oil',
      },
    ],
  },
  oilTracking: {
    title: 'Oil Tracking System',
    icon: 'water',
    items: [
      {
        title: 'How Oil Tracking Works',
        subtitle: 'Understanding the system',
        content: '1. Enter oil consumption\n2. Oil properties retrieved\n3. Health analyzed\n4. Calculations determine calories\n5. Feedback provided',
      },
      {
        title: 'Logging Methods',
        subtitle: '4 ways to log',
        content: '• Manual: Weight (g) or Volume (ml)\n• Barcode: Scan oil bottle\n• Dish: Log by meal\n• IoT: Smart scale',
      },
    ],
  },
  cookingMethods: {
    title: 'Cooking Methods',
    icon: 'flame',
    items: [
      {
        title: 'Deep Fry',
        subtitle: 'Factor: 1.25 - Most oil absorbed',
        content: 'Food fully immersed in oil at 160-190°C. Examples: Samosa, Pakora. Oil absorption +25% more. Most oil absorbed.',
      },
      {
        title: 'Shallow Fry',
        subtitle: 'Factor: 1.15 - Moderate absorption',
        content: 'Food partially immersed, 150-170°C oil. Examples: Paneer tikka, Vegetables. Oil absorption +15%.',
      },
      {
        title: 'Saute',
        subtitle: 'Factor: 1.05 - Minimal absorption',
        content: 'Quick cooking, small oil amount, 110-140°C, frequent stirring. Oil absorption +5% only. HEALTHIEST.',
      },
      {
        title: 'Boil',
        subtitle: 'Factor: 1.0 - No extra absorption',
        content: 'Cooking in boiling water, 100°C. Oil used for flavor only. Most heart-healthy option.',
      },
    ],
  },
  oilTypes: {
    title: 'Oil Types & Properties',
    icon: 'beaker',
    items: [
      {
        title: 'Mustard Oil - RECOMMENDED',
        subtitle: 'Health Score: 7/10',
        content: 'Density: 0.91 g/ml. 60% monounsaturated fat. Best for daily cooking. Anti-inflammatory.',
      },
      {
        title: 'Sunflower Oil',
        subtitle: 'Health Score: 6/10',
        content: 'Density: 0.92 g/ml. 68% PUFA. Good for general cooking. Maximum 2-3 reuses safe.',
      },
      {
        title: 'Olive Oil - PREMIUM',
        subtitle: 'Health Score: 8/10',
        content: 'Density: 0.91 g/ml. 71% monounsaturated fat. Highest quality. Use fresh, avoid high-heat.',
      },
      {
        title: 'Coconut Oil',
        subtitle: 'Health Score: 5/10',
        content: 'Density: 0.92 g/ml. 92% saturated fat. Use sparingly. 15-20ml/week max. 1-2 times/week only.',
      },
      {
        title: 'Ghee',
        subtitle: 'Health Score: 4/10',
        content: 'Density: 0.96 g/ml. 62% saturated fat. Special occasions only. 5-10ml/week max.',
      },
    ],
  },
  calculations: {
    title: 'Calculations & Formulas',
    icon: 'calculator',
    items: [
      {
        title: 'Raw Oil Calories',
        subtitle: 'Basic = Weight × 9',
        content: 'Formula: Raw Calories = Weight (g) × 9\nExample: 20g oil = 180 kcal\nAll oils: 9 kcal/gram standard',
      },
      {
        title: 'Daily Oil Budget',
        subtitle: 'TDEE × 0.07 (ICMR)',
        content: 'Formula: Oil Budget = TDEE × 0.07\nExample: 2600 × 0.07 = 182 kcal/day ≈ 20g ≈ 22ml',
      },
      {
        title: 'TDEE Calculation',
        subtitle: 'Your daily calorie needs',
        content: 'TDEE = BMR × Activity Factor\nBMR: Mifflin-St Jeor equation from age, height, weight, gender\nActivity: 1.2 (sedentary) to 1.9 (extra active)',
      },
    ],
  },
  iotTracker: {
    title: 'IoT Tracker & Connection',
    icon: 'wifi',
    items: [
      {
        title: 'What is IoT Tracking?',
        subtitle: 'Smart device integration',
        content: 'Uses WiFi-enabled smart scales to measure oil directly. Eliminates manual errors. Accurate to 0.1g.',
      },
      {
        title: 'Connection Setup',
        subtitle: 'Step-by-step',
        content: '1. Prepare scale + WiFi\n2. Connect scale to WiFi\n3. App → Settings → IoT Devices\n4. Add Device → Enter IP\n5. Calibrate with 1kg weight',
      },
      {
        title: 'Using IoT Tracker',
        subtitle: 'Logging oil',
        content: '1. Place oil container on scale\n2. Note reading\n3. Select cooking method\n4. Enter reuse count (0-3)\n5. Tap "Log"\n6. Review feedback',
      },
    ],
  },
  medicalReports: {
    title: 'Medical Report Analyzer',
    icon: 'document-text',
    items: [
      {
        title: 'What It Does',
        subtitle: 'AI-powered analysis',
        content: 'Upload medical reports. Gemini AI extracts health metrics. Analyzes 10+ conditions. Provides personalized recommendations.',
      },
      {
        title: 'How to Upload',
        subtitle: '4 simple steps',
        content: '1. Prepare report (photo/PDF)\n2. Profile → Medical Reports\n3. Upload New Report\n4. Analyze & Wait 30-60s\n5. Review results',
      },
      {
        title: 'Understanding Results',
        subtitle: 'Reading your scores',
        content: 'Health Score: 90-100 (Excellent), 70-89 (Good), 50-69 (Fair), <50 (Serious)\nOil Recommendation: Based on conditions\nRisk Flags: Red/Yellow/Blue alerts',
      },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    icon: 'help-circle',
    items: [
      {
        title: 'General Questions',
        subtitle: 'App & Account',
        content: 'Is it free? Yes, basic is free with ads.\nUpdate profile? After checkup or 6 months.\nPrivacy? Yes, encrypted & local storage.',
      },
      {
        title: 'Oil Questions',
        subtitle: 'Consumption & Types',
        content: 'Exceed daily goal? Occasional okay. 7-day average matters.\nStop oil? No! Need 15-30ml daily.\nReuse oil? Max 2-3 times. 5% loss/reuse.',
      },
      {
        title: 'Cooking Methods',
        subtitle: 'Methods & Techniques',
        content: 'Healthiest? Boil (1.0) or Saute (1.05).\nDeep vs Shallow? Deep = full immersion, more oil.\nFactors? More contact = more absorption.',
      },
    ],
  },
};

export function HelpSupportScreen({ navigation }: { navigation: any }) {
  const { isDarkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    },
    headerContainer: {
      padding: 20,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#444' : '#e0e0e0',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 12,
    },
    searchBox: {
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 10,
      color: isDarkMode ? '#fff' : '#000',
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#ddd',
    },
    categoryGrid: {
      padding: 15,
    },
    categoryButton: {
      marginBottom: 12,
      borderRadius: 12,
      padding: 15,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      borderLeftWidth: 4,
      borderColor: '#FF6B6B',
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    categoryIcon: {
      marginRight: 12,
      fontSize: 24,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
      flex: 1,
    },
    categorySubtitle: {
      fontSize: 12,
      color: isDarkMode ? '#aaa' : '#666',
      marginLeft: 36,
      marginTop: 4,
    },
    contentContainer: {
      paddingBottom: 40,
    },
    itemContainer: {
      marginHorizontal: 15,
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      overflow: 'hidden',
      borderLeftWidth: 4,
      borderLeftColor: '#4CAF50',
    },
    itemHeader: {
      paddingHorizontal: 15,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
    },
    itemTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
      flex: 1,
    },
    itemSubtitle: {
      fontSize: 12,
      color: isDarkMode ? '#888' : '#999',
      marginTop: 4,
    },
    expandIcon: {
      color: isDarkMode ? '#aaa' : '#666',
      fontSize: 20,
    },
    itemContent: {
      paddingHorizontal: 15,
      paddingBottom: 12,
      backgroundColor: isDarkMode ? '#1f1f1f' : '#fafafa',
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
    },
    contentText: {
      fontSize: 13,
      color: isDarkMode ? '#ccc' : '#555',
      lineHeight: 20,
    },
    backButton: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginBottom: 15,
    },
    backButtonText: {
      fontSize: 16,
      color: '#4CAF50',
      fontWeight: '600',
    },
    emptyState: {
      padding: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: {
      fontSize: 16,
      color: isDarkMode ? '#aaa' : '#999',
      textAlign: 'center',
    },
  });

  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) {
      return HELP_CONTENT;
    }

    const query = searchQuery.toLowerCase();
    const filtered: typeof HELP_CONTENT = {};

    Object.entries(HELP_CONTENT).forEach(([key, category]: any) => {
      const matchedItems = category.items.filter(
        (item: any) =>
          item.title.toLowerCase().includes(query) ||
          item.subtitle.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query),
      );

      if (matchedItems.length > 0) {
        filtered[key as keyof typeof HELP_CONTENT] = {
          ...category,
          items: matchedItems,
        };
      }
    });

    return filtered;
  }, [searchQuery]);

  const toggleExpand = (itemKey: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  if (selectedCategory) {
    const category = HELP_CONTENT[selectedCategory as keyof typeof HELP_CONTENT];

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={styles.backButtonText}>← Back to Categories</Text>
          </TouchableOpacity>

          <View style={{ paddingHorizontal: 15 }}>
            <View style={styles.categoryHeader}>
              <Ionicons name={category.icon} size={28} color="#4CAF50" />
              <Text style={[styles.categoryTitle, { fontSize: 22, marginLeft: 12 }]}>
                {category.title}
              </Text>
            </View>
          </View>

          <View style={styles.contentContainer}>
            {(category.items as any[]).map((item, idx) => {
              const itemKey = `${selectedCategory}-${idx}`;
              const isExpanded = expandedItems[itemKey];

              return (
                <View key={idx} style={styles.itemContainer}>
                  <TouchableOpacity
                    style={styles.itemHeader}
                    onPress={() => toggleExpand(itemKey)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      style={styles.expandIcon}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.itemContent}>
                      <Text style={styles.contentText}>{item.content}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const categories = Object.entries(filteredContent).map(([key, category]: any) => ({
    key,
    ...category,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <TextInput
            style={styles.searchBox}
            placeholder="Search help topics..."
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {categories.length > 0 ? (
          <View style={styles.categoryGrid}>
            {categories.map((category: any) => (
              <TouchableOpacity
                key={category.key}
                style={styles.categoryButton}
                onPress={() => setSelectedCategory(category.key)}
              >
                <View style={styles.categoryHeader}>
                  <Ionicons
                    name={category.icon}
                    size={24}
                    color="#FF6B6B"
                    style={styles.categoryIcon}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categorySubtitle}>
                      {category.items.length} topics
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={isDarkMode ? '#888' : '#bbb'}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={isDarkMode ? '#555' : '#ddd'} />
            <Text style={[styles.emptyStateText, { marginTop: 12 }]}>
              No topics found for "{searchQuery}"
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
