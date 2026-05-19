import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { organisationApi } from '../../services/api';
import { Card, SectionHeader, SearchBar, Chip, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconHospital, IconFilter, IconBed, IconDoor, IconPulse, IconPlus } from '../../icons';

export const HospitalsScreen = ({ onProvision, onSelect }) => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState(null);

  const fetchHospitals = useCallback(async (showLoading = true) => {
    if (!user?.orgName) return;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const response = await organisationApi.listHospitals(user.orgName, token);
      setHospitals(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Fetch hospitals error:', err);
      setError(err.message || 'Failed to load hospitals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.orgName, token]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHospitals(false);
  };

  const filtered = hospitals.filter(h => 
    (h.hospitalName?.toLowerCase().includes(query.toLowerCase()) || 
     h.hospitalCode?.toLowerCase().includes(query.toLowerCase())) &&
    (filter === 'All' || h.status === filter.toUpperCase())
  );

  return (
    <View style={styles.container}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
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

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} />
        }
      >
        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['All', 'Active', 'Inactive'].map((f) => (
            <Chip 
              key={f}
              active={filter === f} 
              onPress={() => setFilter(f)}
            >
              {f} · {f === 'All' ? hospitals.length : hospitals.filter(h => h.status === f.toUpperCase()).length}
            </Chip>
          ))}
        </ScrollView>

        <View style={styles.headerRow}>
          <SectionHeader title="HOSPITALS" count={filtered.length} />
          
          <Btn 
            variant="primary" 
            size="sm"
            style={styles.newBtn} 
            onPress={onProvision}
          >
            <IconPlus size={14} color="#fff" /> New Hospital
          </Btn>
        </View>

        {/* List */}
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={T.accent} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={[styles.errorText, { color: T.bad }]}>{error}</Text>
            <Btn variant="surface" size="sm" onPress={() => fetchHospitals()} style={{ marginTop: 12 }}>
              Retry
            </Btn>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <IconHospital size={48} color={T.textFaint} />
            <Text style={[styles.emptyText, { color: T.textDim }]}>
              {query ? 'No matching hospitals found' : 'No hospitals provisioned yet'}
            </Text>
            {!query && (
              <Btn variant="tonal" size="sm" onPress={onProvision} style={{ marginTop: 16 }}>
                Provision First Hospital
              </Btn>
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((h, idx) => (
              <Card key={h.id || idx} onPress={() => onSelect?.(h)}>
                <View style={styles.orgHeader}>
                  <View style={styles.orgAvatar}>
                    <IconHospital size={24} color="#fff" />
                  </View>
                  <View style={styles.orgInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.orgTitle}>{h.hospitalName}</Text>
                      <StatusPill status={h.status || 'ACTIVE'} />
                    </View>
                    <Text style={styles.orgName}>{h.hospitalCode} · {h.myAddress?.city || '—'}</Text>
                    
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <IconBed size={14} color={T.textDim} />
                        <Text style={styles.statValue}>{h.beds || 0}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <IconDoor size={14} color={T.textDim} />
                        <Text style={styles.statValue}>{h.wards || 0}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <IconPulse size={14} color={T.textDim} />
                        <Text style={styles.statValue}>{h.devices || 0}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
