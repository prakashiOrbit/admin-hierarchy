import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconDoor, IconPlus, IconBed, IconGateway, IconChevron } from '../../icons';
import { WARDS, BEDS_IN_WARD } from '../../data/mock';

export const WardsScreen = ({ onNewWard, onNewBed }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');
  const [expandedWard, setExpandedWard] = useState(null);

  const filtered = WARDS.filter(w => 
    w.name.toLowerCase().includes(query.toLowerCase()) || 
    w.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: 20 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search wards..."
          />
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title="Hospital Wards" subtitle={`${filtered.length} units`} />
          <Btn 
            variant="primary" 
            size="small" 
            style={styles.newBtn}
            onPress={onNewWard}
          >
            <IconPlus size={14} color="#FFF" />
             New Ward
          </Btn>
        </View>

        <View style={styles.list}>
          {filtered.map(w => {
            const isExpanded = expandedWard === w.code;
            const beds = BEDS_IN_WARD[w.code] || [];
            
            return (
              <View key={w.code} style={{ marginBottom: 12 }}>
                <TouchableOpacity 
                  activeOpacity={0.9}
                  onPress={() => setExpandedWard(isExpanded ? null : w.code)}
                >
                  <Card>
                    <View style={styles.wardRow}>
                      <View style={styles.wardIcon}>
                        <IconDoor size={20} color={T.accent} />
                      </View>
                      <View style={styles.wardInfo}>
                        <View style={styles.titleRow}>
                          <Text style={styles.wardName}>{w.name}</Text>
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeText}>{w.type}</Text>
                          </View>
                        </View>
                        <Text style={styles.wardMeta}>{w.code} · {w.beds} beds · {w.active} active</Text>
                      </View>
                      <View style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}>
                        <IconChevron size={18} color={T.textFaint} />
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.bedsContainer}>
                    <View style={styles.bedsHeader}>
                      <Text style={styles.bedsTitle}>MONITORED BEDS</Text>
                      <TouchableOpacity onPress={() => onNewBed(w.code)}>
                        <Text style={styles.addBedText}>+ Add Bed</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {beds.map((b) => (
                      <View key={b.code} style={styles.bedItem}>
                        <IconBed size={14} color={T.textDim} />
                        <Text style={styles.bedCode}>{b.code}</Text>
                        <View style={styles.gatewayInfo}>
                          <IconGateway size={12} color={T.textFaint} />
                          <Text style={styles.gatewayCode}>{b.gateway}</Text>
                        </View>
                        <StatusPill status={b.status} />
                      </View>
                    ))}
                    
                    {beds.length === 0 && (
                      <Text style={styles.noBeds}>No beds provisioned in this ward.</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
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
  list: { gap: 0 },
  wardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wardIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  wardInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wardName: { fontSize: 14, fontWeight: '600', color: T.text },
  typeBadge: { backgroundColor: T.surface2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 9, color: T.textDim, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  wardMeta: { fontSize: 11.5, color: T.textDim, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  bedsContainer: { 
    backgroundColor: T.surface, 
    borderBottomLeftRadius: 14, 
    borderBottomRightRadius: 14,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: T.borderSoft,
    marginTop: -8,
    padding: 12,
    paddingTop: 20,
    zIndex: -1,
  },
  bedsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bedsTitle: { fontSize: 10, fontWeight: '700', color: T.textFaint, letterSpacing: 0.5 },
  addBedText: { fontSize: 11, fontWeight: '600', color: T.accent },
  bedItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: T.borderSoft },
  bedCode: { flex: 1, fontSize: 13, color: T.text, fontWeight: '500', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  gatewayInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 12 },
  gatewayCode: { fontSize: 11, color: T.textFaint, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  noBeds: { fontSize: 12, color: T.textFaint, textAlign: 'center', paddingVertical: 10 },
});
