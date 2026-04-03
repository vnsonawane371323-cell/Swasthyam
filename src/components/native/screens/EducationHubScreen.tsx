import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Progress } from '../Progress';

const { width } = Dimensions.get('window');

interface EducationHubScreenProps {
  navigation: any;
}

// Education modules data
const educationModules = [
  {
    id: 1,
    title: 'Understanding Healthy Oils',
    titleHi: 'स्वस्थ तेलों को समझना',
    description: 'Learn about different types of oils and their health impacts',
    descriptionHi: 'विभिन्न प्रकार के तेलों और उनके स्वास्थ्य प्रभावों के बारे में जानें',
    duration: '45 min',
    progress: 60,
    videos: 5,
    points: 100,
    level: 'Beginner',
    icon: 'water',
    color: ['#06b6d4', '#0891b2'],
    completedLessons: 3,
    totalLessons: 5,
  },
  {
    id: 2,
    title: 'Low-Oil Cooking Techniques',
    titleHi: 'कम तेल खाना पकाने की तकनीक',
    description: 'Master healthy cooking methods that use minimal oil',
    descriptionHi: 'स्वस्थ खाना पकाने के तरीके सीखें जो न्यूनतम तेल का उपयोग करते हैं',
    duration: '60 min',
    progress: 100,
    videos: 6,
    points: 150,
    level: 'Intermediate',
    icon: 'restaurant',
    color: ['#10b981', '#059669'],
    completedLessons: 6,
    totalLessons: 6,
  },
  {
    id: 3,
    title: 'Oil Consumption & Health',
    titleHi: 'तेल की खपत और स्वास्थ्य',
    description: 'Understanding the relationship between oil and wellness',
    descriptionHi: 'तेल और कल्याण के बीच संबंध को समझना',
    duration: '30 min',
    progress: 0,
    videos: 4,
    points: 80,
    level: 'Beginner',
    icon: 'heart',
    color: ['#ef4444', '#dc2626'],
    completedLessons: 0,
    totalLessons: 4,
  },
  {
    id: 4,
    title: 'Indian Low-Oil Recipes',
    titleHi: 'भारतीय कम तेल वाली रेसिपी',
    description: 'Traditional dishes made healthier with less oil',
    descriptionHi: 'कम तेल के साथ स्वास्थ्यवर्धक बनाए गए पारंपरिक व्यंजन',
    duration: '90 min',
    progress: 25,
    videos: 8,
    points: 200,
    level: 'Advanced',
    icon: 'pizza',
    color: ['#f59e0b', '#d97706'],
    completedLessons: 2,
    totalLessons: 8,
  },
];

// YouTube video links for learning module
const youtubeVideos = [
  {
    id: 'wJ4XFYzSYB4',
    title: 'Healthy Cooking Tips',
    titleHi: 'स्वस्थ खाना पकाने के टिप्स',
    description: 'Learn essential tips for healthier cooking',
    descriptionHi: 'स्वस्थ खाना पकाने के लिए आवश्यक टिप्स जानें',
    duration: '10 min',
    url: 'https://youtu.be/wJ4XFYzSYB4',
  },
  {
    id: 'bUBP2hqPs2g',
    title: 'Oil-Free Cooking Methods',
    titleHi: 'तेल रहित खाना पकाने के तरीके',
    description: 'Master cooking techniques without excess oil',
    descriptionHi: 'अतिरिक्त तेल के बिना खाना पकाने की तकनीक सीखें',
    duration: '12 min',
    url: 'https://youtu.be/bUBP2hqPs2g',
  },
  {
    id: 'SuL8DBuCwMU',
    title: 'Understanding Healthy Oils',
    titleHi: 'स्वस्थ तेलों को समझना',
    description: 'Which oils are best for your health',
    descriptionHi: 'आपके स्वास्थ्य के लिए कौन से तेल सर्वोत्तम हैं',
    duration: '15 min',
    url: 'https://youtu.be/SuL8DBuCwMU',
  },
];

