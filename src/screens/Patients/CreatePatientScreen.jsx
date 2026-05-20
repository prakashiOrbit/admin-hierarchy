import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconLocation, IconPhone, IconHeart } from '../../icons';
import { patientApi } from '../../services/api';

export const CreatePatientScreen = ({ onCancel, onSuccess }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    patient: {
      patientCode: '',
      firstName: '',
      lastName: '',
      myContact: { email: '', phone: '' },
      myAddress: { street1: '', city: '', state: '', country: 'India', pincode: '' },
    },
    patientinfo: [
      { infoType: 'VITAL_SIGNS', infoData: { bloodGroup: '', weight: '', height: '' } }
    ],
  });
  const [saving, setSaving] = useState(false);

  const updatePatient = (key, value) =>
    setForm(prev => ({ ...prev, patient: { ...prev.patient, [key]: value } }));
  const updateContact = (key, value) =>
    setForm(prev => ({ ...prev, patient: { ...prev.patient, myContact: { ...prev.patient.myContact, [key]: value } } }));
  const updateAddress = (key, value) =>
    setForm(prev => ({ ...prev, patient: { ...prev.patient, myAddress: { ...prev.patient.myAddress, [key]: value } } }));
  const updateInfo = (key, value) =>
    setForm(prev => {
      const info = [...prev.patientinfo];
      info[0] = { ...info[0], infoData: { ...info[0].infoData, [key]: value } };
      return { ...prev, patientinfo: info };
    });

  const isFormValid = form.patient.patientCode && form.patient.firstName && form.patient.lastName && form.patient.myContact.email;

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    const payload = {
      ...form,
      patientinfo: form.patientinfo.map(i => ({
        ...i,
        infoData: JSON.stringify(i.infoData),
      })),
    };
    try {
      await patientApi.create(user.orgName, user.hospitalCode, payload, token);
      Alert.alert('Success', `Patient ${form.patient.patientCode} registered.`, [
        { text: 'OK', onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to register patient.');
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
            Registering a new patient for {user?.hospitalCode}. Please provide accurate identity, contact, and preliminary vital sign information.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Patient Identity" />
          <Field label="Patient MRN / Code" required>
            <TextInput value={form.patient.patientCode} onChangeText={v => updatePatient('patientCode', v.toUpperCase())} placeholder="e.g. MRN-2026-001" />
          </Field>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="First Name" required>
                <TextInput value={form.patient.firstName} onChangeText={v => updatePatient('firstName', v)} placeholder="John" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Last Name" required>
                <TextInput value={form.patient.lastName} onChangeText={v => updatePatient('lastName', v)} placeholder="Doe" />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Contact & Address" />
          <Field label="Email Address" required>
            <TextInput value={form.patient.myContact.email} onChangeText={v => updateContact('email', v.toLowerCase())} placeholder="patient@example.com" leading={<IconMail size={16} color={T.textFaint} />} />
          </Field>
          <Field label="Phone Number">
            <TextInput value={form.patient.myContact.phone} onChangeText={v => updateContact('phone', v)} placeholder="555-0101" leading={<IconPhone size={16} color={T.textFaint} />} />
          </Field>
          <Field label="Street Address">
            <TextInput value={form.patient.myAddress.street1} onChangeText={v => updateAddress('street1', v)} placeholder="123 Medical Lane" leading={<IconLocation size={16} color={T.textFaint} />} />
          </Field>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="City">
                <TextInput value={form.patient.myAddress.city} onChangeText={v => updateAddress('city', v)} placeholder="Springfield" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Pincode">
                <TextInput value={form.patient.myAddress.pincode} onChangeText={v => updateAddress('pincode', v)} placeholder="62704" />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Preliminary Vitals" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Blood Group">
                <TextInput value={form.patientinfo[0].infoData.bloodGroup} onChangeText={v => updateInfo('bloodGroup', v)} placeholder="O+" leading={<IconHeart size={16} color={T.textFaint} />} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Weight">
                <TextInput value={form.patientinfo[0].infoData.weight} onChangeText={v => updateInfo('weight', v)} placeholder="75kg" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Height">
                <TextInput value={form.patientinfo[0].infoData.height} onChangeText={v => updateInfo('height', v)} placeholder="180cm" />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>Cancel</Btn>
          <Btn variant="primary" style={{ flex: 2 }} disabled={!isFormValid || saving} onPress={handleCreate}>
            {saving ? 'Registering...' : 'Register Patient'}
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
