import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, BackHandler, ActivityIndicator, Alert, TextInput as RNTextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { summaryApi, organisationApi, getApiErrorMessage } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Btn, getGreeting } from '../../components/Shared';
import { TopBar, BottomNav } from '../../components/Navigation';
import { StatusPill } from '../../components/StatusPill';
import { 
  IconCareSite, IconUsers, IconPulse, IconGateway, IconShield,
  IconAlert, IconChevron, IconMenu, IconSettings, IconDashboard, IconBack, IconUser, IconLogout, IconBed, IconStethoscope, IconDoor, IconPatient, IconPlus, IconClock
} from '../../icons';
import { CreateCareSiteAdminScreen } from '../CareSites/CreateCareSiteAdminScreen';
import { CareSiteAdminsScreen } from '../CareSites/CareSiteAdminsScreen';
import { UserDetailScreen } from '../Users/UserDetailScreen';
import { WardsScreen } from '../Wards/WardsScreen';
import { CreateWardScreen } from '../Wards/CreateWardScreen';
import { CreateBedScreen } from '../Wards/CreateBedScreen';
import { SettingsScreen } from '../Settings/SettingsScreen';
import { DevicesScreen } from '../Devices/DevicesScreen';
import { GatewayDetailScreen } from '../Devices/GatewayDetailScreen';
import { AddDeviceConfigScreen } from '../Devices/AddDeviceConfigScreen';
import { CreateGatewayScreen } from '../Devices/CreateGatewayScreen';
import { CreateDeviceScreen } from '../Devices/CreateDeviceScreen';
import { PatientsScreen } from '../Patients/PatientsScreen';
import { CreatePatientScreen } from '../Patients/CreatePatientScreen';
import { PatientDetailScreen } from '../Patients/PatientDetailScreen';
import { DoctorsScreen } from '../Users/DoctorsScreen';
import { CreateDoctorScreen } from '../Users/CreateDoctorScreen';
import { DoctorDetailScreen } from '../Users/DoctorDetailScreen';
import { ShiftsScreen } from '../Common/ShiftsScreen';
import { CreateShiftScreen } from '../Common/CreateShiftScreen';
import { CreateNurseScreen } from '../Users/CreateNurseScreen';
import { AssignmentScreen } from '../Common/AssignmentScreen';
import { EditWardScreen } from '../Wards/EditWardScreen';
import { EditPatientScreen } from '../Patients/EditPatientScreen';
import { EditDoctorScreen } from '../Users/EditDoctorScreen';
import { NurseDetailScreen } from '../Users/NurseDetailScreen';
import { EditNurseScreen } from '../Users/EditNurseScreen';
import { ShiftDetailScreen } from '../Common/ShiftDetailScreen';
import { EditShiftScreen } from '../Common/EditShiftScreen';
import { NotificationSheet } from '../../components/NotificationSheet';
import { AssignGatewayScreen } from '../Devices/AssignGatewayScreen';
import { AssignDeviceScreen } from '../Devices/AssignDeviceScreen';
import { EditAdminScreen } from '../Users/EditAdminScreen';
import { NursingStationsScreen } from '../NursingStations/NursingStationsScreen';
import { CreateNursingStationScreen } from '../NursingStations/CreateNursingStationScreen';
import { NursingStationDetailScreen } from '../NursingStations/NursingStationDetailScreen';

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


