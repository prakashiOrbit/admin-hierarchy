import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconCpu, IconActivity, IconShield, IconBuilding, IconChevron, IconBack } from '../../icons';

export const DeviceTypeDetailScreen = ({ deviceType, onBack, onEdit }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  if (!deviceType) return null;

  const details = [
    { label: t('entity.category'), value: deviceType.category },
    { label: t('entity.vendor'), value: deviceType.deviceVendor },
    { label: t('entity.profile_code'), value: deviceType.deviceProfile },
    { label: t('entity.min_firmware'), value: deviceType.deviceFirmware, mono: true },
    { label: t('entity.max_firmware'), value: deviceType.maxFirmware, mono: true },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.iconBox}>
              <IconCpu size={32} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.typeName}>{deviceType.deviceType}</Text>
              <Text style={styles.vendorName}>{deviceType.deviceVendor}</Text>
            </View>
            <StatusPill status="ACTIVE" />
          </View>
          
          {deviceType.description && (
            <Text style={styles.description}>{deviceType.description}</Text>
          )}
        </Card>

        {/* Specifications */}
        <View style={styles.section}>
          <SectionHeader title={t('entity.specifications')} />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {details.map((item, i) => (
              <View 
                key={i} 
                style={[
                  styles.detailRow, 
                  i < details.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.borderSoft }
                ]}
              >
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={[
                  styles.detailValue, 
                  item.mono && { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }
                ]}>
                  {item.value || '—'}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Capability Banner */}
        <Card style={styles.banner}>
          <IconShield size={20} color={T.good} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{t('messages.deployment_ready')}</Text>
            <Text style={styles.bannerText}>
              {t('messages.deployment_ready_desc')}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onBack}>
            {t('actions.back_to_list')}
          </Btn>
          <Btn variant="primary" style={{ flex: 1 }} onPress={onEdit}>
            {t('actions.edit_profile')}
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: { marginBottom: 24, backgroundColor: T.surface },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  iconBox: { 
    width: 64, 
    height: 64, 
    borderRadius: 16, 
    backgroundColor: T.accent, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  typeName: { fontSize: 20, fontWeight: '700', color: T.text },
  vendorName: { fontSize: 14, color: T.textDim, marginTop: 2 },
  description: { fontSize: 13, color: T.textDim, lineHeight: 20, marginTop: 8 },
  section: { marginBottom: 24 },
  detailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 14 
  },
  detailLabel: { fontSize: 13, color: T.textDim },
  detailValue: { fontSize: 13, fontWeight: '600', color: T.text },
  banner: { 
    flexDirection: 'row', 
    gap: 12, 
    backgroundColor: T.goodSoft, 
    borderColor: T.good, 
    marginBottom: 24 
  },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: T.good },
  bannerText: { fontSize: 12, color: T.text, lineHeight: 18, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 12 },
});
