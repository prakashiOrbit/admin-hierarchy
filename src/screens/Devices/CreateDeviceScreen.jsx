import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconCpu, IconActivity, IconShield } from '../../icons';
import { deviceApi, deviceTypeApi } from '../../services/api';

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
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => {
    if (!user?.orgName) return;
    setLoadingTypes(true);
    deviceTypeApi.listTypes(user.orgName, token)
      .then(data => setDeviceTypes(Array.isArray(data) ? data : []))
      .catch(() => setDeviceTypes([]))
      .finally(() => setLoadingTypes(false));
  }, []);

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
      const msg = e.status === 409
        ? t('device.code_already_exists', { code: form.deviceCode })
        : (e.message || t('alerts.device_create_failed'));
      Alert.alert(t('common.error'), msg);
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
            <Card
              style={styles.selectCard}
              padding={12}
              onPress={() => setShowTypePicker(true)}
            >
              {loadingTypes ? (
                <ActivityIndicator size="small" color={T.accent} />
              ) : (
                <>
                  <IconActivity size={16} color={T.textFaint} />
                  <Text style={[styles.selectText, !form.deviceType && { color: T.textFaint }]}>
                    {form.deviceType || t('device.type_placeholder')}
                  </Text>
                  <Text style={styles.chevron}>▾</Text>
                </>
              )}
            </Card>
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

      <Modal visible={showTypePicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTypePicker(false)}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('device.type')}</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {deviceTypes.map(dt => (
                <TouchableOpacity
                  key={dt.deviceType}
                  style={[styles.pickerOption, form.deviceType === dt.deviceType && { backgroundColor: T.accentSoft }]}
                  onPress={() => { updateForm('deviceType', dt.deviceType); setShowTypePicker(false); }}
                >
                  <Text style={[styles.pickerOptionText, form.deviceType === dt.deviceType && { color: T.accent, fontWeight: '700' }]}>
                    {dt.deviceType}
                  </Text>
                  {dt.description ? (
                    <Text style={styles.pickerOptionSub}>{dt.description}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
              {!deviceTypes.length && (
                <Text style={[styles.pickerOptionText, { color: T.textFaint, padding: 12 }]}>{t('common.no_data')}</Text>
              )}
            </ScrollView>
          </Card>
        </TouchableOpacity>
      </Modal>
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
  selectCard: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.surface },
  selectText: { flex: 1, color: T.text, fontSize: 14 },
  chevron: { fontSize: 16, color: T.textDim },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 12, textAlign: 'center' },
  pickerOption: { padding: 14, borderRadius: 8, marginBottom: 4 },
  pickerOptionText: { fontSize: 14, color: T.text },
  pickerOptionSub: { fontSize: 11, color: T.textFaint, marginTop: 2 },
});
