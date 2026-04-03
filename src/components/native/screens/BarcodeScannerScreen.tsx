import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  SafeAreaView,
  TextInput,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { scanBarcodeImage, lookupBarcode } from '../../../services/barcodeService';

interface BarcodeResult {
  barcode: string;
  product_name: string;
  brand: string;
  quantity: string;
  oil_content?: string;
  nutritional_info?: {
    energy?: string;
    protein?: string;
    carbohydrates?: string;
    fat?: string;
    saturated_fat?: string;
    trans_fat?: string;
    cholesterol?: string;
    sodium?: string;
  };
}

export function BarcodeScannerScreen() {
  const navigation = useNavigation<any>();
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scannedData, setScannedData] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to scan barcodes.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsScanning(true);
      setError(null);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      } else {
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to open camera. Please try again.');
      setIsScanning(false);
    }
  };

  const handleSelectPhoto = async () => {
    try {
      setIsScanning(true);
      setError(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      } else {
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Gallery error:', err);
      setError('Failed to select image. Please try again.');
      setIsScanning(false);
    }
  };

  const uploadImage = async (asset: any) => {
    try {
      setIsUploading(true);
      setError(null);

      // Use the barcode service to scan the image
      const response = await scanBarcodeImage(asset.uri);

      if (!response.success || !response.data) {
        // Check if it's a suggestion to use manual entry
        const errorMessage = response.message || response.error || 'Failed to scan barcode';
        
        // Build tips message if available
        let tipsMessage = errorMessage;
        if (response.tips && Array.isArray(response.tips)) {
          tipsMessage += '\n\nTips:\n' + response.tips.slice(0, 4).map((tip: string) => `• ${tip}`).join('\n');
        }
        
        // Show helpful error with option to use manual entry
        Alert.alert(
          'Barcode Detection Failed',
          tipsMessage,
          [
            { text: 'Try Again', style: 'cancel', onPress: () => setError(null) },
            { 
              text: 'Manual Entry', 
              onPress: () => {
                setError(null);
                setShowManualEntry(true);
              }
            }
          ]
        );
        
        setError(errorMessage);
        setScannedData(null);
        return;
      }

      // Process the response - map to expected format
      setScannedData({
        barcode: response.data.barcode,
        product_name: response.data.product_name,
        brand: response.data.brand,
        quantity: response.data.quantity,
        oil_content: response.data.oil_content,
        nutritional_info: response.data.nutritional_info ? {
          energy: response.data.nutritional_info.energy_kcal ? 
            `${response.data.nutritional_info.energy_kcal} kcal` : undefined,
          protein: response.data.nutritional_info.proteins ? 
            `${response.data.nutritional_info.proteins}g` : undefined,
          carbohydrates: response.data.nutritional_info.carbohydrates ? 
            `${response.data.nutritional_info.carbohydrates}g` : undefined,
          fat: response.data.nutritional_info.fat ? 
            `${response.data.nutritional_info.fat}g` : undefined,
          saturated_fat: response.data.nutritional_info.saturated_fat ? 
            `${response.data.nutritional_info.saturated_fat}g` : undefined,
          trans_fat: response.data.nutritional_info.trans_fat ? 
            `${response.data.nutritional_info.trans_fat}g` : undefined,
          cholesterol: response.data.nutritional_info.cholesterol ? 
            `${response.data.nutritional_info.cholesterol}mg` : undefined,
          sodium: response.data.nutritional_info.sodium ? 
            `${response.data.nutritional_info.sodium}mg` : undefined,
        } : undefined,
      });
      setError(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.message || 'Failed to scan barcode. Please try again.';
      setError(errorMessage);
      setScannedData(null);
      
      // Show alert with manual entry option
      Alert.alert(
        'Scan Failed',
        errorMessage + '\n\nWould you like to enter the barcode manually?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Manual Entry', 
            onPress: () => {
              setError(null);
              setShowManualEntry(true);
            }
          }
        ]
      );
    } finally {
      setIsScanning(false);
      setIsUploading(false);
    }
  };

  const handleManualLookup = async () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode number');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      Keyboard.dismiss();

      // Use the barcode service to lookup the product
      const response = await lookupBarcode(manualBarcode.trim());

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Product not found');
      }

      // Process the response - map to expected format
      setScannedData({
        barcode: response.data.barcode,
        product_name: response.data.product_name,
        brand: response.data.brand,
        quantity: response.data.quantity,
        oil_content: response.data.oil_content,
        nutritional_info: response.data.nutritional_info ? {
          energy: response.data.nutritional_info.energy_kcal ? 
            `${response.data.nutritional_info.energy_kcal} kcal` : undefined,
          protein: response.data.nutritional_info.proteins ? 
            `${response.data.nutritional_info.proteins}g` : undefined,
          carbohydrates: response.data.nutritional_info.carbohydrates ? 
            `${response.data.nutritional_info.carbohydrates}g` : undefined,
          fat: response.data.nutritional_info.fat ? 
            `${response.data.nutritional_info.fat}g` : undefined,
          saturated_fat: response.data.nutritional_info.saturated_fat ? 
            `${response.data.nutritional_info.saturated_fat}g` : undefined,
          trans_fat: response.data.nutritional_info.trans_fat ? 
            `${response.data.nutritional_info.trans_fat}g` : undefined,
          cholesterol: response.data.nutritional_info.cholesterol ? 
            `${response.data.nutritional_info.cholesterol}mg` : undefined,
          sodium: response.data.nutritional_info.sodium ? 
            `${response.data.nutritional_info.sodium}mg` : undefined,
        } : undefined,
      });
      setError(null);
      setShowManualEntry(false);
    } catch (err: any) {
      console.error('Lookup error:', err);
      setError(err.message || 'Failed to find product. Please check the barcode number.');
      setScannedData(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = () => {
    setScannedData(null);
    setError(null);
    setManualBarcode('');
    setShowManualEntry(false);
  };

  const handleUseProduct = () => {
    if (scannedData) {
      // Navigate to oil tracker with product data
      navigation.navigate('OilTracker', {
        scannedProduct: {
          name: scannedData.product_name,
          brand: scannedData.brand,
          oilContent: scannedData.oil_content,
          nutritionalInfo: scannedData.nutritional_info,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1b4a5a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Barcode</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        {!scannedData && !isScanning && !showManualEntry && (
          <View style={styles.instructionsContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="barcode-outline" size={48} color="#07A996" />
            </View>
            <Text style={styles.instructionsTitle}>Scan Product Barcode</Text>
            <Text style={styles.instructionsText}>
              Take a photo of the product barcode or upload from your gallery to get nutritional information and oil content.
            </Text>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.infoBoxText}>
                Tip: If automatic scanning doesn't work, use "Enter Barcode Manually" option below
              </Text>
            </View>
          </View>
        )}

        {/* Scanning State */}
        {(isScanning || isUploading) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#07A996" />
            <Text style={styles.loadingText}>
              {isUploading ? 'Scanning barcode...' : 'Opening camera...'}
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Scan Failed</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Scanned Data Display */}
        {scannedData && (
          <View style={styles.resultContainer}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.successText}>Barcode Detected!</Text>
            </View>

            <View style={styles.productCard}>
              <Text style={styles.productName}>{scannedData.product_name}</Text>
              {scannedData.brand && (
                <Text style={styles.productBrand}>{scannedData.brand}</Text>
              )}
              {scannedData.quantity && (
                <Text style={styles.productQuantity}>{scannedData.quantity}</Text>
              )}
              
              {scannedData.barcode && (
                <View style={styles.barcodeContainer}>
                  <Ionicons name="barcode" size={20} color="#5B5B5B" />
                  <Text style={styles.barcodeText}>{scannedData.barcode}</Text>
                </View>
              )}
            </View>

            {/* Oil Content */}
            {scannedData.oil_content && (
              <View style={styles.oilContentCard}>
                <View style={styles.oilHeader}>
                  <Ionicons name="water" size={24} color="#07A996" />
                  <Text style={styles.oilTitle}>Oil Content</Text>
                </View>
                <Text style={styles.oilValue}>{scannedData.oil_content}</Text>
              </View>
            )}

            {/* Nutritional Information */}
            {scannedData.nutritional_info && (
              <View style={styles.nutritionCard}>
                <Text style={styles.nutritionTitle}>Nutritional Information</Text>
                <View style={styles.nutritionGrid}>
                  {scannedData.nutritional_info.energy && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Energy</Text>
                      <Text style={styles.nutritionValue}>{scannedData.nutritional_info.energy}</Text>
                    </View>
                  )}
                  {scannedData.nutritional_info.fat && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Total Fat</Text>
                      <Text style={styles.nutritionValue}>{scannedData.nutritional_info.fat}</Text>
                    </View>
                  )}
                  {scannedData.nutritional_info.saturated_fat && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Saturated Fat</Text>
                      <Text style={styles.nutritionValue}>{scannedData.nutritional_info.saturated_fat}</Text>
                    </View>
                  )}
                  {scannedData.nutritional_info.trans_fat && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Trans Fat</Text>
                      <Text style={styles.nutritionValue}>{scannedData.nutritional_info.trans_fat}</Text>
                    </View>
                  )}
                  {scannedData.nutritional_info.protein && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                      <Text style={styles.nutritionValue}>{scannedData.nutritional_info.protein}</Text>
                    </View>
                  )}
                  {scannedData.nutritional_info.carbohydrates && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Carbohydrates</Text>
                      <Text style={styles.nutritionValue}>{scannedData.nutritional_info.carbohydrates}</Text>
                    </View>
                  )}
                  {scannedData.nutritional_info.cholesterol && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Cholesterol</Text>
                      <Text style={styles.nutritionValue}>{scannedData.nutritional_info.cholesterol}</Text>
                    </View>
                  )}
                  {scannedData.nutritional_info.sodium && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Sodium</Text>
                      <Text style={styles.nutritionValue}>{scannedData.nutritional_info.sodium}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <TouchableOpacity style={styles.useButton} onPress={handleUseProduct}>
              <Text style={styles.useButtonText}>Use This Product</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Scan Another Product</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scan Buttons */}
        {!scannedData && !isScanning && !showManualEntry && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={handleTakePhoto}
              disabled={isScanning}
            >
              <Ionicons name="camera" size={32} color="#ffffff" />
              <Text style={styles.scanButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.scanButton, styles.galleryButton]}
              onPress={handleSelectPhoto}
              disabled={isScanning}
            >
              <Ionicons name="images" size={32} color="#07A996" />
              <Text style={[styles.scanButtonText, styles.galleryButtonText]}>Choose from Gallery</Text>
            </TouchableOpacity>

            {/* Manual Entry Toggle - More Prominent */}
            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.manualEntryToggle}
              onPress={() => setShowManualEntry(true)}
            >
              <Ionicons name="keypad" size={24} color="#ffffff" />
              <Text style={styles.manualEntryToggleText}>Enter Barcode Manually</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <Text style={styles.manualEntryHint}>
              Recommended if camera scan doesn't work
            </Text>
          </View>
        )}

        {/* Manual Entry Section */}
        {!scannedData && !isScanning && showManualEntry && (
          <View style={styles.manualEntryContainer}>
            <Text style={styles.manualEntryTitle}>Enter Barcode Number</Text>
            <Text style={styles.manualEntrySubtitle}>
              Type the barcode number found on the product
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons name="barcode-outline" size={24} color="#5B5B5B" style={styles.inputIcon} />
              <TextInput
                style={styles.barcodeInput}
                value={manualBarcode}
                onChangeText={setManualBarcode}
                placeholder="e.g., 8901030785306"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={13}
                autoFocus={true}
              />
            </View>

            <TouchableOpacity 
              style={[styles.scanButton, isUploading && styles.scanButtonDisabled]}
              onPress={handleManualLookup}
              disabled={isUploading || !manualBarcode.trim()}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="search" size={24} color="#ffffff" />
                  <Text style={styles.scanButtonText}>Look Up Product</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setShowManualEntry(false);
                setManualBarcode('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips */}
        {!scannedData && !isScanning && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips for Best Results:</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.tipText}>Ensure good lighting</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.tipText}>Hold camera steady</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.tipText}>Center the barcode in frame</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.tipText}>Avoid glare and shadows</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b4a5a',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e6f7f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b4a5a',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#5B5B5B',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5B5B5B',
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#5B5B5B',
    textAlign: 'center',
    lineHeight: 24,
  },
  resultContainer: {
    padding: 20,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d1fae5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 8,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b4a5a',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 16,
    color: '#5B5B5B',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#7B7B7B',
    marginBottom: 12,
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  barcodeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B5B5B',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  oilContentCard: {
    backgroundColor: '#e6f7f5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  oilHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  oilTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b4a5a',
    marginLeft: 8,
  },
  oilValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#07A996',
  },
  nutritionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b4a5a',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  nutritionItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  nutritionLabel: {
    fontSize: 13,
    color: '#7B7B7B',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  useButton: {
    flexDirection: 'row',
    backgroundColor: '#07A996',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
  },
  retryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#07A996',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#07A996',
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  scanButton: {
    backgroundColor: '#07A996',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  galleryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#07A996',
  },
  galleryButtonText: {
    color: '#07A996',
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b4a5a',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#5B5B5B',
    marginLeft: 8,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginHorizontal: 16,
  },
  manualEntryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  manualEntryToggleText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  manualEntryHint: {
    fontSize: 13,
    color: '#5B5B5B',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  manualEntryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  manualEntryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b4a5a',
    marginBottom: 8,
    textAlign: 'center',
  },
  manualEntrySubtitle: {
    fontSize: 15,
    color: '#5B5B5B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  barcodeInput: {
    flex: 1,
    fontSize: 18,
    color: '#1b4a5a',
    paddingVertical: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#5B5B5B',
    fontWeight: '500',
  },
});
