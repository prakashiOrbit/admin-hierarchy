import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, BackHandler, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { TopBar, BottomNav } from '../../components/Navigation';
import { StatusPill } from '../../components/StatusPill';
import { 
  IconHospital, IconUsers, IconPulse, IconGateway, IconShield, IconChart,
  IconAlert, IconChevron, IconMenu, IconSettings, IconDashboard, IconBack, IconUser, IconMoon, IconLogout, IconCpu
} from '../../icons';
import { organisationApi, userApi, deviceApi, gatewayApi } from '../../services/api';
import { NotificationSheet } from '../../components/NotificationSheet';
import { HospitalsScreen } from '../Hospitals/HospitalsScreen';
import { UsersScreen } from '../Users/UsersScreen';
import { RolesScreen } from '../Roles/RolesScreen';
import { OrgSummaryScreen } from '../Organisations/OrgSummaryScreen';
import { UserDetailScreen } from '../Users/UserDetailScreen';
import { InviteOrgAdminScreen } from '../Organisations/InviteOrgAdminScreen';
import { OrgAdminsScreen } from '../Organisations/OrgAdminsScreen';
import { RoleDetailScreen } from '../Roles/RoleDetailScreen';
import { CreateRoleScreen } from '../Roles/CreateRoleScreen';
import { CreateHospitalScreen } from '../Hospitals/CreateHospitalScreen';
import { SettingsScreen } from '../Settings/SettingsScreen';
import { DeviceTypesScreen } from '../Devices/DeviceTypesScreen';
import { CreateDeviceTypeScreen } from '../Devices/CreateDeviceTypeScreen';
import { DeviceTypeDetailScreen } from '../Devices/DeviceTypeDetailScreen';
import { EditDeviceTypeScreen } from '../Devices/EditDeviceTypeScreen';
import { HospitalDetailScreen } from '../Hospitals/HospitalDetailScreen';
import { EditHospitalScreen } from '../Hospitals/EditHospitalScreen';

const { width } = Dimensions.get('window');

const StatCard = ({ label, value, delta, icon, color, accent }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(T);
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: accent || 'rgba(59,130,246,.14)' }]}>
          {React.cloneElement(icon, { color: color || T.accent, size: 15 })}
        </View>
        <Text style={styles.statLabel}>{t(label)}</Text>
      </View>
      <View style={styles.statBody}>
        <Text style={styles.statValue}>{value}</Text>
        {delta !== undefined && (
          <Text style={[styles.statDelta, { color: delta >= 0 ? T.good : T.bad }]}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </Text>
        )}
      </View>
    </Card>
  );
};

