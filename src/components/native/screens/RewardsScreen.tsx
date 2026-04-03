import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from '../Card';
import { Badge } from '../Badge';

interface RewardsScreenProps {
  navigation: any;
  language: string;
}

// Rewards data
const governmentRewards = [
  {
    id: 1,
    title: 'Electricity Bill Concession',
    description: 'Get up to 40% discount on your monthly electricity bill',
    discount: '40%',
    pointsRequired: 5000,
    category: 'utility',
    icon: 'flash',
    color: '#fcaf56',
    status: 'available',
    details: 'Valid for households consuming less than 200 units/month. Discount applies after achieving CPS score above 800.'
  },
  {
    id: 2,
    title: 'Water Tax Rebate',
    description: 'Save up to 25% on water tax and maintenance charges',
    discount: '25%',
    pointsRequired: 3000,
    category: 'utility',
    icon: 'water',
    color: '#3b82f6',
    status: 'available',
    details: 'Annual water tax rebate for families maintaining healthy oil consumption patterns for 6+ months.'
  },
  {
    id: 3,
    title: 'Property Tax Concession',
    description: 'Eligible for 15% reduction in annual property tax',
    discount: '15%',
    pointsRequired: 8000,
    category: 'utility',
    icon: 'home',
    color: '#10b981',
    status: 'locked',
    details: 'Available for SwasthTel Gold members with CPS score above 900. Valid for one residential property.'
  },
  {
    id: 4,
    title: 'LPG Subsidy Boost',
    description: 'Additional ₹50 subsidy per LPG cylinder',
    discount: '₹50',
    pointsRequired: 4000,
    category: 'utility',
    icon: 'flame',
    color: '#ef4444',
    status: 'available',
    details: 'Extra subsidy on top of regular government subsidy. Limited to 12 cylinders per year.'
  },
  {
    id: 5,
    title: 'Health Insurance Premium Discount',
    description: 'Get 20% off on government health insurance schemes',
    discount: '20%',
    pointsRequired: 6000,
    category: 'health',
    icon: 'medkit',
    color: '#ec4899',
    status: 'available',
    details: 'Discount on Ayushman Bharat and state health insurance premiums. Valid for entire family.'
  },
  {
    id: 6,
    title: 'Public Transport Pass Discount',
    description: 'Save 30% on metro/bus monthly passes',
    discount: '30%',
    pointsRequired: 2500,
    category: 'transport',
    icon: 'bus',
    color: '#8b5cf6',
    status: 'available',
    details: 'Applicable on metro, DTC buses, and other government transport services. One pass per family member.'
  },
];

const partnerRewards = [
  {
    id: 1,
    name: 'Amazon Voucher ₹500',
    points: 5000,
    icon: 'gift',
    color: '#fcaf56',
    available: true,
    description: 'Shop from millions of products on Amazon'
  },
  {
    id: 2,
    name: 'SwasthTel Premium Oil Kit',
    points: 3000,
    icon: 'nutrition',
    color: '#10b981',
    available: true,
    description: 'Curated selection of healthy cooking oils'
  },
  {
    id: 3,
    name: 'Health Check-up Package',
    points: 8000,
    icon: 'fitness',
    color: '#ef4444',
    available: false,
    description: 'Comprehensive health screening at partner clinics'
  },
  {
    id: 4,
    name: 'Recipe Book Bundle',
    points: 2000,
    icon: 'book',
    color: '#3b82f6',
    available: true,
    description: 'Healthy Indian cooking recipe collection'
  },
  {
    id: 5,
    name: 'Fitness Tracker',
    points: 7000,
    icon: 'watch',
    color: '#ec4899',
    available: true,
    description: 'Smart fitness band to track your health goals'
  },
  {
    id: 6,
    name: 'Grocery Voucher ₹1000',
    points: 6000,
    icon: 'cart',
    color: '#8b5cf6',
    available: true,
    description: 'Valid at BigBasket, Blinkit, and other partners'
  },
];

