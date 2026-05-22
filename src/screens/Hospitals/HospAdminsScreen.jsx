import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, SearchBar, Avatar, RoleBadge, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconPlus, IconChevron } from '../../icons';
import { userApi } from '../../services/api';

export const HospAdminsScreen = ({ onSelectUser, onInvite }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) return;
    userApi.listHospAdminsByHospital(user.orgName, user.hospitalCode, token)
      .then(res => {
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        setAdmins(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = admins.filter(u =>
    (`${u.firstName} ${u.lastName}`).toLowerCase().includes(query.toLowerCase()) ||
    u.userName?.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: 20 }}>
          <SearchBar
            placeholder={t('placeholders.search_admins')}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title={t('hospital.admins_title')} count={filtered.length} />
          <Btn
            variant="primary"
            size="sm"
            style={styles.newBtn}
            onPress={onInvite}
          >
            <IconPlus size={14} color="#fff" /> {t('actions.create_hosp_admin')}
          </Btn>
        </View>

        <View style={styles.list}>
          {filtered.map(u => {
            const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
            const role = u.userRoles?.[0] ?? 'HOSP_ADMIN';
            return (
              <Card key={u.userName} onPress={() => onSelectUser(u.userName)}>
                <View style={styles.userRow}>
                  <Avatar initials={initials} size={40} />
                  <View style={styles.userInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.userName}>{u.firstName} {u.lastName}</Text>
                      <RoleBadge role={role} />
                    </View>
                    <Text style={styles.userEmail}>{u.userName}</Text>
                    <View style={styles.badgesRow}>
                      <StatusPill status={u.status ?? 'ACTIVE'} />
                      {u.hospitalCode && (
                        <Text style={styles.hospitalText}>{u.hospitalCode}</Text>
                      )}
                    </View>
                  </View>
                  <IconChevron size={16} color={T.textFaint} />
                </View>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('messages.no_hosp_admins_found')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
