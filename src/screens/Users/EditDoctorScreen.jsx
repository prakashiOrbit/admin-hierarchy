import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, PhoneInput, Btn, SectionHeader } from '../../components/Shared';
import { DatePickerModal } from '../../components/DatePickerModal';
import { IconStethoscope, IconMail, IconCalendar, IconActivity, IconBuilding } from '../../icons';
import { doctorApi } from '../../services/api';

const DOCTOR_TYPES = ['SPECIALIST', 'GENERAL', 'CONSULTANT', 'RESIDENT'];

export const EditDoctorScreen = ({ doctor, onCancel, onSave }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [form, setForm] = useState({
    firstName: doctor.firstName || '',
    lastName: doctor.lastName || '',
    doctorSpeciality: Array.isArray(doctor.doctorSpeciality) ? doctor.doctorSpeciality.join(', ') : (doctor.doctorSpeciality || ''),
    doctorExperience: String(doctor.doctorExperience ?? ''),
    birthDate: doctor.birthDate || '',
    gender: doctor.gender || 'MALE',
    doctorType: doctor.doctorType || 'SPECIALIST',
    email: doctor.myContact?.email || '',
    phone: doctor.myContact?.phone || '',
    city: doctor.myAddress?.city || '',
    state: doctor.myAddress?.state || '',
  });
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const isValid = form.firstName && form.lastName && form.email;

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      doctorSpeciality: form.doctorSpeciality.split(',').map(s => s.trim()).filter(Boolean),
      doctorExperience: parseFloat(form.doctorExperience) || 0,
      birthDate: form.birthDate,
      gender: form.gender,
      doctorType: form.doctorType,
      myContact: { email: form.email, phone: form.phone },
      myAddress: { city: form.city, state: form.state },
    };
    try {
      await doctorApi.update(user.orgName, doctor.hospitalCode || user.hospitalCode, doctor.doctorCode, payload, token);
      Alert.alert(t('common.success'), t('users.doctor_updated'), [{ text: t('common.done'), onPress: () => onSave?.() }]);
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('users.update_failed_doctor'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconStethoscope size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('users.editing')} <Text style={{ fontWeight: '700' }}>{doctor.doctorCode}</Text>. {t('users.immutable_code_doctor')}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('users.professional_identity')} />

          <Field label={t('users.doctor_code')}>
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{doctor.doctorCode}</Text>
              </View>
            </Card>
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('users.first_name')} required>
                <TextInput value={form.firstName} onChangeText={v => set('firstName', v)} placeholder="Gregory" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('users.last_name')} required>
                <TextInput value={form.lastName} onChangeText={v => set('lastName', v)} placeholder="House" />
              </Field>
            </View>
          </View>

          <Field label={t('users.speciality_csv')}>
            <TextInput
              value={form.doctorSpeciality}
              onChangeText={v => set('doctorSpeciality', v)}
              placeholder="Diagnostics, Nephrology"
              leading={<IconActivity size={16} color={T.textFaint} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('users.experience')}>
                <TextInput
                  value={form.doctorExperience}
                  onChangeText={v => set('doctorExperience', v.replace(/[^0-9.]/g, ''))}
                  placeholder="5.0"
                  keyboardType="decimal-pad"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('users.dob')}>
                <Card
                  style={styles.dateCard}
                  padding={12}
                  onPress={() => setShowDatePicker(true)}
                >
                  <IconCalendar size={16} color={T.textFaint} />
                  <Text style={[styles.dateText, !form.birthDate && { color: T.textFaint }]}>
                    {form.birthDate || 'YYYY-MM-DD'}
                  </Text>
                </Card>
              </Field>
            </View>
          </View>

          <Field label={t('users.type')}>
            <View style={styles.typeGrid}>
              {DOCTOR_TYPES.map(t_item => (
                <TouchableOpacity
                  key={t_item}
                  style={[styles.typeBtn, form.doctorType === t_item && styles.typeBtnActive]}
                  onPress={() => set('doctorType', t_item)}
                >
                  <Text style={[styles.typeText, form.doctorType === t_item && styles.typeTextActive]}>{t_item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label={t('users.gender')}>
            <View style={styles.row}>
              {['MALE', 'FEMALE'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.radioBtn, { flex: 1 }, form.gender === g && styles.radioActive]}
                  onPress={() => set('gender', g)}
                >
                  <Text style={[styles.radioText, form.gender === g && styles.radioTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('users.contact_location')} />
          <Field label={t('users.email')} required>
            <TextInput
              value={form.email}
              onChangeText={v => set('email', v.toLowerCase())}
              placeholder="house@hospital.org"
              keyboardType="email-address"
              leading={<IconMail size={16} color={T.textFaint} />}
            />
          </Field>
          <Field label={t('users.phone')}>
            <PhoneInput value={form.phone} onChangeText={v => set('phone', v)} />
          </Field>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('users.city')}>
                <TextInput value={form.city} onChangeText={v => set('city', v)} placeholder="Princeton" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('users.state')}>
                <TextInput value={form.state} onChangeText={v => set('state', v)} placeholder="NJ" />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="ghost" style={{ flex: 1 }} onPress={onCancel} disabled={saving}>{t('common.cancel')}</Btn>
          <Btn style={{ flex: 1.5 }} onPress={handleSave} disabled={!isValid || saving}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : t('users.save_changes')}
          </Btn>
        </View>
      </ScrollView>

      <DatePickerModal
        visible={showDatePicker}
        value={form.birthDate}
        onConfirm={date => { set('birthDate', date); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />
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
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: T.borderSoft, backgroundColor: T.surface,
  },
  typeBtnActive: { backgroundColor: T.accent, borderColor: T.accent },
  typeText: { fontSize: 12, color: T.text, fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  radioBtn: {
    height: 42, borderRadius: 10, borderWidth: 1, borderColor: T.borderSoft,
    alignItems: 'center', justifyContent: 'center', backgroundColor: T.surface,
  },
  radioActive: { backgroundColor: T.accent, borderColor: T.accent },
  radioText: { fontSize: 13, fontWeight: '600', color: T.textDim },
  radioTextActive: { color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  dateCard: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.surface },
  dateText: { flex: 1, fontSize: 14, color: T.text },
});
