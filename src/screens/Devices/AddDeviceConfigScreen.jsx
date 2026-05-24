import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Field, TextInput, Btn } from '../../components/Shared';
import { IconCpu, IconShield, IconActivity, IconWifi } from '../../icons';
import { deviceApi } from '../../services/api';

const MODES = ['WIFI_PUSH', 'WIFI_PULL'];

export const AddDeviceConfigScreen = ({ device, onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [mode, setMode] = useState('WIFI_PUSH');
  const [deviceType, setDeviceType] = useState(device?.deviceType || '');
  const [port, setPort] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const isValid = deviceType.trim() && port.trim() && (mode === 'WIFI_PULL' || ipAddress.trim());

  const buildPayload = () => {
    const base = { deviceType: deviceType.trim(), modeofCommunication: mode };
    if (mode === 'WIFI_PUSH') {
      return [
        { configName: 'port',      configValue: port.trim(),      ...base },
        { configName: 'ipAddress', configValue: ipAddress.trim(), ...base },
      ];
    }
    return [
      { configName: 'port', configValue: port.trim(), ...base },
    ];
  };

  const handleSubmit = async () => {
    if (!isValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    try {
      await deviceApi.addConfig(user.orgName, user.hospitalCode, device.deviceCode, buildPayload(), token);
      Alert.alert(
        t('common.success'),
        t('device.config_saved', { code: device.deviceCode }),
        [{ text: t('common.done'), onPress: onSuccess || onCancel }],
      );
    } catch (e) {
      Alert.alert(t('common.error'), e.data?.message || e.message || t('device.config_failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Device info header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: T.accentSoft }]}>
              <IconCpu size={26} color={T.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deviceCode}>{device?.deviceCode}</Text>
              <Text style={styles.deviceSub}>{device?.deviceType} · {device?.protocol}</Text>
            </View>
          </View>
        </Card>

        {/* Mode selector */}
        <SectionHeader title={t('device.config_comm_mode')} />
        <Card style={styles.modeCard}>
          <View style={styles.modeRow}>
            {MODES.map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.modeBtn, mode === m && { backgroundColor: T.accent, borderColor: T.accent }]}
                onPress={() => { setMode(m); setIpAddress(''); }}
              >
                <IconWifi size={14} color={mode === m ? '#fff' : T.textDim} />
                <Text style={[styles.modeBtnText, mode === m && { color: '#fff' }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.modeInfo, { backgroundColor: T.accentSoft }]}>
            <Text style={[styles.modeInfoText, { color: T.accent }]}>
              {mode === 'WIFI_PUSH'
                ? t('device.config_push_hint')
                : t('device.config_pull_hint')}
            </Text>
          </View>
        </Card>

        {/* Config fields */}
        <SectionHeader title={t('device.config_parameters')} />
        <Card style={styles.fieldsCard}>
          <Field label={t('device.config_device_type')} required>
            <TextInput
              value={deviceType}
              onChangeText={setDeviceType}
              placeholder={t('device.config_device_type_placeholder')}
              leading={<IconActivity size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label={t('device.config_port')} required>
            <TextInput
              value={port}
              onChangeText={setPort}
              placeholder={t('device.config_port_placeholder')}
              keyboardType="numeric"
              leading={<IconShield size={16} color={T.textFaint} />}
            />
          </Field>

          {mode === 'WIFI_PUSH' && (
            <Field label={t('device.config_ip')} required>
              <TextInput
                value={ipAddress}
                onChangeText={setIpAddress}
                placeholder={t('device.config_ip_placeholder')}
                keyboardType="default"
                leading={<IconWifi size={16} color={T.textFaint} />}
              />
            </Field>
          )}
        </Card>

        {/* Preview */}
        <SectionHeader title={t('device.config_preview')} />
        <Card style={styles.previewCard}>
          {buildPayload().map((c, i) => (
            <View key={i} style={[styles.previewRow, i > 0 && { borderTopWidth: 1, borderTopColor: T.borderSoft }]}>
              <Text style={styles.previewKey}>{c.configName}</Text>
              <Text style={styles.previewVal}>{c.configValue || '—'}</Text>
            </View>
          ))}
          <View style={[styles.previewRow, { borderTopWidth: 1, borderTopColor: T.borderSoft }]}>
            <Text style={styles.previewKey}>modeofCommunication</Text>
            <Text style={[styles.previewVal, { color: T.accent }]}>{mode}</Text>
          </View>
          <View style={[styles.previewRow, { borderTopWidth: 1, borderTopColor: T.borderSoft }]}>
            <Text style={styles.previewKey}>deviceType</Text>
            <Text style={styles.previewVal}>{deviceType || '—'}</Text>
          </View>
        </Card>

        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>
            {t('common.cancel')}
          </Btn>
          <Btn
            variant="primary"
            style={{ flex: 2 }}
            disabled={!isValid || saving}
            onPress={handleSubmit}
          >
            {saving ? <ActivityIndicator size="small" color="#fff" /> : t('device.config_submit')}
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  headerCard: { marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  deviceCode: { fontSize: 17, fontWeight: '700', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  deviceSub: { fontSize: 12, color: T.textDim, marginTop: 3 },
  modeCard: { marginBottom: 20 },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: T.borderSoft, backgroundColor: T.surface },
  modeBtnText: { fontSize: 13, fontWeight: '700', color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  modeInfo: { borderRadius: 8, padding: 10 },
  modeInfoText: { fontSize: 12, lineHeight: 17 },
  fieldsCard: { marginBottom: 20 },
  previewCard: { marginBottom: 24 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  previewKey: { fontSize: 12, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  previewVal: { fontSize: 12, fontWeight: '600', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', textAlign: 'right' },
  actionRow: { flexDirection: 'row', gap: 10 },
});
