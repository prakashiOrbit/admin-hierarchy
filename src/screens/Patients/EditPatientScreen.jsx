import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert,
  TouchableOpacity, TextInput as RNTextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconPhone, IconLocation, IconHeart, IconBuilding, IconCheck, IconShield } from '../../icons';
import { patientApi, consentApi } from '../../services/api';

const CONSENTED_BY_TYPES = ['SELF', 'GUARDIAN', 'PHYSICIAN'];

const emptySharedGrant = () => ({
  consentedByType: 'SELF',
  consentedByName: '',
  emergencyJustification: '',
  relationshipToPatient: '',
  powerOfAttorneyRef: '',
  notes: '',
});

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

  // Consent state
  const [consentTypes, setConsentTypes] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [sharedGrant, setSharedGrant] = useState(emptySharedGrant());

  useEffect(() => {
    if (!user?.orgName || !token) return;
    let cancelled = false;
    consentApi.getTypes(user.orgName, token)
      .then(types => {
        if (cancelled) return;
        setConsentTypes(Array.isArray(types) ? types : []);
      })
      .catch(() => {
        if (cancelled) return;
        setConsentTypes([{ code: 'DATA_COLLECTION', required: false, name: 'Data Collection Consent' }]);
      });
    return () => { cancelled = true; };
  }, [user?.orgName, token]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

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

  // Consent form validity — only required when at least one is selected
  const grantFormValid =
    sharedGrant.consentedByName.trim().length > 0 &&
    (sharedGrant.consentedByType !== 'PHYSICIAN' || sharedGrant.emergencyJustification.trim().length > 0) &&
    (sharedGrant.consentedByType !== 'GUARDIAN' || sharedGrant.relationshipToPatient.trim().length > 0);

  const isConsentSectionValid = selectedCodes.size === 0 || grantFormValid;

  const isValid = form.firstName && form.lastName && form.email && isConsentSectionValid;

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

  const handleSave = async () => {
    setSaving(true);
    const grants = buildConsentGrants();
    const payload = {
      patient: {
        patientId: p.patientId,
        patientCode: p.patientCode,
        firstName: form.firstName,
        lastName: form.lastName,
        myContact: { email: form.email, phone: form.phone },
        myAddress: { street1: form.street1, city: form.city, state: form.state, pincode: form.pincode, country: form.country },
      },
      patientinfo: [{
        infoType: 'VITAL_SIGNS',
        infoData: JSON.stringify({ bloodGroup: form.bloodGroup, weight: form.weight, height: form.height }),
      }],
      ...(grants.length > 0 && { consentGrants: grants }),
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

  const renderConsentSection = () => {
    if (consentTypes === null) {
      return (
        <View style={styles.consentLoading}>
          <ActivityIndicator size="small" color={T.accent} />
          <Text style={styles.consentLoadingText}>{t('consent.loading_types')}</Text>
        </View>
      );
    }
    if (consentTypes.length === 0) return null;

    const anySelected = selectedCodes.size > 0;
    const staffName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.userName || '';

    return (
      <View style={styles.consentBox}>

        {/* Select consent types */}
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
            </TouchableOpacity>
          );
        })}

        {/* Shared form — shown only when at least one consent is selected */}
        {anySelected && (
          <View style={styles.consentFormWrap}>
            <View style={styles.consentDivider} />
            <Text style={styles.consentStepLabel}>{t('consent.step_details')}</Text>

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

            <Text style={styles.consentFieldLabel}>{t('consent.consented_by_name')} *</Text>
            <RNTextInput
              style={styles.consentInput}
              value={sharedGrant.consentedByName}
              onChangeText={v => updateSharedGrant('consentedByName', v)}
              placeholder={t('consent.consented_by_name_placeholder')}
              placeholderTextColor={T.textFaint}
            />

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
        <View style={styles.banner}>
          <IconUser size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('messages.editing_patient_banner', { name: `${p.firstName} ${p.lastName}` })}
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
              </Field>
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

        {/* Additional Consent */}
        <View style={styles.section}>
          <SectionHeader title={t('consent.additional_title')} />
          <Text style={styles.consentOptionalHint}>{t('consent.additional_hint')}</Text>
          {renderConsentSection()}
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

  consentOptionalHint: { fontSize: 12, color: T.textFaint, marginBottom: 10, lineHeight: 17 },
  consentLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  consentLoadingText: { fontSize: 13, color: T.textDim },

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
});
