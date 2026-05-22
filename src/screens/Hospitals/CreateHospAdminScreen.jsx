import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconUser, IconMail, IconBuilding, IconShield } from '../../icons';

export const CreateHospAdminScreen = ({ onCancel }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    orgName: user?.orgName || '',
    contactEmail: ''
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = form.userName && form.firstName && form.lastName && form.contactEmail;

  const handleCreate = async () => {
    if (!user?.orgName) {
      Alert.alert(t('alerts.error'), t('alerts.org_not_found'));
      return;
    }

    setLoading(true);
    try {
      await userApi.createHospAdmin(user.orgName, user.hospitalCode, form, token);
      Alert.alert(t('alerts.success'), t('alerts.hosp_admin_created'), [
        { text: t('actions.ok'), onPress: onCancel }
      ]);
    } catch (err) {
      Alert.alert(t('alerts.error'), err.message || t('alerts.create_hosp_admin_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Helper Banner */}
        <View style={styles.banner}>
          <IconShield color={T.accent} size={20} />
          <Text style={styles.bannerText}>
            {t('hosp_admin.invite_banner', { hospitalCode: user?.hospitalCode })}
          </Text>
        </View>

        {/* User Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('hosp_admin.identity_section')}</Text>
          
          <Field label={t('hosp_admin.username')}>
            <TextInput 
              value={form.userName} 
              onChangeText={(v) => updateForm('userName', v.toLowerCase())}
              placeholder={t('placeholders.username')}
              leading={<IconUser size={18} color={T.textDim} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('hosp_admin.first_name')}>
                <TextInput 
                  value={form.firstName} 
                  onChangeText={(v) => updateForm('firstName', v)}
                  placeholder="Apollo"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('hosp_admin.last_name')}>
                <TextInput 
                  value={form.lastName} 
                  onChangeText={(v) => updateForm('lastName', v)}
                  placeholder="Admin"
                />
              </Field>
            </View>
          </View>

          <Field label={t('hosp_admin.organization')}>
            <Card style={styles.disabledCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.disabledText}>{form.orgName}</Text>
              </View>
            </Card>
          </Field>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('hosp_admin.contact_section')}</Text>
          
          <Field label={t('hosp_admin.contact_email')}>
            <TextInput 
              value={form.contactEmail} 
              onChangeText={(v) => updateForm('contactEmail', v.toLowerCase())}
              placeholder="e.g. apollo_admin121@mailinator.com"
              leading={<IconMail size={18} color={T.textDim} />}
            />
          </Field>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {t('hosp_admin.info_text', { hospitalCode: user?.hospitalCode })}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="ghost" full style={{ flex: 1 }} onPress={onCancel} disabled={loading}>{t('actions.cancel')}</Btn>
          <Btn 
            full 
            style={{ flex: 1.5 }} 
            onPress={handleCreate} 
            disabled={!isFormValid || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : t('actions.create')}
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: T.accentSoft,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: T.text,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: T.textDim,
    letterSpacing: 1,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  disabledCard: {
    height: 44,
    justifyContent: 'center',
    backgroundColor: T.surface2,
    borderColor: T.borderSoft,
  },
  disabledText: {
    color: T.textDim,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoBox: {
    padding: 12,
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: T.border,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 11.5,
    color: T.textDim,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
