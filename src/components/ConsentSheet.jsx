import React, { useState, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { consentApi } from '../services/api';
import { StatusPill } from './StatusPill';
import { IconCheck, IconPatient, IconChevron, IconShield, IconClock } from '../icons';

const CONSENTED_BY_TYPES = ['SELF', 'PHYSICIAN', 'GUARDIAN'];

const consentedByColor = { SELF: '#10B981', PHYSICIAN: '#3B82F6', GUARDIAN: '#8B5CF6' };

export const ConsentSheet = ({ patient, visible, onClose }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [mode, setMode] = useState('list');
  const [consents, setConsents] = useState([]);
  const [consentTypes, setConsentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    consentTypeCode: '',
    consentedByType: 'PHYSICIAN',
    consentedByName: user?.userName || '',
    emergencyJustification: '',
    relationshipToPatient: '',
    powerOfAttorneyRef: '',
    notes: '',
  });

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const reset = useCallback(() => {
    setMode('list');
    setForm({
      consentTypeCode: '',
      consentedByType: 'PHYSICIAN',
      consentedByName: user?.userName || '',
      emergencyJustification: '',
      relationshipToPatient: '',
      powerOfAttorneyRef: '',
      notes: '',
    });
  }, [user?.userName]);

  const handleClose = () => { reset(); onClose(); };

  const loadData = useCallback(async () => {
    if (!patient?.patientCode || !user?.orgName) return;
    setLoading(true);
    try {
      const [types, existing] = await Promise.all([
        consentApi.getTypes(user.orgName, token).catch(() => []),
        consentApi.getPatientConsents(
          user.orgName, patient.patientCode,
          patient.orgId, patient.patientId, token
        ).catch(() => []),
      ]);
      setConsentTypes(Array.isArray(types) ? types : []);
      setConsents(Array.isArray(existing) ? existing : []);
    } finally {
      setLoading(false);
    }
  }, [patient, user?.orgName, token]);

  const handleShow = () => { loadData(); };

  const goToRecord = () => setMode('record');

  const isFormValid = form.consentTypeCode && form.consentedByType && form.consentedByName.trim() &&
    (form.consentedByType !== 'PHYSICIAN' || form.emergencyJustification.trim()) &&
    (form.consentedByType !== 'GUARDIAN' || form.relationshipToPatient.trim());

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setSaving(true);
    try {
      const payload = {
        orgId: patient.orgId,
        patientId: patient.patientId,
        consentTypeCode: form.consentTypeCode,
        consentedByType: form.consentedByType,
        consentedByName: form.consentedByName.trim(),
        notes: form.notes.trim() || undefined,
        ...(form.consentedByType === 'PHYSICIAN' && { emergencyJustification: form.emergencyJustification.trim() }),
        ...(form.consentedByType === 'GUARDIAN' && {
          relationshipToPatient: form.relationshipToPatient.trim(),
          powerOfAttorneyRef: form.powerOfAttorneyRef.trim() || undefined,
        }),
      };
      await consentApi.record(user.orgName, patient.patientCode, payload, token);
      Alert.alert(t('common.success'), t('consent.recorded_success'), [
        { text: t('common.ok'), onPress: () => { reset(); loadData(); } },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), e.data?.message || e.message || t('consent.record_failed'));
    } finally {
      setSaving(false);
    }
  };

  const renderList = () => (
    <>
      {/* Patient info */}
      <View style={styles.patientRow}>
        <View style={[styles.patientIcon, { backgroundColor: T.accentSoft }]}>
          <IconPatient size={18} color={T.accent} />
        </View>
        <View>
          <Text style={styles.patientName}>{patient?.firstName} {patient?.lastName}</Text>
          <Text style={styles.patientMeta}>{patient?.patientCode}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={T.accent} style={{ marginVertical: 24 }} />
      ) : (
        <ScrollView style={{ maxHeight: 260 }}>
          {consents.length === 0 ? (
            <View style={styles.emptyBox}>
              <IconShield size={32} color={T.textFaint} />
              <Text style={styles.emptyText}>{t('consent.no_consents')}</Text>
            </View>
          ) : (
            consents.map(c => (
              <View key={c.consentId} style={styles.consentItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.consentType}>{c.consentTypeCode}</Text>
                  <Text style={styles.consentMeta}>
                    {c.consentedByType} · {c.consentedByName}
                  </Text>
                  {c.grantedAt && (
                    <Text style={styles.consentDate}>
                      <IconClock size={11} color={T.textFaint} /> {new Date(c.grantedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <StatusPill status={c.status} />
              </View>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.recordBtn} onPress={goToRecord}>
        <View style={[styles.recordIcon, { backgroundColor: T.accentSoft }]}>
          <IconCheck size={18} color={T.accent} />
        </View>
        <Text style={styles.recordBtnText}>{t('consent.record_new')}</Text>
        <IconChevron size={16} color={T.textFaint} />
      </TouchableOpacity>
    </>
  );

  const renderRecord = () => (
    <>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setMode('list')}>
          <Text style={styles.backLink}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.subTitle}>{t('consent.record_title')}</Text>
      </View>

      <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>

        {/* Consent type */}
        <Text style={styles.fieldLabel}>{t('consent.type')} *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {consentTypes.length > 0 ? consentTypes.map(ct => (
              <TouchableOpacity
                key={ct.code}
                style={[styles.typeChip, form.consentTypeCode === ct.code && { backgroundColor: T.accent, borderColor: T.accent }]}
                onPress={() => updateForm('consentTypeCode', ct.code)}
              >
                <Text style={[styles.typeChipText, form.consentTypeCode === ct.code && { color: '#fff' }]}>
                  {ct.code}
                </Text>
              </TouchableOpacity>
            )) : (
              <TouchableOpacity
                style={[styles.typeChip, form.consentTypeCode === 'DATA_COLLECTION' && { backgroundColor: T.accent, borderColor: T.accent }]}
                onPress={() => updateForm('consentTypeCode', 'DATA_COLLECTION')}
              >
                <Text style={[styles.typeChipText, form.consentTypeCode === 'DATA_COLLECTION' && { color: '#fff' }]}>
                  DATA_COLLECTION
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Consented by type */}
        <Text style={styles.fieldLabel}>{t('consent.consented_by_type')} *</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {CONSENTED_BY_TYPES.map(type => {
            const active = form.consentedByType === type;
            const color = consentedByColor[type];
            return (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, active && { backgroundColor: color, borderColor: color }]}
                onPress={() => updateForm('consentedByType', type)}
              >
                <Text style={[styles.typeChipText, active && { color: '#fff' }]}>{type}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Consented by name */}
        <Text style={styles.fieldLabel}>{t('consent.consented_by_name')} *</Text>
        <RNTextInput
          style={styles.input}
          value={form.consentedByName}
          onChangeText={v => updateForm('consentedByName', v)}
          placeholder={t('consent.consented_by_name_placeholder')}
          placeholderTextColor={T.textFaint}
        />

        {/* PHYSICIAN: emergency justification */}
        {form.consentedByType === 'PHYSICIAN' && (
          <>
            <Text style={styles.fieldLabel}>{t('consent.emergency_justification')} *</Text>
            <RNTextInput
              style={[styles.input, styles.textarea]}
              value={form.emergencyJustification}
              onChangeText={v => updateForm('emergencyJustification', v)}
              placeholder={t('consent.emergency_justification_placeholder')}
              placeholderTextColor={T.textFaint}
              multiline
              numberOfLines={3}
            />
          </>
        )}

        {/* GUARDIAN: relationship + POA ref */}
        {form.consentedByType === 'GUARDIAN' && (
          <>
            <Text style={styles.fieldLabel}>{t('consent.relationship')} *</Text>
            <RNTextInput
              style={styles.input}
              value={form.relationshipToPatient}
              onChangeText={v => updateForm('relationshipToPatient', v)}
              placeholder={t('consent.relationship_placeholder')}
              placeholderTextColor={T.textFaint}
            />
            <Text style={styles.fieldLabel}>{t('consent.poa_ref')}</Text>
            <RNTextInput
              style={styles.input}
              value={form.powerOfAttorneyRef}
              onChangeText={v => updateForm('powerOfAttorneyRef', v)}
              placeholder={t('consent.poa_ref_placeholder')}
              placeholderTextColor={T.textFaint}
            />
          </>
        )}

        {/* Notes */}
        <Text style={styles.fieldLabel}>{t('consent.notes')}</Text>
        <RNTextInput
          style={[styles.input, styles.textarea]}
          value={form.notes}
          onChangeText={v => updateForm('notes', v)}
          placeholder={t('consent.notes_placeholder')}
          placeholderTextColor={T.textFaint}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: isFormValid ? T.accent : T.borderSoft }]}
          onPress={handleSubmit}
          disabled={!isFormValid || saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.submitBtnText}>{t('consent.submit')}</Text>}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
      onShow={handleShow}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{t('consent.title')}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>{t('common.done')}</Text>
          </TouchableOpacity>
        </View>

        {mode === 'list' ? renderList() : renderRecord()}
      </View>
    </Modal>
  );
};

const createStyles = (T) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: T.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12, paddingHorizontal: 20,
    borderTopWidth: 1, borderColor: T.borderSoft,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: T.border, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: T.text },
  closeBtn: { paddingHorizontal: 4 },
  closeBtnText: { fontSize: 15, color: T.accent, fontWeight: '600' },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  patientIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 14, fontWeight: '700', color: T.text },
  patientMeta: { fontSize: 11, color: T.textDim, marginTop: 2 },
  emptyBox: { alignItems: 'center', paddingVertical: 28 },
  emptyText: { fontSize: 13, color: T.textFaint, marginTop: 10 },
  consentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  consentType: { fontSize: 13, fontWeight: '700', color: T.text },
  consentMeta: { fontSize: 11, color: T.textDim, marginTop: 2 },
  consentDate: { fontSize: 10.5, color: T.textFaint, marginTop: 2 },
  recordBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, marginTop: 4, borderTopWidth: 1, borderTopColor: T.borderSoft },
  recordIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recordBtnText: { flex: 1, fontSize: 15, fontWeight: '500', color: T.text },
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  backLink: { fontSize: 14, color: T.accent, fontWeight: '600' },
  subTitle: { fontSize: 15, fontWeight: '700', color: T.text },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: T.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: T.borderSoft, backgroundColor: T.surface },
  typeChipText: { fontSize: 12, fontWeight: '700', color: T.textDim },
  input: { borderWidth: 1, borderColor: T.borderSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: T.text, backgroundColor: T.surface, marginBottom: 14 },
  textarea: { height: 80, textAlignVertical: 'top' },
  submitBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
