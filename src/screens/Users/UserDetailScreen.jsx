import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Avatar, RoleBadge, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconHospital, IconUser, IconEdit, IconKey, IconPause, IconTrash } from '../../icons';
import { userApi } from '../../services/api';

export const UserDetailScreen = ({ userId, onBack, onEdit }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user: authUser, token } = useAuth();

  const [u, setU] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.orgName || !userId) return;
    let cancelled = false;
    userApi.getUserDetails(authUser.orgName, userId, token)
      .then(res => {
        if (cancelled) return;
        const userData = res?.data || res;
        setU(userData);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, authUser?.orgName, token]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (!u || Object.keys(u).length <= 2) { // Robust check if it's just a status response
    return (
      <View style={styles.center}>
        <Text style={{ color: T.textDim }}>{t('users.no_users')}</Text>
      </View>
    );
  }

  const firstName = u.firstName || '';
  const lastName = u.lastName || '';
  const fullName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (u.userName || t('dashboard.users'));
  const initials = u.initials || `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || u.userName?.[0]?.toUpperCase() || 'US';
  const role = u.role || u.userRoles?.[0] || '';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar initials={initials} size={64} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{fullName}</Text>
              <Text style={styles.userEmail}>{u.email || u.userName || t('users.no_email')}</Text>
              <View style={styles.badgesRow}>
                <StatusPill status={u.status ?? 'ACTIVE'} />
                {role ? <RoleBadge role={role} /> : null}
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.detailsCard}>
          {[
            { l: t('dashboard.hospitals'), v: u.hospitalCode ?? '—', i: <IconHospital size={16} color={T.textDim} /> },
            { l: t('auth.username'), v: u.userName ?? '—', i: <IconUser size={16} color={T.textDim} />, mono: true },
            { l: t('dashboard.organisations'), v: u.orgName ?? '—', i: <IconUser size={16} color={T.textDim} />, mono: true },
          ].map((row, i) => (
            <View key={i} style={[styles.detailItem, i > 0 && styles.itemBorder]}>
              <View style={styles.detailIcon}>{row.i}</View>
              <Text style={styles.detailLabel}>{row.l}</Text>
              <Text style={[styles.detailValue, row.mono && styles.mono]}>{row.v}</Text>
            </View>
          ))}
        </Card>

        <View style={styles.actionGrid}>
          <Btn variant="surface" style={styles.actionBtn} onPress={() => onEdit?.(u)}>
            <IconEdit size={16} color={T.text} />
            <Text style={styles.btnText}>{t('users.edit_profile')}</Text>
          </Btn>
          <Btn variant="surface" style={styles.actionBtn}>
            <IconKey size={16} color={T.text} />
            <Text style={styles.btnText}>{t('auth.forgot_password')}</Text>
          </Btn>
        </View>

      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  profileCard: { backgroundColor: 'rgba(59,130,246,0.03)', borderColor: 'rgba(59,130,246,0.1)', marginBottom: 16 },
  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: T.text },
  userEmail: { fontSize: 12, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  detailsCard: { backgroundColor: T.surface, marginBottom: 24 },
  detailItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  itemBorder: { borderTopWidth: 1, borderTopColor: T.borderSoft },
  detailIcon: { width: 16, color: T.textDim },
  detailLabel: { fontSize: 12, color: T.textDim, width: 90 },
  detailValue: { fontSize: 13, color: T.text, flex: 1, textAlign: 'right' },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', gap: 8 },
  secondaryBtn: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  btnText: { marginLeft: 8, fontWeight: '600', color: T.text },
});
