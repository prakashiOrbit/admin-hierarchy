import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Avatar, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconUser, IconClock, IconCalendar, IconEdit, IconHeart, IconLocation, IconPhone, IconMail, IconPlus, IconAlert, IconShield } from '../../icons';
import { patientApi } from '../../services/api';
import { PatientActionsSheet } from '../../components/PatientActionsSheet';
import { PatientInfoSheet } from '../../components/PatientInfoSheet';
import { ConsentSheet } from '../../components/ConsentSheet';

export const PatientDetailScreen = ({ patientId: patientCode, onBack, onAssign, onEdit }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (!patientCode || !user?.orgName || !user?.hospitalCode) return;
    patientApi.getDetail(user.orgName, user.hospitalCode, patientCode, token)
      .then(setDetail)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [patientCode, user?.orgName, user?.hospitalCode, token]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (error || !detail) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || t('messages.patient_not_found')}</Text>
        <Btn variant="surface" style={{ marginTop: 16 }} onPress={onBack}>{t('actions.go_back')}</Btn>
      </View>
    );
  }

  const p = detail.patient || detail;
  const infos = detail.patientInfos || [];
  const vitals = infos.find(i => i.infoType === 'VITAL_SIGNS')?.infoData;
  let vitalsData = {};
  if (vitals) {
    try { vitalsData = typeof vitals === 'string' ? JSON.parse(vitals) : vitals; } catch {}
  }

  const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || t('entity.unknown');
  const initials = `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar initials={initials} size={64} />
            <View style={styles.profileInfo}>
              <Text style={styles.patientName}>{fullName}</Text>
              <Text style={styles.patientMrn}>{t('entity.patient_code_label', { code: p.patientCode })}</Text>
              <View style={styles.badgesRow}>
                <StatusPill status={p.status} />
              </View>
            </View>
          </View>
        </Card>

        <SectionHeader title={t('entity.clinical_profile')} />
        <View style={styles.vitalsGrid}>
          {[
            { l: t('entity.blood'), v: vitalsData.bloodGroup || '—', i: <IconHeart size={14} color={T.accent} /> },
            { l: t('entity.weight_label'), v: vitalsData.weight || '—', i: <IconClock size={14} color={T.accent} /> },
            { l: t('entity.height_label'), v: vitalsData.height || '—', i: <IconCalendar size={14} color={T.accent} /> },
          ].map((v, i) => (
            <View key={i} style={styles.vitalBox}>
              <View style={styles.vitalHeader}>{v.i}<Text style={styles.vitalLabel}>{v.l}</Text></View>
              <Text style={styles.vitalValue}>{v.v}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title={t('entity.contact_information')} />
        <Card style={styles.detailsCard}>
          {[
            { l: t('entity.email'), v: p.myContact?.email || '—', i: <IconMail size={16} color={T.textDim} /> },
            { l: t('entity.phone'), v: p.myContact?.phone || '—', i: <IconPhone size={16} color={T.textDim} /> },
            { l: t('entity.city'), v: p.myAddress?.city || '—', i: <IconLocation size={16} color={T.textDim} /> },
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
          <Btn variant="surface" style={styles.actionBtn} onPress={() => onEdit?.(detail)}>
            <IconEdit size={16} color={T.text} />
            <Text style={styles.btnText}>{t('actions.edit_profile')}</Text>
          </Btn>
          <Btn variant="surface" style={styles.actionBtn} onPress={onAssign}>
            <IconPlus size={16} color={T.text} />
            <Text style={styles.btnText}>{t('actions.assign_doctor')}</Text>
          </Btn>
        </View>

        <Btn variant="surface" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => setShowActions(true)}>
          <IconAlert size={16} color={T.text} />
          <Text style={styles.btnText}>{t('actions.discharge_transfer')}</Text>
        </Btn>

        <Btn variant="surface" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => setShowConsent(true)}>
          <IconShield size={16} color={T.text} />
          <Text style={styles.btnText}>{t('consent.title')}</Text>
        </Btn>

        <Btn variant="surface" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => setShowInfoSheet(true)}>
          <IconHeart size={16} color={T.text} />
          <Text style={styles.btnText}>{t('entity.health_records')}</Text>
        </Btn>

        <Btn variant="surface" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => onBack?.()}>
          <Text style={styles.btnText}>{t('actions.return_to_registry')}</Text>
        </Btn>
      </ScrollView>

      <ConsentSheet
        patient={p}
        visible={showConsent}
        onClose={() => setShowConsent(false)}
      />
      <PatientActionsSheet
        patient={p}
        visible={showActions}
        onClose={() => setShowActions(false)}
      />
      <PatientInfoSheet
        patientCode={p.patientCode}
        existingInfos={infos}
        visible={showInfoSheet}
        onClose={() => setShowInfoSheet(false)}
        onAdded={() => {
          patientApi.getDetail(user.orgName, user.hospitalCode, p.patientCode, token)
            .then(setDetail)
            .catch(() => {});
        }}
      />
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: T.error || '#ef4444', fontSize: 14, textAlign: 'center' },
  profileCard: { backgroundColor: 'rgba(16,185,129,0.03)', borderColor: 'rgba(16,185,129,0.1)', marginBottom: 24 },
  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  profileInfo: { flex: 1 },
  patientName: { fontSize: 18, fontWeight: '700', color: T.text },
  patientMrn: { fontSize: 12, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  vitalsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  vitalBox: { flex: 1, backgroundColor: T.surface, borderWidth: 1, borderColor: T.borderSoft, borderRadius: 12, padding: 12 },
  vitalHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  vitalLabel: { fontSize: 10, fontWeight: '700', color: T.textDim, letterSpacing: 0.5 },
  vitalValue: { fontSize: 16, fontWeight: '700', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
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
