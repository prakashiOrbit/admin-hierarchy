import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert, TextInput as RNTextInput, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconCareSite, IconUser, IconMail, IconLocation, IconPhone, IconBed, IconDoor, IconPulse, IconBack } from '../../icons';
import { organisationApi } from '../../services/api';

export const CareSiteDetailScreen = ({ careSite, orgName, viewerRole, onBack, onEdit, onAddAdmin }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { token } = useAuth();
  const styles = createStyles(T);
  const isOrgAdmin = viewerRole === 'ORG_ADMIN';

  const [currentCareSite, setCurrentCareSite] = useState(careSite);
  const [editingPolicy, setEditingPolicy] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [ownerHours, setOwnerHours] = useState(
    String(careSite.ownerJwtValiditySeconds ? Math.round(careSite.ownerJwtValiditySeconds / 3600) : '')
  );
  const [adminHours, setAdminHours] = useState(
    String(careSite.adminJwtValiditySeconds ? Math.round(careSite.adminJwtValiditySeconds / 3600) : '')
  );

  const handleSavePolicy = async () => {
    if (!ownerHours.trim()) {
      Alert.alert(t('common.invalid_input'), t('security_policy.err_owner_required'));
      return;
    }
    const ownerSeconds = parseInt(ownerHours, 10) * 3600;
    if (isNaN(ownerSeconds) || ownerSeconds <= 0) {
      Alert.alert(t('common.invalid_input'), t('security_policy.err_invalid_duration'));
      return;
    }
    if (!orgName) {
      Alert.alert(t('common.error'), t('security_policy.err_missing_org'));
      return;
    }
    const payload = { ownerJwtValiditySeconds: ownerSeconds };
    if (isOrgAdmin) {
      const adminSeconds = adminHours.trim() === '' ? null : parseInt(adminHours, 10) * 3600;
      if (adminSeconds !== null && (isNaN(adminSeconds) || adminSeconds <= 0)) {
        Alert.alert(t('common.invalid_input'), t('security_policy.err_invalid_admin_duration'));
        return;
      }
      payload.adminJwtValiditySeconds = adminSeconds;
    }
    setPolicyLoading(true);
    try {
      await organisationApi.updateCareSiteJwtValidity(orgName, careSite.careSiteCode, payload, token);
      setCurrentCareSite(prev => ({ ...prev, ...payload }));
      setEditingPolicy(false);
    } catch (err) {
      Alert.alert(t('common.error'), err.message || t('security_policy.err_save_failed'));
    } finally {
      setPolicyLoading(false);
    }
  };

  if (!careSite) return null;

  const stats = [
    { label: t('caresite.beds'), value: careSite.beds || 0, icon: <IconBed size={16} /> },
    { label: t('caresite.wards'), value: careSite.wards || 0, icon: <IconDoor size={16} /> },
    { label: t('caresite.devices'), value: careSite.devices || 0, icon: <IconPulse size={16} /> },
  ];

  const address = careSite.myAddress || {};
  const contact = careSite.myContact || {};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.iconBox}>
              <IconCareSite size={32} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.careSiteName}>{careSite.careSiteName}</Text>
              <Text style={styles.careSiteCode}>{careSite.careSiteCode}</Text>
            </View>
            <StatusPill status={careSite.status || 'ACTIVE'} />
          </View>
          
          {careSite.description && (
            <Text style={styles.description}>{careSite.description}</Text>
          )}

          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statBox}>
                <View style={styles.statIcon}>{s.icon}</View>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Contact Information */}
        <View style={styles.section}>
          <SectionHeader title={t('caresite.contact_section')} />
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <IconUser size={18} color={T.textDim} />
              <View>
                <Text style={styles.infoLabel}>{t('caresite.contact_role')}</Text>
                <Text style={styles.infoValue}>{contact.name || t('messages.not_assigned')}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <IconMail size={18} color={T.textDim} />
              <View>
                <Text style={styles.infoLabel}>{t('caresite.contact_email')}</Text>
                <Text style={styles.infoValue}>{contact.email || '—'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <IconPhone size={18} color={T.textDim} />
              <View>
                <Text style={styles.infoLabel}>{t('caresite.contact_phone')}</Text>
                <Text style={styles.infoValue}>{contact.phone || '—'}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <SectionHeader title={t('caresite.address_section')} />
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <IconLocation size={18} color={T.textDim} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{t('caresite.address_street')}</Text>
                <Text style={styles.infoValue}>
                  {address.street1}{address.street1 ? '\n' : ''}
                  {address.city}, {address.state} {address.pincode}{'\n'}
                  {address.country}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Security Policy */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionHeader title={t('security_policy.title')} />
            {!editingPolicy && (
              <Btn variant="ghost" size="sm" onPress={() => setEditingPolicy(true)}>{t('common.edit')}</Btn>
            )}
          </View>
          <Card style={styles.infoCard}>
            {/* Owner Session — editable by both ORG_OWNER and ORG_ADMIN */}
            {editingPolicy ? (
              <View style={styles.policyRow}>
                <Text style={styles.policyLabel}>{t('security_policy.owner_session')}:</Text>
                <View style={styles.policyInputRow}>
                  <RNTextInput
                    style={[styles.policyInput, { color: T.text, borderColor: T.border, backgroundColor: T.surface2 }]}
                    value={ownerHours}
                    onChangeText={setOwnerHours}
                    keyboardType="numeric"
                    placeholder={t('security_policy.hrs')}
                    placeholderTextColor={T.textFaint}
                    selectTextOnFocus
                  />
                  <Text style={styles.policyUnit}>{t('security_policy.hrs')}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.policyRow}>
                <Text style={styles.policyLabel}>{t('security_policy.owner_session')}:</Text>
                <Text style={styles.policyValue}>
                  {currentCareSite.ownerJwtValiditySeconds ? `${Math.round(currentCareSite.ownerJwtValiditySeconds / 3600)} ${t('security_policy.hrs')}` : t('security_policy.inherit_org')}
                </Text>
              </View>
            )}
            {/* Admin Session — editable only by ORG_ADMIN */}
            <View style={styles.policyDivider} />
            {editingPolicy && isOrgAdmin ? (
              <View style={styles.policyRow}>
                <Text style={styles.policyLabel}>{t('security_policy.admin_session')}:</Text>
                <View style={styles.policyInputRow}>
                  <RNTextInput
                    style={[styles.policyInput, { color: T.text, borderColor: T.border, backgroundColor: T.surface2 }]}
                    value={adminHours}
                    onChangeText={setAdminHours}
                    keyboardType="numeric"
                    placeholder={t('security_policy.inherit_org')}
                    placeholderTextColor={T.textFaint}
                    selectTextOnFocus
                  />
                  <Text style={styles.policyUnit}>{t('security_policy.hrs')}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.policyRow}>
                <Text style={styles.policyLabel}>{t('security_policy.admin_session')}:</Text>
                <Text style={styles.policyValue}>
                  {currentCareSite.adminJwtValiditySeconds ? `${Math.round(currentCareSite.adminJwtValiditySeconds / 3600)} ${t('security_policy.hrs')}` : t('security_policy.inherit_org')}
                </Text>
              </View>
            )}
            {editingPolicy && (
              <View style={styles.policyActions}>
                <Btn variant="surface" size="sm" style={{ flex: 1 }} onPress={() => setEditingPolicy(false)} disabled={policyLoading}>{t('common.cancel')}</Btn>
                <Btn variant="primary" size="sm" style={{ flex: 1 }} onPress={handleSavePolicy} disabled={policyLoading}>
                  {policyLoading ? <ActivityIndicator color="#fff" size="small" /> : t('common.save')}
                </Btn>
              </View>
            )}
            <View style={styles.policyDivider} />
            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>{t('security_policy.doctor_session')}:</Text>
              <Text style={styles.policyValue}>
                {currentCareSite.doctorJwtValiditySeconds ? `${Math.round(currentCareSite.doctorJwtValiditySeconds / 3600)} ${t('security_policy.hrs')}` : t('security_policy.inherit_org')}
              </Text>
            </View>
            <View style={styles.policyDivider} />
            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>{t('security_policy.nurse_session')}:</Text>
              <Text style={styles.policyValue}>
                {currentCareSite.nurseJwtValiditySeconds ? `${Math.round(currentCareSite.nurseJwtValiditySeconds / 3600)} ${t('security_policy.hrs')}` : t('security_policy.inherit_org')}
              </Text>
            </View>
            <View style={styles.policyDivider} />
            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>{t('security_policy.patient_session')}:</Text>
              <Text style={styles.policyValue}>
                {currentCareSite.patientJwtValiditySeconds ? `${Math.round(currentCareSite.patientJwtValiditySeconds / 3600)} ${t('security_policy.hrs')}` : t('security_policy.inherit_org')}
              </Text>
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="surface" style={{ flex: 1 }} onPress={onBack}>
            {t('actions.back_to_list')}
          </Btn>
          {onAddAdmin && (
            <Btn variant="tonal" style={{ flex: 1 }} onPress={onAddAdmin}>
              {t('actions.create_caresite_admin')}
            </Btn>
          )}
          <Btn variant="primary" style={{ flex: 1 }} onPress={onEdit}>
            {t('actions.manage_console')}
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
    backgroundColor: '#14B8A6', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  careSiteName: { fontSize: 20, fontWeight: '700', color: T.text },
  careSiteCode: { fontSize: 13, color: T.textDim, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  description: { fontSize: 13, color: T.textDim, lineHeight: 20, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20, borderTopWidth: 1, borderTopColor: T.borderSoft, paddingTop: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statIcon: { marginBottom: 4, opacity: 0.6 },
  statLabel: { fontSize: 10, color: T.textFaint, fontWeight: '600', textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: '700', color: T.text, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  section: { marginBottom: 24 },
  infoCard: { padding: 0, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 16 },
  infoLabel: { fontSize: 11, color: T.textDim, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: T.text, lineHeight: 20 },
  divider: { height: 1, backgroundColor: T.borderSoft, marginLeft: 48 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  policyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  policyLabel: { fontSize: 14, color: T.textDim },
  policyValue: { fontSize: 14, fontWeight: '600', color: T.text },
  policyDivider: { height: 1, backgroundColor: T.borderSoft },
  policyInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  policyInput: { width: 60, height: 36, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  policyUnit: { fontSize: 13, color: T.textDim },
  policyActions: { flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: T.borderSoft },
  actionRow: { flexDirection: 'row', gap: 12 },
});
