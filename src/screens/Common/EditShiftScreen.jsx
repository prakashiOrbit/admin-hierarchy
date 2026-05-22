import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconClock, IconDoor, IconTrash, IconBuilding } from '../../icons';
import { shiftApi, wardApi } from '../../services/api';

const STATUSES = ['ACTIVE', 'INACTIVE', 'COMPLETED'];

export const EditShiftScreen = ({ shift, onCancel, onSave, onDelete }) => {
  const { t } = useTranslation();
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
      Alert.alert(t('common.saved'), t('alerts.shift_updated'), [{ text: t('common.done'), onPress: () => onSave?.() }]);
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('alerts.shift_update_failed'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      t('alerts.delete_shift'),
      t('alerts.confirm_delete_shift', { name: shift.shiftName || shift.shiftCode }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'), style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await shiftApi.delete(user.orgName, user.hospitalCode, shift.shiftCode, token);
              onDelete?.();
            } catch (e) {
              Alert.alert(t('common.error'), e.message || t('alerts.shift_delete_failed'));
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
            {t('shift.edit_banner', { code: shift.shiftCode })}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('shift.identity')} />

          <Field label={t('shift.code')}>
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{shift.shiftCode}</Text>
              </View>
            </Card>
          </Field>

          <Field label={t('shift.name')} required>
            <TextInput value={form.shiftName} onChangeText={v => set('shiftName', v)} placeholder={t('shift.name_placeholder')} />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('shift.start_time')}>
                <TextInput
                  value={form.startTime}
                  onChangeText={v => set('startTime', v)}
                  placeholder={t('shift.time_placeholder')}
                  leading={<IconClock size={16} color={T.textFaint} />}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('shift.end_time')}>
                <TextInput
                  value={form.endTime}
                  onChangeText={v => set('endTime', v)}
                  placeholder={t('shift.time_placeholder')}
                  leading={<IconClock size={16} color={T.textFaint} />}
                />
              </Field>
            </View>
          </View>

          <Field label={t('shift.status')}>
            <View style={styles.statusRow}>
              {STATUSES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusBtn, form.status === s && styles.statusBtnActive]}
                  onPress={() => set('status', s)}
                >
                  <Text style={[styles.statusText, form.status === s && styles.statusTextActive]}>
                    {t(`shift.status_${s.toLowerCase()}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('shift.ward_assignment')} />
          {wardsLoading ? (
            <ActivityIndicator color={T.accent} />
          ) : (
            <Field label={t('shift.ward')} required>
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
                  <Text style={{ color: T.textFaint, fontSize: 12 }}>{t('shift.no_wards')}</Text>
                )}
              </View>
            </Field>
          )}
        </View>

        <View style={styles.actionRow}>
          <Btn variant="ghost" style={{ flex: 1 }} onPress={onCancel} disabled={saving || deleting}>{t('common.cancel')}</Btn>
          <Btn style={{ flex: 1.5 }} onPress={handleSave} disabled={!isValid || saving || deleting}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : t('actions.save_changes')}
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
            {deleting ? t('actions.deleting') : t('actions.delete_shift')}
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
