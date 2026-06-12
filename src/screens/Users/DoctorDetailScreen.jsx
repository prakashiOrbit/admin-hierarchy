import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Avatar, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconStethoscope, IconUser, IconCalendar, IconEdit, IconLocation, IconPhone, IconMail, IconPlus, IconClock } from '../../icons';
import { doctorApi } from '../../services/api';
import { StaffShiftSheet } from '../../components/StaffShiftSheet';
import { BulkAssignSheet } from '../../components/BulkAssignSheet';

export const DoctorDetailScreen = ({ doctorId: doctorCode, onBack, onAssign, onEdit }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShiftSheet, setShowShiftSheet] = useState(false);
  const [showBulkAssign, setShowBulkAssign] = useState(false);

  useEffect(() => {
    if (!doctorCode || !user?.orgName || !user?.careSiteCode) return;
    let cancelled = false;
    doctorApi.getDetail(user.orgName, user.careSiteCode, doctorCode, token)
      .then(data => { if (!cancelled) setDoctor(data); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [doctorCode, user?.orgName, user?.careSiteCode, token]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (error || !doctor) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || t('messages.doctor_not_found')}</Text>
        <Btn variant="surface" style={{ marginTop: 16 }} onPress={onBack}>{t('actions.go_back')}</Btn>
      </View>
    );
  }

  const d = doctor;
  const initials = `${d.firstName?.[0] || ''}${d.lastName?.[0] || ''}`.toUpperCase();
  const specialities = Array.isArray(d.doctorSpeciality) ? d.doctorSpeciality : [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar initials={initials} size={64} />
            <View style={styles.profileInfo}>
              <Text style={styles.doctorName}>{t('messages.dr_name', { firstName: d.firstName, lastName: d.lastName })}</Text>
              <Text style={styles.doctorCode}>{d.doctorCode} · {d.doctorType || t('entity.doctor')}</Text>
              <View style={styles.badgesRow}>
                <View style={styles.expBadge}>
                  <Text style={styles.expText}>{t('entity.years_experience', { count: d.doctorExperience })}</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        <SectionHeader title={t('entity.clinical_profile')} />
        <Card style={{ marginBottom: 24, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <IconStethoscope size={16} color={T.accent} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 0.5 }}>{t('entity.specialties')}</Text>
          </View>
          <Text style={{ fontSize: 14, color: T.text, lineHeight: 20 }}>
            {specialities.length > 0 ? specialities.join(', ') : '—'}
          </Text>
        </Card>

        <View style={styles.vitalsGrid}>
          {[
            { l: t('entity.born'), v: d.birthDate || '—', i: <IconCalendar size={14} color={T.accent} /> },
            { l: t('entity.gender'), v: d.gender || '—', i: <IconUser size={14} color={T.accent} /> },
          ].map((v, i) => (
            <View key={i} style={styles.vitalBox}>
              <View style={styles.vitalHeader}>
                {v.i}
                <Text style={styles.vitalLabel}>{v.l}</Text>
              </View>
              <Text style={styles.vitalValue}>{v.v}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title={t('entity.contact_information')} />
        <Card style={styles.detailsCard}>
          {[
            { l: t('entity.work_email'), v: d.myContact?.email || '—', i: <IconMail size={16} color={T.textDim} /> },
            { l: t('entity.direct_phone'), v: d.myContact?.phone || '—', i: <IconPhone size={16} color={T.textDim} /> },
            { l: t('entity.city'), v: d.myAddress?.city || '—', i: <IconLocation size={16} color={T.textDim} /> },
          ].map((row, i) => (
            <View key={i} style={[styles.detailItem, i > 0 && styles.itemBorder]}>
              <View style={styles.detailIcon}>{row.i}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>{row.l}</Text>
                <Text style={styles.detailValue}>{row.v}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={styles.actionGrid}>
          <Btn variant="surface" style={styles.actionBtn} onPress={() => onEdit?.(d)}>
            <IconEdit size={16} color={T.text} />
            <Text style={styles.btnText}>{t('actions.edit_profile')}</Text>
          </Btn>
          <Btn variant="surface" style={styles.actionBtn} onPress={() => setShowBulkAssign(true)}>
            <IconPlus size={16} color={T.text} />
            <Text style={styles.btnText}>{t('actions.assign_patients')}</Text>
          </Btn>
        </View>

        <Btn variant="surface" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => setShowShiftSheet(true)}>
          <IconClock size={16} color={T.text} />
          <Text style={styles.btnText}>{t('actions.assign_to_shift')}</Text>
        </Btn>

        <Btn variant="surface" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => onBack?.()}>
          <Text style={styles.btnText}>{t('actions.return_to_staff_list')}</Text>
        </Btn>
      </ScrollView>

      <StaffShiftSheet
        staffCode={d.doctorCode}
        staffType="doctor"
        staffName={t('messages.dr_name', { firstName: d.firstName, lastName: d.lastName })}
        visible={showShiftSheet}
        onClose={() => setShowShiftSheet(false)}
      />
      <BulkAssignSheet
        doctorCode={d.doctorCode}
        doctorName={t('messages.dr_name', { firstName: d.firstName, lastName: d.lastName })}
        visible={showBulkAssign}
        onClose={() => setShowBulkAssign(false)}
      />
    </View>

  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: T.error || '#ef4444', fontSize: 14, textAlign: 'center' },
  profileCard: { backgroundColor: 'rgba(59,130,246,0.03)', borderColor: 'rgba(59,130,246,0.1)', marginBottom: 24 },
  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  profileInfo: { flex: 1 },
  doctorName: { fontSize: 18, fontWeight: '700', color: T.text },
  doctorCode: { fontSize: 12, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  expBadge: { backgroundColor: T.accentSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  expText: { fontSize: 10, color: T.accent, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  vitalsGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  vitalBox: { flex: 1, backgroundColor: T.surface, borderWidth: 1, borderColor: T.borderSoft, borderRadius: 12, padding: 12 },
  vitalHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  vitalLabel: { fontSize: 10, fontWeight: '700', color: T.textDim, letterSpacing: 0.5 },
  vitalValue: { fontSize: 14, fontWeight: '700', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  detailsCard: { backgroundColor: T.surface, marginBottom: 24 },
  detailItem: { flexDirection: 'row', gap: 12, padding: 14 },
  itemBorder: { borderTopWidth: 1, borderTopColor: T.borderSoft },
  detailIcon: { width: 16, marginTop: 2 },
  detailLabel: { fontSize: 10, fontWeight: '700', color: T.textFaint, letterSpacing: 0.5, marginBottom: 4 },
  detailValue: { fontSize: 13, color: T.text, lineHeight: 18 },
  actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', gap: 8, height: 44 },
  secondaryBtn: { flexDirection: 'row', gap: 8, height: 44 },
  btnText: { fontWeight: '600', color: T.text },
});
