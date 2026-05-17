import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, Avatar, RoleBadge, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconHospital, IconUsers, IconPulse, IconLock } from '../../icons';
import { ORGS, HOSPITALS, USERS } from '../../data/mock';

export const OrgDetailScreen = ({ orgId }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const org = ORGS.find(o => o.id === orgId) || ORGS[0];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.orgAvatar}>
              <Text style={styles.orgAvatarText}>
                {org.display.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.orgTitle}>{org.display}</Text>
                <StatusPill status={org.status} />
              </View>
              <Text style={styles.orgName}>{org.name}</Text>
              <Text style={styles.orgMeta}>{org.type} · {org.locale}</Text>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Hospitals', value: org.hospitals, color: T.accent },
            { label: 'Users', value: org.users.toLocaleString(), color: '#2DD4BF' },
            { label: 'Devices', value: org.devices.toLocaleString(), color: '#22D3EE' },
          ].map((stat, i) => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statLabel}>{stat.label.toUpperCase()}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Org Owners */}
        <View style={styles.section}>
          <SectionHeader title="ORGANISATION ADMINS" />
          <Card style={styles.listCard}>
            {USERS.filter(u => u.role === 'ORG_OWNER' || u.role === 'ORG_ADMIN').slice(0, 2).map((user, i) => (
              <View key={user.id} style={[styles.listItem, i > 0 && styles.listBorder]}>
                <Avatar size={36} initials={user.initials} />
                <View style={styles.listItemContent}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <RoleBadge role={user.role} />
              </View>
            ))}
          </Card>
        </View>

        {/* Hospitals */}
        <View style={styles.section}>
          <SectionHeader title="HOSPITALS" />
          <Card style={styles.listCard}>
            {HOSPITALS.slice(0, 4).map((hosp, i) => (
              <View key={hosp.id} style={[styles.listItem, i > 0 && styles.listBorder]}>
                <View style={styles.hospIcon}>
                  <IconHospital size={16} color={T.accent} />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.hospName}>{hosp.name}</Text>
                  <Text style={styles.hospMeta}>{hosp.code} · {hosp.beds} beds</Text>
                </View>
                <StatusPill status="ACTIVE" />
              </View>
            ))}
          </Card>
        </View>

        <Btn type="outline" style={styles.actionBtn}>
          <IconLock size={16} color={T.accent} /> Create Org Owner for this organisation
        </Btn>
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
  },
});
