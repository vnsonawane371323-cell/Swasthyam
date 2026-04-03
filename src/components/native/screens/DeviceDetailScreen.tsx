import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

interface DeviceDetailScreenProps {
  navigation: any;
  route?: { params?: { device?: any } };
}

export function DeviceDetailScreen({ navigation, route }: DeviceDetailScreenProps) {
  const device = route?.params?.device || {
    name: 'Kitchen Tracker 1',
    type: 'Smart Oil Dispenser',
    status: 'online',
    battery: 85,
    lastSync: '2 min ago',
    totalTracked: '2.3 KG',
    id: 1,
  };

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
              <Text style={styles.headerTitle}>{device.name}</Text>
              <Text style={styles.headerSubtitle}>{device.type}</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Status Badge */}
          <Card style={styles.statusCard}>
            <View style={styles.statusContent}>
              <View style={styles.statusLeft}>
                <View style={styles.statusIcon}>
                  <Ionicons name="water" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.statusLabel}>Device Status</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, device.status === 'online' && styles.statusDotOnline]} />
                    <Text style={styles.statusText}>{device.status}</Text>
                  </View>
                </View>
              </View>
              <Badge variant="default">
                <Text style={{color: '#fff', fontSize: 12}}>{device.battery}%</Text>
              </Badge>
            </View>
          </Card>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Card style={styles.statCard}>
            <Ionicons name="battery-charging" size={24} color="#16a34a" />
            <Text style={styles.statLabel}>Battery</Text>
            <Text style={styles.statValue}>{device.battery}%</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="wifi" size={24} color="#3b82f6" />
            <Text style={styles.statLabel}>Signal</Text>
            <Text style={styles.statValue}>Strong</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color="#a855f7" />
            <Text style={styles.statLabel}>Last Sync</Text>
            <Text style={styles.statValueSmall}>{device.lastSync}</Text>
          </Card>
        </View>

        {/* Usage Graph Placeholder */}
        <View style={styles.content}>
          <Card>
            <View style={styles.graphHeader}>
              <View>
                <Text style={styles.graphTitle}>Weekly Oil Usage</Text>
                <Text style={styles.graphSubtitle}>From this device</Text>
              </View>
              <Badge variant="success">
                <Text style={{color: '#16a34a', fontSize: 12}}>-12%</Text>
              </Badge>
            </View>
            <View style={styles.graphPlaceholder}>
              <Ionicons name="bar-chart" size={48} color="#d1d5db" />
              <Text style={styles.graphPlaceholderText}>Chart visualization</Text>
            </View>
          </Card>

          {/* Device Info */}
          <Card>
            <Text style={styles.sectionTitle}>Device Information</Text>
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Serial Number</Text>
                <Text style={styles.infoValue}>ST-{device.id}-2024</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Tracked</Text>
                <Text style={styles.infoValueGreen}>{device.totalTracked}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Firmware Version</Text>
                <Text style={styles.infoValue}>v2.1.0</Text>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>Added On</Text>
                <Text style={styles.infoValue}>Jan 15, 2025</Text>
              </View>
            </View>
          </Card>

          {/* Actions */}
          <View style={styles.actions}>
            <Button onPress={() => {}} style={styles.calibrateButton}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Ionicons name="settings-outline" size={20} color="#fff" />
                <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>Calibrate Device</Text>
              </View>
            </Button>
            <Button onPress={() => {}} variant="outline">
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Ionicons name="warning-outline" size={20} color="#f97316" />
                <Text style={{color: '#1b4a5a', fontSize: 16, fontWeight: '600'}}>Troubleshoot</Text>
              </View>
            </Button>
            <Button onPress={() => {}} variant="outline" style={styles.disconnectButton}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Ionicons name="power" size={20} color="#ef4444" />
                <Text style={{color: '#1b4a5a', fontSize: 16, fontWeight: '600'}}>Disconnect Device</Text>
              </View>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 16,
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
  settingsButton: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#dcfce7',
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#dcfce7',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  statusDotOnline: {
    backgroundColor: '#86efac',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  quickStats: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  statValueSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
    textAlign: 'center',
  },
  content: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  graphSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  graphPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  graphPlaceholderText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoList: {
    gap: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  infoValueGreen: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  actions: {
    gap: 12,
  },
  calibrateButton: {
    backgroundColor: '#3b82f6',
  },
  disconnectButton: {
    borderColor: '#fecaca',
  },
});
