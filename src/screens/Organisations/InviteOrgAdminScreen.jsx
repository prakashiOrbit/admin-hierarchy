import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userApi, getApiErrorMessage } from '../../services/api';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { PermissionPicker } from '../../components/PermissionPicker';
import { IconUser, IconMail, IconBuilding, IconShield, IconChevron } from '../../icons';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'cs', label: 'Čeština' },
  { code: 'rm', label: 'Rumantsch' },
];

const ORG_ADMIN_PERMITS = [
  'permit.admin.users', 'permit.admin.roles', 'permit.admin.hospital', 'permit.admin.organisation',
  'permit.create.user', 'permit.create.role', 'permit.create.hospital',
  'permit.create.devicetype', 'permit.update.devicetype', 'permit.list.devicetype', 'permit.search.devicetype',
  'permit.create.devconfigorg', 'permit.get', 'permit.set'
];

export const InviteOrgAdminScreen = ({ onCancel }) => {
  const { t, i18n } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const [permMode, setPermMode] = useState('full');
  const [assignedRole, setAssignedRole] = useState(null);
  const [customPermissions, setCustomPermissions] = useState([...ORG_ADMIN_PERMITS]);
  const [form, setForm] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    orgName: user?.orgName || '',
    contactEmail: '',
    preferredLocale: (i18n.language || 'en').split('-')[0],
  });

  const [loading, setLoading] = useState(false);

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail);
  const isPermissionsValid = 
    permMode === 'full' || 
    (permMode === 'template' && assignedRole) || 
    (permMode === 'custom' && customPermissions && customPermissions.length > 0);

  const isFormValid = form.userName && form.firstName && form.lastName && isEmailValid && isPermissionsValid;

  const handleCreate = async () => {
    if (!user?.orgName) {
      Alert.alert(t('common.error'), t('messages.error_org_not_found'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        ...(permMode === 'template' && assignedRole ? { assignedRole } : {}),
        ...((permMode === 'custom' || permMode === 'full') && customPermissions ? { customPermissions } : {}),
      };
      await userApi.createOrgAdmin(user.orgName, payload, token);
      Alert.alert(t('common.success'), t('orgs.invite_sent'), [
        { text: t('common.done'), onPress: onCancel }
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
        {/* Helper Banner */}
        <View style={styles.banner}>
          <IconShield color={T.accent} size={20} />
          <Text style={styles.bannerText}>
            {t('dashboard.invite_org_admin')}
          </Text>
        </View>

        {/* User Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.profile').toUpperCase()}</Text>

          <Field label={t('auth.username')}>
            <TextInput
              value={form.userName}
              onChangeText={(v) => updateForm('userName', v.toLowerCase())}
              placeholder={t('auth.username_placeholder')}
              leading={<IconUser size={18} color={T.textDim} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t('users.first_name')}>
                <TextInput
                  value={form.firstName}
                  onChangeText={(v) => updateForm('firstName', v)}
                  placeholder={t('users.first_name')}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t('users.last_name')}>
                <TextInput
                  value={form.lastName}
                  onChangeText={(v) => updateForm('lastName', v)}
                  placeholder={t('users.last_name')}
                />
              </Field>
            </View>
          </View>

          <Field label={t('orgs.org_name')}>
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
          <Text style={styles.sectionTitle}>{t('users.contact_info').toUpperCase()}</Text>

          <Field label={t('users.email')}>
            <TextInput
              value={form.contactEmail}
              onChangeText={(v) => updateForm('contactEmail', v.toLowerCase())}
              placeholder={t('users.email')}
              leading={<IconMail size={18} color={T.textDim} />}
            />
          </Field>

          <Field label={t('users.preferred_locale')}>
            <Card style={styles.selectCard} onPress={() => setShowLocalePicker(true)}>
              <Text style={styles.selectText}>
                {LOCALES.find(l => l.code === form.preferredLocale)?.label || 'English'}
              </Text>
              <IconChevron size={18} color={T.textDim} />
            </Card>
          </Field>
        </View>

        {/* Permissions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('permissions.section', 'Permissions').toUpperCase()}</Text>
          <PermissionPicker
            mode={permMode}
            assignedRole={assignedRole}
            customPermissions={customPermissions}
            availablePermits={ORG_ADMIN_PERMITS}
            onModeChange={setPermMode}

            onAssignedRoleChange={setAssignedRole}
            onCustomPermissionsChange={setCustomPermissions}
            orgName={user?.orgName}
            token={token}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {t('dashboard.invite_org_admin')}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="ghost" full style={{ flex: 1 }} onPress={onCancel} disabled={loading}>{t('common.cancel')}</Btn>
          <Btn
            full
            style={{ flex: 1.5 }}
            onPress={handleCreate}
            disabled={!isFormValid || loading}
          >
            {loading ? t('common.loading') : t('orgs.invite_admin')}
          </Btn>
        </View>
      </ScrollView>

      {/* Locale Picker Modal */}
      <Modal visible={showLocalePicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLocalePicker(false)}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('users.select_locale')}</Text>
            {LOCALES.map((loc) => (
              <TouchableOpacity
                key={loc.code}
                style={[styles.localeOption, form.preferredLocale === loc.code && { backgroundColor: T.accentSoft }]}
                onPress={() => { updateForm('preferredLocale', loc.code); setShowLocalePicker(false); }}
              >
                <Text style={[styles.localeOptionText, form.preferredLocale === loc.code && { color: T.accent, fontWeight: '700' }]}>
                  {loc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        </TouchableOpacity>
      </Modal>
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
  selectCard: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.surface,
    paddingHorizontal: 12,
  },
  selectText: {
    color: T.text,
    fontSize: 14,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  localeOption: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  localeOptionText: {
    fontSize: 14,
    color: T.text,
  },
});
