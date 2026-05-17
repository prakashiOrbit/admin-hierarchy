import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Btn, Chip, Avatar } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconClock, IconPlus, IconChevron, IconStethoscope, IconUser, IconActivity, IconFilter } from '../../icons';
import { SHIFTS, NURSES } from '../../data/mock';

export const ShiftsScreen = ({ onNewNurse, onNewShift }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('shifts');

  const filteredShifts = SHIFTS.filter(s => s.wardCode.toLowerCase().includes(query.toLowerCase()));
  const filteredNurses = NURSES.filter(n => (n.firstName + n.lastName).toLowerCase().includes(query.toLowerCase()) || n.nurseCode.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={{ marginBottom: 20 }}>
          <SearchBar 
            placeholder={mode === 'shifts' ? "Search by ward..." : "Search nurses..."}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeRow}>
          <Chip active={mode === 'shifts'} onPress={() => setMode('shifts')}>Active Shifts</Chip>
          <Chip active={mode === 'nurses'} onPress={() => setMode('nurses')}>Nursing Staff</Chip>
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title={mode === 'shifts' ? "CURRENT SHIFTS" : "REGISTERED NURSES"} count={mode === 'shifts' ? filteredShifts.length : filteredNurses.length} />
          
          <Btn 
            variant="primary" 
            size="sm"
            style={styles.newBtn} 
            onPress={mode === 'shifts' ? onNewShift : onNewNurse}
          >
            <IconPlus size={14} color="#fff" /> {mode === 'shifts' ? 'Assign Shift' : 'Onboard Nurse'}
          </Btn>
        </View>

        {/* List */}
        <View style={styles.list}>
          {mode === 'shifts' ? (
            filteredShifts.map(s => {
              const nurse = NURSES.find(n => n.id === s.nurseId);
              return (
                <Card key={s.id}>
                  <View style={styles.itemRow}>
                    <View style={styles.iconBox}>
                      <IconClock size={20} color={T.accent} />
                    </View>
                    
                    <View style={styles.infoBox}>
                      <View style={styles.titleRow}>
                        <Text style={styles.itemName}>{s.wardCode}</Text>
                        <StatusPill status={s.status} />
                      </View>
                      <Text style={styles.itemMeta}>{s.type} · {s.time}</Text>
                      {nurse && (
                        <View style={styles.assignmentRow}>
                          <View style={styles.smallAvatar}>
                            <Text style={styles.smallAvatarText}>{nurse.initials}</Text>
                          </View>
                          <View>
                            <Text style={styles.assignmentText}>Nurse {nurse.firstName} {nurse.lastName}</Text>
                            <Text style={styles.specText}>{nurse.speciality} Specialist</Text>
                          </View>
                        </View>
                      )}
                    </View>
                    <IconChevron size={16} color={T.textFaint} />
                  </View>
                </Card>
              );
            })
          ) : (
            filteredNurses.map(n => {
              const activeShift = SHIFTS.find(s => s.nurseId === n.id && s.status === 'ON_GOING');
              return (
                <Card key={n.id}>
                  <View style={styles.itemRow}>
                    <Avatar size={40} initials={n.initials} />
                    
                    <View style={styles.infoBox}>
                      <View style={styles.titleRow}>
                        <Text style={styles.itemName}>{n.firstName} {n.lastName}</Text>
                        <StatusPill status={activeShift ? 'ON_SHIFT' : 'OFF_DUTY'} />
                      </View>
                      <Text style={styles.itemMeta}>{n.nurseCode} · {n.speciality} · {n.experience}y exp</Text>
                      
                      {activeShift ? (
                        <View style={styles.currentShiftBadge}>
                          <Text style={styles.currentShiftText}>ON SHIFT: {activeShift.wardCode}</Text>
                        </View>
                      ) : (
                        <Text style={styles.emailText}>{n.email}</Text>
                      )}
                    </View>
                    <IconChevron size={16} color={T.textFaint} />
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
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
  assignmentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, padding: 8, backgroundColor: T.surface2, borderRadius: 8 },
  smallAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center' },
  smallAvatarText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  assignmentText: { fontSize: 11, color: T.text, fontWeight: '600' },
  specText: { fontSize: 9, color: T.textDim, marginTop: 1 },
  emailText: { fontSize: 11, color: T.textFaint, marginTop: 4 },
  currentShiftBadge: { alignSelf: 'flex-start', backgroundColor: T.goodSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
  currentShiftText: { fontSize: 9, color: T.good, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});
