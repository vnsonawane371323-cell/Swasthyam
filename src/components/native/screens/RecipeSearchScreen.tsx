import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

interface RecipeSearchScreenProps {
  navigation: any;
}

export function RecipeSearchScreen({ navigation }: RecipeSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filters = {
    cuisine: ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai'],
    diet: ['Vegetarian', 'Vegan', 'Gluten-Free'],
    prepTime: ['< 15 min', '15-30 min', '30-60 min', '> 60 min'],
  };

  const searchResults = [
    {
      id: 1,
      title: 'Grilled Paneer Tikka',
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8',
      oilReduction: 75,
      category: 'Indian',
      prepTime: '20 min',
      rating: 4.7,
    },
    {
      id: 2,
      title: 'Baked Spring Rolls',
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0',
      oilReduction: 80,
      category: 'Chinese',
      prepTime: '25 min',
      rating: 4.5,
    },
    {
      id: 3,
      title: 'Air-Fried Falafel',
      image: 'https://images.unsplash.com/photo-1593504049359-74330189a345',
      oilReduction: 70,
      category: 'Middle Eastern',
      prepTime: '30 min',
      rating: 4.6,
    },
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Recipes</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for ingredients or dish..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filters</Text>
            {selectedFilters.length > 0 && (
              <TouchableOpacity onPress={() => setSelectedFilters([])}>
                <Text style={styles.clearFilters}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Selected Filters */}
          {selectedFilters.length > 0 && (
            <View style={styles.selectedFilters}>
              {selectedFilters.map(filter => (
                <TouchableOpacity key={filter} onPress={() => toggleFilter(filter)}>
                  <Badge variant="success" style={styles.selectedFilterBadge}>
                    <Text style={{color: '#16a34a', fontSize: 12}}>{filter}</Text>
                  </Badge>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Filter Categories */}
          <View style={styles.filterCategories}>
            <View style={styles.filterCategory}>
              <Text style={styles.filterCategoryLabel}>Cuisine</Text>
              <View style={styles.filterButtons}>
                {filters.cuisine.map(cuisine => (
                  <TouchableOpacity
                    key={cuisine}
                    style={[
                      styles.filterButton,
                      selectedFilters.includes(cuisine) && styles.filterButtonActive
                    ]}
                    onPress={() => toggleFilter(cuisine)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedFilters.includes(cuisine) && styles.filterButtonTextActive
                    ]}>
                      {cuisine}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterCategory}>
              <Text style={styles.filterCategoryLabel}>Diet</Text>
              <View style={styles.filterButtons}>
                {filters.diet.map(diet => (
                  <TouchableOpacity
                    key={diet}
                    style={[
                      styles.filterButton,
                      selectedFilters.includes(diet) && styles.filterButtonActive
                    ]}
                    onPress={() => toggleFilter(diet)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedFilters.includes(diet) && styles.filterButtonTextActive
                    ]}>
                      {diet}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterCategory}>
              <Text style={styles.filterCategoryLabel}>Prep Time</Text>
              <View style={styles.filterButtons}>
                {filters.prepTime.map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.filterButton,
                      selectedFilters.includes(time) && styles.filterButtonActive
                    ]}
                    onPress={() => toggleFilter(time)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedFilters.includes(time) && styles.filterButtonTextActive
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Search Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>{searchResults.length} Results Found</Text>
          <View style={styles.resultsList}>
            {searchResults.map(recipe => (
              <TouchableOpacity
                key={recipe.id}
                onPress={() => navigation.navigate('RecipeDetail', { recipe })}
                activeOpacity={0.7}
              >
                <Card style={styles.recipeCard}>
                  <View style={styles.recipeContent}>
                    <Image 
                      source={{ uri: recipe.image }}
                      style={styles.recipeImage}
                      resizeMode="cover"
                    />
                    <View style={styles.recipeInfo}>
                      <View style={styles.recipeHeader}>
                        <Text style={styles.recipeTitle} numberOfLines={2}>
                          {recipe.title}
                        </Text>
                        <Badge variant="success" style={styles.recipeBadge}>
                          <Text style={{color: '#16a34a', fontSize: 12}}>{recipe.oilReduction}% less</Text>
                        </Badge>
                      </View>
                      <View style={styles.recipeStats}>
                        <Text style={styles.recipeStat}>{recipe.category}</Text>
                        <Text style={styles.recipeStat}>•</Text>
                        <Text style={styles.recipeStat}>{recipe.prepTime}</Text>
                        <Text style={styles.recipeStat}>•</Text>
                        <Text style={styles.recipeStat}>⭐ {recipe.rating}</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  filtersSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  clearFilters: {
    fontSize: 14,
    color: '#16a34a',
  },
  selectedFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  selectedFilterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterCategories: {
    gap: 12,
  },
  filterCategory: {
    gap: 8,
  },
  filterCategoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  resultsSection: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  resultsList: {
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
  recipeImage: {
    width: 112,
    height: 112,
    borderRadius: 8,
  },
  recipeInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  recipeHeader: {
    gap: 8,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  recipeBadge: {
    alignSelf: 'flex-start',
  },
  recipeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recipeStat: {
    fontSize: 14,
    color: '#6b7280',
  },
});
