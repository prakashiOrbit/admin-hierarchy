import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Field, Btn, SectionHeader } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconBed, IconBuilding, IconDoor, IconChevron, IconTrash } from '../../icons';
import { nursingStationApi, wardApi } from '../../services/api';

export const NursingStationDetailScreen = ({ station: initialStation, onBack }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [station, setStation] = useState(initialStation);
  const [mode, setMode] = useState('detail');
  const [wards, setWards] = useState([]);
  const [wardQuery, setWardQuery] = useState('');
  const [loadingWards, setLoadingWards] = useState(false);
  const [saving, setSaving] = useState(false);

  const enterAssign = useCallback(async () => {
    setMode('assign');
    setLoadingWards(true);
    try {
      const res = await wardApi.listAll(user.orgName, user.careSiteCode, token);
      setWards(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
    } catch {
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  }, [user?.orgName, user?.careSiteCode, token]);

  const handleAssignWard = async (ward) => {
    setSaving(true);
    try {
      await nursingStationApi.assignWard(
        user.orgName, user.careSiteCode, ward.wardCode, station.stationNumber, token,
      );
      setStation(prev => ({ ...prev, wardCode: ward.wardCode, stationStatus: 'ASSIGNED' }));
      setMode('detail');
      setWardQuery('');
      Alert.alert(t('alerts.success'), t('nursingstation.assign_success', { wardCode: ward.wardCode }));
    } catch (e) {
      Alert.alert(t('alerts.error'), e.message || t('nursingstation.assign_failed'));
    } finally {
      setSaving(false);
    }
  };

  const confirmUnassign = () => {
    Alert.alert(
      t('nursingstation.unassign_ward'),
      t('nursingstation.confirm_unassign', { wardCode: station.wardCode, stationNumber: station.stationNumber }),
      [
        { text: t('actions.cancel'), style: 'cancel' },
        {
          text: t('nursingstation.unassign_ward'), style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await nursingStationApi.unassignWard(
                user.orgName, user.careSiteCode, station.wardCode, station.stationNumber, token,
              );
              setStation(prev => ({ ...prev, wardCode: null, stationStatus: 'ACTIVE' }));
              Alert.alert(t('alerts.success'), t('nursingstation.unassign_success', { stationNumber: station.stationNumber }));
            } catch (e) {
              Alert.alert(t('alerts.error'), e.message || t('nursingstation.unassign_failed'));
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const filteredWards = wards.filter(w =>
    w.wardName?.toLowerCase().includes(wardQuery.toLowerCase()) ||
    w.wardCode?.toLowerCase().includes(wardQuery.toLowerCase())
  );

  if (mode === 'assign') {
    return (
      <View style={styles.container}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => { setMode('detail'); setWardQuery(''); }}>
            <Text style={styles.backLink}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.subTitle}>{t('nursingstation.assign_ward')}</Text>
        </View>
        <RNTextInput
          style={[styles.searchInput, { color: T.text, borderColor: T.borderSoft, backgroundColor: T.surface }]}
          placeholder={t('actions.search_wards')}
          placeholderTextColor={T.textFaint}
          value={wardQuery}
          onChangeText={setWardQuery}
        />
        {loadingWards
          ? <ActivityIndicator color={T.accent} style={{ marginTop: 24 }} />
          : (
            <ScrollView>
              {filteredWards.map(w => (
                <TouchableOpacity
                  key={w.wardCode}
                  style={styles.wardItem}
                  onPress={() => handleAssignWard(w)}
                  disabled={saving}
                >
                  <View style={[styles.wardItemIcon, { backgroundColor: T.surface2 }]}>
                    <IconDoor size={16} color={T.textDim} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wardItemName}>{w.wardName}</Text>
                    <Text style={styles.wardItemMeta}>{w.wardCode} · {w.wardType}</Text>
                  </View>
                  {saving
                    ? <ActivityIndicator size="small" color={T.accent} />
                    : <IconChevron size={14} color={T.textFaint} />}
                </TouchableOpacity>
              ))}
              {filteredWards.length === 0 && !loadingWards && (
                <Text style={styles.emptyText}>{t('actions.no_wards')}</Text>
              )}
            </ScrollView>
          )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <IconBed size={24} color={T.accent} />
          <Text style={styles.bannerText}>
            {t('nursingstation.detail_banner', { stationNumber: station.stationNumber })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('nursingstation.identity_section')}</Text>

          <Field label={t('nursingstation.station_number')}>
            <Card style={styles.readOnlyCard} padding={12}>
              <Text style={styles.readOnlyText}>{station.stationNumber}</Text>
            </Card>
          </Field>

          <Field label={t('ward.assigned_caresite')}>
            <Card style={styles.readOnlyCard} padding={12}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.readOnlyText}>{station.careSiteCode || user?.careSiteCode}</Text>
              </View>
            </Card>
          </Field>

          <Field label={t('common.status')}>
            <View style={{ paddingVertical: 10 }}>
              <StatusPill status={station.stationStatus || 'ACTIVE'} />
            </View>
          </Field>
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('nursingstation.ward_assignment_section')} />

          {station.wardCode ? (
            <>
              <Card style={styles.assignedWardCard} padding={14}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.wardItemIcon, { backgroundColor: T.accentSoft }]}>
                    <IconDoor size={18} color={T.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.assignedWardLabel}>{t('nursingstation.assigned_ward')}</Text>
                    <Text style={styles.assignedWardCode}>{station.wardCode}</Text>
                  </View>
                </View>
              </Card>
              <Btn
                variant="surface"
                style={styles.unassignBtn}
                onPress={confirmUnassign}
                disabled={saving}
              >
                <IconTrash size={15} color={T.bad} />
                <Text style={[styles.unassignText, { color: T.bad }]}>
                  {saving ? t('common.loading') : t('nursingstation.unassign_ward')}
                </Text>
              </Btn>
            </>
          ) : (
            <Btn variant="surface" onPress={enterAssign} disabled={saving}>
              <IconDoor size={15} color={T.accent} />
              <Text style={{ color: T.accent, fontWeight: '600', fontSize: 14 }}>
                {t('nursingstation.assign_ward')}
              </Text>
            </Btn>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1, padding: 16 },
  scrollContent: { paddingBottom: 40 },
  banner: {
    flexDirection: 'row', backgroundColor: T.accentSoft, padding: 14,
    borderRadius: 12, gap: 12, alignItems: 'flex-start', marginBottom: 24,
  },
  bannerText: { flex: 1, fontSize: 13, color: T.text, lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 16 },
  readOnlyCard: { height: 44, justifyContent: 'center', backgroundColor: T.surface2, borderColor: T.borderSoft },
  readOnlyText: { color: T.textDim, fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  assignedWardCard: { backgroundColor: T.surface, borderColor: T.borderSoft, marginBottom: 12 },
  assignedWardLabel: { fontSize: 10, fontWeight: '700', color: T.textFaint, letterSpacing: 0.5 },
  assignedWardCode: { fontSize: 14, fontWeight: '600', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 2 },
  unassignBtn: { flexDirection: 'row', gap: 8, borderWidth: 1, borderColor: T.bad + '40', backgroundColor: T.bad + '0D' },
  unassignText: { fontSize: 14, fontWeight: '600' },
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  backLink: { fontSize: 14, color: T.accent, fontWeight: '600' },
  subTitle: { fontSize: 15, fontWeight: '700', color: T.text },
  searchInput: { height: 40, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14, marginBottom: 10 },
  wardItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.borderSoft, gap: 12 },
  wardItemIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  wardItemName: { fontSize: 14, fontWeight: '600', color: T.text },
  wardItemMeta: { fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  emptyText: { color: T.textFaint, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
});
