import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, SearchBar, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconBed, IconPlus, IconChevron } from '../../icons';
import { nursingStationApi } from '../../services/api';

export const NursingStationsScreen = ({ onNewStation, onSelectStation }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const fetchAll = useCallback(async () => {
    if (!user?.orgName || !user?.careSiteCode) return;
    setLoading(true);
    setError(null);
    try {
      const res = await nursingStationApi.listAll(user.orgName, user.careSiteCode, token)
        .catch(e => {
          const msg = (e.message || '').toLowerCase();
          if (msg.includes('not found') || msg.includes('no station') || msg.includes('notfound')) return [];
          throw e;
        });
      setStations(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
    } catch (e) {
      setError(e.message || t('messages.error_load_stations'));
    } finally {
      setLoading(false);
    }
  }, [user?.orgName, user?.careSiteCode, token, t]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = stations.filter(s =>
    s.stationNumber?.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={T.accent} /></View>;

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error}</Text>
      <Btn variant="surface" size="sm" onPress={fetchAll}>{t('actions.retry')}</Btn>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: 20 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder={t('placeholders.search_stations')} />
        </View>

        <View style={styles.headerRow}>
          <SectionHeader
            title={t('nursingstation.title')}
            subtitle={t('nursingstation.count', { count: filtered.length })}
          />
          <Btn variant="primary" size="sm" style={styles.newBtn} onPress={onNewStation}>
            <IconPlus size={14} color="#FFF" /> {t('actions.new_station')}
          </Btn>
        </View>

        <View style={styles.list}>
          {filtered.map((s, idx) => (
            <Card key={s.stationId || s.stationNumber || idx} onPress={() => onSelectStation?.(s)}>
              <View style={styles.itemRow}>
                <View style={styles.iconBox}>
                  <IconBed size={20} color={T.accent} />
                </View>
                <View style={styles.infoBox}>
                  <View style={styles.titleRow}>
                    <Text style={styles.stationNumber}>{s.stationNumber}</Text>
                    <StatusPill status={s.stationStatus || 'ACTIVE'} />
                  </View>
                  <Text style={styles.meta}>
                    {s.wardCode
                      ? `${t('nursingstation.ward')}: ${s.wardCode}`
                      : t('nursingstation.no_ward')}
                  </Text>
                </View>
                <IconChevron size={18} color={T.textFaint} />
              </View>
            </Card>
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <IconBed size={48} color={T.textFaint} />
              <Text style={styles.emptyTitle}>{t('nursingstation.none_found')}</Text>
              <Text style={styles.emptyHint}>{t('nursingstation.none_hint')}</Text>
              <Btn
                variant="primary"
                size="md"
                style={{ marginTop: 24, paddingHorizontal: 32 }}
                onPress={onNewStation}
              >
                <IconPlus size={16} color="#FFF" /> {t('actions.new_station')}
              </Btn>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: T.bad, fontSize: 13, textAlign: 'center', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  newBtn: { flexDirection: 'row', gap: 4, paddingHorizontal: 10 },
  list: { gap: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  infoBox: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  stationNumber: { fontSize: 14, fontWeight: '600', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  meta: { fontSize: 11.5, color: T.textDim, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: T.text, marginTop: 12 },
  emptyHint: { fontSize: 13, color: T.textDim, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
