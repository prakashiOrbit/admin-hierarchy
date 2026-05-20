import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconDoor, IconBuilding, IconTrash } from '../../icons';
import { wardApi } from '../../services/api';

const WARD_TYPES = ['ICU', 'GENERAL', 'EMERGENCY', 'PEDIATRICS', 'MATERNITY', 'SURGICAL'];

export const EditWardScreen = ({ ward, onCancel, onSave, onDelete }) => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [form, setForm] = useState({
    wardName: ward.wardName || '',
    wardType: ward.wardType || 'ICU',
    numberOfBeds: String(ward.numberOfBeds ?? ''),
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const isFormValid = form.wardName && form.numberOfBeds;

  const handleSave = async () => {
    setSaving(true);
    try {
      await wardApi.update(user.orgName, user.hospitalCode, ward.wardCode, form, token);
      Alert.alert('Success', 'Ward updated successfully.', [
        { text: 'OK', onPress: () => onSave({ ...ward, ...form }) },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update ward.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Ward',
      `Permanently delete "${ward.wardName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await wardApi.delete(user.orgName, user.hospitalCode, ward.wardCode, token);
              onDelete?.();
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete ward.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconDoor size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Editing <Text style={{ fontWeight: '700' }}>{ward.wardCode}</Text>. Ward code cannot be changed.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WARD IDENTITY</Text>

          <Field label="Ward Code">
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{ward.wardCode}</Text>
              </View>
            </Card>
          </Field>

          <Field label="Ward Name" required>
            <TextInput
              value={form.wardName}
              onChangeText={v => updateForm('wardName', v)}
              placeholder="e.g. Emergency Ward"
            />
          </Field>

          <Field label="Ward Type">
            <View style={styles.typeGrid}>
              {WARD_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, form.wardType === t && styles.typeBtnActive]}
                  onPress={() => updateForm('wardType', t)}
                >
                  <Text style={[styles.typeText, form.wardType === t && styles.typeTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Est. Beds" required>
            <TextInput
              value={form.numberOfBeds}
              onChangeText={v => updateForm('numberOfBeds', v.replace(/[^0-9]/g, ''))}
              placeholder="15"
              keyboardType="numeric"
            />
          </Field>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="ghost" style={{ flex: 1 }} onPress={onCancel} disabled={saving || deleting}>
            Cancel
          </Btn>
          <Btn
            style={{ flex: 1.5 }}
            onPress={handleSave}
            disabled={!isFormValid || saving || deleting}
          >
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : 'Save Changes'}
          </Btn>
        </View>

        <Btn
          variant="surface"
          style={styles.deleteBtn}
          onPress={confirmDelete}
          disabled={saving || deleting}
        >
          <IconTrash size={16} color={T.bad} />
          <Text style={[styles.deleteBtnText, { color: T.bad }]}>
            {deleting ? 'Deleting...' : 'Delete Ward'}
          </Text>
        </Btn>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  banner: {
    flexDirection: 'row', backgroundColor: T.accentSoft, padding: 14,
    borderRadius: 12, gap: 12, alignItems: 'flex-start', marginBottom: 24,
  },
  bannerText: { flex: 1, fontSize: 13, color: T.text, lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 16 },
  readOnlyCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface2, borderColor: T.borderSoft },
  readOnlyText: { color: T.textDim, fontSize: 14, fontFamily: 'monospace' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: T.borderSoft, backgroundColor: T.surface,
  },
  typeBtnActive: { backgroundColor: T.accent, borderColor: T.accent },
  typeText: { fontSize: 12, color: T.text, fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  deleteBtn: {
    marginTop: 16, flexDirection: 'row', gap: 8,
    borderWidth: 1, borderColor: T.bad + '40',
    backgroundColor: T.bad + '0D',
  },
  deleteBtnText: { fontSize: 14, fontWeight: '600' },
});
