import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Btn, Chip, Avatar } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconPatient, IconPlus, IconChevron, IconFilter } from '../../icons';
import { PATIENTS } from '../../data/mock';

export const PatientsScreen = ({ onNewPatient, onSelectPatient }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

  const filtered = PATIENTS.filter(p => 
    (p.name.toLowerCase().includes(query.toLowerCase()) || p.mrn.toLowerCase().includes(query.toLowerCase())) &&
    (filter === 'ALL' || p.status === filter)
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={{ marginBottom: 20 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search patients by name or MRN..."
            trailing={
              <TouchableOpacity style={styles.filterBtn}>
                <IconFilter size={20} color={T.textDim} />
              </TouchableOpacity>
            }
          />
        </View>

        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['ALL', 'ADMITTED', 'DISCHARGED', 'PENDING'].map((f) => (
            <Chip
              key={f}
              active={filter === f}
              onPress={() => setFilter(f)}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()} · {f === 'ALL' ? PATIENTS.length : PATIENTS.filter(p => p.status === f).length}
            </Chip>
          ))}
        </ScrollView>

        <View style={styles.headerRow}>
          <SectionHeader title="Patients" subtitle={`${filtered.length} found`} />
          <Btn 
            variant="primary" 
            size="sm" 
            style={styles.newBtn}
            onPress={onNewPatient}
          >
            <IconPlus size={14} color="#FFF" />
             New Patient
          </Btn>
        </View>

        {/* List */}
        <View style={styles.list}>
          {filtered.map(p => (
            <Card key={p.id} onPress={() => onSelectPatient(p.id)}>
              <View style={styles.patientRow}>
                <Avatar name={p.name} size={44} />
                <View style={styles.patientInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.patientName} numberOfLines={1}>{p.name}</Text>
                    <StatusPill status={p.status} />
                  </View>
                  <Text style={styles.patientMeta}>{p.mrn} · {p.contact}</Text>
                  
                  {p.status === 'ADMITTED' && (
                    <View style={styles.locationBadge}>
                      <Text style={styles.locationText}>{p.ward} – Bed {p.bed}</Text>
                    </View>
                  )}
                </View>
                <IconChevron size={18} color={T.textFaint} />
              </View>
            </Card>
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <IconPatient size={48} color={T.textFaint} />
              <Text style={styles.emptyTitle}>No patients found</Text>
              <Text style={styles.emptyHint}>Try broadening your search or register a new patient.</Text>
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
  filterBtn: { padding: 4 },
  chipScroll: { flexDirection: 'row', marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  newBtn: { flexDirection: 'row', gap: 4, height: 32, paddingHorizontal: 10 },
  list: { gap: 10 },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  patientInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  patientName: { fontSize: 15, fontWeight: '600', color: T.text, flex: 1, marginRight: 8 },
  patientMeta: { fontSize: 11.5, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  locationBadge: { backgroundColor: T.surface2, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 6, alignSelf: 'flex-start' },
  locationText: { fontSize: 10, color: T.textDim, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: T.text, marginTop: 12 },
  emptyHint: { fontSize: 13, color: T.textDim, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
