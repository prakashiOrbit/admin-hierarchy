import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconBed, IconGateway, IconShield } from '../../icons';

export const CreateBedScreen = ({ onCancel, wardCode = 'WARD998', hospCode = 'HOSP999' }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [form, setForm] = useState({
    bedCode: '',
    wardCode: wardCode,
    bedStatus: 'ACTIVE',
    gatewayCode: ''
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = form.bedCode && form.gatewayCode;

  const handleCreate = () => {
    console.log('Create Bed Payload:', JSON.stringify(form, null, 2));
    // API call to /api/{orgName}/bed/{hospCode}/create
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconBed size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Provisioning a new monitored bed. Each bed must be linked to a physical gateway for real-time telemetry streaming.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Bed Specifications" />
          
          <Field label="Bed Identifier" required>
            <TextInput
              value={form.bedCode}
              onChangeText={v => updateForm('bedCode', v.toUpperCase())}
              placeholder="e.g. BED-ICU-01"
              leading={<IconShield size={16} color={T.textFaint} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Ward Unit">
                <Card style={styles.disabledCard} padding={12}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.disabledText}>{wardCode}</Text>
                  </View>
                </Card>
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Initial Status">
                <Card style={styles.selectCard} padding={12}>
                  <Text style={styles.selectText}>{form.bedStatus}</Text>
                </Card>
              </Field>
            </View>
          </View>

          <Field label="Primary Gateway" required>
            <TextInput
              value={form.gatewayCode}
              onChangeText={v => updateForm('gatewayCode', v.toUpperCase())}
              placeholder="e.g. GW-ICU-001"
              leading={<IconGateway size={16} color={T.textFaint} />}
            />
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
            Provision Bed
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
  selectCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface },
  selectText: { color: T.text, fontSize: 14 },
  disabledCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface2, borderColor: T.borderSoft },
  disabledText: { color: T.textDim, fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
