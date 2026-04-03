/**
 * ProductComparisonScreen
 * 
 * Compare different oil products side by side.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ProductComparisonScreenProps {
  navigation: any;
}

const COLORS = {
  primary: '#1b4a5a',
  secondary: '#fcaf56',
  background: '#fafbfa',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e5e5e5',
  success: '#4CAF50',
  warning: '#FF9800',
};

// Sample products to compare
const sampleProducts = [
  {
    id: 1,
    name: 'Cold Pressed Mustard Oil',
    brand: 'Fortune',
    price: '₹220/L',
    rating: 4.5,
    healthScore: 85,
    features: {
      omega3: 'High',
      saturatedFat: 'Low',
      transFat: 'None',
      antioxidants: 'High',
      smokePoint: '250°C',
    },
    pros: ['Rich in Omega-3', 'Natural extraction', 'Heart healthy'],
    cons: ['Strong flavor', 'Higher price'],
  },
  {
    id: 2,
    name: 'Refined Sunflower Oil',
    brand: 'Saffola',
    price: '₹180/L',
    rating: 4.2,
    healthScore: 72,
    features: {
      omega3: 'Medium',
      saturatedFat: 'Low',
      transFat: 'None',
      antioxidants: 'Medium',
      smokePoint: '230°C',
    },
    pros: ['Neutral taste', 'Good for frying', 'Affordable'],
    cons: ['Refined process', 'Lower nutrients'],
  },
  {
    id: 3,
    name: 'Extra Virgin Olive Oil',
    brand: 'Figaro',
    price: '₹450/L',
    rating: 4.8,
    healthScore: 92,
    features: {
      omega3: 'High',
      saturatedFat: 'Very Low',
      transFat: 'None',
      antioxidants: 'Very High',
      smokePoint: '190°C',
    },
    pros: ['Highest antioxidants', 'Best for heart', 'Premium quality'],
    cons: ['Not for high heat', 'Expensive'],
  },
];

export function ProductComparisonScreen({ navigation }: ProductComparisonScreenProps) {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([0, 1]);

  const renderComparisonRow = (label: string, getValue: (product: typeof sampleProducts[0]) => string) => {
    return (
      <View style={styles.comparisonRow}>
        <View style={styles.labelCell}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
        {selectedProducts.map((index) => (
          <View key={index} style={styles.valueCell}>
            <Text style={styles.valueText}>{getValue(sampleProducts[index])}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderHealthScore = (score: number) => {
    const color = score >= 80 ? COLORS.success : score >= 60 ? COLORS.warning : '#F44336';
    return (
      <View style={[styles.healthScoreBadge, { backgroundColor: color }]}>
        <Text style={styles.healthScoreText}>{score}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Products</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Headers */}
        <View style={styles.productHeaders}>
          <View style={styles.emptyCell} />
          {selectedProducts.map((index) => (
            <View key={index} style={styles.productHeader}>
              <View style={styles.productImagePlaceholder}>
                <Ionicons name="water" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.productName} numberOfLines={2}>
                {sampleProducts[index].name}
              </Text>
              <Text style={styles.productBrand}>{sampleProducts[index].brand}</Text>
              <Text style={styles.productPrice}>{sampleProducts[index].price}</Text>
            </View>
          ))}
        </View>

        {/* Health Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Score</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>Overall Score</Text>
            </View>
            {selectedProducts.map((index) => (
              <View key={index} style={styles.valueCell}>
                {renderHealthScore(sampleProducts[index].healthScore)}
              </View>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Rating</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>Rating</Text>
            </View>
            {selectedProducts.map((index) => (
              <View key={index} style={styles.valueCell}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={COLORS.secondary} />
                  <Text style={styles.ratingText}>{sampleProducts[index].rating}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Nutritional Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutritional Profile</Text>
          {renderComparisonRow('Omega-3', (p) => p.features.omega3)}
          {renderComparisonRow('Saturated Fat', (p) => p.features.saturatedFat)}
          {renderComparisonRow('Trans Fat', (p) => p.features.transFat)}
          {renderComparisonRow('Antioxidants', (p) => p.features.antioxidants)}
          {renderComparisonRow('Smoke Point', (p) => p.features.smokePoint)}
        </View>

        {/* Pros & Cons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pros & Cons</Text>
          
          {/* Pros */}
          <View style={styles.prosConsRow}>
            <View style={styles.labelCell}>
              <Text style={[styles.labelText, { color: COLORS.success }]}>Pros</Text>
            </View>
            {selectedProducts.map((index) => (
              <View key={index} style={styles.prosConsCell}>
                {sampleProducts[index].pros.map((pro, i) => (
                  <View key={i} style={styles.proConItem}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                    <Text style={styles.proConText}>{pro}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Cons */}
          <View style={styles.prosConsRow}>
            <View style={styles.labelCell}>
              <Text style={[styles.labelText, { color: '#F44336' }]}>Cons</Text>
            </View>
            {selectedProducts.map((index) => (
              <View key={index} style={styles.prosConsCell}>
                {sampleProducts[index].cons.map((con, i) => (
                  <View key={i} style={styles.proConItem}>
                    <Ionicons name="close-circle" size={14} color="#F44336" />
                    <Text style={styles.proConText}>{con}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Recommendation */}
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <Ionicons name="bulb" size={24} color={COLORS.secondary} />
            <Text style={styles.recommendationTitle}>Our Recommendation</Text>
          </View>
          <Text style={styles.recommendationText}>
            Based on your health profile and cooking habits, we recommend 
            <Text style={styles.highlightText}> {sampleProducts[selectedProducts[0]].name}</Text> for 
            everyday cooking and <Text style={styles.highlightText}>{sampleProducts[selectedProducts[1]].name}</Text> for 
            specific recipes.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  productHeaders: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  emptyCell: {
    width: 80,
  },
  productHeader: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  labelCell: {
    width: 100,
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  valueCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  healthScoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthScoreText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  prosConsRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  prosConsCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  proConItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  proConText: {
    fontSize: 11,
    color: COLORS.text,
    flex: 1,
  },
  recommendationCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  recommendationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  highlightText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default ProductComparisonScreen;
