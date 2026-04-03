import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

interface PartnerDetailScreenProps {
  navigation: any;
}

export function PartnerDetailScreen({ navigation }: PartnerDetailScreenProps) {
  const partner = {
    name: 'Fortune Foods',
    category: 'Premium Oil Brand',
    verified: true,
    rating: 4.8,
    logo: 'https://via.placeholder.com/120',
    products: ['Sunflower Oil', 'Mustard Oil', 'Rice Bran Oil'],
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image source={{ uri: partner.logo }} style={styles.logo} />
            {partner.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
            )}
          </View>
          <Text style={styles.partnerName}>{partner.name}</Text>
          <Text style={styles.category}>{partner.category}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>{partner.rating} Rating</Text>
          </View>
        </View>
        <View style={styles.content}>
          <Card>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              <Text style={styles.sectionTitle}>Blockchain Verified</Text>
            </View>
            <Text style={styles.verifiedText}>This partner is certified by SwasthTel with blockchain-verified quality standards.</Text>
            <Button onPress={() => navigation.navigate('BlockchainVerification')} variant="outline" style={styles.certButton}>View Certificate</Button>
          </Card>
          <Card>
            <View style={styles.sectionHeader}>
              <Ionicons name="cube" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Products</Text>
            </View>
            {partner.products.map((product, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productIcon}>
                  <Ionicons name="water" size={20} color="#3b82f6" />
                </View>
                <Text style={styles.productName}>{product}</Text>
              </View>
            ))}
          </Card>
          <Card>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color="#6b7280" />
              <Text style={styles.sectionTitle}>Contact</Text>
            </View>
            {[
              { icon: 'globe', label: 'Website', value: 'www.fortunefoods.in' },
              { icon: 'mail', label: 'Email', value: 'contact@fortune.in' },
              { icon: 'call', label: 'Phone', value: '+91 1800-FORTUNE' },
            ].map((item, index) => (
              <View key={index} style={styles.contactItem}>
                <Ionicons name={item.icon as any} size={18} color="#6b7280" />
                <Text style={styles.contactLabel}>{item.label}: </Text>
                <Text style={styles.contactValue}>{item.value}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, alignItems: 'center', position: 'relative' },
  backButton: { position: 'absolute', top: 12, left: 16, width: 40, height: 40, backgroundColor: '#f3f4f6', borderRadius: 20, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  logoContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginTop: 48, position: 'relative' },
  logo: { width: 100, height: 100, borderRadius: 50 },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 12, padding: 2 },
  partnerName: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 16 },
  category: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ratingText: { fontSize: 14, color: '#111827', fontWeight: '500' },
  content: { padding: 16, gap: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  verifiedText: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  certButton: { borderColor: '#10b981' },
  productItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  productIcon: { width: 36, height: 36, backgroundColor: '#dbeafe', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  productName: { fontSize: 14, color: '#111827', fontWeight: '500' },
  contactItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  contactLabel: { fontSize: 14, color: '#6b7280', marginLeft: 8 },
  contactValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
});
