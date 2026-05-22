import React, { useState, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Shared';
import { shiftApi, nurseApi, doctorApi } from '../services/api';
import { IconUser, IconStethoscope, IconChevron } from '../icons';

export const ShiftStaffSheet = ({ shiftCode, shiftName, staffType, visible, onClose, onAssigned }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);
  const [query, setQuery] = useState('');

  const isDoctor = staffType === 'doctor';

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const data = isDoctor
        ? await doctorApi.listAll(user.orgName, user.hospitalCode, token)
        : await nurseApi.listAll(user.orgName, user.hospitalCode, token);
      setStaff(Array.isArray(data) ? data : []);
    } catch { setStaff([]); }
    finally { setLoading(false); }
  }, [user?.orgName, user?.hospitalCode, token, isDoctor]);

  const handleAssign = async (person) => {
    const code = isDoctor ? person.doctorCode : person.nurseCode;
    setSaving(code);
    const payload = isDoctor
      ? { doctorCode: code, shiftCode }
      : { nurseCode: code, shiftCode };
    try {
      if (isDoctor) {
        await shiftApi.assignDoctor(user.orgName, user.hospitalCode, payload, token);
      } else {
        await shiftApi.assignNurse(user.orgName, user.hospitalCode, payload, token);
      }
      Alert.alert(t('common.success'), t('shifts.staff_assigned', { name: `${person.firstName} ${person.lastName}`, shift: shiftName || shiftCode }));
      onAssigned?.();
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('shifts.assignment_failed'));
    } finally {
      setSaving(null);
    }
  };

  const filtered = staff.filter(p => {
    const q = query.toLowerCase();
    const code = isDoctor ? p.doctorCode : p.nurseCode;
    return `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || code?.toLowerCase().includes(q);
  });

  const handleClose = () => { setQuery(''); onClose(); };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
      onShow={loadStaff}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {isDoctor ? t('shifts.add_doctor') : t('shifts.add_nurse')}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>{t('common.done')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>{shiftName || shiftCode}</Text>

        <RNTextInput
          style={[styles.searchInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
          placeholder={isDoctor ? t('shifts.search_doctors') : t('shifts.search_nurses')}
          placeholderTextColor={T.textFaint}
          value={query}
          onChangeText={setQuery}
        />

        {loading ? (
          <ActivityIndicator color={T.accent} style={{ marginVertical: 24 }} />
        ) : (
          <ScrollView style={{ maxHeight: 320 }}>
            {filtered.map(p => {
              const code = isDoctor ? p.doctorCode : p.nurseCode;
              const initials = `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();
              return (
                <TouchableOpacity
                  key={code}
                  style={styles.personItem}
                  onPress={() => handleAssign(p)}
                  disabled={!!saving}
                >
                  {saving === code
                    ? <ActivityIndicator size="small" color={T.accent} style={{ width: 36 }} />
                    : <Avatar initials={initials} size={36} />
                  }
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.personName}>
                      {isDoctor ? t('common.dr_prefix') : ''}{p.firstName} {p.lastName}
                    </Text>
                    <Text style={styles.personMeta}>{code}</Text>
                  </View>
                  <IconChevron size={14} color={T.textFaint} />
                </TouchableOpacity>
              );
            })}
            {filtered.length === 0 && !loading && (
              <Text style={styles.emptyText}>{isDoctor ? t('shifts.no_doctors') : t('shifts.no_nurses')}</Text>
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
  personItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  personName: { fontSize: 14, fontWeight: '600', color: T.text },
  personMeta: { fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: 'monospace' },
  emptyText: { color: T.textFaint, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
});
