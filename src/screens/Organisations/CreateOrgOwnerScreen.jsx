import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Btn } from '../../components/Shared';
import { IconShield, IconBuilding, IconAlert } from '../../icons';

export const CreateOrgOwnerScreen = ({ onCancel, presetOrgName }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconShield color={T.accent} size={20} />
          <Text style={styles.bannerText}>
            {t('orgs.create_owner')}
          </Text>
        </View>

        {presetOrgName && (
          <Card style={styles.orgCard}>
            <View style={styles.orgRow}>
              <IconBuilding size={18} color={T.textDim} />
              <Text style={styles.orgName}>{presetOrgName}</Text>
            </View>
          </Card>
        )}

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <IconAlert size={18} color={T.accent} />
            <Text style={styles.infoTitle}>{t('dashboard.monitoring_active')}</Text>
          </View>
          <Text style={styles.infoBody}>
            {t('dashboard.gateways_ok')}
          </Text>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <IconShield size={18} color={T.warn} />
            <Text style={styles.infoTitle}>{t('dashboard.org_admins')}?</Text>
          </View>
          <Text style={styles.infoBody}>
            {t('dashboard.invite_org_admin')}
          </Text>
        </Card>

        <Btn variant="surface" style={styles.closeBtn} onPress={onCancel}>
          {t('common.done')}
        </Btn>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  banner: {
    flexDirection: 'row',
    backgroundColor: T.accentSoft,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerText: { fontSize: 15, fontWeight: '700', color: T.text, flex: 1 },
  orgCard: {
    marginBottom: 16,
    backgroundColor: T.surface2,
    borderColor: T.borderSoft,
  },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orgName: { fontSize: 14, fontWeight: '600', color: T.text, fontFamily: 'monospace' },
  infoCard: {
    marginBottom: 14,
    backgroundColor: T.surface,
    borderColor: T.borderSoft,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: T.text, flex: 1 },
  infoBody: { fontSize: 13, color: T.textDim, lineHeight: 20 },
  mono: { fontFamily: 'monospace', color: T.accent, fontSize: 12 },
  closeBtn: { marginTop: 8 },
});
