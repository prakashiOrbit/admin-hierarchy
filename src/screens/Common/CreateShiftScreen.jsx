import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconClock, IconDoor, IconStethoscope } from '../../icons';
import { NURSES, WARDS } from '../../data/mock';

export const CreateShiftScreen = ({ onCancel }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [form, setForm] = useState({
    shiftType: 'DAY',
    wardCode: 'ICU-3W',
    nurseId: '',
    startTime: '08:00',
    endTime: '16:00'
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = form.nurseId && form.wardCode;

  const handleCreate = () => {
    console.log('Create Shift Payload:', JSON.stringify(form, null, 2));
    // Simulation for backend API call
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <IconClock size={20} color={T.accent} />
          <Text style={styles.bannerText}>
            Assigning a new clinical shift. Ensure the nurse is not already assigned to an overlapping shift in another ward.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Shift Parameters" />
          <Field label="Type of Shift">
            <View style={styles.row}>
              {['DAY', 'EVENING', 'NIGHT'].map(type => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.radioBtn, form.shiftType === type && styles.radioActive]}
                  onPress={() => updateForm('shiftType', type)}
                >
                  <Text style={[styles.radioText, form.shiftType === type && styles.radioTextActive]}>
                  {type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Start Time">
                <TextInput 
                  value={form.startTime}
                  onChangeText={v => updateForm('startTime', v)}
                  placeholder="08:00"
                  leading={<IconClock size={16} color={T.textDim} />}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="End Time">
                <TextInput 
                  value={form.endTime}
                  onChangeText={v => updateForm('endTime', v)}
                  placeholder="16:00"
                  leading={<IconClock size={16} color={T.textDim} />}
                />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Assignment" />
          <Field label="Select Ward">
            <View style={styles.pickerGrid}>
              {WARDS.map(w => (
                <TouchableOpacity 
                  key={w.code}
                  style={[styles.pickerItem, form.wardCode === w.code && styles.pickerActive]}
                  onPress={() => updateForm('wardCode', w.code)}
                >
                  <IconDoor size={14} color={form.wardCode === w.code ? '#fff' : T.textDim} />
                  <Text style={[styles.pickerText, form.wardCode === w.code && styles.pickerTextActive]}>
                  {w.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Select Nurse">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nurseScroll}>
              {NURSES.map(n => (
                <TouchableOpacity 
                  key={n.id}
                  style={[styles.nurseCard, form.nurseId === n.id && styles.nurseActive]}
                  onPress={() => updateForm('nurseId', n.id)}
                >
                  <View style={[styles.avatar, { backgroundColor: form.nurseId === n.id ? 'rgba(255,255,255,0.2)' : T.accentSoft }]}>
                    <Text style={[styles.avatarText, { color: form.nurseId === n.id ? '#fff' : T.accent }]}>
                    {n.initials}</Text>
                  </View>
                  <Text style={[styles.nurseName, form.nurseId === n.id && styles.nurseNameActive]}>
                  {n.firstName}</Text>
                  <Text style={[styles.nurseSpec, form.nurseId === n.id && styles.nurseSpecActive]}>
                  {n.speciality}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Field>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="soft" style={{ flex: 1 }} onPress={onCancel}>
            Cancel
          </Btn>
          <Btn 
            style={{ flex: 1 }} 
            onPress={handleCreate}
            disabled={!isFormValid}
          >
            Assign Shift
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  banner: { flexDirection: 'row', backgroundColor: T.accentSoft, padding: 14, borderRadius: 12, gap: 12, alignItems: 'flex-start', marginBottom: 24 },
  bannerText: { flex: 1, fontSize: 13, color: T.text, lineHeight: 18 },
  section: { marginBottom: 24 },
  row: { flexDirection: 'row', gap: 10 },
  radioBtn: { flex: 1, height: 42, borderRadius: 10, borderWidth: 1, borderColor: T.borderSoft, alignItems: 'center', justifyContent: 'center', backgroundColor: T.surface },
  radioActive: { backgroundColor: T.accent, borderColor: T.accent },
  radioText: { fontSize: 12, fontWeight: '700', color: T.textDim },
  radioTextActive: { color: '#fff' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: T.borderSoft, backgroundColor: T.surface },
  pickerActive: { backgroundColor: T.accent, borderColor: T.accent },
  pickerText: { fontSize: 12, color: T.text, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  pickerTextActive: { color: '#fff' },
  nurseScroll: { flexDirection: 'row' },
  nurseCard: { width: 100, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.borderSoft, backgroundColor: T.surface, marginRight: 10, alignItems: 'center' },
  nurseActive: { backgroundColor: T.accent, borderColor: T.accent },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { fontSize: 14, fontWeight: '700' },
  nurseName: { fontSize: 12, fontWeight: '600', color: T.text, textAlign: 'center' },
  nurseNameActive: { color: '#fff' },
  nurseSpec: { fontSize: 10, color: T.textDim, marginTop: 2 },
  nurseSpecActive: { color: 'rgba(255,255,255,0.8)' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
