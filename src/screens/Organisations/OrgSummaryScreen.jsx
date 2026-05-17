import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { IconHospital, IconUsers, IconPulse, IconHeart, IconShield, IconDownload } from '../../icons';

export const OrgSummaryScreen = () => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);

  const stats = [
    { label: 'New hospitals', value: '+2', sub: 'Akron General, Fairview', icon: <IconHospital />, color: T.accent },
    { label: 'New users', value: '+47', sub: '12 clinical, 35 admin', icon: <IconUsers />, color: '#2DD4BF' },
    { label: 'Devices deployed', value: '+183', sub: 'iT-V4 (114), iT-IP (52), other 17', icon: <IconPulse />, color: '#22D3EE' },
    { label: 'Vitals events', value: '4.2B', sub: '↑ 12% vs last month', icon: <IconHeart />, color: '#F472B6' },
    { label: 'Audit events', value: '12,841', sub: '0 high-risk events flagged', icon: <IconShield />, color: '#A78BFA' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Uptime Card */}
        <Card style={styles.uptimeCard}>
          <SectionHeader title="PLATFORM PERFORMANCE" />
          <View style={styles.uptimeContent}>
            <View>
              <View style={styles.uptimeValueRow}>
                <Text style={styles.uptimeValue}>99.97</Text>
                <Text style={styles.uptimePercent}>%</Text>
              </View>
              <Text style={styles.uptimeLabel}>30-day uptime</Text>
            </View>
            <View style={styles.sparklinePlaceholder}>
              {/* Simple stylized trend line representation */}
              <View style={styles.trendRow}>
                {[4, 7, 5, 8, 10, 6, 9, 11, 10, 10].map((h, i) => (
                  <View key={i} style={[styles.trendBar, { height: h * 3, backgroundColor: T.good }]} />
                ))}
              </View>
            </View>
          </View>
        </Card>

        {/* Growth Section */}
        <View style={styles.section}>
          <SectionHeader title="ORGANISATION GROWTH" />
          <Card style={styles.listCard}>
            {stats.map((item, i) => (
              <View key={item.label} style={[styles.listItem, i > 0 && styles.listBorder]}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                  {React.cloneElement(item.icon, { size: 16, color: item.color })}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemSub}>{item.sub}</Text>
                </View>
                <Text style={styles.itemValue}>{item.value}</Text>
              </View>
            ))}
          </Card>
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
  exportBtn: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
