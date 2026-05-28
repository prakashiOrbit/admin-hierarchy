import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconGateway } from '../../icons';
import { gatewayApi } from '../../services/api';

export const GatewayDetailScreen = ({ gatewayCode, onBack, onAssign }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [gateway, setGateway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gatewayCode || !user?.orgName || !user?.hospitalCode) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    gatewayApi.getDetail(user.orgName, user.hospitalCode, gatewayCode, token)
      .then(data => { if (!cancelled) setGateway(data); })
      .catch(e => { if (!cancelled) setError(e.message || t('common.load_failed')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [gatewayCode, user?.orgName, user?.hospitalCode, token]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (error || !gateway) {
    return (
      <View style={styles.center}>
        <Text style={{ color: T.bad, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
          {error || t('common.load_failed')}
        </Text>
        <Btn variant="surface" size="sm" onPress={onBack}>{t('common.go_back')}</Btn>
      </View>
    );
  }

  const rows = [
    { label: t('gateway.code'),   value: gateway.gatewayCode },
    { label: t('gateway.type'),   value: gateway.gatewayType },
    { label: t('gateway.os'),     value: gateway.os },
    { label: t('gateway.comm'),   value: gateway.communicationConfig },
    { label: t('gateway.hospital'), value: gateway.hospitalCode },
    { label: t('gateway.org'),    value: gateway.orgName },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: T.accentSoft }]}>
              <IconGateway size={28} color={T.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gatewayCode}>{gateway.gatewayCode}</Text>
              <Text style={styles.gatewaySub}>{gateway.gatewayType}</Text>
            </View>
            <StatusPill status={gateway.gatewayStatus || 'ACTIVE'} />
          </View>
        </Card>

        {/* Detail rows */}
        <SectionHeader title={t('gateway.details_section')} />
        <Card style={styles.detailCard}>
          {rows.map((row, i) => (
            <View key={row.label} style={[styles.detailRow, i < rows.length - 1 && styles.rowBorder]}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value || '—'}</Text>
            </View>
          ))}
        </Card>

        {onAssign && (
          <Btn full style={{ marginTop: 24 }} onPress={() => onAssign(gatewayCode)}>
            Assign to Patient
          </Btn>
        )}
        <Btn variant="ghost" full style={{ marginTop: 12 }} onPress={onBack}>
          {t('common.go_back')}
        </Btn>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard: { marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  gatewayCode: { fontSize: 18, fontWeight: '700', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  gatewaySub: { fontSize: 12, color: T.textDim, marginTop: 3 },
  detailCard: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  detailLabel: { fontSize: 13, color: T.textDim, flex: 1 },
  detailValue: { fontSize: 13, fontWeight: '600', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', textAlign: 'right', flex: 1 },
});
