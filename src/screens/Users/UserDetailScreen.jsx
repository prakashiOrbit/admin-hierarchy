import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, Avatar, RoleBadge, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconHospital, IconUser, IconClock, IconCalendar, IconEdit, IconKey, IconPause, IconTrash } from '../../icons';
import { USERS, ROLES } from '../../data/mock';

export const UserDetailScreen = ({ userId, onBack }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const u = USERS.find(x => x.id === userId) || USERS[0];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar name={u.name} size={64} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userEmail}>{u.email}</Text>
              <View style={styles.badgesRow}>
                <StatusPill status={u.status} />
                <RoleBadge role={u.role} />
              </View>
            </View>
          </View>
        </Card>

        {/* Details List */}
        <Card style={styles.detailsCard}>
          {[
            { l: 'Hospital', v: u.hospital, i: <IconHospital size={16} color={T.textDim} /> },
            { l: 'Username', v: u.email.split('@')[0], i: <IconUser size={16} color={T.textDim} />, mono: true },
            { l: 'Last sign-in', v: '2h ago · Pixel 8 · Cleveland, OH', i: <IconClock size={16} color={T.textDim} /> },
            { l: 'Created', v: '14 Feb 2026 by p.raghunathan', i: <IconCalendar size={16} color={T.textDim} /> },
          ].map((row, i) => (
            <View key={i} style={[styles.detailItem, i > 0 && styles.itemBorder]}>
              <View style={styles.detailIcon}>{row.i}</View>
              <Text style={styles.detailLabel}>{row.l}</Text>
              <Text style={[styles.detailValue, row.mono && styles.mono]}>{row.v}</Text>
            </View>
          ))}
        </Card>

        {/* Actions */}
        <View style={styles.actionGrid}>
          <Btn variant="surface" style={styles.actionBtn}>
            <IconEdit size={16} color={T.text} />
            <Text style={styles.btnText}>Edit</Text>
          </Btn>
          <Btn variant="surface" style={styles.actionBtn}>
            <IconKey size={16} color={T.text} />
            <Text style={styles.btnText}>Reset password</Text>
          </Btn>
        </View>

        <Btn variant="surface" style={styles.secondaryBtn}>
          <IconPause size={16} color={T.text} />
          <Text style={styles.btnText}>{u.status === 'ACTIVE' ? 'Deactivate user' : 'Reactivate user'}</Text>
        </Btn>

        <Btn variant="surface" style={[styles.secondaryBtn, { borderColor: T.errorSoft }]}>
          <IconTrash size={16} color={T.error} />
          <Text style={[styles.btnText, { color: T.error }]}>Delete user</Text>
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
  profileCard: {
    backgroundColor: 'rgba(59,130,246,0.03)',
    borderColor: 'rgba(59,130,246,0.1)',
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
  },
  userEmail: {
    fontSize: 12,
    color: T.textDim,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  detailsCard: {
    backgroundColor: T.surface,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  itemBorder: {
    borderTopWidth: 1,
    borderTopColor: T.borderSoft,
  },
  detailIcon: {
    width: 16,
    color: T.textDim,
  },
  detailLabel: {
    fontSize: 12,
    color: T.textDim,
    width: 90,
  },
  detailValue: {
    fontSize: 13,
    color: T.text,
    flex: 1,
    textAlign: 'right',
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  btnText: {
    marginLeft: 8,
    fontWeight: '600',
  },
});
