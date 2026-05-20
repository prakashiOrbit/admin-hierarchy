import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { deviceTypeApi } from '../../services/api';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconCpu, IconActivity, IconShield } from '../../icons';

export const EditDeviceTypeScreen = ({ deviceType, onCancel, onSave }) => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: deviceType.category || '',
    description: deviceType.description || '',
    deviceVendor: deviceType.deviceVendor || '',
    deviceProfile: deviceType.deviceProfile || '',
    deviceFirmware: deviceType.deviceFirmware || '',
    maxFirmware: deviceType.maxFirmware || '',
  });

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const isFormValid = form.deviceVendor && form.deviceProfile;

  const handleSave = async () => {
    setLoading(true);
    try {
      await deviceTypeApi.updateType(user.orgName, deviceType.deviceType, form, token);
      Alert.alert('Success', 'Device type updated successfully', [
        { text: 'OK', onPress: () => onSave({ ...deviceType, ...form }) }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update device type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <IconCpu size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Editing <Text style={{ fontWeight: '700' }}>{deviceType.deviceType}</Text>. The profile name cannot be changed.
          </Text>
        </View>

        {/* Read-only identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEVICE IDENTITY</Text>

          <Field label="Profile Name">
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconActivity size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{deviceType.deviceType}</Text>
              </View>
            </Card>
          </Field>

          <Field label="Category" required>
            <TextInput
              value={form.category}
              onChangeText={v => updateForm('category', v.toUpperCase())}
              placeholder="e.g. PMS"
              leading={<IconShield size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label="Description">
            <TextInput
              value={form.description}
              onChangeText={v => updateForm('description', v)}
              placeholder="e.g. Comen Patient Monitor"
            />
          </Field>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SPECIFICATIONS</Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Vendor" required>
                <TextInput
                  value={form.deviceVendor}
                  onChangeText={v => updateForm('deviceVendor', v)}
                  placeholder="e.g. Comen"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Profile Code" required>
                <TextInput
                  value={form.deviceProfile}
                  onChangeText={v => updateForm('deviceProfile', v)}
                  placeholder="e.g. Comen"
                />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Min Firmware">
                <TextInput
                  value={form.deviceFirmware}
                  onChangeText={v => updateForm('deviceFirmware', v)}
                  placeholder="1.0.0"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Max Firmware">
                <TextInput
                  value={form.maxFirmware}
                  onChangeText={v => updateForm('maxFirmware', v)}
                  placeholder="2.0.0"
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
