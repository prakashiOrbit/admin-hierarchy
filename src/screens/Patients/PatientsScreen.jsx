import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, SearchBar, Btn, Chip, Avatar } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconPatient, IconPlus, IconChevron, IconFilter } from '../../icons';
import { patientApi } from '../../services/api';

export const PatientsScreen = ({ onNewPatient, onSelectPatient }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) return;
    patientApi.listAll(user.orgName, user.hospitalCode, token)
      .then(data => setPatients(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user?.orgName, user?.hospitalCode, token]);

  const filtered = patients.filter(p => {
    const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
    const matchesQuery =
      fullName.toLowerCase().includes(query.toLowerCase()) ||
      (p.patientCode || '').toLowerCase().includes(query.toLowerCase()) ||
      (p.mrNumber || '').toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'ALL' || p.status === filter;
    return matchesQuery && matchesFilter;
  });

  const countByStatus = (status) => patients.filter(p => p.status === status).length;

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['ALL', 'MONITORING', 'REGISTERED', 'OUTPATIENT'].map(f => (
            <Chip key={f} active={filter === f} onPress={() => setFilter(f)}>
              {f.charAt(0) + f.slice(1).toLowerCase()} · {f === 'ALL' ? patients.length : countByStatus(f)}
            </Chip>
          ))}
        </ScrollView>

        <View style={styles.headerRow}>
          <SectionHeader title="Patients" subtitle={`${filtered.length} found`} />
          <Btn variant="primary" size="sm" style={styles.newBtn} onPress={onNewPatient}>
            <IconPlus size={14} color="#FFF" /> New Patient
          </Btn>
        </View>

        <View style={styles.list}>
          {filtered.map(p => {
            const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown';
            const initials = `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();
            return (
              <Card key={p.patientCode} onPress={() => onSelectPatient(p.patientCode)}>
                <View style={styles.patientRow}>
                  <Avatar initials={initials} size={44} />
                  <View style={styles.patientInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.patientName} numberOfLines={1}>{fullName}</Text>
                      <StatusPill status={p.status} />
                    </View>
                    <Text style={styles.patientMeta}>
                      {p.patientCode} · {p.myContact?.phone || p.myContact?.email || '—'}
                    </Text>
                  </View>
                  <IconChevron size={18} color={T.textFaint} />
                </View>
              </Card>
            );
          })}

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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: T.error || '#ef4444', fontSize: 14, textAlign: 'center', padding: 16 },
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
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: T.text, marginTop: 12 },
  emptyHint: { fontSize: 13, color: T.textDim, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
