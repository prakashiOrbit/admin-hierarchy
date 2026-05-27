import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { IconBack, IconDashboard, IconGlobe, IconPlus, IconSettings, IconUsers, IconShield, IconChart, IconHospital, IconBell, IconUser } from '../icons';

// --- Top Bar ---
export const TopBar = ({ title, subtitle, onLeadingPress, leading, onNotificationPress, onProfilePress }) => {
  const { theme: T } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(T);
  
  return (
    <View style={[styles.topBar, { paddingTop: insets.top, height: 56 + insets.top }]}>
      <TouchableOpacity onPress={onLeadingPress} style={styles.iconBtn}>
        {leading && React.cloneElement(leading, { color: T.text })}
      </TouchableOpacity>
      <View style={{ flex: 1, marginStart: 4 }}>
        <Text style={styles.topTitle}>{title}</Text>
        {subtitle && <Text style={styles.topSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.trailing}>
        <TouchableOpacity onPress={onNotificationPress} style={styles.iconBtn}>
          <IconBell color={T.textDim} size={20} />
          {/* Notification Dot */}
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onProfilePress} style={[styles.iconBtn, styles.profileBtn]}>
          <IconUser color={T.accent} size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Bottom Nav ---
export const BottomNav = ({ active, onChange, items }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(T);

  const defaultItems = [
    { id: 'home',     label: t('dashboard.home'),             icon: <IconDashboard /> },
    { id: 'orgs',     label: t('dashboard.organisations'),    icon: <IconGlobe /> },
    { id: 'new',      label: t('dashboard.new_organisation'), icon: <IconPlus /> },
    { id: 'settings', label: t('dashboard.system_settings'),  icon: <IconSettings /> },
  ];

  const displayItems = items || defaultItems;
  const pb = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.bottomNav, { paddingBottom: pb, height: 56 + pb }]}>
      {displayItems.map((item) => {
        const isActive = active === item.id;
        return (
          <TouchableOpacity 
            key={item.id}
            onPress={() => onChange(item.id)}
            style={styles.navItem}
          >
            <View style={[styles.navIconContainer, isActive && styles.navIconActive]}>
              {React.cloneElement(item.icon, { 
                size: 20, 
                color: isActive ? T.accent : T.textDim 
              })}
            </View>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.borderSoft,
    backgroundColor: T.bg,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
  },
  topSubtitle: {
    fontSize: 11,
    color: T.textDim,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    end: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.bad,
    borderWidth: 1,
    borderColor: T.bg,
  },
  profileBtn: {
    backgroundColor: T.surface2,
    borderWidth: 1,
    borderColor: T.borderSoft,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    borderTopColor: T.borderSoft,
    backgroundColor: T.bg,
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navIconContainer: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 16,
  },
  navIconActive: {
    backgroundColor: T.accentSoft,
  },
  navLabel: {
    fontSize: 8,
    fontWeight: '500',
    color: T.textDim,
  },
  navLabelActive: {
    color: T.text,
    fontWeight: '600',
  },
});
