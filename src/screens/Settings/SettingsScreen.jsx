import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { LanguageSheet } from '../../components/LanguageSheet';
import { IconUser, IconShield, IconLock, IconMoon, IconGlobe, IconChevron, IconLogout } from '../../icons';

export const SettingsScreen = ({ onLogout }) => {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const { user, locale, changeLanguage } = useAuth();
  const { t } = useTranslation();
  const styles = createStyles(T);
  
  const [showLanguage, setShowLanguage] = useState(false);
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SectionHeader title={t('settings.account')} />
        
        <Card style={styles.listCard}>
          {[
            { label: t('settings.profile'), sub: user?.userName || 'User', icon: <IconUser size={18} color={T.accent} /> },
            { label: t('settings.security'), sub: t('settings.security_2fa_active'), icon: <IconShield size={18} color={T.accent} /> },
            { label: t('settings.api_keys'), sub: t('settings.manage_integrations'), icon: <IconLock size={18} color={T.accent} /> },
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

        <SectionHeader title={t('settings.preferences')} />
        
        <Card style={styles.listCard}>
          {[
            { 
              label: t('settings.theme'), 
              sub: isDark ? t('settings.theme_dark') : t('settings.theme_light'), 
              icon: <IconMoon size={18} color={T.accent} />,
              onPress: toggleTheme 
            },
            { 
              label: t('settings.language'), 
              sub: t(`languages.${locale || 'en'}`), 
              icon: <IconGlobe size={18} color={T.accent} />,
              onPress: () => setShowLanguage(true) 
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
          <IconLogout size={18} color={T.bad} />
           {t('common.logout')}
        </Btn>

        <View style={styles.footer}>
          <Text style={styles.footerText}>iOrbit Tech Admin</Text>
          <Text style={styles.footerText}>© 2026 iOrbit Digital Technologies</Text>
        </View>
      </ScrollView>

      <LanguageSheet 
        visible={showLanguage}
        onClose={() => setShowLanguage(false)}
        currentLanguage={locale || 'en'}
        onSelect={changeLanguage}
      />
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
