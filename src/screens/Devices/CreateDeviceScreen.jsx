import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconCpu, IconActivity, IconShield } from '../../icons';
import { deviceApi } from '../../services/api';

const PROTOCOLS = ['BLE', 'WIFI', 'MQTT', 'HL7', 'MODBUS'];
const VERIFY_TYPES = ['MACADDR', 'SERIAL', 'CERTIFICATE'];
const USAGE_TYPES = ['Fixed', 'Mobile'];

export const CreateDeviceScreen = ({ onCancel, onSuccess }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    deviceCode: '',
    deviceType: '',
    protocol: 'BLE',
    verifyWith: 'MACADDR',
    usageType: 'Fixed',
  });
  const [saving, setSaving] = useState(false);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const isFormValid = form.deviceCode && form.deviceType && form.protocol;

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    try {
      await deviceApi.create(user.orgName, user.hospitalCode, form, token);
      Alert.alert('Success', `Device ${form.deviceCode} registered.`, [
        { text: 'OK', onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to create device.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconCpu size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Provisioning a new clinical monitoring device for {user?.hospitalCode}. Once registered, this device can be assigned to a gateway, bed or patient.
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

          <Field label="Hardware Profile / Model" required>
            <TextInput
              value={form.deviceType}
              onChangeText={v => updateForm('deviceType', v)}
              placeholder="e.g. Comen-V4, Mindray-T1"
              leading={<IconActivity size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label="Communication Protocol" required>
            <View style={styles.optionGrid}>
              {PROTOCOLS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.optionBtn, form.protocol === p && styles.optionActive]}
                  onPress={() => updateForm('protocol', p)}
                >
                  <Text style={[styles.optionText, form.protocol === p && styles.optionTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Verification Method">
            <View style={styles.optionGrid}>
              {VERIFY_TYPES.map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.optionBtn, form.verifyWith === v && styles.optionActive]}
                  onPress={() => updateForm('verifyWith', v)}
                >
                  <Text style={[styles.optionText, form.verifyWith === v && styles.optionTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Usage Type">
            <View style={styles.optionGrid}>
              {USAGE_TYPES.map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.optionBtn, form.usageType === u && styles.optionActive]}
                  onPress={() => updateForm('usageType', u)}
                >
                  <Text style={[styles.optionText, form.usageType === u && styles.optionTextActive]}>{u}</Text>
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
            {saving ? 'Registering...' : 'Register Device'}
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
