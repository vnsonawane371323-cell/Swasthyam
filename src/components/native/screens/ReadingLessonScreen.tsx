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

const { width } = Dimensions.get('window');

interface ReadingLessonScreenProps {
  navigation: any;
  route: any;
}

// Sample reading content
const readingContent = {
  introduction: {
    en: 'Understanding healthy fats is crucial for maintaining a balanced diet and good health. Not all fats are created equal, and knowing the difference can help you make better dietary choices.',
    hi: 'स्वस्थ वसा को समझना संतुलित आहार और अच्छे स्वास्थ्य को बनाए रखने के लिए महत्वपूर्ण है। सभी वसा समान नहीं बनाई जाती हैं, और अंतर जानने से आप बेहतर आहार विकल्प चुन सकते हैं।'
  },
  sections: [
    {
      title: { en: 'Types of Fats', hi: 'वसा के प्रकार' },
      content: {
        en: 'There are four main types of dietary fats: saturated fats, trans fats, monounsaturated fats, and polyunsaturated fats. Each type has different effects on your health.',
        hi: 'आहार वसा के चार मुख्य प्रकार हैं: संतृप्त वसा, ट्रांस वसा, मोनोअनसैचुरेटेड वसा, और पॉलीअनसैचुरेटेड वसा। प्रत्येक प्रकार आपके स्वास्थ्य पर अलग प्रभाव डालता है।'
      },
      points: [
        {
          en: 'Saturated fats: Found in animal products and tropical oils',
          hi: 'संतृप्त वसा: पशु उत्पादों और उष्णकटिबंधीय तेलों में पाई जाती है'
        },
        {
          en: 'Trans fats: Created through hydrogenation, avoid these',
          hi: 'ट्रांस वसा: हाइड्रोजनीकरण के माध्यम से बनाई जाती है, इनसे बचें'
        },
        {
          en: 'Monounsaturated fats: Found in olive oil, avocados, nuts',
          hi: 'मोनोअनसैचुरेटेड वसा: जैतून का तेल, एवोकैडो, नट्स में पाई जाती है'
        },
        {
          en: 'Polyunsaturated fats: Found in fish, flaxseeds, walnuts',
          hi: 'पॉलीअनसैचुरेटेड वसा: मछली, अलसी, अखरोट में पाई जाती है'
        }
      ]
    },
    {
      title: { en: 'Health Benefits', hi: 'स्वास्थ्य लाभ' },
      content: {
        en: 'Healthy fats, particularly unsaturated fats, provide numerous benefits including improved heart health, better brain function, and reduced inflammation.',
        hi: 'स्वस्थ वसा, विशेष रूप से असंतृप्त वसा, कई लाभ प्रदान करती है जिसमें बेहतर हृदय स्वास्थ्य, बेहतर मस्तिष्क कार्य और कम सूजन शामिल है।'
      }
    },
    {
      title: { en: 'FSSAI Recommendations', hi: 'FSSAI की सिफारिशें' },
      content: {
        en: 'The Food Safety and Standards Authority of India (FSSAI) recommends limiting total fat intake to 20-30% of total daily calories, with emphasis on choosing healthier fat sources.',
        hi: 'भारतीय खाद्य सुरक्षा और मानक प्राधिकरण (FSSAI) कुल दैनिक कैलोरी के 20-30% तक कुल वसा का सेवन सीमित करने की सिफारिश करता है, स्वस्थ वसा स्रोतों को चुनने पर जोर देते हुए।'
      }
    },
    {
      title: { en: 'Practical Tips', hi: 'व्यावहारिक सुझाव' },
      content: {
        en: 'Making small changes in your diet can have a big impact on your health. Here are some practical ways to incorporate healthier fats:',
        hi: 'अपने आहार में छोटे बदलाव करने से आपके स्वास्थ्य पर बड़ा प्रभाव पड़ सकता है। यहां स्वस्थ वसा को शामिल करने के कुछ व्यावहारिक तरीके हैं:'
      },
      points: [
        {
          en: 'Use olive oil or rice bran oil for cooking instead of saturated fats',
          hi: 'संतृप्त वसा के बजाय खाना पकाने के लिए जैतून का तेल या चावल की भूसी का तेल उपयोग करें'
        },
        {
          en: 'Include nuts and seeds in your daily diet',
          hi: 'अपने दैनिक आहार में नट्स और बीज शामिल करें'
        },
        {
          en: 'Eat fatty fish like salmon twice a week',
          hi: 'सप्ताह में दो बार सैल्मन जैसी वसायुक्त मछली खाएं'
        },
        {
          en: 'Avoid processed foods high in trans fats',
          hi: 'ट्रांस वसा में उच्च प्रसंस्कृत खाद्य पदार्थों से बचें'
        }
      ]
    }
  ],
  conclusion: {
    en: 'Remember, fats are an essential part of a healthy diet. The key is choosing the right types and consuming them in moderation. By making informed choices, you can enjoy the benefits of healthy fats while maintaining your overall health.',
    hi: 'याद रखें, वसा एक स्वस्थ आहार का एक आवश्यक हिस्सा है। कुंजी सही प्रकार चुनना और उन्हें मॉडरेशन में उपभोग करना है। सूचित विकल्प बनाकर, आप अपने समग्र स्वास्थ्य को बनाए रखते हुए स्वस्थ वसा के लाभों का आनंद ले सकते हैं।'
  }
};

