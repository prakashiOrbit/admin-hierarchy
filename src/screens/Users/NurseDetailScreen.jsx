import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Avatar, Btn } from '../../components/Shared';
import { IconUser, IconEdit, IconMail, IconPhone, IconLocation, IconClock, IconBed } from '../../icons';
import { nurseApi } from '../../services/api';
import { StaffShiftSheet } from '../../components/StaffShiftSheet';
import { NurseActionsSheet } from '../../components/NurseActionsSheet';

export const NurseDetailScreen = ({ nurseId: nurseCode, onBack, onEdit }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [nurse, setNurse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShiftSheet, setShowShiftSheet] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (!nurseCode || !user?.orgName || !user?.hospitalCode) return;
    let cancelled = false;
    nurseApi.getDetail(user.orgName, user.hospitalCode, nurseCode, token)
      .then(data => { if (!cancelled) setNurse(data); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [nurseCode, user?.orgName, user?.hospitalCode, token]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (error || !nurse) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Nurse not found.'}</Text>
        <Btn variant="surface" style={{ marginTop: 16 }} onPress={onBack}>Go Back</Btn>
      </View>
    );
  }

  const n = nurse;
  const initials = `${n.firstName?.[0] || ''}${n.lastName?.[0] || ''}`.toUpperCase();
  const specialities = Array.isArray(n.nurseSpeciality) ? n.nurseSpeciality : [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar initials={initials} size={64} />
            <View style={styles.profileInfo}>
              <Text style={styles.nurseName}>{n.firstName} {n.lastName}</Text>
              <Text style={styles.nurseCode}>{n.nurseCode} · {n.nurseType || 'REGISTERED'}</Text>
              <View style={styles.badgesRow}>
                <View style={styles.expBadge}>
                  <Text style={styles.expText}>{n.nurseExperience}y Experience</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        <SectionHeader title="Clinical Profile" />
        <Card style={{ marginBottom: 24, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <IconUser size={16} color={T.accent} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 0.5 }}>SPECIALITIES</Text>
          </View>
          <Text style={{ fontSize: 14, color: T.text, lineHeight: 20 }}>
            {specialities.length > 0 ? specialities.join(', ') : '—'}
          </Text>
        </Card>

        <SectionHeader title="Contact Information" />
        <Card style={styles.detailsCard}>
          {[
            { l: 'Email', v: n.myContact?.email || '—', i: <IconMail size={16} color={T.textDim} /> },
            { l: 'Phone', v: n.myContact?.phone || '—', i: <IconPhone size={16} color={T.textDim} /> },
            { l: 'City', v: n.myAddress?.city || '—', i: <IconLocation size={16} color={T.textDim} /> },
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
          <Btn variant="surface" style={styles.actionBtn} onPress={() => onEdit?.(n)}>
            <IconEdit size={16} color={T.text} />
            <Text style={styles.btnText}>Edit Profile</Text>
          </Btn>
          <Btn variant="surface" style={styles.actionBtn} onPress={() => setShowShiftSheet(true)}>
            <IconClock size={16} color={T.text} />
            <Text style={styles.btnText}>Assign Shift</Text>
          </Btn>
        </View>

        <Btn variant="surface" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => setShowActions(true)}>
          <IconBed size={16} color={T.text} />
          <Text style={styles.btnText}>Nurse Actions</Text>
        </Btn>

        <Btn variant="surface" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => onBack?.()}>
          <Text style={styles.btnText}>Return to Staff List</Text>
        </Btn>
      </ScrollView>

      <StaffShiftSheet
        staffCode={n.nurseCode}
        staffType="nurse"
        staffName={`${n.firstName} ${n.lastName}`}
        visible={showShiftSheet}
        onClose={() => setShowShiftSheet(false)}
      />
      <NurseActionsSheet
        nurse={n}
        visible={showActions}
        onClose={() => setShowActions(false)}
      />
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: T.error || '#ef4444', fontSize: 14, textAlign: 'center' },
  profileCard: { backgroundColor: 'rgba(167,139,250,0.03)', borderColor: 'rgba(167,139,250,0.1)', marginBottom: 24 },
  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  profileInfo: { flex: 1 },
  nurseName: { fontSize: 18, fontWeight: '700', color: T.text },
  nurseCode: { fontSize: 12, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  expBadge: { backgroundColor: T.accentSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  expText: { fontSize: 10, color: T.accent, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
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
