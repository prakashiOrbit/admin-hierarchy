import React, { useState, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { wardApi, bedApi, patientApi, nurseApi } from '../services/api';
import { IconDoor, IconBed, IconUser, IconChevron } from '../icons';

export const NurseActionsSheet = ({ nurse, visible, onClose }) => {
  const { theme: T } = useTheme();
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
      Alert.alert('Assigned', `Bed ${bed.bedCode} assigned to ${nurse.firstName} ${nurse.lastName}.`);
      handleClose();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to assign bed.');
    } finally { setSaving(null); }
  };

  const handleAdmitPatient = async (patient) => {
    setSaving(patient.patientCode);
    try {
      await nurseApi.admitPatient(user.orgName, user.hospitalCode, nurse.nurseCode, { patientCode: patient.patientCode }, token);
      Alert.alert('Admitted', `${patient.firstName} ${patient.lastName} admitted by ${nurse.firstName} ${nurse.lastName}.`);
      handleClose();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to admit patient.');
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
        <Text style={styles.sheetTitle}>Nurse Actions</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>{nurse?.firstName} {nurse?.lastName}</Text>

      <TouchableOpacity style={styles.actionItem} onPress={goToWard}>
        <View style={[styles.actionIcon, { backgroundColor: T.accentSoft }]}>
          <IconBed size={18} color={T.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>Assign to Bed</Text>
          <Text style={styles.actionSubtitle}>Pick a ward, then select a bed</Text>
        </View>
        <IconChevron size={16} color={T.textFaint} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem} onPress={goToAdmitPatient}>
        <View style={[styles.actionIcon, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
          <IconUser size={18} color="#10b981" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>Admit Patient</Text>
          <Text style={styles.actionSubtitle}>Register nurse as admitting caregiver</Text>
        </View>
        <IconChevron size={16} color={T.textFaint} />
      </TouchableOpacity>
    </>
  );

  const renderWard = () => (
    <>
      <View style={styles.sheetHeader}>
        <TouchableOpacity onPress={() => { setMode('main'); setQuery(''); }}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.sheetTitle}>Select Ward</Text>
        <View style={{ width: 50 }} />
      </View>
      <RNTextInput
        style={[styles.searchInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
        placeholder="Search wards..."
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
          {filteredWards.length === 0 && <Text style={styles.emptyText}>No wards found.</Text>}
        </ScrollView>
      )}
    </>
  );

  const renderBed = () => (
    <>
      <View style={styles.sheetHeader}>
        <TouchableOpacity onPress={() => { setMode('ward'); setQuery(''); }}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.sheetTitle}>{selectedWard?.wardCode} Beds</Text>
        <View style={{ width: 50 }} />
      </View>
      <RNTextInput
        style={[styles.searchInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
        placeholder="Search beds..."
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
          {filteredBeds.length === 0 && <Text style={styles.emptyText}>No beds found.</Text>}
        </ScrollView>
      )}
    </>
  );

  const renderAdmitPatient = () => (
    <>
      <View style={styles.sheetHeader}>
        <TouchableOpacity onPress={() => { setMode('main'); setQuery(''); }}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.sheetTitle}>Admit Patient</Text>
        <View style={{ width: 50 }} />
      </View>
      <RNTextInput
        style={[styles.searchInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
        placeholder="Search patients..."
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
          {filteredPatients.length === 0 && <Text style={styles.emptyText}>No patients found.</Text>}
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
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: T.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12, paddingHorizontal: 20,
    borderTopWidth: 1, borderColor: T.borderSoft,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: T.border, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: T.text },
  closeBtn: { paddingHorizontal: 4 },
  closeBtnText: { fontSize: 15, color: T.accent, fontWeight: '600' },
  backText: { fontSize: 15, color: T.accent, fontWeight: '600', minWidth: 50 },
  subtitle: { fontSize: 12, color: T.textDim, marginBottom: 16, fontFamily: 'monospace' },
  searchInput: { height: 40, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14, marginBottom: 10 },
  actionItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
    borderRadius: 12, borderWidth: 1, borderColor: T.borderSoft,
    backgroundColor: T.surface, marginBottom: 10,
  },
  actionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 15, fontWeight: '600', color: T.text },
  actionSubtitle: { fontSize: 12, color: T.textDim, marginTop: 2 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  listIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  listName: { fontSize: 14, fontWeight: '600', color: T.text },
  listMeta: { fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: 'monospace' },
  emptyText: { color: T.textFaint, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
});
