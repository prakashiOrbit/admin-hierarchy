import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconPulse, IconCpu, IconActivity, IconShield } from '../../icons';

export const CreateDeviceScreen = ({ onCancel, hospCode = 'HOSP999' }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [form, setForm] = useState({
    deviceCode: '',
    deviceType: 'Comen-V4',
    protocol: 'BLE',
    verifyWith: 'MACADDR',
    usageType: 'Fixed'
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = form.deviceCode && form.deviceType && form.protocol;

  const handleCreate = () => {
    console.log('Create Device Payload:', JSON.stringify(form, null, 2));
    // API call to /api/{orgName}/device/{hospCode}/create
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconCpu size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Provisioning a new clinical monitoring device for {hospCode}. Once created, this device can be assigned to wards and beds.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Device Specifications" />
          
          <Field label="Device Serial / Code" required>
            <TextInput
              value={form.deviceCode}
              onChangeText={v => updateForm('deviceCode', v.toUpperCase())}
              placeholder="e.g. MON-ICU-001"
              leading={<IconShield size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label="Hardware Profile" required>
            <Card style={styles.selectCard} padding={12}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconActivity size={16} color={T.accent} />
                <Text style={styles.selectText}>{form.deviceType}</Text>
              </View>
            </Card>
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Protocol" required>
                <Card style={styles.selectCard} padding={12}>
                  <Text style={styles.selectText}>{form.protocol}</Text>
                </Card>
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Verification">
                <Card style={styles.selectCard} padding={12}>
                  <Text style={styles.selectText}>{form.verifyWith}</Text>
                </Card>
              </Field>
            </View>
          </View>

          <Field label="Usage Type">
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['Fixed', 'Mobile'].map((type) => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.radioBtn, form.usageType === type && styles.radioActive]}
                  onPress={() => updateForm('usageType', type)}
                >
                  <Text style={[styles.radioText, form.usageType === type && styles.radioTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>Cancel</Btn>
          <Btn 
            variant="primary" 
            style={{ flex: 2 }} 
            disabled={!isFormValid}
            onPress={handleCreate}
          >
            Create Device
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
  sectionTitle: { fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  selectCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface, borderColor: T.borderSoft },
  selectText: { color: T.text, fontSize: 14 },
  radioBtn: { flex: 1, height: 42, borderRadius: 10, borderWidth: 1, borderColor: T.borderSoft, alignItems: 'center', justifyContent: 'center', backgroundColor: T.surface },
  radioActive: { backgroundColor: T.accent, borderColor: T.accent },
  radioText: { fontSize: 13, fontWeight: '600', color: T.textDim },
  radioTextActive: { color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