const OrgHomeContent = ({ role }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const styles = createStyles(T);

  const [hospitals, setHospitals] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [devices, setDevices] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.orgName) return;
    const fetchData = async () => {
      try {
        const [hospData, adminData] = await Promise.all([
          organisationApi.listHospitals(user.orgName, token),
          userApi.listOrgAdmins(user.orgName, token).catch(() => []),
        ]);
        const hospList = Array.isArray(hospData) ? hospData : [];
        const adminList = Array.isArray(adminData) ? adminData : [];
        setHospitals(hospList);
        setAdmins(adminList.filter(u => u.roles?.includes('ORG_ADMIN') || u.role === 'ORG_ADMIN'));

        if (hospList.length > 0) {
          const [allDeviceLists, allGatewayLists] = await Promise.all([
            Promise.all(hospList.map(h =>
              deviceApi.listAll(user.orgName, h.hospitalCode, token).catch(() => [])
            )),
            Promise.all(hospList.map(h =>
              gatewayApi.listAll(user.orgName, h.hospitalCode, token).catch(() => [])
            )),
          ]);
          setDevices(allDeviceLists.flat().filter(Boolean));
          setGateways(allGatewayLists.flat().filter(Boolean));
        }
      } catch (err) {
        console.error('Home fetch data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.orgName, token]);

  const activeHospitals = hospitals.filter(h => (h.status || 'ACTIVE') === 'ACTIVE').length;

  const onlineDevices = devices.filter(d => ['ACTIVE', 'ONLINE'].includes(d.status)).length;
  const warnDevices   = devices.filter(d => ['WARNING', 'WARN'].includes(d.status)).length;
  const offlineDevices = devices.length - onlineDevices - warnDevices;
  const totalDevices  = devices.length;

  const onlinePct  = totalDevices > 0 ? `${Math.round((onlineDevices / totalDevices) * 100)}%` : '0%';
  const warnPct    = totalDevices > 0 ? `${Math.round((warnDevices / totalDevices) * 100)}%` : '0%';
  const offlinePct = totalDevices > 0 ? `${Math.round((offlineDevices / totalDevices) * 100)}%` : '0%';

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.greetingHeader}>
        <Text style={styles.date}>{new Date().toLocaleDateString(t('i18n_locale_tag', 'en-US'), { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()} · {user?.orgName || 'ORGANISATION'}</Text>
        <Text style={styles.greeting}>{t('dashboard.good_morning', { name: user?.userName || 'User' })}</Text>
        <Text style={styles.status}>
          <Text style={{ color: T.good, fontWeight: '600' }}>{t('dashboard.provisioned', { count: hospitals.length })}</Text> · {t('dashboard.online_count', { count: activeHospitals })}
        </Text>
      </View>

      <View style={styles.grid}>
        <StatCard label="dashboard.hospitals" value={loading ? '...' : hospitals.length.toString()} icon={<IconHospital />} color={T.accent} />
        <StatCard label="dashboard.admins" value={loading ? '...' : admins.length.toString()} icon={<IconUsers />} color="#2DD4BF" accent="rgba(45,212,191,.14)" />
        <StatCard label="dashboard.devices" value={loading ? '...' : totalDevices.toString()} icon={<IconPulse />} color="#22D3EE" accent="rgba(34,211,238,.14)" />
        <StatCard label="dashboard.gateways" value={loading ? '...' : gateways.length.toString()} icon={<IconGateway />} color="#A78BFA" accent="rgba(167,139,250,.14)" />
      </View>

      <Card style={styles.alertCard}>
        <View style={styles.alertContent}>
          <View style={[styles.alertIcon, { backgroundColor: 'rgba(245,158,11,.15)' }]}>
            <IconAlert size={20} color={T.warn} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>{t('dashboard.monitoring_active')}</Text>
            <Text style={styles.alertText}>{t('dashboard.gateways_ok')}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <SectionHeader title={t('dashboard.top_hospitals')} />
        <View style={styles.list}>
          {loading ? (
            <ActivityIndicator color={T.accent} style={{ padding: 20 }} />
          ) : hospitals.length === 0 ? (
            <Text style={{ color: T.textDim, fontSize: 13, textAlign: 'center', padding: 20 }}>{t('dashboard.no_hospitals')}</Text>
          ) : (
            hospitals.slice(0, 3).map((h, i) => (
              <Card key={h.id || i} style={{ backgroundColor: T.surface }}>
                <View style={styles.listItem}>
                  <View style={styles.hospIcon}><IconHospital size={20} color={T.accent} /></View>
                  <View style={styles.listItemContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.hospName}>{h.hospitalName}</Text>
                      <StatusPill status={h.status || 'ACTIVE'} />
                    </View>
                    <View style={styles.hospMetaRow}>
                      <Text style={styles.hospMetaText}>{h.hospitalCode}</Text>
                      <Text style={styles.hospMetaText}>{h.beds || 0} {t('dashboard.beds').toLowerCase()}</Text>
                    </View>
                  </View>
                  <IconChevron size={16} color={T.textFaint} />
                </View>
              </Card>
            ))
          )}
        </View>
      </View>

      <Card style={{ marginBottom: 24 }}>
        <SectionHeader title={t('dashboard.device_capacity')} />
        {loading ? (
          <ActivityIndicator color={T.accent} style={{ padding: 12 }} />
        ) : totalDevices === 0 ? (
          <Text style={{ color: T.textFaint, fontSize: 13, textAlign: 'center', paddingVertical: 12 }}>{t('dashboard.no_devices')}</Text>
        ) : (
          <>
            <View style={styles.capacityHeader}>
              <Text style={styles.capacityValue}>{onlineDevices.toLocaleString()}</Text>
              <Text style={styles.capacityTotal}>/ {totalDevices.toLocaleString()} {t('dashboard.devices').toLowerCase()} · {onlinePct} {t('dashboard.online').toLowerCase()}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressSegment, { width: onlinePct, backgroundColor: T.good }]} />
              <View style={[styles.progressSegment, { width: warnPct, backgroundColor: T.warn }]} />
              <View style={[styles.progressSegment, { width: offlinePct, backgroundColor: T.surface2 }]} />
            </View>
            <View style={styles.progressLegend}>
              <Text style={styles.legendItem}><Text style={{ color: T.good }}>●</Text> {t('dashboard.online')} {onlineDevices}</Text>
              <Text style={styles.legendItem}><Text style={{ color: T.warn }}>●</Text> {t('dashboard.warn')} {warnDevices}</Text>
              <Text style={styles.legendItem}><Text style={{ color: T.textFaint }}>●</Text> {t('dashboard.offline')} {offlineDevices}</Text>
            </View>
          </>
        )}
      </Card>
    </ScrollView>
  );
};

