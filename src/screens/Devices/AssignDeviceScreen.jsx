import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SearchBar, Btn, Avatar } from '../../components/Shared';
import { IconGateway, IconPatient, IconPulse, IconChevron } from '../../icons';
import { deviceApi, bedApi, patientApi } from '../../services/api';

const STEPS = ['device', 'bed', 'patient'];

export const AssignDeviceScreen = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [devices, setDevices] = useState([]);
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [step, setStep] = useState('device');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
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
      patientApi.listAll(user.orgName, user.hospitalCode, token).catch(e => {
        const msg = (e.message || '').toLowerCase();
        if (msg.includes('not found') || msg.includes('no patient')) return [];
        throw e;
      }),
    ])
      .then(([dRes, bRes, pRes]) => {
        if (cancelled) return;
        setDevices(Array.isArray(dRes) ? dRes : (Array.isArray(dRes?.data) ? dRes.data : []));
        const allBeds = Array.isArray(bRes) ? bRes : (Array.isArray(bRes?.data) ? bRes.data : []);
        setBeds(allBeds.filter(b => b.bedStatus === 'ACTIVE'));
        const assignedPatientCodes = new Set(
          allBeds.filter(b => b.patientCode).map(b => b.patientCode)
        );
        const allPatients = Array.isArray(pRes) ? pRes : (Array.isArray(pRes?.data) ? pRes.data : []);
        setPatients(allPatients.filter(p => !assignedPatientCodes.has(p.patientCode)));
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
    if (step === 'bed') return beds.filter(b =>
      b.bedCode?.toLowerCase().includes(q) || b.wardCode?.toLowerCase().includes(q)
    );
    return patients.filter(p =>
      p.patientCode?.toLowerCase().includes(q) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.mrNumber || '').toLowerCase().includes(q)
    );
  })();

  const goBack = () => {
    setQuery('');
    if (step === 'patient') { setStep('bed'); setSelectedPatient(null); }
    else if (step === 'bed') { setStep('device'); setSelectedBed(null); }
    else onCancel();
  };

  const handleFinish = async () => {
    if (!selectedDevice || !selectedBed || !selectedPatient) return;
    setSaving(true);
    try {
      await bedApi.assignPatient(user.orgName, user.hospitalCode, selectedBed.bedCode, {
        patientCode: selectedPatient.patientCode,
        wardCode: selectedBed.wardCode,
        gatewayCode: selectedBed.gatewayCode,
        devices: [{ deviceCode: selectedDevice.deviceCode }],
      }, token);
      Alert.alert(
        t('common.success'),
        `Device ${selectedDevice.deviceCode} assigned to ${selectedPatient.firstName} ${selectedPatient.lastName} on bed ${selectedBed.bedCode}.`,
        [{ text: t('common.ok'), onPress: onSuccess || onCancel }]
      );
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Assignment failed.');
    } finally {
      setSaving(false);
    }
  };

  const stepIndex = STEPS.indexOf(step);
  const stepTitles = { device: 'Select Device', bed: 'Select Bed', patient: 'Select Patient' };
  const subtitle = [
    selectedDevice?.deviceCode,
    selectedBed ? `Bed ${selectedBed.bedCode}` : null,
    selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : null,
  ].filter(Boolean).join(' → ') || 'Choose a device, bed, and patient';

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
          <Text style={styles.stepTitle}>{stepTitles[step]}</Text>
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
          placeholder={step === 'device' ? 'Search devices…' : step === 'bed' ? 'Search beds…' : 'Search patients…'}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          {step === 'device' && filtered.map(d => (
            <Card
              key={d.deviceCode}
              style={styles.itemCard}
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
          ))}

          {step === 'bed' && filtered.map(b => (
            <Card
              key={b.bedCode}
              style={styles.itemCard}
              onPress={() => { setSelectedBed(b); setStep('patient'); setQuery(''); }}
            >
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: T.accentSoft }]}>
                  <IconGateway size={20} color={T.accent} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{b.bedCode}</Text>
                  <Text style={styles.meta}>{b.wardCode} · {b.gatewayCode ? `GW: ${b.gatewayCode}` : 'No gateway'}</Text>
                </View>
                <IconChevron size={20} color={T.textDim} />
              </View>
            </Card>
          ))}

          {step === 'patient' && filtered.map(p => {
            const isActive = selectedPatient?.patientCode === p.patientCode;
            return (
              <Card
                key={p.patientCode}
                style={[styles.itemCard, isActive && styles.activeCard]}
                onPress={() => setSelectedPatient(p)}
              >
                <View style={styles.row}>
                  <Avatar name={`${p.firstName} ${p.lastName}`} size={40} />
                  <View style={styles.info}>
                    <Text style={styles.name}>{p.firstName} {p.lastName}</Text>
                    <Text style={styles.meta}>{p.patientCode}{p.mrNumber ? ` · MR: ${p.mrNumber}` : ''}</Text>
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
          {step === 'patient' && (
            <Btn
              style={{ flex: 2 }}
              onPress={handleFinish}
              disabled={!selectedPatient || saving}
            >
              {saving ? t('common.saving') : 'Assign'}
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
