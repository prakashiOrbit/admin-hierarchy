import React, { useState, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { shiftApi } from '../services/api';
import { IconClock, IconChevron, IconCheck } from '../icons';

export const StaffShiftSheet = ({ staffCode, staffType, staffName, visible, onClose }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);
  const [query, setQuery] = useState('');

  const loadShifts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await shiftApi.listAll(user.orgName, user.hospitalCode, token);
      setShifts(Array.isArray(data) ? data : []);
    } catch { setShifts([]); }
    finally { setLoading(false); }
  }, [user?.orgName, user?.hospitalCode, token]);

  const handleShow = () => { loadShifts(); };

  const handleAssign = async (shift) => {
    setSaving(shift.shiftCode);
    const payload = staffType === 'doctor'
      ? { doctorCode: staffCode, shiftCode: shift.shiftCode }
      : { nurseCode: staffCode, shiftCode: shift.shiftCode };
    try {
      if (staffType === 'doctor') {
        await shiftApi.assignDoctor(user.orgName, user.hospitalCode, payload, token);
      } else {
        await shiftApi.assignNurse(user.orgName, user.hospitalCode, payload, token);
      }
      Alert.alert(t('common.success'), t('shifts.staff_assigned_msg', { name: staffName, shift: shift.shiftName || shift.shiftCode }));
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('shifts.assignment_failed'));
    } finally {
      setSaving(null);
    }
  };

  const filtered = shifts.filter(s =>
    s.shiftName?.toLowerCase().includes(query.toLowerCase()) ||
    s.shiftCode?.toLowerCase().includes(query.toLowerCase()) ||
    s.wardCode?.toLowerCase().includes(query.toLowerCase())
  );

  const formatTime = (dt) => {
    if (!dt) return '—';
    try { return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return dt; }
  };

  const handleClose = () => { setQuery(''); onClose(); };

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
          <Text style={styles.sheetTitle}>{t('shifts.assign_to_shift')}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>{t('common.done')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>{staffName} · {staffCode}</Text>

        <RNTextInput
          style={[styles.searchInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
          placeholder={t('shifts.search_shifts')}
          placeholderTextColor={T.textFaint}
          value={query}
          onChangeText={setQuery}
        />

        {loading ? (
          <ActivityIndicator color={T.accent} style={{ marginVertical: 24 }} />
        ) : (
          <ScrollView style={{ maxHeight: 320 }}>
            {filtered.map(s => (
              <TouchableOpacity
                key={s.shiftCode}
                style={styles.shiftItem}
                onPress={() => handleAssign(s)}
                disabled={!!saving}
              >
                <View style={[styles.iconBox, { backgroundColor: T.accentSoft }]}>
                  {saving === s.shiftCode
                    ? <ActivityIndicator size="small" color={T.accent} />
                    : <IconClock size={16} color={T.accent} />
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shiftName}>{s.shiftName || s.shiftCode}</Text>
                  <Text style={styles.shiftMeta}>
                    {s.wardCode} · {formatTime(s.startTime)} – {formatTime(s.endTime)}
                  </Text>
                </View>
                <IconChevron size={14} color={T.textFaint} />
              </TouchableOpacity>
            ))}
            {filtered.length === 0 && !loading && (
              <Text style={styles.emptyText}>{t('shifts.no_shifts')}</Text>
            )}
          </ScrollView>
        )}
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
  shiftItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  shiftName: { fontSize: 14, fontWeight: '600', color: T.text },
  shiftMeta: { fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: 'monospace' },
  emptyText: { color: T.textFaint, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
});
