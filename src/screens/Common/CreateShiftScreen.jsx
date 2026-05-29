import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconClock, IconDoor } from '../../icons';
import { wardApi, shiftApi } from '../../services/api';
import { buildDateTime } from '../../utils/shiftTime';

export const CreateShiftScreen = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [wards, setWards] = useState([]);
  const [wardsLoading, setWardsLoading] = useState(true);
  const [form, setForm] = useState({
    shiftCode: '',
    shiftName: '',
    wardCode: '',
    startTime: '08:00',
    endTime: '16:00',
    status: 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) return;
    wardApi.listAll(user.orgName, user.hospitalCode, token)
      .then(setWards)
      .catch(() => {})
      .finally(() => setWardsLoading(false));
  }, []);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));


  const isFormValid = form.shiftCode && form.shiftName && form.wardCode;

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    const payload = {
      shiftCode: form.shiftCode,
      shiftName: form.shiftName,
      wardCode: form.wardCode,
      startTime: buildDateTime(form.startTime),
      endTime: buildDateTime(form.endTime),
      status: form.status,
    };
    try {
      await shiftApi.create(user.orgName, user.hospitalCode, payload, token);
      Alert.alert(t('common.success'), t('alerts.shift_created', { code: form.shiftCode }), [
        { text: t('common.done'), onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('alerts.shift_create_failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <IconClock size={20} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('shift.create_banner', { hospital: user?.hospitalCode })}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('shift.details')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('shift.code')} required>
                <TextInput value={form.shiftCode} onChangeText={v => updateForm('shiftCode', v)} autoCapitalize="characters" placeholder={t('shift.code_placeholder')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('shift.name')} required>
                <TextInput value={form.shiftName} onChangeText={v => updateForm('shiftName', v)} placeholder={t('shift.name_placeholder')} />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('shift.start_time')}>
                <TextInput value={form.startTime} onChangeText={v => updateForm('startTime', v)} placeholder={t('shift.time_placeholder')} leading={<IconClock size={16} color={T.textDim} />} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('shift.end_time')}>
                <TextInput value={form.endTime} onChangeText={v => updateForm('endTime', v)} placeholder={t('shift.time_placeholder')} leading={<IconClock size={16} color={T.textDim} />} />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('shift.ward_assignment')} />
          {wardsLoading ? (
            <ActivityIndicator color={T.accent} />
          ) : (
            <Field label={t('shift.select_ward')} required>
              <View style={styles.pickerGrid}>
                {wards.map(w => (
                  <TouchableOpacity
                    key={w.wardCode}
                    style={[styles.pickerItem, form.wardCode === w.wardCode && styles.pickerActive]}
                    onPress={() => updateForm('wardCode', w.wardCode)}
                  >
                    <IconDoor size={14} color={form.wardCode === w.wardCode ? '#fff' : T.textDim} />
                    <Text style={[styles.pickerText, form.wardCode === w.wardCode && styles.pickerTextActive]}>
                      {w.wardCode}
                    </Text>
                  </TouchableOpacity>
                ))}
                {wards.length === 0 && (
                  <Text style={{ color: T.textFaint, fontSize: 12 }}>{t('shift.no_wards_available')}</Text>
                )}
              </View>
            </Field>
          )}
        </View>

        <View style={styles.actionRow}>
          <Btn variant="soft" style={{ flex: 1 }} onPress={onCancel}>{t('common.cancel')}</Btn>
          <Btn style={{ flex: 1 }} onPress={handleCreate} disabled={!isFormValid || saving}>
            {saving ? t('actions.creating') : t('actions.create_shift')}
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  banner: { flexDirection: 'row', backgroundColor: T.accentSoft, padding: 14, borderRadius: 12, gap: 12, alignItems: 'flex-start', marginBottom: 24 },
  bannerText: { flex: 1, fontSize: 13, color: T.text, lineHeight: 18 },
  section: { marginBottom: 24 },
  row: { flexDirection: 'row', gap: 10 },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: T.borderSoft, backgroundColor: T.surface },
  pickerActive: { backgroundColor: T.accent, borderColor: T.accent },
  pickerText: { fontSize: 12, color: T.text, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  pickerTextActive: { color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