export function RewardsScreen({ navigation, language }: RewardsScreenProps) {
  const [activeTab, setActiveTab] = useState<'government' | 'partner'>('government');
  const [totalPoints, setTotalPoints] = useState(3450);
  const [cpsScore, setCpsScore] = useState(847);

  const handleRedeemGovernment = (reward: any) => {
    if (cpsScore < 800) {
      Alert.alert(
        'CPS Score Required',
        `You need a CPS score of 800 or higher to unlock government benefits. Your current score: ${cpsScore}`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (reward.status === 'locked') {
      Alert.alert(
        'Reward Locked',
        `This reward requires ${reward.pointsRequired} points and CPS score above 900. Keep improving!`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Apply for Benefit',
      `Apply for ${reward.title}? This will be reviewed by authorities and applied to your next bill cycle.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            Alert.alert('Success', 'Your application has been submitted. You will receive confirmation within 7 days.');
          },
        },
      ]
    );
  };

  const handleRedeemPartner = (reward: any) => {
    if (!reward.available) {
      Alert.alert('Not Available', 'This reward is currently out of stock. Check back later!');
      return;
    }

    if (totalPoints < reward.points) {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.points} points but have only ${totalPoints} points. Keep tracking to earn more!`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Redeem ${reward.name} for ${reward.points} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            setTotalPoints(totalPoints - reward.points);
            Alert.alert('Success', 'Reward redeemed successfully! Check your registered email for details.');
          },
        },
      ]
    );
  };

  const text = {
    en: {
      title: 'Rewards & Benefits',
      subtitle: 'Redeem your points',
      governmentTab: 'Government Benefits',
      partnerTab: 'Partner Rewards',
      yourPoints: 'Your Points',
      cpsScore: 'CPS Score',
      pointsAvailable: 'points available',
      redeem: 'Redeem',
      apply: 'Apply',
      locked: 'Locked',
      requirements: 'Requirements',
      details: 'Details',
      earnMore: 'How to Earn More Points',
      tips: [
        'Stay under daily oil target consistently',
        'Complete weekly challenges',
        'Upload health reports regularly',
        'Achieve family consumption goals',
        'Participate in community events'
      ]
    },
  };

  const t = text[language as keyof typeof text] || text.en;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1b4a5a', '#0f3a47']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="gift" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.subtitle}>{t.subtitle}</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Points Display */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsRow}>
            <View style={styles.pointItem}>
              <Ionicons name="star" size={20} color="#fcaf56" />
              <View style={styles.pointItemText}>
                <Text style={styles.pointValue}>{totalPoints}</Text>
                <Text style={styles.pointLabel}>{t.yourPoints}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.pointItem}>
              <Ionicons name="trending-up" size={20} color="#10b981" />
              <View style={styles.pointItemText}>
                <Text style={styles.pointValue}>{cpsScore}</Text>
                <Text style={styles.pointLabel}>{t.cpsScore}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'government' && styles.tabActive]}
          onPress={() => setActiveTab('government')}
        >
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={activeTab === 'government' ? '#1b4a5a' : '#9ca3af'}
          />
          <Text style={[styles.tabText, activeTab === 'government' && styles.tabTextActive]}>
            {t.governmentTab}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'partner' && styles.tabActive]}
          onPress={() => setActiveTab('partner')}
        >
          <Ionicons
            name="gift-outline"
            size={20}
            color={activeTab === 'partner' ? '#1b4a5a' : '#9ca3af'}
          />
          <Text style={[styles.tabText, activeTab === 'partner' && styles.tabTextActive]}>
            {t.partnerTab}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Government Benefits Tab */}
        {activeTab === 'government' && (
          <View style={styles.section}>
            {cpsScore < 800 && (
              <Card style={styles.warningCard}>
                <CardContent style={styles.warningContent}>
                  <Ionicons name="information-circle" size={24} color="#fcaf56" />
                  <View style={styles.warningText}>
                    <Text style={styles.warningTitle}>CPS Score Needed</Text>
                    <Text style={styles.warningSubtitle}>
                      Achieve a CPS score of 800+ to unlock government benefits
                    </Text>
                  </View>
                </CardContent>
              </Card>
            )}

            {governmentRewards.map((reward) => (
              <Card key={reward.id} style={styles.rewardCard}>
                <CardContent style={styles.rewardContent}>
                  <View style={styles.rewardHeader}>
                    <View style={[styles.rewardIcon, { backgroundColor: `${reward.color}20` }]}>
                      <Ionicons name={reward.icon as any} size={28} color={reward.color} />
                    </View>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{reward.discount}</Text>
                      <Text style={styles.discountLabel}>OFF</Text>
                    </View>
                  </View>

                  <View style={styles.rewardBody}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>

                    <View style={styles.rewardMeta}>
                      <View style={styles.badgeWrapper}>
                        <Badge variant="outline">
                          <Text style={styles.badgeText}>
                            {reward.pointsRequired} pts required
                          </Text>
                        </Badge>
                      </View>
                      {reward.status === 'locked' && (
                        <View style={styles.badgeWrapper}>
                          <Badge variant="outline">
                            <Ionicons name="lock-closed" size={12} color="#9ca3af" />
                            <Text style={[styles.badgeText, { marginLeft: 4 }]}>Locked</Text>
                          </Badge>
                        </View>
                      )}
                    </View>

                    <View style={styles.detailsBox}>
                      <Text style={styles.detailsLabel}>{t.details}:</Text>
                      <Text style={styles.detailsText}>{reward.details}</Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.applyButton,
                        reward.status === 'locked' && styles.applyButtonDisabled,
                      ]}
                      onPress={() => handleRedeemGovernment(reward)}
                      disabled={reward.status === 'locked'}
                    >
                      <Text style={styles.applyButtonText}>
                        {reward.status === 'locked' ? t.locked : t.apply}
                      </Text>
                      <Ionicons
                        name={reward.status === 'locked' ? 'lock-closed' : 'checkmark-circle'}
                        size={20}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {/* Partner Rewards Tab */}
        {activeTab === 'partner' && (
          <View style={styles.section}>
            <View style={styles.pointsAvailableCard}>
              <Ionicons name="star" size={24} color="#fcaf56" />
              <Text style={styles.pointsAvailableText}>
                {totalPoints} {t.pointsAvailable}
              </Text>
            </View>

            {partnerRewards.map((reward) => (
              <Card
                key={reward.id}
                style={[styles.partnerCard, !reward.available && styles.partnerCardDisabled]}
              >
                <CardContent style={styles.partnerContent}>
                  <View style={[styles.partnerIcon, { backgroundColor: `${reward.color}20` }]}>
                    <Ionicons name={reward.icon as any} size={32} color={reward.color} />
                  </View>
                  <View style={styles.partnerBody}>
                    <Text style={styles.partnerName}>{reward.name}</Text>
                    <Text style={styles.partnerDescription}>{reward.description}</Text>
                    <View style={styles.partnerFooter}>
                      <View style={styles.badgeWrapper}>
                        <Badge variant="outline">
                          <Text style={styles.badgeText}>{reward.points} points</Text>
                        </Badge>
                      </View>
                      {!reward.available && (
                        <View style={styles.badgeWrapper}>
                          <Badge variant="outline">
                            <Text style={styles.badgeText}>Out of Stock</Text>
                          </Badge>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.redeemButton,
                      (!reward.available || totalPoints < reward.points) &&
                        styles.redeemButtonDisabled,
                    ]}
                    onPress={() => handleRedeemPartner(reward)}
                    disabled={!reward.available || totalPoints < reward.points}
                  >
                    <Text style={styles.redeemButtonText}>{t.redeem}</Text>
                  </TouchableOpacity>
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {/* How to Earn More */}
        <Card style={styles.tipsCard}>
          <CardContent style={styles.tipsContent}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={24} color="#fcaf56" />
              <Text style={styles.tipsTitle}>{t.earnMore}</Text>
            </View>
            <View style={styles.tipsList}>
              {t.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginLeft: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  pointsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointItemText: {
    gap: 2,
  },
  pointValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  pointLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  tabActive: {
    backgroundColor: '#E7F2F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#1b4a5a',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    gap: 16,
  },
  warningCard: {
    backgroundColor: '#ffeedd',
    borderColor: '#fcaf56',
    marginBottom: 8,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  warningSubtitle: {
    fontSize: 12,
    color: '#5B5B5B',
    marginTop: 2,
  },
  rewardCard: {
    borderColor: '#1b4a5a20',
    marginBottom: 16,
  },
  rewardContent: {
    padding: 16,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rewardIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  discountText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  discountLabel: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  rewardBody: {
    gap: 12,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b4a5a',
  },
  rewardDescription: {
    fontSize: 14,
    color: '#5B5B5B',
    lineHeight: 20,
  },
  rewardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeWrapper: {
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
  },
  detailsBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#fcaf56',
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1b4a5a',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    color: '#5B5B5B',
    lineHeight: 18,
  },
  applyButton: {
    backgroundColor: '#1b4a5a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  applyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  pointsAvailableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffeedd',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  pointsAvailableText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  partnerCard: {
    borderColor: '#1b4a5a20',
    marginBottom: 16,
  },
  partnerCardDisabled: {
    opacity: 0.6,
  },
  partnerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  partnerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerBody: {
    flex: 1,
    gap: 6,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b4a5a',
  },
  partnerDescription: {
    fontSize: 12,
    color: '#5B5B5B',
    lineHeight: 16,
  },
  partnerFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  redeemButton: {
    backgroundColor: '#fcaf56',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  redeemButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  tipsCard: {
    margin: 16,
    borderColor: '#1b4a5a20',
    backgroundColor: '#E7F2F1',
  },
  tipsContent: {
    padding: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b4a5a',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#5B5B5B',
    lineHeight: 20,
  },
});
