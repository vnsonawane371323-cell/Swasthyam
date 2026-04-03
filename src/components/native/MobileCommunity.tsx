import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { t } from '../../i18n';

interface MobileCommunityProps {
  navigation?: any;
}

const { width } = Dimensions.get('window');

// Post images
const postImages = {
  airfryer: require('../../assets/post_airfryer.png'),
  cholesterol: require('../../assets/post_cholesterol.png'),
  thali: require('../../assets/post_thali.png'),
};

const communityPosts = [
  {
    id: 1,
    user: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    time: '2 hours ago',
    content: 'Successfully reduced my family\'s oil consumption by 15% this month! The air fryer recipes are a game changer. 🎉',
    likes: 24,
    comments: 8,
    achievement: 'Oil Saver',
    image: 'airfryer',
  },
  {
    id: 2,
    user: 'Rajesh Kumar',
    location: 'Delhi',
    time: '5 hours ago',
    content: 'Just completed the 30-day challenge! My cholesterol levels have improved significantly. Thank you SwasthTel! 💪',
    likes: 42,
    comments: 15,
    achievement: 'Challenge Champion',
    image: 'cholesterol',
  },
  {
    id: 3,
    user: 'Anita Patel',
    location: 'Ahmedabad, Gujarat',
    time: '1 day ago',
    content: 'Sharing my favorite low-oil gujarati dish - it tastes just as good with 70% less oil!',
    likes: 35,
    comments: 12,
    image: 'thali',
  },
];

const groups = [
  { name: 'Health Warriors Mumbai', members: 342, discussions: 23 },
  { name: 'School Kitchen Innovators', members: 578, discussions: 45 },
  { name: 'Air Fryer Enthusiasts', members: 425, discussions: 34 },
  { name: 'Traditional Recipes Low-Oil', members: 612, discussions: 56 },
];

