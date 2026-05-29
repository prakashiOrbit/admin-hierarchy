import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SearchBar, Btn, Avatar } from '../../components/Shared';
import { IconGateway, IconPatient, IconPulse, IconChevron } from '../../icons';
import { deviceApi } from '../../services/api';

const STEPS = ['device', 'bed'];

export const AssignDeviceScreen = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [devices, setDevices] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [step, setStep] = useState('device');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      deviceApi.listUnassigned(user.orgName, user.hospitalCode, token).catch(e => {
        const msg = (e.message || '').toLowerCase();
        if (msg.includes('not found') || msg.includes('no device')) return [];
        throw e;
      }),
      bedApi.listAll(user.orgName, user.hospitalCode, token).catch(e => {
        const msg = (e.message || '').toLowerCase();
        if (msg.includes('not found') || msg.includes('no bed')) return [];
        throw e;
      }),
    ])
      .then(([dRes, bRes]) => {
        if (cancelled) return;
        setDevices(Array.isArray(dRes) ? dRes : (Array.isArray(dRes?.data) ? dRes.data : []));
        setBeds(Array.isArray(bRes) ? bRes : (Array.isArray(bRes?.data) ? bRes.data : []));
      })
      .catch(err => { if (!cancelled) setError(err.message || t('common.load_failed')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.orgName, user?.hospitalCode, token]);

  const filtered = (() => {
    const q = query.toLowerCase();
    if (step === 'device') return devices.filter(d =>
      d.deviceCode?.toLowerCase().includes(q) || d.deviceType?.toLowerCase().includes(q)
    );
    return beds.filter(b =>
      b.bedCode?.toLowerCase().includes(q) || b.wardCode?.toLowerCase().includes(q)
    );
  })();

  const goBack = () => {
    setQuery('');
    if (step === 'bed') setStep('device');
    else onCancel();
  };

  const handleFinish = async () => {
    if (!selectedDevice || !selectedBed) return;
    if (!selectedBed.patientCode) {
      Alert.alert(
        'No Patient Assigned',
        `Bed ${selectedBed.bedCode} has no patient yet. Assign a patient to the bed first, then add the device.`,
        [{ text: 'OK' }]
      );
      return;
    }
    setSaving(true);
    try {
      await deviceApi.assign(user.orgName, user.hospitalCode, {
        deviceCode: selectedDevice.deviceCode,
        gatewayCode: selectedBed.gatewayCode,
        patientCode: selectedBed.patientCode,
      }, token);
      Alert.alert(
        t('common.success'),
        `Device ${selectedDevice.deviceCode} added to bed ${selectedBed.bedCode}.`,
        [{ text: t('common.ok'), onPress: onSuccess || onCancel }]
      );
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Assignment failed.');
    } finally {
      setSaving(false);
    }
  };

  const stepIndex = STEPS.indexOf(step);
  const stepTitle = step === 'device' ? 'Select Device' : 'Select Bed';
  const subtitle = [
    selectedDevice?.deviceCode,
    selectedBed ? `Bed ${selectedBed.bedCode}` : null,
  ].filter(Boolean).join(' → ') || 'Choose a device to add to a bed';

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: T.bad, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</Text>
        <Btn variant="surface" size="sm" onPress={onCancel}>{t('common.go_back')}</Btn>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stepperHeader}>
        <View style={styles.stepInfo}>
          <Text style={styles.stepTitle}>{stepTitle}</Text>
          <Text style={styles.stepSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.progressContainer}>
          {STEPS.map((s, i) => (
            <View key={s} style={[styles.progressDot, i <= stepIndex && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder={step === 'device' ? 'Search devices…' : 'Search beds…'}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          {step === 'device' && filtered.map(d => {
            const isActive = selectedDevice?.deviceCode === d.deviceCode;
            return (
              <Card
                key={d.deviceCode}
                style={[styles.itemCard, isActive && styles.activeCard]}
                onPress={() => { setSelectedDevice(d); setStep('bed'); setQuery(''); }}
              >
                <View style={styles.row}>
                  <View style={[styles.iconBox, { backgroundColor: T.accentSoft }]}>
                    <IconPulse size={20} color={T.accent} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{d.deviceCode}</Text>
                    <Text style={styles.meta}>{d.deviceType} · {d.protocol}</Text>
                  </View>
                  <IconChevron size={20} color={T.textDim} />
                </View>
              </Card>
            );
          })}

          {step === 'bed' && filtered.map(b => {
            const isActive = selectedBed?.bedCode === b.bedCode;
            return (
              <Card
                key={b.bedCode}
                style={[styles.itemCard, isActive && styles.activeCard]}
                onPress={() => setSelectedBed(b)}
              >
                <View style={styles.row}>
                  <View style={[styles.iconBox, { backgroundColor: T.accentSoft }]}>
                    <IconGateway size={20} color={T.accent} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{b.bedCode}</Text>
                    <Text style={styles.meta}>
                      {b.wardCode} · {b.patientCode ? `Patient: ${b.patientCode}` : 'No patient'}
                    </Text>
                  </View>
                  <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
                    {isActive && <View style={styles.checkboxInner} />}
                  </View>
                </View>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <Text style={styles.emptyText}>No {step}s found.</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.actionRow}>
          <Btn style={{ flex: 1 }} variant="ghost" onPress={goBack}>
            {step === 'device' ? t('common.cancel') : '← Back'}
          </Btn>
          {step === 'bed' && (
            <Btn
              style={{ flex: 2 }}
              onPress={handleFinish}
              disabled={!selectedBed || saving}
            >
              {saving ? t('common.saving') : 'Add Device to Bed'}
            </Btn>
          )}
        </View>
      </View>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stepperHeader: { padding: 16, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.borderSoft, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: T.text },
  stepSubtitle: { fontSize: 12, color: T.textDim, marginTop: 2 },
  progressContainer: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.border },
  dotActive: { backgroundColor: T.accent },
  searchWrap: { padding: 16, paddingBottom: 8 },
  scrollContent: { padding: 16, paddingTop: 8 },
  list: { gap: 10 },
  itemCard: { backgroundColor: T.surface, borderColor: T.borderSoft },
  activeCard: { borderColor: T.accent, backgroundColor: T.accentSoft },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: T.text },
  meta: { fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: T.accent, borderColor: T.accent },
  checkboxInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  emptyText: { color: T.textFaint, fontSize: 13, textAlign: 'center', marginTop: 24 },
  footer: { padding: 16, backgroundColor: T.bg, borderTopWidth: 1, borderTopColor: T.borderSoft },
  actionRow: { flexDirection: 'row', gap: 12 },
});
