import React, { useState, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Shared';
import { patientApi, assignmentApi } from '../services/api';

export const BulkAssignSheet = ({ doctorCode, doctorName, visible, onClose }) => {
  const { theme: T } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState('');

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const data = await patientApi.listAll(user.orgName, user.hospitalCode, token);
      setPatients(Array.isArray(data) ? data : []);
    } catch { setPatients([]); }
    finally { setLoading(false); }
  }, [user?.orgName, user?.hospitalCode, token]);

  const toggle = (code) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const handleAssign = async () => {
    if (!selected.size) return;
    setAssigning(true);
    let ok = 0, fail = 0;
    for (const patientCode of selected) {
      try {
        await assignmentApi.assign(user.orgName, user.hospitalCode, { doctorCode, patientCode }, token);
        ok++;
      } catch { fail++; }
    }
    setAssigning(false);
    const msg = fail > 0
      ? `${ok} assigned, ${fail} failed.`
      : `${ok} patient${ok !== 1 ? 's' : ''} assigned to ${doctorName || doctorCode}.`;
    Alert.alert(fail > 0 ? 'Partial Success' : 'Assigned', msg);
    onClose();
  };

  const filtered = patients.filter(p => {
    const q = query.toLowerCase();
    return `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.patientCode?.toLowerCase().includes(q);
  });

  const handleClose = () => { setQuery(''); setSelected(new Set()); onClose(); };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
      onShow={loadPatients}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Assign Patients</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>{doctorName || doctorCode}</Text>

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
          <ScrollView style={{ maxHeight: 300 }}>
            {filtered.map(p => {
              const code = p.patientCode;
              const isSelected = selected.has(code);
              const initials = `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();
              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.personItem, isSelected && { backgroundColor: T.accentSoft }]}
                  onPress={() => toggle(code)}
                >
                  <Avatar initials={initials} size={36} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.personName}>{p.firstName} {p.lastName}</Text>
                    <Text style={styles.personMeta}>{code}</Text>
                  </View>
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
            {filtered.length === 0 && !loading && (
              <Text style={styles.emptyText}>No patients found.</Text>
            )}
          </ScrollView>
        )}

        <TouchableOpacity
          style={[styles.assignBtn, (!selected.size || assigning) && styles.assignBtnDisabled]}
          onPress={handleAssign}
          disabled={!selected.size || assigning}
        >
          {assigning
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.assignBtnText}>
                {selected.size > 0
                  ? `Assign (${selected.size}) Patient${selected.size !== 1 ? 's' : ''}`
                  : 'Select Patients'}
              </Text>
          }
        </TouchableOpacity>
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
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: T.text },
  closeBtn: { paddingHorizontal: 4 },
  closeBtnText: { fontSize: 15, color: T.accent, fontWeight: '600' },
  subtitle: { fontSize: 12, color: T.textDim, marginBottom: 12, fontFamily: 'monospace' },
  searchInput: { height: 40, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14, marginBottom: 10 },
  personItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: T.borderSoft, borderRadius: 8,
  },
  personName: { fontSize: 14, fontWeight: '600', color: T.text },
  personMeta: { fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: 'monospace' },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: T.borderSoft, alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: T.accent, borderColor: T.accent },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyText: { color: T.textFaint, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  assignBtn: {
    marginTop: 14, backgroundColor: T.accent, borderRadius: 12,
    height: 48, alignItems: 'center', justifyContent: 'center',
  },
  assignBtnDisabled: { opacity: 0.4 },
  assignBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
