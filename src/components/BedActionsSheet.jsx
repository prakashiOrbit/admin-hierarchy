import React, { useState, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, Platform, ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { bedApi, wardApi, assignmentApi, admissionApi } from '../services/api';
import { Avatar } from './Shared';
import { IconBed, IconPatient, IconDoor, IconAlert, IconCheck, IconChevron } from '../icons';

export const BedActionsSheet = ({ bed, wardCode, visible, onClose }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [mode, setMode] = useState('main');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [alarmForm, setAlarmForm] = useState({
    hrMin: '50', hrMax: '120',
    spo2Min: '90',
    sysBpMin: '90', sysBpMax: '160',
    diasBpMin: '60', diasBpMax: '110',
    tempMin: '36.0', tempMax: '38.5',
  });

  const ACTION_LIST = [
    { key: 'unassign',  label: t('actions.unassign_patient'),  icon: IconPatient, color: '#F59E0B' },
    { key: 'discharge', label: t('actions.discharge_patient'), icon: IconCheck,   color: '#10B981' },
    { key: 'transfer',  label: t('actions.transfer_ward'),  icon: IconDoor,    color: '#8B5CF6' },
    { key: 'alarm',     label: t('actions.alarm_config'),      icon: IconAlert,   color: '#EF4444' },
  ];

  const reset = useCallback(() => {
    setMode('main');
    setItems([]);
    setQuery('');
    setSaving(false);
  }, []);

  const handleClose = () => { reset(); onClose(); };

  const enterMode = async (key) => {
    if (key === 'unassign') {
      Alert.alert(t('actions.unassign_patient'), t('actions.confirm_unassign', { code: bed.bedCode }), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('actions.unassign_patient'), style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await bedApi.unassignPatient(user.orgName, user.hospitalCode, bed.bedCode, token);
              Alert.alert(t('common.done'), t('actions.patient_unassigned'), [{ text: 'OK', onPress: handleClose }]);
            } catch (e) { Alert.alert(t('common.error'), e.message || 'Failed.'); }
            finally { setSaving(false); }
          },
        },
      ]);
      return;
    }
    if (key === 'discharge') {
      Alert.alert(t('actions.discharge_patient'), t('actions.confirm_discharge', { code: bed.bedCode }), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('actions.discharge_patient'), style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await bedApi.discharge(user.orgName, user.hospitalCode, bed.bedCode, token);
              await admissionApi.close(user.orgName, user.hospitalCode, bed.patientCode, token);
              assignmentApi.deactivateDevices(user.orgName, user.hospitalCode, bed.patientCode, token).catch(() => {});
              Alert.alert(t('common.done'), t('actions.patient_discharged'), [{ text: 'OK', onPress: handleClose }]);
            } catch (e) { Alert.alert(t('common.error'), e.message || 'Failed.'); }
            finally { setSaving(false); }
          },
        },
      ]);
      return;
    }
    if (key === 'transfer') {
      setMode('transfer');
      setLoading(true);
      try {
        const data = await wardApi.listAll(user.orgName, user.hospitalCode, token);
        setItems(Array.isArray(data) ? data.filter(w => w.wardCode !== wardCode) : []);
      } catch { setItems([]); }
      finally { setLoading(false); }
      return;
    }
    if (key === 'alarm') {
      setMode('alarm');
    }
  };

  const handleTransfer = async (ward) => {
    setSaving(true);
    try {
      await bedApi.transferWard(user.orgName, user.hospitalCode, bed.bedCode, { wardCode: ward.wardCode }, token);
      Alert.alert(t('common.done'), t('actions.bed_transferred', { code: bed.bedCode, ward: ward.wardName }), [
        { text: 'OK', onPress: handleClose },
      ]);
    } catch (e) { Alert.alert(t('common.error'), e.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const handleAlarmSave = async () => {
    const payload = {
      hrMin: Number(alarmForm.hrMin), hrMax: Number(alarmForm.hrMax),
      spo2Min: Number(alarmForm.spo2Min),
      sysBpMin: Number(alarmForm.sysBpMin), sysBpMax: Number(alarmForm.sysBpMax),
      diasBpMin: Number(alarmForm.diasBpMin), diasBpMax: Number(alarmForm.diasBpMax),
      tempMin: Number(alarmForm.tempMin), tempMax: Number(alarmForm.tempMax),
    };
    setSaving(true);
    try {
      await bedApi.updateAlarmConfig(user.orgName, user.hospitalCode, bed.bedCode, payload, token);
      Alert.alert(t('common.done'), t('actions.alarm_thresholds_saved'), [{ text: 'OK', onPress: handleClose }]);
    } catch (e) { Alert.alert(t('common.error'), e.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const filteredItems = items.filter(item => {
    const q = query.toLowerCase();
    return item.wardName?.toLowerCase().includes(q) || item.wardCode?.toLowerCase().includes(q);
  });

  const renderContent = () => {
    if (mode === 'main') {
      return (
        <>
          <View style={styles.bedInfo}>
            <View style={[styles.bedIconBox, { backgroundColor: T.accentSoft }]}>
              <IconBed size={20} color={T.accent} />
            </View>
            <View>
              <Text style={styles.bedCode}>{bed?.bedCode}</Text>
              <Text style={styles.bedMeta}>{wardCode} · {bed?.bedStatus}</Text>
            </View>
          </View>

          {ACTION_LIST.map((action) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.key}
                style={styles.actionItem}
                onPress={() => enterMode(action.key)}
                disabled={saving}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                  <Icon size={18} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <IconChevron size={16} color={T.textFaint} />
              </TouchableOpacity>
            );
          })}
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
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item.wardCode}
                  style={styles.listItem}
                  onPress={() => handleTransfer(item)}
                  disabled={saving}
                >
                  <View style={[styles.actionIcon, { backgroundColor: T.surface2 }]}>
                    <IconDoor size={16} color={T.textDim} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.listName}>{item.wardName}</Text>
                    <Text style={styles.listMeta}>{item.wardCode} · {item.wardType}</Text>
                  </View>
                  <IconChevron size={14} color={T.textFaint} />
                </TouchableOpacity>
              ))}
              {filteredItems.length === 0 && !loading && (
                <Text style={styles.emptyText}>{t('actions.no_results')}</Text>
              )}
            </ScrollView>
          )}
        </>
      );
    }

    if (mode === 'alarm') {
      const pairs = [
        { label: t('actions.heart_rate'), fields: [['hrMin', t('actions.min')], ['hrMax', t('actions.max')]] },
        { label: t('actions.spo2'), fields: [['spo2Min', t('actions.min')]] },
        { label: t('actions.systolic_bp'), fields: [['sysBpMin', t('actions.min')], ['sysBpMax', t('actions.max')]] },
        { label: t('actions.diastolic_bp'), fields: [['diasBpMin', t('actions.min')], ['diasBpMax', t('actions.max')]] },
        { label: t('actions.temperature'), fields: [['tempMin', t('actions.min')], ['tempMax', t('actions.max')]] },
      ];
      return (
        <>
          <View style={styles.subHeader}>
            <TouchableOpacity onPress={() => setMode('main')}>
              <Text style={styles.backLink}>← {t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={styles.subTitle}>{t('actions.alarm_thresholds')}</Text>
          </View>
          <ScrollView style={{ maxHeight: 300 }}>
            {pairs.map(({ label, fields }) => (
              <View key={label} style={styles.alarmRow}>
                <Text style={styles.alarmLabel}>{label}</Text>
                <View style={styles.alarmInputs}>
                  {fields.map(([key, ph]) => (
                    <View key={key} style={styles.alarmInputWrap}>
                      <Text style={styles.alarmInputLabel}>{ph}</Text>
                      <RNTextInput
                        style={[styles.alarmInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
                        value={alarmForm[key]}
                        onChangeText={v => setAlarmForm(prev => ({ ...prev, [key]: v }))}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.saveAlarmBtn, { backgroundColor: T.accent }]}
            onPress={handleAlarmSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.saveAlarmText}>{t('actions.save_thresholds')}</Text>
            }
          </TouchableOpacity>
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
          <Text style={styles.sheetTitle}>{t('actions.bed_actions')}</Text>
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
  bedInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  bedIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bedCode: { fontSize: 16, fontWeight: '700', color: T.text },
  bedMeta: { fontSize: 12, color: T.textDim, marginTop: 2 },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  actionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, fontSize: 15, color: T.text, fontWeight: '500' },
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backLink: { fontSize: 15, color: T.accent, fontWeight: '600' },
  subTitle: { fontSize: 16, fontWeight: '700', color: T.text },
  searchInput: { height: 42, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14, marginBottom: 16 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  listName: { fontSize: 14, fontWeight: '600', color: T.text },
  listMeta: { fontSize: 11, color: T.textDim, marginTop: 2 },
  emptyText: { color: T.textFaint, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  alarmRow: { marginBottom: 20 },
  alarmLabel: { fontSize: 13, fontWeight: '600', color: T.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  alarmInputs: { flexDirection: 'row', gap: 12 },
  alarmInputWrap: { flex: 1 },
  alarmInputLabel: { fontSize: 10, color: T.textFaint, marginBottom: 4, textTransform: 'uppercase' },
  alarmInput: { height: 40, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, fontSize: 14, fontWeight: '600' },
  saveAlarmBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  saveAlarmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});