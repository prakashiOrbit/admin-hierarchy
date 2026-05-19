import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconHospital, IconUser, IconMail, IconLocation, IconPhone, IconBed, IconDoor, IconPulse, IconBack } from '../../icons';

export const HospitalDetailScreen = ({ hospital, onBack }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  if (!hospital) return null;

  const stats = [
    { label: 'Beds', value: hospital.beds || 0, icon: <IconBed size={16} /> },
    { label: 'Wards', value: hospital.wards || 0, icon: <IconDoor size={16} /> },
    { label: 'Devices', value: hospital.devices || 0, icon: <IconPulse size={16} /> },
  ];

  const address = hospital.myAddress || {};
  const contact = hospital.myContact || {};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.iconBox}>
              <IconHospital size={32} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hospName}>{hospital.hospitalName}</Text>
              <Text style={styles.hospCode}>{hospital.hospitalCode}</Text>
            </View>
            <StatusPill status={hospital.status || 'ACTIVE'} />
          </View>
          
          {hospital.description && (
            <Text style={styles.description}>{hospital.description}</Text>
          )}

          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statBox}>
                <View style={styles.statIcon}>{s.icon}</View>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Contact Information */}
        <View style={styles.section}>
          <SectionHeader title="Primary Contact" />
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <IconUser size={18} color={T.textDim} />
              <View>
                <Text style={styles.infoLabel}>Owner / Admin</Text>
                <Text style={styles.infoValue}>{contact.name || 'Not assigned'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <IconMail size={18} color={T.textDim} />
              <View>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{contact.email || '—'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <IconPhone size={18} color={T.textDim} />
              <View>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{contact.phone || '—'}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <SectionHeader title="Location" />
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <IconLocation size={18} color={T.textDim} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Physical Address</Text>
                <Text style={styles.infoValue}>
                  {address.street1}{address.street1 ? '\n' : ''}
                  {address.city}, {address.state} {address.pincode}{'\n'}
                  {address.country}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onBack}>
            Back to List
          </Btn>
          <Btn variant="primary" style={{ flex: 1 }} onPress={() => console.log('Manage Hospital')}>
            Manage Console
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: { marginBottom: 24, backgroundColor: T.surface },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  iconBox: { 
    width: 64, 
    height: 64, 
    borderRadius: 16, 
    backgroundColor: '#14B8A6', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  hospName: { fontSize: 20, fontWeight: '700', color: T.text },
  hospCode: { fontSize: 13, color: T.textDim, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  description: { fontSize: 13, color: T.textDim, lineHeight: 20, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20, borderTopWidth: 1, borderTopColor: T.borderSoft, paddingTop: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statIcon: { marginBottom: 4, opacity: 0.6 },
  statLabel: { fontSize: 10, color: T.textFaint, fontWeight: '600', textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: '700', color: T.text, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  section: { marginBottom: 24 },
  infoCard: { padding: 0, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 16 },
  infoLabel: { fontSize: 11, color: T.textDim, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: T.text, lineHeight: 20 },
  divider: { height: 1, backgroundColor: T.borderSoft, marginLeft: 48 },
  actionRow: { flexDirection: 'row', gap: 12 },
});
