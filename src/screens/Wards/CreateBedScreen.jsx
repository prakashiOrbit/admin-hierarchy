import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconBed, IconGateway, IconShield } from '../../icons';
import { bedApi, gatewayApi } from '../../services/api';

export const CreateBedScreen = ({ onCancel, onSuccess, wardCode }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    bedCode: '',
    wardCode: wardCode || '',
    bedStatus: 'ACTIVE',
    gatewayCode: '',
  });
  const [saving, setSaving] = useState(false);
  const [gateways, setGateways] = useState([]);
  const [loadingGateways, setLoadingGateways] = useState(false);
  const [showGatewayPicker, setShowGatewayPicker] = useState(false);

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) return;
    setLoadingGateways(true);
    gatewayApi.listAll(user.orgName, user.hospitalCode, token)
      .then(data => setGateways(Array.isArray(data) ? data : []))
      .catch(() => setGateways([]))
      .finally(() => setLoadingGateways(false));
  }, []);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const isFormValid = form.bedCode && form.wardCode;

  const handleCreate = async () => {
    if (!isFormValid || !user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    try {
      await bedApi.create(user.orgName, user.hospitalCode, form, token);
      Alert.alert(t('alerts.success'), t('messages.bed_provisioned', { bedCode: form.bedCode, wardCode: form.wardCode }), [
        { text: t('actions.ok'), onPress: onSuccess || onCancel },
      ]);
    } catch (e) {
      Alert.alert(t('alerts.error'), e.message || t('alerts.create_bed_failed'));
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
            {t('ward.provision_bed_banner')}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('ward.bed_specifications')} />

          <Field label={t('ward.bed_identifier')} required>
            <TextInput
              value={form.bedCode}
              onChangeText={v => updateForm('bedCode', v.toUpperCase())}
              placeholder={t('placeholders.bed_code')}
              leading={<IconShield size={16} color={T.textFaint} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('ward.ward_unit')}>
                <Card style={styles.disabledCard} padding={12}>
                  <Text style={styles.disabledText}>{form.wardCode || '—'}</Text>
                </Card>
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('ward.initial_status')}>
                <Card style={styles.selectCard} padding={12}>
                  <Text style={styles.selectText}>{form.bedStatus}</Text>
                </Card>
              </Field>
            </View>
          </View>

          <Field label={t('ward.primary_gateway')}>
            <Card
              style={styles.selectCard}
              padding={12}
              onPress={() => setShowGatewayPicker(true)}
            >
              {loadingGateways ? (
                <ActivityIndicator size="small" color={T.accent} />
              ) : (
                <>
                  <IconGateway size={16} color={T.textFaint} />
                  <Text style={[styles.selectText, !form.gatewayCode && { color: T.textFaint }]}>
                    {form.gatewayCode || t('placeholders.gateway_code')}
                  </Text>
                  <Text style={styles.chevron}>▾</Text>
                </>
              )}
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
            {saving ? t('actions.provisioning') : t('actions.provision_bed')}
          </Btn>
        </View>
      </ScrollView>

      <Modal visible={showGatewayPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGatewayPicker(false)}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('ward.primary_gateway')}</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={() => { updateForm('gatewayCode', ''); setShowGatewayPicker(false); }}
              >
                <Text style={[styles.pickerOptionText, { color: T.textFaint }]}>{t('common.none')}</Text>
              </TouchableOpacity>
              {gateways.map(gw => (
                <TouchableOpacity
                  key={gw.gatewayCode}
                  style={[styles.pickerOption, form.gatewayCode === gw.gatewayCode && { backgroundColor: T.accentSoft }]}
                  onPress={() => { updateForm('gatewayCode', gw.gatewayCode); setShowGatewayPicker(false); }}
                >
                  <Text style={[styles.pickerOptionText, form.gatewayCode === gw.gatewayCode && { color: T.accent, fontWeight: '700' }]}>
                    {gw.gatewayCode}
                  </Text>
                  {gw.gatewayType ? (
                    <Text style={styles.pickerOptionSub}>{gw.gatewayType}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
              {!gateways.length && (
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
  row: { flexDirection: 'row', gap: 12 },
  selectCard: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.surface },
  selectText: { flex: 1, color: T.text, fontSize: 14 },
  chevron: { fontSize: 16, color: T.textDim },
  disabledCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface2, borderColor: T.borderSoft },
  disabledText: { color: T.textDim, fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 12, textAlign: 'center' },
  pickerOption: { padding: 14, borderRadius: 8, marginBottom: 4 },
  pickerOptionText: { fontSize: 14, color: T.text },
  pickerOptionSub: { fontSize: 11, color: T.textFaint, marginTop: 2 },
});
