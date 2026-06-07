import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { rolesApi } from '../services/api';
import { IconCheck, IconChevron, IconShield, IconKey } from '../icons';

const ALL_PERMITS = [
  'permit.admin.alarm', 'permit.admin.bed', 'permit.admin.device', 'permit.admin.devicetype',
  'permit.admin.doctor', 'permit.admin.fetch', 'permit.admin.gateway', 'permit.admin.hospital',
  'permit.admin.image', 'permit.admin.nurse', 'permit.admin.nursingstation', 'permit.admin.patient',
  'permit.admin.roles', 'permit.admin.shift', 'permit.admin.users', 'permit.admin.ward',
  'permit.create.bed', 'permit.create.device', 'permit.create.doctor', 'permit.create.gateway',
  'permit.create.hospital', 'permit.create.image', 'permit.create.nurse', 'permit.create.nursingstation',
  'permit.create.patient', 'permit.create.role', 'permit.create.shift', 'permit.create.ward',
  'permit.assign.bed', 'permit.assign.device', 'permit.assign.gateway',
  'permit.allocate.doctor.patient', 'permit.allocate.gateway.ward',
  'permit.get', 'permit.set', 'permit.update.devicetype',
  'permit.upload.events', 'permit.upload.statedata', 'permit.upload.telemetry',
  'permit.app.admin.patient', 'permit.start.bootstrap',
];

const GROUPS = [
  { key: 'admin', permits: ALL_PERMITS.filter(p => p.startsWith('permit.admin.')) },
  { key: 'create', permits: ALL_PERMITS.filter(p => p.startsWith('permit.create.')) },
  { key: 'assign', permits: ALL_PERMITS.filter(p => p.startsWith('permit.assign.') || p.startsWith('permit.allocate.')) },
  { key: 'data', permits: ALL_PERMITS.filter(p => p === 'permit.get' || p === 'permit.set' || p.startsWith('permit.update.') || p.startsWith('permit.upload.')) },
  { key: 'app', permits: ALL_PERMITS.filter(p => p.startsWith('permit.app.') || p.startsWith('permit.start.')) },
];

function formatPermit(permit) {
  const parts = permit.split('.');
  return parts.length === 2 ? parts[1] : parts.slice(2).join('.');
}

