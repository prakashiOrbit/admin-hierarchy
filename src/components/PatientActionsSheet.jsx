import React, { useState, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { patientApi, wardApi } from '../services/api';
import { IconPatient, IconDoor, IconCheck, IconChevron } from '../icons';

export const PatientActionsSheet = ({ patient, visible, onClose }) => {
  const { theme: T } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [mode, setMode] = useState('main');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wards, setWards] = useState([]);
  const [query, setQuery] = useState('');

  const reset = useCallback(() => {
    setMode('main');
    setWards([]);
    setQuery('');
    setSaving(false);
  }, []);

  const handleClose = () => { reset(); onClose(); };

  const handleDischarge = () => {
    Alert.alert(
      'Discharge Patient',
      `Discharge ${patient?.firstName} ${patient?.lastName} (${patient?.patientCode})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discharge', style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await patientApi.discharge(user.orgName, user.hospitalCode, patient.patientCode, token);
              Alert.alert('Done', 'Patient discharged.', [{ text: 'OK', onPress: handleClose }]);
            } catch (e) { Alert.alert('Error', e.message || 'Failed.'); }
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
      const data = await wardApi.listAll(user.orgName, user.hospitalCode, token);
      setWards(Array.isArray(data) ? data : []);
    } catch { setWards([]); }
    finally { setLoading(false); }
  };

  const handleTransfer = async (ward) => {
    setSaving(true);
    try {
      await patientApi.transfer(user.orgName, user.hospitalCode, patient.patientCode, { targetWardCode: ward.wardCode }, token);
      Alert.alert('Done', `${patient.firstName} ${patient.lastName} transferred to ${ward.wardName}.`, [
        { text: 'OK', onPress: handleClose },
      ]);
    } catch (e) { Alert.alert('Error', e.message || 'Failed.'); }
    finally { setSaving(false); }
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
            <Text style={styles.actionLabel}>Discharge Patient</Text>
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
            <Text style={styles.actionLabel}>Transfer to Ward</Text>
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
              <Text style={styles.backLink}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.subTitle}>Select Ward</Text>
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
                <Text style={styles.emptyText}>No wards found.</Text>
              )}
            </ScrollView>
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
          <Text style={styles.sheetTitle}>Patient Actions</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Done</Text>
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
});