export function MobileCommunity({ language, navigation }: MobileCommunityProps) {
  const [selectedTab, setSelectedTab] = useState('feed');

  const text = {
    en: {
      community: 'Community',
      subtitle: 'Connect & share your journey',
      searchPlaceholder: 'Search community...',
      searchPosts: 'Search posts...',
      feed: 'Feed',
      challenges: 'Challenges',
      groups: 'Groups',
      leaderboard: 'Leaderboard',
      likes: 'likes',
      comments: 'comments',
      members: 'Members',
      discussions: 'discussions',
      dayStreak: 'Day Streak',
      streakMessage: "You're on fire! Keep it going! 🔥",
      view: 'View',
      avgReduction: 'Avg Reduction',
      posts: 'Posts',
      allPosts: 'All Posts',
    },
    hi: {
      community: 'समुदाय',
      subtitle: 'जुड़ें और अपनी यात्रा साझा करें',
      searchPlaceholder: 'समुदाय खोजें...',
      searchPosts: 'पोस्ट खोजें...',
      feed: 'फ़ीड',
      challenges: 'चुनौतियां',
      groups: 'समूह',
      leaderboard: 'लीडरबोर्ड',
      likes: 'पसंद',
      comments: 'टिप्पणियाँ',
      members: 'सदस्य',
      discussions: 'चर्चाएँ',
      dayStreak: 'दिन की स्ट्रीक',
      streakMessage: 'आप आग पर हैं! जारी रखें! 🔥',
      view: 'देखें',
      avgReduction: 'औसत कमी',
      posts: 'पोस्ट',
      allPosts: 'सभी पोस्ट',
    },
  };

  const t = text[language as keyof typeof text] || text.en;

  const renderPost = ({ item }: any) => (
    <Card style={styles.postCard}>
      <CardContent style={styles.postContent}>
        <View style={styles.postHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={40} color="#1b4a5a" />
          </View>
          <View style={styles.postUserInfo}>
            <Text style={styles.userName}>{item.user}</Text>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          {item.achievement && (
            <Badge variant="success" style={styles.achievementBadge}>
              <Text style={{color: '#16a34a', fontSize: 10}}>{item.achievement}</Text>
            </Badge>
          )}
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={20} color="#5B5B5B" />
            <Text style={styles.actionText}>{item.likes} {t.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#5B5B5B" />
            <Text style={styles.actionText}>{item.comments} {t.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#5B5B5B" />
          </TouchableOpacity>
        </View>
      </CardContent>
    </Card>
  );

  const renderGroup = ({ item }: any) => (
    <TouchableOpacity style={styles.groupCard}>
      <View style={styles.groupIcon}>
        <Ionicons name="people" size={32} color="#1b4a5a" />
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupStats}>
          {item.members} {t.members} • {item.discussions} {t.discussions}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#5B5B5B" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="people-outline" size={28} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>{t.community}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            placeholderTextColor="#888888"
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['feed', 'challenges', 'groups', 'leaderboard'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {t[tab as keyof typeof t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {selectedTab === 'feed' && (
        <ScrollView 
          style={styles.feedContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Day Streak Card */}
          <View style={styles.streakCard}>
            <View style={styles.streakIconContainer}>
              <Ionicons name="flame" size={32} color="#ffffff" />
            </View>
            <View style={styles.streakContent}>
              <View style={styles.streakTextRow}>
                <Text style={styles.streakNumber}>23</Text>
                <Text style={styles.streakLabel}>{t.dayStreak}</Text>
              </View>
              <Text style={styles.streakMessage}>{t.streakMessage}</Text>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>{t.view}</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="people-outline" size={24} color="#1b4a5a" />
              <Text style={styles.statNumber}>12.4k</Text>
              <Text style={styles.statLabel}>{t.members}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-down-outline" size={24} color="#f5a623" />
              <Text style={styles.statNumber}>18%</Text>
              <Text style={styles.statLabel}>{t.avgReduction}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="document-text-outline" size={24} color="#f5a623" />
              <Text style={styles.statNumber}>2.1k</Text>
              <Text style={styles.statLabel}>{t.posts}</Text>
            </View>
          </View>

          {/* Search Posts Bar */}
          <View style={styles.searchPostsRow}>
            <View style={styles.searchPostsContainer}>
              <Ionicons name="search" size={18} color="#888888" />
              <TextInput
                style={styles.searchPostsInput}
                placeholder={t.searchPosts}
                placeholderTextColor="#888888"
              />
            </View>
            <TouchableOpacity style={styles.filterDropdown}>
              <Text style={styles.filterText}>{t.allPosts}</Text>
              <Ionicons name="chevron-down" size={18} color="#5B5B5B" />
            </TouchableOpacity>
          </View>

          {/* Posts List */}
          {communityPosts.map((item) => (
            <Card key={item.id} style={styles.postCard}>
              <CardContent style={styles.postContentCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={40} color="#1b4a5a" />
                  </View>
                  <View style={styles.postUserInfo}>
                    <Text style={styles.userName}>{item.user}</Text>
                    <Text style={styles.location}>{item.location}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                  </View>
                  {item.achievement && (
                    <Badge variant="success" style={styles.achievementBadge}>
                      <Text style={{color: '#16a34a', fontSize: 10}}>{item.achievement}</Text>
                    </Badge>
                  )}
                </View>

                <Text style={styles.postText}>{item.content}</Text>

                {/* Post Image */}
                {item.image && (
                  <Image
                    source={postImages[item.image as keyof typeof postImages]}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={20} color="#5B5B5B" />
                    <Text style={styles.actionText}>{item.likes} {t.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={20} color="#5B5B5B" />
                    <Text style={styles.actionText}>{item.comments} {t.comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-outline" size={20} color="#5B5B5B" />
                  </TouchableOpacity>
                </View>
              </CardContent>
            </Card>
          ))}
        </ScrollView>
      )}

      {selectedTab === 'challenges' && (
        <ScrollView contentContainerStyle={styles.listContainer}>
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <Text style={styles.comingSoon}>Community Challenges</Text>
              <Text style={styles.comingSoonSubtitle}>
                Join challenges and compete with the community
              </Text>
            </CardContent>
          </Card>
        </ScrollView>
      )}

      {selectedTab === 'groups' && (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedTab === 'leaderboard' && (
        <ScrollView contentContainerStyle={styles.listContainer}>
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <Text style={styles.comingSoon}>Leaderboard Coming Soon!</Text>
              <Text style={styles.comingSoonSubtitle}>
                Compete with other users and climb the ranks
              </Text>
            </CardContent>
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  header: {
    backgroundColor: '#1b4a5a',
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#040707',
    padding: 0,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1b4a5a',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  feedContainer: {
    flex: 1,
    padding: 16,
  },
  // Day Streak Card Styles
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef5e7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#f5a623',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  streakContent: {
    flex: 1,
  },
  streakTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1b4a5a',
  },
  streakLabel: {
    fontSize: 16,
    color: '#5B5B5B',
    fontWeight: '500',
  },
  streakMessage: {
    fontSize: 14,
    color: '#5B5B5B',
    marginTop: 2,
  },
  viewButton: {
    backgroundColor: '#1b4a5a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Stats Row Styles
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b4a5a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#5B5B5B',
    marginTop: 2,
  },
  // Search Posts Row Styles
  searchPostsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchPostsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 10,
  },
  searchPostsInput: {
    flex: 1,
    fontSize: 14,
    color: '#040707',
    padding: 0,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#5B5B5B',
    fontWeight: '500',
  },
  postCard: {
    marginBottom: 16,
  },
  postContentCard: {
    padding: 16,
  },
  postText: {
    fontSize: 15,
    color: '#040707',
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  postContent: {
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  postUserInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
  },
  location: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  time: {
    fontSize: 11,
    color: '#5B5B5B',
  },
  achievementBadge: {
    alignSelf: 'flex-start',
  },
  postActions: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  groupIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#E7F2F1',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  groupStats: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    padding: 40,
    alignItems: 'center',
  },
  comingSoon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b4a5a',
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    fontSize: 14,
    color: '#5B5B5B',
    textAlign: 'center',
  },
});
