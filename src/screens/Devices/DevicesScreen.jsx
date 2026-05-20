import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, SearchBar, Btn, Chip } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconGateway, IconPulse, IconPlus, IconCpu, IconChevron } from '../../icons';
import { gatewayApi, deviceApi } from '../../services/api';

export const DevicesScreen = ({ onNewGateway, onNewDevice }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [gateways, setGateways] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('gateways');

  const fetchAll = useCallback(async () => {
    if (!user?.orgName || !user?.hospitalCode) return;
    setLoading(true);
    setError(null);
    try {
      const [g, d] = await Promise.all([
        gatewayApi.listAll(user.orgName, user.hospitalCode, token),
        deviceApi.listAll(user.orgName, user.hospitalCode, token),
      ]);
      setGateways(Array.isArray(g) ? g : []);
      setDevices(Array.isArray(d) ? d : []);
    } catch (err) {
      setError(err.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, [user?.orgName, user?.hospitalCode, token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredGateways = gateways.filter(g =>
    g.gatewayCode?.toLowerCase().includes(query.toLowerCase()) ||
    g.gatewayType?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDevices = devices.filter(d =>
    d.deviceCode?.toLowerCase().includes(query.toLowerCase()) ||
    d.deviceType?.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: T.bad, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</Text>
        <Btn variant="surface" size="sm" onPress={fetchAll}>Retry</Btn>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: 20 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={mode === 'gateways' ? 'Search gateways...' : 'Search devices...'}
          />
        </View>

        <View style={styles.modeRow}>
          <Chip active={mode === 'gateways'} onPress={() => setMode('gateways')}>
            Gateways · {gateways.length}
          </Chip>
          <Chip active={mode === 'devices'} onPress={() => setMode('devices')}>
            Devices · {devices.length}
          </Chip>
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title={mode === 'gateways' ? 'IoT Gateways' : 'Medical Devices'} />
          <Btn
            variant="primary"
            size="sm"
            style={styles.newBtn}
            onPress={mode === 'gateways' ? onNewGateway : onNewDevice}
          >
            <IconPlus size={14} color="#FFF" />
            {mode === 'gateways' ? ' New Gateway' : ' New Device'}
          </Btn>
        </View>

        <View style={styles.list}>
          {mode === 'gateways' ? (
            filteredGateways.length > 0 ? filteredGateways.map(g => (
              <Card key={g.gatewayCode || g.gatewayId}>
                <View style={styles.itemRow}>
                  <View style={styles.iconBox}>
                    <IconGateway size={20} color={T.accent} />
                  </View>
                  <View style={styles.infoBox}>
                    <View style={styles.titleRow}>
                      <Text style={styles.itemName}>{g.gatewayCode}</Text>
                      <StatusPill status={g.gatewayStatus || 'ACTIVE'} />
                    </View>
                    <Text style={styles.itemMeta}>
                      {g.gatewayType} · {g.os} · {g.communicationConfig}
                    </Text>
                  </View>
                  <IconChevron size={18} color={T.textFaint} />
                </View>
              </Card>
            )) : (
              <View style={styles.emptyState}>
                <IconGateway size={48} color={T.textFaint} />
                <Text style={styles.emptyTitle}>No gateways registered</Text>
                <Text style={styles.emptyHint}>Add an IoT gateway to start streaming telemetry from beds.</Text>
              </View>
            )
          ) : (
            filteredDevices.length > 0 ? filteredDevices.map(d => (
              <Card key={d.deviceCode || d.deviceId}>
                <View style={styles.itemRow}>
                  <View style={styles.iconBox}>
                    <IconPulse size={20} color={T.accent} />
                  </View>
                  <View style={styles.infoBox}>
                    <View style={styles.titleRow}>
                      <Text style={styles.itemName}>{d.deviceCode}</Text>
                      <StatusPill status={d.deviceStatus || 'ACTIVE'} />
                    </View>
                    <Text style={styles.itemMeta}>
                      {d.deviceType} · {d.protocol} · {d.usageType}
                    </Text>
                  </View>
                  <IconChevron size={18} color={T.textFaint} />
                </View>
              </Card>
            )) : (
              <View style={styles.emptyState}>
                <IconCpu size={48} color={T.textFaint} />
                <Text style={styles.emptyTitle}>No devices registered</Text>
                <Text style={styles.emptyHint}>Register a medical device to assign it to a bed or patient.</Text>
              </View>
            )
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
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: T.text, marginTop: 12 },
  emptyHint: { fontSize: 13, color: T.textDim, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
