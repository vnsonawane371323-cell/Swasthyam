import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface MedicalHistoryScreenProps {
  onNext: (data: any) => void;
  onSkip: () => void;
  onBack: () => void;
  language: string;
  userData: any;
}

const medicalConditions = [
  { id: 'diabetes', name: 'Diabetes', hasLevels: true },
  { id: 'hypertension', name: 'High Blood Pressure', hasLevels: true },
  { id: 'heart-disease', name: 'Heart Disease', hasLevels: true },
  { id: 'cholesterol', name: 'High Cholesterol', hasLevels: true },
  { id: 'obesity', name: 'Obesity', hasLevels: true },
  { id: 'thyroid', name: 'Thyroid Issues', hasLevels: true },
  { id: 'kidney-disease', name: 'Kidney Disease', hasLevels: true },
  { id: 'liver-disease', name: 'Liver Disease', hasLevels: true },
  { id: 'arthritis', name: 'Arthritis', hasLevels: false },
  { id: 'asthma', name: 'Asthma', hasLevels: false },
];

export function MedicalHistoryScreen({ onNext, onSkip, onBack, language, userData }: MedicalHistoryScreenProps) {
  const [selectedConditions, setSelectedConditions] = useState<{[key: string]: string}>({});
  const [reportType, setReportType] = useState('');

  const bmi = userData?.screen1?.bmi;

  const toggleCondition = (conditionId: string) => {
    setSelectedConditions(prev => {
      const newConditions = { ...prev };
      if (newConditions[conditionId]) {
        delete newConditions[conditionId];
      } else {
        newConditions[conditionId] = 'mild';
      }
      return newConditions;
    });
  };

  const setSeverity = (conditionId: string, severity: string) => {
    setSelectedConditions(prev => ({
      ...prev,
      [conditionId]: severity
    }));
  };

  const handleContinue = () => {
    onNext({ 
      medicalConditions: selectedConditions, 
      reportType 
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#5B5B5B" />
          </TouchableOpacity>
          <Text style={styles.stepText}>Step 2 of 6</Text>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33.33%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Medical History</Text>
        <Text style={styles.subtitle}>
          Select any conditions you have to calculate your ideal oil consumption
        </Text>

        {/* BMI Info */}
        {bmi && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#fcaf56" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>
                Your BMI: <Text style={styles.infoBold}>{bmi.toFixed(1)}</Text>
              </Text>
              <Text style={styles.infoSubtext}>
                Medical history helps us personalize your oil consumption recommendations
              </Text>
            </View>
          </View>
        )}

        {/* Conditions List */}
        <View style={styles.conditionsList}>
          {medicalConditions.map((condition) => (
            <View key={condition.id} style={styles.conditionCard}>
              <TouchableOpacity
                style={styles.conditionHeader}
                onPress={() => toggleCondition(condition.id)}
              >
                <View style={styles.conditionLeft}>
                  <View style={[
                    styles.checkbox,
                    selectedConditions[condition.id] && styles.checkboxChecked
                  ]}>
                    {selectedConditions[condition.id] && (
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    )}
                  </View>
                  <Text style={styles.conditionName}>{condition.name}</Text>
                </View>
                {condition.hasLevels && selectedConditions[condition.id] && (
                  <Ionicons name="chevron-down" size={20} color="#5B5B5B" />
                )}
              </TouchableOpacity>

              {/* Severity Levels */}
              {condition.hasLevels && selectedConditions[condition.id] && (
                <View style={styles.severityContainer}>
                  <Text style={styles.severityLabel}>Severity Level:</Text>
                  <View style={styles.severityButtons}>
                    {['mild', 'moderate', 'severe'].map((severity) => (
                      <TouchableOpacity
                        key={severity}
                        style={[
                          styles.severityButton,
                          selectedConditions[condition.id] === severity && styles.severityButtonActive
                        ]}
                        onPress={() => setSeverity(condition.id, severity)}
                      >
                        <Text style={[
                          styles.severityButtonText,
                          selectedConditions[condition.id] === severity && styles.severityButtonTextActive
                        ]}>
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Report Type Picker */}
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>Medical Report Type (Optional)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={reportType}
                onValueChange={setReportType}
                style={styles.picker}
              >
                <Picker.Item label="Select report type" value="" />
                <Picker.Item label="Blood Test" value="blood-test" />
                <Picker.Item label="Diabetes Report" value="diabetes" />
                <Picker.Item label="Lipid Profile" value="lipid-profile" />
                <Picker.Item label="Liver Function Test" value="liver-function" />
                <Picker.Item label="Kidney Function Test" value="kidney-function" />
                <Picker.Item label="Thyroid Test" value="thyroid" />
                <Picker.Item label="General Health Checkup" value="general" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
            <Text style={styles.reportNote}>
              Note: File upload available in full version
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#E7F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E7F2F1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1b4a5a',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#040707',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#5B5B5B',
    marginBottom: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(252, 175, 86, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252, 175, 86, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    color: '#040707',
    marginBottom: 4,
  },
  infoBold: {
    fontWeight: '600',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  conditionsList: {
    gap: 12,
  },
  conditionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    overflow: 'hidden',
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  conditionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E7F2F1',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1b4a5a',
    borderColor: '#1b4a5a',
  },
  conditionName: {
    fontSize: 16,
    color: '#040707',
  },
  severityContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E7F2F1',
  },
  severityLabel: {
    fontSize: 12,
    color: '#5B5B5B',
    marginBottom: 8,
  },
  severityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E7F2F1',
    borderRadius: 8,
    alignItems: 'center',
  },
  severityButtonActive: {
    backgroundColor: '#1b4a5a',
  },
  severityButtonText: {
    fontSize: 14,
    color: '#5B5B5B',
  },
  severityButtonTextActive: {
    color: '#ffffff',
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  reportTitle: {
    fontSize: 16,
    color: '#040707',
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: '#fafbfa',
    borderWidth: 1,
    borderColor: '#E7F2F1',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  reportNote: {
    fontSize: 12,
    color: '#5B5B5B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E7F2F1',
  },
  continueButton: {
    backgroundColor: '#1b4a5a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#5B5B5B',
    fontSize: 14,
  },
});
