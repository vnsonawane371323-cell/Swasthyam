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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Progress } from '../Progress';

const { width } = Dimensions.get('window');

interface ModuleDetailScreenProps {
  navigation: any;
  route: any;
}

// Lesson structure
const lessonsData = [
  {
    id: 1,
    sectionTitle: { en: 'Introduction to Oil Reduction', hi: 'तेल कमी का परिचय' },
    items: [
      {
        id: '1-1',
        type: 'video',
        title: { en: 'Why Reduce Oil Consumption?', hi: 'तेल की खपत क्यों कम करें?' },
        duration: '8:45',
        completed: true,
        locked: false
      },
      {
        id: '1-2',
        type: 'video',
        title: { en: 'Health Benefits of Low-Oil Diet', hi: 'कम तेल वाले आहार के स्वास्थ्य लाभ' },
        duration: '6:30',
        completed: true,
        locked: false
      },
      {
        id: '1-3',
        type: 'reading',
        title: { en: 'Understanding Healthy Fats', hi: 'स्वस्थ वसा को समझना' },
        duration: '5 min read',
        completed: true,
        locked: false
      }
    ]
  },
  {
    id: 2,
    sectionTitle: { en: 'Cooking Techniques', hi: 'खाना पकाने की तकनीक' },
    items: [
      {
        id: '2-1',
        type: 'video',
        title: { en: 'Low-Oil Cooking Methods', hi: 'कम तेल वाली खाना पकाने की विधियां' },
        duration: '12:20',
        completed: true,
        locked: false
      },
      {
        id: '2-2',
        type: 'video',
        title: { en: 'Steaming and Grilling Basics', hi: 'भाप और ग्रिलिंग की मूल बातें' },
        duration: '9:15',
        completed: false,
        locked: false
      },
      {
        id: '2-3',
        type: 'quiz',
        title: { en: 'Quiz: Cooking Techniques', hi: 'प्रश्नोत्तरी: खाना पकाने की तकनीक' },
        duration: '10 questions',
        completed: false,
        locked: false,
        score: null
      }
    ]
  },
  {
    id: 3,
    sectionTitle: { en: 'Practical Applications', hi: 'व्यावहारिक अनुप्रयोग' },
    items: [
      {
        id: '3-1',
        type: 'video',
        title: { en: 'Meal Planning for Low-Oil Diet', hi: 'कम तेल वाले आहार के लिए भोजन योजना' },
        duration: '10:40',
        completed: false,
        locked: false
      },
      {
        id: '3-2',
        type: 'reading',
        title: { en: 'Shopping Guide for Healthy Oils', hi: 'स्वस्थ तेलों के लिए खरीदारी गाइड' },
        duration: '8 min read',
        completed: false,
        locked: false
      }
    ]
  },
  {
    id: 4,
    sectionTitle: { en: 'Final Assessment', hi: 'अंतिम मूल्यांकन' },
    items: [
      {
        id: '4-1',
        type: 'quiz',
        title: { en: 'Final Quiz - Module Completion', hi: 'अंतिम प्रश्नोत्तरी - मॉड्यूल पूर्णता' },
        duration: '20 questions',
        completed: false,
        locked: true,
        score: null,
        passingScore: 70
      }
    ]
  }
];

