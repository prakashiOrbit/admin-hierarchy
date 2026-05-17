import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Btn, Chip } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconGateway, IconPulse, IconPlus, IconCpu, IconChevron, IconFilter } from '../../icons';
import { GATEWAYS, DEVICES } from '../../data/mock';

export const DevicesScreen = ({ onNewGateway, onNewDevice }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('gateways');

  const filteredGateways = GATEWAYS.filter(g => g.code.toLowerCase().includes(query.toLowerCase()));
  const filteredDevices = DEVICES.filter(d => d.code.toLowerCase().includes(query.toLowerCase()) || d.type.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={{ marginBottom: 20 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={mode === 'gateways' ? "Search gateways..." : "Search devices..."}
          />
        </View>

        {/* Toggle Mode */}
        <View style={styles.modeRow}>
          <Chip active={mode === 'gateways'} onPress={() => setMode('gateways')}>Gateways · {GATEWAYS.length}</Chip>
          <Chip active={mode === 'devices'} onPress={() => setMode('devices')}>Devices · {DEVICES.length}</Chip>
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title={mode === 'gateways' ? "IoT Gateways" : "Medical Devices"} />
          <Btn 
            variant="primary" 
            size="small" 
            style={styles.newBtn}
            onPress={mode === 'gateways' ? onNewGateway : onNewDevice}
          >
            <IconPlus size={14} color="#FFF" />
             {mode === 'gateways' ? 'New Gateway' : 'New Device'}
          </Btn>
        </View>

        <View style={styles.list}>
          {mode === 'gateways' ? (
            filteredGateways.map(g => (
              <Card key={g.id}>
                <View style={styles.itemRow}>
                  <View style={styles.iconBox}>
                    <IconGateway size={20} color={T.accent} />
                  </View>
                  <View style={styles.infoBox}>
                    <View style={styles.titleRow}>
                      <Text style={styles.itemName}>{g.code}</Text>
                      <StatusPill status={g.status} />
                    </View>
                    <Text style={styles.itemMeta}>{g.type} · {g.os} · {g.config}</Text>
                  </View>
                  <IconChevron size={18} color={T.textFaint} />
                </View>
              </Card>
            ))
          ) : (
            filteredDevices.map(d => (
              <Card key={d.id}>
                <View style={styles.itemRow}>
                  <View style={styles.iconBox}>
                    <IconPulse size={20} color={T.accent} />
                  </View>
                  <View style={styles.infoBox}>
                    <View style={styles.titleRow}>
                      <Text style={styles.itemName}>{d.code}</Text>
                      <StatusPill status={d.status} />
                    </View>
                    <Text style={styles.itemMeta}>{d.type} · {d.protocol} · {d.ward}-{d.bed}</Text>
                    {d.status === 'WARN' && (
                      <Text style={[styles.alertText, { color: T.error }]}>Low battery: {d.battery}%</Text>
                    )}
                  </View>
                  <IconChevron size={18} color={T.textFaint} />
                </View>
              </Card>
            ))
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
  itemName: { fontSize: 14, fontWeight: '600', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  itemMeta: { fontSize: 11.5, color: T.textDim, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  alertText: { fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
});
