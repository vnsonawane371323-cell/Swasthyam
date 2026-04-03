import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { Progress } from './Progress';
import { t } from '../../i18n';

interface MobileChallengesProps {
  navigation?: any;
}

const activeChallenges = [
  {
    id: 1,
    title: 'Weekend Warrior',
    description: 'Stay under 35g/day this weekend',
    progress: 1,
    goal: 2,
    reward: 200,
    category: 'individual',
  },
  {
    id: 2,
    title: 'Family Health Quest',
    description: 'Get family under 12kg/year per person',
    progress: 3,
    goal: 4,
    reward: 300,
    category: 'family',
  },
  {
    id: 3,
    title: 'Oil-Free Week',
    description: 'Try 5 zero-oil recipes',
    progress: 2,
    goal: 5,
    reward: 250,
    category: 'cooking',
  },
];

const exploreChallenges = [
  {
    id: 4,
    title: 'Community Savings Sprint',
    description: 'Collectively save 10,000g this month',
    participants: 523,
    reward: 500,
  },
  {
    id: 5,
    title: 'No Deep-Frying Challenge',
    description: 'Avoid deep-fried foods for 30 days',
    participants: 1842,
    reward: 400,
  },
  {
    id: 6,
    title: 'Reduce Oil by 40%',
    description: 'Cut your monthly oil usage by 40%',
    participants: 934,
    reward: 600,
  },
];

const leaderboard = [
  { rank: 1, name: 'Priya Sharma', city: 'Mumbai', reduction: 28, points: 2850 },
  { rank: 2, name: 'Rajesh Kumar', city: 'Delhi', reduction: 25, points: 2640 },
  { rank: 3, name: 'Anita Patel', city: 'Ahmedabad', reduction: 23, points: 2420 },
  { rank: 12, name: 'You', city: 'Chennai', reduction: 18, points: 1850, isCurrentUser: true },
];

export function MobileChallenges({ navigation }: MobileChallengesProps) {
  const [selectedTab, setSelectedTab] = useState<'my' | 'explore' | 'leaderboard'>('my');

  const renderActiveChallenge = ({ item }: { item: typeof activeChallenges[0] }) => (
    <Card style={styles.challengeCard}>
      <CardContent style={styles.challengeContent}>
        <View style={styles.challengeHeader}>
          <View style={styles.challengeIcon}>
            <Ionicons name="trophy" size={24} color="#a855f7" />
          </View>
          <Badge variant="info">
            <Text style={styles.rewardText}>{item.reward} {t.reward}</Text>
          </Badge>
        </View>

        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={styles.challengeDesc}>{item.description}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {item.progress} / {item.goal}
            </Text>
            <Text style={styles.progressPercent}>
              {Math.round((item.progress / item.goal) * 100)}%
            </Text>
          </View>
          <Progress value={(item.progress / item.goal) * 100} />
        </View>
      </CardContent>
    </Card>
  );

  const renderExploreChallenge = ({ item }: { item: typeof exploreChallenges[0] }) => (
    <Card style={styles.challengeCard}>
      <CardContent style={styles.challengeContent}>
        <View style={styles.challengeHeader}>
          <View style={styles.challengeIcon}>
            <Ionicons name="people" size={24} color="#f97316" />
          </View>
          <Badge variant="warning">
            <Text style={styles.rewardText}>{item.reward} {t.reward}</Text>
          </Badge>
        </View>

        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={styles.challengeDesc}>{item.description}</Text>

        <View style={styles.challengeFooter}>
          <View style={styles.participantInfo}>
            <Ionicons name="people-outline" size={16} color="#5B5B5B" />
            <Text style={styles.participantText}>
              {item.participants.toLocaleString()} {t.participants}
            </Text>
          </View>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>{t.join}</Text>
          </TouchableOpacity>
        </View>
      </CardContent>
    </Card>
  );

  const renderLeaderboardItem = ({ item }: { item: typeof leaderboard[0] }) => (
    <View
      style={[
        styles.leaderboardItem,
        item.isCurrentUser && styles.leaderboardItemCurrent,
      ]}
    >
      <View style={styles.leaderboardRank}>
        {item.rank <= 3 ? (
          <Ionicons
            name="trophy"
            size={24}
            color={item.rank === 1 ? '#f59e0b' : item.rank === 2 ? '#9ca3af' : '#cd7f32'}
          />
        ) : (
          <Text style={styles.rankNumber}>#{item.rank}</Text>
        )}
      </View>

      <View style={styles.leaderboardInfo}>
        <Text style={[styles.leaderboardName, item.isCurrentUser && styles.currentUserText]}>
          {item.name}
        </Text>
        <Text style={styles.leaderboardCity}>{item.city}</Text>
      </View>

      <View style={styles.leaderboardStats}>
        <Text style={styles.statValue}>{item.reduction}%</Text>
        <Text style={styles.statLabel}>{t.reduction}</Text>
      </View>

      <View style={styles.leaderboardStats}>
        <Text style={styles.statValue}>{item.points}</Text>
        <Text style={styles.statLabel}>{t.points}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="trophy" size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1,250</Text>
            <Text style={styles.statText}>{t.points}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.streakIcon}>
              <Ionicons name="flame" size={20} color="#f97316" />
              <Text style={styles.statNumber}>12</Text>
            </View>
            <Text style={styles.statText}>{t.streak}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>#12</Text>
            <Text style={styles.statText}>{t.rank}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'my' && styles.tabActive]}
          onPress={() => setSelectedTab('my')}
        >
          <Text style={[styles.tabText, selectedTab === 'my' && styles.tabTextActive]}>
            {t.myChallenges}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'explore' && styles.tabActive]}
          onPress={() => setSelectedTab('explore')}
        >
          <Text style={[styles.tabText, selectedTab === 'explore' && styles.tabTextActive]}>
            {t.explore}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'leaderboard' && styles.tabActive]}
          onPress={() => setSelectedTab('leaderboard')}
        >
          <Text style={[styles.tabText, selectedTab === 'leaderboard' && styles.tabTextActive]}>
            {t.leaderboard}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'my' && (
          <FlatList
            data={activeChallenges}
            renderItem={renderActiveChallenge}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.challengesList}
          />
        )}

        {selectedTab === 'explore' && (
          <FlatList
            data={exploreChallenges}
            renderItem={renderExploreChallenge}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.challengesList}
          />
        )}

        {selectedTab === 'leaderboard' && (
          <FlatList
            data={leaderboard}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item) => item.rank.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.leaderboardList}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  header: {
    backgroundColor: '#a855f7',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  streakIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#a855f7',
  },
  tabText: {
    fontSize: 14,
    color: '#5B5B5B',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  challengesList: {
    gap: 16,
    paddingBottom: 16,
  },
  challengeCard: {
    marginBottom: 0,
  },
  challengeContent: {
    padding: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '600',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  challengeDesc: {
    fontSize: 14,
    color: '#5B5B5B',
    marginBottom: 12,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#040707',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E7F2F1',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantText: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  joinButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardList: {
    gap: 12,
    paddingBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardItemCurrent: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#040707',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 2,
  },
  currentUserText: {
    color: '#f59e0b',
  },
  leaderboardCity: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  leaderboardStats: {
    alignItems: 'center',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
  },
  statLabel: {
    fontSize: 11,
    color: '#5B5B5B',
  },
});
