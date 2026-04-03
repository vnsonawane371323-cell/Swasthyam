import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';

interface RewardsStoreScreenProps {
  navigation: any;
}

export function RewardsStoreScreen({ navigation }: RewardsStoreScreenProps) {
  const [selectedTab, setSelectedTab] = useState('vouchers');
  const userPoints = 3450;

  const rewards = {
    vouchers: [
      { id: 1, title: '₹100 Off at SwasthMart', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', points: 500, category: 'Food & Grocery', discount: '₹100' },
      { id: 2, title: '₹200 Restaurant Voucher', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', points: 1000, category: 'Dining', discount: '₹200' },
    ],
    badges: [
      { id: 1, title: 'Oil Warrior', emoji: '🏆', points: 1000, rarity: 'Gold' },
      { id: 2, title: 'Healthy Chef', emoji: '👨‍🍳', points: 750, rarity: 'Silver' },
    ],
    physical: [
      { id: 1, title: 'Air Fryer (3L)', image: 'https://images.unsplash.com/photo-1585237672815-729a346f772b', points: 5000, category: 'Kitchen Appliance', stock: 'Limited' },
    ],
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
                <Ionicons name="gift" size={24} color="#fff" />
                <Text style={styles.headerTitle}>Rewards Store</Text>
              </View>
              <Text style={styles.headerSubtitle}>Redeem your points</Text>
            </View>
          </View>
          <Card style={styles.pointsCard}>
            <View style={styles.pointsContent}>
              <View>
                <Text style={styles.pointsLabel}>Your Points</Text>
                <View style={styles.pointsRow}>
                  <Ionicons name="star" size={24} color="#fbbf24" />
                  <Text style={styles.pointsValue}>{userPoints.toLocaleString()}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.earnButton}>
                <Text style={styles.earnText}>Earn More</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
        <View style={styles.content}>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="physical">Physical</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vouchers">
              <View style={styles.vouchersGrid}>
                {rewards.vouchers.map(reward => (
                  <Card key={reward.id} style={styles.rewardCard}>
                    <View style={styles.voucherContent}>
                      <Image source={{ uri: reward.image }} style={styles.voucherImage} resizeMode="cover" />
                      <View style={styles.voucherInfo}>
                        <Badge variant="default" style={styles.categoryBadge}>
                          <Text style={{color: '#fff', fontSize: 12}}>{reward.category}</Text>
                        </Badge>
                        <Text style={styles.voucherTitle} numberOfLines={2}>{reward.title}</Text>
                        <View style={styles.voucherFooter}>
                          <View style={styles.pointsRow}>
                            <Ionicons name="star" size={16} color="#a855f7" />
                            <Text style={styles.pointsCost}>{reward.points} pts</Text>
                          </View>
                          <Button onPress={() => {}} disabled={userPoints < reward.points} style={styles.redeemButton}>
                            <Text style={{color: '#fff', fontSize: 14, fontWeight: '600'}}>Redeem</Text>
                          </Button>
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </TabsContent>
            <TabsContent value="badges">
              <View style={styles.badgesGrid}>
              {rewards.badges.map(badge => (
                <Card key={badge.id} style={styles.badgeCard}>
                  <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Badge variant={badge.rarity === 'Gold' ? 'warning' : 'secondary'} style={styles.rarityBadge}>
                    <Text style={{color: badge.rarity === 'Gold' ? '#854d0e' : '#64748b', fontSize: 12}}>{badge.rarity}</Text>
                  </Badge>
                  <View style={styles.badgePoints}>
                    <Ionicons name="star" size={16} color="#a855f7" />
                    <Text style={styles.badgePointsText}>{badge.points} pts</Text>
                  </View>
                  <Button onPress={() => {}} disabled={userPoints < badge.points} style={styles.unlockButton}>
                    <Text style={{color: '#fff', fontSize: 14, fontWeight: '600'}}>Unlock</Text>
                  </Button>
                </Card>
              ))}
              </View>
            </TabsContent>
            <TabsContent value="physical">
              {rewards.physical.map(reward => (
                <Card key={reward.id} style={styles.physicalCard}>
                  <View style={styles.physicalImageContainer}>
                    <Image source={{ uri: reward.image }} style={styles.physicalImage} resizeMode="cover" />
                    <Badge variant={reward.stock === 'Limited' ? 'error' : 'success'} style={styles.stockBadge}>
                      <Text style={{color: reward.stock === 'Limited' ? '#dc2626' : '#16a34a', fontSize: 12}}>{reward.stock}</Text>
                    </Badge>
                  </View>
                  <View style={styles.physicalInfo}>
                    <Badge variant="default">
                      <Text style={{color: '#fff', fontSize: 12}}>{reward.category}</Text>
                    </Badge>
                    <Text style={styles.physicalTitle}>{reward.title}</Text>
                    <View style={styles.physicalFooter}>
                      <View style={styles.pointsRow}>
                        <Ionicons name="star" size={20} color="#a855f7" />
                        <Text style={styles.physicalPoints}>{reward.points} pts</Text>
                      </View>
                      <Button onPress={() => {}} disabled={userPoints < reward.points}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                          <Ionicons name="cart" size={16} color="#fff" />
                          <Text style={{color: '#fff', fontSize: 14, fontWeight: '600'}}>Redeem</Text>
                        </View>
                      </Button>
                    </View>
                  </View>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
          <Card style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Ionicons name="trophy" size={20} color="#a855f7" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Earn More Points</Text>
                <Text style={styles.infoDesc}>Complete challenges, log oil usage, and invite friends to earn more points!</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5ff' },
  header: { backgroundColor: '#a855f7', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, gap: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#f3e8ff', marginTop: 2 },
  pointsCard: { backgroundColor: 'rgba(255,255,255,0.2)' },
  pointsContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pointsLabel: { fontSize: 12, color: '#f3e8ff', marginBottom: 4 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pointsValue: { fontSize: 28, fontWeight: '700', color: '#fff' },
  earnButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  earnText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  content: { padding: 16, gap: 12 },
  vouchersGrid: { gap: 12 },
  rewardCard: { marginBottom: 0 },
  voucherContent: { flexDirection: 'row', gap: 12 },
  voucherImage: { width: 112, height: 112, borderRadius: 8 },
  voucherInfo: { flex: 1, paddingVertical: 4, gap: 8 },
  categoryBadge: { alignSelf: 'flex-start' },
  voucherTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  voucherFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pointsCost: { fontSize: 14, color: '#a855f7', fontWeight: '600' },
  redeemButton: { paddingHorizontal: 20, paddingVertical: 8 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { flex: 1, minWidth: '45%', alignItems: 'center', padding: 16 },
  badgeEmoji: { fontSize: 48, marginBottom: 8 },
  badgeTitle: { fontSize: 16, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 4 },
  rarityBadge: { marginBottom: 12 },
  badgePoints: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  badgePointsText: { fontSize: 14, color: '#a855f7', fontWeight: '600' },
  unlockButton: { width: '100%' },
  physicalCard: { marginBottom: 0 },
  physicalImageContainer: { position: 'relative', height: 192 },
  physicalImage: { width: '100%', height: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  stockBadge: { position: 'absolute', top: 8, right: 8 },
  physicalInfo: { padding: 16, gap: 12 },
  physicalTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  physicalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  physicalPoints: { fontSize: 16, fontWeight: '600', color: '#a855f7' },
  infoCard: { backgroundColor: '#faf5ff' },
  infoContent: { flexDirection: 'row', gap: 12 },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#7c3aed', marginBottom: 4 },
  infoDesc: { fontSize: 14, color: '#9333ea', lineHeight: 20 },
});
