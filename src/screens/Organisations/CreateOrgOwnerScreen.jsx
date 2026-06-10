import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { organisationApi, getApiErrorMessage } from '../../services/api';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconShield, IconMail, IconBuilding } from '../../icons';

export const CreateOrgOwnerScreen = ({ onCancel, presetOrgName }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { token } = useAuth();
  const styles = createStyles(T);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    contactEmail: '',
    contactName: '',
  });

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail);
  const isFormValid = form.businessName.trim() && isEmailValid;

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        orgName: presetOrgName,
        businessName: form.businessName.trim(),
        orgType: 'HOSPITAL',
        myContact: {
          name: form.contactName.trim(),
          email: form.contactEmail.trim().toLowerCase(),
          phone: '',
        },
      };
      await organisationApi.create(payload, token);
      Alert.alert(t('common.success'), t('orgs.owner_created'), [
        { text: t('common.done'), onPress: onCancel },
      ]);
    } catch (err) {
      Alert.alert(t('common.error'), getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconShield color={T.accent} size={20} />
          <Text style={styles.bannerText}>{t('orgs.create_owner_banner')}</Text>
        </View>

        <Field label={t('orgs.org_name')}>
          <Card style={styles.disabledCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconBuilding size={16} color={T.textFaint} />
              <Text style={styles.disabledText}>{presetOrgName}</Text>
            </View>
          </Card>
        </Field>

        <Field label={t('orgs.business_name')}>
          <TextInput
            value={form.businessName}
            onChangeText={(v) => updateForm('businessName', v)}
            placeholder={t('orgs.business_name')}
          />
        </Field>

        <Field label={t('users.contact_name') || 'Contact Name'}>
          <TextInput
            value={form.contactName}
            onChangeText={(v) => updateForm('contactName', v)}
            placeholder={t('orgs.contact_name')}
          />
        </Field>

        <Field label={t('users.email')}>
          <TextInput
            value={form.contactEmail}
            onChangeText={(v) => updateForm('contactEmail', v.toLowerCase())}
            placeholder={t('users.email')}
            keyboardType="email-address"
            autoCapitalize="none"
            leading={<IconMail size={18} color={T.textDim} />}
          />
        </Field>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{t('dashboard.invite_org_admin')}</Text>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="ghost" full style={{ flex: 1 }} onPress={onCancel} disabled={loading}>
            {t('common.cancel')}
          </Btn>
          <Btn full style={{ flex: 1.5 }} onPress={handleCreate} disabled={!isFormValid || loading}>
            {loading ? t('common.loading') : t('orgs.create_owner')}
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },
  banner: {
    flexDirection: 'row',
    backgroundColor: T.accentSoft,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bannerText: { flex: 1, fontSize: 13, color: T.text, lineHeight: 18 },
  disabledCard: {
    height: 44, justifyContent: 'center',
    backgroundColor: T.surface2, borderColor: T.borderSoft,
  },
  disabledText: {
    color: T.textDim, fontSize: 14, fontFamily: 'monospace',
  },
  infoBox: {
    padding: 12, backgroundColor: T.surface,
    borderRadius: 12, borderWidth: 1,
    borderStyle: 'dashed', borderColor: T.border,
    marginTop: 4,
  },
  infoText: { fontSize: 11.5, color: T.textDim, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
