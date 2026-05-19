import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, BackHandler, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { TopBar, BottomNav } from '../../components/Navigation';
import { StatusPill } from '../../components/StatusPill';
import { 
  IconHospital, IconUsers, IconPulse, IconGateway, IconShield, IconChart,
  IconAlert, IconChevron, IconMenu, IconSettings, IconDashboard, IconBack, IconUser, IconMoon, IconLogout, IconCpu
} from '../../icons';
import { organisationApi } from '../../services/api';
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
import { DeviceTypesScreen } from '../Devices/DeviceTypesScreen';
import { CreateDeviceTypeScreen } from '../Devices/CreateDeviceTypeScreen';
import { DeviceTypeDetailScreen } from '../Devices/DeviceTypeDetailScreen';

const { width } = Dimensions.get('window');

const StatCard = ({ label, value, delta, icon, color, accent }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: accent || 'rgba(59,130,246,.14)' }]}>
          {React.cloneElement(icon, { color: color || T.accent, size: 15 })}
        </View>
        <Text style={styles.statLabel}>{label}</Text>
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
  const { user, token } = useAuth();
  const styles = createStyles(T);
  const isOwner = role === 'ORG_OWNER';
  
  const [hospitals, setHospitals] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.orgName) return;
      try {
        const [hospData, adminData] = await Promise.all([
          organisationApi.listHospitals(user.orgName, token),
          userApi.listOrgAdmins(user.orgName, token)
        ]);
        setHospitals(Array.isArray(hospData) ? hospData : []);
        setAdmins((Array.isArray(adminData) ? adminData : []).filter(u => u.roles?.includes('ORG_ADMIN') || u.role === 'ORG_ADMIN'));
      } catch (err) {
        console.error('Home fetch data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.orgName, token]);

  const activeHospitals = hospitals.filter(h => h.status === 'ACTIVE').length;
  
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Greeting */}
      <View style={styles.greetingHeader}>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()} · {user?.orgName || 'ORGANISATION'}</Text>
        <Text style={styles.greeting}>Good morning, {user?.userName || 'User'}</Text>
        <Text style={styles.status}>
          <Text style={{ color: T.good, fontWeight: '600' }}>{hospitals.length} hospitals</Text> provisioned · {activeHospitals} online
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <StatCard 
          label="Hospitals" 
          value={loading ? '...' : hospitals.length.toString()} 
          delta={0} 
          icon={<IconHospital />} color={T.accent} 
        />
        <StatCard 
          label="Admins" 
          value={loading ? '...' : admins.length.toString()} 
          delta={3} 
          icon={<IconUsers />} color="#2DD4BF" accent="rgba(45,212,191,.14)" 
        />
        <StatCard 
          label="Devices" 
          value="3.3k" 
          delta={12} 
          icon={<IconPulse />} color="#22D3EE" accent="rgba(34,211,238,.14)" 
        />
        <StatCard 
          label="Gateways" 
          value="182" 
          delta={-2} 
          icon={<IconGateway />} color="#A78BFA" accent="rgba(167,139,250,.14)" 
        />
      </View>

      {/* Alert Strip */}
      <Card style={styles.alertCard}>
        <View style={styles.alertContent}>
          <View style={[styles.alertIcon, { backgroundColor: 'rgba(245,158,11,.15)' }]}>
            <IconAlert size={20} color={T.warn} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Monitoring system active</Text>
            <Text style={styles.alertText}>
              All hospital gateways are communicating correctly. No critical alerts in the last 24h.
            </Text>
          </View>
        </View>
      </Card>

      {/* Top Hospitals */}
      <View style={styles.section}>
        <SectionHeader title="TOP HOSPITALS" />
        <View style={styles.list}>
          {loading ? (
            <ActivityIndicator color={T.accent} style={{ padding: 20 }} />
          ) : hospitals.length === 0 ? (
            <Text style={{ color: T.textDim, fontSize: 13, textAlign: 'center', padding: 20 }}>No hospitals found</Text>
          ) : (
            hospitals.slice(0, 3).map((h, i) => (
              <Card key={h.id || i} style={{ backgroundColor: T.surface }}>
                <View style={styles.listItem}>
                  <View style={styles.hospIcon}>
                    <IconHospital size={20} color={T.accent} />
                  </View>
                  <View style={styles.listItemContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.hospName}>{h.hospitalName}</Text>
                      <StatusPill status={h.status || 'ACTIVE'} />
                    </View>
                    <View style={styles.hospMetaRow}>
                      <Text style={styles.hospMetaText}>{h.hospitalCode}</Text>
                      <Text style={styles.hospMetaText}>{h.beds || 0} beds</Text>
                      <Text style={styles.hospMetaText}>{h.devices || 0} dev</Text>
                    </View>
                  </View>
                  <IconChevron size={16} color={T.textFaint} />
                </View>
              </Card>
            ))
          )}
        </View>
      </View>

      {/* Capacity Card */}
      <Card style={{ marginBottom: 24 }}>
        <SectionHeader title="DEVICE CAPACITY" />
        <View style={styles.capacityHeader}>
          <Text style={styles.capacityValue}>3,331</Text>
          <Text style={styles.capacityTotal}>/ 4,218 devices active · 79%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, { width: '64%', backgroundColor: T.good }]} />
          <View style={[styles.progressSegment, { width: '15%', backgroundColor: T.warn }]} />
          <View style={[styles.progressSegment, { width: '21%', backgroundColor: T.surface2 }]} />
        </View>
        <View style={styles.progressLegend}>
          <Text style={styles.legendItem}><Text style={{ color: T.good }}>●</Text> Online 2,698</Text>
          <Text style={styles.legendItem}><Text style={{ color: T.warn }}>●</Text> Warn 633</Text>
          <Text style={styles.legendItem}><Text style={{ color: T.textFaint }}>●</Text> Offline 211</Text>
        </View>
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = React.useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    const backAction = () => {
      if (drawerOpen) { toggleDrawer(); return true; }
      if (isInvitingAdmin) { setIsInvitingAdmin(false); return true; }
      if (isProvisioningHospital) { setIsProvisioningHospital(false); return true; }
      if (selectedHospital) { setSelectedHospital(null); return true; }
      if (isCreatingDeviceType) { setIsCreatingDeviceType(false); return true; }
      if (selectedDeviceType) { setSelectedDeviceType(null); return true; }
      if (isCreatingRole) { setIsCreatingRole(false); return true; }
      if (selectedUserId) { setSelectedUserId(null); return true; }
      if (selectedRoleId) { setSelectedRoleId(null); return true; }
      if (activeTab !== 'home') { handleTabChange('home'); return true; }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [drawerOpen, activeTab, selectedUserId, isInvitingAdmin, selectedRoleId, isProvisioningHospital, selectedHospital, isCreatingDeviceType, selectedDeviceType, isCreatingRole]);

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
    setSelectedDeviceType(null);
    setIsCreatingRole(false);
    setActiveTab(tabId);
  };

  const footerItems = [
    { id: 'home', label: 'Home', icon: <IconDashboard /> },
    ...(isOwner ? [{ id: 'admins', label: 'Admins', icon: <IconUsers /> }] : []),
    { id: 'hospitals', label: 'Hospitals', icon: <IconHospital /> },
    { id: 'types', label: 'DeviceType', icon: <IconCpu /> },
    { id: 'users', label: 'Users', icon: <IconUser /> },
    { id: 'roles', label: 'Roles', icon: <IconShield /> },
    { id: 'summary', label: 'Summary', icon: <IconChart /> },
  ];

  const renderContent = () => {
    if (isInvitingAdmin) {
      return <InviteOrgAdminScreen onCancel={() => setIsInvitingAdmin(false)} />;
    }
    if (isProvisioningHospital) {
      return <CreateHospitalScreen onCancel={() => setIsProvisioningHospital(false)} />;
    }
    if (isCreatingDeviceType) {
      return <CreateDeviceTypeScreen onCancel={() => setIsCreatingDeviceType(false)} />;
    }
    if (selectedDeviceType) {
      return <DeviceTypeDetailScreen deviceType={selectedDeviceType} onBack={() => setSelectedDeviceType(null)} />;
    }
    if (isCreatingRole) {
      return <CreateRoleScreen onCancel={() => setIsCreatingRole(false)} />;
    }
    if (selectedUserId) {
      return <UserDetailScreen userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
    }
    if (selectedRoleId) {
      return <RoleDetailScreen roleId={selectedRoleId} onBack={() => setSelectedRoleId(null)} />;
    }

    switch (activeTab) {
      case 'home': return <OrgHomeContent role={role} />;
      case 'admins': return <OrgAdminsScreen onInvite={() => setIsInvitingAdmin(true)} onSelectUser={setSelectedUserId} />;
      case 'hospitals': return <HospitalsScreen onProvision={() => setIsProvisioningHospital(true)} />;
      case 'types': return <DeviceTypesScreen onCreate={() => setIsCreatingDeviceType(true)} onSelect={setSelectedDeviceType} />;
      case 'users': return <UsersScreen onSelectUser={setSelectedUserId} />;
      case 'roles': return <RolesScreen onSelectRole={setSelectedRoleId} onCreate={() => setIsCreatingRole(true)} />;
      case 'summary': return <OrgSummaryScreen />;
      default: return <OrgHomeContent role={role} />;
    }
  };

  const getTitle = () => {
    if (isInvitingAdmin) return "Invite Org Admin";
    if (isProvisioningHospital) return "Create Hospital";
    if (isCreatingDeviceType) return "Create Device Type";
    if (selectedDeviceType) return "Device Type Details";
    if (isCreatingRole) return "Create New Role";
    if (selectedUserId) return "User Details";
    if (selectedRoleId) return "Role Details";

    switch (activeTab) {
      case 'home': return "Org Console";
      case 'admins': return "Organisation Admins";
      case 'hospitals': return "Hospitals";
      case 'types': return "Device Types";
      case 'users': return "Users";
      case 'roles': return "Roles & Permissions";
      case 'summary': return "Org Summary";
      default: return "Org Console";
    }
  };

  return (
    <View style={styles.container}>
      {/* Drawer */}
      {drawerOpen && <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={toggleDrawer} />}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerName}>{user?.userName || 'User'}</Text>
            <Text style={styles.drawerRole}>{isOwner ? 'Organisation Owner' : 'Organisation Administrator'}</Text>
          </View>
          <ScrollView style={styles.drawerMenu}>
            <TouchableOpacity 
              style={styles.drawerItem}
              onPress={() => { handleTabChange('home'); toggleDrawer(); }}
            >
              <IconDashboard size={20} color={T.textDim} />
              <Text style={styles.drawerItemText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={() => { toggleTheme(); toggleDrawer(); }}>
              <IconMoon size={20} color={T.textDim} />
              <Text style={styles.drawerItemText}>Theme: {isDark ? 'Dark' : 'Light'}</Text>
            </TouchableOpacity>

            <View style={styles.drawerDivider} />
            
            <TouchableOpacity 
              style={[styles.drawerItem, { marginTop: 'auto' }]} 
              onPress={() => { logout(); navigation.replace('Login'); }}
            >
              <IconLogout size={20} color={T.bad} />
              <Text style={[styles.drawerItemText, { color: T.bad }]}>Log out</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>

      <TopBar 
        title={getTitle()} 
        leading={ (selectedUserId || isInvitingAdmin || selectedRoleId || isProvisioningHospital || selectedHospital || isCreatingDeviceType || selectedDeviceType || isCreatingRole) ? <IconBack /> : <IconMenu /> }
        onLeadingPress={(selectedUserId || isInvitingAdmin || selectedRoleId || isProvisioningHospital || selectedHospital || isCreatingDeviceType || selectedDeviceType || isCreatingRole) ? () => { setSelectedUserId(null); setIsInvitingAdmin(false); setSelectedRoleId(null); setIsProvisioningHospital(false); setSelectedHospital(null); setIsCreatingDeviceType(false); setSelectedDeviceType(null); setIsCreatingRole(false); } : toggleDrawer}
        onNotificationPress={() => console.log('Notifications')}
        onProfilePress={() => { logout(); navigation.replace('Login'); }}
      />


      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      <BottomNav 
        items={footerItems} 
        active={activeTab} 
        onChange={handleTabChange} 
      />
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
  reviewLink: { color: T.warn, fontSize: 12, fontWeight: '600' },
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
