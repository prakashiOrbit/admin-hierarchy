import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn, SectionHeader } from '../../components/Shared';
import { IconUser, IconMail, IconPhone, IconBuilding } from '../../icons';
import { userApi } from '../../services/api';

export const EditAdminScreen = ({ user, onCancel, onSave }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user: authUser, token } = useAuth();
  const styles = createStyles(T);

  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    contactEmail: user.contactEmail || user.email || '',
    contactPhone: user.contactPhone || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const isValid = form.firstName.trim() || form.lastName.trim();

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateAdmin(
        authUser.orgName,
        user.userName,
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          contactEmail: form.contactEmail.trim(),
          contactPhone: form.contactPhone.trim(),
        },
        token
      );
      Alert.alert(t('common.success'), t('users.admin_updated'), [
        { text: t('common.done'), onPress: () => onSave?.() },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('users.update_failed'));
    } finally {
      setSaving(false);
    }
  };

  const role = user.userRoles?.[0] || user.role || '';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconUser size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('users.editing')} <Text style={{ fontWeight: '700' }}>{user.userName}</Text>
            {role ? ` · ${role}` : ''}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('users.personal_info')} />

          <Field label={t('auth.username')}>
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{user.userName}</Text>
              </View>
            </Card>
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('users.first_name')}>
                <TextInput
                  value={form.firstName}
                  onChangeText={v => set('firstName', v)}
                  placeholder="First"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('users.last_name')}>
                <TextInput
                  value={form.lastName}
                  onChangeText={v => set('lastName', v)}
                  placeholder="Last"
                />
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('users.contact_location')} />

          <Field label={t('users.email')}>
            <TextInput
              value={form.contactEmail}
              onChangeText={v => set('contactEmail', v.toLowerCase())}
              placeholder="admin@org.com"
              keyboardType="email-address"
              leading={<IconMail size={16} color={T.textFaint} />}
            />
          </Field>

          <Field label={t('users.phone')}>
            <TextInput
              value={form.contactPhone}
              onChangeText={v => set('contactPhone', v)}
              placeholder="+91 00000 00000"
              keyboardType="phone-pad"
              leading={<IconPhone size={16} color={T.textFaint} />}
            />
          </Field>
        </View>

        <View style={styles.actionRow}>
          <Btn variant="ghost" style={{ flex: 1 }} onPress={onCancel} disabled={saving}>
            {t('common.cancel')}
          </Btn>
          <Btn style={{ flex: 1.5 }} onPress={handleSave} disabled={!isValid || saving}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : t('users.save_changes')}
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
  row: { flexDirection: 'row', gap: 12 },
  readOnlyCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface2, borderColor: T.borderSoft },
  readOnlyText: { color: T.textDim, fontSize: 14, fontFamily: 'monospace' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
