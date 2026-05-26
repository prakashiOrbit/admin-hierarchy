import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, SearchBar, Btn, Avatar } from '../../components/Shared';
import { IconStethoscope, IconPatient, IconChevron } from '../../icons';
import { doctorApi, patientApi, assignmentApi } from '../../services/api';

export const AssignmentScreen = ({
  initialDoctorId,
  initialPatientId,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [step, setStep] = useState(initialDoctorId ? 'patient' : 'doctor');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatients, setSelectedPatients] = useState(
    initialPatientId ? [initialPatientId] : []
  );
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      doctorApi.listAll(user.orgName, user.hospitalCode, token),
      patientApi.listAll(user.orgName, user.hospitalCode, token),
    ])
      .then(([docs, pats]) => {
        if (cancelled) return;
        const docList = Array.isArray(docs) ? docs : [];
        const patList = Array.isArray(pats) ? pats : [];
        setDoctors(docList);
        setPatients(patList);
        if (initialDoctorId) {
          const found = docList.find(d => d.doctorCode === initialDoctorId);
          if (found) setSelectedDoctor(found);
        }
      })
      .catch(err => { if (!cancelled) setError(err.message || t('common.load_failed')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.orgName, user?.hospitalCode, token]);

  const filteredDoctors = doctors.filter(d =>
    (`${d.firstName} ${d.lastName}`).toLowerCase().includes(query.toLowerCase()) ||
    d.doctorCode?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPatients = patients.filter(p =>
    (`${p.firstName} ${p.lastName}`).toLowerCase().includes(query.toLowerCase()) ||
    p.patientCode?.toLowerCase().includes(query.toLowerCase())
  );

  const togglePatient = (code) => {
    setSelectedPatients(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleFinish = async () => {
    if (!selectedDoctor || selectedPatients.length === 0) return;
    if (!user?.orgName || !user?.hospitalCode) return;
    setSaving(true);
    const payload = selectedPatients.map(patientCode => ({
      doctorCode: selectedDoctor.doctorCode,
      patientCode,
    }));
    try {
      await assignmentApi.assign(user.orgName, user.hospitalCode, payload, token);
      Alert.alert(
        t('common.success'),
        t('assignments.assigned_success_msg', { name: selectedDoctor.lastName, count: selectedPatients.length }),
        [{ text: t('common.ok'), onPress: onSuccess || onCancel }]
      );
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('assignments.failed_msg'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.accent} />
      </View>
    );
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
            {step === 'doctor' ? t('assignments.step1_title') : t('assignments.step2_title')}
          </Text>
          <Text style={styles.stepSubtitle}>
            {selectedDoctor
              ? t('assignments.assigned_to_dr', { name: selectedDoctor.lastName })
              : t('assignments.choose_doctor')}
            {selectedPatients.length > 0 && ` · ${t('assignments.patients_selected', { count: selectedPatients.length })}`}
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, step === 'doctor' && styles.dotActive]} />
          <View style={[styles.progressDot, step === 'patient' && styles.dotActive]} />
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder={step === 'doctor' ? t('shifts.search_doctors') : t('actions.search_patients')}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'doctor' ? (
          <View style={styles.list}>
            {filteredDoctors.map(d => {
              const initials = `${d.firstName?.[0] ?? ''}${d.lastName?.[0] ?? ''}`.toUpperCase();
              const isActive = selectedDoctor?.doctorCode === d.doctorCode;
              return (
                <Card
                  key={d.doctorCode}
                  style={[styles.itemCard, isActive && styles.activeCard]}
                  onPress={() => { setSelectedDoctor(d); setStep('patient'); setQuery(''); }}
                >
                  <View style={styles.row}>
                    <Avatar initials={initials} color={T.accent} />
                    <View style={styles.info}>
                      <Text style={styles.name}>{t('common.dr_prefix')}{d.firstName} {d.lastName}</Text>
                      <Text style={styles.meta}>
                        {d.doctorCode} · {d.doctorSpeciality?.[0] ?? d.doctorType}
                      </Text>
                    </View>
                    <IconChevron size={20} color={T.textDim} />
                  </View>
                </Card>
              );
            })}
            {filteredDoctors.length === 0 && (
              <Text style={styles.emptyText}>{t('shifts.no_doctors')}</Text>
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredPatients.map(p => {
              const initials = `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase();
              const isSelected = selectedPatients.includes(p.patientCode);
              return (
                <Card
                  key={p.patientCode}
                  style={[styles.itemCard, isSelected && styles.activeCard]}
                  onPress={() => togglePatient(p.patientCode)}
                >
                  <View style={styles.row}>
                    <Avatar initials={initials} color={T.warn} />
                    <View style={styles.info}>
                      <Text style={styles.name}>{p.firstName} {p.lastName}</Text>
                      <Text style={styles.meta}>{p.patientCode} · {p.patientStatus}</Text>
                    </View>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <View style={styles.checkboxInner} />}
                    </View>
                  </View>
                </Card>
              );
            })}
            {filteredPatients.length === 0 && (
              <Text style={styles.emptyText}>{t('actions.no_patients')}</Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.actionRow}>
          <Btn
            style={{ flex: 1 }}
            variant="ghost"
            onPress={step === 'patient' && !initialDoctorId ? () => { setStep('doctor'); setQuery(''); } : onCancel}
          >
            {step === 'patient' && !initialDoctorId ? t('assignments.back_to_doctors') : t('common.cancel')}
          </Btn>
          <Btn
            style={{ flex: 2 }}
            onPress={handleFinish}
            disabled={!selectedDoctor || selectedPatients.length === 0 || saving}
          >
            {saving ? t('common.saving') : t('assignments.assign_btn', { count: selectedPatients.length || '' })}
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
