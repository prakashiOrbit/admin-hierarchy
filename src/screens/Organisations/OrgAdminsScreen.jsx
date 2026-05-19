import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { Card, SectionHeader, SearchBar, Avatar, RoleBadge, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconPlus, IconChevron, IconUsers } from '../../icons';

export const OrgAdminsScreen = ({ onSelectUser, onInvite }) => {
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
      // Assuming response is an array of users, filter for ORG_ADMIN if backend doesn't already
      const filteredAdmins = (Array.isArray(response) ? response : [])
        .filter(u => u.roles?.includes('ORG_ADMIN') || u.role === 'ORG_ADMIN');
      setAdmins(filteredAdmins);
    } catch (err) {
      console.error('Fetch admins error:', err);
      setError(err.message || 'Failed to load administrators');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.orgName, token]);

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
          placeholder="Search administrators..."
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
          <SectionHeader title="ADMINISTRATORS" count={filtered.length} />
          
          <Btn 
            variant="primary" 
            size="sm"
            style={styles.newBtn} 
            onPress={onInvite}
          >
            <IconPlus size={14} color="#fff" /> Create Org Admin
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
              Retry
            </Btn>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <IconUsers size={48} color={T.textFaint} />
            <Text style={[styles.emptyText, { color: T.textDim }]}>
              {query ? 'No matching administrators found' : 'No administrators provisioned yet'}
            </Text>
            {!query && (
              <Btn variant="tonal" size="sm" onPress={onInvite} style={{ marginTop: 16 }}>
                Invite First Admin
              </Btn>
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((u, idx) => (
              <Card key={u.id || idx} onPress={() => onSelectUser?.(u.id)}>
                <View style={styles.userRow}>
                  <Avatar name={u.userName} size={40} />
                  <View style={styles.userInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.userName}>{u.userName}</Text>
                      <RoleBadge role={u.role || (u.roles && u.roles[0]) || 'ORG_ADMIN'} />
                    </View>
                    <Text style={styles.userEmail}>{u.email || 'No email'}</Text>
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
