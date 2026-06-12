import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconDoor, IconBuilding, IconTrash, IconCheck, IconUpload } from '../../icons';
import { wardApi, svgApi } from '../../services/api';
import DocumentPicker from 'react-native-document-picker';

const WARD_TYPES = ['ICU', 'GENERAL', 'EMERGENCY', 'PEDIATRICS', 'MATERNITY', 'SURGICAL'];

export const EditWardScreen = ({ ward, onCancel, onSave, onDelete }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [form, setForm] = useState({
    wardName: ward.wardName || '',
    wardType: ward.wardType || 'ICU',
    numberOfBeds: String(ward.numberOfBeds ?? ''),
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [svgStatus, setSvgStatus] = useState('loading'); // 'loading' | 'found' | 'not_found'
  const [uploading, setUploading] = useState(false);

  const hasWardPerm = user?.roles?.includes('permit.admin.ward') || user?.roles?.includes('HOSP_OWNER');

  useEffect(() => {
    if (!hasWardPerm) { setSvgStatus('not_found'); return; }
    svgApi.get(user.orgName, user.hospitalCode, ward.wardCode, token)
      .then(res => setSvgStatus(res?.svgFile ? 'found' : 'not_found'))
      .catch(() => setSvgStatus('not_found'));
  }, []);

  const handlePickAndUpload = async () => {
    let file;
    try {
      file = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.plainText, 'image/svg+xml'],
      });
    } catch (e) {
      if (DocumentPicker.isCancel(e)) return;
      Alert.alert(t('alerts.error'), t('ward.floor_plan_file_invalid'));
      return;
    }

    setUploading(true);
    try {
      const isReplace = svgStatus === 'found';
      if (isReplace) {
        await svgApi.replace(user.orgName, user.hospitalCode, ward.wardCode, file.uri, file.name, token);
      } else {
        await svgApi.upload(user.orgName, user.hospitalCode, ward.wardCode, file.uri, file.name, token);
      }
      setSvgStatus('found');
      Alert.alert(
        t('alerts.success'),
        isReplace ? t('ward.floor_plan_replace_success') : t('ward.floor_plan_upload_success'),
      );
    } catch (e) {
      Alert.alert(t('alerts.error'), t('ward.floor_plan_upload_failed'));
    } finally {
      setUploading(false);
    }
  };

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const isFormValid = form.wardName && form.numberOfBeds;

  const handleSave = async () => {
    setSaving(true);
    try {
      await wardApi.update(user.orgName, user.hospitalCode, ward.wardId, form, token);
      Alert.alert(t('alerts.success'), t('alerts.ward_updated'), [
        { text: t('actions.ok'), onPress: () => onSave({ ...ward, ...form }) },
      ]);
    } catch (e) {
      Alert.alert(t('alerts.error'), e.message || t('alerts.update_failed'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      t('actions.delete_ward'),
      t('messages.confirm_delete_ward', { wardName: ward.wardName }),
      [
        { text: t('actions.cancel'), style: 'cancel' },
        {
          text: t('actions.delete'), style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await wardApi.delete(user.orgName, user.hospitalCode, ward.wardId, token);
              onDelete?.();
            } catch (e) {
              Alert.alert(t('alerts.error'), e.message || t('alerts.delete_failed'));
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconDoor size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('ward.editing_banner', { code: ward.wardCode })}. {t('ward.code_immutable')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ward.identity_section')}</Text>

          <Field label={t('ward.ward_code')}>
            <Card style={styles.readOnlyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{ward.wardCode}</Text>
              </View>
            </Card>
          </Field>

          <Field label={t('ward.ward_name')} required>
            <TextInput
              value={form.wardName}
              onChangeText={v => updateForm('wardName', v)}
              placeholder={t('placeholders.ward_name')}
            />
          </Field>

          <Field label={t('ward.ward_type')}>
            <View style={styles.typeGrid}>
              {WARD_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, form.wardType === t && styles.typeBtnActive]}
                  onPress={() => updateForm('wardType', t)}
                >
                  <Text style={[styles.typeText, form.wardType === t && styles.typeTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label={t('ward.estimated_beds')} required>
            <TextInput
              value={form.numberOfBeds}
              onChangeText={v => updateForm('numberOfBeds', v.replace(/[^0-9]/g, ''))}
              placeholder={t('placeholders.beds_count')}
              keyboardType="numeric"
            />
          </Field>
        </View>

        {hasWardPerm && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('ward.floor_plan_section')}</Text>
            <Card style={styles.floorPlanCard}>
              <View style={styles.floorPlanRow}>
                <View style={[
                  styles.floorPlanBadge,
                  { backgroundColor: svgStatus === 'found' ? T.goodSoft : T.surface2 },
                ]}>
                  {svgStatus === 'found'
                    ? <IconCheck size={16} color={T.good} />
                    : <IconUpload size={16} color={T.textFaint} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.floorPlanLabel}>
                    {svgStatus === 'loading'
                      ? t('common.loading')
                      : svgStatus === 'found'
                        ? t('ward.floor_plan_uploaded')
                        : t('ward.floor_plan_none')}
                  </Text>
                  <Text style={styles.floorPlanHint}>{ward.wardCode}</Text>
                </View>
                <Btn
                  variant={svgStatus === 'found' ? 'surface' : 'primary'}
                  size="sm"
                  onPress={handlePickAndUpload}
                  disabled={uploading || svgStatus === 'loading'}
                  style={styles.floorPlanBtn}
                >
                  {uploading
                    ? <ActivityIndicator size="small" color={svgStatus === 'found' ? T.textDim : '#fff'} />
                    : svgStatus === 'found'
                      ? t('ward.replace_floor_plan')
                      : t('ward.upload_floor_plan')}
                </Btn>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.actionRow}>
          <Btn variant="ghost" style={{ flex: 1 }} onPress={onCancel} disabled={saving || deleting}>
            {t('actions.cancel')}
          </Btn>
          <Btn
            style={{ flex: 1.5 }}
            onPress={handleSave}
            disabled={!isFormValid || saving || deleting}
          >
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : t('actions.save_changes')}
          </Btn>
        </View>

        <Btn
          variant="surface"
          style={styles.deleteBtn}
          onPress={confirmDelete}
          disabled={saving || deleting}
        >
          <IconTrash size={16} color={T.bad} />
          <Text style={[styles.deleteBtnText, { color: T.bad }]}>
            {deleting ? t('actions.deleting') : t('actions.delete_ward')}
          </Text>
        </Btn>
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
  sectionTitle: { fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 16 },
  readOnlyCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface2, borderColor: T.borderSoft },
  readOnlyText: { color: T.textDim, fontSize: 14, fontFamily: 'monospace' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: T.borderSoft, backgroundColor: T.surface,
  },
  typeBtnActive: { backgroundColor: T.accent, borderColor: T.accent },
  typeText: { fontSize: 12, color: T.text, fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  floorPlanCard: { paddingVertical: 12 },
  floorPlanRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  floorPlanBadge: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  floorPlanLabel: { fontSize: 13, fontWeight: '600', color: T.text },
  floorPlanHint: { fontSize: 11, color: T.textFaint, marginTop: 2, fontFamily: 'monospace' },
  floorPlanBtn: { paddingHorizontal: 10 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  deleteBtn: {
    marginTop: 16, flexDirection: 'row', gap: 8,
    borderWidth: 1, borderColor: T.bad + '40',
    backgroundColor: T.bad + '0D',
  },
  deleteBtnText: { fontSize: 14, fontWeight: '600' },
});
