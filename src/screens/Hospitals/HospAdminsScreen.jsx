import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Avatar, RoleBadge, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconPlus, IconChevron } from '../../icons';
import { USERS, ROLES } from '../../data/mock';

export const HospAdminsScreen = ({ onSelectUser, onInvite }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');

  // Filter for Hospital Admins and Hospital Owners (excluding current user logic handled by dashboard if needed)
  const admins = USERS.filter(u => 
    (u.role === 'HOSP_ADMIN' || u.role === 'HOSP_OWNER') &&
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: 20 }}>
          <SearchBar 
            placeholder="Search administrators..."
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title="ADMINISTRATORS" count={admins.length} />
          
          <Btn 
            variant="primary" 
            size="sm"
            style={styles.newBtn} 
            onPress={onInvite}
          >
            <IconPlus size={14} color="#fff" /> Create Hosp Admin
          </Btn>
        </View>

        <View style={styles.list}>
          {admins.map(u => (
            <Card key={u.id} onPress={() => onSelectUser(u.id)}>
              <View style={styles.userRow}>
                <Avatar initials={u.initials} size={40} />
                <View style={styles.userInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <RoleBadge role={u.role} />
                  </View>
                  <Text style={styles.userEmail}>{u.email}</Text>
                  <View style={styles.badgesRow}>
                    <StatusPill status="ACTIVE" />
                    {u.hospital !== '—' && (
                      <Text style={styles.hospitalText}>{u.hospital}</Text>
                    )}
                  </View>
                </View>
                <IconChevron size={16} color={T.textFaint} />
              </View>
            </Card>
          ))}
          {admins.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hospital administrators found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  newBtn: { flexDirection: 'row', gap: 4, height: 32, paddingHorizontal: 10 },
  list: { gap: 10 },
  userRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  userInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  userName: { fontSize: 14, fontWeight: '600', color: T.text },
  userEmail: { fontSize: 11, color: T.textFaint, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  badgesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  hospitalText: { fontSize: 10.5, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: T.textDim, fontSize: 14 },
});
