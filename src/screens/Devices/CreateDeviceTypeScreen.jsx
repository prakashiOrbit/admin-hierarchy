import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { deviceApi } from '../../services/api';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconCpu, IconActivity, IconShield, IconBuilding } from '../../icons';

export const CreateDeviceTypeScreen = ({ onCancel }) => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    deviceType: '',
    category: 'PMS',
    description: '',
    deviceProfile: '',
    deviceVendor: '',
    deviceFirmware: '1.0.0',
    maxFirmware: '2.0.0'
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = form.deviceType && form.deviceProfile && form.deviceVendor;

  const handleCreate = async () => {
    if (!user?.orgName) {
      Alert.alert('Error', 'Organisation name not found');
      return;
    }

    setLoading(true);
    try {
      await deviceApi.createType(user.orgName, form, token);
      Alert.alert('Success', 'Device Type created successfully', [
        { text: 'OK', onPress: onCancel }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create device type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Helper Banner */}
        <View style={styles.banner}>
          <IconCpu size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            Defining a new IoMT hardware profile. This template will be used to validate and provision physical devices across the organization.
          </Text>
        </View>

        {/* Device Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEVICE IDENTITY</Text>
          
          <Field label="Profile Name" required>
            <TextInput
              value={form.deviceType}
              onChangeText={v => updateForm('deviceType', v)}
              placeholder="e.g. Comen-V4"
              leading={<IconActivity size={16} color={T.textFaint} />}
            />
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

        {/* Vendor Section */}
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
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel} disabled={loading}>Cancel</Btn>
          <Btn 
            variant="primary" 
            style={{ flex: 2 }} 
            disabled={!isFormValid || loading}
            onPress={handleCreate}
          >
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : 'Create Type'}
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
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
