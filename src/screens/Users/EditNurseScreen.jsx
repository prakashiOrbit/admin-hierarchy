import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconPhone, IconBuilding } from '../../icons';
import { nurseApi } from '../../services/api';

const NURSE_TYPES = ['REGISTERED', 'LICENSED', 'PRACTITIONER', 'SPECIALIST'];

export const EditNurseScreen = ({ nurse, onCancel, onSave }) => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [form, setForm] = useState({
    firstName: nurse.firstName || '',
    lastName: nurse.lastName || '',
    nurseSpeciality: Array.isArray(nurse.nurseSpeciality) ? nurse.nurseSpeciality.join(', ') : (nurse.nurseSpeciality || ''),
    nurseExperience: String(nurse.nurseExperience ?? ''),
    nurseType: nurse.nurseType || 'REGISTERED',
    gender: nurse.gender || 'FEMALE',
    email: nurse.myContact?.email || '',
    phone: nurse.myContact?.phone || '',
    city: nurse.myAddress?.city || '',
    state: nurse.myAddress?.state || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const isValid = form.firstName && form.lastName && form.email;

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      nurseSpeciality: form.nurseSpeciality.split(',').map(s => s.trim()).filter(Boolean),
      nurseExperience: parseInt(form.nurseExperience, 10) || 0,
      nurseType: form.nurseType,
      gender: form.gender,
      myContact: { email: form.email, phone: form.phone },
      myAddress: { city: form.city, state: form.state },
    };
    try {
      await nurseApi.update(user.orgName, user.hospitalCode, nurse.nurseCode, payload, token);
      Alert.alert('Saved', 'Nurse profile updated.', [{ text: 'OK', onPress: () => onSave?.() }]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update nurse.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconUser size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Editing <Text style={{ fontWeight: '700' }}>{nurse.nurseCode}</Text>. Staff code cannot be changed.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Staff Identity" />

          <Field label="Staff Code">
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{nurse.nurseCode}</Text>
              </View>
            </Card>
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="First Name" required>
                <TextInput value={form.firstName} onChangeText={v => set('firstName', v)} placeholder="Lena" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Last Name" required>
                <TextInput value={form.lastName} onChangeText={v => set('lastName', v)} placeholder="Kowalski" />
              </Field>
            </View>
          </View>

          <Field label="Speciality (comma-separated)">
            <TextInput
              value={form.nurseSpeciality}
              onChangeText={v => set('nurseSpeciality', v)}
              placeholder="ICU, Paediatrics"
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Experience (Years)">
                <TextInput
                  value={form.nurseExperience}
                  onChangeText={v => set('nurseExperience', v.replace(/[^0-9]/g, ''))}
                  placeholder="5"
                  keyboardType="numeric"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Gender">
                <View style={styles.row}>
                  {['MALE', 'FEMALE'].map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.radioBtn, { flex: 1 }, form.gender === g && styles.radioActive]}
                      onPress={() => set('gender', g)}
                    >
                      <Text style={[styles.radioText, form.gender === g && styles.radioTextActive]}>{g[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>
            </View>
          </View>

          <Field label="Nurse Type">
            <View style={styles.typeGrid}>
              {NURSE_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, form.nurseType === t && styles.typeBtnActive]}
                  onPress={() => set('nurseType', t)}
                >
                  <Text style={[styles.typeText, form.nurseType === t && styles.typeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Contact" />
          <Field label="Email" required>
            <TextInput
              value={form.email}
              onChangeText={v => set('email', v.toLowerCase())}
              placeholder="nurse@hospital.org"
              keyboardType="email-address"
              leading={<IconMail size={16} color={T.textFaint} />}
            />
          </Field>
          <Field label="Phone">
            <TextInput
              value={form.phone}
              onChangeText={v => set('phone', v)}
              placeholder="+91 00000 00000"
              keyboardType="phone-pad"
              leading={<IconPhone size={16} color={T.textFaint} />}
            />
          </Field>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="ghost" style={{ flex: 1 }} onPress={onCancel} disabled={saving}>Cancel</Btn>
          <Btn style={{ flex: 1.5 }} onPress={handleSave} disabled={!isValid || saving}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : 'Save Changes'}
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  banner: {
    flexDirection: 'row', backgroundColor: T.accentSoft, padding: 14,
    borderRadius: 12, gap: 12, alignItems: 'flex-start', marginBottom: 24,
  },
  bannerText: { flex: 1, fontSize: 13, color: T.text, lineHeight: 18 },
  section: { marginBottom: 24 },
  row: { flexDirection: 'row', gap: 12 },
  readOnlyCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface2, borderColor: T.borderSoft },
  readOnlyText: { color: T.textDim, fontSize: 14, fontFamily: 'monospace' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: T.borderSoft, backgroundColor: T.surface,
  },
  typeBtnActive: { backgroundColor: T.accent, borderColor: T.accent },
  typeText: { fontSize: 12, color: T.text, fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  radioBtn: {
    height: 42, borderRadius: 10, borderWidth: 1, borderColor: T.borderSoft,
    alignItems: 'center', justifyContent: 'center', backgroundColor: T.surface,
  },
  radioActive: { backgroundColor: T.accent, borderColor: T.accent },
  radioText: { fontSize: 13, fontWeight: '600', color: T.textDim },
  radioTextActive: { color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
