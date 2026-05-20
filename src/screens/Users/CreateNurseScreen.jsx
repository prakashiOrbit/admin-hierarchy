import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconPhone } from '../../icons';
import { nurseApi } from '../../services/api';

export const CreateNurseScreen = ({ onCancel, onSuccess }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    nurseCode: '',
    firstName: '',
    lastName: '',
    nurseSpeciality: '',
    nurseExperience: '',
    nurseType: 'REGISTERED',
    gender: 'FEMALE',
    myContact: { email: '', phone: '' },
    myAddress: { city: '', state: '' },
  });
  const [saving, setSaving] = useState(false);

  const updateRoot = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateContact = (key, value) => setForm(prev => ({ ...prev, myContact: { ...prev.myContact, [key]: value } }));

  const isFormValid = form.nurseCode && form.firstName && form.lastName && form.myContact.email;

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    const payload = {
      ...form,
      nurseSpeciality: form.nurseSpeciality.split(',').map(s => s.trim()).filter(Boolean),
      nurseExperience: parseInt(form.nurseExperience, 10) || 0,
    };
    try {
      await nurseApi.create(user.orgName, user.hospitalCode, payload, token);
      Alert.alert('Success', `Nurse ${form.firstName} ${form.lastName} onboarded.`, [
        { text: 'OK', onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to create nurse.');
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
            Onboarding new nursing staff for {user?.hospitalCode}. Registered nurses can be assigned to ward shifts and monitored telemetry hubs.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Nurse Identity" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Staff Code" required>
                <TextInput value={form.nurseCode} onChangeText={v => updateRoot('nurseCode', v.toUpperCase())} placeholder="NR-001" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Experience (Years)">
                <TextInput value={form.nurseExperience} onChangeText={v => updateRoot('nurseExperience', v.replace(/[^0-9]/g, ''))} placeholder="5" keyboardType="numeric" />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="First Name" required>
                <TextInput value={form.firstName} onChangeText={v => updateRoot('firstName', v)} placeholder="Lena" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Last Name" required>
                <TextInput value={form.lastName} onChangeText={v => updateRoot('lastName', v)} placeholder="Kowalski" />
              </Field>
            </View>
          </View>

          <Field label="Speciality (comma separated)">
            <TextInput value={form.nurseSpeciality} onChangeText={v => updateRoot('nurseSpeciality', v)} placeholder="ICU, Paediatrics" />
          </Field>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Contact Information" />
          <Field label="Email Address" required>
            <TextInput value={form.myContact.email} onChangeText={v => updateContact('email', v.toLowerCase())} placeholder="nurse@hospital.org" leading={<IconMail size={16} color={T.textFaint} />} />
          </Field>
          <Field label="Phone Number">
            <TextInput value={form.myContact.phone} onChangeText={v => updateContact('phone', v)} placeholder="+91 00000 00000" leading={<IconPhone size={16} color={T.textFaint} />} />
          </Field>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>Cancel</Btn>
          <Btn variant="primary" style={{ flex: 2 }} disabled={!isFormValid || saving} onPress={handleCreate}>
            {saving ? 'Creating...' : 'Create Nurse'}
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
  row: { flexDirection: 'row', gap: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
