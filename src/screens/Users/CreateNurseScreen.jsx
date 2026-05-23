import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconPhone, IconChevron } from '../../icons';
import { nurseApi } from '../../services/api';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'cs', label: 'Čeština' },
  { code: 'rm', label: 'Rumantsch' },
];

export const CreateNurseScreen = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const [form, setForm] = useState({
    nurseCode: '',
    firstName: '',
    lastName: '',
    nurseSpeciality: '',
    nurseExperience: '',
    nurseType: 'REGISTERED',
    gender: 'FEMALE',
    preferredLocale: 'en',
    myContact: { email: '', phone: '' },
    myAddress: { city: '', state: '' },
  });
  const [saving, setSaving] = useState(false);

  const updateRoot = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateContact = (key, value) => setForm(prev => ({ ...prev, myContact: { ...prev.myContact, [key]: value } }));

  const isFormValid = form.nurseCode && form.firstName && form.lastName && form.myContact.email;

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    const payload = {
      ...form,
      nurseSpeciality: form.nurseSpeciality.split(',').map(s => s.trim()).filter(Boolean),
      nurseExperience: parseInt(form.nurseExperience, 10) || 0,
    };
    try {
      await nurseApi.create(user.orgName, user.hospitalCode, payload, token);
      Alert.alert(t('messages.success'), t('messages.nurse_onboarded', { firstName: form.firstName, lastName: form.lastName }), [
        { text: t('actions.ok'), onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert(t('messages.error'), e.message || t('messages.failed_create_nurse'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconUser size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('messages.onboard_nurse_banner', { hospitalCode: user?.hospitalCode })}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('entity.nurse_identity')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.staff_code')} required>
                <TextInput value={form.nurseCode} onChangeText={v => updateRoot('nurseCode', v.toUpperCase())} placeholder={t('placeholders.nurse_code_example')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.experience_years')}>
                <TextInput value={form.nurseExperience} onChangeText={v => updateRoot('nurseExperience', v.replace(/[^0-9]/g, ''))} placeholder={t('placeholders.experience_nurse_example')} keyboardType="numeric" />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.first_name')} required>
                <TextInput value={form.firstName} onChangeText={v => updateRoot('firstName', v)} placeholder={t('placeholders.lena')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.last_name')} required>
                <TextInput value={form.lastName} onChangeText={v => updateRoot('lastName', v)} placeholder={t('placeholders.kowalski')} />
              </Field>
            </View>
          </View>

          <Field label={t('entity.speciality_csv')}>
            <TextInput value={form.nurseSpeciality} onChangeText={v => updateRoot('nurseSpeciality', v)} placeholder={t('placeholders.speciality_nurse_example')} />
          </Field>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('entity.contact_information')} />
          <Field label={t('entity.email_address')} required>
            <TextInput value={form.myContact.email} onChangeText={v => updateContact('email', v.toLowerCase())} placeholder={t('placeholders.nurse_email_example')} leading={<IconMail size={16} color={T.textFaint} />} />
          </Field>
          <Field label={t('entity.phone_number')}>
            <TextInput value={form.myContact.phone} onChangeText={v => updateContact('phone', v)} placeholder={t('placeholders.phone_intl_example')} leading={<IconPhone size={16} color={T.textFaint} />} />
          </Field>

          <Field label={t('users.preferred_locale')}>
            <Card style={styles.selectCard} onPress={() => setShowLocalePicker(true)}>
              <Text style={styles.selectText}>
                {LOCALES.find(l => l.code === form.preferredLocale)?.label || 'English'}
              </Text>
              <IconChevron size={18} color={T.textDim} />
            </Card>
          </Field>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>{t('actions.cancel')}</Btn>
          <Btn variant="primary" style={{ flex: 2 }} disabled={!isFormValid || saving} onPress={handleCreate}>
            {saving ? t('actions.creating') : t('actions.create_nurse')}
          </Btn>
        </View>
      </ScrollView>

      {/* Locale Picker Modal */}
      <Modal visible={showLocalePicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLocalePicker(false)}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('users.select_locale')}</Text>
            {LOCALES.map((loc) => (
              <TouchableOpacity
                key={loc.code}
                style={[styles.localeOption, form.preferredLocale === loc.code && { backgroundColor: T.accentSoft }]}
                onPress={() => { updateRoot('preferredLocale', loc.code); setShowLocalePicker(false); }}
              >
                <Text style={[styles.localeOptionText, form.preferredLocale === loc.code && { color: T.accent, fontWeight: '700' }]}>
                  {loc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        </TouchableOpacity>
      </Modal>
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
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  selectCard: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.surface,
    paddingHorizontal: 12,
  },
  selectText: { color: T.text, fontSize: 14, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 16, textAlign: 'center' },
  localeOption: { padding: 14, borderRadius: 8, marginBottom: 4 },
  localeOptionText: { fontSize: 14, color: T.text },
});