export const OrgDashboard = ({ navigation, route }) => {
  const role = route.params?.role || 'ORG_OWNER';
  const isOwner = role === 'ORG_OWNER';

  const insets = useSafeAreaInsets();
  const { theme: T, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const styles = createStyles(T);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [isInvitingAdmin, setIsInvitingAdmin] = useState(false);
  const [isProvisioningHospital, setIsProvisioningHospital] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isCreatingDeviceType, setIsCreatingDeviceType] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isEditingDeviceType, setIsEditingDeviceType] = useState(false);
  const [isEditingHospital, setIsEditingHospital] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const drawerAnim = React.useRef(new Animated.Value(-width)).current;

  const handleBack = React.useCallback(() => {
    if (drawerOpen) { toggleDrawer(); return; }
    if (isEditingHospital) { setIsEditingHospital(false); return; }
    if (selectedHospital) { setSelectedHospital(null); return; }
    if (isCreatingDeviceType) { setIsCreatingDeviceType(false); return; }
    if (isEditingDeviceType) { setIsEditingDeviceType(false); return; }
    if (selectedDeviceType) { setSelectedDeviceType(null); return; }
    if (isInvitingAdmin) { setIsInvitingAdmin(false); return; }
    if (isProvisioningHospital) { setIsProvisioningHospital(false); return; }
    if (isCreatingRole) { setIsCreatingRole(false); return; }
    if (selectedUserId) { setSelectedUserId(null); return; }
    if (selectedRoleId) { setSelectedRoleId(null); return; }
    if (activeTab !== 'home') { handleTabChange('home'); }
  }, [drawerOpen, activeTab, selectedUserId, isInvitingAdmin, selectedRoleId, isProvisioningHospital, selectedHospital, isCreatingDeviceType, selectedDeviceType, isCreatingRole, isEditingDeviceType, isEditingHospital, toggleDrawer]);

  const isSubScreen = !!(selectedUserId || isInvitingAdmin || selectedRoleId || isProvisioningHospital ||
    selectedHospital || isCreatingDeviceType || selectedDeviceType || isCreatingRole ||
    isEditingDeviceType || isEditingHospital);

  useEffect(() => {
    const backAction = () => {
      if (!isSubScreen && activeTab === 'home') return false;
      handleBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isSubScreen, activeTab, handleBack]);

  const toggleDrawer = React.useCallback(() => {
    const toValue = drawerOpen ? -width : 0;
    Animated.timing(drawerAnim, { toValue, duration: 250, useNativeDriver: true }).start();
    setDrawerOpen(!drawerOpen);
  }, [drawerOpen, drawerAnim]);

  const handleTabChange = (tabId) => {
    setSelectedUserId(null);
    setSelectedRoleId(null);
    setIsInvitingAdmin(false);
    setIsProvisioningHospital(false);
    setSelectedHospital(null);
    setIsCreatingDeviceType(false);
    setIsEditingDeviceType(false);
    setSelectedDeviceType(null);
    setIsEditingHospital(false);
    setIsCreatingRole(false);
    setActiveTab(tabId);
  };

  const footerItems = [
    { id: 'home', label: t('dashboard.home'), icon: <IconDashboard /> },
    ...(isOwner ? [{ id: 'admins', label: t('dashboard.admins'), icon: <IconUsers /> }] : []),
    { id: 'hospitals', label: t('dashboard.hospitals'), icon: <IconHospital /> },
    { id: 'types', label: t('dashboard.device_type'), icon: <IconCpu /> },
    { id: 'users', label: t('dashboard.users'), icon: <IconUser /> },
    { id: 'roles', label: t('dashboard.roles_perms'), icon: <IconShield /> },
    { id: 'summary', label: t('dashboard.summary'), icon: <IconChart /> },
  ];

  const renderContent = () => {
    if (isInvitingAdmin) return <InviteOrgAdminScreen onCancel={() => setIsInvitingAdmin(false)} />;
    if (isProvisioningHospital) return <CreateHospitalScreen onCancel={() => setIsProvisioningHospital(false)} />;
    if (isCreatingDeviceType) return <CreateDeviceTypeScreen onCancel={() => setIsCreatingDeviceType(false)} />;
    if (isEditingDeviceType && selectedDeviceType) return <EditDeviceTypeScreen deviceType={selectedDeviceType} onCancel={() => setIsEditingDeviceType(false)} onSave={(updated) => { setSelectedDeviceType(updated); setIsEditingDeviceType(false); }} />;
    if (selectedDeviceType) return <DeviceTypeDetailScreen deviceType={selectedDeviceType} onBack={() => setSelectedDeviceType(null)} onEdit={() => setIsEditingDeviceType(true)} />;
    if (isEditingHospital && selectedHospital) return <EditHospitalScreen hospital={selectedHospital} onCancel={() => setIsEditingHospital(false)} onSave={(updated) => { setSelectedHospital(updated); setIsEditingHospital(false); }} />;
    if (selectedHospital) return <HospitalDetailScreen hospital={selectedHospital} onBack={() => setSelectedHospital(null)} onEdit={() => setIsEditingHospital(true)} />;
    if (isCreatingRole) return <CreateRoleScreen onCancel={() => setIsCreatingRole(false)} />;
    if (selectedUserId) return <UserDetailScreen userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
    if (selectedRoleId) return <RoleDetailScreen roleId={selectedRoleId} onBack={() => setSelectedRoleId(null)} />;
    switch (activeTab) {
      case 'home': return <OrgHomeContent role={role} />;
      case 'admins': return <OrgAdminsScreen onInvite={() => setIsInvitingAdmin(true)} onSelectUser={setSelectedUserId} />;
      case 'hospitals': return <HospitalsScreen onProvision={() => setIsProvisioningHospital(true)} onSelect={setSelectedHospital} />;
      case 'types': return <DeviceTypesScreen onCreate={() => setIsCreatingDeviceType(true)} onSelect={setSelectedDeviceType} />;
      case 'users': return <UsersScreen onSelectUser={setSelectedUserId} />;
      case 'roles': return <RolesScreen onSelectRole={setSelectedRoleId} onCreate={() => setIsCreatingRole(true)} />;
      case 'summary': return <OrgSummaryScreen />;
      case 'settings': return <SettingsScreen onLogout={() => { logout(); navigation.replace('Login'); }} />;
      default: return <OrgHomeContent role={role} />;
    }
  };

  const getTitle = () => {
    if (isInvitingAdmin) return t('dashboard.invite_org_admin');
    if (isProvisioningHospital) return t('dashboard.create_hospital');
    if (isCreatingDeviceType) return t('dashboard.create_device_type');
    if (isEditingDeviceType) return t('dashboard.edit_device_type');
    if (selectedDeviceType) return t('dashboard.device_type_details');
    if (isEditingHospital) return t('dashboard.edit_hospital');
    if (selectedHospital) return t('dashboard.hospital_details');
    if (isCreatingRole) return t('dashboard.create_role');
    if (selectedUserId) return t('dashboard.user_details');
    if (selectedRoleId) return t('dashboard.role_details');
    switch (activeTab) {
      case 'home': return t('dashboard.org_console');
      case 'admins': return t('dashboard.org_admins');
      case 'hospitals': return t('dashboard.hospitals');
      case 'types': return t('dashboard.device_types');
      case 'users': return t('dashboard.users');
      case 'roles': return t('dashboard.roles_perms');
      case 'summary': return t('dashboard.summary');
      case 'settings': return t('dashboard.system_settings');
      default: return t('dashboard.org_console');
    }
  };

  return (
    <View style={styles.container}>
      {drawerOpen && <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={toggleDrawer} />}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerName}>{user?.userName || 'User'}</Text>
            <Text style={styles.drawerRole}>{isOwner ? t('dashboard.org_owner') : t('dashboard.org_administrator')}</Text>
          </View>
          <ScrollView style={styles.drawerMenu}>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { handleTabChange('home'); toggleDrawer(); }}>
              <IconDashboard size={20} color={T.textDim} />
              <Text style={styles.drawerItemText}>{t('dashboard.title')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { handleTabChange('settings'); toggleDrawer(); }}>
              <IconSettings size={20} color={T.textDim} />
              <Text style={styles.drawerItemText}>{t('dashboard.system_settings')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { toggleTheme(); toggleDrawer(); }}>
              <IconMoon size={20} color={T.textDim} />
              <Text style={styles.drawerItemText}>{t('common.theme')}: {isDark ? t('settings.theme_dark') : t('settings.theme_light')}</Text>
            </TouchableOpacity>
            <View style={styles.drawerDivider} />
            <TouchableOpacity style={[styles.drawerItem, { marginTop: 'auto' }]} onPress={() => { logout(); navigation.replace('Login'); }}>
              <IconLogout size={20} color={T.bad} />
              <Text style={[styles.drawerItemText, { color: T.bad }]}>{t('common.logout')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>
      <TopBar title={getTitle()} leading={isSubScreen ? <IconBack /> : <IconMenu />} onLeadingPress={isSubScreen ? handleBack : toggleDrawer} onNotificationPress={() => setShowNotifications(true)} onProfilePress={() => handleTabChange('settings')} />
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
  statCard: { width: '48.5%' },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statIcon: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 10, color: T.textDim, fontWeight: '600' },
  statBody: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  statValue: { fontSize: 18, fontWeight: '700', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  statDelta: { fontSize: 10, fontWeight: '600' },
  alertCard: { borderColor: 'rgba(245,158,11,.3)', marginBottom: 24 },
  alertContent: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  alertIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: 13, fontWeight: '600', color: T.text },
  alertText: { fontSize: 11.5, color: T.textDim, marginTop: 3, lineHeight: 18 },
  section: { marginBottom: 24 },
  list: { gap: 8 },
  listItem: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  hospIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  listItemContent: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hospName: { fontSize: 13.5, fontWeight: '600', color: T.text, flex: 1 },
  hospMetaRow: { flexDirection: 'row', gap: 10, marginTop: 3 },
  hospMetaText: { fontSize: 11, color: T.textFaint, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  capacityHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 },
  capacityValue: { fontSize: 22, fontWeight: '700', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  capacityTotal: { fontSize: 12, color: T.textDim },
  progressBar: { height: 8, backgroundColor: T.surface2, borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  progressSegment: { height: '100%' },
  progressLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  legendItem: { fontSize: 11, color: T.textDim },
  drawerOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: width * 0.75, backgroundColor: T.surface, zIndex: 20, borderRightWidth: 1, borderRightColor: T.border },
  drawerHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  drawerName: { fontSize: 18, fontWeight: '700', color: T.text },
  drawerRole: { fontSize: 12, color: T.textDim, marginTop: 4 },
  drawerMenu: { flex: 1, padding: 16 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderRadius: 12 },
  drawerItemText: { fontSize: 14, fontWeight: '600', color: T.text },
  drawerDivider: { height: 1, backgroundColor: T.borderSoft, marginVertical: 12, marginHorizontal: 12 },
});
