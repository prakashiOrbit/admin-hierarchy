import React, { useState, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { wardApi, bedApi, patientApi, nurseApi } from '../services/api';
import { IconDoor, IconBed, IconUser, IconChevron } from '../icons';

export const NurseActionsSheet = ({ nurse, visible, onClose }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [mode, setMode] = useState('main');
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);
  const [query, setQuery] = useState('');

  const loadWards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await wardApi.listAll(user.orgName, user.hospitalCode, token);
      setWards(Array.isArray(data) ? data : []);
    } catch { setWards([]); }
    finally { setLoading(false); }
  }, [user?.orgName, user?.hospitalCode, token]);

  const loadBeds = useCallback(async (wardCode) => {
    setLoading(true);
    try {
      const data = await bedApi.getAllBedsByWard(user.orgName, user.hospitalCode, wardCode, token);
      setBeds(Array.isArray(data) ? data : []);
    } catch { setBeds([]); }
    finally { setLoading(false); }
  }, [user?.orgName, user?.hospitalCode, token]);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientApi.listAll(user.orgName, user.hospitalCode, token);
      setPatients(Array.isArray(data) ? data : []);
    } catch { setPatients([]); }
    finally { setLoading(false); }
  }, [user?.orgName, user?.hospitalCode, token]);

  const handleClose = () => {
    setMode('main');
    setQuery('');
    setSelectedWard(null);
    onClose();
  };

  const goToWard = () => { setQuery(''); setMode('ward'); loadWards(); };

  const goToBed = (ward) => {
    setSelectedWard(ward);
    setQuery('');
    setMode('bed');
    loadBeds(ward.wardCode);
  };

  const goToAdmitPatient = () => { setQuery(''); setMode('admitPatient'); loadPatients(); };

  const handleAssignBed = async (bed) => {
    setSaving(bed.bedCode);
    try {
      await nurseApi.assignBed(user.orgName, user.hospitalCode, nurse.nurseCode, { bedCode: bed.bedCode }, token);
      Alert.alert(t('actions.assigned'), t('actions.nurse_bed_assigned', { bed: bed.bedCode, name: `${nurse.firstName} ${nurse.lastName}` }));
      handleClose();
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to assign bed.');
    } finally { setSaving(null); }
  };

  const handleAdmitPatient = async (patient) => {
    setSaving(patient.patientCode);
    try {
      await nurseApi.admitPatient(user.orgName, user.hospitalCode, nurse.nurseCode, { patientCode: patient.patientCode }, token);
      Alert.alert(t('actions.admitted'), t('actions.nurse_patient_admitted', { patient: `${patient.firstName} ${patient.lastName}`, nurse: `${nurse.firstName} ${nurse.lastName}` }));
      handleClose();
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to admit patient.');
    } finally { setSaving(null); }
  };

  const filteredWards = wards.filter(w =>
    w.wardCode?.toLowerCase().includes(query.toLowerCase()) ||
    w.wardName?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredBeds = beds.filter(b =>
    b.bedCode?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
    p.patientCode?.toLowerCase().includes(query.toLowerCase())
  );

  const renderMain = () => (
    <>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>{t('actions.nurse_actions')}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>{t('common.done')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>{nurse?.firstName} {nurse?.lastName}</Text>

      <TouchableOpacity style={styles.actionItem} onPress={goToWard}>
        <View style={[styles.actionIcon, { backgroundColor: T.accentSoft }]}>
          <IconBed size={18} color={T.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>{t('actions.assign_to_bed')}</Text>
          <Text style={styles.actionSubtitle}>{t('actions.pick_ward_bed')}</Text>
        </View>
        <IconChevron size={16} color={T.textFaint} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem} onPress={goToAdmitPatient}>
        <View style={[styles.actionIcon, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
          <IconUser size={18} color="#10b981" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>{t('actions.admit_patient')}</Text>
          <Text style={styles.actionSubtitle}>{t('actions.register_caregiver')}</Text>
        </View>
        <IconChevron size={16} color={T.textFaint} />
      </TouchableOpacity>
    </>
  );

  const renderWard = () => (
    <>
      <View style={styles.sheetHeader}>
        <TouchableOpacity onPress={() => { setMode('main'); setQuery(''); }}>
          <Text style={styles.backText}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.sheetTitle}>{t('actions.select_ward')}</Text>
        <View style={{ width: 50 }} />
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
        <ScrollView style={{ maxHeight: 320 }}>
          {filteredWards.map(w => (
            <TouchableOpacity key={w.wardCode} style={styles.listItem} onPress={() => goToBed(w)}>
              <View style={[styles.listIcon, { backgroundColor: T.surface2 }]}>
                <IconDoor size={16} color={T.textDim} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.listName}>{w.wardName || w.wardCode}</Text>
                <Text style={styles.listMeta}>{w.wardCode}</Text>
              </View>
              <IconChevron size={14} color={T.textFaint} />
            </TouchableOpacity>
          ))}
          {filteredWards.length === 0 && <Text style={styles.emptyText}>{t('actions.no_wards')}</Text>}
        </ScrollView>
      )}
    </>
  );

  const renderBed = () => (
    <>
      <View style={styles.sheetHeader}>
        <TouchableOpacity onPress={() => { setMode('ward'); setQuery(''); }}>
          <Text style={styles.backText}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.sheetTitle}>{t('actions.ward_beds', { code: selectedWard?.wardCode })}</Text>
        <View style={{ width: 50 }} />
      </View>
      <RNTextInput
        style={[styles.searchInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
        placeholder={t('actions.search_beds')}
        placeholderTextColor={T.textFaint}
        value={query}
        onChangeText={setQuery}
      />
      {loading ? (
        <ActivityIndicator color={T.accent} style={{ marginVertical: 24 }} />
      ) : (
        <ScrollView style={{ maxHeight: 320 }}>
          {filteredBeds.map(b => (
            <TouchableOpacity
              key={b.bedCode}
              style={styles.listItem}
              onPress={() => handleAssignBed(b)}
              disabled={!!saving}
            >
              {saving === b.bedCode
                ? <ActivityIndicator size="small" color={T.accent} style={{ width: 40, height: 40 }} />
                : <View style={[styles.listIcon, { backgroundColor: T.surface2 }]}>
                    <IconBed size={16} color={T.textDim} />
                  </View>
              }
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.listName}>{b.bedCode}</Text>
                <Text style={styles.listMeta}>{b.status || '—'}</Text>
              </View>
              <IconChevron size={14} color={T.textFaint} />
            </TouchableOpacity>
          ))}
          {filteredBeds.length === 0 && <Text style={styles.emptyText}>{t('actions.no_beds')}</Text>}
        </ScrollView>
      )}
    </>
  );

  const renderAdmitPatient = () => (
    <>
      <View style={styles.sheetHeader}>
        <TouchableOpacity onPress={() => { setMode('main'); setQuery(''); }}>
          <Text style={styles.backText}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.sheetTitle}>{t('actions.admit_patient')}</Text>
        <View style={{ width: 50 }} />
      </View>
      <RNTextInput
        style={[styles.searchInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
        placeholder={t('actions.search_patients')}
        placeholderTextColor={T.textFaint}
        value={query}
        onChangeText={setQuery}
      />
      {loading ? (
        <ActivityIndicator color={T.accent} style={{ marginVertical: 24 }} />
      ) : (
        <ScrollView style={{ maxHeight: 320 }}>
          {filteredPatients.map(p => (
            <TouchableOpacity
              key={p.patientCode}
              style={styles.listItem}
              onPress={() => handleAdmitPatient(p)}
              disabled={!!saving}
            >
              {saving === p.patientCode
                ? <ActivityIndicator size="small" color={T.accent} style={{ width: 40, height: 40 }} />
                : <View style={[styles.listIcon, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                    <IconUser size={16} color="#10b981" />
                  </View>
              }
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.listName}>{p.firstName} {p.lastName}</Text>
                <Text style={styles.listMeta}>{p.patientCode}</Text>
              </View>
              <IconChevron size={14} color={T.textFaint} />
            </TouchableOpacity>
          ))}
          {filteredPatients.length === 0 && <Text style={styles.emptyText}>{t('actions.no_patients')}</Text>}
        </ScrollView>
      )}
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handle} />
        {mode === 'main' && renderMain()}
        {mode === 'ward' && renderWard()}
        {mode === 'bed' && renderBed()}
        {mode === 'admitPatient' && renderAdmitPatient()}
      </View>
    </Modal>
  );
};

const createStyles = (T) => StyleSheet.create({
...