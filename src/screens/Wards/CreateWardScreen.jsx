import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconDoor, IconBuilding } from '../../icons';

export const CreateWardScreen = ({ onCancel, orgName = 'APOLLO_ORG_TEST129', hospCode = 'HOSP999' }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [form, setForm] = useState({
    wardCode: '',
    wardName: '',
    wardType: 'ICU',
    numberOfBeds: ''
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = form.wardCode && form.wardName && form.numberOfBeds;

  const handleCreate = () => {
    console.log('Create Ward Payload:', JSON.stringify(form, null, 2));
    // API call to /api/{orgName}/ward/{hospCode}/create
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconDoor size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Provisioning a new physical ward for {hospCode}. Once created, you can assign individual beds and gateways to this unit.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Ward Configuration" />
          
          <Field label="Ward Code" required>
            <TextInput
              value={form.wardCode}
              onChangeText={v => updateForm('wardCode', v.toUpperCase())}
              placeholder="e.g. WARD-ICU-01"
            />
          </Field>

          <Field label="Ward Name" required>
            <TextInput
              value={form.wardName}
              onChangeText={v => updateForm('wardName', v)}
              placeholder="e.g. Emergency Ward"
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Type" required>
                <Card style={styles.selectCard} padding={12}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.selectText}>{form.wardType}</Text>
                  </View>
                </Card>
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Est. Beds" required>
                <TextInput
                  value={form.numberOfBeds}
                  onChangeText={v => updateForm('numberOfBeds', v.replace(/[^0-9]/g, ''))}
                  placeholder="15"
                  keyboardType="numeric"
                />
              </Field>
            </View>
          </View>

          <Field label="Assigned Hospital">
            <Card style={styles.disabledCard} padding={12}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.disabledText}>{hospCode}</Text>
              </View>
            </Card>
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
            Create Ward
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
