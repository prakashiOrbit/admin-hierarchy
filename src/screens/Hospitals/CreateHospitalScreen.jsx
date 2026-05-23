import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { organisationApi } from '../../services/api';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconHospital, IconUser, IconMail, IconLocation, IconPhone, IconShield, IconChevron } from '../../icons';

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

export const CreateHospitalScreen = ({ onCancel }) => {
  const { t, i18n } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [loading, setLoading] = useState(false);
  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const [form, setForm] = useState({
    hospitalName: '',
    hospitalCode: '',
    description: '',
    preferredLocale: (i18n.language || 'en').split('-')[0],
    myAddress: {
      street1: '',
      city: '',
      pincode: '',
      state: '',
      country: 'India',
    },
    myContact: {
      name: '',
      email: '',
      phone: '',
    }
  });

  const updateRoot = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateAddress = (key, value) => {
    setForm(prev => ({
      ...prev,
      myAddress: { ...prev.myAddress, [key]: value }
    }));
  };

  const updateContact = (key, value) => {
    setForm(prev => ({
      ...prev,
      myContact: { ...prev.myContact, [key]: value }
    }));
  };

  const isFormValid = form.hospitalName && form.hospitalCode && form.myContact.email;

  const handleCreate = async () => {
    if (!user?.orgName) {
      Alert.alert(t('alerts.error'), t('alerts.org_not_found'));
      return;
    }

    setLoading(true);
    try {
      await organisationApi.createHospital(user.orgName, form, token);
      Alert.alert(t('alerts.success'), t('alerts.hospital_created'), [
        { text: t('actions.ok'), onPress: onCancel }
      ]);
    } catch (error) {
      Alert.alert(t('alerts.error'), error.message || t('alerts.create_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconShield color={T.accent} size={20} />
          <Text style={styles.bannerText}>
            {t('hospital.provision_banner')}
          </Text>
        </View>

        {/* Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('hospital.identity_section')}</Text>

          <Field label={t('hospital.code')}>
            <TextInput
              value={form.hospitalCode}
              onChangeText={(v) => updateRoot('hospitalCode', v.toUpperCase())}
              placeholder={t('placeholders.hospital_code')}
            />
          </Field>

          <Field label={t('hospital.name')}>
            <TextInput
              value={form.hospitalName}
              onChangeText={(v) => updateRoot('hospitalName', v)}
              placeholder={t('placeholders.hospital_name')}
            />
          </Field>

          <Field label={t('hospital.description')}>
            <TextInput
              value={form.description}
              onChangeText={(v) => updateRoot('description', v)}
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
              onChangeText={(v) => updateContact('name', v)}
              placeholder={t('placeholders.contact_name')}
              leading={<IconUser size={18} color={T.textDim} />}
            />
          </Field>

          <Field label={t('hospital.contact_email')}>
            <TextInput
              value={form.myContact.email}
              onChangeText={(v) => updateContact('email', v.toLowerCase())}
              placeholder={t('placeholders.contact_email')}
              leading={<IconMail size={18} color={T.textDim} />}
            />
          </Field>

          <Field label={t('hospital.contact_phone')}>
            <TextInput
              value={form.myContact.phone}
              onChangeText={(v) => updateContact('phone', v)}
              placeholder={t('placeholders.contact_phone')}
              leading={<IconPhone size={18} color={T.textDim} />}
            />
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

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('hospital.address_section')}</Text>

          <Field label={t('hospital.address_street')}>
            <TextInput
              value={form.myAddress.street1}
              onChangeText={(v) => updateAddress('street1', v)}
              placeholder={t('placeholders.address_street')}
              leading={<IconLocation size={18} color={T.textDim} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('hospital.address_city')}>
                <TextInput
                  value={form.myAddress.city}
                  onChangeText={(v) => updateAddress('city', v)}
                  placeholder={t('placeholders.address_city')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('hospital.address_state')}>
                <TextInput
                  value={form.myAddress.state}
                  onChangeText={(v) => updateAddress('state', v)}
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
                  onChangeText={(v) => updateAddress('country', v)}
                  placeholder={t('placeholders.address_country')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('hospital.address_pincode')}>
                <TextInput
                  value={form.myAddress.pincode}
                  onChangeText={(v) => updateAddress('pincode', v)}
                  placeholder={t('placeholders.address_pincode')}
                />
              </Field>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="ghost" full style={{ flex: 1 }} onPress={onCancel} disabled={loading}>{t('actions.cancel')}</Btn>
          <Btn
            full
            style={{ flex: 1.5 }}
            onPress={handleCreate}
            disabled={!isFormValid || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : t('actions.create')}
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
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  selectCard: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.surface,
    paddingHorizontal: 12,
  },
  selectText: {
    color: T.text,
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: { padding: 16 },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  localeOption: { padding: 14, borderRadius: 8, marginBottom: 4 },
  localeOptionText: { fontSize: 14, color: T.text },
});
