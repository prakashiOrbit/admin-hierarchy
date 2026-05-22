import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconPhone, IconLocation, IconHeart, IconBuilding } from '../../icons';
import { patientApi } from '../../services/api';

export const EditPatientScreen = ({ patientDetail, onCancel, onSave }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const p = patientDetail.patient || patientDetail;
  const infos = patientDetail.patientInfos || [];
  const rawVitals = infos.find(i => i.infoType === 'VITAL_SIGNS')?.infoData;
  let vitalsData = {};
  if (rawVitals) {
    try { vitalsData = typeof rawVitals === 'string' ? JSON.parse(rawVitals) : rawVitals; } catch {}
  }

  const [form, setForm] = useState({
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    email: p.myContact?.email || '',
    phone: p.myContact?.phone || '',
    street1: p.myAddress?.street1 || '',
    city: p.myAddress?.city || '',
    state: p.myAddress?.state || '',
    pincode: p.myAddress?.pincode || '',
    country: p.myAddress?.country || 'India',
    bloodGroup: vitalsData.bloodGroup || '',
    weight: String(vitalsData.weight || ''),
    height: String(vitalsData.height || ''),
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const isValid = form.firstName && form.lastName && form.email;

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      patient: {
        firstName: form.firstName,
        lastName: form.lastName,
        myContact: { email: form.email, phone: form.phone },
        myAddress: { street1: form.street1, city: form.city, state: form.state, pincode: form.pincode, country: form.country },
      },
      patientinfo: [{
        infoType: 'VITAL_SIGNS',
        infoData: JSON.stringify({ bloodGroup: form.bloodGroup, weight: form.weight, height: form.height }),
      }],
    };
    try {
      await patientApi.update(user.orgName, user.hospitalCode, p.patientCode, payload, token);
      Alert.alert(t('messages.saved'), t('messages.patient_updated'), [{ text: t('actions.ok'), onPress: () => onSave?.() }]);
    } catch (e) {
      Alert.alert(t('messages.error'), e.message || t('messages.failed_update_patient'));
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
            {t('messages.editing_patient_banner', { code: p.patientCode })}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('entity.patient_identity')} />

          <Field label={t('entity.patient_code')}>
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{p.patientCode}</Text>
              </View>
            </Card>
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.first_name')} required>
                <TextInput value={form.firstName} onChangeText={v => set('firstName', v)} placeholder={t('placeholders.john')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.last_name')} required>
                <TextInput value={form.lastName} onChangeText={v => set('lastName', v)} placeholder={t('placeholders.doe')} />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('entity.contact_address')} />
          <Field label={t('entity.email')} required>
            <TextInput
              value={form.email}
              onChangeText={v => set('email', v.toLowerCase())}
              placeholder={t('placeholders.email_example')}
              keyboardType="email-address"
              leading={<IconMail size={16} color={T.textFaint} />}
            />
          </Field>
          <Field label={t('entity.phone')}>
            <TextInput
              value={form.phone}
              onChangeText={v => set('phone', v)}
              placeholder={t('placeholders.phone_example')}
              keyboardType="phone-pad"
              leading={<IconPhone size={16} color={T.textFaint} />}
            />
          </Field>
          <Field label={t('entity.street_address')}>
            <TextInput
              value={form.street1}
              onChangeText={v => set('street1', v)}
              placeholder={t('placeholders.address_example')}
              leading={<IconLocation size={16} color={T.textFaint} />}
            />
          </Field>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.city')}>
                <TextInput value={form.city} onChangeText={v => set('city', v)} placeholder={t('placeholders.city_example')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.pincode')}>
                <TextInput value={form.pincode} onChangeText={v => set('pincode', v)} placeholder={t('placeholders.pincode_example')} keyboardType="numeric" />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('entity.vital_signs')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.blood_group')}>
                <TextInput value={form.bloodGroup} onChangeText={v => set('bloodGroup', v)} placeholder={t('placeholders.blood_group_example')} leading={<IconHeart size={16} color={T.textFaint} />} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.weight')}>
                <TextInput value={form.weight} onChangeText={v => set('weight', v)} placeholder={t('placeholders.weight_example')} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.height')}>
                <TextInput value={form.height} onChangeText={v => set('height', v)} placeholder={t('placeholders.height_example')} />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="ghost" style={{ flex: 1 }} onPress={onCancel} disabled={saving}>{t('actions.cancel')}</Btn>
          <Btn style={{ flex: 1.5 }} onPress={handleSave} disabled={!isValid || saving}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : t('actions.save_changes')}
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
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
