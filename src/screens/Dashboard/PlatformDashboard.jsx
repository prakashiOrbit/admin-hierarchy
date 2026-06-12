import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, BackHandler, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Btn, getGreeting } from '../../components/Shared';
import { TopBar, BottomNav } from '../../components/Navigation';
import { OrganisationsScreen } from '../Organisations/OrganisationsScreen';
import { NewOrganisationScreen } from '../Organisations/NewOrganisationScreen';
import { OrgDetailScreen } from '../Organisations/OrgDetailScreen';
import { SettingsScreen } from '../Settings/SettingsScreen';
import { CreateOrgOwnerScreen } from '../Organisations/CreateOrgOwnerScreen';
import { organisationApi, summaryApi, getApiErrorMessage } from '../../services/api';
import { NotificationSheet } from '../../components/NotificationSheet';

import { 
  IconGlobe, IconCareSite, IconUsers, IconPulse, IconPlus, 
  IconAlert, IconUser, IconMenu, IconSettings, IconDashboard, IconBack 
} from '../../icons';

const { width } = Dimensions.get('window');

const StatCard = ({ label, value, delta, icon, color, accent }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(T);
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: accent || T.accentSoft }]}>
          {React.cloneElement(icon, { color: color || T.accent, size: 16 })}
        </View>
        <Text style={styles.statLabel}>{t(label)}</Text>
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
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  
  const [summary, setSummary] = useState(null);
  const [orgsCount, setOrgsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let summaryError = null;
        let orgsError = null;
        const summaryPromise = summaryApi.getPlatformSummary(token, { signal: controller.signal }).catch(err => {
          if (err?.code === 'ABORTED') throw err;
          console.error('Summary API error:', err);
          summaryError = err;
          return null;
        });
        
        const orgsPromise = organisationApi.listAll(token, { signal: controller.signal }).catch(err => {
          if (err?.code === 'ABORTED') throw err;
          console.error('Orgs API error:', err);
          orgsError = err;
          return [];
        });

        const [summaryData, orgsData] = await Promise.all([summaryPromise, orgsPromise]);
        if (cancelled) return;
        if (!summaryData && orgsError) {
          setError(getApiErrorMessage(summaryError || orgsError));
        }
        
        const orgList = Array.isArray(orgsData) ? orgsData : (Array.isArray(orgsData.data) ? orgsData.data : []);
        setOrgsCount(orgList.length);

        const relativeTime = (raw) => {
          if (!raw) return t('dashboard.just_now');
          // Numeric seconds  → multiply by 1000
          // Numeric ms       → use as-is
          // ISO string / any → parse with Date (handles "2026-05-17T10:23:45.000Z" etc.)
          const ms = typeof raw === 'number'
            ? (raw < 1e12 ? raw * 1000 : raw)
            : new Date(raw).getTime();
          if (isNaN(ms)) return t('dashboard.just_now');
          const diff = Date.now() - ms;
          const mins = Math.floor(diff / 60000);
          if (mins < 2) return t('dashboard.just_now');
          if (mins < 60) return t('dashboard.minutes_ago', { count: mins });
          const hours = Math.floor(mins / 60);
          if (hours < 24) return t('dashboard.hours_ago', { count: hours });
          return t('dashboard.days_ago', { count: Math.floor(hours / 24) });
        };

        const sortedOrgs = [...orgList].sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });

        const dynamicActivities = sortedOrgs.slice(0, 4).map((org, index) => ({
          id: `org-${org.id || index}`,
          icon: <IconGlobe />,
          color: index % 2 === 0 ? T.good : T.accent,
          text: t('dashboard.onboarded', { name: org.businessName || org.orgName }),
          time: relativeTime(org.createdAt),
          meta: org.orgName
        }));

        if (summaryData && summaryData.stats) {
          dynamicActivities.unshift({
            id: 'sys-1',
            icon: <IconPulse />,
            color: '#22D3EE',
            text: t('dashboard.report_generated'),
            time: t('dashboard.just_now'),
            meta: 'System'
          });
          setSummary(summaryData);
        } else if (orgList.length > 0) {
          setSummary({
            stats: {
              totalCareSites: 0,
              totalUsers: 0,
              totalOrganisations: orgList.length,
              totalDevices: 0
            }
          });
        }

        setActivities(dynamicActivities);
      } catch (err) {
        if (err?.code === 'ABORTED') return;
        console.error('Fetch platform data error:', err);
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [token, reloadKey]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.greetingHeader}>
        <View>
          <Text style={styles.date}>{new Date().toLocaleDateString(t('i18n_locale_tag', 'en-US'), { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</Text>
          <Text style={styles.greeting}>{getGreeting(t, user?.userName || 'User')}</Text>
          <Text style={styles.status}>
            <Text style={{ color: T.good, fontWeight: '700' }}>{t('dashboard.health_nominal')}</Text> · {t('dashboard.incidents', { count: 0 })}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <StatCard 
          label="dashboard.organisations" 
          value={loading ? '...' : (summary?.stats?.totalOrganisations ?? orgsCount).toString()} 
          delta={0} 
          icon={<IconGlobe />} color="#A78BFA" accent="rgba(167,139,250,.14)" 
        />
        <StatCard 
          label="dashboard.careSites" 
          value={loading ? '...' : (summary?.stats?.totalCareSites ?? summary?.careSites ?? summary?.careSiteCount ?? '0').toString()} 
          delta={0} 
          icon={<IconCareSite />} color={T.accent} 
        />
        <StatCard 
          label="dashboard.users" 
          value={loading ? '...' : (summary?.stats?.totalUsers ?? summary?.users ?? summary?.userCount ?? '0').toString()} 
          delta={0} 
          icon={<IconUsers />} color="#2DD4BF" accent="rgba(45,212,191,.14)" 
        />
        <StatCard 
          label="dashboard.active_devices" 
          value={loading ? '...' : (summary?.stats?.totalDevices ?? '0').toString()}
          delta={0} 
          icon={<IconPulse />} color="#22D3EE" accent="rgba(34,211,238,.14)" 
        />
      </View>

      {error && !loading && (
        <Card style={styles.errorCard}>
          <View style={styles.errorRow}>
            <IconAlert size={18} color={T.bad} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <Btn variant="tonal" size="sm" onPress={() => setReloadKey(key => key + 1)}>{t('common.retry')}</Btn>
        </Card>
      )}

      <View style={styles.section}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dashboard.quick_actions')}</Text>
          <View style={styles.actionGrid}>
            <Card style={styles.actionCard} onPress={() => onNavigate('orgs')}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(167,139,250,.14)' }]}>
                <IconGlobe color="#A78BFA" size={18} />
              </View>
              <Text style={styles.actionText}>{t('dashboard.organisations')}</Text>
              <Text style={styles.actionSubtext}>{t('dashboard.browse_search_audit')}</Text>
            </Card>
            <Card style={styles.actionCard} onPress={() => onNavigate('new')}>
              <View style={[styles.actionIcon, { backgroundColor: T.accentSoft }]}>
                <IconPlus color={T.accent} size={18} />
              </View>
              <Text style={styles.actionText}>{t('dashboard.new_organisation')}</Text>
              <Text style={styles.actionSubtext}>{t('dashboard.onboard_tenant')}</Text>
            </Card>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.recent_activity')}</Text>
        <Card style={styles.activityCard} padding={0}>
          {activities.length > 0 ? activities.map((item, index) => (
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
          )) : (
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>{loading ? t('common.loading') : t('dashboard.no_activity')}</Text>
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
};

export const PlatformDashboard = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const styles = createStyles(T);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isInvitingOwner, setIsInvitingOwner] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const drawerAnim = React.useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    const backAction = () => {
      if (drawerOpen) { toggleDrawer(); return true; }
      if (isInvitingOwner) { setIsInvitingOwner(false); return true; }
      if (selectedOrg) { setSelectedOrg(null); return true; }
      if (activeTab !== 'home') { setActiveTab('home'); return true; }
      Alert.alert(t('exit.title'), t('exit.message'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('exit.confirm'), style: 'destructive', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [drawerOpen, selectedOrg, activeTab, isInvitingOwner]);

  const toggleDrawer = React.useCallback(() => {
    const toValue = drawerOpen ? -width : 0;
    Animated.timing(drawerAnim, { toValue, duration: 250, useNativeDriver: true }).start();
    setDrawerOpen(!drawerOpen);
  }, [drawerOpen, drawerAnim]);

  const handleTabChange = (tabId) => {
    setSelectedOrg(null);
    setIsInvitingOwner(false);
    setActiveTab(tabId);
  };

  const footerItems = [
    { id: 'home',     label: t('dashboard.home'),             icon: <IconDashboard /> },
    { id: 'orgs',     label: t('dashboard.organisations'),    icon: <IconGlobe /> },
    { id: 'new',      label: t('dashboard.new_organisation'), icon: <IconPlus /> },
    { id: 'settings', label: t('dashboard.system_settings'),  icon: <IconSettings /> },
  ];

  const renderContent = () => {
    if (isInvitingOwner) return <CreateOrgOwnerScreen onCancel={() => setIsInvitingOwner(false)} presetOrgName={selectedOrg?.orgName} />;
    if (selectedOrg) return <OrgDetailScreen org={selectedOrg} onBack={() => setSelectedOrg(null)} onInviteOwner={() => setIsInvitingOwner(true)} />;
    switch (activeTab) {
      case 'home': return <HomeContent onNavigate={handleTabChange} />;
      case 'orgs': return <OrganisationsScreen onSelectOrg={(org) => setSelectedOrg(org)} />;
      case 'new': return <NewOrganisationScreen onCancel={() => handleTabChange('home')} onSuccess={() => handleTabChange('orgs')} />;
      case 'settings': return <SettingsScreen onLogout={() => { logout(); navigation.replace('Login'); }} />;
      default: return <HomeContent onNavigate={handleTabChange} />;
    }
  };

  const getTitle = () => {
    if (isInvitingOwner) return t('dashboard.invite_owner');
    if (selectedOrg) return t('dashboard.org_detail');
    switch (activeTab) {
      case 'home': return t('dashboard.platform_console');
      case 'orgs': return t('dashboard.organisations');
      case 'new': return t('dashboard.new_organisation');
      case 'settings': return t('dashboard.system_settings');
      default: return t('dashboard.platform_console');
    }
  };

  return (
    <View style={styles.container}>
      {drawerOpen && <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={toggleDrawer} />}
      <Animated.View style={[styles.drawer, { width: width * 0.8, transform: [{ translateX: drawerAnim }] }]}>
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <View style={styles.drawerHeader}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{user?.userName?.substring(0, 2).toUpperCase() || 'US'}</Text>
            </View>
            <Text style={styles.drawerName}>{user?.userName || 'User'}</Text>
            <Text style={styles.drawerRole}>{user?.orgName === 'SYSTEM' ? t('dashboard.platform_administrator') : t('common.administrator')}</Text>
          </View>
          <ScrollView style={styles.drawerMenu}>
            <TouchableOpacity style={[styles.drawerItem, activeTab === 'home' && { backgroundColor: T.accentSoft }]} onPress={() => { handleTabChange('home'); toggleDrawer(); }}>
              <IconDashboard color={activeTab === 'home' ? T.accent : T.textDim} size={20} />
              <Text style={[styles.drawerItemText, activeTab === 'home' && { color: T.accent }]}>{t('dashboard.title')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.drawerItem, activeTab === 'orgs' && { backgroundColor: T.accentSoft }]} onPress={() => { handleTabChange('orgs'); toggleDrawer(); }}>
              <IconGlobe color={activeTab === 'orgs' ? T.accent : T.textDim} size={20} />
              <Text style={[styles.drawerItemText, activeTab === 'orgs' && { color: T.accent }]}>{t('dashboard.organisations')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.drawerItem, activeTab === 'settings' && { backgroundColor: T.accentSoft }]} onPress={() => { handleTabChange('settings'); toggleDrawer(); }}>
              <IconSettings color={activeTab === 'settings' ? T.accent : T.textDim} size={20} />
              <Text style={[styles.drawerItemText, activeTab === 'settings' && { color: T.accent }]}>{t('dashboard.system_settings')}</Text>
            </TouchableOpacity>
            <View style={styles.drawerDivider} />
          </ScrollView>
        </View>
      </Animated.View>
      <TopBar title={getTitle()} leading={(selectedOrg || isInvitingOwner) ? <IconBack /> : <IconMenu />} onLeadingPress={(selectedOrg || isInvitingOwner) ? () => { if (isInvitingOwner) setIsInvitingOwner(false); else setSelectedOrg(null); } : toggleDrawer} onNotificationPress={() => setShowNotifications(true)} onProfilePress={() => handleTabChange('settings')} />
      <View style={{ flex: 1 }}>{renderContent()}</View>
      <BottomNav items={footerItems} active={activeTab} onChange={handleTabChange} />
      <NotificationSheet visible={showNotifications} onClose={() => setShowNotifications(false)} />
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  scrollContent: { padding: 16, paddingBottom: 32 },
  greetingHeader: { marginBottom: 24 },
  date: { fontSize: 11, color: T.textDim, fontWeight: '600', letterSpacing: 1 },
  greeting: { fontSize: 22, fontWeight: '700', color: T.text, marginTop: 4 },
  status: { fontSize: 12, color: T.textDim, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '48.5%', padding: 12 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statIcon: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 10, color: T.textDim, fontWeight: '600' },
  statBody: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  statValue: { fontSize: 22, fontWeight: '700', color: T.text },
  statDelta: { fontSize: 10, fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 12 },
  section: { marginBottom: 24 },
  actionGrid: { flexDirection: 'row', gap: 10 },
  actionCard: { flex: 1, gap: 8 },
  actionIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 13, fontWeight: '600', color: T.text },
  actionSubtext: { fontSize: 11, color: T.textDim },
  activityCard: { overflow: 'hidden' },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  activityBorder: { borderTopWidth: 1, borderTopColor: T.borderSoft },
  activityIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  activityText: { fontSize: 13, color: T.text, fontWeight: '500' },
  activityMeta: { fontSize: 11, color: T.textFaint, marginTop: 2 },
  activityTime: { fontSize: 11, color: T.textFaint },
  errorCard: { borderColor: T.bad, marginBottom: 16, gap: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText: { flex: 1, color: T.text, fontSize: 12.5, lineHeight: 18 },
  drawerOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: T.surface, zIndex: 20, borderRightWidth: 1, borderRightColor: T.border },
  drawerHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  avatarLarge: { width: 64, height: 64, borderRadius: 20, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarLargeText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  drawerName: { fontSize: 18, fontWeight: '700', color: T.text },
  drawerRole: { fontSize: 12, color: T.textDim, marginTop: 4 },
  drawerMenu: { flex: 1, padding: 16 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderRadius: 12 },
  drawerItemText: { fontSize: 14, fontWeight: '600', color: T.text },
  drawerDivider: { height: 1, backgroundColor: T.borderSoft, marginVertical: 12, marginHorizontal: 12 },
});
