import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconCpu, IconActivity, IconShield } from '../../icons';
import { deviceApi } from '../../services/api';

const PROTOCOLS = ['BLE', 'WIFI', 'MQTT', 'HL7', 'MODBUS'];
const VERIFY_TYPES = ['MACADDR', 'SERIAL', 'CERTIFICATE'];
const USAGE_TYPES = ['Fixed', 'Mobile'];

export const CreateDeviceScreen = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
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
      Alert.alert(t('common.success'), t('alerts.device_registered', { code: form.deviceCode }), [
        { text: t('common.done'), onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('alerts.device_create_failed'));
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
            {t('device.create_banner', { hospital: user?.hospitalCode })}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('device.specifications')} />

          <Field label={t('device.code')} required>
            <TextInput
              value={form.deviceCode}
              onChangeText={v => updateForm('deviceCode', v.toUpperCase())}
              placeholder={t('device.code_placeholder')}
              leading={<IconShield size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label={t('device.type')} required>
            <TextInput
              value={form.deviceType}
              onChangeText={v => updateForm('deviceType', v)}
              placeholder={t('device.type_placeholder')}
              leading={<IconActivity size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label={t('device.protocol')} required>
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

          <Field label={t('device.verification_method')}>
            <View style={styles.optionGrid}>
              {VERIFY_TYPES.map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.optionBtn, form.verifyWith === v && styles.optionActive]}
                  onPress={() => updateForm('verifyWith', v)}
                >
                  <Text style={[styles.optionText, form.verifyWith === v && styles.optionTextActive]}>
                    {t(`device.verify_${v.toLowerCase().replace('macaddr', 'mac').replace('certificate', 'cert')}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label={t('device.usage_type')}>
            <View style={styles.optionGrid}>
              {USAGE_TYPES.map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.optionBtn, form.usageType === u && styles.optionActive]}
                  onPress={() => updateForm('usageType', u)}
                >
                  <Text style={[styles.optionText, form.usageType === u && styles.optionTextActive]}>
                    {t(`device.usage_${u.toLowerCase()}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>{t('common.cancel')}</Btn>
          <Btn
            variant="primary"
            style={{ flex: 2 }}
            disabled={!isFormValid || saving}
            onPress={handleCreate}
          >
            {saving ? t('actions.registering') : t('actions.register_device')}
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
