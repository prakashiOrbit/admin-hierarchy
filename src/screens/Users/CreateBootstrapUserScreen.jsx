import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput as RNTextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { Card, SectionHeader } from '../../components/Shared';
import { IconUser, IconShield } from '../../icons';

const ALLOWED_ROLES = ['bootstrapRole', 'gatewayRole'];

export const CreateBootstrapUserScreen = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleRole = (role) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const isValid = userName.trim().length > 0 && selectedRoles.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      const payload = {
        userName: userName.trim(),
        userRoles: selectedRoles,
        ...(firstName.trim() && { firstName: firstName.trim() }),
        ...(lastName.trim() && { lastName: lastName.trim() }),
        ...(description.trim() && { description: description.trim() }),
      };
      await userApi.createBootstrapUser(user.orgName, payload, token);
      Alert.alert(
        t('common.success'),
        t('bootstrap_user.created_success'),
        [{ text: t('common.ok'), onPress: onSuccess }],
      );
    } catch (e) {
      Alert.alert(t('common.error'), e.data?.message || e.message || t('bootstrap_user.create_failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: T.accentSoft }]}>
            <IconShield size={18} color={T.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>{t('bootstrap_user.info_title')}</Text>
            <Text style={styles.infoText}>{t('bootstrap_user.info_body')}</Text>
          </View>
        </View>
      </Card>

      <SectionHeader title={t('bootstrap_user.section_identity')} />

      <Text style={styles.fieldLabel}>{t('bootstrap_user.username')} *</Text>
      <RNTextInput
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
        placeholder={t('bootstrap_user.username_placeholder')}
        placeholderTextColor={T.textFaint}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>{t('bootstrap_user.first_name')}</Text>
          <RNTextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t('bootstrap_user.first_name_placeholder')}
            placeholderTextColor={T.textFaint}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>{t('bootstrap_user.last_name')}</Text>
          <RNTextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder={t('bootstrap_user.last_name_placeholder')}
            placeholderTextColor={T.textFaint}
          />
        </View>
      </View>

      <Text style={styles.fieldLabel}>{t('bootstrap_user.description')}</Text>
      <RNTextInput
        style={[styles.input, styles.textarea]}
        value={description}
        onChangeText={setDescription}
        placeholder={t('bootstrap_user.description_placeholder')}
        placeholderTextColor={T.textFaint}
        multiline
        numberOfLines={3}
      />

      <SectionHeader title={t('bootstrap_user.section_roles')} />
      <Text style={styles.hintText}>{t('bootstrap_user.roles_hint')}</Text>

      <View style={styles.rolesRow}>
        {ALLOWED_ROLES.map(role => {
          const active = selectedRoles.includes(role);
          return (
            <TouchableOpacity
              key={role}
              style={[styles.roleChip, active && { backgroundColor: T.accent, borderColor: T.accent }]}
              onPress={() => toggleRole(role)}
            >
              <IconUser size={14} color={active ? '#fff' : T.textDim} />
              <Text style={[styles.roleChipText, active && { color: '#fff' }]}>{role}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Card style={styles.passwordCard}>
        <Text style={styles.passwordNote}>{t('bootstrap_user.password_auto')}</Text>
      </Card>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: isValid ? T.accent : T.borderSoft }]}
          onPress={handleSubmit}
          disabled={!isValid || saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.submitBtnText}>{t('bootstrap_user.submit')}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const createStyles = (T) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 40 },
  infoCard: { backgroundColor: T.accentSoft, borderColor: T.accent, marginBottom: 20 },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontSize: 13, fontWeight: '700', color: T.text, marginBottom: 4 },
  infoText: { fontSize: 12, color: T.textDim, lineHeight: 18 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: T.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: T.borderSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: T.text, backgroundColor: T.surface, marginBottom: 14 },
  textarea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  hintText: { fontSize: 12, color: T.textFaint, marginBottom: 10, marginTop: -4 },
  rolesRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: T.borderSoft, backgroundColor: T.surface },
  roleChipText: { fontSize: 13, fontWeight: '700', color: T.textDim },
  passwordCard: { backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)', marginBottom: 24 },
  passwordNote: { fontSize: 12, color: T.textDim, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: T.borderSoft },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: T.textDim },
  submitBtn: { flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
