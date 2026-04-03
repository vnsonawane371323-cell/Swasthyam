import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Progress } from '../Progress';

interface ChallengeDetailScreenProps {
  navigation: any;
  route?: any;
}

export function ChallengeDetailScreen({ navigation, route }: ChallengeDetailScreenProps) {
  const challenge = route?.params?.challenge || {
    id: 1,
    title: 'Family Cooking Quest',
    description: 'Reduce family oil consumption to less than 500ml per week',
    type: 'Family',
    duration: '90 days',
    daysRemaining: 75,
    participants: 1284,
    reward: 2000,
    currentRank: 3,
    progress: 65,
    goal: '500ml/week',
    current: '325ml/week',
  };

  const rules = [
    'Log all oil usage throughout the challenge period',
    'Family must collectively stay under 500ml/week',
    'At least 3 family members must participate',
    'Use SwasthTel verified low-oil recipes',
  ];

  const rewards = [
    { rank: '1st', points: 5000, badge: 'Gold Champion', color: '#fbbf24' },
    { rank: '2nd', points: 3000, badge: 'Silver Star', color: '#9ca3af' },
    { rank: '3rd', points: 2000, badge: 'Bronze Winner', color: '#f97316' },
    { rank: 'Top 10', points: 1000, badge: 'Elite Performer', color: '#3b82f6' },
  ];

  const topPerformers = [
    { rank: 1, name: 'The Sharma Family', score: 850, reduction: '72%' },
    { rank: 2, name: 'Kumar Household', score: 820, reduction: '68%' },
    { rank: 3, name: 'Your Family', score: 780, reduction: '65%' },
    { rank: 4, name: 'Patel Family', score: 750, reduction: '62%' },
    { rank: 5, name: 'Singh Family', score: 720, reduction: '60%' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Badge variant="default" style={styles.typeBadge}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                  <Ionicons name="people" size={12} color="#fff" />
                  <Text style={styles.typeText}>{challenge.type}</Text>
                </View>
              </Badge>
              <Text style={styles.headerTitle}>{challenge.title}</Text>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressLabel}>Your Progress</Text>
                <View style={styles.progressPercent}>
                  <Text style={styles.progressValue}>{challenge.progress}%</Text>
                  <Text style={styles.progressComplete}>complete</Text>
                </View>
              </View>
              <View style={styles.rankContainer}>
                <Text style={styles.rankLabel}>Current Rank</Text>
                <View style={styles.rankValue}>
                  <Ionicons name="trophy" size={20} color="#fbbf24" />
                  <Text style={styles.rankNumber}>#{challenge.currentRank}</Text>
                </View>
              </View>
            </View>
            <Progress value={challenge.progress} style={styles.progressBar} />
            <View style={styles.goalInfo}>
              <Text style={styles.goalCurrent}>{challenge.current}</Text>
              <Text style={styles.goalTarget}>Goal: {challenge.goal}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color="#f97316" />
            <Text style={styles.statLabel}>Days Left</Text>
            <Text style={styles.statValue}>{challenge.daysRemaining}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="people-outline" size={20} color="#3b82f6" />
            <Text style={styles.statLabel}>Participants</Text>
            <Text style={styles.statValue}>{challenge.participants}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="trophy-outline" size={20} color="#fbbf24" />
            <Text style={styles.statLabel}>Reward</Text>
            <Text style={styles.statValue}>{challenge.reward} pts</Text>
          </Card>
        </View>

        {/* Description */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About this Challenge</Text>
          <Text style={styles.description}>{challenge.description}</Text>
        </Card>

        {/* Rules */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag-outline" size={20} color="#f97316" />
            <Text style={styles.sectionTitle}>Challenge Rules</Text>
          </View>
          {rules.map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <View style={styles.ruleNumber}>
                <Text style={styles.ruleNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </Card>

        {/* Rewards */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Rewards</Text>
          {rewards.map((reward, index) => (
            <View key={index} style={styles.rewardItem}>
              <View style={styles.rewardLeft}>
                <View style={[styles.rewardIcon, { backgroundColor: reward.color }]}>
                  <Ionicons name="trophy" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.rewardRank}>{reward.rank} Place</Text>
                  <Text style={styles.rewardBadge}>{reward.badge}</Text>
                </View>
              </View>
              <Badge variant="warning">
                <Text style={{color: '#854d0e', fontSize: 12}}>{reward.points} pts</Text>
              </Badge>
            </View>
          ))}
        </Card>

        {/* Top Performers */}
        <Card style={styles.sectionCard}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.sectionTitle}>Top Performers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Leaderboard', { challenge })}>
              <Text style={styles.viewFullButton}>View Full</Text>
            </TouchableOpacity>
          </View>
          {topPerformers.map((performer) => (
            <View 
              key={performer.rank}
              style={[
                styles.performerItem,
                performer.rank === 3 && styles.performerHighlight
              ]}
            >
              <View style={styles.performerLeft}>
                <View style={[
                  styles.performerRank,
                  {
                    backgroundColor: 
                      performer.rank === 1 ? '#fbbf24' :
                      performer.rank === 2 ? '#9ca3af' :
                      performer.rank === 3 ? '#f97316' : '#d1d5db'
                  }
                ]}>
                  <Text style={styles.performerRankText}>{performer.rank}</Text>
                </View>
                <View>
                  <Text style={styles.performerName}>{performer.name}</Text>
                  <Text style={styles.performerReduction}>{performer.reduction} reduction</Text>
                </View>
              </View>
              <Badge variant="success">
                <Text style={{color: '#166534', fontSize: 12}}>{performer.score} pts</Text>
              </Badge>
            </View>
          ))}
        </Card>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button style={styles.actionButton}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Ionicons name="trending-up" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Keep Going!</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#f97316',
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  progressPercent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  progressComplete: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  rankContainer: {
    alignItems: 'flex-end',
  },
  rankLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  rankValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  progressBar: {
    height: 8,
    marginBottom: 8,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalCurrent: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  goalTarget: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#5B5B5B',
    marginTop: 4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
  },
  sectionCard: {
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  ruleNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  rewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardRank: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
  },
  rewardBadge: {
    fontSize: 11,
    color: '#5B5B5B',
  },
  rewardPoints: {
    fontSize: 12,
    color: '#854d0e',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewFullButton: {
    fontSize: 13,
    color: '#f97316',
    fontWeight: '600',
  },
  performerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  performerHighlight: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  performerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performerRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  performerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
  },
  performerReduction: {
    fontSize: 11,
    color: '#5B5B5B',
  },
  performerScore: {
    fontSize: 12,
    color: '#166534',
  },
  actionContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
