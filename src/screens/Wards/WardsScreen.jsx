import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, SearchBar, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconDoor, IconPlus, IconBed, IconGateway, IconChevron, IconEdit } from '../../icons';
import { wardApi, bedApi } from '../../services/api';
import { BedActionsSheet } from '../../components/BedActionsSheet';

export const WardsScreen = ({ onNewWard, onNewBed, onEditWard }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { user, token } = useAuth();

  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [expandedWard, setExpandedWard] = useState(null);
  const [bedsByWard, setBedsByWard] = useState({});
  const [loadingBeds, setLoadingBeds] = useState({});
  const [selectedBed, setSelectedBed] = useState(null);

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) return;
    setLoading(true);
    setError(null);
    wardApi.listAll(user.orgName, user.hospitalCode, token)
      .then(res => {
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.wards) ? res.wards : []));
        setWards(list);
      })
      .catch(e => {
        const msg = (e.message || '').toLowerCase();
        // If backend throws an error for "no wards" or "not found", treat as empty list
        if (msg.includes('no_wards') || msg.includes('notfound') || msg.includes('not found') || msg.includes('no wards')) {
          setWards([]);
        } else {
          setError(e.message);
        }
      })
      .finally(() => setLoading(false));
  }, [user?.orgName, user?.hospitalCode, token]);

  const handleExpand = (wardCode) => {
    const isExpanded = expandedWard === wardCode;
    setExpandedWard(isExpanded ? null : wardCode);

    if (!isExpanded && !bedsByWard[wardCode]) {
      setLoadingBeds(prev => ({ ...prev, [wardCode]: true }));
      bedApi.getAllBedsByWard(user.orgName, user.hospitalCode, wardCode, token)
        .then(res => {
          const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.beds) ? res.beds : []));
          setBedsByWard(prev => ({ ...prev, [wardCode]: list }));
        })
        .catch(() => setBedsByWard(prev => ({ ...prev, [wardCode]: [] })))
        .finally(() => setLoadingBeds(prev => ({ ...prev, [wardCode]: false })));
    }
  };

  const filtered = wards.filter(w =>
    w && (
      w.wardName?.toLowerCase().includes(query.toLowerCase()) ||
      w.wardCode?.toLowerCase().includes(query.toLowerCase())
    )
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={T.accent} /></View>;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('messages.failed_load_wards')}: {error}</Text>
        <Btn variant="surface" size="sm" onPress={() => { setLoading(true); }}>{t('common.retry')}</Btn>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: 20 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder={t('placeholders.search_wards')} />
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title={t('ward.wards_title')} subtitle={t('ward.units_count', { count: filtered.length })} />
          <Btn variant="primary" size="sm" style={styles.newBtn} onPress={onNewWard}>
            <IconPlus size={14} color="#FFF" /> {t('actions.new_ward')}
          </Btn>
        </View>

        <View style={styles.list}>
          {filtered.map((w, idx) => {
            if (!w) return null;
            const isExpanded = expandedWard === w.wardCode;
            const beds = bedsByWard[w.wardCode] || [];

            return (
              <View key={w.wardCode || idx} style={{ marginBottom: 12 }}>
                <Card>
                  <View style={styles.wardRow}>
                    <TouchableOpacity
                      style={styles.wardExpandArea}
                      activeOpacity={0.7}
                      onPress={() => handleExpand(w.wardCode)}
                    >
                      <View style={styles.wardIcon}>
                        <IconDoor size={20} color={T.accent} />
                      </View>
                      <View style={styles.wardInfo}>
                        <View style={styles.titleRow}>
                          <Text style={styles.wardName}>{w.wardName}</Text>
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeText}>{w.wardType}</Text>
                          </View>
                        </View>
                        <Text style={styles.wardMeta}>{w.wardCode} · {w.numberOfBeds || 0} {t('ward.beds')}</Text>
                      </View>
                      <View style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}>
                        <IconChevron size={18} color={T.textFaint} />
                      </View>
                    </TouchableOpacity>
                    {onEditWard && (
                      <TouchableOpacity style={styles.editBtn} onPress={() => onEditWard(w)}>
                        <IconEdit size={16} color={T.textDim} />
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>

                {isExpanded && (
                  <View style={styles.bedsContainer}>
                    <View style={styles.bedsHeader}>
                      <Text style={styles.bedsTitle}>{t('ward.monitored_beds')}</Text>
                      <TouchableOpacity onPress={() => onNewBed(w.wardCode)}>
                        <Text style={styles.addBedText}>+ {t('actions.add_bed')}</Text>
                      </TouchableOpacity>
                    </View>

                    {loadingBeds[w.wardCode] ? (
                      <ActivityIndicator size="small" color={T.accent} style={{ marginVertical: 8 }} />
                    ) : beds.length > 0 ? beds.map((b, bIdx) => (
                      <TouchableOpacity
                        key={b.bedCode || bIdx}
                        style={styles.bedItem}
                        onPress={() => setSelectedBed({ bed: b, wardCode: w.wardCode })}
                        activeOpacity={0.7}
                      >
                        <IconBed size={14} color={T.textDim} />
                        <Text style={styles.bedCode}>{b.bedCode}</Text>
                        <View style={styles.gatewayInfo}>
                          <IconGateway size={12} color={T.textFaint} />
                          <Text style={styles.gatewayCode}>{b.gatewayCode || '—'}</Text>
                        </View>
                        <StatusPill status={b.bedStatus} />
                      </TouchableOpacity>
                    )) : (
                      <Text style={styles.noBeds}>{t('messages.no_beds_in_ward')}</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <IconDoor size={48} color={T.textFaint} />
              <Text style={styles.emptyTitle}>{t('messages.no_wards_found')}</Text>
              <Text style={styles.emptyHint}>
                {t('messages.no_wards_hospital_hint', { hospitalCode: user?.hospitalCode })} 
                {t('messages.create_ward_hint')}
              </Text>
              <Btn variant="primary" size="md" style={{ marginTop: 24, paddingHorizontal: 32 }} onPress={onNewWard}>
                <IconPlus size={16} color="#FFF" /> {t('actions.create_new_ward')}
              </Btn>
            </View>
          )}
        </View>
      </ScrollView>

      <BedActionsSheet
        bed={selectedBed?.bed}
        wardCode={selectedBed?.wardCode}
        visible={!!selectedBed}
        onClose={() => setSelectedBed(null)}
      />
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
  list: { gap: 0 },
  wardRow: { flexDirection: 'row', alignItems: 'center' },
  wardExpandArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  editBtn: { padding: 8 },
  wardIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  wardInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wardName: { fontSize: 14, fontWeight: '600', color: T.text },
  typeBadge: { backgroundColor: T.surface2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 9, color: T.textDim, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  wardMeta: { fontSize: 11.5, color: T.textDim, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  bedsContainer: {
    backgroundColor: T.surface, borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
    borderWidth: 1, borderTopWidth: 0, borderColor: T.borderSoft,
    marginTop: -8, padding: 12, paddingTop: 20, zIndex: -1,
  },
  bedsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bedsTitle: { fontSize: 10, fontWeight: '700', color: T.textFaint, letterSpacing: 0.5 },
  addBedText: { fontSize: 11, fontWeight: '600', color: T.accent },
  bedItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: T.borderSoft },
  bedCode: { flex: 1, fontSize: 13, color: T.text, fontWeight: '500', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  gatewayInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 12 },
  gatewayCode: { fontSize: 11, color: T.textFaint, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  noBeds: { fontSize: 12, color: T.textFaint, textAlign: 'center', paddingVertical: 10 },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: T.text, marginTop: 12 },
  emptyHint: { fontSize: 13, color: T.textDim, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
