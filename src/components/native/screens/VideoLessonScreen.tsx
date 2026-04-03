import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../Card';
import { Badge } from '../Badge';

const { width, height } = Dimensions.get('window');

interface VideoLessonScreenProps {
  navigation: any;
  route: any;
}

// Sample lesson notes
const lessonNotes = [
  {
    time: '0:00',
    title: { en: 'Introduction', hi: 'परिचय' },
    content: { 
      en: 'Overview of oil consumption in Indian households and its health impact.',
      hi: 'भारतीय घरों में तेल की खपत और इसके स्वास्थ्य प्रभाव का अवलोकन।'
    }
  },
  {
    time: '2:30',
    title: { en: 'Health Risks', hi: 'स्वास्थ्य जोखिम' },
    content: { 
      en: 'Understanding cardiovascular diseases, obesity, and diabetes linked to high oil consumption.',
      hi: 'उच्च तेल की खपत से जुड़ी हृदय रोग, मोटापा और मधुमेह को समझना।'
    }
  },
  {
    time: '5:00',
    title: { en: 'Government Guidelines', hi: 'सरकारी दिशानिर्देश' },
    content: { 
      en: 'FSSAI recommendations for daily oil intake and the national 10% reduction goal.',
      hi: 'दैनिक तेल सेवन के लिए FSSAI की सिफारिशें और राष्ट्रीय 10% कटौती लक्ष्य।'
    }
  }
];

