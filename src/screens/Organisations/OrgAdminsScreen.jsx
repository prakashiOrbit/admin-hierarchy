import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Avatar, RoleBadge, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconPlus, IconChevron } from '../../icons';
import { USERS } from '../../data/mock';

export const OrgAdminsScreen = ({ onSelectUser, onInvite }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');

  const admins = USERS.filter(u => 
    u.role === 'ORG_ADMIN' &&
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: 16 }}>
          <SearchBar 
            placeholder="Search administrators..."
            value={query}
            onChange={setQuery}
          />
        </View>

        <View style={styles.headerRow}>
          <SectionHeader title="ADMINISTRATORS" count={admins.length} />
          
          <Btn 
            variant="primary" 
            size="sm"
            style={styles.newBtn} 
            onPress={onInvite}
          >
            <IconPlus size={14} color="#fff" /> Create Org Admin
          </Btn>
        </View>

        <View style={styles.list}>
          {admins.map(u => (
            <Card key={u.id} onPress={() => onSelectUser(u.id)}>
              <View style={styles.userRow}>
                <Avatar initials={u.initials} size={40} />
                <View style={styles.userInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <RoleBadge role={u.role} />
                  </View>
                  <Text style={styles.userEmail}>{u.email}</Text>
                  <View style={styles.badgesRow}>
                    <StatusPill status={u.status} />
                  </View>
                </View>
                <IconChevron size={16} color={T.textFaint} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newBtn: {
    flexDirection: 'row',
    gap: 4,
    height: 32,
    paddingHorizontal: 10,
  },
  list: {
    gap: 10,
  },
  userRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  userEmail: {
    fontSize: 11,
    color: T.textFaint,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
});
