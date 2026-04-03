import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';

interface TrendViewScreenProps {
  navigation: any;
}

export function TrendViewScreen({ navigation }: TrendViewScreenProps) {
  const [selectedTab, setSelectedTab] = useState('daily');

  const healthMetrics = [
    { label: 'Calories Saved', value: '45,000 kcal', change: '+12%' },
    { label: 'Heart Health Score', value: '8.5/10', change: '+1.2' },
    { label: 'Weight Impact', value: '-2.5 kg', change: 'potential' },
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
              <Text style={styles.headerTitle}>Usage Trends</Text>
              <Text style={styles.headerSubtitle}>Your oil consumption analysis</Text>
            </View>
            <TouchableOpacity style={styles.downloadButton}>
              <Ionicons name="download-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>This Month</Text>
                <Text style={styles.statValue}>6.5 KG</Text>
                <Badge variant="success" style={styles.statBadge}>
                  <Text style={{color: '#16a34a', fontSize: 12}}>-35%</Text>
                </Badge>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>This Week</Text>
                <Text style={styles.statValue}>1.5 KG</Text>
                <Badge variant="default" style={styles.statBadge}>
                  <Text style={{color: '#fff', fontSize: 12}}>On Track</Text>
                </Badge>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Saved</Text>
                <Text style={styles.statValue}>₹1,200</Text>
                <Badge variant="warning" style={styles.statBadge}>
                  <Text style={{color: '#854d0e', fontSize: 12}}>+12%</Text>
                </Badge>
              </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.content}>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Chart Placeholder */}
          <Card>
            <Text style={styles.chartTitle}>
              {selectedTab === 'daily' && 'Last 30 Days'}
              {selectedTab === 'weekly' && 'Weekly Progress'}
              {selectedTab === 'monthly' && 'Monthly Trends'}
            </Text>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="analytics" size={48} color="#d1d5db" />
              <Text style={styles.chartPlaceholderText}>
                {selectedTab === 'daily' && 'Daily usage chart'}
                {selectedTab === 'weekly' && 'Weekly progress chart'}
                {selectedTab === 'monthly' && 'Monthly trends chart'}
              </Text>
            </View>
          </Card>

          {/* Health Impact */}
          <Card style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Ionicons name="fitness" size={20} color="#3b82f6" />
              <Text style={styles.healthTitle}>Health Impact Metrics</Text>
            </View>
            <View style={styles.healthMetrics}>
              {healthMetrics.map((metric, index) => (
                <View key={index} style={styles.healthMetric}>
                  <View style={styles.healthMetricInfo}>
                    <Text style={styles.healthMetricLabel}>{metric.label}</Text>
                    <Text style={styles.healthMetricValue}>{metric.value}</Text>
                  </View>
                  <Badge 
                    variant={metric.change.includes('-') || metric.change.includes('+') ? 'success' : 'default'}
                  >
                    <Text style={{color: metric.change.includes('-') || metric.change.includes('+') ? '#16a34a' : '#fff', fontSize: 12}}>{metric.change}</Text>
                  </Badge>
                </View>
              ))}
            </View>
          </Card>

          {/* Export Button */}
          <Button onPress={() => {}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Ionicons name="download-outline" size={20} color="#fff" />
              <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>Export Report</Text>
            </View>
          </Button>
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
  downloadButton: {
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
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#dcfce7',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  healthCard: {
    backgroundColor: '#eff6ff',
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  healthMetrics: {
    gap: 12,
  },
  healthMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  healthMetricInfo: {
    flex: 1,
  },
  healthMetricLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  healthMetricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
