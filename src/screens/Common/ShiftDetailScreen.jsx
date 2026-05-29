import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Avatar, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconClock, IconEdit, IconDoor, IconUser, IconStethoscope, IconPlus, IconTrash } from '../../icons';
import { shiftApi } from '../../services/api';
import { ShiftStaffSheet } from '../../components/ShiftStaffSheet';

export const ShiftDetailScreen = ({ shiftId: shiftCode, onBack, onEdit }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNurseSheet, setShowNurseSheet] = useState(false);
  const [showDoctorSheet, setShowDoctorSheet] = useState(false);
  const [unassigning, setUnassigning] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!shiftCode || !user?.orgName || !user?.hospitalCode) return;
    try {
      const data = await shiftApi.getDetail(user.orgName, user.hospitalCode, shiftCode, token);
      setShift(data);
    } catch (e) {
      setError(e.message || 'Failed to load shift.');
    } finally {
      setLoading(false);
    }
  }, [shiftCode, user?.orgName, user?.hospitalCode, token]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const formatTime = (dt) => {
    if (!dt) return '—';
    if (Array.isArray(dt)) {
      // Jackson LocalDateTime array: [year, month, day, hour, minute, second?, nano?]
      const h = dt[3] ?? 0;
      const min = String(dt[4] ?? 0).padStart(2, '0');
      const period = h >= 12 ? 'PM' : 'AM';
      return `${h % 12 || 12}:${min} ${period}`;
    }
    if (typeof dt === 'string') {
      const m = dt.match(/T(\d{2}):(\d{2})/);
      if (m) {
        const h = parseInt(m[1], 10);
        const period = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${m[2]} ${period}`;
      }
    }
    try {
      const d = new Date(dt);
      if (isNaN(d.getTime())) return String(dt);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return String(dt); }
  };

  const confirmUnassignNurse = (nurse) => {
    Alert.alert(
      'Unassign Nurse',
      `Remove ${nurse.firstName} ${nurse.lastName} from this shift?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unassign', style: 'destructive',
          onPress: async () => {
            setUnassigning(nurse.nurseCode);
            try {
              await shiftApi.unassignNurse(user.orgName, user.hospitalCode, { nurseCode: nurse.nurseCode, shiftCode }, token);
              fetchDetail();
            } catch (e) { Alert.alert('Error', e.message || 'Failed.'); }
            finally { setUnassigning(null); }
          },
        },
      ]
    );
  };

  const confirmUnassignDoctor = (doctor) => {
    Alert.alert(
      'Unassign Doctor',
      `Remove Dr. ${doctor.firstName} ${doctor.lastName} from this shift?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unassign', style: 'destructive',
          onPress: async () => {
            setUnassigning(doctor.doctorCode);
            try {
              await shiftApi.unassignDoctor(user.orgName, user.hospitalCode, { doctorCode: doctor.doctorCode, shiftCode }, token);
              fetchDetail();
            } catch (e) { Alert.alert('Error', e.message || 'Failed.'); }
            finally { setUnassigning(null); }
          },
        },
      ]
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (error || !shift) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Shift not found.'}</Text>
        <Btn variant="surface" style={{ marginTop: 16 }} onPress={onBack}>Go Back</Btn>
      </View>
    );
  }

  const nurses = Array.isArray(shift.nurses) ? shift.nurses : [];
  const doctors = Array.isArray(shift.doctors) ? shift.doctors : [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: T.accentSoft }]}>
              <IconClock size={22} color={T.accent} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.shiftName}>{shift.shiftName || shift.shiftCode}</Text>
              <Text style={styles.shiftCode}>{shift.shiftCode}</Text>
              <View style={styles.badgeRow}>
                <StatusPill status={shift.status} />
              </View>
            </View>
          </View>

          <View style={styles.metaGrid}>
            {[
              { l: 'WARD', v: shift.wardCode || '—', icon: <IconDoor size={13} color={T.textDim} /> },
              { l: 'START', v: formatTime(shift.startTime), icon: <IconClock size={13} color={T.textDim} /> },
              { l: 'END', v: formatTime(shift.endTime), icon: <IconClock size={13} color={T.textDim} /> },
            ].map((m, i) => (
              <View key={i} style={styles.metaItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  {m.icon}
                  <Text style={styles.metaLabel}>{m.l}</Text>
                </View>
                <Text style={styles.metaValue}>{m.v}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Btn variant="surface" style={styles.editBtn} onPress={() => onEdit?.(shift)}>
          <IconEdit size={15} color={T.text} />
          <Text style={styles.editBtnText}>Edit Shift</Text>
        </Btn>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionHeader title="ASSIGNED NURSES" count={nurses.length} />
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowNurseSheet(true)}>
              <IconPlus size={13} color={T.accent} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          <Card style={styles.staffCard}>
            {nurses.length > 0 ? nurses.map((n, i) => {
              const initials = `${n.firstName?.[0] || ''}${n.lastName?.[0] || ''}`.toUpperCase();
              return (
                <View key={n.nurseCode || i} style={[styles.staffRow, i > 0 && styles.staffBorder]}>
                  <Avatar initials={initials} size={36} />
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{n.firstName} {n.lastName}</Text>
                    <Text style={styles.staffCode}>{n.nurseCode}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => confirmUnassignNurse(n)}
                    disabled={!!unassigning}
                    style={styles.unassignBtn}
                  >
                    {unassigning === n.nurseCode
                      ? <ActivityIndicator size="small" color={T.bad} />
                      : <IconTrash size={15} color={T.bad} />
                    }
                  </TouchableOpacity>
                </View>
              );
            }) : (
              <Text style={styles.emptyStaff}>No nurses assigned to this shift.</Text>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionHeader title="ASSIGNED DOCTORS" count={doctors.length} />
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowDoctorSheet(true)}>
              <IconPlus size={13} color={T.accent} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          <Card style={styles.staffCard}>
            {doctors.length > 0 ? doctors.map((d, i) => {
              const initials = `${d.firstName?.[0] || ''}${d.lastName?.[0] || ''}`.toUpperCase();
              return (
                <View key={d.doctorCode || i} style={[styles.staffRow, i > 0 && styles.staffBorder]}>
                  <Avatar initials={initials} size={36} />
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>Dr. {d.firstName} {d.lastName}</Text>
                    <Text style={styles.staffCode}>{d.doctorCode}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => confirmUnassignDoctor(d)}
                    disabled={!!unassigning}
                    style={styles.unassignBtn}
                  >
                    {unassigning === d.doctorCode
                      ? <ActivityIndicator size="small" color={T.bad} />
                      : <IconTrash size={15} color={T.bad} />
                    }
                  </TouchableOpacity>
                </View>
              );
            }) : (
              <Text style={styles.emptyStaff}>No doctors assigned to this shift.</Text>
            )}
          </Card>
        </View>
      </ScrollView>

      <ShiftStaffSheet
        shiftCode={shiftCode}
        shiftName={shift.shiftName}
        staffType="nurse"
        visible={showNurseSheet}
        onClose={() => setShowNurseSheet(false)}
        onAssigned={() => { setShowNurseSheet(false); fetchDetail(); }}
      />
      <ShiftStaffSheet
        shiftCode={shiftCode}
        shiftName={shift.shiftName}
        staffType="doctor"
        visible={showDoctorSheet}
        onClose={() => setShowDoctorSheet(false)}
        onAssigned={() => { setShowDoctorSheet(false); fetchDetail(); }}
      />
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: T.error || '#ef4444', fontSize: 14, textAlign: 'center' },
  headerCard: { marginBottom: 12 },
  headerRow: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  shiftName: { fontSize: 17, fontWeight: '700', color: T.text },
  shiftCode: { fontSize: 12, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 2 },
  badgeRow: { marginTop: 6 },
  metaGrid: { flexDirection: 'row', gap: 0 },
  metaItem: { flex: 1, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.borderSoft },
  metaLabel: { fontSize: 9, fontWeight: '700', color: T.textFaint, letterSpacing: 0.5 },
  metaValue: { fontSize: 13, fontWeight: '600', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  editBtn: { flexDirection: 'row', gap: 8, height: 42, marginBottom: 24 },
  editBtnText: { fontWeight: '600', color: T.text, fontSize: 14 },
  section: { marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: T.accentSoft },
  addBtnText: { fontSize: 12, fontWeight: '600', color: T.accent },
  staffCard: { backgroundColor: T.surface },
  staffRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  staffBorder: { borderTopWidth: 1, borderTopColor: T.borderSoft },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 14, fontWeight: '600', color: T.text },
  staffCode: { fontSize: 11, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 2 },
  unassignBtn: { padding: 6 },
  emptyStaff: { padding: 16, fontSize: 12, color: T.textFaint, textAlign: 'center' },
});