export function ModuleDetailScreen({ navigation, route }: ModuleDetailScreenProps) {
  const [language] = useState('en');
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  
  const { module } = route.params || {};

  if (!module) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {language === 'hi' ? 'मॉड्यूल डेटा लोड हो रहा है...' : 'Loading module data...'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>
              {language === 'hi' ? 'वापस जाएं' : 'Go Back'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate stats
  const totalItems = lessonsData.reduce((acc, section) => acc + section.items.length, 0);
  const completedItems = lessonsData.reduce((acc, section) => 
    acc + section.items.filter(item => item.completed).length, 0
  );
  const progressPercentage = Math.round((completedItems / totalItems) * 100);

  const handleLessonPress = (item: any) => {
    if (item.locked) return;
    
    if (item.type === 'video') {
      navigation.navigate('VideoLesson', { lesson: item, module });
    } else if (item.type === 'quiz') {
      navigation.navigate('Quiz', { quiz: item, module });
    } else if (item.type === 'reading') {
      navigation.navigate('ReadingLesson', { lesson: item, module });
    }
  };

  const getItemIcon = (type: string, completed: boolean, locked: boolean) => {
    if (locked) return 'lock-closed';
    if (completed) return 'checkmark-circle';
    
    switch (type) {
      case 'video': return 'play-circle';
      case 'quiz': return 'help-circle';
      case 'reading': return 'document-text';
      default: return 'book';
    }
  };

  const getItemIconColor = (type: string, completed: boolean, locked: boolean) => {
    if (locked) return '#9ca3af';
    if (completed) return '#10b981';
    return '#3b82f6';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={module.color || ['#3b82f6', '#2563eb']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerContent}>
            <View style={styles.moduleIconLarge}>
              <Ionicons name={module.icon} size={32} color="#fff" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {language === 'hi' ? module.titleHi : module.title}
              </Text>
              <Text style={styles.headerDescription}>
                {language === 'hi' ? module.descriptionHi : module.description}
              </Text>
            </View>
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {language === 'hi' ? 'मॉड्यूल प्रगति' : 'Module Progress'}
              </Text>
              <Text style={styles.progressValue}>{progressPercentage}%</Text>
            </View>
            <Progress value={progressPercentage} style={styles.progressBar} />
            <View style={styles.progressFooter}>
              <Text style={styles.progressText}>
                {completedItems}/{totalItems} {language === 'hi' ? 'पाठ पूर्ण' : 'lessons completed'}
              </Text>
              {progressPercentage === 100 && (
                <Badge style={styles.completeBadge}>
                  <Text style={{ color: '#047857', fontSize: 14, fontWeight: '600' }}>🏆 Complete!</Text>
                </Badge>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="play-circle" size={20} color="#fff" />
              <Text style={styles.statValue}>{module.videos}</Text>
              <Text style={styles.statLabel}>
                {language === 'hi' ? 'वीडियो' : 'Videos'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color="#fff" />
              <Text style={styles.statValue}>{module.duration}</Text>
              <Text style={styles.statLabel}>
                {language === 'hi' ? 'अवधि' : 'Duration'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={20} color="#fff" />
              <Text style={styles.statValue}>{module.points}</Text>
              <Text style={styles.statLabel}>
                {language === 'hi' ? 'अंक' : 'Points'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Lessons Content */}
        <View style={styles.content}>
          <Text style={styles.contentTitle}>
            {language === 'hi' ? 'पाठ्यक्रम सामग्री' : 'Course Content'}
          </Text>

          {lessonsData.map((section, sectionIndex) => (
            <Card key={section.id} style={styles.sectionCard}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setExpandedSection(
                  expandedSection === sectionIndex ? null : sectionIndex
                )}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeaderLeft}>
                  <Text style={styles.sectionTitle}>
                    {section.sectionTitle[language === 'hi' ? 'hi' : 'en']}
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    {section.items.length} {language === 'hi' ? 'पाठ' : 'lessons'} • 
                    {section.items.filter(i => i.completed).length} {language === 'hi' ? 'पूर्ण' : 'completed'}
                  </Text>
                </View>
                <Ionicons 
                  name={expandedSection === sectionIndex ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#5B5B5B" 
                />
              </TouchableOpacity>

              {expandedSection === sectionIndex && (
                <View style={styles.lessonsContainer}>
                  {section.items.map((item, itemIndex) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.lessonItem,
                        item.locked && styles.lessonItemLocked,
                        itemIndex === section.items.length - 1 && styles.lessonItemLast
                      ]}
                      onPress={() => handleLessonPress(item)}
                      disabled={item.locked}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.lessonIcon,
                        item.completed && styles.lessonIconCompleted,
                        item.locked && styles.lessonIconLocked
                      ]}>
                        <Ionicons 
                          name={getItemIcon(item.type, item.completed, item.locked)} 
                          size={20} 
                          color={getItemIconColor(item.type, item.completed, item.locked)} 
                        />
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={[
                          styles.lessonTitle,
                          item.locked && styles.lessonTitleLocked
                        ]}>
                          {item.title[language === 'hi' ? 'hi' : 'en']}
                        </Text>
                        <Text style={styles.lessonDuration}>{item.duration}</Text>
                      </View>
                      {item.completed && (
                        <Badge style={styles.doneBadge}>
                          <Text style={{ color: '#065f46', fontSize: 11 }}>Done</Text>
                        </Badge>
                      )}
                      {item.locked && (
                        <Ionicons name="lock-closed" size={16} color="#9ca3af" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card>
          ))}

          {/* Certificate Section */}
          {progressPercentage === 100 && (
            <Card style={styles.certificateCard}>
              <LinearGradient
                colors={['#fef3c7', '#fde68a']}
                style={styles.certificateGradient}
              >
                <Ionicons name="trophy" size={40} color="#f59e0b" />
                <Text style={styles.certificateTitle}>
                  {language === 'hi' ? 'बधाई हो!' : 'Congratulations!'}
                </Text>
                <Text style={styles.certificateDescription}>
                  {language === 'hi' 
                    ? 'आपने यह मॉड्यूल पूरा कर लिया है'
                    : 'You\'ve completed this module'}
                </Text>
                <TouchableOpacity style={styles.certificateButton}>
                  <Ionicons name="download-outline" size={18} color="#fff" />
                  <Text style={styles.certificateButtonText}>
                    {language === 'hi' ? 'प्रमाणपत्र डाउनलोड करें' : 'Download Certificate'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </Card>
          )}
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#5B5B5B',
    marginBottom: 16,
  },
  backLink: {
    fontSize: 15,
    color: '#3b82f6',
    fontWeight: '500',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  moduleIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 28,
  },
  headerDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  progressBar: {
    marginBottom: 8,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  completeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 20,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 16,
  },
  sectionCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  lessonsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  lessonItemLast: {
    borderBottomWidth: 0,
  },
  lessonItemLocked: {
    opacity: 0.6,
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonIconCompleted: {
    backgroundColor: '#d1fae5',
  },
  lessonIconLocked: {
    backgroundColor: '#f3f4f6',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#040707',
    marginBottom: 4,
  },
  lessonTitleLocked: {
    color: '#9ca3af',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  doneBadge: {
    backgroundColor: '#d1fae5',
    marginRight: 8,
  },
  certificateCard: {
    marginTop: 8,
    padding: 0,
    overflow: 'hidden',
  },
  certificateGradient: {
    padding: 24,
    alignItems: 'center',
  },
  certificateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400e',
    marginTop: 12,
    marginBottom: 6,
  },
  certificateDescription: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 20,
  },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 6,
  },
  certificateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