export function ReadingLessonScreen({ navigation, route }: ReadingLessonScreenProps) {
  const [language] = useState('en');
  const [isCompleted, setIsCompleted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const { lesson, module } = route.params || {};

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

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const progress = (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100;
    setReadingProgress(Math.min(progress, 100));
    
    if (progress > 80 && !isCompleted) {
      setIsCompleted(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
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
          {isCompleted && (
            <Badge style={styles.completedBadge}>
              <Text style={{ color: '#065f46', fontSize: 12, fontWeight: '600' }}>
                {language === 'hi' ? 'पूर्ण' : 'Completed'}
              </Text>
            </Badge>
          )}
        </View>

        <View style={styles.headerContent}>
          <View style={styles.readingIcon}>
            <Ionicons name="book-outline" size={28} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {lesson.title[language === 'hi' ? 'hi' : 'en']}
            </Text>
            <Text style={styles.headerDuration}>{lesson.duration}</Text>
          </View>
        </View>

        {/* Reading Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${readingProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(readingProgress)}% {language === 'hi' ? 'पढ़ा गया' : 'read'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Introduction */}
          <Card style={styles.section}>
            <Text style={styles.introText}>
              {readingContent.introduction[language === 'hi' ? 'hi' : 'en']}
            </Text>
          </Card>

          {/* Content Sections */}
          {readingContent.sections.map((section, index) => (
            <Card key={index} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.sectionTitle}>
                  {section.title[language === 'hi' ? 'hi' : 'en']}
                </Text>
              </View>

              <Text style={styles.sectionContent}>
                {section.content[language === 'hi' ? 'hi' : 'en']}
              </Text>

              {section.points && (
                <View style={styles.pointsContainer}>
                  {section.points.map((point, pointIndex) => (
                    <View key={pointIndex} style={styles.pointItem}>
                      <View style={styles.pointDot} />
                      <Text style={styles.pointText}>
                        {point[language === 'hi' ? 'hi' : 'en']}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          ))}

          {/* Conclusion */}
          <Card style={[styles.section, styles.conclusionSection]}>
            <View style={styles.conclusionHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.conclusionTitle}>
                {language === 'hi' ? 'निष्कर्ष' : 'Key Takeaways'}
              </Text>
            </View>
            <Text style={styles.conclusionText}>
              {readingContent.conclusion[language === 'hi' ? 'hi' : 'en']}
            </Text>
          </Card>

          {/* Resources */}
          <Card style={styles.resourcesSection}>
            <View style={styles.resourcesHeader}>
              <Ionicons name="download-outline" size={20} color="#040707" />
              <Text style={styles.resourcesTitle}>
                {language === 'hi' ? 'संसाधन डाउनलोड करें' : 'Download Resources'}
              </Text>
            </View>
            <TouchableOpacity style={styles.downloadButton}>
              <Ionicons name="document-text" size={20} color="#3b82f6" />
              <Text style={styles.downloadButtonText}>
                {language === 'hi' ? 'PDF संस्करण' : 'PDF Version'}
              </Text>
              <View style={styles.downloadButtonIcon}>
                <Ionicons name="download-outline" size={16} color="#5B5B5B" />
              </View>
            </TouchableOpacity>
          </Card>

          {/* Next Lesson Button */}
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={() => {
              setIsCompleted(true);
              navigation.goBack();
            }}
          >
            <Text style={styles.nextButtonText}>
              {isCompleted 
                ? (language === 'hi' ? 'अगला पाठ' : 'Next Lesson')
                : (language === 'hi' ? 'पूर्ण के रूप में चिह्नित करें' : 'Mark as Complete')
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
    backgroundColor: '#fafbfa',
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
  header: {
    paddingTop: 16,
    paddingBottom: 20,
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
  completedBadge: {
    backgroundColor: '#d1fae5',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  readingIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    lineHeight: 24,
  },
  headerDuration: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    color: '#040707',
    lineHeight: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
  },
  sectionContent: {
    fontSize: 15,
    color: '#5B5B5B',
    lineHeight: 24,
    marginBottom: 16,
  },
  pointsContainer: {
    gap: 12,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginTop: 8,
    marginRight: 12,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    color: '#5B5B5B',
    lineHeight: 22,
  },
  conclusionSection: {
    backgroundColor: '#f0fdf4',
  },
  conclusionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  conclusionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#059669',
  },
  conclusionText: {
    fontSize: 15,
    color: '#065f46',
    lineHeight: 24,
  },
  resourcesSection: {
    padding: 16,
    marginBottom: 16,
  },
  resourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resourcesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#040707',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  downloadButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#040707',
    marginLeft: 8,
  },
  downloadButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
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
