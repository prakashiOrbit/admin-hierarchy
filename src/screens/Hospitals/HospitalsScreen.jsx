import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Chip, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconHospital, IconFilter, IconBed, IconDoor, IconPulse, IconPlus } from '../../icons';
import { HOSPITALS } from '../../data/mock';

export const HospitalsScreen = ({ onInvite }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = HOSPITALS.filter(h => 
    h.name.toLowerCase().includes(query.toLowerCase()) &&
    (filter === 'All' || h.status === filter.toUpperCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search & Filter */}
        <View style={{ marginBottom: 16 }}>
          <SearchBar 
            placeholder="Search hospitals..."
            value={query}
            onChangeText={setQuery}
            trailing={
              <TouchableOpacity style={styles.filterBtn}>
                <IconFilter size={18} color={T.textDim} />
              </TouchableOpacity>
            }
          />
        </View>

        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['All', 'Active', 'Inactive'].map((f) => (
            <Chip 
              key={f}
              active={filter === f} 
              onPress={() => setFilter(f)}
            >
              {f} · {f === 'All' ? HOSPITALS.length : HOSPITALS.filter(h => h.status === f.toUpperCase()).length}
            </Chip>
          ))}
        </ScrollView>

        <View style={styles.headerRow}>
          <SectionHeader title="HOSPITALS" count={filtered.length} />
          
          <Btn 
            type="primary" 
            style={styles.newBtn} 
            onPress={onInvite}
          >
            <IconPlus size={14} color="#fff" /> New Hospital
          </Btn>
        </View>

        {/* List */}
        <View style={styles.list}>
          {filtered.map(h => (
            <Card key={h.id}>
              <View style={styles.orgHeader}>
                <View style={styles.orgAvatar}>
                  <IconHospital size={24} color="#fff" />
                </View>
                <View style={styles.orgInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.orgTitle}>{h.name}</Text>
                    <StatusPill status={h.status} />
                  </View>
                  <Text style={styles.orgName}>{h.code} · {h.city}</Text>
                  
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <IconBed size={14} color={T.textDim} />
                      <Text style={styles.statValue}>{h.beds}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <IconDoor size={14} color={T.textDim} />
                      <Text style={styles.statValue}>{h.wards}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <IconPulse size={14} color={T.textDim} />
                      <Text style={styles.statValue}>{h.devices}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  filterBtn: {
    padding: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newBtn: {
    flexDirection: 'row',
    gap: 4,
    height: 32,
    paddingHorizontal: 10,
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  list: {
    gap: 10,
  },
  orgHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  orgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  orgTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: T.text,
    flex: 1,
    marginRight: 8,
  },
  orgName: {
    fontSize: 12,
    color: T.textDim,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: T.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
