import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import apiService, { Group } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { t } from '../../i18n';

interface MobileGroupsProps {
  navigation?: any;
}

export function MobileGroups({ navigation }: MobileGroupsProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [invitations, setInvitations] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Create group form
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupType, setNewGroupType] = useState<'family' | 'school' | 'community' | 'other'>('family');

  const loadGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      const [groupsRes, invitesRes] = await Promise.all([
        apiService.getMyGroups(),
        apiService.getPendingInvitations()
      ]);
      
      if (groupsRes.success && groupsRes.data) {
        setGroups(groupsRes.data);
      }
      if (invitesRes.success && invitesRes.data) {
        setInvitations(invitesRes.data);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        type: newGroupType
      });

      if (response.success) {
        Alert.alert('Success', 'Group created successfully');
        setShowCreateModal(false);
        setNewGroupName('');
        setNewGroupDescription('');
        setNewGroupType('family');
        loadGroups();
      } else {
        Alert.alert('Error', response.message || 'Failed to create group');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (groupId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.acceptInvitation(groupId);
      
      if (response.success) {
        Alert.alert('Success', 'Invitation accepted');
        loadGroups();
      } else {
        Alert.alert('Error', response.message || 'Failed to accept invitation');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvitation = async (groupId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.rejectInvitation(groupId);
      
      if (response.success) {
        Alert.alert('Success', 'Invitation rejected');
        loadGroups();
      } else {
        Alert.alert('Error', response.message || 'Failed to reject invitation');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reject invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'family':
        return 'home';
      case 'school':
        return 'school';
      case 'community':
        return 'people';
      default:
        return 'people-circle';
    }
  };

  const getGroupColor = (type: string) => {
    switch (type) {
      case 'family':
        return '#10b981';
      case 'school':
        return '#3b82f6';
      case 'community':
        return '#f59e0b';
      default:
        return '#6366f1';
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1b4a5a', '#0f3a47']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.title}>{t('groups.title')}</Text>
              <Text style={styles.subtitle}>{t('groups.subtitle')}</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('groups.invitations')}</Text>
            {invitations.map((group) => (
              <Card key={group._id} style={styles.invitationCard}>
                <CardContent style={styles.invitationContent}>
                  <View style={styles.invitationInfo}>
                    <View style={[styles.groupIcon, { backgroundColor: getGroupColor(group.type) }]}>
                      <Ionicons name={getGroupIcon(group.type) as any} size={24} color="#ffffff" />
                    </View>
                    <View style={styles.invitationDetails}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.invitationFrom}>
                        Invited by {group.admin.name || group.admin.email}
                      </Text>
                      <View style={styles.groupMeta}>
                        <View style={styles.badgeWrapper}>
                          <Badge variant="outline">
                            <Text style={styles.badgeText}>{group.type}</Text>
                          </Badge>
                        </View>
                        <Text style={styles.memberCount}>
                          {group.members.filter(m => m.status === 'active').length} {t('groups.members')}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.invitationActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAcceptInvitation(group._id)}
                    >
                      <Ionicons name="checkmark" size={20} color="#ffffff" />
                      <Text style={styles.acceptButtonText}>{t('groups.accept')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectInvitation(group._id)}
                    >
                      <Ionicons name="close" size={20} color="#ef4444" />
                      <Text style={styles.rejectButtonText}>{t('groups.reject')}</Text>
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {/* My Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('groups.myGroups')}</Text>
          
          {groups.length === 0 ? (
            <Card style={styles.emptyCard}>
              <CardContent style={styles.emptyContent}>
                <Ionicons name="people-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyTitle}>{t('groups.noGroups')}</Text>
                <Text style={styles.emptyText}>{t('groups.noGroupsText')}</Text>
              </CardContent>
            </Card>
          ) : (
            groups.map((group) => {
              const isAdmin = group.admin._id === group.members.find(m => m.role === 'admin')?.userId._id;
              const activeMembers = group.members.filter(m => m.status === 'active');
              
              return (
                <TouchableOpacity
                  key={group._id}
                  onPress={() => navigation?.navigate('GroupDetail', { groupId: group._id })}
                >
                  <Card style={styles.groupCard}>
                    <CardContent style={styles.groupContent}>
                      <View style={[styles.groupIcon, { backgroundColor: getGroupColor(group.type) }]}>
                        <Ionicons name={getGroupIcon(group.type) as any} size={24} color="#ffffff" />
                      </View>
                      <View style={styles.groupInfo}>
                        <View style={styles.groupHeader}>
                          <Text style={styles.groupName}>{group.name}</Text>
                          {isAdmin && (
                            <View style={styles.badgeWrapper}>
                              <Badge variant="success">
                                <Text style={styles.adminBadge}>{t('groups.admin')}</Text>
                              </Badge>
                            </View>
                          )}
                        </View>
                        {group.description && (
                          <Text style={styles.groupDescription} numberOfLines={1}>
                            {group.description}
                          </Text>
                        )}
                        <View style={styles.groupMeta}>
                          <View style={styles.badgeWrapper}>
                            <Badge variant="outline">
                              <Text style={styles.badgeText}>{group.type}</Text>
                            </Badge>
                          </View>
                          <Text style={styles.memberCount}>
                            {activeMembers.length} {t('groups.members')}
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Create Group Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <LinearGradient colors={['#1b4a5a', '#0f3a47']} style={styles.createButtonGradient}>
          <Ionicons name="add" size={28} color="#ffffff" />
          <Text style={styles.createButtonText}>{t('groups.createGroup')}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Create Group Modal */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('groups.createGroup')}</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#5B5B5B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('groups.groupName')}</Text>
                <TextInput
                  style={styles.input}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  placeholder="e.g., Family, Class 5A"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('groups.description')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newGroupDescription}
                  onChangeText={setNewGroupDescription}
                  placeholder="What's this group for?"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('groups.groupType')}</Text>
                <View style={styles.typeButtons}>
                  {(['family', 'school', 'community', 'other'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newGroupType === type && styles.typeButtonActive,
                        { borderColor: getGroupColor(type) }
                      ]}
                      onPress={() => setNewGroupType(type)}
                    >
                      <Ionicons
                        name={getGroupIcon(type) as any}
                        size={24}
                        color={newGroupType === type ? getGroupColor(type) : '#9ca3af'}
                      />
                      <Text
                        style={[
                          styles.typeButtonText,
                          newGroupType === type && { color: getGroupColor(type) }
                        ]}
                      >
                        {t(`groups.${type}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t('groups.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleCreateGroup}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>{t('groups.create')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfa',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 12,
  },
  groupCard: {
    marginBottom: 12,
  },
  groupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
  },
  groupDescription: {
    fontSize: 14,
    color: '#5B5B5B',
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#5B5B5B',
    textTransform: 'capitalize',
  },
  adminBadge: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 13,
    color: '#9ca3af',
  },
  invitationCard: {
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  invitationContent: {
    padding: 16,
  },
  invitationInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  invitationDetails: {
    flex: 1,
  },
  invitationFrom: {
    fontSize: 13,
    color: '#5B5B5B',
    marginBottom: 8,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#16a34a',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  rejectButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5B5B5B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E7F2F1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#040707',
  },
  modalContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#040707',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#040707',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
  },
  typeButtonActive: {
    backgroundColor: '#ffffff',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B5B5B',
    textTransform: 'capitalize',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E7F2F1',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
  },
  cancelButtonText: {
    color: '#5B5B5B',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#1b4a5a',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  badgeWrapper: {
    flexDirection: 'row',
  },
});

