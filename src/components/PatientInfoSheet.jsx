import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { patientApi } from '../services/api';
import { IconPlus, IconChevron } from '../icons';

const INFO_TYPES = ['VITAL_SIGNS', 'ALLERGIES', 'MEDICATIONS', 'LAB_RESULTS', 'CHRONIC_CONDITIONS'];

const FIELDS_BY_TYPE = {
  VITAL_SIGNS: ['bloodGroup', 'weight', 'height', 'bloodPressure', 'heartRate', 'temperature'],
  ALLERGIES: ['allergen', 'reaction', 'severity'],
  MEDICATIONS: ['medicationName', 'dosage', 'frequency', 'startDate'],
  LAB_RESULTS: ['testName', 'result', 'unit', 'referenceRange', 'date'],
  CHRONIC_CONDITIONS: ['condition', 'diagnosedDate', 'managedBy'],
};

export const PatientInfoSheet = ({ patientCode, existingInfos, visible, onClose, onAdded }) => {
  const { theme: T } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [mode, setMode] = useState('list');
  const [selectedType, setSelectedType] = useState(null);
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setMode('list');
    setSelectedType(null);
    setFields({});
    onClose();
  };

  const startAdd = (type) => {
    setSelectedType(type);
    setFields({});
    setMode('add');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await patientApi.addInfo(
        user.orgName, user.hospitalCode, patientCode,
        { infoType: selectedType, infoData: JSON.stringify(fields) },
        token
      );
      Alert.alert('Saved', 'Health record added.', [{ text: 'OK', onPress: () => { onAdded?.(); handleClose(); } }]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const parseInfo = (info) => {
    try {
      return typeof info.infoData === 'string' ? JSON.parse(info.infoData) : (info.infoData || {});
    } catch { return {}; }
  };

  const renderList = () => (
    <>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Health Records</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>{patientCode}</Text>

      <ScrollView style={{ maxHeight: 380 }}>
        {existingInfos && existingInfos.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>EXISTING RECORDS</Text>
            {existingInfos.map((info, i) => {
              const data = parseInfo(info);
              const entries = Object.entries(data);
              return (
                <View key={i} style={styles.infoCard}>
                  <Text style={styles.infoType}>{info.infoType?.replace(/_/g, ' ')}</Text>
                  {entries.slice(0, 3).map(([k, v]) => (
                    <Text key={k} style={styles.infoRow}>
                      <Text style={styles.infoKey}>{k}: </Text>{String(v)}
                    </Text>
                  ))}
                  {entries.length > 3 && (
                    <Text style={styles.infoMore}>+{entries.length - 3} more fields</Text>
                  )}
                </View>
              );
            })}
          </>
        )}

        <Text style={styles.sectionLabel}>ADD RECORD</Text>
        {INFO_TYPES.map(type => (
          <TouchableOpacity key={type} style={styles.typeItem} onPress={() => startAdd(type)}>
            <View style={[styles.typeIcon, { backgroundColor: T.accentSoft }]}>
              <IconPlus size={14} color={T.accent} />
            </View>
            <Text style={styles.typeName}>{type.replace(/_/g, ' ')}</Text>
            <IconChevron size={14} color={T.textFaint} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  const renderAdd = () => {
    const fieldList = FIELDS_BY_TYPE[selectedType] || [];
    return (
      <>
        <View style={styles.sheetHeader}>
          <TouchableOpacity onPress={() => setMode('list')}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>{selectedType?.replace(/_/g, ' ')}</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={{ maxHeight: 320 }} keyboardShouldPersistTaps="handled">
          {fieldList.map(field => (
            <View key={field} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{field}</Text>
              <RNTextInput
                style={[styles.fieldInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
                placeholder={field}
                placeholderTextColor={T.textFaint}
                value={fields[field] || ''}
                onChangeText={v => setFields(prev => ({ ...prev, [field]: v }))}
              />
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.saveBtnText}>Save Record</Text>
          }
        </TouchableOpacity>
      </>
    );
  };

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
        {mode === 'list' ? renderList() : renderAdd()}
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
  backText: { fontSize: 15, color: T.accent, fontWeight: '600', minWidth: 50 },
  subtitle: { fontSize: 12, color: T.textDim, marginBottom: 12, fontFamily: 'monospace' },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: T.textFaint, letterSpacing: 0.8, marginTop: 12, marginBottom: 8 },
  infoCard: {
    backgroundColor: T.surface, borderRadius: 10, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: T.borderSoft,
  },
  infoType: { fontSize: 11, fontWeight: '700', color: T.accent, marginBottom: 6, letterSpacing: 0.5 },
  infoRow: { fontSize: 12, color: T.text, marginBottom: 2, lineHeight: 16 },
  infoKey: { color: T.textDim, fontWeight: '600' },
  infoMore: { fontSize: 11, color: T.textFaint, marginTop: 4 },
  typeItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.borderSoft,
  },
  typeIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  typeName: { flex: 1, fontSize: 14, fontWeight: '600', color: T.text },
  fieldRow: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: T.textDim,
    letterSpacing: 0.5, marginBottom: 4, textTransform: 'capitalize',
  },
  fieldInput: { height: 40, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14 },
  saveBtn: {
    marginTop: 14, backgroundColor: T.accent, borderRadius: 12,
    height: 48, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
