import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';

interface FavoritesScreenProps {
  navigation: any;
}

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const favoriteRecipes = [
    { id: 1, title: 'Air-Fried Samosa', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950', oilReduction: 83, category: 'Snacks', prepTime: '30 min', calories: 180 },
    { id: 2, title: 'Grilled Paneer Tikka', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8', oilReduction: 75, category: 'Main Course', prepTime: '25 min', calories: 220 },
    { id: 3, title: 'Baked Vegetable Pakora', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84', oilReduction: 85, category: 'Snacks', prepTime: '20 min', calories: 140 },
  ];

  const categories = ['All', 'Breakfast', 'Snacks', 'Main Course', 'Desserts'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <View style={styles.titleRow}>
                <Ionicons name="heart" size={24} color="#fff" />
                <Text style={styles.headerTitle}>My Favorites</Text>
              </View>
              <Text style={styles.headerSubtitle}>{favoriteRecipes.length} saved recipes</Text>
            </View>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map(cat => (
            <TouchableOpacity key={cat} style={styles.categoryButton}>
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.content}>
          {favoriteRecipes.map(recipe => (
            <TouchableOpacity key={recipe.id} onPress={() => navigation.navigate('RecipeDetail', { recipe })} activeOpacity={0.7}>
              <Card style={styles.recipeCard}>
                <View style={styles.recipeContent}>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: recipe.image }} style={styles.recipeImage} resizeMode="cover" />
                    <TouchableOpacity style={styles.heartButton}>
                      <Ionicons name="heart" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>
                    <Badge variant="success" style={styles.recipeBadge}>
                      <Text style={{color: '#16a34a', fontSize: 12}}>{recipe.oilReduction}% less oil</Text>
                    </Badge>
                    <View style={styles.recipeStats}>
                      <View style={styles.stat}>
                        <Ionicons name="time-outline" size={12} color="#6b7280" />
                        <Text style={styles.statText}>{recipe.prepTime}</Text>
                      </View>
                      <View style={styles.stat}>
                        <Ionicons name="flame-outline" size={12} color="#6b7280" />
                        <Text style={styles.statText}>{recipe.calories} kcal</Text>
                      </View>
                    </View>
                    <Text style={styles.category}>{recipe.category}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef2f2' },
  header: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#fecaca', marginTop: 2 },
  categoriesScroll: { paddingHorizontal: 16, paddingVertical: 16 },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 20, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  categoryText: { fontSize: 14, color: '#374151' },
  content: { padding: 16, gap: 12 },
  recipeCard: { marginBottom: 0, overflow: 'hidden' },
  recipeContent: { flexDirection: 'row', gap: 12 },
  imageContainer: { position: 'relative' },
  recipeImage: { width: 128, height: 128, borderRadius: 8 },
  heartButton: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  recipeInfo: { flex: 1, paddingVertical: 4, gap: 6 },
  recipeTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  recipeBadge: { alignSelf: 'flex-start' },
  recipeStats: { flexDirection: 'row', gap: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: '#6b7280' },
  category: { fontSize: 12, color: '#6b7280' },
});
