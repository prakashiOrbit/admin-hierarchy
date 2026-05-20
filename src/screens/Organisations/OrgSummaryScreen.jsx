import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { organisationApi, userApi, summaryApi } from '../../services/api';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { IconHospital, IconUsers, IconPulse, IconHeart, IconShield, IconDownload } from '../../icons';

export const OrgSummaryScreen = () => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  const [summary, setSummary] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, hospData, adminData] = await Promise.all([
        summaryApi.getOrgSummary(user.orgName, token).catch(() => null),
        organisationApi.listHospitals(user.orgName, token).catch(() => []),
        userApi.listOrgAdmins(user.orgName, token).catch(() => []),
      ]);
      
      setSummary(summaryData);
      setHospitals(Array.isArray(hospData) ? hospData : (hospData?.data || []));
      setAdmins(Array.isArray(adminData) ? adminData : (adminData?.data || []));
    } catch (err) {
      setError(err.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  }, [user?.orgName, token]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const fmt = (v) => (v == null ? '—' : String(v));

  const stats = [
    {
      label: 'Hospitals',
      value: fmt(summary?.stats?.totalHospitals || summary?.hospitals || hospitals.length),
      sub: '',
      icon: <IconHospital />,
      color: T.accent,
    },
    {
      label: 'Administrators',
      value: fmt(summary?.stats?.totalUsers || summary?.users || summary?.userCount || admins.length),
      sub: '',
      icon: <IconUsers />,
      color: '#2DD4BF',
    },
    {
      label: 'Devices deployed',
      value: fmt(summary?.devices ?? summary?.deviceCount ?? summary?.totalDevices),
      sub: '',
      icon: <IconPulse />,
      color: '#22D3EE',
    },
    {
      label: 'Vitals events',
      value: fmt(summary?.vitalsEvents ?? summary?.vitalEvents ?? summary?.totalVitals),
      sub: '',
      icon: <IconHeart />,
      color: '#F472B6',
    },
    {
      label: 'Audit events',
      value: fmt(summary?.auditEvents ?? summary?.totalAuditEvents),
      sub: summary?.highRiskEvents != null ? `${summary.highRiskEvents} high-risk flagged` : '',
      icon: <IconShield />,
      color: '#A78BFA',
    },
  ];

  const rawUptime = summary?.uptime ?? summary?.uptimePercent;
  const uptimeStr = rawUptime == null
    ? '—'
    : typeof rawUptime === 'number' ? rawUptime.toFixed(2) : String(rawUptime);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Uptime Card */}
        <Card style={styles.uptimeCard}>
          <SectionHeader title="PLATFORM PERFORMANCE" />
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={T.good} />
            </View>
          ) : (
            <View style={styles.uptimeContent}>
              <View>
                <View style={styles.uptimeValueRow}>
                  <Text style={styles.uptimeValue}>{uptimeStr}</Text>
                  <Text style={styles.uptimePercent}>%</Text>
                </View>
                <Text style={styles.uptimeLabel}>30-day uptime</Text>
              </View>
              <View style={styles.sparklinePlaceholder}>
                <View style={styles.trendRow}>
                  {[4, 7, 5, 8, 10, 6, 9, 11, 10, 10].map((h, i) => (
                    <View key={i} style={[styles.trendBar, { height: h * 3, backgroundColor: T.good }]} />
                  ))}
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* Growth Section */}
        <View style={styles.section}>
          <SectionHeader title="ORGANISATION GROWTH" />
          {error ? (
            <View style={styles.center}>
              <Text style={[styles.errorText, { color: T.bad }]}>{error}</Text>
              <Btn variant="surface" size="sm" onPress={fetchSummary} style={{ marginTop: 12 }}>
                Retry
              </Btn>
            </View>
          ) : (
            <Card style={styles.listCard}>
              {stats.map((item, i) => (
                <View key={item.label} style={[styles.listItem, i > 0 && styles.listBorder]}>
                  <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                    {React.cloneElement(item.icon, { size: 16, color: item.color })}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    {item.sub ? <Text style={styles.itemSub}>{item.sub}</Text> : null}
                  </View>
                  {loading ? (
                    <ActivityIndicator size="small" color={T.accent} />
                  ) : (
                    <Text style={styles.itemValue}>{item.value}</Text>
                  )}
                </View>
              ))}
            </Card>
          )}
        </View>

        <Btn type="outline" style={styles.exportBtn}>
          <IconDownload size={16} color={T.accent} /> Export PDF summary
        </Btn>
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
    paddingBottom: 40,
  },
  uptimeCard: {
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.1)',
    backgroundColor: 'rgba(16,185,129,0.03)',
    marginBottom: 24,
  },
  loadingRow: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  uptimeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  uptimeValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  uptimeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: T.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: -1,
  },
  uptimePercent: {
    fontSize: 16,
    color: T.textDim,
    marginLeft: 2,
  },
  uptimeLabel: {
    fontSize: 11.5,
    color: T.textDim,
    marginTop: 2,
  },
  sparklinePlaceholder: {
    width: 120,
    height: 44,
    justifyContent: 'flex-end',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  trendBar: {
    width: 6,
    borderRadius: 2,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  listCard: {
    backgroundColor: T.surface,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  listBorder: {
    borderTopWidth: 1,
    borderTopColor: T.borderSoft,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 13,
    color: T.text,
    fontWeight: '500',
  },
  itemSub: {
    fontSize: 11,
    color: T.textFaint,
    marginTop: 2,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  center: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  exportBtn: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
