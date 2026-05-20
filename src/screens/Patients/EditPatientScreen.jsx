import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconPhone, IconLocation, IconHeart, IconBuilding } from '../../icons';
import { patientApi } from '../../services/api';

export const EditPatientScreen = ({ patientDetail, onCancel, onSave }) => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const p = patientDetail.patient || patientDetail;
  const infos = patientDetail.patientInfos || [];
  const rawVitals = infos.find(i => i.infoType === 'VITAL_SIGNS')?.infoData;
  let vitalsData = {};
  if (rawVitals) {
    try { vitalsData = typeof rawVitals === 'string' ? JSON.parse(rawVitals) : rawVitals; } catch {}
  }

  const [form, setForm] = useState({
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    email: p.myContact?.email || '',
    phone: p.myContact?.phone || '',
    street1: p.myAddress?.street1 || '',
    city: p.myAddress?.city || '',
    state: p.myAddress?.state || '',
    pincode: p.myAddress?.pincode || '',
    country: p.myAddress?.country || 'India',
    bloodGroup: vitalsData.bloodGroup || '',
    weight: String(vitalsData.weight || ''),
    height: String(vitalsData.height || ''),
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const isValid = form.firstName && form.lastName && form.email;

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      patient: {
        firstName: form.firstName,
        lastName: form.lastName,
        myContact: { email: form.email, phone: form.phone },
        myAddress: { street1: form.street1, city: form.city, state: form.state, pincode: form.pincode, country: form.country },
      },
      patientinfo: [{
        infoType: 'VITAL_SIGNS',
        infoData: JSON.stringify({ bloodGroup: form.bloodGroup, weight: form.weight, height: form.height }),
      }],
    };
    try {
      await patientApi.update(user.orgName, user.hospitalCode, p.patientCode, payload, token);
      Alert.alert('Saved', 'Patient profile updated.', [{ text: 'OK', onPress: () => onSave?.() }]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update patient.');
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
            Editing <Text style={{ fontWeight: '700' }}>{p.patientCode}</Text>. Patient code cannot be changed.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Patient Identity" />

          <Field label="Patient Code">
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{p.patientCode}</Text>
              </View>
            </Card>
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="First Name" required>
                <TextInput value={form.firstName} onChangeText={v => set('firstName', v)} placeholder="John" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Last Name" required>
                <TextInput value={form.lastName} onChangeText={v => set('lastName', v)} placeholder="Doe" />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Contact & Address" />
          <Field label="Email" required>
            <TextInput
              value={form.email}
              onChangeText={v => set('email', v.toLowerCase())}
              placeholder="patient@example.com"
              keyboardType="email-address"
              leading={<IconMail size={16} color={T.textFaint} />}
            />
          </Field>
          <Field label="Phone">
            <TextInput
              value={form.phone}
              onChangeText={v => set('phone', v)}
              placeholder="555-0101"
              keyboardType="phone-pad"
              leading={<IconPhone size={16} color={T.textFaint} />}
            />
          </Field>
          <Field label="Street Address">
            <TextInput
              value={form.street1}
              onChangeText={v => set('street1', v)}
              placeholder="123 Medical Lane"
              leading={<IconLocation size={16} color={T.textFaint} />}
            />
          </Field>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="City">
                <TextInput value={form.city} onChangeText={v => set('city', v)} placeholder="Springfield" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Pincode">
                <TextInput value={form.pincode} onChangeText={v => set('pincode', v)} placeholder="62704" keyboardType="numeric" />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Vital Signs" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Blood Group">
                <TextInput value={form.bloodGroup} onChangeText={v => set('bloodGroup', v)} placeholder="O+" leading={<IconHeart size={16} color={T.textFaint} />} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Weight">
                <TextInput value={form.weight} onChangeText={v => set('weight', v)} placeholder="75kg" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Height">
                <TextInput value={form.height} onChangeText={v => set('height', v)} placeholder="180cm" />
              </Field>
            </View>
          </View>
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
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
