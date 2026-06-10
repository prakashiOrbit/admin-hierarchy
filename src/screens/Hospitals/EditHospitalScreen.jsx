import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { organisationApi } from '../../services/api';
import { Card, Field, TextInput, PhoneInput, Btn } from '../../components/Shared';
import { IconHospital, IconUser, IconMail, IconLocation, IconBuilding } from '../../icons';

export const EditHospitalScreen = ({ hospital, onCancel, onSave }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hospitalName: hospital.hospitalName || '',
    description: hospital.description || '',
    myContact: {
      name: hospital.myContact?.name || '',
      email: hospital.myContact?.email || '',
      phone: hospital.myContact?.phone || '',
    },
    myAddress: {
      street1: hospital.myAddress?.street1 || '',
      city: hospital.myAddress?.city || '',
      state: hospital.myAddress?.state || '',
      pincode: hospital.myAddress?.pincode || '',
      country: hospital.myAddress?.country || '',
    },
  });

  const updateRoot = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateContact = (key, value) => setForm(prev => ({ ...prev, myContact: { ...prev.myContact, [key]: value } }));
  const updateAddress = (key, value) => setForm(prev => ({ ...prev, myAddress: { ...prev.myAddress, [key]: value } }));

  const isFormValid = form.hospitalName && form.myContact.email;

  const handleSave = async () => {
    setLoading(true);
    try {
      await organisationApi.updateHospital(user.orgName, {
        hospitalId: hospital.hospitalId,
        hospitalCode: hospital.hospitalCode,
        ...form,
      }, token);
      Alert.alert(t('alerts.success'), t('alerts.hospital_updated'), [
        { text: t('actions.ok'), onPress: () => onSave({ ...hospital, ...form }) }
      ]);
    } catch (err) {
      Alert.alert(t('alerts.error'), err.message || t('alerts.update_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <IconHospital size={20} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('hospital.edit_banner', { code: hospital.hospitalCode })}
          </Text>
        </View>

        {/* Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('hospital.identity_section')}</Text>

          <Field label={t('hospital.code')}>
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{hospital.hospitalCode}</Text>
              </View>
            </Card>
          </Field>

          <Field label={t('hospital.name')} required>
            <TextInput
              value={form.hospitalName}
              onChangeText={v => updateRoot('hospitalName', v)}
              placeholder={t('placeholders.hospital_name')}
            />
          </Field>

          <Field label={t('hospital.description')}>
            <TextInput
              value={form.description}
              onChangeText={v => updateRoot('description', v)}
              placeholder={t('placeholders.hospital_description')}
            />
          </Field>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('hospital.contact_section')}</Text>

          <Field label={t('hospital.contact_name')}>
            <TextInput
              value={form.myContact.name}
              onChangeText={v => updateContact('name', v)}
              placeholder={t('placeholders.contact_name')}
              leading={<IconUser size={18} color={T.textDim} />}
            />
          </Field>

          <Field label={t('hospital.contact_email')} required>
            <TextInput
              value={form.myContact.email}
              onChangeText={v => updateContact('email', v.toLowerCase())}
              placeholder={t('placeholders.contact_email')}
              leading={<IconMail size={18} color={T.textDim} />}
            />
          </Field>

          <Field label={t('hospital.contact_phone')}>
            <PhoneInput value={form.myContact.phone} onChangeText={v => updateContact('phone', v)} />
          </Field>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('hospital.address_section')}</Text>

          <Field label={t('hospital.address_street')}>
            <TextInput
              value={form.myAddress.street1}
              onChangeText={v => updateAddress('street1', v)}
              placeholder={t('placeholders.address_street')}
              leading={<IconLocation size={18} color={T.textDim} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('hospital.address_city')}>
                <TextInput
                  value={form.myAddress.city}
                  onChangeText={v => updateAddress('city', v)}
                  placeholder={t('placeholders.address_city')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('hospital.address_state')}>
                <TextInput
                  value={form.myAddress.state}
                  onChangeText={v => updateAddress('state', v)}
                  placeholder={t('placeholders.address_state')}
                />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('hospital.address_country')}>
                <TextInput
                  value={form.myAddress.country}
                  onChangeText={v => updateAddress('country', v)}
                  placeholder={t('placeholders.address_country')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('hospital.address_pincode')}>
                <TextInput
                  value={form.myAddress.pincode}
                  onChangeText={v => updateAddress('pincode', v)}
                  placeholder={t('placeholders.address_pincode')}
                />
              </Field>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="ghost" full style={{ flex: 1 }} onPress={onCancel} disabled={loading}>
            {t('actions.cancel')}
          </Btn>
          <Btn
            full
            style={{ flex: 1.5 }}
            onPress={handleSave}
            disabled={!isFormValid || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : t('actions.save_changes')}
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
    flexDirection: 'row',
    backgroundColor: T.accentSoft,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  bannerText: { flex: 1, fontSize: 13, color: T.text, lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  readOnlyCard: {
    height: 44,
    justifyContent: 'center',
    backgroundColor: T.surface2,
    borderColor: T.borderSoft,
  },
  readOnlyText: {
    color: T.textDim,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
