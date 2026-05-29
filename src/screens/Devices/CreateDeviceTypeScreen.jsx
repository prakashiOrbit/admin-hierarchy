import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { deviceTypeApi } from '../../services/api';
import { Field, TextInput, Btn } from '../../components/Shared';
import { IconCpu, IconActivity, IconShield } from '../../icons';

export const CreateDeviceTypeScreen = ({ onCancel }) => {
  const { t } = useTranslation();
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
      Alert.alert(t('messages.error'), t('messages.error_org_not_found'));
      return;
    }

    setLoading(true);
    try {
      await deviceTypeApi.createType(user.orgName, form, token);
      Alert.alert(t('messages.success'), t('messages.device_type_created'), [
        { text: t('actions.done'), onPress: onCancel }
      ]);
    } catch (error) {
      Alert.alert(t('messages.error'), error.message || t('messages.error_create_device_type'));
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
            {t('messages.device_type_create_banner')}
          </Text>
        </View>

        {/* Device Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('entity.device_identity')}</Text>
          
          <Field label={t('entity.profile_name')} required>
            <TextInput
              value={form.deviceType}
              onChangeText={v => updateForm('deviceType', v)}
              placeholder={t('placeholders.profile_name')}
              leading={<IconActivity size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label={t('entity.category')} required>
            <TextInput
              value={form.category}
              onChangeText={v => updateForm('category', v)}
              autoCapitalize="characters"
              placeholder={t('placeholders.category')}
              leading={<IconShield size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label={t('entity.description')}>
            <TextInput
              value={form.description}
              onChangeText={v => updateForm('description', v)}
              placeholder={t('placeholders.description')}
            />
          </Field>
        </View>

        {/* Vendor Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('entity.specifications')}</Text>
          
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.vendor')} required>
                <TextInput
                  value={form.deviceVendor}
                  onChangeText={v => updateForm('deviceVendor', v)}
                  placeholder={t('placeholders.vendor')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.profile_code')} required hint={t('placeholders.profile_code_hint')}>
                <TextInput
                  value={form.deviceProfile}
                  onChangeText={v => updateForm('deviceProfile', v)}
                  placeholder={t('placeholders.profile_code')}
                  leading={<IconActivity size={16} color={T.textFaint} />}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.min_firmware')}>
                <TextInput
                  value={form.deviceFirmware}
                  onChangeText={v => updateForm('deviceFirmware', v)}
                  placeholder={t('placeholders.firmware_version')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('entity.max_firmware')}>
                <TextInput
                  value={form.maxFirmware}
                  onChangeText={v => updateForm('maxFirmware', v)}
                  placeholder={t('placeholders.firmware_version')}
                />
              </Field>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel} disabled={loading}>{t('actions.cancel')}</Btn>
          <Btn
            variant="primary"
            style={{ flex: 2 }}
            disabled={!isFormValid || loading}
            onPress={handleCreate}
          >
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : t('actions.create_type')}
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
