import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { organisationApi } from '../../services/api';
import { Card, Field, TextInput, PhoneInput, Btn } from '../../components/Shared';
import { IconCareSite, IconUser, IconMail, IconLocation, IconBuilding, IconChevron } from '../../icons';

const CARE_SITE_TYPES = [
  { value: 'HOSPITAL',   labelKey: 'caresite.type_hospital' },
  { value: 'CARE_HOME',  labelKey: 'caresite.type_care_home' },
  { value: 'RESIDENCE',  labelKey: 'caresite.type_residence' },
];

export const EditCareSiteScreen = ({ careSite, onCancel, onSave }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [form, setForm] = useState({
    careSiteName: careSite.careSiteName || '',
    careSiteType: careSite.careSiteType || 'HOSPITAL',
    description: careSite.description || '',
    myContact: {
      name: careSite.myContact?.name || '',
      email: careSite.myContact?.email || '',
      phone: careSite.myContact?.phone || '',
    },
    myAddress: {
      street1: careSite.myAddress?.street1 || '',
      city: careSite.myAddress?.city || '',
      state: careSite.myAddress?.state || '',
      pincode: careSite.myAddress?.pincode || '',
      country: careSite.myAddress?.country || '',
    },
  });

  const updateRoot = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateContact = (key, value) => setForm(prev => ({ ...prev, myContact: { ...prev.myContact, [key]: value } }));
  const updateAddress = (key, value) => setForm(prev => ({ ...prev, myAddress: { ...prev.myAddress, [key]: value } }));

  const isFormValid = form.careSiteName && form.myContact.email;

  const handleSave = async () => {
    setLoading(true);
    try {
      await organisationApi.updateCareSite(user.orgName, {
        careSiteId: careSite.careSiteId,
        careSiteCode: careSite.careSiteCode,
        ...form,
      }, token);
      Alert.alert(t('alerts.success'), t('alerts.caresite_updated'), [
        { text: t('actions.ok'), onPress: () => onSave({ ...careSite, ...form }) }
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
          <IconCareSite size={20} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('caresite.edit_banner', { code: careSite.careSiteCode })}
          </Text>
        </View>

        {/* Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caresite.identity_section')}</Text>

          <Field label={t('caresite.code')}>
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{careSite.careSiteCode}</Text>
              </View>
            </Card>
          </Field>

          <Field label={t('caresite.name')} required>
            <TextInput
              value={form.careSiteName}
              onChangeText={v => updateRoot('careSiteName', v)}
              placeholder={t('placeholders.caresite_name')}
            />
          </Field>

          <Field label={t('caresite.description')}>
            <TextInput
              value={form.description}
              onChangeText={v => updateRoot('description', v)}
              placeholder={t('placeholders.caresite_description')}
            />
          </Field>

          <Field label={t('caresite.site_type')}>
            <Card style={styles.selectCard} onPress={() => setShowTypePicker(true)}>
              <Text style={styles.selectText}>
                {t(CARE_SITE_TYPES.find(x => x.value === form.careSiteType)?.labelKey)}
              </Text>
              <IconChevron size={18} color={T.textDim} />
            </Card>
          </Field>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caresite.contact_section')}</Text>

          <Field label={t('caresite.contact_name')}>
            <TextInput
              value={form.myContact.name}
              onChangeText={v => updateContact('name', v)}
              placeholder={t('placeholders.contact_name')}
              leading={<IconUser size={18} color={T.textDim} />}
            />
          </Field>

          <Field label={t('caresite.contact_email')} required>
            <TextInput
              value={form.myContact.email}
              onChangeText={v => updateContact('email', v.toLowerCase())}
              placeholder={t('placeholders.contact_email')}
              leading={<IconMail size={18} color={T.textDim} />}
            />
          </Field>

          <Field label={t('caresite.contact_phone')}>
            <PhoneInput value={form.myContact.phone} onChangeText={v => updateContact('phone', v)} />
          </Field>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caresite.address_section')}</Text>

          <Field label={t('caresite.address_street')}>
            <TextInput
              value={form.myAddress.street1}
              onChangeText={v => updateAddress('street1', v)}
              placeholder={t('placeholders.address_street')}
              leading={<IconLocation size={18} color={T.textDim} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('caresite.address_city')}>
                <TextInput
                  value={form.myAddress.city}
                  onChangeText={v => updateAddress('city', v)}
                  placeholder={t('placeholders.address_city')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('caresite.address_state')}>
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
              <Field label={t('caresite.address_country')}>
                <TextInput
                  value={form.myAddress.country}
                  onChangeText={v => updateAddress('country', v)}
                  placeholder={t('placeholders.address_country')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('caresite.address_pincode')}>
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

      {/* Site Type Picker Modal */}
      <Modal visible={showTypePicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTypePicker(false)}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('caresite.select_type')}</Text>
            {CARE_SITE_TYPES.map((ct) => (
              <TouchableOpacity
                key={ct.value}
                style={[styles.localeOption, form.careSiteType === ct.value && { backgroundColor: T.accentSoft }]}
                onPress={() => { updateRoot('careSiteType', ct.value); setShowTypePicker(false); }}
              >
                <Text style={[styles.localeOptionText, form.careSiteType === ct.value && { color: T.accent, fontWeight: '700' }]}>
                  {t(ct.labelKey)}
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
  selectCard: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.surface,
    paddingHorizontal: 12,
  },
  selectText: { color: T.text, fontSize: 14, fontWeight: '500' },
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
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
