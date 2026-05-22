import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconLocation, IconPhone, IconHeart } from '../../icons';
import { patientApi } from '../../services/api';

export const CreatePatientScreen = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    patient: {
      patientCode: '',
      firstName: '',
      lastName: '',
      myContact: { email: '', phone: '' },
      myAddress: { street1: '', city: '', state: '', country: 'India', pincode: '' },
    },
    patientinfo: [
      { infoType: 'VITAL_SIGNS', infoData: { bloodGroup: '', weight: '', height: '' } }
    ],
  });
  const [saving, setSaving] = useState(false);

  const updatePatient = (key, value) =>
    setForm(prev => ({ ...prev, patient: { ...prev.patient, [key]: value } }));
  const updateContact = (key, value) =>
    setForm(prev => ({ ...prev, patient: { ...prev.patient, myContact: { ...prev.patient.myContact, [key]: value } } }));
  const updateAddress = (key, value) =>
    setForm(prev => ({ ...prev, patient: { ...prev.patient, myAddress: { ...prev.patient.myAddress, [key]: value } } }));
  const updateInfo = (key, value) =>
    setForm(prev => {
      const info = [...prev.patientinfo];
      info[0] = { ...info[0], infoData: { ...info[0].infoData, [key]: value } };
      return { ...prev, patientinfo: info };
    });

  const isFormValid = form.patient.patientCode && form.patient.firstName && form.patient.lastName && form.patient.myContact.email;

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    const payload = {
      ...form,
      patientinfo: form.patientinfo.map(i => ({
        ...i,
        infoData: JSON.stringify(i.infoData),
      })),
    };
    try {
      await patientApi.create(user.orgName, user.hospitalCode, payload, token);
      Alert.alert(t('messages.success'), t('messages.patient_registered', { code: form.patient.patientCode }), [
        { text: t('actions.ok'), onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert(t('messages.error'), e.message || t('messages.failed_register_patient'));
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
            {t('messages.register_patient_banner', { hospitalCode: user?.hospitalCode })}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('entity.patient_identity')} />
          <Field label={t('entity.patient_mrn_code')} required>
            <TextInput value={form.patient.patientCode} onChangeText={v => updatePatient('patientCode', v.toUpperCase())} placeholder={t('placeholders.mrn_example')} />
          </Field>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.first_name')} required>
                <TextInput value={form.patient.firstName} onChangeText={v => updatePatient('firstName', v)} placeholder={t('placeholders.john')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.last_name')} required>
                <TextInput value={form.patient.lastName} onChangeText={v => updatePatient('lastName', v)} placeholder={t('placeholders.doe')} />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('entity.contact_address')} />
          <Field label={t('entity.email_address')} required>
            <TextInput value={form.patient.myContact.email} onChangeText={v => updateContact('email', v.toLowerCase())} placeholder={t('placeholders.email_example')} leading={<IconMail size={16} color={T.textFaint} />} />
          </Field>
          <Field label={t('entity.phone_number')}>
            <TextInput value={form.patient.myContact.phone} onChangeText={v => updateContact('phone', v)} placeholder={t('placeholders.phone_example')} leading={<IconPhone size={16} color={T.textFaint} />} />
          </Field>
          <Field label={t('entity.street_address')}>
            <TextInput value={form.patient.myAddress.street1} onChangeText={v => updateAddress('street1', v)} placeholder={t('placeholders.address_example')} leading={<IconLocation size={16} color={T.textFaint} />} />
          </Field>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.city')}>
                <TextInput value={form.patient.myAddress.city} onChangeText={v => updateAddress('city', v)} placeholder={t('placeholders.city_example')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.pincode')}>
                <TextInput value={form.patient.myAddress.pincode} onChangeText={v => updateAddress('pincode', v)} placeholder={t('placeholders.pincode_example')} />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('entity.preliminary_vitals')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.blood_group')}>
                <TextInput value={form.patientinfo[0].infoData.bloodGroup} onChangeText={v => updateInfo('bloodGroup', v)} placeholder={t('placeholders.blood_group_example')} leading={<IconHeart size={16} color={T.textFaint} />} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.weight')}>
                <TextInput value={form.patientinfo[0].infoData.weight} onChangeText={v => updateInfo('weight', v)} placeholder={t('placeholders.weight_example')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.height')}>
                <TextInput value={form.patientinfo[0].infoData.height} onChangeText={v => updateInfo('height', v)} placeholder={t('placeholders.height_example')} />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>{t('actions.cancel')}</Btn>
          <Btn variant="primary" style={{ flex: 2 }} disabled={!isFormValid || saving} onPress={handleCreate}>
            {saving ? t('actions.registering') : t('actions.register_patient')}
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
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
