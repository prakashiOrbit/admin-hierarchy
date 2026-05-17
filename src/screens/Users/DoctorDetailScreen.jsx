import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, Avatar, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconStethoscope, IconUser, IconClock, IconCalendar, IconEdit, IconActivity, IconLocation, IconPhone, IconMail, IconKey, IconPlus } from '../../icons';
import { DOCTORS } from '../../data/mock';

export const DoctorDetailScreen = ({ doctorId, onBack, onAssign }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const d = DOCTORS.find(x => x.id === doctorId) || DOCTORS[0];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar name={d.firstName} size={64} />
            <View style={styles.profileInfo}>
              <Text style={styles.doctorName}>Dr. {d.firstName} {d.lastName}</Text>
              <Text style={styles.doctorCode}>{d.code} · {d.type}</Text>
              <View style={styles.badgesRow}>
                <StatusPill status={d.status} />
                <View style={styles.expBadge}>
                  <Text style={styles.expText}>{d.experience}y Experience</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Professional Summary */}
        <SectionHeader title="Clinical Profile" />
        <Card style={{ marginBottom: 24, padding: 16 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <IconStethoscope size={16} color={T.accent} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 0.5 }}>SPECIALTIES</Text>
            </View>
            <Text style={{ fontSize: 14, color: T.text, lineHeight: 20 }}>{d.speciality.join(', ')}</Text>
          </View>
        </Card>

        <View style={styles.vitalsGrid}>
          {[
            { l: 'BORN', v: d.birthDate, i: <IconCalendar size={14} color={T.accent} /> },
            { l: 'GENDER', v: d.gender, i: <IconUser size={14} color={T.accent} /> },
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
            { l: 'Work Email', v: d.email, i: <IconMail size={16} color={T.textDim} /> },
            { l: 'Direct Phone', v: d.phone, i: <IconPhone size={16} color={T.textDim} /> },
            { l: 'City/State', v: `${d.city}, ${d.state}`, i: <IconLocation size={16} color={T.textDim} /> },
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
            <Text style={styles.btnText}>Assign Patient</Text>
          </Btn>
        </View>

        <Btn variant="primary" style={styles.secondaryBtn}>
          <IconKey size={16} color="#FFF" />
          <Text style={{ color: '#FFF', fontWeight: '600', marginLeft: 8 }}>Credentials</Text>
        </Btn>

        <Btn 
          variant="surface" 
          style={styles.secondaryBtn}
          onPress={() => onBack?.()}
        >
          <Text style={styles.btnText}>Return to Staff List</Text>
        </Btn>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  profileCard: {
    backgroundColor: 'rgba(59,130,246,0.03)',
    borderColor: 'rgba(59,130,246,0.1)',
    marginBottom: 24,
  },
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
  detailIcon: { width: 16, color: T.textDim, marginTop: 2 },
  detailLabel: { fontSize: 10, fontWeight: '700', color: T.textFaint, letterSpacing: 0.5, marginBottom: 4 },
  detailValue: { fontSize: 13, color: T.text, lineHeight: 18 },
  actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', gap: 8, height: 44 },
  secondaryBtn: { flexDirection: 'row', gap: 8, height: 44, marginTop: 8 },
  btnText: { fontWeight: '600', color: T.text },
});
