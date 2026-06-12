import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, PhoneInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconBuilding } from '../../icons';
import { nurseApi } from '../../services/api';

const NURSE_TYPES = ['REGISTERED', 'LICENSED', 'PRACTITIONER', 'SPECIALIST'];

export const EditNurseScreen = ({ nurse, onCancel, onSave }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [form, setForm] = useState({
    firstName: nurse.firstName || '',
    lastName: nurse.lastName || '',
    nurseSpeciality: Array.isArray(nurse.nurseSpeciality) ? nurse.nurseSpeciality.join(', ') : (nurse.nurseSpeciality || ''),
    nurseExperience: String(nurse.nurseExperience ?? ''),
    nurseType: nurse.nurseType || 'REGISTERED',
    gender: nurse.gender || 'FEMALE',
    email: nurse.myContact?.email || '',
    phone: nurse.myContact?.phone || '',
    city: nurse.myAddress?.city || '',
    state: nurse.myAddress?.state || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const isValid = form.firstName && form.lastName && form.email;

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      nurseSpeciality: form.nurseSpeciality.split(',').map(s => s.trim()).filter(Boolean),
      nurseExperience: parseInt(form.nurseExperience, 10) || 0,
      nurseType: form.nurseType,
      gender: form.gender,
      myContact: { email: form.email, phone: form.phone },
      myAddress: { city: form.city, state: form.state },
    };
    try {
      await nurseApi.update(user.orgName, nurse.careSiteCode || user.careSiteCode, nurse.nurseCode, payload, token);
      Alert.alert(t('common.success'), t('users.nurse_updated'), [{ text: t('common.done'), onPress: () => onSave?.() }]);
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('users.update_failed_nurse'));
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
            {t('users.editing')} <Text style={{ fontWeight: '700' }}>{nurse.nurseCode}</Text>. {t('users.immutable_code_staff')}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('users.staff_identity')} />

          <Field label={t('users.staff_code')}>
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{nurse.nurseCode}</Text>
              </View>
            </Card>
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('users.first_name')} required>
                <TextInput value={form.firstName} onChangeText={v => set('firstName', v)} placeholder={t('placeholders.first_name')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('users.last_name')} required>
                <TextInput value={form.lastName} onChangeText={v => set('lastName', v)} placeholder={t('placeholders.last_name')} />
              </Field>
            </View>
          </View>

          <Field label={t('users.speciality_csv')}>
            <TextInput
              value={form.nurseSpeciality}
              onChangeText={v => set('nurseSpeciality', v)}
              placeholder={t('placeholders.speciality_nurse_example')}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('users.experience')}>
                <TextInput
                  value={form.nurseExperience}
                  onChangeText={v => set('nurseExperience', v.replace(/[^0-9]/g, ''))}
                  placeholder={t('placeholders.experience_nurse_example')}
                  keyboardType="numeric"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('users.gender')}>
                <View style={styles.row}>
                  {['MALE', 'FEMALE'].map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.radioBtn, { flex: 1 }, form.gender === g && styles.radioActive]}
                      onPress={() => set('gender', g)}
                    >
                      <Text style={[styles.radioText, form.gender === g && styles.radioTextActive]}>{g[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>
            </View>
          </View>

          <Field label={t('users.type')}>
            <View style={styles.typeGrid}>
              {NURSE_TYPES.map(t_item => (
                <TouchableOpacity
                  key={t_item}
                  style={[styles.typeBtn, form.nurseType === t_item && styles.typeBtnActive]}
                  onPress={() => set('nurseType', t_item)}
                >
                  <Text style={[styles.typeText, form.nurseType === t_item && styles.typeTextActive]}>{t_item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('users.contact')} />
          <Field label={t('users.email')} required>
            <TextInput
              value={form.email}
              onChangeText={v => set('email', v.toLowerCase())}
              placeholder={t('placeholders.nurse_email_example')}
              keyboardType="email-address"
              leading={<IconMail size={16} color={T.textFaint} />}
            />
          </Field>
          <Field label={t('users.phone')}>
            <PhoneInput value={form.phone} onChangeText={v => set('phone', v)} />
          </Field>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="ghost" style={{ flex: 1 }} onPress={onCancel} disabled={saving}>{t('common.cancel')}</Btn>
          <Btn style={{ flex: 1.5 }} onPress={handleSave} disabled={!isValid || saving}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : t('users.save_changes')}
          </Btn>
        </View>
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
});