export function EducationHubScreen({ navigation }: EducationHubScreenProps) {
  const [language] = useState('en'); // You can get this from context

  const handleModulePress = (module: any) => {
    navigation.navigate('ModuleDetail', { module });
  };

  const handleVideoPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening YouTube video:', error);
    }
  };

  // Calculate total stats
  const totalModules = educationModules.length;
  const completedModules = educationModules.filter(m => m.progress === 100).length;
  const totalHours = educationModules.reduce((acc, m) => {
    const mins = parseInt(m.duration);
    return acc + mins;
  }, 0) / 60;
  const earnedCertificates = completedModules;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="school" size={32} color="#fff" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {language === 'hi' ? 'शिक्षा केंद्र' : 'Education Hub'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {language === 'hi' ? 'शैक्षिक मॉड्यूल और संसाधन' : 'Learning modules & resources'}
              </Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedModules}/{totalModules}</Text>
              <Text style={styles.statLabel}>
                {language === 'hi' ? 'पूर्ण' : 'Completed'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalHours.toFixed(1)}h</Text>
              <Text style={styles.statLabel}>
                {language === 'hi' ? 'इस महीने' : 'This Month'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statValueRow}>
                <Ionicons name="trophy" size={20} color="#fbbf24" />
                <Text style={styles.statValue}>{earnedCertificates}</Text>
              </View>
              <Text style={styles.statLabel}>
                {language === 'hi' ? 'प्रमाणपत्र' : 'Certificates'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Featured Module */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'hi' ? 'विशेष पाठ्यक्रम' : 'Featured Course'}
            </Text>
            <LinearGradient
              colors={['#a855f7', '#ec4899']}
              style={styles.featuredCard}
            >
              <Badge style={styles.featuredBadge}>
                <Text style={{ color: '#ffffffff', fontSize: 12, fontWeight: '600' }}>
                  {language === 'hi' ? 'विशेष' : 'Featured'}
                </Text>
              </Badge>
              <Text style={styles.featuredTitle}>
                {language === 'hi' ? 'आत्मनिर्भर भारत: तेल स्वतंत्रता' : 'Atmanirbhar Bharat: Oil Independence'}
              </Text>
              <Text style={styles.featuredDescription}>
                {language === 'hi' 
                  ? 'राष्ट्रीय स्वास्थ्य लक्ष्यों के साथ संरेखित विशेष पाठ्यक्रम'
                  : 'Special curriculum aligned with national health goals'}
              </Text>
              <View style={styles.featuredStats}>
                <View style={styles.featuredStatItem}>
                  <Ionicons name="book-outline" size={16} color="#fff" />
                  <Text style={styles.featuredStatText}>
                    {language === 'hi' ? '10 मॉड्यूल' : '10 modules'}
                  </Text>
                </View>
                <View style={styles.featuredStatItem}>
                  <Ionicons name="time-outline" size={16} color="#fff" />
                  <Text style={styles.featuredStatText}>
                    {language === 'hi' ? '4 घंटे' : '4 hours'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.featuredButton}>
                <Text style={styles.featuredButtonText}>
                  {language === 'hi' ? 'सीखना शुरू करें' : 'Start Learning'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Featured Videos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {language === 'hi' ? 'शैक्षिक वीडियो' : 'Featured Videos'}
              </Text>
              <TouchableOpacity>
                <Ionicons name="logo-youtube" size={24} color="#FF0000" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.videosContainer}
            >
              {youtubeVideos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.videoCard}
                  onPress={() => handleVideoPress(video.url)}
                  activeOpacity={0.8}
                >
                  <View style={styles.thumbnailContainer}>
                    <Image
                      source={{ uri: `https://img.youtube.com/vi/${video.id}/mqdefault.jpg` }}
                      style={styles.videoThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.playButtonOverlay}>
                      <View style={styles.playButton}>
                        <Ionicons name="play" size={24} color="#fff" />
                      </View>
                    </View>
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{video.duration}</Text>
                    </View>
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {language === 'hi' ? video.titleHi : video.title}
                    </Text>
                    <Text style={styles.videoDescription} numberOfLines={1}>
                      {language === 'hi' ? video.descriptionHi : video.description}
                    </Text>
                    <View style={styles.videoMeta}>
                      <Ionicons name="logo-youtube" size={14} color="#FF0000" />
                      <Text style={styles.videoMetaText}>YouTube</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Modules List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'hi' ? 'मेरे पाठ्यक्रम' : 'My Courses'}
            </Text>
            {educationModules.map((module, index) => (
              <TouchableOpacity
                key={module.id}
                onPress={() => handleModulePress(module)}
                activeOpacity={0.7}
              >
                <Card style={styles.moduleCard}>
                  <View style={styles.moduleHeader}>
                    <LinearGradient
                      colors={module.color as any}
                      style={styles.moduleIcon}
                    >
                      <Ionicons name={module.icon as any} size={24} color="#fff" />
                    </LinearGradient>
                    <View style={styles.moduleInfo}>
                      <Text style={styles.moduleTitle}>
                        {language === 'hi' ? module.titleHi : module.title}
                      </Text>
                      <Text style={styles.moduleDescription}>
                        {language === 'hi' ? module.descriptionHi : module.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.moduleStats}>
                    <View style={styles.moduleStatItem}>
                      <Ionicons name="play-circle-outline" size={14} color="#666" />
                      <Text style={styles.moduleStatText}>{module.videos} videos</Text>
                    </View>
                    <View style={styles.moduleStatItem}>
                      <Ionicons name="time-outline" size={14} color="#666" />
                      <Text style={styles.moduleStatText}>{module.duration}</Text>
                    </View>
                    <View style={styles.moduleStatItem}>
                      <Ionicons name="bar-chart-outline" size={14} color="#666" />
                      <Text style={styles.moduleStatText}>{module.level}</Text>
                    </View>
                  </View>

                  {module.progress > 0 && module.progress < 100 && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>
                          {language === 'hi' ? 'प्रगति' : 'Progress'}
                        </Text>
                        <Text style={styles.progressValue}>{module.progress}%</Text>
                      </View>
                      <Progress value={module.progress} style={styles.progressBar} />
                      <Text style={styles.progressText}>
                        {module.completedLessons}/{module.totalLessons} {language === 'hi' ? 'पाठ पूर्ण' : 'lessons completed'}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.moduleButton,
                      module.progress === 100 && styles.moduleButtonCompleted
                    ]}
                  >
                    <Text style={[
                      styles.moduleButtonText,
                      module.progress === 100 && styles.moduleButtonTextCompleted
                    ]}>
                      {module.progress === 100
                        ? (language === 'hi' ? '✓ पूर्ण' : '✓ Completed')
                        : module.progress > 0
                        ? (language === 'hi' ? 'जारी रखें' : 'Continue')
                        : (language === 'hi' ? 'शुरू करें' : 'Start')
                      }
                    </Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={18} 
                      color={module.progress === 100 ? '#059669' : '#fff'} 
                    />
                  </TouchableOpacity>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {/* Community Programs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'hi' ? 'सामुदायिक कार्यक्रम' : 'Community Programs'}
            </Text>
            <Card style={styles.communityCard}>
              <View style={styles.communityItem}>
                <Text style={styles.communityTitle}>
                  {language === 'hi' ? 'मध्याह्न भोजन कार्यक्रम' : 'Mid-Day Meal Program'}
                </Text>
                <Text style={styles.communityDescription}>
                  {language === 'hi' ? 'देशभर की स्कूल रसोईयों के लिए' : 'For school kitchens nationwide'}
                </Text>
                <TouchableOpacity style={styles.communityButton}>
                  <Text style={styles.communityButtonText}>
                    {language === 'hi' ? 'अधिक जानें' : 'Learn More'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.communityItem, styles.communityItemLast]}>
                <Text style={styles.communityTitle}>
                  {language === 'hi' ? 'सामुदायिक कार्यशालाएं' : 'Community Workshops'}
                </Text>
                <Text style={styles.communityDescription}>
                  {language === 'hi' ? 'आपके पास मुफ्त ऑफलाइन कार्यशालाएं' : 'Free offline workshops near you'}
                </Text>
                <TouchableOpacity style={styles.communityButton}>
                  <Text style={styles.communityButtonText}>
                    {language === 'hi' ? 'कार्यशालाएं खोजें' : 'Find Workshops'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </View>
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
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
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
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 12,
  },
  featuredCard: {
    borderRadius: 16,
    padding: 20,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  featuredStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  featuredStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredStatText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuredButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  featuredButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a855f7',
  },
  moduleCard: {
    marginBottom: 16,
    padding: 16,
  },
  moduleHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 13,
    color: '#5B5B5B',
    lineHeight: 18,
  },
  moduleStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  moduleStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleStatText: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#040707',
  },
  progressBar: {
    marginBottom: 6,
  },
  progressText: {
    fontSize: 11,
    color: '#666',
  },
  moduleButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  moduleButtonCompleted: {
    backgroundColor: '#d1fae5',
  },
  moduleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  moduleButtonTextCompleted: {
    color: '#059669',
  },
  communityCard: {
    padding: 16,
  },
  communityItem: {
    marginBottom: 20,
  },
  communityItemLast: {
    marginBottom: 0,
  },
  communityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  communityDescription: {
    fontSize: 13,
    color: '#5B5B5B',
    marginBottom: 12,
    lineHeight: 18,
  },
  communityButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  communityButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#040707',
  },
  // YouTube Video Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  videosContainer: {
    marginHorizontal: -4,
  },
  videoCard: {
    width: 220,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 124,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
    lineHeight: 18,
  },
  videoDescription: {
    fontSize: 12,
    color: '#5B5B5B',
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoMetaText: {
    fontSize: 11,
    color: '#666',
  },
});
