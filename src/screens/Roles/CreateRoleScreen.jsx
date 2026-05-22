import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconShield, IconCheck } from '../../icons';
import { rolesApi } from '../../services/api';
import { PERMISSION_GROUPS } from '../../data/mock';

export const CreateRoleScreen = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    roleName: '',
    permissions: new Set(),
  });
  const [saving, setSaving] = useState(false);

  const togglePermission = (perm) => {
    const next = new Set(form.permissions);
    if (next.has(perm)) {
      next.delete(perm);
    } else {
      next.add(perm);
    }
    setForm(prev => ({ ...prev, permissions: next }));
  };

  const isFormValid = form.roleName.trim() && form.permissions.size > 0;

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName) return;
    setSaving(true);
    const payload = {
      roleName: form.roleName.trim(),
      rolePermissions: Array.from(form.permissions),
    };
    try {
      await rolesApi.create(user.orgName, payload, token);
      Alert.alert(t('common.success'), t('roles_screen.role_created'), [
        { text: t('common.done'), onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('roles_screen.role_name').toUpperCase()}</Text>

          <Field label={t('roles_screen.role_name')} required>
            <TextInput
              value={form.roleName}
              onChangeText={(v) => setForm(prev => ({ ...prev, roleName: v }))}
              placeholder={t('roles_screen.role_name')}
              leading={<IconShield size={18} color={T.textDim} />}
            />
          </Field>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('roles_screen.permissions').toUpperCase()} ({form.permissions.size})</Text>

          <View style={styles.permsContainer}>
            {PERMISSION_GROUPS.map((group) => (
              <Card key={group.name} style={styles.groupCard}>
                <Text style={styles.groupTitle}>{group.name.toUpperCase()}</Text>
                <View style={styles.permsList}>
                  {group.perms.map((p) => {
                    const isSelected = form.permissions.has(p);
                    return (
                      <TouchableOpacity
                        key={p}
                        style={styles.permItem}
                        onPress={() => togglePermission(p)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.checkbox,
                          isSelected && { backgroundColor: T.accent, borderColor: T.accent }
                        ]}>
                          {isSelected && <IconCheck size={12} color="#fff" />}
                        </View>
                        <Text style={[styles.permText, !isSelected && styles.permTextDim]}>{p}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="ghost" style={{ flex: 1 }} onPress={onCancel}>{t('common.cancel')}</Btn>
          <Btn
            style={{ flex: 1.5 }}
            onPress={handleCreate}
            disabled={!isFormValid || saving}
          >
            {saving ? t('common.loading') : t('roles_screen.create_role')}
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 16 },
  permsContainer: { gap: 12 },
  groupCard: { backgroundColor: T.surface, borderColor: T.borderSoft },
  groupTitle: { fontSize: 10, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 10 },
  permsList: { gap: 12 },
  permItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    borderColor: T.border, alignItems: 'center', justifyContent: 'center',
    backgroundColor: T.surface,
  },
  permText: { fontSize: 13, color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  permTextDim: { color: T.textDim },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