const CareSiteHomeContent = ({ role, onNavigate }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  const isOwner = role === 'CARESITE_OWNER';
  const isAdmin = role === 'CARESITE_ADMIN';
  const canEditPolicy = isOwner || isAdmin;

  const [homeStats, setHomeStats] = useState({ wards: null, beds: null, devices: null, staffing: null, patients: null, dayShiftNurses: null, eveningShiftNurses: null, nightShiftNurses: null });
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [editingPolicy, setEditingPolicy] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyFetching, setPolicyFetching] = useState(false);
  const [policyForm, setPolicyForm] = useState({ adminHours: '', doctorHours: '', nurseHours: '', patientHours: '' });

  const handleEditPolicy = async () => {
    setPolicyFetching(true);
    try {
      const careSite = await organisationApi.getCareSiteByCode(user.orgName, user.careSiteCode, token);
      setPolicyForm({
        adminHours: String(careSite.adminJwtValiditySeconds ? Math.round(careSite.adminJwtValiditySeconds / 3600) : ''),
        doctorHours: String(careSite.doctorJwtValiditySeconds ? Math.round(careSite.doctorJwtValiditySeconds / 3600) : ''),
        nurseHours: String(careSite.nurseJwtValiditySeconds ? Math.round(careSite.nurseJwtValiditySeconds / 3600) : ''),
        patientHours: String(careSite.patientJwtValiditySeconds ? Math.round(careSite.patientJwtValiditySeconds / 3600) : ''),
      });
      setEditingPolicy(true);
    } catch (err) {
      Alert.alert(t('common.error'), t('security_policy.err_load_failed'));
    } finally {
      setPolicyFetching(false);
    }
  };

  const handleSaveCareSitePolicy = async () => {
    const toSeconds = (h) => h.trim() === '' ? null : parseInt(h, 10) * 3600;
    const payload = {};
    if (isOwner) payload.adminJwtValiditySeconds = toSeconds(policyForm.adminHours);
    payload.doctorJwtValiditySeconds = toSeconds(policyForm.doctorHours);
    payload.nurseJwtValiditySeconds = toSeconds(policyForm.nurseHours);
    payload.patientJwtValiditySeconds = toSeconds(policyForm.patientHours);
    const nonNull = Object.values(payload).filter(v => v !== null);
    if (nonNull.some(v => isNaN(v) || v <= 0)) {
      Alert.alert(t('common.invalid_input'), t('security_policy.err_invalid_durations'));
      return;
    }
    setPolicyLoading(true);
    try {
      await organisationApi.updateCareSiteJwtValidity(user.orgName, user.careSiteCode, payload, token);
      setEditingPolicy(false);
    } catch (err) {
      Alert.alert(t('common.error'), err.message || t('security_policy.err_save_failed'));
    } finally {
      setPolicyLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.orgName || !user?.careSiteCode) { setHomeLoading(false); return; }
    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(() => {
    setHomeLoading(true);
    setHomeError(null);
    summaryApi.getCareSiteSummary(user.orgName, user.careSiteCode, token, { signal: controller.signal })
      .then(summary => {
        if (cancelled) return;
        setHomeStats({
          wards:              summary?.stats?.wards              ?? 0,
          beds:               summary?.stats?.beds               ?? 0,
          devices:            summary?.stats?.totalDevices       ?? 0,
          staffing:           summary?.stats?.totalNurses        ?? 0,
          patients:           summary?.stats?.totalPatients      ?? 0,
          dayShiftNurses:     summary?.stats?.dayShiftNurses     ?? 0,
          eveningShiftNurses: summary?.stats?.eveningShiftNurses ?? 0,
          nightShiftNurses:   summary?.stats?.nightShiftNurses   ?? 0,
        });
      })
      .catch(err => {
        if (err?.code === 'ABORTED') return;
        if (!cancelled) setHomeError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setHomeLoading(false);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [user?.orgName, user?.careSiteCode, token, reloadKey]);

  const fmt = (v) => v == null ? '—' : String(v);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.greetingHeader}>
        <Text style={styles.date}>{new Date().toLocaleDateString(t('i18n_locale_tag', 'en-US'), { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()} · {user?.careSiteCode || 'CARESITE'}</Text>
        <Text style={styles.greeting}>{getGreeting(t, user?.userName || 'User')}</Text>
        {homeLoading ? (
          <ActivityIndicator size="small" color={T.textDim} style={{ marginTop: 4 }} />
        ) : (
          <Text style={styles.status}>
            {homeStats.wards != null ? <Text style={{ color: T.good, fontWeight: '600' }}>{homeStats.wards} {t('dashboard.wards').toLowerCase()}</Text> : null}
            {homeStats.wards != null ? '  ·  ' : null}
            <Text>{t('dashboard.registered_devices', { count: fmt(homeStats.devices) })}</Text>
          </Text>
        )}
      </View>

      <View style={styles.grid}>
        <StatCard label="dashboard.admissions" value={homeLoading ? '…' : fmt(homeStats.patients)} icon={<IconPatient />} color="#2DD4BF" accent="rgba(45,212,191,.14)" />
        <StatCard label="dashboard.beds" value={homeLoading ? '…' : fmt(homeStats.beds)} icon={<IconBed />} color={T.accent} />
        <StatCard label="dashboard.devices" value={homeLoading ? '…' : fmt(homeStats.devices)} icon={<IconPulse />} color="#22D3EE" accent="rgba(34,211,238,.14)" />
        <StatCard label="dashboard.staffing" value={homeLoading ? '…' : fmt(homeStats.staffing)} icon={<IconUsers />} color="#A78BFA" accent="rgba(167,139,250,.14)" />
      </View>

      {homeError && !homeLoading && (
        <Card style={styles.errorCard}>
          <View style={styles.errorRow}>
            <IconAlert size={18} color={T.bad} />
            <Text style={styles.errorText}>{homeError}</Text>
          </View>
          <Btn variant="tonal" size="sm" onPress={() => setReloadKey(key => key + 1)}>{t('common.retry', 'Retry')}</Btn>
        </Card>
      )}

      {!homeLoading && !homeError && homeStats.wards === 0 && homeStats.beds === 0 && homeStats.devices === 0 && homeStats.patients === 0 && (
        <Card style={[styles.errorCard, { borderColor: T.border, backgroundColor: T.surfaceAlt || T.surface }]}>
          <View style={styles.errorRow}>
            <IconShield size={18} color={T.accent} />
            <Text style={[styles.errorText, { color: T.textDim }]}>{t('dashboard.caresite_onboarding_hint', 'Welcome! Start by adding wards, beds, and assigning staff to get your careSite operational.')}</Text>
          </View>
        </Card>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <SectionHeader title={t('dashboard.nursing_shifts')} />
          <TouchableOpacity onPress={() => onNavigate('shifts')}><Text style={styles.viewLink}>{t('common.view')} →</Text></TouchableOpacity>
        </View>
        <Card style={styles.listCard}>
          <View style={styles.shiftRow}>
            {[
              { l: t('dashboard.day'),     c: '#22D3EE', v: homeStats.dayShiftNurses },
              { l: t('dashboard.evening'), c: '#A78BFA', v: homeStats.eveningShiftNurses },
              { l: t('dashboard.night'),   c: '#60A5FA', v: homeStats.nightShiftNurses },
            ].map((s, i) => (
              <View key={i} style={[styles.shiftBox, { borderColor: T.borderSoft }]}>
                <View style={styles.shiftHeader}><View style={[styles.shiftDot, { backgroundColor: s.c }]} /><Text style={[styles.shiftTitle, { color: T.textDim }]}>{s.l.toUpperCase()}</Text></View>
                <Text style={styles.shiftCount}>{homeLoading ? '…' : fmt(s.v)}</Text>
                <Text style={styles.shiftUnit}>{t('dashboard.nurses')}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title={t('dashboard.device_alerts')} />
        <Card style={styles.listCard}>
          <View style={[styles.alertItem, { justifyContent: 'center', paddingVertical: 20 }]}>
            <Text style={{ color: T.textFaint, fontSize: 13 }}>{t('dashboard.no_alerts')}</Text>
          </View>
        </Card>
      </View>

      {canEditPolicy && (
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
                <View style={styles.policyGrid}>
                  {[
                    ...(isOwner ? [{ label: t('security_policy.admins'), key: 'adminHours' }] : []),
                    { label: t('security_policy.doctors'), key: 'doctorHours' },
                    { label: t('security_policy.nurses'),  key: 'nurseHours' },
                    { label: t('security_policy.patients'), key: 'patientHours' },
                  ].map((field) => (
                    <View key={field.key} style={styles.policyField}>
                      <Text style={styles.policyFieldLabel}>{field.label}</Text>
                      <View style={styles.policyInputRow}>
                        <RNTextInput
                          style={[styles.policyInput, { color: T.text, borderColor: T.border, backgroundColor: T.surface2 }]}
                          value={policyForm[field.key]}
                          onChangeText={v => setPolicyForm(prev => ({ ...prev, [field.key]: v }))}
                          keyboardType="numeric"
                          placeholder="—"
                          placeholderTextColor={T.textFaint}
                          selectTextOnFocus
                        />
                        <Text style={styles.policyUnit}>{t('security_policy.hrs')}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                <Text style={styles.policyHint}>{t('security_policy.default_hint')}</Text>
                <View style={styles.policyActions}>
                  <Btn variant="surface" size="sm" style={{ flex: 1 }} onPress={() => setEditingPolicy(false)} disabled={policyLoading}>{t('common.cancel')}</Btn>
                  <Btn variant="primary" size="sm" style={{ flex: 1 }} onPress={handleSaveCareSitePolicy} disabled={policyLoading}>
                    {policyLoading ? <ActivityIndicator color="#fff" size="small" /> : t('common.save')}
                  </Btn>
                </View>
              </>
            ) : (
              <View style={styles.policyIdle}>
                <Text style={styles.policyIdleText}>{t('security_policy.idle_hint')}</Text>
              </View>
            )}
          </Card>
        </View>
      )}
    </ScrollView>
  );
};

export const CareSiteDashboard = ({ navigation, route }) => {
  const role = route.params?.role || 'CARESITE_OWNER';
  const isOwner = role === 'CARESITE_OWNER';
  const isNurse = role === 'NURSE';
  const isDoctor = role === 'DOCTOR';
  const isPatient = role === 'PATIENT';
  
  const insets = useSafeAreaInsets();
  const { theme: T } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const styles = createStyles(T);
  const [activeTab, setActiveTab] = useState('home');
  const [shiftsMode, setShiftsMode] = useState('shifts');
  const [devicesMode, setDevicesMode] = useState('gateways');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [isInvitingCareSiteAdmin, setIsInvitingCareSiteAdmin] = useState(false);
  const [isProvisioningWard, setIsProvisioningWard] = useState(false);
  const [selectedWardForBed, setSelectedWardForBed] = useState(null);
  const [isProvisioningGateway, setIsProvisioningGateway] = useState(false);
  const [isProvisioningDevice, setIsProvisioningDevice] = useState(false);
  const [selectedGatewayCode, setSelectedGatewayCode] = useState(null);
  const [selectedDeviceForConfig, setSelectedDeviceForConfig] = useState(null);
  const [isRegisteringPatient, setIsRegisteringPatient] = useState(false);
  const [isCreatingDoctor, setIsCreatingDoctor] = useState(false);
  const [isCreatingNurse, setIsCreatingNurse] = useState(false);
  const [isCreatingShift, setIsCreatingShift] = useState(false);
  const [assignmentData, setAssignmentData] = useState(null);
  const [selectedWardForEdit, setSelectedWardForEdit] = useState(null);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState(null);
  const [selectedDoctorForEdit, setSelectedDoctorForEdit] = useState(null);
  const [selectedNurseId, setSelectedNurseId] = useState(null);
  const [selectedNurseForEdit, setSelectedNurseForEdit] = useState(null);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [selectedShiftForEdit, setSelectedShiftForEdit] = useState(null);
  const [assigningGatewayCode, setAssigningGatewayCode] = useState(null);
  const [isAssigningDevice, setIsAssigningDevice] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [isCreatingNursingStation, setIsCreatingNursingStation] = useState(false);
  const [selectedNursingStation, setSelectedNursingStation] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const drawerAnim = React.useRef(new Animated.Value(-width)).current;

  const isDeep = isInvitingCareSiteAdmin || selectedUserId || isProvisioningWard || selectedWardForBed || isProvisioningGateway || isProvisioningDevice || !!selectedGatewayCode || !!selectedDeviceForConfig || isRegisteringPatient || selectedPatientId || isCreatingDoctor || selectedDoctorId || isCreatingNurse || isCreatingShift || !!assignmentData || !!selectedWardForEdit || !!selectedPatientForEdit || !!selectedDoctorForEdit || selectedNurseId || !!selectedNurseForEdit || selectedShiftId || !!selectedShiftForEdit || !!assigningGatewayCode || isAssigningDevice || !!selectedUserForEdit || isCreatingNursingStation || !!selectedNursingStation;

  useEffect(() => {
    const backAction = () => {
      if (drawerOpen) { toggleDrawer(); return true; }
      if (isDeep) { handleBackPress(); return true; }
      if (activeTab !== 'home') { handleTabChange('home'); return true; }
      Alert.alert(t('exit.title'), t('exit.message'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('exit.confirm'), style: 'destructive', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [drawerOpen, activeTab, isDeep]);

  const handleBackPress = () => {
    setIsInvitingCareSiteAdmin(false);
    setSelectedUserId(null);
    setSelectedPatientId(null);
    setSelectedDoctorId(null);
    setIsProvisioningWard(false);
    setSelectedWardForBed(null);
    setIsProvisioningGateway(false);
    setIsProvisioningDevice(false);
    setSelectedGatewayCode(null);
    setSelectedDeviceForConfig(null);
    setIsRegisteringPatient(false);
    setIsCreatingDoctor(false);
    setIsCreatingNurse(false);
    setIsCreatingShift(false);
    setAssignmentData(null);
    setSelectedWardForEdit(null);
    setSelectedPatientForEdit(null);
    setSelectedDoctorForEdit(null);
    setSelectedNurseId(null);
    setSelectedNurseForEdit(null);
    setSelectedShiftId(null);
    setSelectedShiftForEdit(null);
    setAssigningGatewayCode(null);
    setIsAssigningDevice(false);
    setSelectedUserForEdit(null);
    setIsCreatingNursingStation(false);
    setSelectedNursingStation(null);
  };

  const toggleDrawer = React.useCallback(() => {
    const toValue = drawerOpen ? -width : 0;
    Animated.timing(drawerAnim, { toValue, duration: 250, useNativeDriver: true }).start();
    setDrawerOpen(!drawerOpen);
  }, [drawerOpen, drawerAnim]);

  const handleTabChange = (tabId) => {
    handleBackPress();
    setActiveTab(tabId);
  };

  const hasPerm = (permit) => {
    return isOwner || (user?.roles && user.roles.includes(permit));
  };

  const footerItems = isNurse ? [
    { id: 'home',     label: t('dashboard.home'),     icon: <IconDashboard /> },
    { id: 'devices',  label: t('dashboard.devices'),  icon: <IconPulse /> },
    { id: 'patients', label: t('dashboard.patients'), icon: <IconPatient /> },
    { id: 'shifts',   label: t('dashboard.shifts'),   icon: <IconClock /> },
  ] : isDoctor ? [
    { id: 'home',     label: t('dashboard.home'),     icon: <IconDashboard /> },
    { id: 'devices',  label: t('dashboard.devices'),  icon: <IconPulse /> },
    { id: 'patients', label: t('dashboard.patients'), icon: <IconPatient /> },
  ] : isPatient ? [
    { id: 'home',    label: t('dashboard.home'),    icon: <IconDashboard /> },
    { id: 'devices', label: t('dashboard.devices'), icon: <IconPulse /> },
  ] : [
    { id: 'home', label: t('dashboard.home'), icon: <IconDashboard /> },
    ...(isOwner ? [{ id: 'admins', label: t('dashboard.admins'), icon: <IconUsers /> }] : []),
    ...(hasPerm('permit.admin.ward') || hasPerm('permit.admin.bed') || hasPerm('permit.create.ward') || hasPerm('permit.create.bed') ? [{ id: 'wards', label: t('dashboard.wards'), icon: <IconDoor /> }] : []),
    ...(hasPerm('permit.admin.gateway') || hasPerm('permit.admin.device') || hasPerm('permit.create.gateway') || hasPerm('permit.create.device') ? [{ id: 'devices', label: t('dashboard.devices'), icon: <IconPulse /> }] : []),
    ...(hasPerm('permit.admin.patient') || hasPerm('permit.create.patient') ? [{ id: 'patients', label: t('dashboard.patients'), icon: <IconPatient /> }] : []),
    ...(hasPerm('permit.admin.doctor') || hasPerm('permit.create.doctor') ? [{ id: 'doctors', label: t('dashboard.doctors'), icon: <IconStethoscope /> }] : []),
    ...(hasPerm('permit.admin.shift') || hasPerm('permit.admin.nurse') || hasPerm('permit.create.shift') || hasPerm('permit.create.nurse') ? [{ id: 'shifts', label: t('dashboard.shifts'), icon: <IconClock /> }] : []),
    ...(hasPerm('permit.admin.nursingstation') || hasPerm('permit.create.nursingstation') ? [{ id: 'nursing', label: t('dashboard.nursing_stations'), icon: <IconBed /> }] : []),
  ];

  const renderContent = () => {
    if (isInvitingCareSiteAdmin) return <CreateCareSiteAdminScreen onCancel={() => setIsInvitingCareSiteAdmin(false)} />;
    if (isProvisioningWard) return <CreateWardScreen onCancel={() => setIsProvisioningWard(false)} />;
    if (selectedWardForBed) return <CreateBedScreen onCancel={() => setSelectedWardForBed(null)} wardCode={selectedWardForBed} />;
    if (isProvisioningGateway) return <CreateGatewayScreen onCancel={() => setIsProvisioningGateway(false)} />;
    if (isProvisioningDevice) return <CreateDeviceScreen onCancel={() => setIsProvisioningDevice(false)} />;
    if (assigningGatewayCode) return <AssignGatewayScreen initialGatewayCode={assigningGatewayCode} onCancel={() => setAssigningGatewayCode(null)} onSuccess={() => setAssigningGatewayCode(null)} />;
    if (isAssigningDevice) return <AssignDeviceScreen onCancel={() => setIsAssigningDevice(false)} onSuccess={() => setIsAssigningDevice(false)} />;
    if (selectedUserForEdit) return <EditAdminScreen user={selectedUserForEdit} onCancel={() => setSelectedUserForEdit(null)} onSave={() => setSelectedUserForEdit(null)} />;
    if (isCreatingNursingStation) return <CreateNursingStationScreen onCancel={() => setIsCreatingNursingStation(false)} onSuccess={() => setIsCreatingNursingStation(false)} />;
    if (selectedNursingStation) return <NursingStationDetailScreen station={selectedNursingStation} onBack={() => setSelectedNursingStation(null)} />;
    if (selectedGatewayCode) return <GatewayDetailScreen gatewayCode={selectedGatewayCode} onBack={() => setSelectedGatewayCode(null)} onAssign={(code) => { setSelectedGatewayCode(null); setAssigningGatewayCode(code); }} />;
    if (selectedDeviceForConfig) return <AddDeviceConfigScreen device={selectedDeviceForConfig} onCancel={() => setSelectedDeviceForConfig(null)} onSuccess={() => setSelectedDeviceForConfig(null)} />;
    if (isRegisteringPatient) return <CreatePatientScreen onCancel={() => setIsRegisteringPatient(false)} />;
    if (isCreatingDoctor) return <CreateDoctorScreen onCancel={() => setIsCreatingDoctor(false)} careSiteCode={user?.careSiteCode} />;
    if (isCreatingNurse) return <CreateNurseScreen onCancel={() => setIsCreatingNurse(false)} careSiteCode={user?.careSiteCode} />;
    if (isCreatingShift) return <CreateShiftScreen onCancel={() => setIsCreatingShift(false)} />;
    if (assignmentData) return <AssignmentScreen initialPatientId={assignmentData.patientId} initialDoctorId={assignmentData.doctorId} onCancel={() => setAssignmentData(null)} />;
    if (selectedWardForEdit) return <EditWardScreen ward={selectedWardForEdit} onCancel={() => setSelectedWardForEdit(null)} onSave={() => setSelectedWardForEdit(null)} onDelete={() => setSelectedWardForEdit(null)} />;
    if (selectedPatientForEdit) return <EditPatientScreen patientDetail={selectedPatientForEdit} onCancel={() => setSelectedPatientForEdit(null)} onSave={() => setSelectedPatientForEdit(null)} />;
    if (selectedDoctorForEdit) return <EditDoctorScreen doctor={selectedDoctorForEdit} onCancel={() => setSelectedDoctorForEdit(null)} onSave={() => setSelectedDoctorForEdit(null)} />;
    if (selectedNurseForEdit) return <EditNurseScreen nurse={selectedNurseForEdit} onCancel={() => setSelectedNurseForEdit(null)} onSave={() => setSelectedNurseForEdit(null)} />;
    if (selectedNurseId) return <NurseDetailScreen nurseId={selectedNurseId} onBack={() => setSelectedNurseId(null)} onEdit={(n) => setSelectedNurseForEdit(n)} />;
    if (selectedShiftForEdit) return <EditShiftScreen shift={selectedShiftForEdit} onCancel={() => setSelectedShiftForEdit(null)} onSave={() => setSelectedShiftForEdit(null)} onDelete={() => { setSelectedShiftForEdit(null); setSelectedShiftId(null); }} />;
    if (selectedShiftId) return <ShiftDetailScreen shiftId={selectedShiftId} onBack={() => setSelectedShiftId(null)} onEdit={(s) => setSelectedShiftForEdit(s)} />;
    if (selectedUserId) return <UserDetailScreen userId={selectedUserId} onBack={() => setSelectedUserId(null)} onEdit={(u) => { setSelectedUserId(null); setSelectedUserForEdit(u); }} />;
    if (selectedPatientId) return <PatientDetailScreen patientId={selectedPatientId} onBack={() => setSelectedPatientId(null)} onAssign={() => setAssignmentData({ patientId: selectedPatientId })} onEdit={(detail) => setSelectedPatientForEdit(detail)} />;
    if (selectedDoctorId) return <DoctorDetailScreen doctorId={selectedDoctorId} onBack={() => setSelectedDoctorId(null)} onAssign={() => setAssignmentData({ doctorId: selectedDoctorId })} onEdit={(d) => setSelectedDoctorForEdit(d)} />;
    switch (activeTab) {
      case 'home': return <CareSiteHomeContent role={role} onNavigate={handleTabChange} />;
      case 'admins': return <CareSiteAdminsScreen onInvite={() => setIsInvitingCareSiteAdmin(true)} onSelectUser={setSelectedUserId} />;
      case 'wards': return <WardsScreen onNewWard={() => setIsProvisioningWard(true)} onNewBed={setSelectedWardForBed} onEditWard={setSelectedWardForEdit} />;
      case 'devices': return <DevicesScreen onNewGateway={(isNurse || isDoctor || isPatient) ? undefined : () => setIsProvisioningGateway(true)} onNewDevice={(isNurse || isDoctor || isPatient) ? undefined : () => setIsProvisioningDevice(true)} onGatewayPress={setSelectedGatewayCode} onDevicePress={setSelectedDeviceForConfig} onDeviceAssign={(isNurse || isDoctor || isPatient) ? undefined : () => setIsAssigningDevice(true)} mode={devicesMode} onModeChange={setDevicesMode} />;
      case 'patients': return <PatientsScreen onNewPatient={() => setIsRegisteringPatient(true)} onSelectPatient={setSelectedPatientId} />;
      case 'doctors': return <DoctorsScreen onNewDoctor={() => setIsCreatingDoctor(true)} onSelectDoctor={setSelectedDoctorId} />;
      case 'shifts': return <ShiftsScreen onNewNurse={() => setIsCreatingNurse(true)} onNewShift={() => setIsCreatingShift(true)} onSelectNurse={setSelectedNurseId} onSelectShift={setSelectedShiftId} mode={shiftsMode} onModeChange={setShiftsMode} />;
      case 'nursing': return <NursingStationsScreen onNewStation={() => setIsCreatingNursingStation(true)} onSelectStation={setSelectedNursingStation} />;
      case 'settings': return <SettingsScreen onLogout={() => { logout(); navigation.replace('Login'); }} />;
      default: return <CareSiteHomeContent role={role} onNavigate={handleTabChange} />;
    }
  };

  const getTitle = () => {
    if (isInvitingCareSiteAdmin) return t('dashboard.invite_caresite_admin');
    if (isProvisioningWard) return t('dashboard.create_ward');
    if (selectedWardForBed) return t('dashboard.provision_bed');
    if (isProvisioningGateway) return t('dashboard.create_gateway');
    if (isProvisioningDevice) return t('dashboard.create_device');
    if (assigningGatewayCode) return t('dashboard.assign_gateway_title');
    if (isAssigningDevice) return t('dashboard.assign_device_title');
    if (selectedGatewayCode) return t('gateway.detail_title');
    if (selectedDeviceForConfig) return t('device.config_title');
    if (isRegisteringPatient) return t('dashboard.register_patient');
    if (isCreatingDoctor) return t('dashboard.onboard_doctor');
    if (isCreatingNurse) return t('dashboard.onboard_nurse');
    if (isCreatingShift) return t('dashboard.assign_shift');
    if (assignmentData) return t('dashboard.clinical_assignment');
    if (selectedWardForEdit) return t('dashboard.edit_ward');
    if (selectedPatientForEdit) return t('dashboard.edit_patient');
    if (selectedDoctorForEdit) return t('dashboard.edit_doctor');
    if (selectedNurseForEdit) return t('dashboard.edit_nurse');
    if (selectedNurseId) return t('dashboard.nurse_details');
    if (selectedShiftForEdit) return t('dashboard.edit_shift');
    if (selectedShiftId) return t('dashboard.shift_details');
    if (selectedUserForEdit) return t('dashboard.edit_admin');
    if (isCreatingNursingStation) return t('nursingstation.create_title');
    if (selectedNursingStation) return t('nursingstation.detail_title');
    if (selectedUserId) return t('dashboard.user_details');
    if (selectedPatientId) return t('dashboard.patient_details');
    if (selectedDoctorId) return t('dashboard.doctor_details');
    switch (activeTab) {
      case 'home': return t('dashboard.caresite_console');
      case 'admins': return t('dashboard.caresite_admins');
      case 'wards': return t('dashboard.wards_beds');
      case 'devices': return t('dashboard.gateways_devices');
      case 'patients': return t('dashboard.patient_registry');
      case 'doctors': return t('dashboard.medical_staff');
      case 'shifts': return t('dashboard.nurses_shifts');
      case 'nursing': return t('dashboard.nursing_stations_title');
      case 'settings': return t('dashboard.system_settings');
      default: return t('dashboard.caresite_console');
    }
  };

  return (
    <View style={styles.container}>
      {drawerOpen && <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={toggleDrawer} />}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerName}>{user?.userName || 'User'}</Text>
            <Text style={styles.drawerRole}>{isOwner ? t('dashboard.caresite_owner') : isNurse ? t('dashboard.nurse') : isDoctor ? t('dashboard.doctor') : isPatient ? t('dashboard.patient') : t('dashboard.caresite_administrator')}</Text>
          </View>
          <ScrollView style={styles.drawerMenu}>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { handleTabChange('home'); toggleDrawer(); }}><IconDashboard size={20} color={T.textDim} /><Text style={styles.drawerItemText}>{t('dashboard.title')}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { handleTabChange('settings'); toggleDrawer(); }}><IconSettings size={20} color={T.textDim} /><Text style={styles.drawerItemText}>{t('dashboard.system_settings')}</Text></TouchableOpacity>
            <View style={styles.drawerDivider} />
            <TouchableOpacity style={[styles.drawerItem, { marginTop: 'auto' }]} onPress={() => { logout(); navigation.replace('Login'); }}><IconLogout size={20} color={T.bad} /><Text style={[styles.drawerItemText, { color: T.bad }]}>{t('common.logout')}</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>
      <TopBar title={getTitle()} leading={ isDeep ? <IconBack /> : <IconMenu /> } onLeadingPress={isDeep ? handleBackPress : toggleDrawer} onNotificationPress={() => setShowNotifications(true)} onProfilePress={() => handleTabChange('settings')} />
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
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  viewLink: { color: T.accent, fontSize: 11.5, fontWeight: '600' },
  shiftRow: { flexDirection: 'row', gap: 8 },
  shiftBox: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1 },
  shiftHeader: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  shiftDot: { width: 6, height: 6, borderRadius: 3 },
  shiftTitle: { fontSize: 10.5, fontWeight: '600', letterSpacing: 0.4 },
  shiftCount: { fontSize: 16, fontWeight: '700', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 6 },
  shiftUnit: { fontSize: 10, color: T.textDim, marginTop: 2 },
  listCard: { backgroundColor: T.surface, overflow: 'hidden' },
  alertItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  alertIconBox: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  alertId: { fontSize: 13, fontWeight: '600', color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  alertMeta: { fontSize: 11, color: T.textFaint, marginTop: 2 },
  errorCard: { borderColor: T.bad, marginBottom: 16, gap: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText: { flex: 1, color: T.text, fontSize: 12.5, lineHeight: 18 },
  listBorder: { borderTopWidth: 1, borderTopColor: T.borderSoft },
  drawerOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: width * 0.75, backgroundColor: T.surface, zIndex: 20, borderRightWidth: 1, borderRightColor: T.border },
  drawerHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: T.borderSoft },
  drawerName: { fontSize: 18, fontWeight: '700', color: T.text },
  drawerRole: { fontSize: 12, color: T.textDim, marginTop: 4 },
  drawerMenu: { flex: 1, padding: 16 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderRadius: 12 },
  drawerItemText: { fontSize: 14, fontWeight: '600', color: T.text },
  drawerDivider: { height: 1, backgroundColor: T.borderSoft, marginVertical: 12, marginHorizontal: 12 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  placeholderText: { color: T.textDim, fontSize: 14, textAlign: 'center' },
  policyHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  policyCard: { padding: 0, backgroundColor: T.surface },
  policyGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 16 },
  policyField: { width: '45%', gap: 6 },
  policyFieldLabel: { fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 0.5, textTransform: 'uppercase' },
  policyInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  policyInput: { width: 64, height: 38, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, textAlign: 'center', fontSize: 15, fontWeight: '700' },
  policyUnit: { fontSize: 12, color: T.textDim },
  policyHint: { fontSize: 11, color: T.textFaint, paddingHorizontal: 16, paddingBottom: 12, lineHeight: 16 },
  policyActions: { flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: T.borderSoft },
  policyIdle: { padding: 16 },
  policyIdleText: { fontSize: 13, color: T.textDim, lineHeight: 20 },
});
