import React, { useState, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Shared';
import { patientApi, assignmentApi } from '../services/api';

export const BulkAssignSheet = ({ doctorCode, doctorName, visible, onClose }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
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
      ? t('actions.assigned_count', { ok, fail })
      : (selected.size === 1 
          ? t('actions.assigned_msg', { count: ok, name: doctorName || doctorCode })
          : t('actions.assigned_msg_plural', { count: ok, name: doctorName || doctorCode }));

    Alert.alert(fail > 0 ? t('actions.partial_success') : t('actions.assigned_success'), msg);
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
          <Text style={styles.sheetTitle}>{t('actions.assign_patients')}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>{doctorName || doctorCode}</Text>

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
              <Text style={styles.emptyText}>{t('actions.no_patients')}</Text>
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
                  ? t('actions.assign_count_btn', { count: selected.size })
                  : t('actions.select_patients')}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const createStyles = (T) => StyleSheet.create({
...