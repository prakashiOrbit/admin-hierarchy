import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { IconUser, IconShield, IconLock, IconMoon, IconGlobe, IconChevron, IconLogout } from '../../icons';

export const SettingsScreen = ({ onLogout }) => {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const styles = createStyles(T);
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SectionHeader title="Account" />
        
        <Card style={styles.listCard}>
          {[
            { label: 'Profile', sub: 'Dr. Marcus Chen', icon: <IconUser size={18} color={T.accent} /> },
            { label: 'Security', sub: '2FA Active', icon: <IconShield size={18} color={T.accent} /> },
            { label: 'API Keys', sub: 'Manage integrations', icon: <IconLock size={18} color={T.accent} /> },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.listItem, i > 0 && styles.listBorder]}>
              <View style={styles.iconContainer}>{item.icon}</View>
              <View style={styles.listItemContent}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemSub}>{item.sub}</Text>
              </View>
              <IconChevron size={18} color={T.textFaint} />
            </TouchableOpacity>
          ))}
        </Card>

        <View style={styles.spacer} />

        <SectionHeader title="Preferences" />
        
        <Card style={styles.listCard}>
          {[
            { 
              label: 'Theme', 
              sub: isDark ? 'Dark' : 'Light', 
              icon: <IconMoon size={18} color={T.accent} />,
              onPress: toggleTheme 
            },
            { 
              label: 'Language', 
              sub: 'English (US)', 
              icon: <IconGlobe size={18} color={T.accent} />,
              onPress: () => {} 
            },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.listItem, i > 0 && styles.listBorder]} onPress={item.onPress}>
              <View style={styles.iconContainer}>{item.icon}</View>
              <View style={styles.listItemContent}>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              <Text style={styles.itemValue}>{item.sub}</Text>
              <IconChevron size={18} color={T.textFaint} />
            </TouchableOpacity>
          ))}
        </Card>

        <View style={styles.spacer} />

        <Btn 
          variant="surface" 
          style={styles.logoutBtn} 
          onPress={onLogout}
        >
          <IconLogout size={18} color={T.error} />
           Log out
        </Btn>

        <View style={styles.footer}>
          <Text style={styles.footerText}>iOrbit Admin · v3.4.2 · build 28491</Text>
          <Text style={styles.footerText}>© 2026 iOrbit Technologies</Text>
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
    paddingBottom: 40,
  },
  listCard: {
    backgroundColor: T.surface,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  listBorder: {
    borderTopWidth: 1,
    borderTopColor: T.borderSoft,
  },
  iconContainer: {
  },
  listItemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  itemSub: {
    fontSize: 11,
    color: T.textFaint,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  itemValue: {
    fontSize: 12,
    color: T.textDim,
  },
  spacer: {
    height: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: T.textFaint,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
  },
});
