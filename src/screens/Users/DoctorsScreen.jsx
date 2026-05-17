import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Btn, Chip, Avatar } from '../../components/Shared';
import { IconStethoscope, IconPlus, IconChevron, IconFilter, IconActivity } from '../../icons';

export const DoctorsScreen = ({ onNewDoctor, onSelectDoctor }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');

  const doctors = [
    { id: 'd1', code: 'DOC997', name: 'Gregory House', speciality: ['Diagnostics', 'Nephrology'], experience: 20, type: 'SPECIALIST', status: 'ACTIVE', initials: 'GH' },
    { id: 'd2', code: 'DOC102', name: 'Allison Cameron', speciality: ['Immunology'], experience: 8, type: 'RESIDENT', status: 'ACTIVE', initials: 'AC' },
    { id: 'd3', code: 'DOC085', name: 'Robert Chase', speciality: ['Intensive Care'], experience: 10, type: 'SPECIALIST', status: 'ACTIVE', initials: 'RC' },
  ].filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.code.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={{ marginBottom: 16 }}>
          <SearchBar 
            placeholder="Search doctors..."
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title="MEDICAL STAFF" count={doctors.length} />
          
          <Btn 
            variant="primary" 
            style={styles.newBtn} 
            onPress={onNewDoctor}
          >
            <IconPlus size={14} color="#fff" /> New Doctor
          </Btn>
        </View>

        {/* List */}
        <View style={styles.list}>
          {doctors.map(d => (
            <Card key={d.id} onPress={() => onSelectDoctor(d.id)}>
              <View style={styles.doctorRow}>
                <Avatar initials={d.initials} size={44} />
                <View style={styles.doctorInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.doctorName}>Dr. {d.name}</Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{d.type}</Text>
                    </View>
                  </View>
                  <Text style={styles.doctorMeta}>{d.code} · {d.experience}y exp</Text>
                  
                  <View style={styles.specRow}>
                    <IconActivity size={12} color={T.textDim} />
                    <Text style={styles.specText}>{d.speciality.join(', ')}</Text>
                  </View>
                </View>
                <IconChevron size={20} color={T.textFaint} />
              </View>
            </Card>
          ))}
          {doctors.length === 0 && (
            <View style={styles.emptyState}>
              <IconStethoscope size={48} color={T.textFaint} />
              <Text style={styles.emptyTitle}>No doctors found</Text>
              <Text style={styles.emptyHint}>Onboard a new medical professional to your hospital.</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  newBtn: { flexDirection: 'row', gap: 4, height: 32, paddingHorizontal: 10 },
  list: { gap: 10 },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doctorInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  doctorName: { fontSize: 15, fontWeight: '600', color: T.text, flex: 1, marginRight: 8 },
  typeBadge: { backgroundColor: T.surface2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 9, color: T.textDim, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  doctorMeta: { fontSize: 11.5, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  specRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  specText: { fontSize: 11, color: T.textFaint, fontStyle: 'italic' },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: T.text, marginTop: 12 },
  emptyHint: { fontSize: 13, color: T.textDim, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
