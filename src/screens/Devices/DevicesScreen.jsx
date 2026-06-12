import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, SearchBar, Btn, Chip } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconGateway, IconPulse, IconPlus, IconCpu, IconChevron } from '../../icons';
import { gatewayApi, deviceApi, getApiErrorMessage } from '../../services/api';

export const DevicesScreen = ({ onNewGateway, onNewDevice, onGatewayPress, onDevicePress, onDeviceAssign, mode: modeProp, onModeChange }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [gateways, setGateways] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [mode, setModeInternal] = useState(modeProp || 'gateways');
  const setMode = (m) => { setModeInternal(m); onModeChange?.(m); };
  const [endingDeviceCode, setEndingDeviceCode] = useState(null);

  const hasGatewayPerm = user?.roles?.includes('permit.admin.gateway') || user?.roles?.includes('CARESITE_OWNER');
  const hasDevicePerm = user?.roles?.includes('permit.admin.device') || user?.roles?.includes('CARESITE_OWNER');

  const fetchAll = useCallback(async () => {
    if (!user?.orgName || !user?.careSiteCode) return;
    setLoading(true);
    setError(null);
    try {
      const [gRes, dRes] = await Promise.all([
        hasGatewayPerm ? gatewayApi.listAll(user.orgName, user.careSiteCode, token).catch(e => {
          if (e.status === 403) return [];
          const msg = (e.message || '').toLowerCase();
          if (msg.includes('no_gateways') || msg.includes('notfound') || msg.includes('not found') || msg.includes('no gateway')) return [];
          throw e;
        }) : Promise.resolve([]),
        hasDevicePerm ? deviceApi.listAll(user.orgName, user.careSiteCode, token).catch(e => {
          if (e.status === 403) return [];
          const msg = (e.message || '').toLowerCase();
          if (msg.includes('no_devices') || msg.includes('notfound') || msg.includes('not found') || msg.includes('no device')) return [];
          throw e;
        }) : Promise.resolve([]),
      ]);
      const gList = Array.isArray(gRes) ? gRes : (Array.isArray(gRes?.data) ? gRes.data : []);
      const dList = Array.isArray(dRes) ? dRes : (Array.isArray(dRes?.data) ? dRes.data : []);
      setGateways(gList);
      setDevices(dList);

      // Adjust mode if the current mode is not permitted
      if (mode === 'gateways' && !hasGatewayPerm && hasDevicePerm) {
        setMode('devices');
      } else if (mode === 'devices' && !hasDevicePerm && hasGatewayPerm) {
        setMode('gateways');
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.orgName, user?.careSiteCode, token, hasGatewayPerm, hasDevicePerm, mode]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleEndAssignment = (device) => {
    Alert.alert(
      t('actions.end_assignment'),
      t('messages.confirm_end_assignment', { code: device.deviceCode }),
      [
        { text: t('actions.cancel'), style: 'cancel' },
        {
          text: t('actions.end_assignment'),
          style: 'destructive',
          onPress: async () => {
            setEndingDeviceCode(device.deviceCode);
            try {
              await deviceApi.endAssignment(user.orgName, user.careSiteCode, device, token);
              await fetchAll();
            } catch (e) {
              Alert.alert(t('messages.error'), e.message || t('messages.error_end_assignment'));
            } finally {
              setEndingDeviceCode(null);
            }
          },
        },
      ]
    );
  };

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
        <Btn variant="surface" size="sm" onPress={fetchAll}>{t('actions.retry')}</Btn>
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
            placeholder={mode === 'gateways' ? t('placeholders.search_gateways') : t('placeholders.search_devices')}
          />
        </View>

        <View style={styles.modeRow}>
          {hasGatewayPerm && (
            <Chip active={mode === 'gateways'} onPress={() => setMode('gateways')}>
              {t('entity.gateways')} · {gateways.length}
            </Chip>
          )}
          {hasDevicePerm && (
            <Chip active={mode === 'devices'} onPress={() => setMode('devices')}>
              {t('entity.devices')} · {devices.length}
            </Chip>
          )}
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title={mode === 'gateways' ? t('entity.iot_gateways') : t('entity.medical_devices')} />
          <View style={styles.headerActions}>
            {mode === 'devices' && onDeviceAssign && (
              <Btn variant="surface" size="sm" style={styles.newBtn} onPress={onDeviceAssign}>
                Assign
              </Btn>
            )}
            {((mode === 'gateways' && onNewGateway) || (mode === 'devices' && onNewDevice)) && (
              <Btn
                variant="primary"
                size="sm"
                style={styles.newBtn}
                onPress={mode === 'gateways' ? onNewGateway : onNewDevice}
              >
                <IconPlus size={14} color="#FFF" />
                {mode === 'gateways' ? ` ${t('actions.new_gateway')}` : ` ${t('actions.new_device')}`}
              </Btn>
            )}
          </View>
        </View>

        <View style={styles.list}>
          {mode === 'gateways' ? (
            filteredGateways.length > 0 ? filteredGateways.map(g => (
              <Card key={g.gatewayCode || g.gatewayId} onPress={() => onGatewayPress && onGatewayPress(g.gatewayCode)}>
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
                <Text style={styles.emptyTitle}>{t('messages.no_gateways')}</Text>
                <Text style={styles.emptyHint}>{t('messages.no_gateways_hint')}</Text>
              </View>
            )
          ) : (
            filteredDevices.length > 0 ? filteredDevices.map(d => (
              <Card key={d.deviceCode || d.deviceId} onPress={() => onDevicePress && onDevicePress(d)}>
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
                    {d.deviceStatus === 'ASSIGNED' && (
                      <View style={styles.cardActions}>
                        {endingDeviceCode === d.deviceCode
                          ? <ActivityIndicator size="small" color={T.bad} />
                          : (
                            <Btn
                              variant="danger"
                              size="xs"
                              onPress={(e) => { e.stopPropagation?.(); handleEndAssignment(d); }}
                            >
                              {t('actions.end_assignment')}
                            </Btn>
                          )
                        }
                      </View>
                    )}
                  </View>
                  <IconChevron size={18} color={T.textFaint} />
                </View>
              </Card>
            )) : (
              <View style={styles.emptyState}>
                <IconCpu size={48} color={T.textFaint} />
                <Text style={styles.emptyTitle}>{t('messages.no_devices')}</Text>
                <Text style={styles.emptyHint}>{t('messages.no_devices_hint')}</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  newBtn: { flexDirection: 'row', gap: 4, paddingHorizontal: 10 },
  list: { gap: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  infoBox: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  itemName: { fontSize: 14, fontWeight: '600', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  itemMeta: { fontSize: 11.5, color: T.textDim, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  cardActions: { flexDirection: 'row', marginTop: 8 },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: T.text, marginTop: 12 },
  emptyHint: { fontSize: 13, color: T.textDim, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
