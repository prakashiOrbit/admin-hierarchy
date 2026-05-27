import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, SearchBar, Btn, Avatar } from '../../components/Shared';
import { IconStethoscope, IconPlus, IconChevron, IconActivity } from '../../icons';
import { doctorApi } from '../../services/api';

export const DoctorsScreen = ({ onNewDoctor, onSelectDoctor }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) return;
    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(() => {
    setLoading(true);
    setError(null);
    doctorApi.listAll(user.orgName, user.hospitalCode, token, { signal: controller.signal })
      .then(data => { if (!cancelled) setDoctors(Array.isArray(data) ? data : []); })
      .catch(e => {
        if (e?.code === 'ABORTED') return;
        if (!cancelled) setError(e.message);
      })
      .finally(() => { if (!cancelled && !controller.signal.aborted) setLoading(false); });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [user?.orgName, user?.hospitalCode, token]);

  const filtered = doctors.filter(d =>
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
    d.doctorCode?.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.accent} /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: 16 }}>
          <SearchBar placeholder={t('placeholders.search_doctors')} value={query} onChangeText={setQuery} />
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title={t('entity.medical_staff')} count={filtered.length} />
          <Btn variant="primary" style={styles.newBtn} onPress={onNewDoctor}>
            <IconPlus size={14} color="#fff" /> {t('actions.new_doctor')}
          </Btn>
        </View>

        <View style={styles.list}>
          {filtered.map(d => {
            const initials = `${d.firstName?.[0] || ''}${d.lastName?.[0] || ''}`.toUpperCase();
            const specialities = Array.isArray(d.doctorSpeciality) ? d.doctorSpeciality : [];
            return (
              <Card key={d.doctorCode} onPress={() => onSelectDoctor(d.doctorCode)}>
                <View style={styles.doctorRow}>
                  <Avatar initials={initials} size={44} />
                  <View style={styles.doctorInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.doctorName}>{t('messages.dr_name', { firstName: d.firstName, lastName: d.lastName })}</Text>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{d.doctorType || t('entity.doctor')}</Text>
                      </View>
                    </View>
                    <Text style={styles.doctorMeta}>{d.doctorCode} · {t('entity.years_exp_short', { count: d.doctorExperience })}</Text>
                    {specialities.length > 0 && (
                      <View style={styles.specRow}>
                        <IconActivity size={12} color={T.textDim} />
                        <Text style={styles.specText}>{specialities.join(', ')}</Text>
                      </View>
                    )}
                  </View>
                  <IconChevron size={20} color={T.textFaint} />
                </View>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <IconStethoscope size={48} color={T.textFaint} />
              <Text style={styles.emptyTitle}>{t('messages.no_doctors_found')}</Text>
              <Text style={styles.emptyHint}>{t('messages.onboard_doctor_hint')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};


const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: T.error || '#ef4444', fontSize: 14, textAlign: 'center', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  newBtn: { flexDirection: 'row', gap: 4, height: 32, paddingHorizontal: 10 },
  list: { gap: 10 },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doctorInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  doctorName: { fontSize: 15, fontWeight: '600', color: T.text, flex: 1, marginRight: 8 },
  typeBadge: { backgroundColor: T.surface2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 9, color: T.textDim, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  doctorMeta: { fontSize: 11.5, color: T.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  specRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  specText: { fontSize: 11, color: T.textFaint, fontStyle: 'italic' },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: T.text, marginTop: 12 },
  emptyHint: { fontSize: 13, color: T.textDim, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
