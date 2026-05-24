import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { Card, SectionHeader, SearchBar, Chip, Avatar, RoleBadge, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconFilter, IconPlus, IconUsers, IconShield } from '../../icons';

export const UsersScreen = ({ onSelectUser, onCreateBootstrapUser }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (showLoading = true) => {
    if (!user?.orgName) return;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [adminsRes, ownersRes, hospAdminsRes] = await Promise.all([
        userApi.listOrgAdmins(user.orgName, token).catch(() => []),
        userApi.listHospOwners(user.orgName, token).catch(() => []),
        userApi.listAllHospAdmins(user.orgName, token).catch(() => []),
      ]);
      
      const getList = (res) => Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const admins = getList(adminsRes);
      const owners = getList(ownersRes);
      const hospAdmins = getList(hospAdminsRes);

      // Combine and ensure roles are set correctly for categorization
      const allUsers = [
        ...admins.map(u => ({ ...u, role: u.role || 'ORG_ADMIN' })),
        ...owners.map(u => ({ ...u, role: u.role || 'HOSP_OWNER' })),
        ...hospAdmins.map(u => ({ ...u, role: u.role || 'HOSP_ADMIN' }))
      ];
      
      setUsers(allUsers);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.orgName, token, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(false);
  };

  const getRole = (u) => u.role || (u.roles && u.roles[0]) || 'USER';

  const filtered = users.filter(u => {
    const role = getRole(u);
    const matchesSearch = (u.userName?.toLowerCase().includes(query.toLowerCase()) || 
                           u.email?.toLowerCase().includes(query.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (tab === 'all') return true;
    if (tab === 'DOCTOR') return (role === 'DOCTOR' || role === 'NURSE');
    return role === tab;
  });

  const tabs = [
    { id: 'all', label: t('users.all_types', 'All'), count: users.length },
    { id: 'ORG_ADMIN', label: t('dashboard.org_admins', 'Org Admins'), count: users.filter(u => getRole(u) === 'ORG_ADMIN').length },
    { id: 'HOSP_OWNER', label: t('dashboard.hosp_owner', 'Hosp Owners'), count: users.filter(u => getRole(u) === 'HOSP_OWNER').length },
    { id: 'HOSP_ADMIN', label: t('dashboard.hosp_administrator', 'Hosp Admins'), count: users.filter(u => getRole(u) === 'HOSP_ADMIN').length },
    { id: 'DOCTOR', label: t('dashboard.medical_staff', 'Clinical'), count: users.filter(u => ['DOCTOR', 'NURSE'].includes(getRole(u))).length },
  ];

  return (
    <View style={styles.container}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('users.search_placeholder', 'Search users...')}
          trailing={
            <TouchableOpacity style={styles.filterBtn}>
              <IconFilter size={20} color={T.textDim} />
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} />
        }
      >
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

        <View style={styles.sectionRow}>
          <SectionHeader title={t('dashboard.users', 'System Users')} subtitle={`${filtered.length} ${t('dashboard.registered_users', 'members').replace(/\d+ /, '')}`} />
          {onCreateBootstrapUser && (
            <Btn variant="surface" size="sm" onPress={onCreateBootstrapUser} style={styles.bootstrapBtn}>
              <IconShield size={14} color={T.accent} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: T.accent }}>{t('bootstrap_user.create_btn')}</Text>
            </Btn>
          )}
        </View>

        {/* List */}
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={T.accent} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={[styles.errorText, { color: T.bad }]}>{error}</Text>
            <Btn variant="surface" size="sm" onPress={() => fetchUsers()} style={{ marginTop: 12 }}>
              {t('common.retry', 'Retry')}
            </Btn>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((u, idx) => (
              <Card 
                key={u.userName || idx}
                onPress={() => onSelectUser?.(u.userName)}
              >
                <View style={styles.userRow}>
                  <Avatar name={u.userName} size={42} />
                  <View style={styles.userInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.userName} numberOfLines={1}>{u.userName}</Text>
                      <StatusPill status={u.status || 'ACTIVE'} />
                    </View>
                    <Text style={styles.userEmail}>{u.email || t('users.no_email', 'No email')}</Text>
                    
                    <View style={styles.badgesRow}>
                      <RoleBadge role={getRole(u)} />
                      {u.hospitalCode && (
                        <Text style={styles.hospitalText}>{u.hospitalCode}</Text>
                      )}
                    </View>
                  </View>
                </View>
              </Card>
            ))}
            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <IconUsers size={48} color={T.textFaint} />
                <Text style={styles.emptyTitle}>{t('users.no_users', 'No users match')}</Text>
                <Text style={styles.emptyHint}>{t('users.no_users_hint', 'Try a different filter or search term.')}</Text>
              </View>
            )}
          </View>
        )}
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
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bootstrapBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 32 },
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
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
});
