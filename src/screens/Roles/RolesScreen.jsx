import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { IconShield, IconPlus, IconChevron } from '../../icons';
import { ROLES_LIST } from '../../data/mock';

export const RolesScreen = ({ onSelectRole }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <SectionHeader title="Access Roles" subtitle="RBAC Configuration" />
          <Btn 
            variant="primary" 
            size="small" 
            style={styles.newBtn}
            onPress={() => {}}
          >
            <IconPlus size={14} color="#FFF" />
             New role
          </Btn>
        </View>

        <View style={styles.list}>
          {ROLES_LIST.map(r => (
            <Card 
              key={r.id} 
              onPress={() => onSelectRole?.(r.id)}
            >
              <View style={styles.roleRow}>
                <View style={[styles.roleIcon, { backgroundColor: r.system ? T.surface2 : T.accentSoft }]}>
                  <IconShield size={20} color={r.system ? T.textDim : T.accent} />
                </View>
                <View style={styles.roleInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.roleName}>{r.name}</Text>
                    {r.system && (
                      <View style={styles.systemBadge}>
                        <Text style={styles.systemText}>SYSTEM</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.roleMeta}>
                    {r.permissions} permissions · {r.members} members
                  </Text>
                </View>
                <IconChevron size={18} color={T.textFaint} />
              </View>
            </Card>
          ))}
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
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleName: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  systemBadge: {
    backgroundColor: T.surface2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  systemText: {
    fontSize: 9,
    color: T.textDim,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  roleMeta: {
    fontSize: 11.5,
    color: T.textDim,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
