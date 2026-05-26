import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader } from '../../components/Shared';
import { IconShield, IconCheck } from '../../icons';
import { rolesApi } from '../../services/api';
import { PERMISSION_GROUPS } from '../../data/mock';

export const RoleDetailScreen = ({ roleId, onBack }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.orgName || !roleId) return;
    let cancelled = false;
    rolesApi.getByName(user.orgName, roleId, token)
      .then(data => { if (!cancelled) setRole(data); })
      .catch(err => { if (!cancelled) console.warn('RoleDetail fetch failed:', err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.orgName, roleId, token]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (!role) {
    return (
      <View style={styles.center}>
        <Text style={{ color: T.textDim }}>{t('roles_screen.no_roles')}</Text>
      </View>
    );
  }

  const assignedPerms = new Set(role.rolePermissions ?? []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={[styles.roleIcon, { backgroundColor: T.accentSoft }]}>
              <IconShield color={T.accent} size={28} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.roleName}>{role.roleName}</Text>
              <Text style={styles.roleMeta}>{assignedPerms.size} {t('roles_screen.permissions').toLowerCase()}</Text>
            </View>
          </View>
        </Card>

        <SectionHeader title={t('roles_screen.permissions')} count={assignedPerms.size} />
        <View style={styles.permsContainer}>
          {PERMISSION_GROUPS.map((group) => (
            <Card key={group.name} style={styles.groupCard}>
              <Text style={styles.groupTitle}>{group.name.toUpperCase()}</Text>
              <View style={styles.permsList}>
                {group.perms.map((p) => {
                  const isAssigned = assignedPerms.has(p);
                  return (
                    <View key={p} style={styles.permItem}>
                      <IconCheck size={14} color={isAssigned ? T.accent : T.textFaint} />
                      <Text style={[styles.permText, !isAssigned && styles.permTextDim]}>{p}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: { backgroundColor: T.surface, borderWidth: 1, marginBottom: 24 },
  headerTop: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  roleIcon: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  roleName: { fontSize: 18, fontWeight: '700', color: T.text },
  roleMeta: { fontSize: 12, color: T.textDim, marginTop: 4 },
  permsContainer: { gap: 12, marginBottom: 24 },
  groupCard: { backgroundColor: T.surface, borderColor: T.borderSoft },
  groupTitle: { fontSize: 10, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 10 },
  permsList: { gap: 8 },
  permItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  permText: { fontSize: 12, color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  permTextDim: { color: T.textFaint },
});