export function VideoLessonScreen({ navigation, route }: VideoLessonScreenProps) {
  const [language] = useState('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(525); // 8:45 in seconds
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const progressInterval = useRef<number | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { lesson, module } = route.params || {};

  useEffect(() => {
    if (!lesson || !module) {
      navigation.goBack();
    }
  }, [lesson, module]);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            setIsCompleted(true);
            return duration;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      pulseAnim.setValue(1);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, duration, playbackSpeed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressPress = (position: number) => {
    const newTime = Math.floor(duration * position);
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    setCurrentTime(prev => Math.max(0, Math.min(duration, prev + seconds)));
  };

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const progressPercentage = (currentTime / duration) * 100;

  if (!lesson || !module) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {language === 'hi' ? 'पाठ डेटा लोड हो रहा है...' : 'Loading lesson data...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Video Player */}
        <View style={styles.videoContainer}>
          {/* Header */}
          <View style={styles.videoHeader}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.videoBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Badge style={styles.moduleBadge}>
              <Text style={{ color: '#040707', fontSize: 12, fontWeight: '500' }}>
                {module.title[language === 'hi' ? 'hi' : 'en']}
              </Text>
            </Badge>
          </View>

          {/* Video Content */}
          <TouchableOpacity 
            style={styles.videoContent}
            onPress={togglePlay}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#1b4a5a', '#07A996']}
              style={styles.videoGradient}
            >
              {/* Animated background */}
              {isPlaying && (
                <Animated.View 
                  style={[
                    styles.pulseCircle,
                    {
                      transform: [{ scale: pulseAnim }],
                      opacity: pulseAnim.interpolate({
                        inputRange: [1, 1.2],
                        outputRange: [0.3, 0],
                      }),
                    }
                  ]}
                />
              )}

              {/* Play/Pause Icon */}
              <View style={styles.playIconContainer}>
                <Ionicons 
                  name={isPlaying ? 'pause' : 'play'} 
                  size={48} 
                  color="#fff" 
                />
              </View>

              {/* Lesson Title Overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.videoOverlay}
              >
                <Text style={styles.videoTitle}>
                  {lesson.title[language === 'hi' ? 'hi' : 'en']}
                </Text>
                <Text style={styles.videoDuration}>
                  {lesson.duration}
                </Text>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>

          {/* Video Controls */}
          <View style={styles.controls}>
            <View style={styles.progressContainer}>
              <TouchableOpacity
                style={styles.progressBar}
                onPress={(e) => {
                  const locationX = e.nativeEvent.locationX;
                  const barWidth = width;
                  const position = locationX / barWidth;
                  handleProgressPress(position);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.progressBackground}>
                  <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                </View>
              </TouchableOpacity>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>

            <View style={styles.controlButtons}>
              <TouchableOpacity onPress={() => skip(-10)} style={styles.controlButton}>
                <Ionicons name="play-back" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={togglePlay} style={styles.mainPlayButton}>
                <Ionicons 
                  name={isPlaying ? 'pause' : 'play'} 
                  size={32} 
                  color="#fff" 
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => skip(10)} style={styles.controlButton}>
                <Ionicons name="play-forward" size={24} color="#fff" />
              </TouchableOpacity>

              <View style={styles.spacer} />

              <TouchableOpacity 
                onPress={() => setShowSpeedMenu(!showSpeedMenu)} 
                style={styles.speedButton}
              >
                <Text style={styles.speedText}>{playbackSpeed}x</Text>
              </TouchableOpacity>
            </View>

            {showSpeedMenu && (
              <View style={styles.speedMenu}>
                {speeds.map((speed) => (
                  <TouchableOpacity
                    key={speed}
                    onPress={() => {
                      setPlaybackSpeed(speed);
                      setShowSpeedMenu(false);
                    }}
                    style={styles.speedMenuItem}
                  >
                    <Text style={[
                      styles.speedMenuText,
                      speed === playbackSpeed && styles.speedMenuTextActive
                    ]}>
                      {speed}x
                    </Text>
                    {speed === playbackSpeed && (
                      <Ionicons name="checkmark" size={18} color="#3b82f6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Completion Badge */}
          {isCompleted && (
            <View style={styles.completionBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.completionText}>
                {language === 'hi' ? 'पूर्ण' : 'Completed'}
              </Text>
            </View>
          )}
        </View>

        {/* Lesson Content */}
        <View style={styles.content}>
          {/* Lesson Info */}
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>
              {lesson.title[language === 'hi' ? 'hi' : 'en']}
            </Text>
            <View style={styles.lessonMeta}>
              <Text style={styles.lessonMetaText}>{lesson.duration}</Text>
              <Text style={styles.lessonMetaDot}>•</Text>
              <Text style={styles.lessonMetaText}>
                {module.title[language === 'hi' ? 'hi' : 'en']}
              </Text>
            </View>
          </View>

          {/* Lesson Notes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="book-outline" size={20} color="#040707" />
              <Text style={styles.sectionTitle}>
                {language === 'hi' ? 'पाठ नोट्स' : 'Lesson Notes'}
              </Text>
            </View>
            {lessonNotes.map((note, index) => (
              <Card key={index} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Badge style={styles.timeBadge}>
                    <Text style={{ color: '#5B5B5B', fontSize: 11 }}>{note.time}</Text>
                  </Badge>
                  <Text style={styles.noteTitle}>
                    {note.title[language === 'hi' ? 'hi' : 'en']}
                  </Text>
                </View>
                <Text style={styles.noteContent}>
                  {note.content[language === 'hi' ? 'hi' : 'en']}
                </Text>
              </Card>
            ))}
          </View>

          {/* Resources */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color="#040707" />
              <Text style={styles.sectionTitle}>
                {language === 'hi' ? 'डाउनलोड करने योग्य संसाधन' : 'Downloadable Resources'}
              </Text>
            </View>
            <TouchableOpacity style={styles.resourceCard}>
              <View style={styles.resourceInfo}>
                <Ionicons name="document" size={24} color="#3b82f6" />
                <View style={styles.resourceText}>
                  <Text style={styles.resourceTitle}>
                    {language === 'hi' ? 'पाठ प्रतिलेख' : 'Lesson Transcript'}
                  </Text>
                  <Text style={styles.resourceSize}>PDF • 2.4 MB</Text>
                </View>
              </View>
              <Ionicons name="download-outline" size={20} color="#5B5B5B" />
            </TouchableOpacity>
          </View>

          {/* Next Lesson Button */}
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.nextButtonText}>
              {isCompleted 
                ? (language === 'hi' ? 'अगला पाठ' : 'Next Lesson')
                : (language === 'hi' ? 'पाठ पर वापस जाएं' : 'Back to Lessons')
              }
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040707',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#5B5B5B',
  },
  videoContainer: {
    backgroundColor: '#000',
  },
  videoHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  videoBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoContent: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  videoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
  },
  playIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  videoDuration: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  controls: {
    backgroundColor: '#000',
    padding: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    marginBottom: 8,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    padding: 12,
  },
  mainPlayButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  spacer: {
    flex: 1,
  },
  speedButton: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  speedMenu: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  speedMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
    minWidth: 100,
  },
  speedMenuText: {
    fontSize: 14,
    color: '#040707',
  },
  speedMenuTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  completionBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  content: {
    backgroundColor: '#fafbfa',
    padding: 20,
  },
  lessonInfo: {
    marginBottom: 24,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#040707',
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMetaText: {
    fontSize: 13,
    color: '#5B5B5B',
  },
  lessonMetaDot: {
    fontSize: 13,
    color: '#5B5B5B',
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
  },
  noteCard: {
    marginBottom: 12,
    padding: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeBadge: {
    backgroundColor: '#eff6ff',
    fontSize: 11,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
  },
  noteContent: {
    fontSize: 13,
    color: '#5B5B5B',
    lineHeight: 20,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resourceText: {
    marginLeft: 12,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#040707',
    marginBottom: 2,
  },
  resourceSize: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b4a5a',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
