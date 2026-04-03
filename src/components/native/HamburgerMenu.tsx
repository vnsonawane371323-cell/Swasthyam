import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const menuItems = [
  {
    id: 'groups',
    label: 'My Groups',
    description: 'Manage family & school groups',
    icon: 'people' as const,
    color: '#1b4a5a',
    bg: '#E7F2F1'
  },
  {
    id: 'devices',
    label: 'My IoT Devices',
    description: 'Smart Kitchen Tracker',
    icon: 'phone-portrait' as const,
    color: '#07A996',
    bg: '#E7F2F1'
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Language, Privacy, Notifications',
    icon: 'settings' as const,
    color: '#5B5B5B',
    bg: '#E7F2F1'
  },
  {
    id: 'help',
    label: 'Help & Support',
    description: 'FAQ and contact us',
    icon: 'help-circle' as const,
    color: '#07A996',
    bg: '#E7F2F1'
  },
  {
    id: 'partner',
    label: 'Partner With Us',
    description: 'For restaurants & canteens',
    icon: 'business' as const,
    color: '#07A996',
    bg: '#E7F2F1'
  },
  {
    id: 'about',
    label: 'About SwasthTel',
    description: 'Our mission and vision',
    icon: 'information-circle' as const,
    color: '#07A996',
    bg: '#E7F2F1'
  }
];

export function HamburgerMenu({ isOpen, onClose, onNavigate }: HamburgerMenuProps) {
  const handleNavigation = (id: string) => {
    onClose();
    onNavigate(id);
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <SafeAreaView style={styles.menuContainer}>
          {/* Header with User Info */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>PS</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>Priya Sharma</Text>
                <Text style={styles.userEmail}>priya.sharma@email.com</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView 
            style={styles.menuContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.menuItems}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.id)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                    <Text style={styles.menuItemDescription}>{item.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#5B5B5B" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.separator} />

            {/* Logout Button */}
            <View style={styles.logoutContainer}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => handleNavigation('logout')}
              >
                <View style={styles.logoutIconContainer}>
                  <Ionicons name="log-out" size={20} color="#dc2626" />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.logoutLabel}>Log Out</Text>
                  <Text style={styles.logoutDescription}>Sign out of your account</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerVersion}>SwasthTel v1.0.0</Text>
            <Text style={styles.footerTagline}>
              Reducing India's oil consumption, one meal at a time
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: 320,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Header
  header: {
    backgroundColor: '#1b4a5a',
    paddingHorizontal: 24,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#069888',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Menu Content
  menuContent: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  menuItems: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#040707',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#5B5B5B',
  },
  
  // Separator
  separator: {
    height: 1,
    backgroundColor: '#E7F2F1',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  
  // Logout
  logoutContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
  },
  logoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
    marginBottom: 2,
  },
  logoutDescription: {
    fontSize: 12,
    color: '#ef4444',
  },
  
  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E7F2F1',
    backgroundColor: '#f5f5f5',
  },
  footerVersion: {
    fontSize: 12,
    color: '#5B5B5B',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
});
