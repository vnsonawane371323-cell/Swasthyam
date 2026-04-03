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

interface QuizScreenProps {
  navigation: any;
  route: any;
}

// Quiz questions
const quizQuestions = [
  {
    id: 1,
    question: {
      en: 'What is the recommended daily oil intake per person according to FSSAI?',
      hi: 'FSSAI के अनुसार प्रति व्यक्ति अनुशंसित दैनिक तेल सेवन क्या है?'
    },
    options: [
      { id: 'a', text: { en: '10 ml', hi: '10 मिली' } },
      { id: 'b', text: { en: '20 ml', hi: '20 मिली' } },
      { id: 'c', text: { en: '30 ml', hi: '30 मिली' } },
      { id: 'd', text: { en: '40 ml', hi: '40 मिली' } }
    ],
    correctAnswer: 'b',
    explanation: {
      en: 'FSSAI recommends 20ml of oil per person per day for a healthy diet.',
      hi: 'FSSAI स्वस्थ आहार के लिए प्रति व्यक्ति प्रति दिन 20 मिली तेल की सिफारिश करता है।'
    }
  },
  {
    id: 2,
    question: {
      en: 'Which cooking method uses the least amount of oil?',
      hi: 'कौन सी खाना पकाने की विधि सबसे कम तेल का उपयोग करती है?'
    },
    options: [
      { id: 'a', text: { en: 'Deep frying', hi: 'डीप फ्राइंग' } },
      { id: 'b', text: { en: 'Shallow frying', hi: 'शैलो फ्राइंग' } },
      { id: 'c', text: { en: 'Steaming', hi: 'भाप में पकाना' } },
      { id: 'd', text: { en: 'Sautéing', hi: 'सौटेइंग' } }
    ],
    correctAnswer: 'c',
    explanation: {
      en: 'Steaming requires no oil and retains maximum nutrients in food.',
      hi: 'भाप में पकाने के लिए तेल की आवश्यकता नहीं होती है और भोजन में अधिकतम पोषक तत्व बरकरार रहते हैं।'
    }
  },
  {
    id: 3,
    question: {
      en: 'What percentage of oil reduction is the national goal in India?',
      hi: 'भारत में राष्ट्रीय लक्ष्य तेल में कितने प्रतिशत की कमी है?'
    },
    options: [
      { id: 'a', text: { en: '5%', hi: '5%' } },
      { id: 'b', text: { en: '10%', hi: '10%' } },
      { id: 'c', text: { en: '15%', hi: '15%' } },
      { id: 'd', text: { en: '20%', hi: '20%' } }
    ],
    correctAnswer: 'b',
    explanation: {
      en: 'The national goal is to reduce oil consumption by 10% to improve public health.',
      hi: 'सार्वजनिक स्वास्थ्य में सुधार के लिए तेल की खपत में 10% की कमी करना राष्ट्रीय लक्ष्य है।'
    }
  },
  {
    id: 4,
    question: {
      en: 'Which type of fat is considered healthiest?',
      hi: 'किस प्रकार की वसा को सबसे स्वास्थ्यप्रद माना जाता है?'
    },
    options: [
      { id: 'a', text: { en: 'Saturated fats', hi: 'संतृप्त वसा' } },
      { id: 'b', text: { en: 'Trans fats', hi: 'ट्रांस वसा' } },
      { id: 'c', text: { en: 'Unsaturated fats', hi: 'असंतृप्त वसा' } },
      { id: 'd', text: { en: 'Hydrogenated fats', hi: 'हाइड्रोजनीकृत वसा' } }
    ],
    correctAnswer: 'c',
    explanation: {
      en: 'Unsaturated fats (found in nuts, fish, olive oil) are heart-healthy and recommended.',
      hi: 'असंतृप्त वसा (नट्स, मछली, जैतून के तेल में पाई जाती है) हृदय के लिए स्वस्थ और अनुशंसित हैं।'
    }
  },
  {
    id: 5,
    question: {
      en: 'How can you reduce oil absorption when frying?',
      hi: 'तलते समय तेल के अवशोषण को कैसे कम किया जा सकता है?'
    },
    options: [
      { id: 'a', text: { en: 'Use low temperature', hi: 'कम तापमान का उपयोग करें' } },
      { id: 'b', text: { en: 'Use high temperature', hi: 'उच्च तापमान का उपयोग करें' } },
      { id: 'c', text: { en: 'Add water to oil', hi: 'तेल में पानी मिलाएं' } },
      { id: 'd', text: { en: 'Cover the pan completely', hi: 'पैन को पूरी तरह ढक दें' } }
    ],
    correctAnswer: 'b',
    explanation: {
      en: 'High temperature creates a seal on food surface, reducing oil absorption.',
      hi: 'उच्च तापमान भोजन की सतह पर एक सील बनाता है, जिससे तेल का अवशोषण कम होता है।'
    }
  },
  {
    id: 6,
    question: {
      en: 'What is a healthy alternative to deep frying?',
      hi: 'डीप फ्राइंग का स्वस्थ विकल्प क्या है?'
    },
    options: [
      { id: 'a', text: { en: 'Air frying', hi: 'एयर फ्राइंग' } },
      { id: 'b', text: { en: 'Double frying', hi: 'डबल फ्राइंग' } },
      { id: 'c', text: { en: 'Butter frying', hi: 'बटर फ्राइंग' } },
      { id: 'd', text: { en: 'Oil bathing', hi: 'ऑयल बैथिंग' } }
    ],
    correctAnswer: 'a',
    explanation: {
      en: 'Air frying uses hot air circulation instead of oil, making it a healthier option.',
      hi: 'एयर फ्राइंग तेल के बजाय गर्म हवा के संचलन का उपयोग करता है, जो इसे एक स्वस्थ विकल्प बनाता है।'
    }
  },
  {
    id: 7,
    question: {
      en: 'Which Indian cooking method traditionally uses minimal oil?',
      hi: 'कौन सी भारतीय खाना पकाने की विधि पारंपरिक रूप से न्यूनतम तेल का उपयोग करती है?'
    },
    options: [
      { id: 'a', text: { en: 'Tadka', hi: 'तड़का' } },
      { id: 'b', text: { en: 'Dum cooking', hi: 'दम पुख्त' } },
      { id: 'c', text: { en: 'Bhuna', hi: 'भुना' } },
      { id: 'd', text: { en: 'Pakora making', hi: 'पकोड़ा बनाना' } }
    ],
    correctAnswer: 'b',
    explanation: {
      en: 'Dum cooking (slow cooking in sealed pot) uses steam and minimal oil for flavor.',
      hi: 'दम पुख्त (सील किए गए बर्तन में धीमी कुकिंग) स्वाद के लिए भाप और न्यूनतम तेल का उपयोग करता है।'
    }
  },
  {
    id: 8,
    question: {
      en: 'What should you do with leftover cooking oil?',
      hi: 'बचे हुए खाना पकाने के तेल का क्या करना चाहिए?'
    },
    options: [
      { id: 'a', text: { en: 'Pour down the sink', hi: 'सिंक में डालें' } },
      { id: 'b', text: { en: 'Reuse multiple times', hi: 'कई बार पुन: उपयोग करें' } },
      { id: 'c', text: { en: 'Dispose properly & avoid reuse', hi: 'सही तरीके से निपटान करें और पुन: उपयोग से बचें' } },
      { id: 'd', text: { en: 'Mix with fresh oil', hi: 'ताजे तेल के साथ मिलाएं' } }
    ],
    correctAnswer: 'c',
    explanation: {
      en: 'Used oil breaks down and forms harmful compounds. Proper disposal is important.',
      hi: 'इस्तेमाल किया गया तेल टूट जाता है और हानिकारक यौगिक बनाता है। उचित निपटान महत्वपूर्ण है।'
    }
  },
  {
    id: 9,
    question: {
      en: 'Which nutrient is most affected by excessive oil consumption?',
      hi: 'अत्यधिक तेल की खपत से कौन सा पोषक तत्व सबसे अधिक प्रभावित होता है?'
    },
    options: [
      { id: 'a', text: { en: 'Protein', hi: 'प्रोटीन' } },
      { id: 'b', text: { en: 'Carbohydrates', hi: 'कार्बोहाइड्रेट' } },
      { id: 'c', text: { en: 'Fats (imbalance)', hi: 'वसा (असंतुलन)' } },
      { id: 'd', text: { en: 'Vitamins', hi: 'विटामिन' } }
    ],
    correctAnswer: 'c',
    explanation: {
      en: 'Excessive oil creates fat imbalance, leading to health issues like obesity and heart disease.',
      hi: 'अत्यधिक तेल वसा असंतुलन पैदा करता है, जिससे मोटापा और हृदय रोग जैसी स्वास्थ्य समस्याएं होती हैं।'
    }
  },
  {
    id: 10,
    question: {
      en: 'What is the smoke point of oil?',
      hi: 'तेल का स्मोक प्वाइंट क्या है?'
    },
    options: [
      { id: 'a', text: { en: 'When oil starts to smell', hi: 'जब तेल से गंध आने लगे' } },
      { id: 'b', text: { en: 'When oil starts to smoke', hi: 'जब तेल से धुआं निकलने लगे' } },
      { id: 'c', text: { en: 'When oil becomes thick', hi: 'जब तेल गाढ़ा हो जाए' } },
      { id: 'd', text: { en: 'When oil changes color', hi: 'जब तेल रंग बदल दे' } }
    ],
    correctAnswer: 'b',
    explanation: {
      en: 'Smoke point is the temperature at which oil begins to smoke and break down, creating harmful compounds.',
      hi: 'स्मोक प्वाइंट वह तापमान है जिस पर तेल धुआं देना शुरू कर देता है और टूटने लगता है, जिससे हानिकारक यौगिक बनते हैं।'
    }
  }
];

