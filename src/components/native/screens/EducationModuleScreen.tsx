import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Progress } from '../Progress';

interface EducationModuleScreenProps {
  navigation: any;
  route: { params?: { module?: any } };
}

export function EducationModuleScreen({ navigation, route }: EducationModuleScreenProps) {
  const moduleData = route.params?.module || {
    id: 1,
    title: 'Understanding Healthy Fats',
    description: 'Learn about different types of fats and their impact on health',
    duration: '15 min',
    progress: 60,
    lessons: 5,
    completedLessons: 3,
  };

  const lessons = [
    { id: 1, title: 'Introduction to Fats', duration: '3 min', completed: true, locked: false },
    { id: 2, title: 'Saturated vs Unsaturated', duration: '4 min', completed: true, locked: false },
    { id: 3, title: 'Trans Fats & Health', duration: '3 min', completed: true, locked: false },
    { id: 4, title: 'Choosing Healthy Oils', duration: '3 min', completed: false, locked: false },
    { id: 5, title: 'Practical Cooking Tips', duration: '2 min', completed: false, locked: false },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Badge variant="default" style={styles.durationBadge}>
                <Text style={{color: '#fff', fontSize: 12}}>{moduleData.duration}</Text>
              </Badge>
              <Text style={styles.headerTitle}>{moduleData.title}</Text>
            </View>
          </View>
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Module Progress</Text>
              <Text style={styles.progressValue}>{moduleData.progress}%</Text>
            </View>
            <Progress value={moduleData.progress} style={styles.progressBar} />
            <Text style={styles.progressSubtext}>{moduleData.completedLessons} of {moduleData.lessons} lessons complete</Text>
          </Card>
        </View>
        <View style={styles.content}>
          <Card>
            <View style={styles.aboutContent}>
              <Ionicons name="book" size={20} color="#f97316" />
              <View style={styles.aboutText}>
                <Text style={styles.aboutTitle}>About this Module</Text>
                <Text style={styles.aboutDesc}>{moduleData.description}</Text>
              </View>
            </View>
          </Card>
          <Text style={styles.sectionTitle}>Lessons</Text>
          {lessons.map(lesson => (
            <Card key={lesson.id} style={[styles.lessonCard, lesson.locked ? styles.lessonLocked : undefined]}>
              <View style={styles.lessonContent}>
                <View style={[styles.lessonIcon, lesson.completed ? styles.lessonCompleted : lesson.locked ? styles.lessonLockedIcon : styles.lessonActive]}>
                  <Ionicons name={lesson.completed ? 'checkmark-circle' : lesson.locked ? 'lock-closed' : 'play'} size={20} color={lesson.completed ? '#16a34a' : lesson.locked ? '#9ca3af' : '#f97316'} />
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                </View>
                {lesson.completed && <Badge variant="success"><Text style={{color: '#16a34a', fontSize: 12}}>Done</Text></Badge>}
              </View>
            </Card>
          ))}
          <Card style={styles.rewardCard}>
            <View style={styles.rewardContent}>
              <Ionicons name="trophy" size={20} color="#a855f7" />
              <View style={styles.rewardText}>
                <Text style={styles.rewardTitle}>Complete to Earn</Text>
                <Text style={styles.rewardDesc}>Finish all lessons and pass the quiz to earn <Text style={styles.rewardPoints}>100 points</Text> and a certificate!</Text>
              </View>
            </View>
          </Card>
          <Button onPress={() => {}} style={styles.continueButton}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={{color: '#fff', fontSize: 14, fontWeight: '500'}}>Continue Learning</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff5ed' },
  header: { backgroundColor: '#f97316', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, gap: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 8 },
  durationBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff', lineHeight: 28 },
  progressCard: { backgroundColor: 'rgba(255,255,255,0.2)' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, color: '#fed7aa' },
  progressValue: { fontSize: 14, fontWeight: '600', color: '#fff' },
  progressBar: { marginBottom: 8 },
  progressSubtext: { fontSize: 10, color: '#fed7aa' },
  content: { padding: 16, gap: 12 },
  aboutContent: { flexDirection: 'row', gap: 12 },
  aboutText: { flex: 1 },
  aboutTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  aboutDesc: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 8 },
  lessonCard: { marginBottom: 0 },
  lessonLocked: { opacity: 0.6 },
  lessonContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lessonIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  lessonCompleted: { backgroundColor: '#dcfce7' },
  lessonLockedIcon: { backgroundColor: '#f3f4f6' },
  lessonActive: { backgroundColor: '#fed7aa' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  lessonDuration: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  rewardCard: { backgroundColor: '#faf5ff', borderWidth: 1, borderColor: '#d8b4fe' },
  rewardContent: { flexDirection: 'row', gap: 12 },
  rewardText: { flex: 1 },
  rewardTitle: { fontSize: 16, fontWeight: '600', color: '#7c3aed', marginBottom: 4 },
  rewardDesc: { fontSize: 14, color: '#9333ea', lineHeight: 20 },
  rewardPoints: { fontWeight: '700' },
  continueButton: { backgroundColor: '#f97316' },
});
