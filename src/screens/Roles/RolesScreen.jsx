import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { IconShield, IconPlus, IconChevron, IconLock } from '../../icons';
import { rolesApi } from '../../services/api';

export const RolesScreen = ({ onSelectRole, onCreate }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    if (!user?.orgName) return;
    setLoading(true);
    setError(null);
    try {
      const data = await rolesApi.listAll(user.orgName, token);
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [user?.orgName, token]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (error) {
    const isAccessDenied = error.toLowerCase().includes('access denied') || error.toLowerCase().includes('forbidden') || error.toLowerCase().includes('unauthorized');
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <IconLock size={32} color={isAccessDenied ? T.warn : (T.bad || '#ef4444')} />
        </View>
        <Text style={styles.errorTitle}>
          {isAccessDenied ? 'Permission Required' : 'Could Not Load Roles'}
        </Text>
        <Text style={styles.errorBody}>
          {isAccessDenied
            ? 'Your account does not have permission to manage roles. Ask your platform administrator to grant role management access to your account.'
            : error}
        </Text>
        {!isAccessDenied && (
          <Btn variant="surface" size="sm" style={{ marginTop: 12 }} onPress={fetchRoles}>Retry</Btn>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <SectionHeader title="Access Roles" subtitle="RBAC Configuration" />
          <Btn
            variant="primary"
            size="sm"
            style={styles.newBtn}
            onPress={onCreate}
          >
            <IconPlus size={14} color="#FFF" />
             New role
          </Btn>
        </View>

        <View style={styles.list}>
          {roles.map(r => (
            <Card
              key={r.roleName}
              onPress={() => onSelectRole?.(r.roleName)}
            >
              <View style={styles.roleRow}>
                <View style={[styles.roleIcon, { backgroundColor: T.accentSoft }]}>
                  <IconShield size={20} color={T.accent} />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>{r.roleName}</Text>
                  <Text style={styles.roleMeta}>
                    {r.rolePermissions?.length ?? 0} permissions
                  </Text>
                </View>
                <IconChevron size={18} color={T.textFaint} />
              </View>
            </Card>
          ))}
          {roles.length === 0 && (
            <View style={styles.emptyState}>
              <IconShield size={48} color={T.textFaint} />
              <Text style={styles.emptyTitle}>No custom roles yet</Text>
              <Text style={styles.emptyHint}>Create a role to define granular access permissions for your org.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 8, textAlign: 'center' },
  errorBody: { fontSize: 13, color: T.textDim, textAlign: 'center', lineHeight: 20 },
  scrollContent: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  newBtn: { flexDirection: 'row', gap: 4, height: 32, paddingHorizontal: 10 },
  list: { gap: 10 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  roleInfo: { flex: 1 },
  roleName: { fontSize: 14, fontWeight: '600', color: T.text },
  roleMeta: { fontSize: 11.5, color: T.textDim, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: T.text, marginTop: 12 },
  emptyHint: { fontSize: 13, color: T.textDim, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
