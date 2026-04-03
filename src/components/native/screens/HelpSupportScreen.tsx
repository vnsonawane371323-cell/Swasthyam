import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Button } from '../Button';

interface HelpSupportScreenProps {
  navigation: any;
}

export function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
  const faqs = [
    { question: 'How do I log oil usage?', answer: 'Tap the "+" button on the home screen or connect your IoT device for automatic tracking.' },
    { question: 'What is the national 10% goal?', answer: 'India aims to reduce edible oil consumption by 10%. SwasthTel helps you contribute to this goal.' },
    { question: 'How does blockchain verification work?', answer: 'All partner certifications are stored on blockchain, making them tamper-proof and transparent.' },
  ];

  const contactOptions = [
    { icon: 'chatbubbles', title: 'Live Chat', subtitle: 'Available 9 AM - 6 PM' },
    { icon: 'mail', title: 'Email Support', subtitle: 'support@swasthtel.in' },
    { icon: 'call', title: 'Phone Support', subtitle: '+91 1800-SWASTH' },
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
              <View style={styles.titleRow}>
                <Ionicons name="help-circle" size={24} color="#fff" />
                <Text style={styles.headerTitle}>Help & Support</Text>
              </View>
              <Text style={styles.headerSubtitle}>We're here to help</Text>
            </View>
          </View>
        </View>
        <View style={styles.content}>
          <Card>
            <View style={styles.faqHeader}>
              <Ionicons name="book" size={20} color="#3b82f6" />
              <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            </View>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            ))}
          </Card>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {contactOptions.map((option, index) => (
            <Card key={index}>
              <View style={styles.contactRow}>
                <View style={styles.contactIcon}>
                  <Ionicons name={option.icon as any} size={24} color="#3b82f6" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Card>
          ))}
          <Card style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>Found a bug or have a suggestion?</Text>
            <Button onPress={() => {}} style={styles.feedbackButton}>
              <Text style={{color: '#fff', fontSize: 14, fontWeight: '500'}}>Submit Feedback</Text>
            </Button>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  header: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#dbeafe', marginTop: 2 },
  content: { padding: 16, gap: 16 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  faqTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  faqItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  faqAnswer: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactIcon: { width: 48, height: 48, backgroundColor: '#dbeafe', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  contactSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  feedbackCard: { backgroundColor: '#f0fdf4', alignItems: 'center' },
  feedbackText: { fontSize: 14, color: '#374151', marginBottom: 12, textAlign: 'center' },
  feedbackButton: { backgroundColor: '#16a34a' },
});
