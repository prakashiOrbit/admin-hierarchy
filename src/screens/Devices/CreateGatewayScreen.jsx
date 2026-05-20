import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconGateway, IconCpu, IconShield } from '../../icons';
import { gatewayApi } from '../../services/api';

const GATEWAY_TYPES = ['IOT_HUB', 'EDGE_GATEWAY', 'PROTOCOL_BRIDGE'];
const COMM_CONFIGS = ['MQTT_ENABLED', 'HTTP_ENABLED', 'WEBSOCKET_ENABLED', 'BLE_ENABLED'];

export const CreateGatewayScreen = ({ onCancel, onSuccess }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    gatewayCode: '',
    gatewayType: 'IOT_HUB',
    os: 'Linux',
    communicationConfig: 'MQTT_ENABLED',
  });
  const [saving, setSaving] = useState(false);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const isFormValid = form.gatewayCode && form.gatewayType && form.os && form.communicationConfig;

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    try {
      await gatewayApi.create(user.orgName, user.hospitalCode, form, token);
      Alert.alert('Success', `Gateway ${form.gatewayCode} provisioned.`, [
        { text: 'OK', onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to create gateway.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconGateway size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Provisioning a new IoT Gateway hub for {user?.hospitalCode}. This device acts as a local communication bridge for medical sensors.
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
            <View style={styles.optionGrid}>
              {GATEWAY_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.optionBtn, form.gatewayType === t && styles.optionActive]}
                  onPress={() => updateForm('gatewayType', t)}
                >
                  <Text style={[styles.optionText, form.gatewayType === t && styles.optionTextActive]}>
                    {t.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Operating System" required>
            <TextInput
              value={form.os}
              onChangeText={v => updateForm('os', v)}
              placeholder="e.g. Linux"
              leading={<IconCpu size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label="Communication Protocol" required>
            <View style={styles.optionGrid}>
              {COMM_CONFIGS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.optionBtn, form.communicationConfig === c && styles.optionActive]}
                  onPress={() => updateForm('communicationConfig', c)}
                >
                  <Text style={[styles.optionText, form.communicationConfig === c && styles.optionTextActive]}>
                    {c.replace(/_/g, ' ')}
                  </Text>
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
            disabled={!isFormValid || saving}
            onPress={handleCreate}
          >
            {saving ? 'Creating...' : 'Create Gateway'}
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
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: T.borderSoft, backgroundColor: T.surface },
  optionActive: { backgroundColor: T.accent, borderColor: T.accent },
  optionText: { fontSize: 12, color: T.text, fontWeight: '600' },
  optionTextActive: { color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
