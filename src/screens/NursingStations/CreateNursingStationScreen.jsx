import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconBed, IconBuilding } from '../../icons';
import { nursingStationApi } from '../../services/api';

export const CreateNursingStationScreen = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [stationNumber, setStationNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const isValid = stationNumber.trim().length > 0;

  const handleCreate = async () => {
    if (!isValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    try {
      await nursingStationApi.create(
        user.orgName,
        user.hospitalCode,
        { stationNumber: stationNumber.trim(), hospitalCode: user.hospitalCode },
        token,
      );
      Alert.alert(
        t('alerts.success'),
        t('nursingstation.created', { stationNumber: stationNumber.trim() }),
        [{ text: t('actions.ok'), onPress: onSuccess || onCancel }],
      );
    } catch (e) {
      Alert.alert(t('alerts.error'), e.message || t('nursingstation.create_failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconBed size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('nursingstation.create_banner', { hospitalCode: user?.hospitalCode })}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('nursingstation.configuration')} />

          <Field label={t('nursingstation.station_number')} required>
            <TextInput
              value={stationNumber}
              onChangeText={setStationNumber}
              autoCapitalize="characters"
              placeholder={t('nursingstation.station_number_placeholder')}
            />
          </Field>

          <Field label={t('ward.assigned_hospital')}>
            <Card style={styles.readOnlyCard} padding={12}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{user?.hospitalCode}</Text>
              </View>
            </Card>
          </Field>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>
            {t('actions.cancel')}
          </Btn>
          <Btn
            variant="primary"
            style={{ flex: 2 }}
            disabled={!isValid || saving}
            onPress={handleCreate}
          >
            {saving ? t('actions.creating') : t('actions.create')}
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
    flexDirection: 'row', backgroundColor: T.accentSoft, padding: 14,
    borderRadius: 12, gap: 12, alignItems: 'flex-start', marginBottom: 24,
  },
  bannerText: { flex: 1, fontSize: 13, color: T.text, lineHeight: 18 },
  section: { marginBottom: 24 },
  readOnlyCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface2, borderColor: T.borderSoft },
  readOnlyText: { color: T.textDim, fontSize: 14, fontFamily: 'monospace' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
