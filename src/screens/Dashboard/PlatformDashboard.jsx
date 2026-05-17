import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Shared';
import { TopBar, BottomNav } from '../../components/Navigation';
import { OrganisationsScreen } from '../Organisations/OrganisationsScreen';
import { NewOrganisationScreen } from '../Organisations/NewOrganisationScreen';
import { OrgDetailScreen } from '../Organisations/OrgDetailScreen';
import { SettingsScreen } from '../Settings/SettingsScreen';
import { ORGS } from '../../data/mock';

import { 
  IconGlobe, IconHospital, IconUsers, IconPulse, IconPlus, 
  IconAlert, IconUser, IconMenu, IconSettings, IconDashboard, IconBack 
} from '../../icons';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const StatCard = ({ label, value, delta, icon, color, accent }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: accent || T.accentSoft }]}>
          {React.cloneElement(icon, { color: color || T.accent, size: 16 })}
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <View style={styles.statBody}>
        <Text style={styles.statValue}>{value}</Text>
        {delta && (
          <Text style={[styles.statDelta, { color: delta >= 0 ? T.good : T.bad }]}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </Text>
        )}
      </View>
    </Card>
  );
};

const HomeContent = ({ onNavigate }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const recentActivity = [
    { id: '1', icon: <IconHospital />, color: T.good, text: 'Cleveland Clinic onboarded', time: '2h ago', meta: 'cleveland-clinic' },
    { id: '2', icon: <IconPlus />, color: T.accent, text: 'Akron General hospital created', time: '4h ago', meta: 'CLV-AKR' },
    { id: '3', icon: <IconAlert />, color: T.warn, text: 'Gateway GW-CLV-005 flagged offline', time: '8h ago', meta: '12d uptime lost' },
    { id: '4', icon: <IconUser />, color: '#A78BFA', text: 'Org owner created for Aurora Health', time: '1d ago', meta: 'p.raghunathan' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Greeting Section */}
      <View style={styles.greetingHeader}>
        <View>
          <Text style={styles.date}>SAT, 16 MAY</Text>
          <Text style={styles.greeting}>Good morning, Marcus</Text>
          <Text style={styles.status}>
            <Text style={{ color: T.good, fontWeight: '700' }}>Platform health is nominal</Text> · 0 incidents
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <StatCard 
          label="Organisations" value="57" delta={4} 
          icon={<IconGlobe />} color="#A78BFA" accent="rgba(167,139,250,.14)" 
        />
        <StatCard 
          label="Hospitals" value="231" delta={5} 
          icon={<IconHospital />} color={T.accent} 
        />
        <StatCard 
          label="Users" value="4,118" delta={3} 
          icon={<IconUsers />} color="#2DD4BF" accent="rgba(45,212,191,.14)" 
        />
        <StatCard 
          label="Active devices" value="5,031" delta={1} 
          icon={<IconPulse />} color="#22D3EE" accent="rgba(34,211,238,.14)" 
        />
      </View>

      <View style={styles.section}>
        {/* Live Telemetry */}
        <Card style={styles.telemetryCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LIVE TELEMETRY</Text>
            <Text style={styles.streaming}>● STREAMING</Text>
          </View>
          <View style={styles.telemetryBody}>
            <View>
              <Text style={styles.telemetryValue}>182.4<Text style={styles.telemetryUnit}>k</Text></Text>
              <Text style={styles.telemetryLabel}>vitals events / min</Text>
            </View>
            <View style={styles.placeholderGraph} />
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.actionGrid}>
            <Card 
              style={styles.actionCard} 
              onPress={() => onNavigate('orgs')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(167,139,250,.14)' }]}>
                <IconGlobe color="#A78BFA" size={18} />
              </View>
              <Text style={styles.actionText}>Organisations</Text>
              <Text style={styles.actionSubtext}>Browse, search, audit</Text>
            </Card>
            <Card 
              style={styles.actionCard} 
              onPress={() => onNavigate('new')}
            >
              <View style={[styles.actionIcon, { backgroundColor: T.accentSoft }]}>
                <IconPlus color={T.accent} size={18} />
              </View>
              <Text style={styles.actionText}>New Organisation</Text>
              <Text style={styles.actionSubtext}>Onboard a tenant</Text>
            </Card>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        <Card style={styles.activityCard} padding={0}>
          {recentActivity.map((item, index) => (
            <View key={item.id} style={[styles.activityItem, index !== 0 && styles.activityBorder]}>
              <View style={[styles.activityIcon, { backgroundColor: `${item.color}15` }]}>
                {React.cloneElement(item.icon, { color: item.color, size: 14 })}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{item.text}</Text>
                <Text style={styles.activityMeta}>{item.meta}</Text>
              </View>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
};

export const PlatformDashboard = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = React.useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    const backAction = () => {
      if (drawerOpen) {
        toggleDrawer();
        return true;
      }
      if (selectedOrgId) {
        setSelectedOrgId(null);
        return true;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [drawerOpen, selectedOrgId, activeTab]);

  const toggleDrawer = () => {
    const toValue = drawerOpen ? -width : 0;
    Animated.timing(drawerAnim, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setDrawerOpen(!drawerOpen);
  };

  const handleTabChange = (tabId) => {
    setSelectedOrgId(null);
    setActiveTab(tabId);
  };

  const renderContent = () => {
    if (selectedOrgId) {
      return <OrgDetailScreen orgId={selectedOrgId} onBack={() => setSelectedOrgId(null)} />;
    }

    switch (activeTab) {
      case 'home': return <HomeContent onNavigate={handleTabChange} />;
      case 'orgs': return <OrganisationsScreen onSelectOrg={(id) => setSelectedOrgId(id)} />;
      case 'new': return <NewOrganisationScreen onComplete={() => handleTabChange('home')} />;
      case 'settings': return <SettingsScreen onLogout={() => navigation.replace('Login')} />;
      default: return <HomeContent onNavigate={handleTabChange} />;
    }
  };

  const getTitle = () => {
    if (selectedOrgId) {
      const org = ORGS.find(o => o.id === selectedOrgId);
      return org?.display || "Organisation Detail";
    }

    switch (activeTab) {
      case 'home': return "Platform Console";
      case 'orgs': return "Organisations";
      case 'new': return "New Organisation";
      case 'settings': return "System Settings";
      default: return "Platform Console";
    }
  };

  return (
    <View style={styles.container}>
      {/* Drawer Overlay */}
      {drawerOpen && (
        <TouchableOpacity 
          style={styles.drawerOverlay} 
          activeOpacity={1} 
          onPress={toggleDrawer} 
        />
      )}

      {/* Drawer Menu */}
      <Animated.View style={[styles.drawer, { width: width * 0.8, transform: [{ translateX: drawerAnim }] }]}>
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <View style={styles.drawerHeader}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>MA</Text>
            </View>
            <Text style={styles.drawerName}>Marcus Admin</Text>
            <Text style={styles.drawerRole}>Platform Administrator</Text>
          </View>
          
          <ScrollView style={styles.drawerMenu}>
            <TouchableOpacity 
              style={[styles.drawerItem, activeTab === 'home' && { backgroundColor: T.accentSoft }]}
              onPress={() => { handleTabChange('home'); toggleDrawer(); }}
            >
              <IconDashboard color={activeTab === 'home' ? T.accent : T.textDim} size={20} />
              <Text style={[styles.drawerItemText, activeTab === 'home' && { color: T.accent }]}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.drawerItem, activeTab === 'orgs' && { backgroundColor: T.accentSoft }]}
              onPress={() => { handleTabChange('orgs'); toggleDrawer(); }}
            >
              <IconGlobe color={activeTab === 'orgs' ? T.accent : T.textDim} size={20} />
              <Text style={[styles.drawerItemText, activeTab === 'orgs' && { color: T.accent }]}>Organisations</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.drawerItem}>
              <IconUsers color={T.textDim} size={20} />
              <Text style={styles.drawerItemText}>Platform Users</Text>
            </TouchableOpacity>
            
            <View style={styles.drawerDivider} />

            <TouchableOpacity 
              style={[styles.drawerItem, activeTab === 'settings' && { backgroundColor: T.accentSoft }]}
              onPress={() => { handleTabChange('settings'); toggleDrawer(); }}
            >
              <IconSettings color={activeTab === 'settings' ? T.accent : T.textDim} size={20} />
              <Text style={[styles.drawerItemText, activeTab === 'settings' && { color: T.accent }]}>System Settings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>

      <TopBar 
        title={getTitle()} 
        leading={selectedOrgId ? <IconBack /> : <IconMenu />}
        onLeadingPress={selectedOrgId ? () => setSelectedOrgId(null) : toggleDrawer}
        onNotificationPress={() => console.log('Notifications')}
        onProfilePress={() => handleTabChange('settings')}
      />

      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      <BottomNav 
        active={activeTab} 
        onChange={handleTabChange} 
      />
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  greetingHeader: {
    marginBottom: 24,
  },
  date: {
    fontSize: 11,
    color: T.textDim,
    fontWeight: '600',
    letterSpacing: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: T.text,
    marginTop: 4,
  },
  status: {
    fontSize: 12,
    color: T.textDim,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '48.5%',
    padding: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: T.textDim,
    fontWeight: '600',
  },
  statBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: T.text,
  },
  statDelta: {
    fontSize: 10,
    fontWeight: '600',
  },
  telemetryCard: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: T.textDim,
    letterSpacing: 1,
    marginBottom: 12,
  },
  streaming: {
    fontSize: 9,
    color: T.good,
    fontWeight: '700',
  },
  telemetryBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  telemetryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: T.text,
  },
  telemetryUnit: {
    fontSize: 14,
    color: T.textDim,
    fontWeight: '500',
  },
  telemetryLabel: {
    fontSize: 11,
    color: T.textDim,
    marginTop: 2,
  },
  placeholderGraph: {
    width: 120,
    height: 40,
    backgroundColor: T.surface2,
    borderRadius: 8,
    opacity: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    gap: 8,
  },
  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  actionSubtext: {
    fontSize: 11,
    color: T.textDim,
  },
  activityCard: {
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  activityBorder: {
    borderTopWidth: 1,
    borderTopColor: T.borderSoft,
  },
  activityIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: T.text,
    fontWeight: '500',
  },
  activityMeta: {
    fontSize: 11,
    color: T.textFaint,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: T.textFaint,
  },
  drawerOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: T.surface,
    zIndex: 20,
    borderRightWidth: 1,
    borderRightColor: T.border,
  },
  drawerHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: T.borderSoft,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: T.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  drawerName: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
  },
  drawerRole: {
    fontSize: 12,
    color: T.textDim,
    marginTop: 4,
  },
  drawerMenu: {
    flex: 1,
    padding: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 12,
  },
  drawerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: T.borderSoft,
    marginVertical: 12,
    marginHorizontal: 12,
  },
});
