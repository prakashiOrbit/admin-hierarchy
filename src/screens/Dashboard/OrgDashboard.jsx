import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, BackHandler, ActivityIndicator, Alert, TextInput as RNTextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Btn, getGreeting } from '../../components/Shared';
import { TopBar, BottomNav } from '../../components/Navigation';
import { StatusPill } from '../../components/StatusPill';
import { 
  IconHospital, IconUsers, IconPulse, IconGateway, IconShield,
  IconAlert, IconChevron, IconMenu, IconSettings, IconDashboard, IconBack, IconUser, IconLogout, IconCpu
} from '../../icons';
import { organisationApi, userApi, summaryApi, getApiErrorMessage } from '../../services/api';
import { NotificationSheet } from '../../components/NotificationSheet';
import { HospitalsScreen } from '../Hospitals/HospitalsScreen';
import { UsersScreen } from '../Users/UsersScreen';
import { RolesScreen } from '../Roles/RolesScreen';
import { UserDetailScreen } from '../Users/UserDetailScreen';
import { InviteOrgAdminScreen } from '../Organisations/InviteOrgAdminScreen';
import { OrgAdminsScreen } from '../Organisations/OrgAdminsScreen';
import { RoleDetailScreen } from '../Roles/RoleDetailScreen';
import { CreateRoleScreen } from '../Roles/CreateRoleScreen';
import { CreateHospitalScreen } from '../Hospitals/CreateHospitalScreen';
import { CreateHospAdminScreen } from '../Hospitals/CreateHospAdminScreen';
import { SettingsScreen } from '../Settings/SettingsScreen';
import { DeviceTypesScreen } from '../Devices/DeviceTypesScreen';
import { CreateDeviceTypeScreen } from '../Devices/CreateDeviceTypeScreen';
import { DeviceTypeDetailScreen } from '../Devices/DeviceTypeDetailScreen';
import { EditDeviceTypeScreen } from '../Devices/EditDeviceTypeScreen';
import { HospitalDetailScreen } from '../Hospitals/HospitalDetailScreen';
import { EditHospitalScreen } from '../Hospitals/EditHospitalScreen';
import { EditDoctorScreen } from '../Users/EditDoctorScreen';
import { EditNurseScreen } from '../Users/EditNurseScreen';
import { EditAdminScreen } from '../Users/EditAdminScreen';

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
  const [orgSummary, setOrgSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [editingPolicy, setEditingPolicy] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyFetching, setPolicyFetching] = useState(false);
  const [adminHours, setAdminHours] = useState('');

  const handleEditPolicy = async () => {
    setPolicyFetching(true);
    try {
      const org = await organisationApi.getByName(user.orgName, token);
      setAdminHours(String(org.adminJwtValiditySeconds ? Math.round(org.adminJwtValiditySeconds / 3600) : 3));
      setEditingPolicy(true);
    } catch (err) {
      Alert.alert(t('common.error'), t('security_policy.err_load_failed'));
    } finally {
      setPolicyFetching(false);
    }
  };

  const handleSaveOrgPolicy = async () => {
    const adminSeconds = parseInt(adminHours, 10) * 3600;
    if (isNaN(adminSeconds) || adminSeconds <= 0) {
      Alert.alert(t('common.invalid_input'), t('security_policy.err_invalid_duration'));
      return;
    }
    setPolicyLoading(true);
    try {
      await organisationApi.updateJwtValidity(user.orgName, { adminJwtValiditySeconds: adminSeconds }, token);
      setEditingPolicy(false);
    } catch (err) {
      Alert.alert(t('common.error'), err.message || t('security_policy.err_save_failed'));
    } finally {
      setPolicyLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.orgName) return;
    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(() => {
    setLoading(true);
    setError(null);
    let firstError = null;
    Promise.all([
      organisationApi.listHospitals(user.orgName, token, { signal: controller.signal }).catch(err => {
        if (err?.code === 'ABORTED') throw err;
        firstError = firstError || err;
        return [];
      }),
      userApi.listOrgAdmins(user.orgName, token, { signal: controller.signal }).catch(err => {
        if (err?.code === 'ABORTED') throw err;
        firstError = firstError || err;
        return [];
      }),
      summaryApi.getOrgSummary(user.orgName, token, { signal: controller.signal }).catch(err => {
        if (err?.code === 'ABORTED') throw err;
        firstError = firstError || err;
        return null;
      }),
    ]).then(([hospData, adminData, summaryData]) => {
      if (cancelled) return;
      const hospList = Array.isArray(hospData) ? hospData : [];
      const adminList = Array.isArray(adminData) ? adminData : [];
      setHospitals(hospList);
      setAdmins(adminList.filter(u => u.userRoles?.includes('ORG_ADMIN')));
      setOrgSummary(summaryData);
      if (firstError) {
        const s = firstError?.status;
        if (s === 401 || s === 403 || (s && s >= 500)) {
          setError(getApiErrorMessage(firstError));
        }
      }
    }).catch(err => {
      if (err?.code === 'ABORTED') return;
      if (!cancelled) {
        console.error('Home fetch data error:', err);
        setError(getApiErrorMessage(err));
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [user?.orgName, token, reloadKey]);

  const activeHospitals = hospitals.filter(h => (h.status || 'ACTIVE') === 'ACTIVE').length;
  const totalDevices  = orgSummary?.stats?.totalDevices  ?? 0;
  const totalGateways = orgSummary?.stats?.totalGateways ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.greetingHeader}>
        <Text style={styles.date}>{new Date().toLocaleDateString(t('i18n_locale_tag', 'en-US'), { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()} · {user?.orgName || 'ORGANISATION'}</Text>
        <Text style={styles.greeting}>{getGreeting(t, user?.userName || 'User')}</Text>
        <Text style={styles.status}>
          <Text style={{ color: T.good, fontWeight: '600' }}>{t('dashboard.provisioned', { count: hospitals.length })}</Text> · {t('dashboard.online_count', { count: activeHospitals })}
        </Text>
      </View>

      <View style={styles.grid}>
        <StatCard label="dashboard.hospitals" value={loading ? '...' : hospitals.length.toString()} icon={<IconHospital />} color={T.accent} />
        <StatCard label="dashboard.admins" value={loading ? '...' : admins.length.toString()} icon={<IconUsers />} color="#2DD4BF" accent="rgba(45,212,191,.14)" />
        <StatCard label="dashboard.devices" value={loading ? '...' : totalDevices.toString()} icon={<IconPulse />} color="#22D3EE" accent="rgba(34,211,238,.14)" />
        <StatCard label="dashboard.gateways" value={loading ? '...' : totalGateways.toString()} icon={<IconGateway />} color="#A78BFA" accent="rgba(167,139,250,.14)" />
      </View>

      {error && !loading && (
        <Card style={styles.errorCard}>
          <View style={styles.errorRow}>
            <IconAlert size={18} color={T.bad} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <Btn variant="tonal" size="sm" onPress={() => setReloadKey(key => key + 1)}>{t('common.retry', 'Retry')}</Btn>
        </Card>
      )}

      {!loading && !error && hospitals.length === 0 && admins.length === 0 && (
        <Card style={[styles.errorCard, { borderColor: T.border, backgroundColor: T.surfaceAlt || T.surface }]}>
          <View style={styles.errorRow}>
            <IconShield size={18} color={T.accent} />
            <Text style={[styles.errorText, { color: T.textDim }]}>{t('dashboard.onboarding_hint', 'Welcome! Start by adding an ORG Admin and a Hospital to get your organisation up and running.')}</Text>
          </View>
        </Card>
      )}


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


      {/* Security Policy — ORG_OWNER manages ORG_ADMIN session duration */}
      <View style={styles.section}>
        <View style={styles.policyHeaderRow}>
          <SectionHeader title={t('security_policy.title')} />
          {!editingPolicy && (
            <Btn variant="ghost" size="sm" onPress={handleEditPolicy} disabled={policyFetching}>
              {policyFetching ? <ActivityIndicator size="small" color={T.textDim} /> : t('common.edit')}
            </Btn>
          )}
        </View>
        <Card style={styles.policyCard}>
          {editingPolicy ? (
            <>
              <View style={styles.policyRow}>
                <Text style={styles.policyLabel}>{t('security_policy.admin_session')}:</Text>
                <View style={styles.policyInputRow}>
                  <RNTextInput
                    style={[styles.policyInput, { color: T.text, borderColor: T.border, backgroundColor: T.surface2 }]}
                    value={adminHours}
                    onChangeText={setAdminHours}
                    keyboardType="numeric"
                    selectTextOnFocus
                  />
                  <Text style={styles.policyUnit}>{t('security_policy.hrs')}</Text>
                </View>
              </View>
              <View style={styles.policyActions}>
                <Btn variant="surface" size="sm" style={{ flex: 1 }} onPress={() => setEditingPolicy(false)} disabled={policyLoading}>{t('common.cancel')}</Btn>
                <Btn variant="primary" size="sm" style={{ flex: 1 }} onPress={handleSaveOrgPolicy} disabled={policyLoading}>
                  {policyLoading ? <ActivityIndicator color="#fff" size="small" /> : t('common.save')}
                </Btn>
              </View>
            </>
          ) : (
            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>{t('security_policy.admin_session')}:</Text>
              <Text style={styles.policyValue}>{t('security_policy.tap_edit_hint')}</Text>
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
};

export const OrgDashboard = ({ navigation, route }) => {
  const role = route.params?.role || 'ORG_OWNER';
  const isOwner = role === 'ORG_OWNER';

  const insets = useSafeAreaInsets();
  const { theme: T } = useTheme();
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
const [isCreatingHospAdmin, setIsCreatingHospAdmin] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const drawerAnim = React.useRef(new Animated.Value(-width)).current;

  const handleBack = React.useCallback(() => {
    if (drawerOpen) { toggleDrawer(); return; }
    if (selectedUserForEdit) { setSelectedUserForEdit(null); return; }
    if (isCreatingHospAdmin) { setIsCreatingHospAdmin(false); return; }
    if (isEditingHospital) { setIsEditingHospital(false); return; }
    if (selectedHospital) { setSelectedHospital(null); return; }
    if (isCreatingDeviceType) { setIsCreatingDeviceType(false); return; }
    if (isEditingDeviceType) { setIsEditingDeviceType(false); return; }
    if (selectedDeviceType) { setSelectedDeviceType(null); return; }
    if (isInvitingAdmin) { setIsInvitingAdmin(false); return; }
    if (isProvisioningHospital) { setIsProvisioningHospital(false); return; }
    if (isCreatingRole) { setIsCreatingRole(false); return; }
if (selectedStaffForEdit) { setSelectedStaffForEdit(null); return; }
    if (selectedUserId) { setSelectedUserId(null); return; }
    if (selectedRoleId) { setSelectedRoleId(null); return; }
    if (activeTab !== 'home') { handleTabChange('home'); }
  }, [drawerOpen, activeTab, selectedUserId, isInvitingAdmin, selectedRoleId, isProvisioningHospital, selectedHospital, isCreatingDeviceType, selectedDeviceType, isCreatingRole, isEditingDeviceType, isEditingHospital, selectedStaffForEdit, selectedUserForEdit, toggleDrawer]);

  const isSubScreen = !!(selectedUserId || isInvitingAdmin || selectedRoleId || isProvisioningHospital ||
    selectedHospital || isCreatingDeviceType || selectedDeviceType || isCreatingRole ||
    isEditingDeviceType || isEditingHospital || selectedStaffForEdit || selectedUserForEdit ||
    isCreatingHospAdmin);

  useEffect(() => {
    const backAction = () => {
      if (!isSubScreen && activeTab === 'home') {
        Alert.alert(t('exit.title'), t('exit.message'), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('exit.confirm'), style: 'destructive', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
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
setSelectedStaffForEdit(null);
    setSelectedUserForEdit(null);
    setActiveTab(tabId);
  };

  const hasPerm = (permit) => {
    return isOwner || (user?.roles && user.roles.includes(permit));
  };

  const footerItems = [
    { id: 'home', label: t('dashboard.home'), icon: <IconDashboard /> },
    ...(isOwner ? [{ id: 'admins', label: t('dashboard.admins'), icon: <IconUsers /> }] : []),
    ...(hasPerm('permit.admin.hospital') ? [{ id: 'hospitals', label: t('dashboard.hospitals'), icon: <IconHospital /> }] : []),
    ...(hasPerm('permit.admin.devicetype') || hasPerm('permit.create.devicetype') || hasPerm('permit.list.devicetype') ? [{ id: 'types', label: t('dashboard.device_type'), icon: <IconCpu /> }] : []),
    ...(hasPerm('permit.admin.nurse') || hasPerm('permit.admin.doctor') || hasPerm('permit.admin.patient') ? [{ id: 'users', label: t('dashboard.users'), icon: <IconUser /> }] : []),
    ...(hasPerm('permit.admin.roles') ? [{ id: 'roles', label: t('dashboard.roles_perms'), icon: <IconShield /> }] : []),
  ];

  const renderContent = () => {
    if (isCreatingHospAdmin && selectedHospital) return <CreateHospAdminScreen hospitalCode={selectedHospital.hospitalCode} onCancel={() => setIsCreatingHospAdmin(false)} />;
    if (isInvitingAdmin) return <InviteOrgAdminScreen onCancel={() => setIsInvitingAdmin(false)} />;
    if (isProvisioningHospital) return <CreateHospitalScreen onCancel={() => setIsProvisioningHospital(false)} />;
    if (isCreatingDeviceType) return <CreateDeviceTypeScreen onCancel={() => setIsCreatingDeviceType(false)} />;
    if (isEditingDeviceType && selectedDeviceType) return <EditDeviceTypeScreen deviceType={selectedDeviceType} onCancel={() => setIsEditingDeviceType(false)} onSave={(updated) => { setSelectedDeviceType(updated); setIsEditingDeviceType(false); }} />;
    if (selectedDeviceType) return <DeviceTypeDetailScreen deviceType={selectedDeviceType} onBack={() => setSelectedDeviceType(null)} onEdit={() => setIsEditingDeviceType(true)} />;
    if (isEditingHospital && selectedHospital) return <EditHospitalScreen hospital={selectedHospital} onCancel={() => setIsEditingHospital(false)} onSave={(updated) => { setSelectedHospital(updated); setIsEditingHospital(false); }} />;
    if (selectedHospital) return <HospitalDetailScreen hospital={selectedHospital} orgName={user?.orgName} viewerRole={role} onBack={() => setSelectedHospital(null)} onEdit={() => setIsEditingHospital(true)} onAddAdmin={(isOwner || hasPerm('permit.create.user') || hasPerm('permit.admin.users')) ? () => setIsCreatingHospAdmin(true) : undefined} />;
    if (isCreatingRole) return <CreateRoleScreen onCancel={() => setIsCreatingRole(false)} />;
if (selectedStaffForEdit) {
      const isDoctor = !!selectedStaffForEdit.doctorCode;
      return isDoctor
        ? <EditDoctorScreen doctor={selectedStaffForEdit} onCancel={() => setSelectedStaffForEdit(null)} onSave={() => setSelectedStaffForEdit(null)} />
        : <EditNurseScreen nurse={selectedStaffForEdit} onCancel={() => setSelectedStaffForEdit(null)} onSave={() => setSelectedStaffForEdit(null)} />;
    }
    if (selectedUserForEdit) return <EditAdminScreen user={selectedUserForEdit} onCancel={() => setSelectedUserForEdit(null)} onSave={() => setSelectedUserForEdit(null)} />;
    if (selectedUserId) return <UserDetailScreen userId={selectedUserId} onBack={() => setSelectedUserId(null)} onEdit={(u) => { setSelectedUserId(null); setSelectedUserForEdit(u); }} />;
    if (selectedRoleId) return <RoleDetailScreen roleId={selectedRoleId} onBack={() => setSelectedRoleId(null)} />;
    switch (activeTab) {
      case 'home': return <OrgHomeContent role={role} />;
      case 'admins': return <OrgAdminsScreen onInvite={() => setIsInvitingAdmin(true)} onSelectUser={setSelectedUserId} />;
      case 'hospitals': return <HospitalsScreen onProvision={(isOwner || hasPerm('permit.create.hospital')) ? () => setIsProvisioningHospital(true) : undefined} onSelect={setSelectedHospital} />;
      case 'types': return <DeviceTypesScreen onCreate={(isOwner || hasPerm('permit.create.devicetype') || hasPerm('permit.admin.devicetype')) ? () => setIsCreatingDeviceType(true) : undefined} onSelect={setSelectedDeviceType} />;
      case 'users': return <UsersScreen onSelectUser={setSelectedUserId} onSelectStaff={setSelectedStaffForEdit} />;
      case 'roles': return <RolesScreen onSelectRole={setSelectedRoleId} onCreate={(isOwner || hasPerm('permit.create.role')) ? () => setIsCreatingRole(true) : undefined} />;
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
if (selectedStaffForEdit) return selectedStaffForEdit.doctorCode ? t('dashboard.edit_doctor') : t('dashboard.edit_nurse');
    if (selectedUserForEdit) return t('dashboard.edit_admin');
    if (selectedUserId) return t('dashboard.user_details');
    if (selectedRoleId) return t('dashboard.role_details');
    switch (activeTab) {
      case 'home': return t('dashboard.org_console');
      case 'admins': return t('dashboard.org_admins');
      case 'hospitals': return t('dashboard.hospitals');
      case 'types': return t('dashboard.device_types');
      case 'users': return t('dashboard.users');
      case 'roles': return t('dashboard.roles_perms');
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
  section: { marginBottom: 24 },
  list: { gap: 8 },
  listItem: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  hospIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  listItemContent: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hospName: { fontSize: 13.5, fontWeight: '600', color: T.text, flex: 1 },
  hospMetaRow: { flexDirection: 'row', gap: 10, marginTop: 3 },
  hospMetaText: { fontSize: 11, color: T.textFaint, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  errorCard: { borderColor: T.bad, marginBottom: 16, gap: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText: { flex: 1, color: T.text, fontSize: 12.5, lineHeight: 18 },
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
  policyHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  policyCard: { padding: 0, backgroundColor: T.surface },
  policyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  policyLabel: { fontSize: 14, color: T.textDim },
  policyValue: { fontSize: 14, fontWeight: '600', color: T.text },
  policyInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  policyInput: { width: 60, height: 36, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  policyUnit: { fontSize: 13, color: T.textDim },
  policyActions: { flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: T.borderSoft },
});
