import React, { useState, useEffect } from 'react';
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
import { Card, CardContent } from '../Card';
import { Badge } from '../Badge';
import apiService, { Group, User } from '../../../services/api';

interface GroupDetailScreenProps {
  route: {
    params: {
      groupId: string;
    };
  };
  navigation: any;
  language: string;
}

export function GroupDetailScreen({ route, navigation, language }: GroupDetailScreenProps) {
  const { groupId } = route.params;
  const [group, setGroup] = useState<Group | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  const loadGroupDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getGroup(groupId);
      
      if (response.success && response.data) {
        setGroup(response.data);
        // Check if current user is admin
        const adminMember = response.data.members.find(m => m.role === 'admin');
        setIsAdmin(adminMember?.userId._id === response.data.admin._id);
      }
    } catch (error) {
      console.error('Error loading group:', error);
      Alert.alert('Error', 'Failed to load group details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGroupDetails();
    setRefreshing(false);
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await apiService.searchUsers(query);
      if (response.success && response.data) {
        // Filter out users already in the group
        const existingUserIds = group?.members.map(m => m.userId._id) || [];
        const filtered = response.data.filter(
          user => !existingUserIds.includes(user._id)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one user to invite');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.inviteMembers(groupId, selectedUsers);
      
      if (response.success) {
        Alert.alert('Success', `Invited ${selectedUsers.length} user(s)`);
        setShowInviteModal(false);
        setSearchQuery('');
        setSearchResults([]);
        setSelectedUsers([]);
        loadGroupDetails();
      } else {
        Alert.alert('Error', response.message || 'Failed to invite users');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to invite users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${userName} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await apiService.removeMember(groupId, userId);
              
              if (response.success) {
                Alert.alert('Success', 'Member removed');
                loadGroupDetails();
              } else {
                Alert.alert('Error', response.message || 'Failed to remove member');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handlePromoteMember = async (userId: string, userName: string) => {
    Alert.alert(
      'Promote to Admin',
      `Promote ${userName} to group admin? You will no longer be the admin.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await apiService.promoteMember(groupId, userId);
              
              if (response.success) {
                Alert.alert('Success', 'Member promoted to admin');
                loadGroupDetails();
              } else {
                Alert.alert('Error', response.message || 'Failed to promote member');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to promote member');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await apiService.leaveGroup(groupId);
              
              if (response.success) {
                Alert.alert('Success', 'Left group successfully');
                navigation.goBack();
              } else {
                Alert.alert('Error', response.message || 'Failed to leave group');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to leave group');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await apiService.deleteGroup(groupId);
              
              if (response.success) {
                Alert.alert('Success', 'Group deleted successfully');
                navigation.goBack();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete group');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete group');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
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

  const text = {
    en: {
      members: 'Members',
      activeMembers: 'Active Members',
      pendingInvites: 'Pending Invites',
      inviteMembers: 'Invite Members',
      leaveGroup: 'Leave Group',
      deleteGroup: 'Delete Group',
      admin: 'Admin',
      member: 'Member',
      pending: 'Pending',
      searchUsers: 'Search by email or name',
      noResults: 'No users found',
      selected: 'selected',
      invite: 'Send Invites',
      cancel: 'Cancel',
      remove: 'Remove',
      promote: 'Promote to Admin',
      noMembers: 'No members yet',
      noPending: 'No pending invitations',
    },
  };

  const t = text[language as keyof typeof text] || text.en;

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeMembers = group.members.filter(m => m.status === 'active');
  const pendingMembers = group.members.filter(m => m.status === 'pending');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1b4a5a', '#0f3a47']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={getGroupIcon(group.type) as any} size={24} color="#ffffff" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>{group.name}</Text>
              <View style={styles.headerMeta}>
                <Badge variant={isAdmin ? 'success' : 'default'}>
                  <Text style={styles.roleBadge}>{isAdmin ? t.admin : t.member}</Text>
                </Badge>
                <Text style={styles.memberCount}>{activeMembers.length} {t.members}</Text>
              </View>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Group Info */}
        {group.description && (
          <Card style={styles.infoCard}>
            <CardContent style={styles.infoContent}>
              <Text style={styles.description}>{group.description}</Text>
            </CardContent>
          </Card>
        )}

        {/* Active Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.activeMembers}</Text>
          {activeMembers.length === 0 ? (
            <Card style={styles.emptyCard}>
              <CardContent style={styles.emptyContent}>
                <Text style={styles.emptyText}>{t.noMembers}</Text>
              </CardContent>
            </Card>
          ) : (
            activeMembers.map((member) => (
              <Card key={member.userId._id} style={styles.memberCard}>
                <CardContent style={styles.memberContent}>
                  <View style={styles.memberAvatar}>
                    <Ionicons name="person" size={24} color="#1b4a5a" />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.userId.name || member.userId.email}
                    </Text>
                    <Text style={styles.memberEmail}>{member.userId.email}</Text>
                    <View style={styles.memberMeta}>
                      <Badge variant={member.role === 'admin' ? 'success' : 'default'}>
                        <Text style={styles.memberRole}>
                          {member.role === 'admin' ? t.admin : t.member}
                        </Text>
                      </Badge>
                    </View>
                  </View>
                  {isAdmin && member.role !== 'admin' && (
                    <View style={styles.memberActions}>
                      <TouchableOpacity
                        style={styles.actionIcon}
                        onPress={() => handlePromoteMember(member.userId._id, member.userId.name || member.userId.email)}
                      >
                        <Ionicons name="arrow-up-circle-outline" size={24} color="#1b4a5a" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionIcon}
                        onPress={() => handleRemoveMember(member.userId._id, member.userId.name || member.userId.email)}
                      >
                        <Ionicons name="close-circle-outline" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </View>

        {/* Pending Invitations */}
        {pendingMembers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.pendingInvites}</Text>
            {pendingMembers.map((member) => (
              <Card key={member.userId._id} style={styles.memberCard}>
                <CardContent style={styles.memberContent}>
                  <View style={[styles.memberAvatar, styles.pendingAvatar]}>
                    <Ionicons name="time-outline" size={24} color="#f59e0b" />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.userId.name || member.userId.email}
                    </Text>
                    <Text style={styles.memberEmail}>{member.userId.email}</Text>
                    <Badge variant="warning">
                      <Text style={styles.pendingBadge}>{t.pending}</Text>
                    </Badge>
                  </View>
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleRemoveMember(member.userId._id, member.userId.name || member.userId.email)}
                    >
                      <Ionicons name="close-circle-outline" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isAdmin && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowInviteModal(true)}
              >
                <Ionicons name="person-add" size={20} color="#1b4a5a" />
                <Text style={styles.actionButtonText}>{t.inviteMembers}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={handleDeleteGroup}
              >
                <Ionicons name="trash" size={20} color="#ef4444" />
                <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                  {t.deleteGroup}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {!isAdmin && (
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleLeaveGroup}
            >
              <Ionicons name="exit" size={20} color="#ef4444" />
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                {t.leaveGroup}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Invite Modal */}
      {showInviteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.inviteMembers}</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <Ionicons name="close" size={24} color="#5B5B5B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={handleSearchUsers}
                  placeholder={t.searchUsers}
                  placeholderTextColor="#999"
                />
              </View>

              {selectedUsers.length > 0 && (
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedText}>
                    {selectedUsers.length} {t.selected}
                  </Text>
                </View>
              )}

              <ScrollView style={styles.searchResults}>
                {searchResults.length === 0 && searchQuery.length >= 2 ? (
                  <Text style={styles.noResults}>{t.noResults}</Text>
                ) : (
                  searchResults.map((user) => (
                    <TouchableOpacity
                      key={user._id}
                      style={[
                        styles.userResult,
                        selectedUsers.includes(user._id) && styles.userResultSelected,
                      ]}
                      onPress={() => toggleUserSelection(user._id)}
                    >
                      <View style={styles.userAvatar}>
                        <Ionicons name="person" size={20} color="#1b4a5a" />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name || user.email}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                      </View>
                      {selectedUsers.includes(user._id) && (
                        <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowInviteModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  selectedUsers.length === 0 && styles.disabledButton,
                ]}
                onPress={handleInviteUsers}
                disabled={selectedUsers.length === 0 || isLoading}
              >
                <Text style={styles.submitButtonText}>{t.invite}</Text>
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
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleBadge: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoContent: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#5B5B5B',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 12,
  },
  memberCard: {
    marginBottom: 8,
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E7F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingAvatar: {
    backgroundColor: '#fef3c7',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    color: '#5B5B5B',
    marginBottom: 4,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberRole: {
    fontSize: 11,
    color: '#5B5B5B',
    textTransform: 'capitalize',
  },
  pendingBadge: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    padding: 4,
  },
  emptyCard: {
    padding: 24,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#E7F2F1',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
  },
  dangerButtonText: {
    color: '#ef4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#5B5B5B',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#040707',
  },
  selectedInfo: {
    backgroundColor: '#E7F2F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b4a5a',
  },
  searchResults: {
    maxHeight: 300,
  },
  noResults: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  userResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  userResultSelected: {
    backgroundColor: '#E7F2F1',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#5B5B5B',
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
  disabledButton: {
    opacity: 0.5,
  },
});
