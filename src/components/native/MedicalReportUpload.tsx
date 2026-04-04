import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

interface MedicalReportAnalysis {
  health_score: number;
  oil_limit: number;
  risk_flags: string[];
  summary?: string;
  risk_level?: string;
  nutrition_targets: {
    protein: number;
    fat: number;
    carbs: number;
  };
  recommendations: string[];
  detailed_analysis?: {
    clinical_summary?: string;
    key_findings?: string[];
    critical_alerts?: string[];
    oil_strategy?: string;
    follow_up_tests?: string[];
    doctor_discussion_points?: string[];
  };
  health_score_details?: {
    max_score: number;
    final_score: number;
    total_deductions: number;
    factors: Array<{
      factor: string;
      value: number | string;
      unit?: string;
      points: number;
      status: string;
      reason: string;
      oil_related?: boolean;
      oil_impact?: string;
    }>;
  };
  oil_impact_factors?: Array<{
    factor: string;
    current_value: string;
    impact_level: 'Mild' | 'Moderate' | 'High' | string;
    from_report: string;
    why_it_matters: string;
    suggested_action: string;
  }>;
  lifestyle_guidance?: Array<{
    title: string;
    description: string;
    action_points: string[];
  }>;
}

export function MedicalReportUpload() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [analysis, setAnalysis] = useState<MedicalReportAnalysis | null>(null);
  const [showResult, setShowResult] = useState(false);

  const getMimeTypeFromName = (name?: string) => {
    const lower = (name || '').toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.pdf')) return 'application/pdf';
    return 'image/jpeg';
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0] as any;
        const fileName = asset.fileName || 'medical_report.jpg';
        const normalizedType =
          asset.mimeType ||
          (typeof asset.type === 'string' && asset.type.includes('/') ? asset.type : null) ||
          getMimeTypeFromName(fileName);

        setSelectedFile({
          uri: asset.uri,
          name: fileName,
          type: normalizedType,
        });
        setAnalysis(null);
        setShowResult(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleAnalyzeReport = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('report', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.type,
      });
      if (user?._id) {
        formData.append('userId', user._id);
      }

      const response = await apiService.post('/health/analyze-report', formData);

      if (response.success) {
        setAnalysis(response.data);
        setShowResult(true);
        Alert.alert('Success', 'Report analyzed successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to analyze report');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload and analyze report');
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setAnalysis(null);
    setShowResult(false);
  };

  if (showResult && analysis) {
    return <MedicalReportDashboard analysis={analysis} onBack={clearSelection} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="document-text" size={24} color="#07A996" />
          <Text style={styles.headerTitle}>Upload Medical Report</Text>
        </View>
      </View>

      {/* Upload Section */}
      <View style={styles.uploadSection}>
        {selectedFile ? (
          <View style={styles.filePreview}>
            <View style={styles.fileIcon}>
              <Ionicons name="image" size={32} color="#1b4a5a" />
            </View>
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <Text style={styles.fileSize}>Ready to analyze</Text>

            <TouchableOpacity style={styles.changeButton} onPress={handlePickImage}>
              <Text style={styles.changeButtonText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Ionicons name="cloud-upload-outline" size={48} color="#1b4a5a" />
            <Text style={styles.uploadText}>No image selected</Text>
            <Text style={styles.uploadSubtext}>
              Choose an image of your medical report
            </Text>
          </View>
        )}

        {/* File Type Buttons */}
        <TouchableOpacity style={styles.pickButton} onPress={handlePickImage}>
          <Ionicons name="image" size={20} color="#ffffff" />
          <Text style={styles.pickButtonText}>Pick Medical Report Image</Text>
        </TouchableOpacity>
      </View>

      {/* Analyze Button */}
      {selectedFile && !loading && (
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyzeReport}
        >
          <LinearGradient
            colors={['#1b4a5a', '#07A996']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Ionicons name="sparkles" size={20} color="#ffffff" />
            <Text style={styles.analyzeButtonText}>Analyze Report</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#07A996" />
          <Text style={styles.loadingText}>
            Analyzing your medical report...
          </Text>
          <Text style={styles.loadingSubtext}>
            This may take a few moments
          </Text>
        </View>
      )}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={20} color="#07A996" />
          <Text style={styles.infoText}>
            Your report is processed securely
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="lock-closed" size={20} color="#07A996" />
          <Text style={styles.infoText}>
            Data is encrypted and stored safely
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="pulse" size={20} color="#07A996" />
          <Text style={styles.infoText}>
            AI-powered health insights
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Medical Report Dashboard Component
 */
function MedicalReportDashboard({
  analysis,
  onBack,
}: {
  analysis: MedicalReportAnalysis;
  onBack: () => void;
}) {
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: '#16a34a' };
    if (score >= 60) return { label: 'Good', color: '#3b82f6' };
    if (score >= 40) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Poor', color: '#ef4444' };
  };

  const riskLevel = getRiskLevel(analysis.health_score);
  const scoreFactors = analysis.health_score_details?.factors || [];
  const oilImpactFactors = analysis.oil_impact_factors || [];
  const lifestyleGuidance = analysis.lifestyle_guidance || [];
  const detailedAnalysis = analysis.detailed_analysis;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={24} color="#1b4a5a" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Health Score Card */}
      <LinearGradient
        colors={[riskLevel.color, riskLevel.color + 'dd']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.scoreCard}
      >
        <Text style={styles.scoreLabel}>Health Score</Text>
        <View style={styles.scoreDisplay}>
          <Text style={styles.scoreValue}>{analysis.health_score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <Text style={styles.riskLevelText}>{riskLevel.label}</Text>
      </LinearGradient>

      {/* Oil Limit Card */}
      <View style={styles.dashboardCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="water" size={24} color="#f5a623" />
          <Text style={styles.cardTitle}>Oil Consumption Limit</Text>
        </View>
        <View style={styles.oilLimitContent}>
          <View style={styles.oilLimitValue}>
            <Text style={styles.oilLimitNumber}>{analysis.oil_limit}</Text>
            <Text style={styles.oilLimitUnit}>ml/day</Text>
          </View>
          <View style={styles.oilProgressBar}>
            <View
              style={[
                styles.oilProgressFill,
                { width: `${Math.min((analysis.oil_limit / 50) * 100, 100)}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Risk Flags */}
      {analysis.risk_flags && analysis.risk_flags.length > 0 && (
        <View style={styles.dashboardCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.cardTitle}>Risk Flags</Text>
          </View>
          <View style={styles.flagsContainer}>
            {analysis.risk_flags.map((flag, index) => (
              <View key={index} style={styles.flagChip}>
                <Ionicons name="warning" size={14} color="#ef4444" />
                <Text style={styles.flagText}>{flag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Detailed Analysis */}
      {(analysis.summary || detailedAnalysis?.clinical_summary || (detailedAnalysis?.key_findings || []).length > 0) && (
        <View style={styles.dashboardCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={24} color="#1b4a5a" />
            <Text style={styles.cardTitle}>Detailed Report Analysis</Text>
          </View>

          {!!analysis.summary && (
            <Text style={styles.analysisSummary}>{analysis.summary}</Text>
          )}

          {!!detailedAnalysis?.clinical_summary && (
            <Text style={styles.analysisParagraph}>{detailedAnalysis.clinical_summary}</Text>
          )}

          {(detailedAnalysis?.key_findings || []).length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>Key Findings</Text>
              {(detailedAnalysis?.key_findings || []).map((item, index) => (
                <View key={`finding-${index}`} style={styles.analysisRow}>
                  <View style={styles.analysisBullet} />
                  <Text style={styles.analysisRowText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {(detailedAnalysis?.critical_alerts || []).length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>Critical Alerts</Text>
              {(detailedAnalysis?.critical_alerts || []).map((item, index) => (
                <View key={`alert-${index}`} style={styles.analysisRow}>
                  <View style={[styles.analysisBullet, styles.analysisAlertBullet]} />
                  <Text style={styles.analysisRowText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {!!detailedAnalysis?.oil_strategy && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>Oil Strategy</Text>
              <Text style={styles.analysisParagraph}>{detailedAnalysis.oil_strategy}</Text>
            </View>
          )}

          {(detailedAnalysis?.follow_up_tests || []).length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>Follow-up Tests</Text>
              {(detailedAnalysis?.follow_up_tests || []).map((item, index) => (
                <View key={`test-${index}`} style={styles.analysisRow}>
                  <View style={styles.analysisBullet} />
                  <Text style={styles.analysisRowText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {(detailedAnalysis?.doctor_discussion_points || []).length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>Discuss With Doctor</Text>
              {(detailedAnalysis?.doctor_discussion_points || []).map((item, index) => (
                <View key={`doctor-${index}`} style={styles.analysisRow}>
                  <View style={styles.analysisBullet} />
                  <Text style={styles.analysisRowText}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Nutrition Targets */}
      <View style={styles.dashboardCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="nutrition" size={24} color="#3b82f6" />
          <Text style={styles.cardTitle}>Nutrition Targets</Text>
        </View>
        <View style={styles.nutritionGrid}>
          {[
            {
              label: 'Protein',
              value: analysis.nutrition_targets.protein,
              unit: 'g',
              icon: 'water',
              color: '#ef4444',
            },
            {
              label: 'Fat',
              value: analysis.nutrition_targets.fat,
              unit: 'g',
              icon: 'flame',
              color: '#f59e0b',
            },
            {
              label: 'Carbs',
              value: analysis.nutrition_targets.carbs,
              unit: 'g',
              icon: 'leaf',
              color: '#3b82f6',
            },
          ].map((nutrient, index) => (
            <View key={index} style={styles.nutrientCard}>
              <View style={[styles.nutrientIcon, { backgroundColor: nutrient.color + '22' }]}>
                <Ionicons name={nutrient.icon as any} size={20} color={nutrient.color} />
              </View>
              <Text style={styles.nutrientLabel}>{nutrient.label}</Text>
              <Text style={styles.nutrientValue}>
                {nutrient.value}
                <Text style={styles.nutrientUnit}>{nutrient.unit}</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.dashboardCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="bulb" size={24} color="#f5a623" />
          <Text style={styles.cardTitle}>Recommendations</Text>
        </View>
        <View style={styles.recommendationsList}>
          {analysis.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={styles.recommendationBullet} />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Health Score Details */}
      <View style={styles.dashboardCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="analytics" size={24} color="#1b4a5a" />
          <Text style={styles.cardTitle}>Health Score Details</Text>
        </View>

        <View style={styles.scoreSummaryRow}>
          <Text style={styles.scoreSummaryLabel}>Total Deductions</Text>
          <Text style={styles.scoreSummaryValue}>
            -{analysis.health_score_details?.total_deductions || Math.max(0, 100 - analysis.health_score)}
          </Text>
        </View>

        {scoreFactors.length > 0 ? (
          <View style={styles.scoreBreakdownList}>
            {scoreFactors.map((factor, index) => (
              <View key={`${factor.factor}-${index}`} style={styles.scoreFactorItem}>
                <View style={styles.scoreFactorTopRow}>
                  <Text style={styles.scoreFactorName}>{factor.factor}</Text>
                  <Text style={styles.scoreFactorDeduction}>-{factor.points}</Text>
                </View>
                <Text style={styles.scoreFactorMeta}>
                  {factor.value}{factor.unit ? ` ${factor.unit}` : ''} • {factor.status}
                </Text>
                <Text style={styles.scoreFactorReason}>{factor.reason}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyStateText}>
            Detailed score factors are not available for this report yet.
          </Text>
        )}
      </View>

      {/* Oil-Linked Report Factors */}
      <View style={styles.dashboardCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="water-outline" size={24} color="#0e7490" />
          <Text style={styles.cardTitle}>Oil Impact on Report Factors</Text>
        </View>

        {oilImpactFactors.length > 0 ? (
          <View style={styles.oilImpactList}>
            {oilImpactFactors.map((item, index) => (
              <View key={`${item.factor}-${index}`} style={styles.oilImpactCard}>
                <View style={styles.oilImpactHead}>
                  <Text style={styles.oilImpactFactor}>{item.factor}</Text>
                  <Text style={[
                    styles.oilImpactLevel,
                    item.impact_level === 'High'
                      ? styles.oilImpactHigh
                      : item.impact_level === 'Moderate'
                        ? styles.oilImpactModerate
                        : styles.oilImpactMild,
                  ]}>
                    {item.impact_level}
                  </Text>
                </View>
                <Text style={styles.oilImpactValue}>Current: {item.current_value}</Text>
                <Text style={styles.oilImpactText}>{item.from_report}</Text>
                <Text style={styles.oilImpactText}>{item.why_it_matters}</Text>
                <Text style={styles.oilImpactSuggestion}>Action: {item.suggested_action}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyStateText}>
            No specific oil-impact factors were detected from this report.
          </Text>
        )}
      </View>

      {/* Lifestyle Guidance */}
      <View style={styles.dashboardCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart" size={24} color="#0f766e" />
          <Text style={styles.cardTitle}>Lifestyle & Oil Health Plan</Text>
        </View>

        {lifestyleGuidance.length > 0 ? (
          <View style={styles.guidanceList}>
            {lifestyleGuidance.map((item, index) => (
              <View key={`${item.title}-${index}`} style={styles.guidanceCard}>
                <Text style={styles.guidanceTitle}>{item.title}</Text>
                <Text style={styles.guidanceDescription}>{item.description}</Text>
                <View style={styles.guidancePoints}>
                  {(item.action_points || []).map((point, pointIndex) => (
                    <View key={`${item.title}-point-${pointIndex}`} style={styles.guidancePointRow}>
                      <View style={styles.guidanceBullet} />
                      <Text style={styles.guidancePointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyStateText}>
            Lifestyle suggestions are not available for this report yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Upload Section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1b4a5a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  uploadSection: {
    marginHorizontal: 20,
    marginVertical: 20,
  },

  uploadPlaceholder: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },

  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4a5a',
    marginTop: 12,
  },

  uploadSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },

  filePreview: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },

  fileIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#d1fae5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b4a5a',
    textAlign: 'center',
  },

  fileSize: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  changeButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
  },

  changeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },

  pickButton: {
    backgroundColor: '#1b4a5a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  pickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  analyzeButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },

  gradientButton: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  analyzeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  loadingContainer: {
    marginHorizontal: 20,
    marginVertical: 40,
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4a5a',
    marginTop: 16,
  },

  loadingSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },

  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  infoText: {
    fontSize: 13,
    color: '#1b4a5a',
    flex: 1,
  },

  // Dashboard Styles
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    gap: 4,
  },

  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4a5a',
  },

  scoreCard: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },

  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 12,
  },

  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  scoreMax: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },

  riskLevelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },

  dashboardCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b4a5a',
  },

  oilLimitContent: {
    alignItems: 'center',
  },

  oilLimitValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 12,
  },

  oilLimitNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1b4a5a',
  },

  oilLimitUnit: {
    fontSize: 14,
    color: '#6b7280',
  },

  oilProgressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },

  oilProgressFill: {
    height: '100%',
    backgroundColor: '#f5a623',
    borderRadius: 6,
  },

  flagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  flagChip: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },

  flagText: {
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '500',
  },

  nutritionGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  nutrientCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },

  nutrientIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  nutrientLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },

  nutrientValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b4a5a',
  },

  nutrientUnit: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'normal',
  },

  recommendationsList: {
    gap: 12,
  },

  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#07A996',
    marginTop: 6,
    flexShrink: 0,
  },

  recommendationText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },

  analysisSummary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 20,
  },

  analysisSection: {
    marginTop: 10,
  },

  analysisSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 6,
  },

  analysisParagraph: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },

  analysisRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },

  analysisBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0ea5e9',
    marginTop: 6,
  },

  analysisAlertBullet: {
    backgroundColor: '#dc2626',
  },

  analysisRowText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },

  scoreSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  scoreSummaryLabel: {
    fontSize: 13,
    color: '#1e3a8a',
    fontWeight: '600',
  },

  scoreSummaryValue: {
    fontSize: 16,
    color: '#1d4ed8',
    fontWeight: '700',
  },

  scoreBreakdownList: {
    gap: 10,
  },

  scoreFactorItem: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9fafb',
  },

  scoreFactorTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  scoreFactorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  scoreFactorDeduction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b91c1c',
  },

  scoreFactorMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#4b5563',
  },

  scoreFactorReason: {
    marginTop: 4,
    fontSize: 12,
    color: '#374151',
    lineHeight: 17,
  },

  oilImpactList: {
    gap: 10,
  },

  oilImpactCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
    padding: 12,
  },

  oilImpactHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  oilImpactFactor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },

  oilImpactLevel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
  },

  oilImpactHigh: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },

  oilImpactModerate: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },

  oilImpactMild: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },

  oilImpactValue: {
    fontSize: 12,
    color: '#0c4a6e',
    marginBottom: 6,
    fontWeight: '600',
  },

  oilImpactText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    marginBottom: 4,
  },

  oilImpactSuggestion: {
    fontSize: 12,
    color: '#075985',
    fontWeight: '700',
    marginTop: 2,
  },

  guidanceList: {
    gap: 12,
  },

  guidanceCard: {
    backgroundColor: '#ecfeff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
    padding: 12,
  },

  guidanceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },

  guidanceDescription: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 8,
    lineHeight: 18,
  },

  guidancePoints: {
    gap: 6,
  },

  guidancePointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  guidanceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    backgroundColor: '#0ea5e9',
  },

  guidancePointText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#0f172a',
  },

  emptyStateText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
});
