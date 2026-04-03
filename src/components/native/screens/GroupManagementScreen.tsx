import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

interface GroupManagementScreenProps {
  navigation: any;
}

export function GroupManagementScreen({ navigation }: GroupManagementScreenProps) {
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const myGroups = [
    { id: 1, name: 'Kumar Family', type: 'Family', members: 5, code: 'FAM-2024-KMR', score: 780 },
    { id: 2, name: 'Class 5-B', type: 'School', members: 32, code: 'SCH-2024-5B', score: 840 },
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
                <Ionicons name="people" size={24} color="#fff" />
                <Text style={styles.headerTitle}>My Groups</Text>
              </View>
              <Text style={styles.headerSubtitle}>Manage family & school groups</Text>
            </View>
          </View>
        </View>
        <View style={styles.content}>
          <Card style={styles.createCard}>
            <Text style={styles.createTitle}>Create New Group</Text>
            <View style={styles.createButtons}>
              <Button onPress={() => {}} style={styles.familyButton}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>Family Group</Text>
                </View>
              </Button>
              <Button onPress={() => {}} style={styles.schoolButton}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>School Group</Text>
                </View>
              </Button>
            </View>
          </Card>
          <Card>
            <Text style={styles.joinTitle}>Join Existing Group</Text>
            <View style={styles.joinRow}>
              <TextInput style={styles.joinInput} placeholder="Enter group code" value={joinCode} onChangeText={setJoinCode} />
              <Button onPress={() => {}} style={styles.joinButton}>Join</Button>
            </View>
          </Card>
          <Text style={styles.sectionTitle}>Active Groups</Text>
          {myGroups.map(group => (
            <TouchableOpacity key={group.id} onPress={() => navigation.navigate('GroupDashboard', { group })} activeOpacity={0.7}>
              <Card>
                <View style={styles.groupHeader}>
                  <View>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Badge variant={group.type === 'Family' ? 'success' : 'default'} style={styles.typeBadge}>
                      <Text style={{color: group.type === 'Family' ? '#16a34a' : '#111827', fontSize: 12}}>{group.type}</Text>
                    </Badge>
                  </View>
                  <TouchableOpacity onPress={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={styles.copyButton}>
                    <Ionicons name={copied ? 'checkmark' : 'copy'} size={20} color={copied ? '#16a34a' : '#6b7280'} />
                  </TouchableOpacity>
                </View>
                <View style={styles.groupStats}>
                  <View style={styles.groupStat}>
                    <Ionicons name="people" size={16} color="#6b7280" />
                    <Text style={styles.groupStatText}>{group.members} members</Text>
                  </View>
                  <Text style={styles.groupPoints}>{group.score} pts</Text>
                </View>
                <View style={styles.groupFooter}>
                  <Text style={styles.groupCode}>Group Code: <Text style={styles.groupCodeValue}>{group.code}</Text></Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
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
  createCard: { backgroundColor: '#f0fdf4' },
  createTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  createButtons: { flexDirection: 'row', gap: 12 },
  familyButton: { flex: 1, backgroundColor: '#16a34a' },
  schoolButton: { flex: 1, backgroundColor: '#3b82f6' },
  joinTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  joinRow: { flexDirection: 'row', gap: 8 },
  joinInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, fontSize: 16 },
  joinButton: { paddingHorizontal: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  groupName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  typeBadge: { alignSelf: 'flex-start' },
  copyButton: { padding: 8 },
  groupStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  groupStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  groupStatText: { fontSize: 14, color: '#6b7280' },
  groupPoints: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  groupFooter: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  groupCode: { fontSize: 12, color: '#6b7280' },
  groupCodeValue: { fontFamily: 'monospace', color: '#111827', fontWeight: '600' },
});
