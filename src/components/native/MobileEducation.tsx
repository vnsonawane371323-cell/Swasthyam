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
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { Progress } from './Progress';
import { t } from '../../i18n';

interface MobileEducationProps {
}

const courses = [
  {
    id: 1,
    title: 'Healthy Cooking Basics',
    modules: 6,
    duration: '2 hours',
    progress: 67,
    completed: 4,
    level: 'Beginner',
  },
  {
    id: 2,
    title: 'Understanding Edible Oils',
    modules: 4,
    duration: '1.5 hours',
    progress: 100,
    completed: 4,
    level: 'Beginner',
  },
  {
    id: 3,
    title: 'Indian Low-Oil Cuisine',
    modules: 8,
    duration: '3 hours',
    progress: 25,
    completed: 2,
    level: 'Intermediate',
  },
];

const videos = [
  { id: 1, title: 'How to Use an Air Fryer', duration: '12:45', views: '45K' },
  { id: 2, title: 'Oil vs Health Explained', duration: '8:30', views: '62K' },
  { id: 3, title: 'Low-Oil Tadka Techniques', duration: '6:15', views: '38K' },
];

export function MobileEducation({ language }: MobileEducationProps) {
  const navigation = useNavigation<any>();
  const text = {
    en: {
      title: 'Learn',
      subtitle: 'Educational modules & resources',
      completed: 'Completed',
      thisMonth: 'This Month',
      certificates: 'Certificates',
      featured: 'Featured Course',
      featuredTitle: 'Atmanirbhar Bharat: Oil Independence',
      featuredDesc: 'Special curriculum aligned with national health goals',
      modules: 'modules',
      startLearning: 'Start Learning',
      myCourses: 'My Courses',
      continueCourse: 'Continue',
      videos: 'Video Library',
      views: 'views',
    },
    hi: {
      title: 'सीखें',
      subtitle: 'शैक्षिक मॉड्यूल और संसाधन',
      completed: 'पूर्ण',
      thisMonth: 'इस महीने',
      certificates: 'प्रमाणपत्र',
      featured: 'विशेष पाठ्यक्रम',
      featuredTitle: 'आत्मनिर्भर भारत: तेल स्वतंत्रता',
      featuredDesc: 'राष्ट्रीय स्वास्थ्य लक्ष्यों के साथ संरेखित विशेष पाठ्यक्रम',
      modules: 'मॉड्यूल',
      startLearning: 'सीखना शुरू करें',
      myCourses: 'मेरे पाठ्यक्रम',
      continueCourse: 'जारी रखें',
      videos: 'वीडियो लाइब्रेरी',
      views: 'बार देखा गया',
    },
  };

  const t = text[language as keyof typeof text] || text.en;

  const renderCourse = ({ item }: { item: typeof courses[0] }) => (
    <Card style={styles.courseCard}>
      <CardContent style={styles.courseContent}>
        <View style={styles.courseHeader}>
          <View style={styles.courseIcon}>
            <Ionicons name="book" size={28} color="#3b82f6" />
          </View>
          <Badge variant={item.progress === 100 ? 'success' : 'info'}>
            <Text style={styles.badgeText}>{item.level}</Text>
          </Badge>
        </View>

        <Text style={styles.courseTitle}>{item.title}</Text>

        <View style={styles.courseInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="book-outline" size={16} color="#5B5B5B" />
            <Text style={styles.infoText}>{item.modules} {t.modules}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#5B5B5B" />
            <Text style={styles.infoText}>{item.duration}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {item.completed}/{item.modules} {t.modules}
            </Text>
            <Text style={styles.progressPercent}>{item.progress}%</Text>
          </View>
          <Progress value={item.progress} />
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('EducationModule', { courseId: item.id })}
        >
          <Text style={styles.continueButtonText}>{t.continueCourse}</Text>
          <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
        </TouchableOpacity>
      </CardContent>
    </Card>
  );

  const renderVideo = ({ item }: { item: typeof videos[0] }) => (
    <TouchableOpacity style={styles.videoCard}>
      <View style={styles.videoThumbnail}>
        <Ionicons name="play-circle" size={48} color="#ffffff" />
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.videoMeta}>
          <Text style={styles.videoMetaText}>{item.duration}</Text>
          <Text style={styles.videoDot}>•</Text>
          <Text style={styles.videoMetaText}>{item.views} {t.views}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
          </View>
        </View>

        {/* Learning Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1/3</Text>
            <Text style={styles.statText}>{t.completed}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3.5h</Text>
            <Text style={styles.statText}>{t.thisMonth}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.certificateIcon}>
              <Ionicons name="ribbon" size={20} color="#f59e0b" />
              <Text style={styles.statNumber}>2</Text>
            </View>
            <Text style={styles.statText}>{t.certificates}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Course */}
        <Card style={styles.featuredCard}>
          <CardContent style={styles.featuredContent}>
            <Badge style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>{t.featured}</Text>
            </Badge>
            <Text style={styles.featuredTitle}>{t.featuredTitle}</Text>
            <Text style={styles.featuredDesc}>{t.featuredDesc}</Text>

            <View style={styles.featuredInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="book-outline" size={16} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.featuredInfoText}>10 {t.modules}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.featuredInfoText}>4 hours</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>{t.startLearning}</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* My Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.myCourses}</Text>
          <FlatList
            data={courses}
            renderItem={renderCourse}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.coursesList}
          />
        </View>

        {/* Video Library */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.videos}</Text>
          <FlatList
            data={videos}
            renderItem={renderVideo}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.videosList}
          />
        </View>
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
    backgroundColor: '#3b82f6',
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
  certificateIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  featuredCard: {
    marginBottom: 24,
    backgroundColor: '#a855f7',
    borderWidth: 0,
  },
  featuredContent: {
    padding: 16,
  },
  featuredBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  featuredDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  featuredInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  featuredInfoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  startButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#a855f7',
    fontSize: 16,
    fontWeight: '600',
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
  coursesList: {
    gap: 16,
  },
  courseCard: {
    marginBottom: 0,
  },
  courseContent: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 12,
  },
  courseInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  progressSection: {
    marginBottom: 12,
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
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E7F2F1',
    paddingTop: 12,
  },
  continueButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  videosList: {
    gap: 12,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoThumbnail: {
    width: 120,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  videoMetaText: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  videoDot: {
    color: '#D3D3D3',
  },
});
