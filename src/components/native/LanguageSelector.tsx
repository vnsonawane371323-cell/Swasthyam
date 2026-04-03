import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t, changeLanguage, getCurrentLanguage, getAvailableLanguages } from '../../i18n';
import { useAuth } from '../../context/AuthContext';

const LanguageSelector: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { updateProfile } = useAuth();
  const currentLanguage = getCurrentLanguage();
  const languages = getAvailableLanguages();

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Update i18n
      changeLanguage(languageCode);
      
      // Update user profile
      await updateProfile({ language: languageCode });
      
      setModalVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const currentLanguageName = languages.find(lang => lang.code === currentLanguage)?.nativeName || 'English';

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Ionicons name="language" size={24} color="#6B46C1" />
          <View style={styles.textContainer}>
            <Text style={styles.label}>{t('common.language')}</Text>
            <Text style={styles.value}>{currentLanguageName}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('common.selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    currentLanguage === item.code && styles.selectedLanguage
                  ]}
                  onPress={() => handleLanguageChange(item.code)}
                >
                  <View>
                    <Text style={styles.languageName}>{item.name}</Text>
                    <Text style={styles.nativeName}>{item.nativeName}</Text>
                  </View>
                  {currentLanguage === item.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#6B46C1" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  selectedLanguage: {
    backgroundColor: '#F3F0FF',
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 14,
    color: '#666',
  },
});

export default LanguageSelector;
