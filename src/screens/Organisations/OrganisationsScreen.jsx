import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { organisationApi } from '../../services/api';
import { Card, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconSearch, IconFilter, IconHospital, IconUsers, IconPulse } from '../../icons';

export const OrganisationsScreen = ({ onSelectOrg }) => {
  const { theme: T } = useTheme();
  const { token } = useAuth();
  const styles = createStyles(T);
  
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const fetchOrgs = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const response = await organisationApi.listAll(token);
      // Backend might return array directly or wrapped in { data: [] }
      const orgList = Array.isArray(response) ? response : (Array.isArray(response.data) ? response.data : []);
      setOrgs(orgList);
    } catch (err) {
      setError(err.message || 'Failed to load organisations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const filteredOrgs = orgs.filter(o => 
    (o.businessName?.toLowerCase().includes(query.toLowerCase()) || o.orgName?.toLowerCase().includes(query.toLowerCase())) &&
    (filter === 'All' || o.orgType === filter.toUpperCase())
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={T.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchOrgs(true)} tintColor={T.accent} />
        }
      >
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
              All · {orgs.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('Hospital')}
            style={[styles.chip, filter === 'Hospital' && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === 'Hospital' && styles.chipTextActive]}>
              Hospitals · {orgs.filter(o => o.orgType === 'HOSPITAL').length}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchOrgs()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>ORGANISATIONS</Text>
          <Text style={styles.countText}>{filteredOrgs.length}</Text>
        </View>

        {/* List */}
        <View style={styles.list}>
          {filteredOrgs.map(org => (
            <Card key={org.id} style={styles.orgCard} onPress={() => onSelectOrg?.(org)}>
              <View style={styles.orgHeader}>
                <View style={styles.orgAvatar}>
                  <Text style={styles.orgAvatarText}>
                    {(org.businessName || org.orgName || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.orgInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.orgTitle} numberOfLines={1}>{org.businessName || org.orgName}</Text>
                    <StatusPill status={org.deleted ? 'INACTIVE' : 'ACTIVE'} />
                  </View>
                  <Text style={styles.orgName} numberOfLines={1}>{org.orgName}</Text>
                  
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <IconHospital size={14} color={T.textDim} />
                      <Text style={styles.statValue}>{org.orgType || 'N/A'}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <IconUsers size={14} color={T.textDim} />
                      <Text style={styles.statValue}>{org.contact?.name || 'No Contact'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          ))}

          {!loading && filteredOrgs.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No organisations found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: T.accent,
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: T.textDim,
    fontSize: 14,
  },
});