export function QuizScreen({ navigation, route }: QuizScreenProps) {
  const [language] = useState('en');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; selected: string; correct: boolean }[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const { quiz, module } = route.params || {};

  if (!quiz || !module) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {language === 'hi' ? 'प्रश्नोत्तरी डेटा लोड हो रहा है...' : 'Loading quiz data...'}
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

  const question = quizQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleAnswerSelect = (optionId: string) => {
    if (showExplanation) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === question.correctAnswer;
    setAnswers([...answers, {
      questionId: question.id,
      selected: selectedAnswer,
      correct: isCorrect
    }]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setQuizCompleted(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setQuizCompleted(false);
  };

  const correctAnswersCount = answers.filter(a => a.correct).length;
  const scorePercentage = Math.round((correctAnswersCount / quizQuestions.length) * 100);
  const passed = scorePercentage >= 70;

  if (quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={passed ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
            style={styles.resultsHeader}
          >
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.resultsIconContainer}>
              <Ionicons 
                name={passed ? 'trophy' : 'sad-outline'} 
                size={64} 
                color="#fff" 
              />
            </View>

            <Text style={styles.resultsTitle}>
              {passed 
                ? (language === 'hi' ? 'बधाई हो!' : 'Congratulations!')
                : (language === 'hi' ? 'अधिक प्रयास की आवश्यकता है' : 'Need More Practice')
              }
            </Text>

            <Text style={styles.resultsScore}>{scorePercentage}%</Text>

            <Text style={styles.resultsSubtitle}>
              {correctAnswersCount}/{quizQuestions.length} {language === 'hi' ? 'सही उत्तर' : 'correct answers'}
            </Text>

            {passed && (
              <View style={styles.pointsBadge}>
                <Ionicons name="star" size={20} color="#fbbf24" />
                <Text style={styles.pointsText}>
                  +{module.points} {language === 'hi' ? 'अंक अर्जित' : 'Points Earned'}
                </Text>
              </View>
            )}
          </LinearGradient>

          <View style={styles.content}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {language === 'hi' ? 'परिणाम सारांश' : 'Results Summary'}
              </Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {language === 'hi' ? 'कुल प्रश्न' : 'Total Questions'}
                </Text>
                <Text style={styles.summaryValue}>{quizQuestions.length}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {language === 'hi' ? 'सही उत्तर' : 'Correct Answers'}
                </Text>
                <Text style={[styles.summaryValue, styles.correctText]}>{correctAnswersCount}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {language === 'hi' ? 'गलत उत्तर' : 'Wrong Answers'}
                </Text>
                <Text style={[styles.summaryValue, styles.wrongText]}>
                  {quizQuestions.length - correctAnswersCount}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {language === 'hi' ? 'स्कोर' : 'Score'}
                </Text>
                <Text style={[
                  styles.summaryValue, 
                  passed ? styles.correctText : styles.wrongText
                ]}>
                  {scorePercentage}%
                </Text>
              </View>
            </Card>

            {passed ? (
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={() => navigation.navigate('ModuleDetail', { module })}
              >
                <Text style={styles.continueButtonText}>
                  {language === 'hi' ? 'जारी रखें' : 'Continue to Next Lesson'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.retakeButton}
                onPress={handleRetakeQuiz}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retakeButtonText}>
                  {language === 'hi' ? 'फिर से प्रयास करें' : 'Retake Quiz'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.reviewButtonText}>
                {language === 'hi' ? 'पाठों की समीक्षा करें' : 'Review Lessons'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Badge style={styles.questionBadge}>
              <Text style={{ color: '#040707', fontSize: 12, fontWeight: '600' }}>
                {`${currentQuestion + 1}/${quizQuestions.length}`}
              </Text>
            </Badge>
          </View>

          <Progress value={progress} style={styles.headerProgress} />

          <Text style={styles.quizTitle}>
            {quiz.title[language === 'hi' ? 'hi' : 'en']}
          </Text>
        </LinearGradient>

        {/* Question */}
        <View style={styles.content}>
          <Card style={styles.questionCard}>
            <Text style={styles.questionNumber}>
              {language === 'hi' ? 'प्रश्न' : 'Question'} {currentQuestion + 1}
            </Text>
            <Text style={styles.questionText}>
              {question.question[language === 'hi' ? 'hi' : 'en']}
            </Text>
          </Card>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = option.id === question.correctAnswer;
              const showResult = showExplanation;

              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleAnswerSelect(option.id)}
                  disabled={showExplanation}
                  activeOpacity={0.7}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    showResult && isCorrect && styles.optionCardCorrect,
                    showResult && isSelected && !isCorrect && styles.optionCardWrong,
                  ]}
                >
                  <View style={[
                    styles.optionRadio,
                    isSelected && styles.optionRadioSelected,
                    showResult && isCorrect && styles.optionRadioCorrect,
                    showResult && isSelected && !isCorrect && styles.optionRadioWrong,
                  ]}>
                    {showResult && isCorrect && (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <Ionicons name="close" size={20} color="#fff" />
                    )}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                    showResult && isCorrect && styles.optionTextCorrect,
                  ]}>
                    {option.text[language === 'hi' ? 'hi' : 'en']}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation */}
          {showExplanation && (
            <Card style={styles.explanationCard}>
              <View style={styles.explanationHeader}>
                <Ionicons 
                  name={selectedAnswer === question.correctAnswer ? 'checkmark-circle' : 'information-circle'} 
                  size={24} 
                  color={selectedAnswer === question.correctAnswer ? '#10b981' : '#3b82f6'} 
                />
                <Text style={styles.explanationTitle}>
                  {language === 'hi' ? 'व्याख्या' : 'Explanation'}
                </Text>
              </View>
              <Text style={styles.explanationText}>
                {question.explanation[language === 'hi' ? 'hi' : 'en']}
              </Text>
            </Card>
          )}

          {/* Action Button */}
          {!showExplanation ? (
            <TouchableOpacity 
              style={[
                styles.submitButton,
                !selectedAnswer && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitAnswer}
              disabled={!selectedAnswer}
            >
              <Text style={styles.submitButtonText}>
                {language === 'hi' ? 'उत्तर जमा करें' : 'Submit Answer'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNextQuestion}
            >
              <Text style={styles.nextButtonText}>
                {isLastQuestion 
                  ? (language === 'hi' ? 'परिणाम देखें' : 'View Results')
                  : (language === 'hi' ? 'अगला प्रश्न' : 'Next Question')
                }
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
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
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerProgress: {
    marginBottom: 16,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  questionCard: {
    padding: 20,
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
  },
  optionCardCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  optionCardWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#8b5cf6',
  },
  optionRadioCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
  },
  optionRadioWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#ef4444',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#040707',
    lineHeight: 22,
  },
  optionTextSelected: {
    fontWeight: '500',
    color: '#7c3aed',
  },
  optionTextCorrect: {
    fontWeight: '500',
    color: '#059669',
  },
  explanationCard: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#eff6ff',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#040707',
  },
  explanationText: {
    fontSize: 14,
    color: '#5B5B5B',
    lineHeight: 21,
  },
  submitButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultsHeader: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  resultsIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  resultsScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 6,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  summaryCard: {
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#5B5B5B',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
  },
  correctText: {
    color: '#10b981',
  },
  wrongText: {
    color: '#ef4444',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  reviewButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  reviewButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5B5B5B',
  },
});
