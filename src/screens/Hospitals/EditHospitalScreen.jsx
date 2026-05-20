import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { organisationApi } from '../../services/api';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconHospital, IconUser, IconMail, IconLocation, IconPhone, IconBuilding } from '../../icons';

export const EditHospitalScreen = ({ hospital, onCancel, onSave }) => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hospitalName: hospital.hospitalName || '',
    description: hospital.description || '',
    myContact: {
      name: hospital.myContact?.name || '',
      email: hospital.myContact?.email || '',
      phone: hospital.myContact?.phone || '',
    },
    myAddress: {
      street1: hospital.myAddress?.street1 || '',
      city: hospital.myAddress?.city || '',
      state: hospital.myAddress?.state || '',
      pincode: hospital.myAddress?.pincode || '',
      country: hospital.myAddress?.country || '',
    },
  });

  const updateRoot = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateContact = (key, value) => setForm(prev => ({ ...prev, myContact: { ...prev.myContact, [key]: value } }));
  const updateAddress = (key, value) => setForm(prev => ({ ...prev, myAddress: { ...prev.myAddress, [key]: value } }));

  const isFormValid = form.hospitalName && form.myContact.email;

  const handleSave = async () => {
    setLoading(true);
    try {
      await organisationApi.updateHospital(user.orgName, hospital.hospitalCode, form, token);
      Alert.alert('Success', 'Hospital updated successfully', [
        { text: 'OK', onPress: () => onSave({ ...hospital, ...form }) }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <IconHospital size={20} color={T.accent} />
          <Text style={styles.bannerText}>
            Editing <Text style={{ fontWeight: '700' }}>{hospital.hospitalCode}</Text>. The hospital code cannot be changed.
          </Text>
        </View>

        {/* Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HOSPITAL IDENTITY</Text>

          <Field label="Hospital Code">
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{hospital.hospitalCode}</Text>
              </View>
            </Card>
          </Field>

          <Field label="Hospital Name" required>
            <TextInput
              value={form.hospitalName}
              onChangeText={v => updateRoot('hospitalName', v)}
              placeholder="e.g. City General Hospital"
            />
          </Field>

          <Field label="Description">
            <TextInput
              value={form.description}
              onChangeText={v => updateRoot('description', v)}
              placeholder="e.g. Main city branch"
            />
          </Field>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIMARY CONTACT</Text>

          <Field label="Full Name">
            <TextInput
              value={form.myContact.name}
              onChangeText={v => updateContact('name', v)}
              placeholder="Full name"
              leading={<IconUser size={18} color={T.textDim} />}
            />
          </Field>

          <Field label="Email Address" required>
            <TextInput
              value={form.myContact.email}
              onChangeText={v => updateContact('email', v.toLowerCase())}
              placeholder="owner@hospital.com"
              leading={<IconMail size={18} color={T.textDim} />}
            />
          </Field>

          <Field label="Phone Number">
            <TextInput
              value={form.myContact.phone}
              onChangeText={v => updateContact('phone', v)}
              placeholder="+91 98000 00000"
              leading={<IconPhone size={18} color={T.textDim} />}
            />
          </Field>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PHYSICAL ADDRESS</Text>

          <Field label="Street Address">
            <TextInput
              value={form.myAddress.street1}
              onChangeText={v => updateAddress('street1', v)}
              placeholder="123 Health Ave"
              leading={<IconLocation size={18} color={T.textDim} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="City">
                <TextInput
                  value={form.myAddress.city}
                  onChangeText={v => updateAddress('city', v)}
                  placeholder="Metropolis"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="State">
                <TextInput
                  value={form.myAddress.state}
                  onChangeText={v => updateAddress('state', v)}
                  placeholder="NY"
                />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Country">
                <TextInput
                  value={form.myAddress.country}
                  onChangeText={v => updateAddress('country', v)}
                  placeholder="India"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Pincode">
                <TextInput
                  value={form.myAddress.pincode}
                  onChangeText={v => updateAddress('pincode', v)}
                  placeholder="10001"
                />
              </Field>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="ghost" full style={{ flex: 1 }} onPress={onCancel} disabled={loading}>
            Cancel
          </Btn>
          <Btn
            full
            style={{ flex: 1.5 }}
            onPress={handleSave}
            disabled={!isFormValid || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : 'Save Changes'}
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
    flexDirection: 'row',
    backgroundColor: T.accentSoft,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  bannerText: { flex: 1, fontSize: 13, color: T.text, lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  readOnlyCard: {
    height: 44,
    justifyContent: 'center',
    backgroundColor: T.surface2,
    borderColor: T.borderSoft,
  },
  readOnlyText: {
    color: T.textDim,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
