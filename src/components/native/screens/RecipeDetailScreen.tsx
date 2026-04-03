import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';

interface RecipeDetailScreenProps {
  navigation: any;
  route?: any;
}

export function RecipeDetailScreen({ navigation, route }: RecipeDetailScreenProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');

  const recipe = route?.params?.recipe || {
    id: 1,
    title: 'Air-Fried Samosa',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
    oilReduction: 83,
    prepTime: '30 min',
    cookTime: '20 min',
    servings: 4,
    calories: 180,
    rating: 4.5,
    reviews: 124,
  };

  const ingredients = [
    { item: 'Potatoes (boiled & mashed)', amount: '3 medium', lowOilAlt: null },
    { item: 'Green peas', amount: '1/2 cup', lowOilAlt: null },
    { item: 'Samosa sheets', amount: '12 pieces', lowOilAlt: 'Use phyllo dough for extra crunch' },
    { item: 'Cooking spray', amount: '2 tsp', lowOilAlt: 'Instead of 1/2 cup oil for deep frying' },
    { item: 'Cumin seeds', amount: '1 tsp', lowOilAlt: null },
    { item: 'Garam masala', amount: '1 tsp', lowOilAlt: null },
    { item: 'Salt', amount: 'to taste', lowOilAlt: null },
  ];

  const steps = [
    'Boil and mash potatoes. Mix with green peas, cumin, and garam masala.',
    'Season the filling with salt and spices to taste.',
    'Take samosa sheets and fill them with the potato mixture.',
    'Fold into triangular shapes and seal edges with water.',
    'Lightly spray samosas with cooking spray on all sides.',
    'Place in air fryer at 180°C for 15-20 minutes, flipping halfway.',
    'Serve hot with mint chutney. Enjoy your healthy samosas!',
  ];

  const aiTips = [
    'Using an air fryer reduces oil by 83% compared to deep frying',
    'You can make the filling spicier by adding green chilies',
    'For extra crispy texture, brush with a tiny bit of ghee before air frying',
    'Freeze uncooked samosas for up to 2 months - perfect meal prep!',
  ];

  const nutritionInfo = [
    { label: 'Calories', value: '180 kcal', change: '-65%' },
    { label: 'Total Fat', value: '3g', change: '-83%' },
    { label: 'Protein', value: '4g', change: 'Same' },
    { label: 'Carbohydrates', value: '32g', change: 'Same' },
  ];

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert('Success', isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleAddToMealPlan = () => {
    Alert.alert('Success', 'Added to your meal planner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Header */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.image }} style={styles.image} />
          <View style={styles.imageOverlay} />
          
          {/* Top Actions */}
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#000" />
            </TouchableOpacity>
            <View style={styles.rightActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleToggleFavorite}>
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={20} 
                  color={isFavorite ? "#dc2626" : "#000"} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Title & Badge */}
          <View style={styles.titleContainer}>
            <Badge variant="success" style={styles.oilBadge}>
              <Text style={styles.badgeText}>{recipe.oilReduction}% Less Oil</Text>
            </Badge>
            <Text style={styles.title}>{recipe.title}</Text>
          </View>
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#5B5B5B" />
            <Text style={styles.infoLabel}>Prep</Text>
            <Text style={styles.infoValue}>{recipe.prepTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="flame-outline" size={20} color="#f97316" />
            <Text style={styles.infoLabel}>Cook</Text>
            <Text style={styles.infoValue}>{recipe.cookTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={20} color="#3b82f6" />
            <Text style={styles.infoLabel}>Serves</Text>
            <Text style={styles.infoValue}>{recipe.servings}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={styles.infoLabel}>Rating</Text>
            <Text style={styles.infoValue}>{recipe.rating}</Text>
          </View>
        </View>

        {/* AI Tip */}
        <View style={styles.aiTip}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={20} color="#fff" />
          </View>
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>SwasthTel AI Says:</Text>
            <Text style={styles.aiText}>
              Using an air fryer instead of deep frying reduces oil consumption by {recipe.oilReduction}% while maintaining delicious taste and texture!
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>

            {/* Ingredients Tab */}
            <TabsContent value="ingredients">
              <Card style={styles.tabCard}>
                <Text style={styles.cardTitle}>Ingredients</Text>
                {ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.ingredientRow}>
                      <Text style={styles.ingredientName}>{ingredient.item}</Text>
                      <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
                    </View>
                    {ingredient.lowOilAlt && (
                      <View style={styles.lowOilTip}>
                        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                        <Text style={styles.lowOilText}>{ingredient.lowOilAlt}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </Card>
            </TabsContent>

            {/* Steps Tab */}
            <TabsContent value="steps">
              <Card style={styles.tabCard}>
                <Text style={styles.cardTitle}>Instructions</Text>
                {steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </Card>
              
              <Card style={[styles.tabCard, styles.tipsCard]}>
                <View style={styles.tipsHeader}>
                  <Ionicons name="restaurant-outline" size={20} color="#f97316" />
                  <Text style={styles.cardTitle}>Pro Tips from AI</Text>
                </View>
                {aiTips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons name="sparkles" size={16} color="#a855f7" />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </Card>
            </TabsContent>

            {/* Nutrition Tab */}
            <TabsContent value="nutrition">
              <Card style={styles.tabCard}>
                <Text style={styles.cardTitle}>Nutritional Information (per serving)</Text>
                {nutritionInfo.map((info, index) => (
                  <View key={index} style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>{info.label}</Text>
                    <View style={styles.nutritionRight}>
                      <Text style={styles.nutritionValue}>{info.value}</Text>
                      <Badge variant={info.change.includes('-') ? 'success' : 'default'}>
                        <Text style={styles.nutritionChange}>{info.change}</Text>
                      </Badge>
                    </View>
                  </View>
                ))}
              </Card>
            </TabsContent>
          </Tabs>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button onPress={handleAddToMealPlan} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add to Meal Plan</Text>
          </Button>
          <Button 
            variant="outline" 
            onPress={() => navigation.navigate('MealPlanner')}
            style={styles.viewButton}
          >
            <Text style={styles.viewButtonText}>View Meal Planner</Text>
          </Button>
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
  imageContainer: {
    height: 256,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topActions: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  oilBadge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  quickInfo: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E7F2F1',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  infoValue: {
    fontSize: 14,
    color: '#040707',
    fontWeight: '600',
  },
  aiTip: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    backgroundColor: '#faf5ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#581c87',
    marginBottom: 4,
  },
  aiText: {
    fontSize: 13,
    color: '#7c3aed',
    lineHeight: 18,
  },
  tabsContainer: {
    paddingHorizontal: 16,
  },
  tabCard: {
    marginTop: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 16,
  },
  ingredientItem: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7F2F1',
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: 14,
    color: '#040707',
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  lowOilTip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    padding: 8,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
  },
  lowOilText: {
    fontSize: 12,
    color: '#16a34a',
    flex: 1,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    paddingTop: 6,
  },
  tipsCard: {
    marginTop: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#374151',
  },
  nutritionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nutritionValue: {
    fontSize: 14,
    color: '#040707',
    fontWeight: '600',
  },
  nutritionChange: {
    fontSize: 12,
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  addButton: {
    backgroundColor: '#16a34a',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewButton: {
    borderWidth: 1,
    borderColor: '#E7F2F1',
  },
  viewButtonText: {
    color: '#040707',
    fontSize: 16,
    fontWeight: '600',
  },
});
