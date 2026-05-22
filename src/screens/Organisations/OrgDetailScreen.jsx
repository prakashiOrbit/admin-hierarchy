import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Avatar, RoleBadge, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconHospital, IconUsers, IconPulse, IconLock, IconUserPlus } from '../../icons';
import { organisationApi, userApi, summaryApi } from '../../services/api';

export const OrgDetailScreen = ({ org, onInviteOwner }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { token } = useAuth();
  const styles = createStyles(T);

  const [hospitals, setHospitals] = useState([]);
  const [owners, setOwners] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hospError, setHospError] = useState(null);
  const [ownersError, setOwnersError] = useState(null);

  useEffect(() => {
    if (!org?.orgName) return;
    setLoading(true);
    setHospError(null);
    setOwnersError(null);

    const fetchHospitals = organisationApi.listHospitals(org.orgName, token)
      .then(data => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setHospitals(list);
      })
      .catch(err => setHospError(err.message || t('orgs.error_load_hospitals')));

    const fetchOwners = userApi.listOrgOwners(org.orgName, token)
      .then(data => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setOwners(list);
      })
      .catch(err => setOwnersError(err.message || t('orgs.error_load_owners')));

    const fetchSummary = summaryApi.getOrgSummary(org.orgName, token)
      .then(setSummary)
      .catch(() => {});

    Promise.all([fetchHospitals, fetchOwners, fetchSummary]).finally(() => setLoading(false));
  }, [org?.orgName, token]);

  const initials = (org.businessName || org.orgName || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.orgAvatar}>
              <Text style={styles.orgAvatarText}>{initials}</Text>
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.orgTitle} numberOfLines={1}>{org.businessName || org.orgName}</Text>
                <StatusPill status={org.deleted ? 'INACTIVE' : 'ACTIVE'} />
              </View>
              <Text style={styles.orgName}>{org.orgName}</Text>
              <Text style={styles.orgMeta}>{org.orgType || t('orgs.type_org')} · {org.locale || 'en-IN'}</Text>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: t('orgs.stats.hospitals'), value: summary?.stats?.totalHospitals ?? hospitals.length, color: T.accent },
            { label: t('orgs.stats.users'), value: summary?.stats?.totalUsers ?? owners.length, color: '#2DD4BF' },
            { label: t('orgs.stats.devices'), value: summary?.devices ?? summary?.totalDevices ?? '—', color: '#22D3EE' },
          ].map((stat, i) => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statLabel}>{stat.label.toUpperCase()}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Org Owners */}
        <View style={styles.section}>
          <SectionHeader title={t('orgs.owners_title')} count={owners.length} />
          <Card style={styles.listCard}>
            {loading ? (
              <ActivityIndicator color={T.accent} style={{ padding: 20 }} />
            ) : ownersError ? (
              <View style={styles.errorItem}>
                <IconLock size={16} color={T.bad || '#ef4444'} />
                <Text style={styles.errorItemText}>{ownersError}</Text>
              </View>
            ) : owners.length > 0 ? (
              owners.map((user, i) => (
                <View key={user.id || i} style={[styles.listItem, i > 0 && styles.listBorder]}>
                  <Avatar name={user.userName} size={36} />
                  <View style={styles.listItemContent}>
                    <Text style={styles.userName}>{user.userName}</Text>
                    <Text style={styles.userEmail}>{user.email || t('admins.no_email')}</Text>
                  </View>
                  <RoleBadge role={user.role || 'ORG_OWNER'} />
                </View>
              ))
            ) : (
              <View style={styles.emptyItem}>
                <Text style={styles.emptyText}>{t('orgs.no_owners')}</Text>
              </View>
            )}
          </Card>
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
    paddingBottom: 40,
  },
  headerCard: {
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
    backgroundColor: 'rgba(59,130,246,0.03)',
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    gap: 16,
  },
  orgAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: T.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  orgTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
    flex: 1,
  },
  orgName: {
    fontSize: 12,
    color: T.textDim,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  orgMeta: {
    fontSize: 12,
    color: T.textDim,
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.borderSoft,
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    fontSize: 10,
    color: T.textDim,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  section: {
    marginBottom: 24,
  },
  listCard: {
    backgroundColor: T.surface,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  listBorder: {
    borderTopWidth: 1,
    borderTopColor: T.borderSoft,
  },
  listItemContent: {
    flex: 1,
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
    marginTop: 2,
  },
  hospIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: T.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospName: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  hospMeta: {
    fontSize: 11,
    color: T.textFaint,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  actionBtn: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  emptyItem: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: T.textFaint,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  errorItemText: {
    fontSize: 13,
    color: T.bad || '#ef4444',
    flex: 1,
  },
});
