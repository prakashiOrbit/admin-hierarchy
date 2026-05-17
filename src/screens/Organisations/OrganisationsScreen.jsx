import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconSearch, IconFilter, IconHospital, IconUsers, IconPulse } from '../../icons';
import { ORGS } from '../../data/mock';

export const OrganisationsScreen = ({ onSelectOrg }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredOrgs = ORGS.filter(o => 
    o.display.toLowerCase().includes(query.toLowerCase()) &&
    (filter === 'All' || o.status === filter.toUpperCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSearch size={18} color={T.textFaint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search organisations..."
            placeholderTextColor={T.textFaint}
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <IconFilter size={18} color={T.textDim} />
          </TouchableOpacity>
        </View>

        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <TouchableOpacity onPress={() => setFilter('All')}
            style={[styles.chip, filter === 'All' && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === 'All' && styles.chipTextActive]}>
              All · {ORGS.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('Active')}
            style={[styles.chip, filter === 'Active' && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === 'Active' && styles.chipTextActive]}>
              Active · {ORGS.filter(o => o.status === 'ACTIVE').length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('Pending')}
            style={[styles.chip, filter === 'Pending' && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === 'Pending' && styles.chipTextActive]}>
              Pending · {ORGS.filter(o => o.status === 'PENDING').length}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>ORGANISATIONS</Text>
          <Text style={styles.countText}>{filteredOrgs.length}</Text>
        </View>

        {/* List */}
        <View style={styles.list}>
          {filteredOrgs.map(org => (
            <Card key={org.id} style={styles.orgCard} onPress={() => onSelectOrg?.(org.id)}>
              <View style={styles.orgHeader}>
                <View style={styles.orgAvatar}>
                  <Text style={styles.orgAvatarText}>
                    {org.display.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.orgInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.orgTitle} numberOfLines={1}>{org.display}</Text>
                    <StatusPill status={org.status} />
                  </View>
                  <Text style={styles.orgName} numberOfLines={1}>{org.name}</Text>
                  
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <IconHospital size={14} color={T.textDim} />
                      <Text style={styles.statValue}>{org.hospitals}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <IconUsers size={14} color={T.textDim} />
                      <Text style={styles.statValue}>{org.users.toLocaleString()}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <IconPulse size={14} color={T.textDim} />
                      <Text style={styles.statValue}>{org.devices.toLocaleString()}</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.borderSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: T.text,
    fontSize: 14,
    marginLeft: 8,
    padding: 0,
  },
  filterBtn: {
    padding: 4,
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.borderSoft,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: T.accent,
    borderColor: T.accent,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: T.text,
  },
  chipTextActive: {
    color: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: T.textDim,
    letterSpacing: 1,
  },
  countText: {
    fontSize: 11,
    color: T.textFaint,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  list: {
    gap: 10,
  },
  orgCard: {
    backgroundColor: T.surface,
  },
  orgHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  orgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: T.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
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
