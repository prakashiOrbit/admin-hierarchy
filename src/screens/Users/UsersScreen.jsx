import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Chip, Avatar, RoleBadge } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconFilter, IconPlus, IconUsers } from '../../icons';
import { USERS, ROLES } from '../../data/mock';

export const UsersScreen = ({ onSelectUser }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');

  const filtered = USERS.filter(u => 
    u.name.toLowerCase().includes(query.toLowerCase()) &&
    (tab === 'all' || u.role === tab)
  );

  const tabs = [
    { id: 'all', label: 'All', count: USERS.length },
    { id: 'ORG_OWNER', label: 'Org Owners', count: USERS.filter(u => u.role === 'ORG_OWNER').length },
    { id: 'ORG_ADMIN', label: 'Org Admins', count: USERS.filter(u => u.role === 'ORG_ADMIN').length },
    { id: 'HOSP_OWNER', label: 'Hosp Owners', count: USERS.filter(u => u.role === 'HOSP_OWNER').length },
    { id: 'HOSP_ADMIN', label: 'Hosp Admins', count: USERS.filter(u => u.role === 'HOSP_ADMIN').length },
    { id: 'DOCTOR', label: 'Clinical', count: USERS.filter(u => u.role === 'DOCTOR' || u.role === 'NURSE').length },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search & Filter */}
        <View style={{ marginBottom: 20 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search users by name or email..."
            trailing={
              <TouchableOpacity style={styles.filterBtn}>
                <IconFilter size={20} color={T.textDim} />
              </TouchableOpacity>
            }
          />
        </View>

        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {tabs.map((t) => (
            <Chip
              key={t.id}
              active={tab === t.id}
              onPress={() => setTab(t.id)}
            >
              {t.label} · {t.count}
            </Chip>
          ))}
        </ScrollView>

        <SectionHeader title="System Users" subtitle={`${filtered.length} members`} />

        {/* List */}
        <View style={styles.list}>
          {filtered.map(u => (
            <Card 
              key={u.id} 
              onPress={() => onSelectUser?.(u.id)}
            >
              <View style={styles.userRow}>
                <Avatar name={u.name} size={42} />
                <View style={styles.userInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.userName} numberOfLines={1}>{u.name}</Text>
                    <StatusPill status={u.status} />
                  </View>
                  <Text style={styles.userEmail}>{u.email}</Text>
                  
                  <View style={styles.badgesRow}>
                    <RoleBadge role={u.role} />
                    {u.hospital !== '—' && (
                      <Text style={styles.hospitalText}>{u.hospital}</Text>
                    )}
                  </View>
                </View>
              </View>
            </Card>
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <IconUsers size={48} color={T.textFaint} />
              <Text style={styles.emptyTitle}>No users match</Text>
              <Text style={styles.emptyHint}>Try a different filter or invite someone new.</Text>
              
              <TouchableOpacity style={styles.inviteBtn}>
                <IconPlus size={16} color={T.accent} />
                <Text style={styles.inviteBtnText}>Invite user</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  filterBtn: {
    padding: 4,
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  list: {
    gap: 10,
  },
  userRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
    flex: 1,
    marginRight: 8,
  },
  userEmail: {
    fontSize: 11,
    color: T.textFaint,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  hospitalText: {
    fontSize: 10.5,
    color: T.textDim,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
    marginTop: 8,
  },
  emptyHint: {
    fontSize: 13,
    color: T.textDim,
    textAlign: 'center',
    lineHeight: 18,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: T.accentSoft,
    marginTop: 8,
  },
  inviteBtnText: {
    color: T.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
