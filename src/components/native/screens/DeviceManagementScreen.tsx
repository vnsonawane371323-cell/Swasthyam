import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

interface DeviceManagementScreenProps {
  navigation: any;
}

export function DeviceManagementScreen({ navigation }: DeviceManagementScreenProps) {
  const devices = [
    {
      id: 1,
      name: 'Kitchen Tracker 1',
      type: 'Smart Oil Dispenser',
      status: 'online',
      battery: 85,
      lastSync: '2 min ago',
      totalTracked: '2.3 KG',
    },
    {
      id: 2,
      name: 'Smart Pan Sensor',
      type: 'IoT Pan Monitor',
      status: 'online',
      battery: 60,
      lastSync: '5 min ago',
      totalTracked: '1.8 KG',
    },
    {
      id: 3,
      name: 'Dining Table Tracker',
      type: 'Smart Oil Bottle Cap',
      status: 'offline',
      battery: 15,
      lastSync: '2 days ago',
      totalTracked: '0.5 KG',
    },
  ];

  const onlineCount = devices.filter(d => d.status === 'online').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>My IoT Devices</Text>
                <Text style={styles.headerSubtitle}>{onlineCount} of {devices.length} online</Text>
              </View>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* USP Badge */}
        <View style={styles.content}>
          <Card style={styles.uspCard}>
            <View style={styles.uspContent}>
              <View style={styles.uspIcon}>
                <Ionicons name="water" size={20} color="#fff" />
              </View>
              <View style={styles.uspText}>
                <Text style={styles.uspTitle}>IoT-Powered Tracking</Text>
                <Text style={styles.uspDescription}>Automatic, verified oil tracking with blockchain security</Text>
              </View>
            </View>
          </Card>

          {/* Devices List */}
          <View style={styles.devicesList}>
            {devices.map((device, index) => (
              <TouchableOpacity 
                key={device.id}
                onPress={() => navigation.navigate('DeviceDetail', { device })}
                activeOpacity={0.7}
              >
                <Card style={[styles.deviceCard, device.status === 'offline' ? styles.deviceOffline : undefined]}>
                  <View style={styles.deviceContent}>
                    <View style={[
                      styles.deviceIcon,
                      { backgroundColor: device.status === 'online' ? '#dcfce7' : '#f3f4f6' }
                    ]}>
                      <Ionicons 
                        name="water" 
                        size={28} 
                        color={device.status === 'online' ? '#16a34a' : '#9ca3af'} 
                      />
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: device.status === 'online' ? '#22c55e' : '#9ca3af' }
                      ]}>
                        <Ionicons 
                          name={device.status === 'online' ? 'checkmark' : 'wifi-outline'} 
                          size={12} 
                          color="#fff" 
                        />
                      </View>
                    </View>
                    <View style={styles.deviceInfo}>
                      <View style={styles.deviceHeader}>
                        <View style={styles.deviceTitleContainer}>
                          <Text style={styles.deviceName}>{device.name}</Text>
                          <Text style={styles.deviceType}>{device.type}</Text>
                        </View>
                        <Badge 
                          variant={device.status === 'online' ? 'success' : 'secondary'}
                        >
                          <Text style={{color: device.status === 'online' ? '#16a34a' : '#64748b', fontSize: 12, textTransform: 'capitalize'}}>{device.status}</Text>
                        </Badge>
                      </View>
                      <View style={styles.deviceStats}>
                        <View style={styles.deviceStat}>
                          <Ionicons 
                            name={device.battery > 50 ? 'battery-full' : 'battery-half'} 
                            size={16} 
                            color={device.battery > 50 ? '#16a34a' : '#f97316'} 
                          />
                          <Text style={styles.statText}>{device.battery}%</Text>
                        </View>
                        <Text style={styles.lastSync}>Last sync: {device.lastSync}</Text>
                      </View>
                      <View style={styles.deviceFooter}>
                        <Text style={styles.footerLabel}>Total tracked</Text>
                        <Text style={styles.footerValue}>{device.totalTracked}</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add New Device Button */}
          <View style={styles.addDeviceContainer}>
            <Button onPress={() => {}}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>Add New Device</Text>
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
  },
  headerContent: {
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
  addButton: {
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
  content: {
    padding: 16,
    gap: 16,
  },
  uspCard: {
    backgroundColor: '#faf5ff',
    borderColor: '#d8b4fe',
    borderWidth: 1,
  },
  uspContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  uspIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#a855f7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uspText: {
    flex: 1,
  },
  uspTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#581c87',
    marginBottom: 4,
  },
  uspDescription: {
    fontSize: 14,
    color: '#7c3aed',
    lineHeight: 20,
  },
  devicesList: {
    gap: 12,
  },
  deviceCard: {
    marginBottom: 0,
  },
  deviceOffline: {
    opacity: 0.7,
  },
  deviceContent: {
    flexDirection: 'row',
    gap: 12,
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    flex: 1,
    gap: 8,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  deviceTitleContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  deviceType: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  deviceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deviceStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#4b5563',
  },
  lastSync: {
    fontSize: 12,
    color: '#6b7280',
  },
  deviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  addDeviceContainer: {
    marginTop: 8,
  },
});
