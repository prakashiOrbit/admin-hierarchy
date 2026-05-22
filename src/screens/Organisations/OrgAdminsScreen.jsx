import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { Card, SectionHeader, SearchBar, Avatar, RoleBadge, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconPlus, IconChevron, IconUsers } from '../../icons';

export const OrgAdminsScreen = ({ onSelectUser, onInvite }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState(null);

  const fetchAdmins = useCallback(async (showLoading = true) => {
    if (!user?.orgName) return;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const response = await userApi.listOrgAdmins(user.orgName, token);
      const list = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
      const filteredAdmins = list.filter(u => u.userRoles?.includes('ORG_ADMIN') || u.role === 'ORG_ADMIN');
      setAdmins(filteredAdmins);
    } catch (err) {
      console.error('Fetch admins error:', err);
      setError(err.message || t('admins.failed_load'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.orgName, token, t]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdmins(false);
  };

  const filtered = admins.filter(u => 
    (u.userName?.toLowerCase().includes(query.toLowerCase()) ||
     u.email?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <SearchBar 
          placeholder={t('admins.search_placeholder')}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} />
        }
      >
        <View style={styles.headerRow}>
          <SectionHeader title={t('admins.title')} count={filtered.length} />
          
          <Btn 
            variant="primary" 
            size="sm"
            style={styles.newBtn} 
            onPress={onInvite}
          >
            <IconPlus size={14} color="#fff" /> {t('admins.create_admin')}
          </Btn>
        </View>

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={T.accent} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={[styles.errorText, { color: T.bad }]}>{error}</Text>
            <Btn variant="surface" size="sm" onPress={() => fetchAdmins()} style={{ marginTop: 12 }}>
              {t('common.retry')}
            </Btn>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <IconUsers size={48} color={T.textFaint} />
            <Text style={[styles.emptyText, { color: T.textDim }]}>
              {query ? t('admins.no_matching') : t('admins.no_provisioned')}
            </Text>
            {!query && (
              <Btn variant="tonal" size="sm" onPress={onInvite} style={{ marginTop: 16 }}>
                {t('admins.invite_first')}
              </Btn>
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((u, idx) => (
              <Card key={u.userName || idx} onPress={() => onSelectUser?.(u.userName)}>
                <View style={styles.userRow}>
                  <Avatar name={u.userName} size={40} />
                  <View style={styles.userInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.userName}>{u.userName}</Text>
                      <RoleBadge role={u.role || (u.roles && u.roles[0]) || 'ORG_ADMIN'} />
                    </View>
                    <Text style={styles.userEmail}>{u.email || t('admins.no_email')}</Text>
                    <View style={styles.badgesRow}>
                      <StatusPill status={u.status || 'ACTIVE'} />
                    </View>
                  </View>
                  <IconChevron size={16} color={T.textFaint} />
                </View>
              </Card>
            ))}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newBtn: {
    flexDirection: 'row',
    gap: 4,
    height: 32,
    paddingHorizontal: 10,
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
  },
  userEmail: {
    fontSize: 11,
    color: T.textFaint,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 6,
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
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
