import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, SearchBar, Btn, Chip, Avatar } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconClock, IconPlus, IconChevron } from '../../icons';
import { shiftApi, nurseApi } from '../../services/api';

export const ShiftsScreen = ({ onNewNurse, onNewShift, onSelectNurse, onSelectShift }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [shifts, setShifts] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('shifts');

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) return;
    Promise.all([
      shiftApi.listAll(user.orgName, user.hospitalCode, token),
      nurseApi.listAll(user.orgName, user.hospitalCode, token),
    ])
      .then(([s, n]) => {
        setShifts(Array.isArray(s) ? s : []);
        setNurses(Array.isArray(n) ? n : []);
      })
      .catch(e => setError(e.message || 'Failed to load shifts'))
      .finally(() => setLoading(false));
  }, [user?.orgName, user?.hospitalCode, token]);

  const filteredShifts = shifts.filter(s =>
    s.wardCode?.toLowerCase().includes(query.toLowerCase()) ||
    s.shiftName?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredNurses = nurses.filter(n =>
    `${n.firstName} ${n.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
    n.nurseCode?.toLowerCase().includes(query.toLowerCase())
  );

  const formatTime = (dt) => {
    if (!dt) return '—';
    try { return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return dt; }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: 20 }}>
          <SearchBar
            placeholder={mode === 'shifts' ? 'Search by ward or shift name...' : 'Search nurses...'}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.modeRow}>
          <Chip active={mode === 'shifts'} onPress={() => setMode('shifts')}>Active Shifts</Chip>
          <Chip active={mode === 'nurses'} onPress={() => setMode('nurses')}>Nursing Staff</Chip>
        </View>

        <View style={styles.headerRow}>
          <SectionHeader
            title={mode === 'shifts' ? 'CURRENT SHIFTS' : 'REGISTERED NURSES'}
            count={mode === 'shifts' ? filteredShifts.length : filteredNurses.length}
          />
          <Btn variant="primary" size="sm" style={styles.newBtn} onPress={mode === 'shifts' ? onNewShift : onNewNurse}>
            <IconPlus size={14} color="#fff" /> {mode === 'shifts' ? 'New Shift' : 'Onboard Nurse'}
          </Btn>
        </View>

        <View style={styles.list}>
          {mode === 'shifts' ? (
            filteredShifts.map(s => (
              <Card key={s.shiftCode || s.shiftId} onPress={() => onSelectShift?.(s.shiftCode)}>
                <View style={styles.itemRow}>
                  <View style={styles.iconBox}>
                    <IconClock size={20} color={T.accent} />
                  </View>
                  <View style={styles.infoBox}>
                    <View style={styles.titleRow}>
                      <Text style={styles.itemName}>{s.shiftName || s.shiftCode}</Text>
                      <StatusPill status={s.status} />
                    </View>
                    <Text style={styles.itemMeta}>
                      {s.wardCode} · {formatTime(s.startTime)} – {formatTime(s.endTime)}
                    </Text>
                  </View>
                  <IconChevron size={16} color={T.textFaint} />
                </View>
              </Card>
            ))
          ) : (
            filteredNurses.map(n => {
              const initials = `${n.firstName?.[0] || ''}${n.lastName?.[0] || ''}`.toUpperCase();
              const specialities = Array.isArray(n.nurseSpeciality) ? n.nurseSpeciality : [];
              return (
                <Card key={n.nurseCode || n.nurseId} onPress={() => onSelectNurse?.(n.nurseCode)}>
                  <View style={styles.itemRow}>
                    <Avatar size={40} initials={initials} />
                    <View style={styles.infoBox}>
                      <View style={styles.titleRow}>
                        <Text style={styles.itemName}>{n.firstName} {n.lastName}</Text>
                      </View>
                      <Text style={styles.itemMeta}>
                        {n.nurseCode} · {specialities[0] || '—'} · {n.nurseExperience}y exp
                      </Text>
                      <Text style={styles.emailText}>{n.myContact?.email || ''}</Text>
                    </View>
                    <IconChevron size={16} color={T.textFaint} />
                  </View>
                </Card>
              );
            })
          )}

          {mode === 'shifts' && filteredShifts.length === 0 && (
            <View style={styles.emptyState}>
              <IconClock size={48} color={T.textFaint} />
              <Text style={styles.emptyTitle}>No shifts found</Text>
              <Text style={styles.emptyHint}>Create a shift to assign nursing staff to wards.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: T.error || '#ef4444', fontSize: 14, textAlign: 'center', padding: 16 },
  modeRow: { flexDirection: 'row', marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  newBtn: { flexDirection: 'row', gap: 4, height: 32, paddingHorizontal: 10 },
  list: { gap: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  infoBox: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  itemName: { fontSize: 14, fontWeight: '600', color: T.text },
  itemMeta: { fontSize: 11.5, color: T.textDim, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  emailText: { fontSize: 11, color: T.textFaint, marginTop: 4 },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: T.text, marginTop: 12 },
  emptyHint: { fontSize: 13, color: T.textDim, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
