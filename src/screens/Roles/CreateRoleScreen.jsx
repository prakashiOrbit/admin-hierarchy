import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconShield, IconPlus, IconCheck } from '../../icons';
import { PERMISSION_GROUPS } from '../../data/mock';

export const CreateRoleScreen = ({ onCancel }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    permissions: new Set(),
  });

  const updateRoot = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const togglePermission = (perm) => {
    const next = new Set(form.permissions);
    if (next.has(perm)) {
      next.delete(perm);
    } else {
      next.add(perm);
    }
    setForm(prev => ({ ...prev, permissions: next }));
  };

  const isFormValid = form.name && form.permissions.size > 0;

  const handleCreate = () => {
    console.log('Create Role Payload:', JSON.stringify({
      ...form,
      permissions: Array.from(form.permissions)
    }, null, 2));
    // Implementation for API call to /api/roles/create
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ROLE IDENTITY</Text>
          
          <Field label="Role Name">
            <TextInput 
              value={form.name} 
              onChangeText={(v) => updateRoot('name', v)}
              placeholder="e.g. Ward Supervisor"
              leading={<IconShield size={18} color={T.textDim} />}
            />
          </Field>

          <Field label="Description (Optional)">
            <TextInput 
              value={form.description} 
              onChangeText={(v) => updateRoot('description', v)}
              placeholder="Brief purpose of this role"
            />
          </Field>
        </View>

        {/* Permissions Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT PERMISSIONS ({form.permissions.size})</Text>
          
          <View style={styles.permsContainer}>
            {PERMISSION_GROUPS.map((group) => (
              <Card key={group.id || group.name} style={styles.groupCard}>
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

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="ghost" full style={{ flex: 1 }} onPress={onCancel}>Cancel</Btn>
          <Btn 
            full 
            style={{ flex: 1.5 }} 
            onPress={handleCreate} 
            disabled={!isFormValid}
          >
            Create Role
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
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.surface,
  },
  permText: { fontSize: 13, color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  permTextDim: { color: T.textDim },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
