import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { organisationApi } from '../../services/api';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconBuilding, IconUser, IconMail, IconLocation, IconPhone, IconShield, IconChevron } from '../../icons';

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

export const NewOrganisationScreen = ({ onCancel, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const [form, setForm] = useState({
    orgName: '',
    orgType: 'HOSPITAL',
    businessName: '',
    preferredLocale: (i18n.language || 'en').split('-')[0],
    myContact: {
      name: '',
      email: '',
      phone: '',
    },
    myAddress: {
      street1: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
    }
  });

  const orgTypes = ['HOSPITAL', 'CLINIC', 'LAB', 'PHARMACY', 'RESEARCH', 'OTHER'];

  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateRoot = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateContact = (key, value) => {
    setForm(prev => ({ 
      ...prev, 
      myContact: { ...prev.myContact, [key]: value } 
    }));
  };

  const updateAddress = (key, value) => {
    setForm(prev => ({ 
      ...prev, 
      myAddress: { ...prev.myAddress, [key]: value } 
    }));
  };

  const isFormValid = form.orgName && form.businessName && form.myContact.email;

  const handleCreate = async () => {
    setLoading(true);
    try {
      await organisationApi.create(form, token);
      Alert.alert(t('alerts.success'), t('alerts.org_created'), [
        { text: t('actions.ok'), onPress: () => onSuccess ? onSuccess() : onCancel() }
      ]);
    } catch (err) {
      Alert.alert(t('alerts.error'), err.message || t('alerts.create_org_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Helper Banner */}
        <View style={styles.banner}>
          <IconShield color={T.accent} size={20} />
          <Text style={styles.bannerText}>
            {t('orgs.onboarding_banner')}
          </Text>
        </View>

        {/* Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orgs.identity_section')}</Text>
          
          <Field label={t('orgs.id')}>
            <TextInput 
              value={form.orgName} 
              onChangeText={(v) => updateRoot('orgName', v.toUpperCase())}
              placeholder={t('placeholders.org_id_eg')}
            />
          </Field>

          <Field label={t('orgs.business_name')}>
            <TextInput 
              value={form.businessName} 
              onChangeText={(v) => updateRoot('businessName', v)}
              placeholder={t('placeholders.business_name_eg')}
            />
          </Field>

          <Field label={t('orgs.type')}>
            <Card style={styles.selectCard} onPress={() => setShowTypePicker(true)}>
              <Text style={styles.selectText}>{t(`orgs.types.${form.orgType}`)}</Text>
              <IconChevron size={18} color={T.textDim} />
            </Card>
          </Field>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orgs.contact_section')}</Text>
          
          <Field label={t('orgs.contact_name')}>
            <TextInput 
              value={form.myContact.name} 
              onChangeText={(v) => updateContact('name', v)}
              placeholder={t('orgs.contact_name')}
              leading={<IconUser size={18} color={T.textDim} />}
            />
          </Field>

          <Field label={t('orgs.contact_email')}>
            <TextInput 
              value={form.myContact.email} 
              onChangeText={(v) => updateContact('email', v)}
              placeholder={t('placeholders.email_eg')}
              leading={<IconMail size={18} color={T.textDim} />}
            />
          </Field>

          <Field label={t('orgs.contact_phone')}>
            <TextInput
              value={form.myContact.phone}
              onChangeText={(v) => updateContact('phone', v)}
              placeholder={t('placeholders.phone_eg')}
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
          <Text style={styles.sectionTitle}>{t('orgs.address_section')}</Text>
          
          <Field label={t('orgs.address_street')}>
            <TextInput 
              value={form.myAddress.street1} 
              onChangeText={(v) => updateAddress('street1', v)}
              placeholder={t('placeholders.street_eg')}
              leading={<IconLocation size={18} color={T.textDim} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('orgs.address_city')}>
                <TextInput 
                  value={form.myAddress.city} 
                  onChangeText={(v) => updateAddress('city', v)}
                  placeholder={t('placeholders.city_eg')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('orgs.address_state')}>
                <TextInput 
                  value={form.myAddress.state} 
                  onChangeText={(v) => updateAddress('state', v)}
                  placeholder={t('placeholders.state_eg')}
                />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('orgs.address_country')}>
                <TextInput 
                  value={form.myAddress.country} 
                  onChangeText={(v) => updateAddress('country', v)}
                  placeholder={t('placeholders.country_eg')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('orgs.address_pincode')}>
                <TextInput 
                  value={form.myAddress.pincode} 
                  onChangeText={(v) => updateAddress('pincode', v)}
                  placeholder={t('placeholders.pincode_eg')}
                />
              </Field>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="ghost" full style={{ flex: 1 }} onPress={onCancel}>{t('common.cancel')}</Btn>
          <Btn 
            full 
            style={{ flex: 1.5 }} 
            onPress={handleCreate} 
            disabled={!isFormValid || loading}
          >
            {loading ? t('actions.creating') : t('actions.create')}
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
                style={[styles.typeOption, form.preferredLocale === loc.code && { backgroundColor: T.accentSoft }]}
                onPress={() => { updateRoot('preferredLocale', loc.code); setShowLocalePicker(false); }}
              >
                <Text style={[styles.typeOptionText, form.preferredLocale === loc.code && { color: T.accent, fontWeight: '700' }]}>
                  {loc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        </TouchableOpacity>
      </Modal>

      {/* Org Type Modal */}
      <Modal visible={showTypePicker} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowTypePicker(false)}
        >
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('orgs.select_type_title')}</Text>
            {orgTypes.map((type) => (
              <TouchableOpacity 
                key={type} 
                style={[
                  styles.typeOption,
                  form.orgType === type && { backgroundColor: T.accentSoft }
                ]}
                onPress={() => {
                  updateRoot('orgType', type);
                  setShowTypePicker(false);
                }}
              >
                <Text style={[
                  styles.typeOptionText,
                  form.orgType === type && { color: T.accent, fontWeight: '700' }
                ]}>
                  {t(`orgs.types.${type}`)}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: T.accentSoft,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: T.text,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: T.textDim,
    letterSpacing: 1,
    marginBottom: 16,
  },
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  typeOption: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  typeOptionText: {
    fontSize: 14,
    color: T.text,
  },
});
