import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';

interface LeaderboardScreenProps {
  navigation: any;
  route: { params?: { challenge?: any } };
}

export function LeaderboardScreen({ navigation, route }: LeaderboardScreenProps) {
  const [selectedTab, setSelectedTab] = useState('global');
  const challenge = route.params?.challenge;

  const leaderboards = {
    global: [
      { rank: 1, name: 'The Sharma Family', avatar: '👨‍👩‍👧‍👦', score: 850, reduction: '72%', trend: '+5' },
      { rank: 2, name: 'Kumar Household', avatar: '👨‍👩‍👧', score: 820, reduction: '68%', trend: '+3' },
      { rank: 3, name: 'Your Family', avatar: '🏡', score: 780, reduction: '65%', trend: '+2', isUser: true },
      { rank: 4, name: 'Patel Family', avatar: '👨‍👩‍👧‍👦', score: 750, reduction: '62%', trend: '-1' },
    ],
    friends: [
      { rank: 1, name: 'Your Family', avatar: '🏡', score: 780, reduction: '65%', trend: '+2', isUser: true },
      { rank: 2, name: 'Verma Family', avatar: '👨‍👩‍👧', score: 720, reduction: '60%', trend: '+1' },
    ],
    school: [
      { rank: 1, name: 'Class 5-A', avatar: '🎓', score: 920, reduction: '78%', trend: '+8' },
      { rank: 2, name: 'Class 6-B', avatar: '🎓', score: 880, reduction: '74%', trend: '+5' },
    ],
  };

  const data = leaderboards[selectedTab as keyof typeof leaderboards];

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
                <Ionicons name="trophy" size={24} color="#fff" />
                <Text style={styles.headerTitle}>Leaderboard</Text>
              </View>
              <Text style={styles.headerSubtitle}>{challenge?.title || 'Challenge Rankings'}</Text>
            </View>
          </View>
          <Card style={styles.rankCard}>
            <View style={styles.rankContent}>
              <View>
                <Text style={styles.rankLabel}>Your Global Rank</Text>
                <View style={styles.rankRow}>
                  <Text style={styles.rankNumber}>#3</Text>
                  <Badge variant="success">
                    <Text style={{color: '#16a34a', fontSize: 12}}>+2</Text>
                  </Badge>
                </View>
              </View>
              <View style={styles.rankRight}>
                <Text style={styles.rankLabel}>Your Score</Text>
                <Text style={styles.rankNumber}>780</Text>
              </View>
            </View>
          </Card>
        </View>
        <View style={styles.content}>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="school">School</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedTab}>
              {data.map(entry => (
                <Card key={entry.rank} style={[styles.entryCard, (entry as any).isUser ? styles.userCard : undefined]}>
                  <View style={styles.entryContent}>
                <View style={[styles.rankBadge, entry.rank === 1 ? styles.rank1 : entry.rank === 2 ? styles.rank2 : entry.rank === 3 ? styles.rank3 : styles.rankOther]}>
                  {entry.rank <= 3 ? <Ionicons name={entry.rank === 1 ? 'trophy' : entry.rank === 2 ? 'medal' : 'ribbon'} size={20} color="#fff" /> : <Text style={styles.rankText}>{entry.rank}</Text>}
                </View>
                <View style={styles.entryInfo}>
                  <View style={styles.entryRow}>
                    <Text style={styles.avatar}>{entry.avatar}</Text>
                    <View style={styles.entryDetails}>
                      <Text style={styles.entryName} numberOfLines={1}>{entry.name}</Text>
                      <Text style={styles.entryReduction}>Oil reduction: {entry.reduction}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.entryRight}>
                  <Text style={styles.entryScore}>{entry.score}</Text>
                  <Badge variant={parseInt(entry.trend) > 0 ? 'success' : parseInt(entry.trend) < 0 ? 'error' : 'secondary'}>
                    <Text style={{color: parseInt(entry.trend) > 0 ? '#16a34a' : parseInt(entry.trend) < 0 ? '#dc2626' : '#64748b', fontSize: 12}}>{entry.trend}</Text>
                  </Badge>
                </View>
              </View>
            </Card>
          ))}
            </TabsContent>
          </Tabs>
          <Card style={styles.infoCard}>
            <Text style={styles.infoText}><Text style={styles.infoBold}>Leaderboard updates every 6 hours.</Text> Rankings are based on oil reduction percentage and consistency.</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbeb' },
  header: { backgroundColor: '#f59e0b', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, gap: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#fef3c7', marginTop: 2 },
  rankCard: { backgroundColor: 'rgba(255,255,255,0.2)' },
  rankContent: { flexDirection: 'row', justifyContent: 'space-between' },
  rankLabel: { fontSize: 12, color: '#fef3c7', marginBottom: 4 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankNumber: { fontSize: 28, fontWeight: '700', color: '#fff' },
  rankRight: { alignItems: 'flex-end' },
  content: { padding: 16, gap: 12 },
  entryCard: { marginBottom: 0 },
  userCard: { backgroundColor: '#fffbeb', borderWidth: 2, borderColor: '#fbbf24' },
  entryContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankBadge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  rank1: { backgroundColor: '#fbbf24' },
  rank2: { backgroundColor: '#d1d5db' },
  rank3: { backgroundColor: '#fb923c' },
  rankOther: { backgroundColor: '#e5e7eb' },
  rankText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  entryInfo: { flex: 1 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { fontSize: 24 },
  entryDetails: { flex: 1 },
  entryName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  entryReduction: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  entryRight: { alignItems: 'flex-end' },
  entryScore: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  infoCard: { backgroundColor: '#eff6ff' },
  infoText: { fontSize: 14, color: '#1e40af', lineHeight: 20 },
  infoBold: { fontWeight: '700' },
});
