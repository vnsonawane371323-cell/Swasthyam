import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { t } from '../../i18n';

interface MobileRecipesProps {
}

const recipes = [
  {
    id: 1,
    name: 'Air-Fried Samosa',
    category: 'Snacks',
    time: '35 mins',
    servings: 6,
    originalOil: 30,
    optimizedOil: 10,
    savings: 67,
  },
  {
    id: 2,
    name: 'Steamed Momos',
    category: 'Snacks',
    time: '25 mins',
    servings: 4,
    originalOil: 20,
    optimizedOil: 2,
    savings: 90,
  },
  {
    id: 3,
    name: 'Grilled Paneer Tikka',
    category: 'Main Course',
    time: '30 mins',
    servings: 4,
    originalOil: 18,
    optimizedOil: 6,
    savings: 67,
  },
  {
    id: 4,
    name: 'Air-Fried Aloo Tikki',
    category: 'Snacks',
    time: '20 mins',
    servings: 4,
    originalOil: 25,
    optimizedOil: 8,
    savings: 68,
  },
  {
    id: 5,
    name: 'Low-Oil Dal Tadka',
    category: 'Main Course',
    time: '40 mins',
    servings: 4,
    originalOil: 15,
    optimizedOil: 5,
    savings: 67,
  },
];

export function MobileRecipes({ language }: MobileRecipesProps) {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const text = {
    en: {
      title: 'Recipe Optimizer',
      subtitle: 'AI-powered low-oil recipes',
      search: 'Search for ingredients or dish...',
      aiTitle: 'AI Recommendation',
      aiDesc: 'Based on your consumption, try breakfast recipes with 0g oil!',
      allRecipes: 'All Recipes',
      snacks: 'Snacks',
      mainCourse: 'Main Course',
      servings: 'servings',
      savings: 'savings',
      viewRecipe: 'View Recipe',
    },
    hi: {
      title: 'रेसिपी ऑप्टिमाइज़र',
      subtitle: 'एआई-संचालित कम तेल व्यंजन',
      search: 'सामग्री या व्यंजन खोजें...',
      aiTitle: 'एआई सिफारिश',
      aiDesc: 'आपकी खपत के आधार पर, 0g तेल के साथ नाश्ता व्यंजन आज़माएं!',
      allRecipes: 'सभी व्यंजन',
      snacks: 'स्नैक्स',
      mainCourse: 'मुख्य व्यंजन',
      servings: 'सर्विंग्स',
      savings: 'बचत',
      viewRecipe: 'रेसिपी देखें',
    },
  };

  const t = text[language as keyof typeof text] || text.en;

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderRecipe = ({ item }: { item: typeof recipes[0] }) => (
    <Card style={styles.recipeCard}>
      <CardContent style={styles.recipeContent}>
        <View style={styles.recipeHeader}>
          <View style={styles.recipeIcon}>
            <Ionicons name="restaurant" size={32} color="#f97316" />
          </View>
          <Badge variant="success">
            <Text style={styles.savingsText}>{item.savings}% {t.savings}</Text>
          </Badge>
        </View>

        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeCategory}>{item.category}</Text>

        <View style={styles.recipeInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#5B5B5B" />
            <Text style={styles.infoText}>{item.time}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={16} color="#5B5B5B" />
            <Text style={styles.infoText}>{item.servings} {t.servings}</Text>
          </View>
        </View>

        <View style={styles.oilComparison}>
          <View style={styles.oilStat}>
            <Text style={styles.oilLabel}>Original</Text>
            <Text style={styles.oilValue}>{item.originalOil}ml</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#5B5B5B" />
          <View style={styles.oilStat}>
            <Text style={styles.oilLabel}>Optimized</Text>
            <Text style={[styles.oilValue, styles.optimizedValue]}>{item.optimizedOil}ml</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
        >
          <Text style={styles.viewButtonText}>{t.viewRecipe}</Text>
        </TouchableOpacity>
      </CardContent>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant" size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(249, 115, 22, 0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder={t.search}
            placeholderTextColor="rgba(249, 115, 22, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Recommendation Banner */}
        <Card style={styles.aiCard}>
          <CardContent style={styles.aiContent}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={24} color="#ffffff" />
            </View>
            <View style={styles.aiText}>
              <Text style={styles.aiTitle}>{t.aiTitle}</Text>
              <Text style={styles.aiDesc}>{t.aiDesc}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'all' && styles.categoryTextActive,
              ]}
            >
              {t.allRecipes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'Snacks' && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory('Snacks')}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'Snacks' && styles.categoryTextActive,
              ]}
            >
              {t.snacks}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'Main Course' && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory('Main Course')}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'Main Course' && styles.categoryTextActive,
              ]}
            >
              {t.mainCourse}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Recipes List */}
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.recipesList}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  header: {
    backgroundColor: '#f97316',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  aiCard: {
    marginBottom: 16,
    backgroundColor: '#a855f7',
    borderWidth: 0,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  aiIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  aiDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  categoryButtonActive: {
    backgroundColor: '#f97316',
  },
  categoryText: {
    fontSize: 14,
    color: '#5B5B5B',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  recipesList: {
    gap: 16,
  },
  recipeCard: {
    marginBottom: 0,
  },
  recipeContent: {
    padding: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recipeIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 14,
    color: '#5B5B5B',
    marginBottom: 12,
  },
  recipeInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  oilComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  oilStat: {
    flex: 1,
    alignItems: 'center',
  },
  oilLabel: {
    fontSize: 12,
    color: '#5B5B5B',
    marginBottom: 4,
  },
  oilValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
  },
  optimizedValue: {
    color: '#16a34a',
  },
  viewButton: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
