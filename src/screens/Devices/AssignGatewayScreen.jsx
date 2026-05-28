import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SearchBar, Btn, Avatar } from '../../components/Shared';
import { IconGateway, IconPatient, IconChevron } from '../../icons';
import { gatewayApi, patientApi } from '../../services/api';

export const AssignGatewayScreen = ({ initialGatewayCode, onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [gateways, setGateways] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [step, setStep] = useState(initialGatewayCode ? 'patient' : 'gateway');
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      gatewayApi.listAll(user.orgName, user.hospitalCode, token).catch(e => {
        const msg = (e.message || '').toLowerCase();
        if (msg.includes('not found') || msg.includes('no gateway')) return [];
        throw e;
      }),
      patientApi.listAll(user.orgName, user.hospitalCode, token).catch(e => {
        const msg = (e.message || '').toLowerCase();
        if (msg.includes('not found') || msg.includes('no patient')) return [];
        throw e;
      }),
    ])
      .then(([gRes, pRes]) => {
        if (cancelled) return;
        const gList = Array.isArray(gRes) ? gRes : (Array.isArray(gRes?.data) ? gRes.data : []);
        const pList = Array.isArray(pRes) ? pRes : (Array.isArray(pRes?.data) ? pRes.data : []);
        setGateways(gList);
        setPatients(pList);
        if (initialGatewayCode) {
          const found = gList.find(g => g.gatewayCode === initialGatewayCode);
          if (found) setSelectedGateway(found);
        }
      })
      .catch(err => { if (!cancelled) setError(err.message || t('common.load_failed')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.orgName, user?.hospitalCode, token]);

  const filteredGateways = gateways.filter(g =>
    g.gatewayCode?.toLowerCase().includes(query.toLowerCase()) ||
    g.gatewayType?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPatients = patients.filter(p =>
    (`${p.firstName} ${p.lastName}`).toLowerCase().includes(query.toLowerCase()) ||
    p.patientCode?.toLowerCase().includes(query.toLowerCase())
  );

  const handleFinish = async () => {
    if (!selectedGateway || !selectedPatient) return;
    setSaving(true);
    try {
      await gatewayApi.assign(user.orgName, user.hospitalCode, {
        gatewayCode: selectedGateway.gatewayCode,
        patientCode: selectedPatient.patientCode,
      }, token);
      Alert.alert(
        t('common.success'),
        `Gateway ${selectedGateway.gatewayCode} assigned to ${selectedPatient.firstName} ${selectedPatient.lastName}.`,
        [{ text: t('common.ok'), onPress: onSuccess || onCancel }]
      );
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Assignment failed.');
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.stepTitle}>
            {step === 'gateway' ? 'Select Gateway' : 'Select Patient'}
          </Text>
          <Text style={styles.stepSubtitle}>
            {selectedGateway ? selectedGateway.gatewayCode : 'Choose a gateway'}
            {selectedPatient ? ` → ${selectedPatient.firstName} ${selectedPatient.lastName}` : ''}
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, step === 'gateway' && styles.dotActive]} />
          <View style={[styles.progressDot, step === 'patient' && styles.dotActive]} />
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder={step === 'gateway' ? 'Search gateways…' : 'Search patients…'}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'gateway' ? (
          <View style={styles.list}>
            {filteredGateways.map(g => {
              const isActive = selectedGateway?.gatewayCode === g.gatewayCode;
              return (
                <Card
                  key={g.gatewayCode}
                  style={[styles.itemCard, isActive && styles.activeCard]}
                  onPress={() => { setSelectedGateway(g); setStep('patient'); setQuery(''); }}
                >
                  <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: T.accentSoft }]}>
                      <IconGateway size={20} color={T.accent} />
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.name}>{g.gatewayCode}</Text>
                      <Text style={styles.meta}>{g.gatewayType} · {g.os}</Text>
                    </View>
                    <IconChevron size={20} color={T.textDim} />
                  </View>
                </Card>
              );
            })}
            {filteredGateways.length === 0 && (
              <Text style={styles.emptyText}>No gateways found.</Text>
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredPatients.map(p => {
              const initials = `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase();
              const isActive = selectedPatient?.patientCode === p.patientCode;
              return (
                <Card
                  key={p.patientCode}
                  style={[styles.itemCard, isActive && styles.activeCard]}
                  onPress={() => setSelectedPatient(p)}
                >
                  <View style={styles.row}>
                    <Avatar initials={initials} color={T.warn} />
                    <View style={styles.info}>
                      <Text style={styles.name}>{p.firstName} {p.lastName}</Text>
                      <Text style={styles.meta}>{p.patientCode} · {p.patientStatus}</Text>
                    </View>
                    <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
                      {isActive && <View style={styles.checkboxInner} />}
                    </View>
                  </View>
                </Card>
              );
            })}
            {filteredPatients.length === 0 && (
              <Text style={styles.emptyText}>No patients found.</Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.actionRow}>
          <Btn
            style={{ flex: 1 }}
            variant="ghost"
            onPress={step === 'patient' && !initialGatewayCode ? () => { setStep('gateway'); setQuery(''); } : onCancel}
          >
            {step === 'patient' && !initialGatewayCode ? '← Gateways' : t('common.cancel')}
          </Btn>
          <Btn
            style={{ flex: 2 }}
            onPress={handleFinish}
            disabled={!selectedGateway || !selectedPatient || saving}
          >
            {saving ? t('common.saving') : 'Assign Gateway'}
          </Btn>
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
