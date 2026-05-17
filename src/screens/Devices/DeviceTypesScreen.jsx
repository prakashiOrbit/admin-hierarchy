import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Btn } from '../../components/Shared';
import { IconCpu, IconActivity, IconPlus, IconChevron } from '../../icons';

export const DeviceTypesScreen = ({ onCreate }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');

  const types = [
    { id: '1', name: 'Comen-V4', category: 'PMS', vendor: 'Comen', firmware: '1.0.0' },
    { id: '2', name: 'iT-V4-Pro', category: 'PMS', vendor: 'iOrbit', firmware: '2.4.1' },
    { id: '3', name: 'SmartECG-90', category: 'ECG', vendor: 'BioTech', firmware: '1.2.0' },
  ].filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: 20 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search device profiles..."
          />
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title="Hardware Profiles" subtitle="Supported IoMT devices" />
          <Btn 
            variant="primary" 
            size="sm" 
            style={styles.newBtn}
            onPress={onCreate}
          >
            <IconPlus size={14} color="#FFF" />
             New Type
          </Btn>
        </View>

        <View style={styles.list}>
          {types.map(t => (
            <Card key={t.id}>
              <View style={styles.typeRow}>
                <View style={styles.typeIcon}>
                  <IconCpu size={20} color={T.accent} />
                </View>
                <View style={styles.typeInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.typeName}>{t.name}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{t.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.typeMeta}>{t.vendor} · v{t.firmware}</Text>
                </View>
                <IconChevron size={18} color={T.textFaint} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  newBtn: { flexDirection: 'row', gap: 4, height: 32, paddingHorizontal: 10 },
  list: { gap: 10 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typeIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  typeInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeName: { fontSize: 14, fontWeight: '600', color: T.text },
  categoryBadge: { backgroundColor: T.accentSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  categoryText: { fontSize: 9, color: T.accent, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  typeMeta: { fontSize: 12, color: T.textDim, marginTop: 4 },
});
