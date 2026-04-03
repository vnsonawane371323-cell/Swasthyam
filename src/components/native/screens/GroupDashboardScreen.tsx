import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Progress } from '../Progress';

interface GroupDashboardScreenProps {
  navigation: any;
  route: { params?: { group?: any } };
}

export function GroupDashboardScreen({ navigation, route }: GroupDashboardScreenProps) {
  const group = route.params?.group || { name: 'Kumar Family', members: 5, score: 780 };
  const members = [
    { name: 'Raj Kumar (Admin)', avatar: '👨', contribution: 250, status: 'Active' },
    { name: 'Priya Kumar', avatar: '👩', contribution: 220, status: 'Active' },
    { name: 'Aarav Kumar', avatar: '👦', contribution: 180, status: 'Active' },
    { name: 'Diya Kumar', avatar: '👧', contribution: 130, status: 'Active' },
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
              <Text style={styles.headerTitle}>{group.name}</Text>
              <Text style={styles.headerSubtitle}>{group.members} members</Text>
            </View>
          </View>
          <Card style={styles.statsCard}>
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Oil Saved</Text>
                <Text style={styles.statValue}>8.5 KG</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Group Points</Text>
                <Text style={styles.statValue}>{group.score}</Text>
              </View>
            </View>
          </Card>
        </View>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Member Contributions</Text>
          {members.map((member, index) => (
            <Card key={index}>
              <View style={styles.memberContent}>
                <Text style={styles.memberAvatar}>{member.avatar}</Text>
                  <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Badge variant="success"><Text style={{color: '#16a34a', fontSize: 12}}>{member.contribution} pts</Text></Badge>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  header: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, gap: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#dbeafe', marginTop: 2 },
  statsCard: { backgroundColor: 'rgba(255,255,255,0.2)' },
  statsContent: { flexDirection: 'row', gap: 16 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 12, color: '#dbeafe', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#fff' },
  content: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  memberContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberAvatar: { fontSize: 32 },
  memberInfo: { flex: 1, gap: 8 },
  memberName: { fontSize: 16, fontWeight: '600', color: '#111827' },
});
