import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

interface BlockchainVerificationScreenProps {
  navigation: any;
}

export function BlockchainVerificationScreen({ navigation }: BlockchainVerificationScreenProps) {
  const certificate = {
    partner: 'Fortune Foods',
    certId: 'SWASTH-2024-FF-0012',
    issueDate: '2024-01-15',
    expiryDate: '2025-01-15',
    blockchainHash: '0x7a8f3c2e9b1d4a6c8e5f2b9d3c6a8e4f',
    status: 'Valid',
  };

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
                <Ionicons name="shield-checkmark" size={24} color="#fff" />
                <Text style={styles.headerTitle}>Blockchain Certificate</Text>
              </View>
              <Text style={styles.headerSubtitle}>Tamper-proof verification</Text>
            </View>
          </View>
        </View>
        <View style={styles.content}>
          <Card style={styles.qrCard}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={120} color="#9ca3af" />
            </View>
            <Text style={styles.qrText}>Scan to verify on blockchain</Text>
          </Card>
          <Card>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Certificate Status</Text>
              <Badge variant="success"><Text style={{color: '#16a34a', fontSize: 12}}>{certificate.status}</Text></Badge>
            </View>
          </Card>
          <Card>
            <View style={styles.detailHeader}>
              <Ionicons name="document-text" size={20} color="#3b82f6" />
              <Text style={styles.detailTitle}>Certificate Details</Text>
            </View>
            {[
              { label: 'Partner', value: certificate.partner },
              { label: 'Certificate ID', value: certificate.certId },
              { label: 'Issue Date', value: certificate.issueDate },
              { label: 'Expiry Date', value: certificate.expiryDate },
            ].map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            ))}
          </Card>
          <Card>
            <View style={styles.detailHeader}>
              <Ionicons name="cube" size={20} color="#8b5cf6" />
              <Text style={styles.detailTitle}>Blockchain Information</Text>
            </View>
            <View style={styles.hashRow}>
              <Text style={styles.hashLabel}>Transaction Hash</Text>
              <View style={styles.hashContainer}>
                <Text style={styles.hashValue} numberOfLines={1}>{certificate.blockchainHash}</Text>
                <TouchableOpacity>
                  <Ionicons name="copy" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            <Button onPress={() => {}} variant="outline" style={styles.explorerButton}>View on Explorer</Button>
          </Card>
          <Card style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>This certificate is permanently stored on blockchain, ensuring authenticity and preventing tampering.</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#d1fae5', marginTop: 2 },
  content: { padding: 16, gap: 16 },
  qrCard: { alignItems: 'center', paddingVertical: 24 },
  qrPlaceholder: { width: 160, height: 160, backgroundColor: '#f3f4f6', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  qrText: { fontSize: 14, color: '#6b7280' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  detailTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  detailLabel: { fontSize: 14, color: '#6b7280' },
  detailValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  hashRow: { marginBottom: 16 },
  hashLabel: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  hashContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 },
  hashValue: { flex: 1, fontSize: 12, color: '#111827', fontFamily: 'monospace' },
  explorerButton: { borderColor: '#8b5cf6' },
  infoCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: '#eff6ff' },
  infoText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },
});
