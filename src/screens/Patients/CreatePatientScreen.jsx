import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform, Alert, Modal,
  TouchableOpacity, ActivityIndicator, TextInput as RNTextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconLocation, IconPhone, IconHeart, IconChevron, IconCheck, IconShield } from '../../icons';
import { patientApi, consentApi } from '../../services/api';

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

const CONSENTED_BY_TYPES = ['SELF', 'GUARDIAN', 'PHYSICIAN'];

const emptyGrant = (userName = '') => ({
  enabled: false,
  consentedByType: 'SELF',
  consentedByName: userName,
  emergencyJustification: '',
  relationshipToPatient: '',
  powerOfAttorneyRef: '',
  notes: '',
});

export const CreatePatientScreen = ({ onCancel, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const [form, setForm] = useState({
    patient: {
      patientCode: '',
      firstName: '',
      lastName: '',
      preferredLocale: (i18n.language || 'en').split('-')[0],
      myContact: { email: '', phone: '' },
      myAddress: { street1: '', city: '', state: '', country: 'India', pincode: '' },
    },
    patientinfo: [
      { infoType: 'VITAL_SIGNS', infoData: { bloodGroup: '', weight: '', height: '' } }
    ],
  });
  const [saving, setSaving] = useState(false);

  // Consent state
  const [consentTypes, setConsentTypes] = useState(null); // null = loading
  const [consentGrants, setConsentGrants] = useState({});  // { [code]: grantObj }

  // ── Load consent types on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!user?.orgName || !token) return;
    consentApi.getTypes(user.orgName, token)
      .then(types => {
        const arr = Array.isArray(types) ? types : [];
        setConsentTypes(arr);
        // Pre-enable required types so they show expanded immediately
        const initial = {};
        arr.forEach(ct => {
          initial[ct.code] = {
            ...emptyGrant(user?.userName || ''),
            enabled: ct.required === true,
          };
        });
        setConsentGrants(initial);
      })
      .catch(() => {
        // Fallback: treat DATA_COLLECTION as the only required type if the API is unavailable
        setConsentTypes([{ code: 'DATA_COLLECTION', required: true, name: 'Data Collection Consent' }]);
        setConsentGrants({
          DATA_COLLECTION: { ...emptyGrant(user?.userName || ''), enabled: true },
        });
      });
  }, [user?.orgName, token]);

  // ── Form helpers ────────────────────────────────────────────────────────────
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

  // ── Consent helpers ─────────────────────────────────────────────────────────
  const toggleConsent = useCallback((code) => {
    setConsentGrants(prev => ({
      ...prev,
      [code]: { ...prev[code], enabled: !prev[code]?.enabled },
    }));
  }, []);

  const updateGrant = useCallback((code, key, value) => {
    setConsentGrants(prev => ({
      ...prev,
      [code]: { ...prev[code], [key]: value },
    }));
  }, []);

  const isGrantValid = (grant) => {
    if (!grant?.enabled) return false;
    if (!grant.consentedByName.trim()) return false;
    if (grant.consentedByType === 'PHYSICIAN' && !grant.emergencyJustification.trim()) return false;
    if (grant.consentedByType === 'GUARDIAN' && !grant.relationshipToPatient.trim()) return false;
    return true;
  };

  const requiredTypes = (consentTypes || []).filter(ct => ct.required);
  const allRequiredGranted = requiredTypes.every(ct => isGrantValid(consentGrants[ct.code]));

  const isFormValid =
    form.patient.patientCode &&
    form.patient.firstName &&
    form.patient.lastName &&
    form.patient.myContact.email &&
    allRequiredGranted;

  // ── Build payload ────────────────────────────────────────────────────────────
  const buildConsentGrants = () =>
    Object.entries(consentGrants)
      .filter(([, g]) => g.enabled)
      .map(([code, g]) => ({
        consentTypeCode: code,
        consentedByType: g.consentedByType,
        consentedByName: g.consentedByName.trim(),
        ...(g.consentedByType === 'PHYSICIAN' && g.emergencyJustification.trim() && {
          emergencyJustification: g.emergencyJustification.trim(),
        }),
        ...(g.consentedByType === 'GUARDIAN' && {
          relationshipToPatient: g.relationshipToPatient.trim(),
          ...(g.powerOfAttorneyRef.trim() && { powerOfAttorneyRef: g.powerOfAttorneyRef.trim() }),
        }),
        ...(g.notes.trim() && { notes: g.notes.trim() }),
      }));

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    const payload = {
      patient: form.patient,
      patientinfo: form.patientinfo.map(i => ({
        ...i,
        infoData: JSON.stringify(i.infoData),
      })),
      consentGrants: buildConsentGrants(),
    };
    try {
      await patientApi.create(user.orgName, user.hospitalCode, payload, token);
      Alert.alert(
        t('messages.success'),
        t('messages.patient_registered', { code: form.patient.patientCode }),
        [{ text: t('actions.ok'), onPress: onSuccess || onCancel }],
      );
    } catch (e) {
      Alert.alert(t('messages.error'), e.message || t('messages.failed_register_patient'));
    } finally {
      setSaving(false);
    }
  };

  // ── Consent section renderer ─────────────────────────────────────────────────
  const renderConsentSection = () => {
    if (consentTypes === null) {
      return (
        <View style={styles.consentLoading}>
          <ActivityIndicator size="small" color={T.accent} />
          <Text style={styles.consentLoadingText}>{t('consent.loading_types')}</Text>
        </View>
      );
    }

    if (consentTypes.length === 0) {
      return (
        <View style={styles.consentEmpty}>
          <IconShield size={20} color={T.textFaint} />
          <Text style={styles.consentEmptyText}>{t('consent.no_types_configured')}</Text>
        </View>
      );
    }

    return consentTypes.map(ct => {
      const grant = consentGrants[ct.code] || emptyGrant();
      const isEnabled = grant.enabled;
      const valid = isGrantValid(grant);

      return (
        <View
          key={ct.code}
          style={[
            styles.consentCard,
            ct.required && styles.consentCardRequired,
            isEnabled && valid && styles.consentCardGranted,
          ]}
        >
          {/* Type header row */}
          <TouchableOpacity
            style={styles.consentCardHeader}
            onPress={() => !ct.required && toggleConsent(ct.code)}
            activeOpacity={ct.required ? 1 : 0.7}
          >
            <View style={[styles.consentCheck, isEnabled && { backgroundColor: T.accent, borderColor: T.accent }]}>
              {isEnabled && <IconCheck size={11} color="#fff" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.consentTypeName}>{ct.name || ct.code}</Text>
              <Text style={styles.consentTypeCode}>{ct.code}</Text>
            </View>
            {ct.required && (
              <View style={[styles.requiredBadge, { backgroundColor: T.accentSoft }]}>
                <Text style={[styles.requiredBadgeText, { color: T.accent }]}>{t('consent.required')}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Inline grant form */}
          {isEnabled && (
            <View style={styles.consentForm}>
              {/* Consented-by type */}
              <Text style={styles.consentFieldLabel}>{t('consent.consented_by_type')} *</Text>
              <View style={styles.chipRow}>
                {CONSENTED_BY_TYPES.map(type => {
                  const active = grant.consentedByType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.chip, active && { backgroundColor: T.accent, borderColor: T.accent }]}
                      onPress={() => updateGrant(ct.code, 'consentedByType', type)}
                    >
                      <Text style={[styles.chipText, active && { color: '#fff' }]}>{type}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Consented-by name */}
              <Text style={styles.consentFieldLabel}>{t('consent.consented_by_name')} *</Text>
              <RNTextInput
                style={styles.consentInput}
                value={grant.consentedByName}
                onChangeText={v => updateGrant(ct.code, 'consentedByName', v)}
                placeholder={t('consent.consented_by_name_placeholder')}
                placeholderTextColor={T.textFaint}
              />

              {/* PHYSICIAN extra field */}
              {grant.consentedByType === 'PHYSICIAN' && (
                <>
                  <Text style={styles.consentFieldLabel}>{t('consent.emergency_justification')} *</Text>
                  <RNTextInput
                    style={[styles.consentInput, styles.consentTextarea]}
                    value={grant.emergencyJustification}
                    onChangeText={v => updateGrant(ct.code, 'emergencyJustification', v)}
                    placeholder={t('consent.emergency_justification_placeholder')}
                    placeholderTextColor={T.textFaint}
                    multiline
                    numberOfLines={3}
                  />
                </>
              )}

              {/* GUARDIAN extra fields */}
              {grant.consentedByType === 'GUARDIAN' && (
                <>
                  <Text style={styles.consentFieldLabel}>{t('consent.relationship')} *</Text>
                  <RNTextInput
                    style={styles.consentInput}
                    value={grant.relationshipToPatient}
                    onChangeText={v => updateGrant(ct.code, 'relationshipToPatient', v)}
                    placeholder={t('consent.relationship_placeholder')}
                    placeholderTextColor={T.textFaint}
                  />
                  <Text style={styles.consentFieldLabel}>{t('consent.poa_ref')}</Text>
                  <RNTextInput
                    style={styles.consentInput}
                    value={grant.powerOfAttorneyRef}
                    onChangeText={v => updateGrant(ct.code, 'powerOfAttorneyRef', v)}
                    placeholder={t('consent.poa_ref_placeholder')}
                    placeholderTextColor={T.textFaint}
                  />
                </>
              )}

              {/* Notes */}
              <Text style={styles.consentFieldLabel}>{t('consent.notes')}</Text>
              <RNTextInput
                style={[styles.consentInput, styles.consentTextarea]}
                value={grant.notes}
                onChangeText={v => updateGrant(ct.code, 'notes', v)}
                placeholder={t('consent.notes_placeholder')}
                placeholderTextColor={T.textFaint}
                multiline
                numberOfLines={2}
              />
            </View>
          )}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Banner */}
        <View style={styles.banner}>
          <IconUser size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('messages.register_patient_banner', { hospitalCode: user?.hospitalCode })}
          </Text>
        </View>

        {/* Patient Identity */}
        <View style={styles.section}>
          <SectionHeader title={t('entity.patient_identity')} />
          <Field label={t('entity.patient_mrn_code')} required>
            <TextInput
              value={form.patient.patientCode}
              onChangeText={v => updatePatient('patientCode', v.toUpperCase())}
              placeholder={t('placeholders.mrn_example')}
            />
          </Field>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.first_name')} required>
                <TextInput
                  value={form.patient.firstName}
                  onChangeText={v => updatePatient('firstName', v)}
                  placeholder={t('placeholders.john')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.last_name')} required>
                <TextInput
                  value={form.patient.lastName}
                  onChangeText={v => updatePatient('lastName', v)}
                  placeholder={t('placeholders.doe')}
                />
              </Field>
            </View>
          </View>
        </View>

        {/* Contact & Address */}
        <View style={styles.section}>
          <SectionHeader title={t('entity.contact_address')} />
          <Field label={t('entity.email_address')} required>
            <TextInput
              value={form.patient.myContact.email}
              onChangeText={v => updateContact('email', v.toLowerCase())}
              placeholder={t('placeholders.email_example')}
              leading={<IconMail size={16} color={T.textFaint} />}
            />
          </Field>
          <Field label={t('entity.phone_number')}>
            <TextInput
              value={form.patient.myContact.phone}
              onChangeText={v => updateContact('phone', v)}
              placeholder={t('placeholders.phone_example')}
              leading={<IconPhone size={16} color={T.textFaint} />}
            />
          </Field>
          <Field label={t('entity.street_address')}>
            <TextInput
              value={form.patient.myAddress.street1}
              onChangeText={v => updateAddress('street1', v)}
              placeholder={t('placeholders.address_example')}
              leading={<IconLocation size={16} color={T.textFaint} />}
            />
          </Field>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.city')}>
                <TextInput
                  value={form.patient.myAddress.city}
                  onChangeText={v => updateAddress('city', v)}
                  placeholder={t('placeholders.city_example')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.pincode')}>
                <TextInput
                  value={form.patient.myAddress.pincode}
                  onChangeText={v => updateAddress('pincode', v)}
                  placeholder={t('placeholders.pincode_example')}
                />
              </Field>
            </View>
          </View>
          <Field label={t('users.preferred_locale')}>
            <Card style={styles.selectCard} onPress={() => setShowLocalePicker(true)}>
              <Text style={styles.selectText}>
                {LOCALES.find(l => l.code === form.patient.preferredLocale)?.label || 'English'}
              </Text>
              <IconChevron size={18} color={T.textDim} />
            </Card>
          </Field>
        </View>

        {/* Preliminary Vitals */}
        <View style={styles.section}>
          <SectionHeader title={t('entity.preliminary_vitals')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.blood_group')}>
                <TextInput
                  value={form.patientinfo[0].infoData.bloodGroup}
                  onChangeText={v => updateInfo('bloodGroup', v)}
                  placeholder={t('placeholders.blood_group_example')}
                  leading={<IconHeart size={16} color={T.textFaint} />}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.weight')}>
                <TextInput
                  value={form.patientinfo[0].infoData.weight}
                  onChangeText={v => updateInfo('weight', v)}
                  placeholder={t('placeholders.weight_example')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.height')}>
                <TextInput
                  value={form.patientinfo[0].infoData.height}
                  onChangeText={v => updateInfo('height', v)}
                  placeholder={t('placeholders.height_example')}
                />
              </Field>
            </View>
          </View>
        </View>

        {/* ── Consent Section ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title={t('consent.title')} />
          <View style={[styles.consentNotice, { backgroundColor: T.accentSoft, borderColor: T.accent }]}>
            <IconShield size={16} color={T.accent} />
            <Text style={[styles.consentNoticeText, { color: T.text }]}>
              {t('consent.onboarding_notice')}
            </Text>
          </View>
          {renderConsentSection()}
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>
            {t('actions.cancel')}
          </Btn>
          <Btn
            variant="primary"
            style={{ flex: 2 }}
            disabled={!isFormValid || saving || consentTypes === null}
            onPress={handleCreate}
          >
            {saving ? t('actions.registering') : t('actions.register_patient')}
          </Btn>
        </View>

      </ScrollView>

      {/* Locale Picker Modal */}
      <Modal visible={showLocalePicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocalePicker(false)}
        >
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('users.select_locale')}</Text>
            {LOCALES.map(loc => (
              <TouchableOpacity
                key={loc.code}
                style={[
                  styles.localeOption,
                  form.patient.preferredLocale === loc.code && { backgroundColor: T.accentSoft },
                ]}
                onPress={() => { updatePatient('preferredLocale', loc.code); setShowLocalePicker(false); }}
              >
                <Text style={[
                  styles.localeOptionText,
                  form.patient.preferredLocale === loc.code && { color: T.accent, fontWeight: '700' },
                ]}>
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
    flexDirection: 'row', backgroundColor: T.accentSoft, padding: 14,
    borderRadius: 12, gap: 12, alignItems: 'flex-start', marginBottom: 24,
  },
  bannerText: { flex: 1, fontSize: 13, color: T.text, lineHeight: 18 },
  section: { marginBottom: 24 },
  row: { flexDirection: 'row', gap: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  selectCard: {
    height: 48, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: 12,
  },
  selectText: { color: T.text, fontSize: 14, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 16, textAlign: 'center' },
  localeOption: { padding: 14, borderRadius: 8, marginBottom: 4 },
  localeOptionText: { fontSize: 14, color: T.text },

  // ── Consent styles ────────────────────────────────────────────────────────
  consentNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12,
  },
  consentNoticeText: { flex: 1, fontSize: 12.5, lineHeight: 18 },

  consentLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  consentLoadingText: { fontSize: 13, color: T.textDim },
  consentEmpty: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  consentEmptyText: { fontSize: 13, color: T.textFaint },

  consentCard: {
    borderRadius: 12, borderWidth: 1.5, borderColor: T.borderSoft,
    backgroundColor: T.surface, marginBottom: 10, overflow: 'hidden',
  },
  consentCardRequired: { borderColor: T.accent + '55' },
  consentCardGranted: { borderColor: T.accent },

  consentCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
  },
  consentCheck: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: T.borderSoft, alignItems: 'center', justifyContent: 'center',
  },
  consentTypeName: { fontSize: 14, fontWeight: '700', color: T.text },
  consentTypeCode: { fontSize: 11, color: T.textDim, marginTop: 1 },

  requiredBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  requiredBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  consentForm: {
    paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2,
    borderTopWidth: 1, borderTopColor: T.borderSoft,
  },
  consentFieldLabel: {
    fontSize: 11, fontWeight: '600', color: T.textDim,
    marginTop: 10, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 2 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1.5, borderColor: T.borderSoft, backgroundColor: T.bg,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: T.textDim },
  consentInput: {
    borderWidth: 1, borderColor: T.borderSoft, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9, fontSize: 13.5,
    color: T.text, backgroundColor: T.bg,
  },
  consentTextarea: { height: 72, textAlignVertical: 'top' },
});
