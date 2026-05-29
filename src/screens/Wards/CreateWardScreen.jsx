import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconDoor, IconBuilding } from '../../icons';
import { wardApi } from '../../services/api';

export const CreateWardScreen = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    wardCode: '',
    wardName: '',
    wardType: 'ICU',
    numberOfBeds: '',
  });
  const [saving, setSaving] = useState(false);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const isFormValid = form.wardCode && form.wardName && form.numberOfBeds;

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    try {
      await wardApi.create(user.orgName, user.hospitalCode, form, token);
      Alert.alert(t('alerts.success'), t('messages.ward_created', { wardCode: form.wardCode }), [
        { text: t('actions.ok'), onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert(t('alerts.error'), e.message || t('alerts.create_ward_failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconDoor size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('ward.provision_ward_banner', { hospitalCode: user?.hospitalCode })}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('ward.ward_configuration')} />

          <Field label={t('ward.ward_code')} required>
            <TextInput
              value={form.wardCode}
              onChangeText={v => updateForm('wardCode', v)}
              autoCapitalize="characters"
              placeholder={t('placeholders.ward_code')}
            />
          </Field>

          <Field label={t('ward.ward_name')} required>
            <TextInput
              value={form.wardName}
              onChangeText={v => updateForm('wardName', v)}
              placeholder={t('placeholders.ward_name')}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('ward.ward_type')} required>
                <Card style={styles.selectCard} padding={12}>
                  <Text style={styles.selectText}>{form.wardType}</Text>
                </Card>
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('ward.estimated_beds')} required>
                <TextInput
                  value={form.numberOfBeds}
                  onChangeText={v => updateForm('numberOfBeds', v.replace(/[^0-9]/g, ''))}
                  placeholder={t('placeholders.beds_count')}
                  keyboardType="numeric"
                />
              </Field>
            </View>
          </View>

          <Field label={t('ward.assigned_hospital')}>
            <Card style={styles.disabledCard} padding={12}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.disabledText}>{user?.hospitalCode}</Text>
              </View>
            </Card>
          </Field>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>{t('actions.cancel')}</Btn>
          <Btn
            variant="primary"
            style={{ flex: 2 }}
            disabled={!isFormValid || saving}
            onPress={handleCreate}
          >
            {saving ? t('actions.creating') : t('actions.create_ward')}
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
  row: { flexDirection: 'row', gap: 12 },
  selectCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface },
  selectText: { color: T.text, fontSize: 14 },
  disabledCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface2, borderColor: T.borderSoft },
  disabledText: { color: T.textDim, fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
