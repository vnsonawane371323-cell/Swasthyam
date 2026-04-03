import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';

interface AIRecipesScreenProps {
  navigation: any;
}

export function AIRecipesScreen({ navigation }: AIRecipesScreenProps) {
  const aiRecommendations = [
    {
      id: 1,
      title: 'Steamed Vegetable Momos',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb',
      oilReduction: 95,
      reason: 'Based on your love for snacks',
      prepTime: '25 min',
      calories: 120,
    },
    {
      id: 2,
      title: 'Grilled Chicken Salad',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      oilReduction: 80,
      reason: 'Perfect for your lunch goals',
      prepTime: '15 min',
      calories: 250,
    },
    {
      id: 3,
      title: 'Baked Sweet Potato Fries',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
      oilReduction: 75,
      reason: 'Healthier alternative to fried',
      prepTime: '30 min',
      calories: 150,
    },
  ];

  const categories = [
    { id: 'breakfast', label: '0g Oil Breakfasts', count: 12 },
    { id: 'snacks', label: 'Low-Oil Snacks', count: 18 },
    { id: 'dinner', label: 'Quick Dinners', count: 15 },
    { id: 'desserts', label: 'Healthy Desserts', count: 8 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <View style={styles.headerTitleRow}>
                <Ionicons name="sparkles" size={24} color="#fff" />
                <Text style={styles.headerTitle}>AI Recommendations</Text>
              </View>
              <Text style={styles.headerSubtitle}>Personalized for you</Text>
            </View>
          </View>
        </View>

        {/* AI Insight */}
        <View style={styles.content}>
          <Card style={styles.insightCard}>
            <View style={styles.insightContent}>
              <View style={styles.insightIcon}>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </View>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Your AI Profile</Text>
                <Text style={styles.insightDescription}>
                  Based on your consumption patterns, we've curated recipes that can help you save an additional 2L of oil per month!
                </Text>
              </View>
            </View>
          </Card>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse by Goal</Text>
            <View style={styles.categoriesGrid}>
              {categories.map(category => (
                <Card key={category.id} style={styles.categoryCard}>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                  <Text style={styles.categoryCount}>{category.count} recipes</Text>
                </Card>
              ))}
            </View>
          </View>

          {/* Recommended Recipes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <View style={styles.recipesList}>
              {aiRecommendations.map(recipe => (
                <TouchableOpacity
                  key={recipe.id}
                  onPress={() => navigation.navigate('RecipeDetail', { recipe })}
                  activeOpacity={0.7}
                >
                  <Card style={styles.recipeCard}>
                    <View style={styles.recipeContent}>
                      <View style={styles.recipeImageContainer}>
                        <Image 
                          source={{ uri: recipe.image }}
                          style={styles.recipeImage}
                          resizeMode="cover"
                        />
                        <View style={styles.aiPickBadge}>
                          <Ionicons name="sparkles" size={12} color="#fff" />
                          <Text style={styles.aiPickText}>AI Pick</Text>
                        </View>
                      </View>
                      <View style={styles.recipeInfo}>
                        <View style={styles.recipeHeader}>
                          <Text style={styles.recipeTitle} numberOfLines={2}>
                            {recipe.title}
                          </Text>
                          <TouchableOpacity style={styles.heartButton}>
                            <Ionicons name="heart-outline" size={20} color="#9ca3af" />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.recipeDetails}>
                          <Badge variant="success" style={styles.recipeBadge}>
                            <Text style={{color: '#16a34a', fontSize: 12}}>{recipe.oilReduction}% less oil</Text>
                          </Badge>
                          <Text style={styles.recipeReason}>{recipe.reason}</Text>
                          <View style={styles.recipeStats}>
                            <View style={styles.recipeStat}>
                              <Ionicons name="time-outline" size={12} color="#6b7280" />
                              <Text style={styles.recipeStatText}>{recipe.prepTime}</Text>
                            </View>
                            <Text style={styles.recipeStatText}>{recipe.calories} kcal</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5ff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#f3e8ff',
    marginTop: 2,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  insightCard: {
    backgroundColor: '#faf5ff',
    borderColor: '#d8b4fe',
    borderWidth: 1,
  },
  insightContent: {
    flexDirection: 'row',
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#a855f7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#581c87',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#7c3aed',
    lineHeight: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  recipesList: {
    gap: 12,
  },
  recipeCard: {
    marginBottom: 0,
    overflow: 'hidden',
  },
  recipeContent: {
    flexDirection: 'row',
    gap: 12,
  },
  recipeImageContainer: {
    position: 'relative',
  },
  recipeImage: {
    width: 128,
    height: 128,
    borderRadius: 8,
  },
  aiPickBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#a855f7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aiPickText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  recipeInfo: {
    flex: 1,
    paddingVertical: 4,
    gap: 8,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  recipeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  heartButton: {
    padding: 4,
  },
  recipeDetails: {
    gap: 8,
  },
  recipeBadge: {
    alignSelf: 'flex-start',
  },
  recipeReason: {
    fontSize: 12,
    color: '#7c3aed',
    fontStyle: 'italic',
  },
  recipeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recipeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeStatText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
