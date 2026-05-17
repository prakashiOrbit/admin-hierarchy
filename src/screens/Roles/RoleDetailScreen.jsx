import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { IconShield, IconEdit, IconCheck, IconPlus } from '../../icons';
import { ROLES_LIST, PERMISSION_GROUPS, ROLE_DEFAULT_PERMS } from '../../data/mock';

export const RoleDetailScreen = ({ roleId, onBack }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const role = ROLES_LIST.find(r => r.id === roleId) || ROLES_LIST[0];
  const assignedPerms = new Set(ROLE_DEFAULT_PERMS[role.id] || []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Role Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={[styles.roleIcon, { backgroundColor: role.color + '22' }]}>
              <IconShield color={role.color} size={28} />
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.roleName}>{role.name}</Text>
                {role.system && (
                  <View style={styles.systemBadge}>
                    <Text style={styles.systemText}>SYSTEM</Text>
                  </View>
                )}
              </View>
              <Text style={styles.roleMeta}>{role.members} members assigned</Text>
            </View>
          </View>
        </Card>

        {/* Permissions Grid */}
        <SectionHeader title="Permissions" count={assignedPerms.size} />
        <View style={styles.permsContainer}>
          {PERMISSION_GROUPS.map((group) => (
            <Card key={group.id} style={styles.groupCard}>
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

        {!role.system && (
          <View style={styles.actionGroup}>
            <View style={styles.actionRow}>
              <Btn 
                variant="ghost" 
                style={[styles.secondaryBtn, { flex: 1 }]}
              >
                <IconEdit size={16} color={T.text} />
                <Text style={styles.btnTextBlack}>Edit Details</Text>
              </Btn>
              <Btn 
                variant="ghost" 
                style={[styles.secondaryBtn, { flex: 1 }]}
              >
                <IconShield size={16} color={T.text} />
                <Text style={styles.btnTextBlack}>Modify Perms</Text>
              </Btn>
            </View>
            <Btn style={{ backgroundColor: T.accent }}>
              <IconPlus size={18} color="#fff" />
              <Text style={styles.btnTextWhite}>Assign Member</Text>
            </Btn>
          </View>
        )}

        <Btn 
          variant="ghost" 
          onPress={() => onBack?.()}
          style={{ marginTop: 8 }}
        >
          <Text style={{ color: T.textDim }}>Go Back</Text>
        </Btn>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    marginBottom: 24,
  },
  headerTop: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  roleIcon: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleName: { fontSize: 18, fontWeight: '700', color: T.text },
  systemBadge: { backgroundColor: T.surface2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  systemText: { fontSize: 9, color: T.textDim, fontWeight: '700', letterSpacing: 0.5, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  roleMeta: { fontSize: 12, color: T.textDim, marginTop: 4 },
  permsContainer: { gap: 12, marginBottom: 24 },
  groupCard: { backgroundColor: T.surface, borderColor: T.borderSoft },
  groupTitle: { fontSize: 10, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 10 },
  permsList: { gap: 8 },
  permItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  permText: { fontSize: 12, color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  permTextDim: { color: T.textFaint },
  actionGroup: { gap: 10, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { flexDirection: 'row', gap: 8, height: 44 },
  btnTextWhite: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  btnTextBlack: { color: T.text, fontWeight: '600', marginLeft: 8 },
});
