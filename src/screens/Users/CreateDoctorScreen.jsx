import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconMail, IconPhone, IconStethoscope, IconCalendar, IconActivity } from '../../icons';
import { doctorApi } from '../../services/api';

export const CreateDoctorScreen = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    doctorCode: '',
    firstName: '',
    lastName: '',
    doctorSpeciality: '',
    doctorExperience: '',
    birthDate: '',
    gender: 'MALE',
    doctorType: 'SPECIALIST',
    myContact: { email: '', phone: '' },
    myAddress: { city: '', state: '' },
  });
  const [saving, setSaving] = useState(false);

  const updateRoot = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateContact = (key, value) => setForm(prev => ({ ...prev, myContact: { ...prev.myContact, [key]: value } }));
  const updateAddress = (key, value) => setForm(prev => ({ ...prev, myAddress: { ...prev.myAddress, [key]: value } }));

  const isFormValid = form.doctorCode && form.firstName && form.lastName && form.myContact.email;

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    const payload = {
      ...form,
      doctorSpeciality: form.doctorSpeciality.split(',').map(s => s.trim()).filter(Boolean),
      doctorExperience: parseFloat(form.doctorExperience) || 0,
    };
    try {
      await doctorApi.create(user.orgName, user.hospitalCode, payload, token);
      Alert.alert(t('messages.success'), t('messages.doctor_onboarded', { firstName: form.firstName, lastName: form.lastName }), [
        { text: t('actions.ok'), onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert(t('messages.error'), e.message || t('messages.failed_create_doctor'));
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
            {t('messages.onboard_doctor_banner', { hospitalCode: user?.hospitalCode })}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('entity.professional_identity')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.doctor_code')} required>
                <TextInput value={form.doctorCode} onChangeText={v => updateRoot('doctorCode', v.toUpperCase())} placeholder={t('placeholders.doctor_code_example')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.experience_years')}>
                <TextInput value={form.doctorExperience} onChangeText={v => updateRoot('doctorExperience', v.replace(/[^0-9.]/g, ''))} placeholder={t('placeholders.experience_example')} keyboardType="numeric" />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.first_name')} required>
                <TextInput value={form.firstName} onChangeText={v => updateRoot('firstName', v)} placeholder={t('placeholders.gregory')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.last_name')} required>
                <TextInput value={form.lastName} onChangeText={v => updateRoot('lastName', v)} placeholder={t('placeholders.house')} />
              </Field>
            </View>
          </View>

          <Field label={t('entity.speciality_csv')}>
            <TextInput value={form.doctorSpeciality} onChangeText={v => updateRoot('doctorSpeciality', v)} placeholder={t('placeholders.speciality_doctor_example')} leading={<IconActivity size={16} color={T.textFaint} />} />
          </Field>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('entity.demographics')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.dob')}>
                <TextInput value={form.birthDate} onChangeText={v => updateRoot('birthDate', v)} placeholder={t('placeholders.dob_format')} leading={<IconCalendar size={16} color={T.textFaint} />} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.gender')}>
                <View style={styles.radioRow}>
                  {['MALE', 'FEMALE'].map(g => (
                    <TouchableOpacity key={g} style={[styles.radioBtn, form.gender === g && styles.radioActive]} onPress={() => updateRoot('gender', g)}>
                      <Text style={[styles.radioText, form.gender === g && styles.radioTextActive]}>{g[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('entity.contact_location')} />
          <Field label={t('entity.email_address')} required>
            <TextInput value={form.myContact.email} onChangeText={v => updateContact('email', v.toLowerCase())} placeholder={t('placeholders.doctor_email_example')} leading={<IconMail size={16} color={T.textFaint} />} />
          </Field>
          <Field label={t('entity.phone_number')}>
            <TextInput value={form.myContact.phone} onChangeText={v => updateContact('phone', v)} placeholder={t('placeholders.phone_intl_example')} leading={<IconPhone size={16} color={T.textFaint} />} />
          </Field>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.city')}>
                <TextInput value={form.myAddress.city} onChangeText={v => updateAddress('city', v)} placeholder={t('placeholders.princeton')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.state')}>
                <TextInput value={form.myAddress.state} onChangeText={v => updateAddress('state', v)} placeholder={t('placeholders.state_nj')} />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>{t('actions.cancel')}</Btn>
          <Btn variant="primary" style={{ flex: 2 }} disabled={!isFormValid || saving} onPress={handleCreate}>
            {saving ? t('actions.creating') : t('actions.create_doctor')}
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
  row: { flexDirection: 'row', gap: 12 },
  radioRow: { flexDirection: 'row', gap: 8 },
  radioBtn: { flex: 1, height: 42, borderRadius: 10, borderWidth: 1, borderColor: T.borderSoft, alignItems: 'center', justifyContent: 'center', backgroundColor: T.surface },
  radioActive: { backgroundColor: T.accent, borderColor: T.accent },
  radioText: { fontSize: 13, fontWeight: '600', color: T.textDim },
  radioTextActive: { color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
