import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { patientApi, wardApi, assignmentApi, admissionApi } from '../services/api';
import { IconPatient, IconDoor, IconCheck, IconChevron, IconShield } from '../icons';

export const PatientActionsSheet = ({ patient, visible, onClose }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [mode, setMode] = useState('main');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wards, setWards] = useState([]);
  const [query, setQuery] = useState('');
  const [gdprRef, setGdprRef] = useState('');
  const [gdprStatus, setGdprStatus] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const reset = useCallback(() => {
    setMode('main');
    setWards([]);
    setQuery('');
    setSaving(false);
    setGdprRef('');
    setGdprStatus(null);
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const handleClose = () => { reset(); onClose(); };

  const handleDischarge = () => {
    Alert.alert(
      t('actions.discharge_patient'),
      t('actions.confirm_discharge', { code: `${patient?.firstName} ${patient?.lastName} (${patient?.patientCode})` }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('actions.discharge'), style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await patientApi.discharge(user.orgName, user.careSiteCode, patient.patientCode, token);
              await admissionApi.close(user.orgName, user.careSiteCode, patient.patientCode, token);
              assignmentApi.deactivateDevices(user.orgName, user.careSiteCode, patient.patientCode, token).catch(() => {});
              Alert.alert(t('common.done'), t('actions.patient_discharged'), [{ text: t('common.ok'), onPress: handleClose }]);
            } catch (e) { Alert.alert(t('common.error'), e.message || t('common.failed')); }
            finally { setSaving(false); }
          },
        },
      ]
    );
  };

  const enterTransfer = async () => {
    setMode('transfer');
    setLoading(true);
    try {
      const data = await wardApi.listAll(user.orgName, user.careSiteCode, token);
      setWards(Array.isArray(data) ? data : []);
    } catch { setWards([]); }
    finally { setLoading(false); }
  };

  const handleTransfer = async (ward) => {
    setSaving(true);
    try {
      await patientApi.transfer(user.orgName, user.careSiteCode, patient.patientCode, { wardCode: ward.wardCode }, token);
      Alert.alert(t('common.done'), t('actions.patient_transferred_msg', { name: `${patient.firstName} ${patient.lastName}`, ward: ward.wardName }), [
        { text: t('common.ok'), onPress: handleClose },
      ]);
    } catch (e) { Alert.alert(t('common.error'), e.message || t('common.failed')); }
    finally { setSaving(false); }
  };

  const handleGdprSubmit = async () => {
    setSaving(true);
    try {
      const res = await patientApi.anonymize(
        user.orgName, user.careSiteCode, patient.patientCode, token,
        gdprRef.trim() || undefined,
      );
      const requestId = res?.data?.requestId;
      setGdprStatus({ status: res?.data?.status || 'PENDING' });
      setMode('gdpr_polling');
      pollRef.current = setInterval(async () => {
        try {
          const s = await patientApi.getGdprStatus(user.orgName, requestId, token);
          setGdprStatus(s);
          if (s.status === 'COMPLETE' || s.status === 'FAILED') {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } catch { /* keep polling */ }
      }, 3000);
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('messages.error_gdpr'));
    } finally {
      setSaving(false);
    }
  };

  const filteredWards = wards.filter(w =>
    w.wardName?.toLowerCase().includes(query.toLowerCase()) ||
    w.wardCode?.toLowerCase().includes(query.toLowerCase())
  );

  const renderContent = () => {
    if (mode === 'main') {
      return (
        <>
          <View style={styles.patientInfo}>
            <View style={[styles.patientIconBox, { backgroundColor: T.accentSoft }]}>
              <IconPatient size={20} color={T.accent} />
            </View>
            <View>
              <Text style={styles.patientName}>{patient?.firstName} {patient?.lastName}</Text>
              <Text style={styles.patientMeta}>{patient?.patientCode} · {patient?.status}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleDischarge}
            disabled={saving}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B98118' }]}>
              <IconCheck size={18} color="#10B981" />
            </View>
            <Text style={styles.actionLabel}>{t('actions.discharge_patient')}</Text>
            <IconChevron size={16} color={T.textFaint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={enterTransfer}
            disabled={saving}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF618' }]}>
              <IconDoor size={18} color="#8B5CF6" />
            </View>
            <Text style={styles.actionLabel}>{t('actions.transfer_ward')}</Text>
            <IconChevron size={16} color={T.textFaint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setMode('gdpr')}
            disabled={saving}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EF444418' }]}>
              <IconShield size={18} color="#EF4444" />
            </View>
            <Text style={styles.actionLabel}>{t('actions.gdpr_erasure')}</Text>
            <IconChevron size={16} color={T.textFaint} />
          </TouchableOpacity>
        </>
      );
    }

    if (mode === 'transfer') {
      return (
        <>
          <View style={styles.subHeader}>
            <TouchableOpacity onPress={() => { setMode('main'); setQuery(''); }}>
              <Text style={styles.backLink}>← {t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={styles.subTitle}>{t('actions.select_ward')}</Text>
          </View>
          <RNTextInput
            style={[styles.searchInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
            placeholder={t('actions.search_wards')}
            placeholderTextColor={T.textFaint}
            value={query}
            onChangeText={setQuery}
          />
          {loading ? (
            <ActivityIndicator color={T.accent} style={{ marginVertical: 24 }} />
          ) : (
            <ScrollView style={{ maxHeight: 280 }}>
              {filteredWards.map(w => (
                <TouchableOpacity
                  key={w.wardCode}
                  style={styles.listItem}
                  onPress={() => handleTransfer(w)}
                  disabled={saving}
                >
                  <View style={[styles.actionIcon, { backgroundColor: T.surface2 }]}>
                    <IconDoor size={16} color={T.textDim} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.listName}>{w.wardName}</Text>
                    <Text style={styles.listMeta}>{w.wardCode} · {w.wardType}</Text>
                  </View>
                  <IconChevron size={14} color={T.textFaint} />
                </TouchableOpacity>
              ))}
              {filteredWards.length === 0 && !loading && (
                <Text style={styles.emptyText}>{t('actions.no_wards')}</Text>
              )}
            </ScrollView>
          )}
        </>
      );
    }

    if (mode === 'gdpr') {
      return (
        <>
          <View style={styles.subHeader}>
            <TouchableOpacity onPress={() => setMode('main')}>
              <Text style={styles.backLink}>← {t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={styles.subTitle}>{t('actions.gdpr_erasure')}</Text>
          </View>
          <View style={styles.gdprWarning}>
            <Text style={styles.gdprWarningText}>
              {t('messages.gdpr_warning', { name: `${patient?.firstName} ${patient?.lastName}` })}
            </Text>
          </View>
          <RNTextInput
            style={[styles.searchInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
            placeholder={t('actions.gdpr_ref_placeholder')}
            placeholderTextColor={T.textFaint}
            value={gdprRef}
            onChangeText={setGdprRef}
          />
          <TouchableOpacity style={styles.gdprSubmitRow} onPress={handleGdprSubmit} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#EF4444" />
              : <Text style={styles.gdprSubmitText}>{t('actions.gdpr_submit')}</Text>}
          </TouchableOpacity>
        </>
      );
    }

    if (mode === 'gdpr_polling') {
      const status = gdprStatus?.status;
      const isDone = status === 'COMPLETE';
      const isFailed = status === 'FAILED';
      return (
        <>
          <Text style={styles.subTitle}>{t('messages.gdpr_request_status')}</Text>
          <View style={styles.gdprStatusBox}>
            {!isDone && !isFailed && <ActivityIndicator color={T.accent} style={{ marginBottom: 12 }} />}
            <Text style={[styles.gdprStatusLabel, isDone && { color: '#10B981' }, isFailed && { color: '#EF4444' }]}>
              {isDone
                ? t('messages.gdpr_complete', { code: gdprStatus.anonymousCode })
                : isFailed
                ? t('messages.gdpr_failed', { reason: gdprStatus.failureReason || '' })
                : t(`messages.gdpr_${(status || 'pending').toLowerCase()}`)}
            </Text>
          </View>
          {(isDone || isFailed) && (
            <TouchableOpacity style={styles.gdprSubmitRow} onPress={handleClose}>
              <Text style={[styles.gdprSubmitText, { color: T.accent }]}>{t('common.done')}</Text>
            </TouchableOpacity>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{t('actions.patient_actions')}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>{t('common.done')}</Text>
          </TouchableOpacity>
        </View>
        {renderContent()}
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
  patientInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  patientIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 15, fontWeight: '700', color: T.text },
  patientMeta: { fontSize: 11, color: T.textDim, marginTop: 2 },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  actionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, fontSize: 15, color: T.text, fontWeight: '500' },
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  backLink: { fontSize: 14, color: T.accent, fontWeight: '600' },
  subTitle: { fontSize: 15, fontWeight: '700', color: T.text },
  searchInput: { height: 40, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14, marginBottom: 10 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  listName: { fontSize: 14, fontWeight: '600', color: T.text },
  listMeta: { fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: 'monospace' },
  emptyText: { color: T.textFaint, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  gdprWarning: { backgroundColor: '#EF444412', borderRadius: 10, padding: 12, marginBottom: 12 },
  gdprWarningText: { fontSize: 13, color: '#EF4444', lineHeight: 18 },
  gdprSubmitRow: { alignItems: 'center', paddingVertical: 16 },
  gdprSubmitText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
  gdprStatusBox: { alignItems: 'center', paddingVertical: 24 },
  gdprStatusLabel: { fontSize: 14, color: T.text, textAlign: 'center', lineHeight: 20, marginTop: 8 },
});
