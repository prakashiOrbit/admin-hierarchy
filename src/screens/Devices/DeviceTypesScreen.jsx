import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { deviceTypeApi, getApiErrorMessage } from '../../services/api';
import { Card, SectionHeader, SearchBar, Btn } from '../../components/Shared';
import { IconCpu, IconActivity, IconPlus, IconChevron } from '../../icons';

export const DeviceTypesScreen = ({ onCreate, onSelect = () => {} }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [types, setTypes] = useState([]);
  const [error, setError] = useState(null);

  const fetchTypes = useCallback(async (showLoading = true) => {
    if (!user?.orgName) return;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const response = await deviceTypeApi.listTypes(user.orgName, token);
      // Assuming response is an array of device types
      setTypes(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Fetch device types error:', err);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.orgName, token, t]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTypes(false);
  };

  const filteredTypes = types.filter(t => 
    t.deviceType?.toLowerCase().includes(query.toLowerCase()) ||
    t.deviceVendor?.toLowerCase().includes(query.toLowerCase()) ||
    t.category?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('placeholders.search_device_profiles')}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} />
        }
      >
        <View style={styles.headerRow}>
          <SectionHeader title={t('entity.hardware_profiles')} subtitle={t('entity.hardware_profiles_subtitle')} />
          {onCreate && (
            <Btn
              variant="primary"
              size="sm"
              style={styles.newBtn}
              onPress={onCreate}
            >
              <IconPlus size={14} color="#FFF" />
               {t('actions.new_device_type')}
            </Btn>
          )}
        </View>

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={T.accent} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={[styles.errorText, { color: T.bad }]}>{error}</Text>
            <Btn variant="surface" size="sm" onPress={() => fetchTypes()} style={{ marginTop: 12 }}>
              {t('actions.retry')}
            </Btn>
          </View>
        ) : filteredTypes.length === 0 ? (
          <View style={styles.center}>
            <IconCpu size={48} color={T.textFaint} />
            <Text style={[styles.emptyText, { color: T.textDim }]}>
              {query ? t('messages.no_matching_device_types') : t('messages.no_hardware_profiles')}
            </Text>
            {!query && (
              {onCreate && (
                <Btn variant="tonal" size="sm" onPress={onCreate} style={{ marginTop: 16 }}>
                  {t('actions.create_first_profile')}
                </Btn>
              )}
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredTypes.map((t, idx) => (
              <Card key={t.id || idx} onPress={() => onSelect?.(t)}>
                <View style={styles.typeRow}>
                  <View style={styles.typeIcon}>
                    <IconCpu size={20} color={T.accent} />
                  </View>
                  <View style={styles.typeInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.typeName}>{t.deviceType}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{t.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.typeMeta}>{t.deviceVendor} · v{t.deviceFirmware}</Text>
                  </View>
                  <IconChevron size={18} color={T.textFaint} />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, flexGrow: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  newBtn: { flexDirection: 'row', gap: 4, paddingHorizontal: 10 },
  list: { gap: 10 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typeIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  typeInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeName: { fontSize: 14, fontWeight: '600', color: T.text },
  categoryBadge: { backgroundColor: T.accentSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  categoryText: { fontSize: 9, color: T.accent, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  typeMeta: { fontSize: 12, color: T.textDim, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  errorText: { fontSize: 14, textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 12 },
});