// mode: 'full' | 'template' | 'custom'
// assignedRole: string | null
// customPermissions: string[] | null
export const PermissionPicker = ({ mode, assignedRole, customPermissions, onModeChange, onAssignedRoleChange, onCustomPermissionsChange, orgName, token }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);

  const [expanded, setExpanded] = useState({});
  const [roleTemplates, setRoleTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (mode === 'template' && orgName && token && roleTemplates.length === 0) {
      setLoadingTemplates(true);
      rolesApi.listAll(orgName, token)
        .then(res => {
          const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
          setRoleTemplates(list);
        })
        .catch(() => setRoleTemplates([]))
        .finally(() => setLoadingTemplates(false));
    }
  }, [mode, orgName, token]);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    onModeChange(newMode);
    if (newMode === 'full') {
      onAssignedRoleChange(null);
      onCustomPermissionsChange(null);
    } else if (newMode === 'template') {
      onCustomPermissionsChange(null);
    } else if (newMode === 'custom') {
      onAssignedRoleChange(null);
      if (!customPermissions) onCustomPermissionsChange([...ALL_PERMITS]);
    }
  };

  const togglePermit = (permit) => {
    if (!customPermissions) return;
    const next = customPermissions.includes(permit)
      ? customPermissions.filter(p => p !== permit)
      : [...customPermissions, permit];
    onCustomPermissionsChange(next);
  };

  const toggleGroup = (group) => {
    if (!customPermissions) return;
    const allChecked = group.permits.every(p => customPermissions.includes(p));
    const next = allChecked
      ? customPermissions.filter(p => !group.permits.includes(p))
      : [...customPermissions, ...group.permits.filter(p => !customPermissions.includes(p))];
    onCustomPermissionsChange(next);
  };

  const groupLabel = (key) => ({
    admin: t('permissions.group_admin', 'Administration'),
    create: t('permissions.group_create', 'Create Resources'),
    assign: t('permissions.group_assign', 'Assign & Allocate'),
    data: t('permissions.group_data', 'Data & Uploads'),
    app: t('permissions.group_app', 'App & System'),
  })[key] || key;

  const MODES = [
    { key: 'full', label: t('permissions.full_access', 'Full Access'), icon: <IconShield size={13} color={mode === 'full' ? T.accent : T.textDim} /> },
    { key: 'template', label: t('permissions.pick_template', 'Role Template'), icon: <IconKey size={13} color={mode === 'template' ? T.accent : T.textDim} /> },
    { key: 'custom', label: t('permissions.custom', 'Custom'), icon: <IconCheck size={13} color={mode === 'custom' ? T.accent : T.textDim} /> },
  ];

  return (
    <View>
      {/* Mode tabs */}
      <View style={styles.modeRow}>
        {MODES.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeBtn, mode === m.key && styles.modeBtnActive]}
            onPress={() => switchMode(m.key)}
          >
            {m.icon}
            <Text style={[styles.modeBtnText, mode === m.key && styles.modeBtnTextActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Hint */}
      <Text style={styles.hint}>
        {mode === 'full' && t('permissions.full_access_hint', 'Admin receives all default role permissions')}
        {mode === 'template' && t('permissions.custom_hint', 'Pick a saved role template to assign specific capabilities')}
        {mode === 'custom' && t('permissions.custom_hint', 'Assign specific capabilities to this admin')}
      </Text>

      {/* Template picker */}
      {mode === 'template' && (
        <View style={styles.templateList}>
          {loadingTemplates ? (
            <ActivityIndicator size="small" color={T.accent} style={{ marginVertical: 12 }} />
          ) : roleTemplates.length === 0 ? (
            <Text style={styles.emptyTemplates}>
              {t('permissions.no_templates', 'No role templates found. Create one in Roles & Permissions first.')}
            </Text>
          ) : (
            roleTemplates.map(role => {
              const isSelected = assignedRole === role.roleName;
              return (
                <TouchableOpacity
                  key={role.roleName}
                  style={[styles.templateRow, isSelected && styles.templateRowActive]}
                  onPress={() => onAssignedRoleChange(isSelected ? null : role.roleName)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxFull]}>
                    {isSelected && <IconCheck size={10} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.templateName, isSelected && { color: T.accent }]}>{role.roleName}</Text>
                    {role.rolePermissions?.length > 0 && (
                      <Text style={styles.templatePerms} numberOfLines={1}>
                        {role.rolePermissions.slice(0, 3).map(p => formatPermit(p)).join(', ')}
                        {role.rolePermissions.length > 3 ? ` +${role.rolePermissions.length - 3}` : ''}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}

      {/* Custom inline picker */}
      {mode === 'custom' && customPermissions !== null && (
        <View style={styles.groups}>
          {GROUPS.map(group => {
            const allChecked = group.permits.every(p => customPermissions.includes(p));
            const someChecked = group.permits.some(p => customPermissions.includes(p));
            const isOpen = expanded[group.key];
            const checkedCount = group.permits.filter(p => customPermissions.includes(p)).length;

            return (
              <View key={group.key} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <TouchableOpacity style={styles.groupCheckbox} onPress={() => toggleGroup(group)}>
                    <View style={[styles.checkbox, someChecked && styles.checkboxPartial, allChecked && styles.checkboxFull]}>
                      {allChecked && <IconCheck size={10} color="#fff" />}
                      {someChecked && !allChecked && <View style={styles.partialDot} />}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.groupLabelRow}
                    onPress={() => setExpanded(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                  >
                    <Text style={styles.groupLabel}>{groupLabel(group.key)}</Text>
                    <Text style={styles.groupCount}>{checkedCount}/{group.permits.length}</Text>
                    <IconChevron size={16} color={T.textDim} style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }} />
                  </TouchableOpacity>
                </View>
                {isOpen && (
                  <View style={styles.permitList}>
                    {group.permits.map(permit => (
                      <TouchableOpacity key={permit} style={styles.permitRow} onPress={() => togglePermit(permit)}>
                        <View style={[styles.checkbox, customPermissions.includes(permit) && styles.checkboxFull]}>
                          {customPermissions.includes(permit) && <IconCheck size={10} color="#fff" />}
                        </View>
                        <Text style={styles.permitText}>{formatPermit(permit)}</Text>
                        <Text style={styles.permitGroup}>{permit.split('.')[1]}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {customPermissions.length === 0 && (
            <Text style={[styles.hint, { color: T.bad, marginTop: 4 }]}>
              {t('permissions.none_selected', 'No permissions selected — admin will be locked out')}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: T.borderSoft,
    backgroundColor: T.surface,
  },
  modeBtnActive: { borderColor: T.accent, backgroundColor: T.accentSoft },
  modeBtnText: { fontSize: 11.5, fontWeight: '600', color: T.textDim },
  modeBtnTextActive: { color: T.accent },
  hint: { fontSize: 12, color: T.textDim, marginBottom: 12, lineHeight: 17 },
  templateList: { gap: 6, marginBottom: 4 },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.borderSoft,
    backgroundColor: T.surface,
  },
  templateRowActive: { borderColor: T.accent, backgroundColor: T.accentSoft },
  templateName: { fontSize: 13, fontWeight: '600', color: T.text },
  templatePerms: { fontSize: 11, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 2 },
  emptyTemplates: { fontSize: 12, color: T.textDim, textAlign: 'center', padding: 16, lineHeight: 18 },
  groups: { gap: 8 },
  groupCard: { borderRadius: 10, borderWidth: 1, borderColor: T.borderSoft, backgroundColor: T.surface, overflow: 'hidden' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, gap: 10 },
  groupCheckbox: { padding: 2 },
  groupLabelRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: T.text },
  groupCount: { fontSize: 11, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  permitList: { borderTopWidth: 1, borderTopColor: T.borderSoft, paddingVertical: 4 },
  permitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 12, gap: 10 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
    borderColor: T.borderSoft, alignItems: 'center', justifyContent: 'center', backgroundColor: T.surface2,
  },
  checkboxPartial: { borderColor: T.accent, backgroundColor: T.accentSoft },
  checkboxFull: { borderColor: T.accent, backgroundColor: T.accent },
  partialDot: { width: 8, height: 8, borderRadius: 2, backgroundColor: T.accent },
  permitText: { flex: 1, fontSize: 12, color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  permitGroup: { fontSize: 10, color: T.textFaint, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});
