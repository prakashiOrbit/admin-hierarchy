import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconClock, IconDoor, IconTrash, IconBuilding } from '../../icons';
import { shiftApi, wardApi } from '../../services/api';

const STATUSES = ['ACTIVE', 'INACTIVE', 'COMPLETED'];

export const EditShiftScreen = ({ shift, onCancel, onSave, onDelete }) => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const extractTime = (dt) => {
    if (!dt) return '';
    try {
      const d = new Date(dt);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    } catch { return dt; }
  };

  const [form, setForm] = useState({
    shiftName: shift.shiftName || '',
    wardCode: shift.wardCode || '',
    startTime: extractTime(shift.startTime),
    endTime: extractTime(shift.endTime),
    status: shift.status || 'ACTIVE',
  });
  const [wards, setWards] = useState([]);
  const [wardsLoading, setWardsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) return;
    wardApi.listAll(user.orgName, user.hospitalCode, token)
      .then(data => setWards(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setWardsLoading(false));
  }, [user?.orgName, user?.hospitalCode, token]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const buildDateTime = (timeStr) => {
    const today = new Date().toISOString().split('T')[0];
    return `${today}T${timeStr || '00:00'}:00`;
  };

  const isValid = form.shiftName && form.wardCode;

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      shiftName: form.shiftName,
      wardCode: form.wardCode,
      startTime: buildDateTime(form.startTime),
      endTime: buildDateTime(form.endTime),
      status: form.status,
    };
    try {
      await shiftApi.update(user.orgName, user.hospitalCode, shift.shiftCode, payload, token);
      Alert.alert('Saved', 'Shift updated.', [{ text: 'OK', onPress: () => onSave?.() }]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update shift.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Shift',
      `Permanently delete "${shift.shiftName || shift.shiftCode}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await shiftApi.delete(user.orgName, user.hospitalCode, shift.shiftCode, token);
              onDelete?.();
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete shift.');
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
          <IconClock size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Editing <Text style={{ fontWeight: '700' }}>{shift.shiftCode}</Text>. Shift code cannot be changed.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Shift Identity" />

          <Field label="Shift Code">
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{shift.shiftCode}</Text>
              </View>
            </Card>
          </Field>

          <Field label="Shift Name" required>
            <TextInput value={form.shiftName} onChangeText={v => set('shiftName', v)} placeholder="Morning Shift" />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Start Time">
                <TextInput
                  value={form.startTime}
                  onChangeText={v => set('startTime', v)}
                  placeholder="08:00"
                  leading={<IconClock size={16} color={T.textFaint} />}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="End Time">
                <TextInput
                  value={form.endTime}
                  onChangeText={v => set('endTime', v)}
                  placeholder="16:00"
                  leading={<IconClock size={16} color={T.textFaint} />}
                />
              </Field>
            </View>
          </View>

          <Field label="Status">
            <View style={styles.statusRow}>
              {STATUSES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusBtn, form.status === s && styles.statusBtnActive]}
                  onPress={() => set('status', s)}
                >
                  <Text style={[styles.statusText, form.status === s && styles.statusTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Ward Assignment" />
          {wardsLoading ? (
            <ActivityIndicator color={T.accent} />
          ) : (
            <Field label="Ward" required>
              <View style={styles.wardGrid}>
                {wards.map(w => (
                  <TouchableOpacity
                    key={w.wardCode}
                    style={[styles.wardBtn, form.wardCode === w.wardCode && styles.wardBtnActive]}
                    onPress={() => set('wardCode', w.wardCode)}
                  >
                    <IconDoor size={13} color={form.wardCode === w.wardCode ? '#fff' : T.textDim} />
                    <Text style={[styles.wardText, form.wardCode === w.wardCode && styles.wardTextActive]}>
                      {w.wardCode}
                    </Text>
                  </TouchableOpacity>
                ))}
                {wards.length === 0 && (
                  <Text style={{ color: T.textFaint, fontSize: 12 }}>No wards available.</Text>
                )}
              </View>
            </Field>
          )}
        </View>

        <View style={styles.actionRow}>
          <Btn variant="ghost" style={{ flex: 1 }} onPress={onCancel} disabled={saving || deleting}>Cancel</Btn>
          <Btn style={{ flex: 1.5 }} onPress={handleSave} disabled={!isValid || saving || deleting}>
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
            {deleting ? 'Deleting...' : 'Delete Shift'}
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
  row: { flexDirection: 'row', gap: 12 },
  readOnlyCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface2, borderColor: T.borderSoft },
  readOnlyText: { color: T.textDim, fontSize: 14, fontFamily: 'monospace' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1,
    borderColor: T.borderSoft, backgroundColor: T.surface, alignItems: 'center',
  },
  statusBtnActive: { backgroundColor: T.accent, borderColor: T.accent },
  statusText: { fontSize: 11, fontWeight: '700', color: T.textDim },
  statusTextActive: { color: '#fff' },
  wardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wardBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: T.borderSoft, backgroundColor: T.surface,
  },
  wardBtnActive: { backgroundColor: T.accent, borderColor: T.accent },
  wardText: { fontSize: 12, color: T.text, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  wardTextActive: { color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  deleteBtn: {
    marginTop: 16, flexDirection: 'row', gap: 8,
    borderWidth: 1, borderColor: T.bad + '40', backgroundColor: T.bad + '0D',
  },
  deleteBtnText: { fontSize: 14, fontWeight: '600' },
});
