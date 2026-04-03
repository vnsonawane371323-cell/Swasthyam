import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';

interface PartnerSearchScreenProps {
  navigation: any;
}

export function PartnerSearchScreen({ navigation }: PartnerSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const partners = [
    { id: 1, name: 'Fortune Foods', category: 'Premium Oil Brand', distance: 2.4, rating: 4.8, verified: true },
    { id: 2, name: 'Dhara Oil', category: 'Certified Supplier', distance: 3.1, rating: 4.6, verified: true },
    { id: 3, name: 'Saffola', category: 'Health Oil Brand', distance: 5.2, rating: 4.7, verified: true },
    { id: 4, name: 'Sundrop', category: 'Premium Oil Brand', distance: 7.8, rating: 4.5, verified: true },
  ];

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
                <Ionicons name="storefront" size={24} color="#fff" />
                <Text style={styles.headerTitle}>Find Partners</Text>
              </View>
              <Text style={styles.headerSubtitle}>Certified oil brands near you</Text>
            </View>
          </View>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search partners..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.filterRow}>
            <View style={styles.filterBadge}>
              <Ionicons name="location" size={14} color="#3b82f6" />
              <Text style={styles.filterText}>Near Me</Text>
            </View>
            <View style={styles.filterBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10b981" />
              <Text style={styles.filterText}>Verified</Text>
            </View>
            <View style={styles.filterBadge}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.filterText}>Top Rated</Text>
            </View>
          </View>
          <Text style={styles.resultCount}>{partners.length} partners found</Text>
          {partners.map(partner => (
            <Card key={partner.id}>
              <TouchableOpacity onPress={() => navigation.navigate('PartnerDetail')} style={styles.partnerCard}>
                <View style={styles.partnerHeader}>
                  <View style={styles.logoPlaceholder}>
                    <Ionicons name="storefront" size={24} color="#3b82f6" />
                  </View>
                  <View style={styles.partnerInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.partnerName}>{partner.name}</Text>
                      {partner.verified && <Ionicons name="checkmark-circle" size={16} color="#10b981" />}
                    </View>
                    <Text style={styles.partnerCategory}>{partner.category}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="location" size={12} color="#6b7280" />
                        <Text style={styles.metaText}>{partner.distance} km</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="star" size={12} color="#f59e0b" />
                        <Text style={styles.metaText}>{partner.rating}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#059669', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, gap: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#d1fae5', marginTop: 2 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, gap: 8, height: 48 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827' },
  content: { padding: 16, gap: 12 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  filterBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 16 },
  filterText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  resultCount: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  partnerCard: {},
  partnerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoPlaceholder: { width: 56, height: 56, backgroundColor: '#dbeafe', borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  partnerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  partnerName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  partnerCategory: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6b7280' },
});
