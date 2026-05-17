import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconPhone, IconStethoscope, IconCalendar, IconActivity } from '../../icons';

export const CreateDoctorScreen = ({ onCancel, hospCode = 'HOSP999' }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [form, setForm] = useState({
    doctorCode: '',
    firstName: '',
    lastName: '',
    doctorSpeciality: '', // Will be split by comma
    doctorExperience: '',
    birthDate: '',
    gender: 'MALE',
    doctorType: 'SPECIALIST',
    myContact: {
      email: '',
      phone: '',
    },
    myAddress: {
      city: '',
      state: '',
    }
  });

  const updateRoot = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateContact = (key, value) => {
    setForm(prev => ({ 
      ...prev, 
      myContact: { ...prev.myContact, [key]: value } 
    }));
  };

  const updateAddress = (key, value) => {
    setForm(prev => ({ 
      ...prev, 
      myAddress: { ...prev.myAddress, [key]: value } 
    }));
  };

  const isFormValid = form.doctorCode && form.firstName && form.lastName && form.myContact.email;

  const handleCreate = () => {
    const payload = {
      ...form,
      doctorSpeciality: form.doctorSpeciality.split(',').map(s => s.trim()).filter(s => s),
      doctorExperience: parseFloat(form.doctorExperience) || 0,
    };
    console.log('Create Doctor Payload:', JSON.stringify(payload, null, 2));
    // API call to /api/{orgName}/doctor/{hospCode}/create
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconStethoscope size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Onboarding a new medical professional for {hospCode}. This profile will be used for clinical assignments and telemetry auditing.
          </Text>
        </View>

        {/* Professional Identity */}
        <View style={styles.section}>
          <SectionHeader title="Professional Identity" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Doctor Code" required>
                <TextInput
                  value={form.doctorCode}
                  onChangeText={v => updateRoot('doctorCode', v.toUpperCase())}
                  placeholder="DOC-001"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Experience (Years)">
                <TextInput
                  value={form.doctorExperience}
                  onChangeText={v => updateRoot('doctorExperience', v.replace(/[^0-9.]/g, ''))}
                  placeholder="5.0"
                  keyboardType="numeric"
                />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="First Name" required>
                <TextInput
                  value={form.firstName}
                  onChangeText={v => updateRoot('firstName', v)}
                  placeholder="Gregory"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Last Name" required>
                <TextInput
                  value={form.lastName}
                  onChangeText={v => updateRoot('lastName', v)}
                  placeholder="House"
                />
              </Field>
            </View>
          </View>

          <Field label="Speciality (comma separated)">
            <TextInput
              value={form.doctorSpeciality}
              onChangeText={v => updateRoot('doctorSpeciality', v)}
              placeholder="Diagnostics, Nephrology"
              leading={<IconActivity size={16} color={T.textFaint} />}
            />
          </Field>
        </View>

        {/* Demographics */}
        <View style={styles.section}>
          <SectionHeader title="Demographics" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Date of Birth">
                <TextInput
                  value={form.birthDate}
                  onChangeText={v => updateRoot('birthDate', v)}
                  placeholder="YYYY-MM-DD"
                  leading={<IconCalendar size={16} color={T.textFaint} />}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Gender">
                <View style={styles.radioRow}>
                  {['MALE', 'FEMALE'].map(g => (
                    <TouchableOpacity 
                      key={g}
                      style={[styles.radioBtn, form.gender === g && styles.radioActive]}
                      onPress={() => updateRoot('gender', g)}
                    >
                      <Text style={[styles.radioText, form.gender === g && styles.radioTextActive]}>{g[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>
            </View>
          </View>

          <Field label="Professional Category">
            <Card style={styles.selectCard} padding={12}>
              <Text style={styles.selectText}>{form.doctorType}</Text>
            </Card>
          </Field>
        </View>

        {/* Contact & Address */}
        <View style={styles.section}>
          <SectionHeader title="Contact & Location" />
          <Field label="Email Address" required>
            <TextInput
              value={form.myContact.email}
              onChangeText={v => updateContact('email', v.toLowerCase())}
              placeholder="house@hospital.org"
              leading={<IconMail size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label="Phone Number">
            <TextInput
              value={form.myContact.phone}
              onChangeText={v => updateContact('phone', v)}
              placeholder="+91 00000 00000"
              leading={<IconPhone size={16} color={T.textFaint} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="City">
                <TextInput
                  value={form.myAddress.city}
                  onChangeText={v => updateAddress('city', v)}
                  placeholder="Princeton"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="State">
                <TextInput
                  value={form.myAddress.state}
                  onChangeText={v => updateAddress('state', v)}
                  placeholder="NJ"
                />
              </Field>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>Cancel</Btn>
          <Btn 
            variant="primary" 
            style={{ flex: 2 }} 
            disabled={!isFormValid}
            onPress={handleCreate}
          >
            Create Doctor
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
  radioRow: { flexDirection: 'row', gap: 8 },
  radioBtn: { flex: 1, height: 42, borderRadius: 10, borderWidth: 1, borderColor: T.borderSoft, alignItems: 'center', justifyContent: 'center', backgroundColor: T.surface },
  radioActive: { backgroundColor: T.accent, borderColor: T.accent },
  radioText: { fontSize: 13, fontWeight: '600', color: T.textDim },
  radioTextActive: { color: '#fff' },
  selectCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface, borderColor: T.borderSoft },
  selectText: { color: T.text, fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
