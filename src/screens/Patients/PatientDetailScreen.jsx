import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, Avatar, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconHospital, IconUser, IconClock, IconCalendar, IconEdit, IconHeart, IconLocation, IconPhone, IconMail, IconPlus } from '../../icons';
import { PATIENTS } from '../../data/mock';

export const PatientDetailScreen = ({ patientId, onBack, onAssign }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const p = PATIENTS.find(x => x.id === patientId) || PATIENTS[0];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar name={p.name} size={64} />
            <View style={styles.profileInfo}>
              <Text style={styles.patientName}>{p.name}</Text>
              <Text style={styles.patientMrn}>MRN: {p.mrn}</Text>
              <View style={styles.badgesRow}>
                <StatusPill status={p.status} />
                {p.status === 'ADMITTED' && (
                  <View style={styles.locationBadge}>
                    <Text style={styles.locationText}>{p.ward} · Bed {p.bed}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Card>

        {/* Clinical Info */}
        <SectionHeader title="Clinical Profile" />
        <View style={styles.vitalsGrid}>
          {[
            { l: 'BLOOD', v: p.vitals.bloodGroup, i: <IconHeart size={14} color={T.accent} /> },
            { l: 'WEIGHT', v: p.vitals.weight, i: <IconClock size={14} color={T.accent} /> },
            { l: 'HEIGHT', v: p.vitals.height, i: <IconCalendar size={14} color={T.accent} /> },
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

        {/* Contact Details */}
        <SectionHeader title="Contact Information" />
        <Card style={styles.detailsCard}>
          {[
            { l: 'Email', v: p.email, i: <IconMail size={16} color={T.textDim} /> },
            { l: 'Phone', v: p.phone, i: <IconPhone size={16} color={T.textDim} /> },
            { l: 'Address', v: p.address, i: <IconLocation size={16} color={T.textDim} /> },
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

        {/* Actions */}
        <View style={styles.actionGrid}>
          <Btn variant="surface" style={styles.actionBtn}>
            <IconEdit size={16} color={T.text} />
            <Text style={styles.btnText}>Edit Profile</Text>
          </Btn>
          <Btn variant="surface" style={styles.actionBtn} onPress={onAssign}>
            <IconPlus size={16} color={T.text} />
            <Text style={styles.btnText}>Assign Doctor</Text>
          </Btn>
        </View>

        <Btn variant="primary" style={styles.secondaryBtn}>
          <IconClock size={16} color="#FFF" />
          <Text style={{ color: '#FFF', fontWeight: '600' }}>Vitals History</Text>
        </Btn>

        <Btn 
          variant="surface" 
          style={styles.secondaryBtn}
          onPress={() => onBack?.()}
        >
          <Text style={styles.btnText}>Return to Registry</Text>
        </Btn>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  profileCard: {
    backgroundColor: 'rgba(16,185,129,0.03)',
    borderColor: 'rgba(16,185,129,0.1)',
    marginBottom: 24,
  },
  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  profileInfo: { flex: 1 },
  patientName: { fontSize: 18, fontWeight: '700', color: T.text },
  patientMrn: { fontSize: 12, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  locationBadge: { backgroundColor: T.surface2, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  locationText: { fontSize: 10, color: T.textDim, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  vitalsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  vitalBox: { flex: 1, backgroundColor: T.surface, borderWidth: 1, borderColor: T.borderSoft, borderRadius: 12, padding: 12 },
  vitalHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  vitalLabel: { fontSize: 10, fontWeight: '700', color: T.textDim, letterSpacing: 0.5 },
  vitalValue: { fontSize: 16, fontWeight: '700', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  detailsCard: { backgroundColor: T.surface, marginBottom: 24 },
  detailItem: { flexDirection: 'row', gap: 12, padding: 14 },
  itemBorder: { borderTopWidth: 1, borderTopColor: T.borderSoft },
  detailIcon: { width: 16, color: T.textDim, marginTop: 2 },
  detailLabel: { fontSize: 10, fontWeight: '700', color: T.textFaint, letterSpacing: 0.5, marginBottom: 4 },
  detailValue: { fontSize: 13, color: T.text, lineHeight: 18 },
  actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', gap: 8, height: 44 },
  secondaryBtn: { flexDirection: 'row', gap: 8, height: 44, marginTop: 8 },
  btnText: { fontWeight: '600', color: T.text },
});
