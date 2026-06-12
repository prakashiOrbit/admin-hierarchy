import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform, Alert, Modal,
  TouchableOpacity, ActivityIndicator, TextInput as RNTextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, PhoneInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconLocation, IconHeart, IconChevron, IconCheck, IconShield } from '../../icons';
import { patientApi, consentApi, organisationApi } from '../../services/api';

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

const emptySharedGrant = () => ({
  consentedByType: 'SELF',
  consentedByName: '',
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
  const [patientJwtHours, setPatientJwtHours] = useState('1');

  // Consent state
  const [consentTypes, setConsentTypes] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [sharedGrant, setSharedGrant] = useState(emptySharedGrant());

  // Load consent types on mount
  useEffect(() => {
    if (!user?.orgName || !token) return;
    let cancelled = false;
    consentApi.getTypes(user.orgName, token)
      .then(types => {
        if (cancelled) return;
        const arr = Array.isArray(types) ? types : [];
        setConsentTypes(arr);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = [{ code: 'DATA_COLLECTION', required: false, name: 'Data Collection Consent' }];
        setConsentTypes(fallback);
      });
    return () => { cancelled = true; };
  }, [user?.orgName, token]);

  // Form helpers
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

  const updateSharedGrant = useCallback((key, value) => {
    setSharedGrant(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleCode = useCallback((code) => {
    setSelectedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }, []);

  // Validation — consent is optional; if anything is selected, grant details must be filled
  const grantFormValid =
    sharedGrant.consentedByName.trim().length > 0 &&
    (sharedGrant.consentedByType !== 'PHYSICIAN' || sharedGrant.emergencyJustification.trim().length > 0) &&
    (sharedGrant.consentedByType !== 'GUARDIAN' || sharedGrant.relationshipToPatient.trim().length > 0);

  const consentSectionValid = selectedCodes.size === 0 || grantFormValid;

  const isFormValid =
    form.patient.patientCode &&
    form.patient.firstName &&
    form.patient.lastName &&
    form.patient.myContact.email &&
    consentSectionValid;

  // Build payload
  const buildConsentGrants = () =>
    Array.from(selectedCodes).map(code => ({
      consentTypeCode: code,
      consentedByType: sharedGrant.consentedByType,
      consentedByName: sharedGrant.consentedByName.trim(),
      ...(user?.userId && { consentedByUserId: user.userId }),
      ...(sharedGrant.consentedByType === 'PHYSICIAN' && sharedGrant.emergencyJustification.trim() && {
        emergencyJustification: sharedGrant.emergencyJustification.trim(),
      }),
      ...(sharedGrant.consentedByType === 'GUARDIAN' && {
        relationshipToPatient: sharedGrant.relationshipToPatient.trim(),
        ...(sharedGrant.powerOfAttorneyRef.trim() && { powerOfAttorneyRef: sharedGrant.powerOfAttorneyRef.trim() }),
      }),
      ...(sharedGrant.notes.trim() && { notes: sharedGrant.notes.trim() }),
    }));

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.careSiteCode) return;
    const patientSeconds = parseInt(patientJwtHours, 10) * 3600;
    if (!patientJwtHours || isNaN(patientSeconds) || patientSeconds <= 0) {
      Alert.alert(t('common.invalid_input'), t('security_policy.err_invalid_duration'));
      return;
    }
    setSaving(true);
    const payload = {
      patient: form.patient,
      patientinfo: form.patientinfo.map(i => ({
        ...i,
        infoData: JSON.stringify(i.infoData),
      })),
    };
    try {
      const result = await patientApi.create(user.orgName, user.careSiteCode, payload, token);
      const created = result?.data ?? result;
      const grants = buildConsentGrants();
      if (grants.length > 0) {
        await Promise.all(
          grants.map(grant =>
            consentApi.record(
              user.orgName,
              created.patientCode || form.patient.patientCode,
              { orgId: created.orgId, patientId: created.patientId, ...grant },
              token,
            )
          )
        );
      }
      await organisationApi.updateCareSiteJwtValidity(user.orgName, user.careSiteCode, { patientJwtValiditySeconds: patientSeconds }, token);
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

  // Consent section
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

    const anySelected = selectedCodes.size > 0;
    const staffName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.userName || '';

    return (
      <View style={styles.consentBox}>

        {/* ── Step 1: Select consent types ── */}
        <Text style={styles.consentStepLabel}>{t('consent.step_select')}</Text>
        {consentTypes.map(ct => {
          const isSelected = selectedCodes.has(ct.code);
          return (
            <TouchableOpacity
              key={ct.code}
              style={styles.consentRow}
              onPress={() => toggleCode(ct.code)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.consentCheck,
                isSelected && { backgroundColor: T.accent, borderColor: T.accent },
              ]}>
                {isSelected && <IconCheck size={11} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.consentRowName, isSelected && { color: T.accent }]}>
                  {ct.name || ct.code}
                </Text>
                <Text style={styles.consentRowCode}>{ct.code}</Text>
              </View>
              {ct.required && (
                <View style={[styles.requiredBadge, { backgroundColor: T.surface2 }]}>
                  <Text style={[styles.requiredBadgeText, { color: T.textDim }]}>
                    {t('consent.recommended')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* ── Step 2: Fill details (shown only when at least one selected) ── */}
        {anySelected && (
          <View style={styles.consentFormWrap}>
            <View style={styles.consentDivider} />
            <Text style={styles.consentStepLabel}>{t('consent.step_details')}</Text>

            {/* Consented-by type */}
            <Text style={styles.consentFieldLabel}>{t('consent.consented_by_type')} *</Text>
            <View style={styles.chipRow}>
              {CONSENTED_BY_TYPES.map(type => {
                const active = sharedGrant.consentedByType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, active && { backgroundColor: T.accent, borderColor: T.accent }]}
                    onPress={() => updateSharedGrant('consentedByType', type)}
                  >
                    <Text style={[styles.chipText, active && { color: '#fff' }]}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Name of person consenting */}
            <Text style={styles.consentFieldLabel}>{t('consent.consented_by_name')} *</Text>
            <RNTextInput
              style={styles.consentInput}
              value={sharedGrant.consentedByName}
              onChangeText={v => updateSharedGrant('consentedByName', v)}
              placeholder={t('consent.consented_by_name_placeholder')}
              placeholderTextColor={T.textFaint}
            />

            {/* PHYSICIAN: emergency justification */}
            {sharedGrant.consentedByType === 'PHYSICIAN' && (
              <>
                <Text style={styles.consentFieldLabel}>{t('consent.emergency_justification')} *</Text>
                <RNTextInput
                  style={[styles.consentInput, styles.consentTextarea]}
                  value={sharedGrant.emergencyJustification}
                  onChangeText={v => updateSharedGrant('emergencyJustification', v)}
                  placeholder={t('consent.emergency_justification_placeholder')}
                  placeholderTextColor={T.textFaint}
                  multiline
                  numberOfLines={3}
                />
              </>
            )}

            {/* GUARDIAN: relationship + POA */}
            {sharedGrant.consentedByType === 'GUARDIAN' && (
              <>
                <Text style={styles.consentFieldLabel}>{t('consent.relationship')} *</Text>
                <RNTextInput
                  style={styles.consentInput}
                  value={sharedGrant.relationshipToPatient}
                  onChangeText={v => updateSharedGrant('relationshipToPatient', v)}
                  placeholder={t('consent.relationship_placeholder')}
                  placeholderTextColor={T.textFaint}
                />
                <Text style={styles.consentFieldLabel}>{t('consent.poa_ref')}</Text>
                <RNTextInput
                  style={styles.consentInput}
                  value={sharedGrant.powerOfAttorneyRef}
                  onChangeText={v => updateSharedGrant('powerOfAttorneyRef', v)}
                  placeholder={t('consent.poa_ref_placeholder')}
                  placeholderTextColor={T.textFaint}
                />
              </>
            )}

            {/* Notes */}
            <Text style={styles.consentFieldLabel}>{t('consent.notes')}</Text>
            <RNTextInput
              style={[styles.consentInput, styles.consentTextarea]}
              value={sharedGrant.notes}
              onChangeText={v => updateSharedGrant('notes', v)}
              placeholder={t('consent.notes_placeholder')}
              placeholderTextColor={T.textFaint}
              multiline
              numberOfLines={2}
            />

            {/* Proof panel — staff witness record */}
            {staffName ? (
              <View style={[styles.witnessPanel, { backgroundColor: T.accentSoft, borderColor: T.accent + '44' }]}>
                <IconShield size={14} color={T.accent} />
                <Text style={[styles.witnessText, { color: T.textDim }]}>
                  {t('consent.witness_note', { name: staffName })}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Banner */}
        <View style={styles.banner}>
          <IconUser size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('messages.register_patient_banner', { careSiteCode: user?.careSiteCode })}
          </Text>
        </View>

        {/* Patient Identity */}
        <View style={styles.section}>
          <SectionHeader title={t('entity.patient_identity')} />
          <Field label={t('entity.patient_mrn_code')} required>
            <TextInput
              value={form.patient.patientCode}
              onChangeText={v => updatePatient('patientCode', v)}
              autoCapitalize="characters"
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
            <PhoneInput value={form.patient.myContact.phone} onChangeText={v => updateContact('phone', v)} />
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
                {LOCALES.find(l => l.code === form.patient.preferredLocale)?.label || t('languages.en')}
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

        {/* Consent Section */}
        <View style={styles.section}>
          <SectionHeader title={t('consent.title')} />
          <View style={[styles.consentNotice, { backgroundColor: T.surface, borderColor: T.borderSoft }]}>
            <IconShield size={16} color={T.textDim} />
            <Text style={[styles.consentNoticeText, { color: T.textDim }]}>
              {t('consent.onboarding_notice_optional')}
            </Text>
          </View>
          {renderConsentSection()}
        </View>

        {/* Security Policy Section */}
        <View style={styles.section}>
          <SectionHeader title={t('security_policy.title')} />
          <Card style={styles.policyCard}>
            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>{t('security_policy.patient_session')}</Text>
              <View style={styles.policyInputRow}>
                <RNTextInput
                  style={[styles.policyInput, { color: T.text, borderColor: T.border, backgroundColor: T.surface2 }]}
                  value={patientJwtHours}
                  onChangeText={setPatientJwtHours}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={T.textFaint}
                  selectTextOnFocus
                />
                <Text style={styles.policyUnit}>{t('security_policy.hrs')}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>
            {t('actions.cancel')}
          </Btn>
          <Btn
            variant="primary"
            style={{ flex: 2 }}
            disabled={!isFormValid || saving}
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

  // Consent
  consentNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12,
  },
  consentNoticeText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
  consentLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  consentLoadingText: { fontSize: 13, color: T.textDim },
  consentEmpty: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  consentEmptyText: { fontSize: 13, color: T.textFaint },

  consentBox: {
    borderRadius: 12, borderWidth: 1.5, borderColor: T.borderSoft,
    backgroundColor: T.surface, overflow: 'hidden',
  },
  consentStepLabel: {
    fontSize: 10, fontWeight: '700', color: T.textDim,
    letterSpacing: 0.6, textTransform: 'uppercase',
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8,
  },
  consentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    borderTopWidth: 1, borderTopColor: T.borderSoft,
  },
  consentCheck: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: T.borderSoft, alignItems: 'center', justifyContent: 'center',
  },
  consentRowName: { fontSize: 13.5, fontWeight: '600', color: T.text },
  consentRowCode: { fontSize: 10.5, color: T.textFaint, marginTop: 1 },
  requiredBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  requiredBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  consentFormWrap: { paddingHorizontal: 14, paddingBottom: 14 },
  consentDivider: { height: 1, backgroundColor: T.borderSoft, marginVertical: 12 },

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

  witnessPanel: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginTop: 14, padding: 10, borderRadius: 8, borderWidth: 1,
  },
  witnessText: { flex: 1, fontSize: 11.5, lineHeight: 17 },
  policyCard: { padding: 0, overflow: 'hidden' },
  policyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  policyLabel: { fontSize: 14, color: T.textDim },
  policyInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  policyInput: { width: 60, height: 36, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  policyUnit: { fontSize: 13, color: T.textDim },
});
