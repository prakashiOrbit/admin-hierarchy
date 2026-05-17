import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconGateway, IconCpu, IconShield } from '../../icons';

export const CreateGatewayScreen = ({ onCancel, hospCode = 'HOSP999' }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [form, setForm] = useState({
    gatewayCode: '',
    gatewayType: 'IOT_HUB',
    os: 'Linux',
    communicationConfig: 'MQTT_ENABLED'
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = form.gatewayCode && form.gatewayType && form.os;

  const handleCreate = () => {
    console.log('Create Gateway Payload:', JSON.stringify(form, null, 2));
    // API call to /api/{orgName}/gateway/{hospCode}/create
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconGateway size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Provisioning a new IoT Gateway hub for {hospCode}. This device will act local communication bridge for medical sensors.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Gateway Configuration" />
          
          <Field label="Gateway Serial / Code" required>
            <TextInput
              value={form.gatewayCode}
              onChangeText={v => updateForm('gatewayCode', v.toUpperCase())}
              placeholder="e.g. GW-MAIN-001"
              leading={<IconShield size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label="Gateway Type" required>
            <Card style={styles.selectCard} padding={12}>
              <Text style={styles.selectText}>{form.gatewayType}</Text>
            </Card>
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Operating System" required>
                <TextInput
                  value={form.os}
                  onChangeText={v => updateForm('os', v)}
                  placeholder="e.g. Linux"
                  leading={<IconCpu size={16} color={T.textFaint} />}
                />
              </Field>
            </View>
          </View>

          <Field label="Communication Protocol">
            <Card style={styles.selectCard} padding={12}>
              <Text style={styles.selectText}>{form.communicationConfig}</Text>
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
            Create Gateway
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
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
