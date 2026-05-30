import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, BackHandler, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { summaryApi, getApiErrorMessage } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Btn, getGreeting } from '../../components/Shared';
import { TopBar, BottomNav } from '../../components/Navigation';
import { StatusPill } from '../../components/StatusPill';
import { 
  IconHospital, IconUsers, IconPulse, IconGateway, IconShield, IconChart,
  IconAlert, IconChevron, IconMenu, IconSettings, IconDashboard, IconBack, IconUser, IconLogout, IconBed, IconStethoscope, IconDoor, IconPatient, IconPlus, IconClock
} from '../../icons';
import { CreateHospAdminScreen } from '../Hospitals/CreateHospAdminScreen';
import { HospAdminsScreen } from '../Hospitals/HospAdminsScreen';
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

const PulseWave = ({ color }) => (
  <View style={{ height: 40, justifyContent: 'flex-end', paddingBottom: 5 }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      {[20, 40, 15, 80, 10, 30, 25, 60, 40, 20].map((h, i) => (
        <View key={i} style={{ width: 3, height: h * 0.4, backgroundColor: color, borderRadius: 1 }} />
      ))}
    </View>
  </View>
);

const HospHomeContent = ({ role, onNavigate }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  const [homeStats, setHomeStats] = useState({ wards: null, beds: null, devices: null, staffing: null, patients: null, dayShiftNurses: null, eveningShiftNurses: null, nightShiftNurses: null });
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) { setHomeLoading(false); return; }
    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(() => {
    setHomeLoading(true);
    setHomeError(null);
    summaryApi.getHospitalSummary(user.orgName, user.hospitalCode, token, { signal: controller.signal })
      .then(summary => {
        if (cancelled) return;
        setHomeStats({
          wards:              summary?.stats?.wards              ?? null,
          beds:               summary?.stats?.beds               ?? null,
          devices:            summary?.stats?.totalDevices       ?? null,
          staffing:           summary?.stats?.totalNurses        ?? null,
          patients:           summary?.stats?.totalPatients      ?? null,
          dayShiftNurses:     summary?.stats?.dayShiftNurses     ?? null,
          eveningShiftNurses: summary?.stats?.eveningShiftNurses ?? null,
          nightShiftNurses:   summary?.stats?.nightShiftNurses   ?? null,
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
  }, [user?.orgName, user?.hospitalCode, token, reloadKey]);

  const fmt = (v) => v == null ? '—' : String(v);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.greetingHeader}>
        <Text style={styles.date}>{new Date().toLocaleDateString(t('i18n_locale_tag', 'en-US'), { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()} · {user?.hospitalCode || 'HOSPITAL'}</Text>
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
          <Btn variant="tonal" size="sm" onPress={() => setReloadKey(key => key + 1)}>Retry</Btn>
        </Card>
      )}

      <Card style={{ marginBottom: 24 }}>
        <View style={styles.sectionHeaderRow}>
          <SectionHeader title={t('dashboard.live_vitals')} />
          {homeStats.beds != null && <Text style={styles.bedsLabel}>● {homeStats.beds} {t('dashboard.beds').toUpperCase()}</Text>}
        </View>
        <View style={styles.vitalsGrid}>
          {[
            { l: t('dashboard.avg_hr'),   v: '—', u: 'bpm', c: '#F472B6' },
            { l: t('dashboard.avg_spo2'), v: '—', u: '%',   c: '#22D3EE' },
            { l: t('dashboard.alerts'),   v: '—', u: '',    c: T.warn    },
          ].map((m, i) => (
            <View key={i} style={{ flex: 1 }}>
              <Text style={styles.vitalLabel}>{m.l}</Text>
              <Text style={[styles.vitalValue, { color: m.c }]}>{m.v}<Text style={styles.vitalUnit}>{m.u}</Text></Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 12 }}><PulseWave color={T.accent} /></View>
      </Card>

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
    </ScrollView>
  );
};

export const HospDashboard = ({ navigation, route }) => {
  const role = route.params?.role || 'HOSP_OWNER';
  const isOwner = role === 'HOSP_OWNER';
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
  const [isInvitingHospAdmin, setIsInvitingHospAdmin] = useState(false);
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const drawerAnim = React.useRef(new Animated.Value(-width)).current;

  const isDeep = isInvitingHospAdmin || selectedUserId || isProvisioningWard || selectedWardForBed || isProvisioningGateway || isProvisioningDevice || !!selectedGatewayCode || !!selectedDeviceForConfig || isRegisteringPatient || selectedPatientId || isCreatingDoctor || selectedDoctorId || isCreatingNurse || isCreatingShift || !!assignmentData || !!selectedWardForEdit || !!selectedPatientForEdit || !!selectedDoctorForEdit || selectedNurseId || !!selectedNurseForEdit || selectedShiftId || !!selectedShiftForEdit || !!assigningGatewayCode || isAssigningDevice || !!selectedUserForEdit;

  useEffect(() => {
    const backAction = () => {
      if (drawerOpen) { toggleDrawer(); return true; }
      if (isDeep) { handleBackPress(); return true; }
      if (activeTab !== 'home') { handleTabChange('home'); return true; }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [drawerOpen, activeTab, isDeep]);

  const handleBackPress = () => {
    setIsInvitingHospAdmin(false);
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
    { id: 'wards', label: t('dashboard.wards'), icon: <IconDoor /> },
    { id: 'devices', label: t('dashboard.devices'), icon: <IconPulse /> },
    { id: 'patients', label: t('dashboard.patients'), icon: <IconPatient /> },
    { id: 'doctors', label: t('dashboard.doctors'), icon: <IconStethoscope /> },
    { id: 'shifts', label: t('dashboard.shifts'), icon: <IconClock /> },
  ];

  const renderContent = () => {
    if (isInvitingHospAdmin) return <CreateHospAdminScreen onCancel={() => setIsInvitingHospAdmin(false)} />;
    if (isProvisioningWard) return <CreateWardScreen onCancel={() => setIsProvisioningWard(false)} />;
    if (selectedWardForBed) return <CreateBedScreen onCancel={() => setSelectedWardForBed(null)} wardCode={selectedWardForBed} />;
    if (isProvisioningGateway) return <CreateGatewayScreen onCancel={() => setIsProvisioningGateway(false)} />;
    if (isProvisioningDevice) return <CreateDeviceScreen onCancel={() => setIsProvisioningDevice(false)} />;
    if (assigningGatewayCode) return <AssignGatewayScreen initialGatewayCode={assigningGatewayCode} onCancel={() => setAssigningGatewayCode(null)} onSuccess={() => setAssigningGatewayCode(null)} />;
    if (isAssigningDevice) return <AssignDeviceScreen onCancel={() => setIsAssigningDevice(false)} onSuccess={() => setIsAssigningDevice(false)} />;
    if (selectedUserForEdit) return <EditAdminScreen user={selectedUserForEdit} onCancel={() => setSelectedUserForEdit(null)} onSave={() => setSelectedUserForEdit(null)} />;
    if (selectedGatewayCode) return <GatewayDetailScreen gatewayCode={selectedGatewayCode} onBack={() => setSelectedGatewayCode(null)} onAssign={(code) => { setSelectedGatewayCode(null); setAssigningGatewayCode(code); }} />;
    if (selectedDeviceForConfig) return <AddDeviceConfigScreen device={selectedDeviceForConfig} onCancel={() => setSelectedDeviceForConfig(null)} onSuccess={() => setSelectedDeviceForConfig(null)} />;
    if (isRegisteringPatient) return <CreatePatientScreen onCancel={() => setIsRegisteringPatient(false)} />;
    if (isCreatingDoctor) return <CreateDoctorScreen onCancel={() => setIsCreatingDoctor(false)} hospCode="CLV-MAIN" />;
    if (isCreatingNurse) return <CreateNurseScreen onCancel={() => setIsCreatingNurse(false)} hospCode="CLV-MAIN" />;
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
      case 'home': return <HospHomeContent role={role} onNavigate={handleTabChange} />;
      case 'admins': return <HospAdminsScreen onInvite={() => setIsInvitingHospAdmin(true)} onSelectUser={setSelectedUserId} />;
      case 'wards': return <WardsScreen onNewWard={() => setIsProvisioningWard(true)} onNewBed={setSelectedWardForBed} onEditWard={setSelectedWardForEdit} />;
      case 'devices': return <DevicesScreen onNewGateway={(isNurse || isDoctor || isPatient) ? undefined : () => setIsProvisioningGateway(true)} onNewDevice={(isNurse || isDoctor || isPatient) ? undefined : () => setIsProvisioningDevice(true)} onGatewayPress={setSelectedGatewayCode} onDevicePress={setSelectedDeviceForConfig} onDeviceAssign={(isNurse || isDoctor || isPatient) ? undefined : () => setIsAssigningDevice(true)} mode={devicesMode} onModeChange={setDevicesMode} />;
      case 'patients': return <PatientsScreen onNewPatient={() => setIsRegisteringPatient(true)} onSelectPatient={setSelectedPatientId} />;
      case 'doctors': return <DoctorsScreen onNewDoctor={() => setIsCreatingDoctor(true)} onSelectDoctor={setSelectedDoctorId} />;
      case 'shifts': return <ShiftsScreen onNewNurse={() => setIsCreatingNurse(true)} onNewShift={() => setIsCreatingShift(true)} onSelectNurse={setSelectedNurseId} onSelectShift={setSelectedShiftId} mode={shiftsMode} onModeChange={setShiftsMode} />;
      case 'settings': return <SettingsScreen onLogout={() => { logout(); navigation.replace('Login'); }} />;
      default: return <HospHomeContent role={role} onNavigate={handleTabChange} />;
    }
  };

  const getTitle = () => {
    if (isInvitingHospAdmin) return t('dashboard.invite_hosp_admin');
    if (isProvisioningWard) return t('dashboard.create_ward');
    if (selectedWardForBed) return t('dashboard.provision_bed');
    if (isProvisioningGateway) return t('dashboard.create_gateway');
    if (isProvisioningDevice) return t('dashboard.create_device');
    if (assigningGatewayCode) return 'Assign Gateway to Patient';
    if (isAssigningDevice) return 'Assign Device';
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
    if (selectedUserId) return t('dashboard.user_details');
    if (selectedPatientId) return t('dashboard.patient_details');
    if (selectedDoctorId) return t('dashboard.doctor_details');
    switch (activeTab) {
      case 'home': return t('dashboard.hosp_console');
      case 'admins': return t('dashboard.hosp_admins');
      case 'wards': return t('dashboard.wards_beds');
      case 'devices': return t('dashboard.gateways_devices');
      case 'patients': return t('dashboard.patient_registry');
      case 'doctors': return t('dashboard.medical_staff');
      case 'shifts': return t('dashboard.nurses_shifts');
      case 'settings': return t('dashboard.system_settings');
      default: return t('dashboard.hosp_console');
    }
  };

  return (
    <View style={styles.container}>
      {drawerOpen && <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={toggleDrawer} />}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerName}>{user?.userName || 'User'}</Text>
            <Text style={styles.drawerRole}>{isOwner ? t('dashboard.hosp_owner') : isNurse ? t('dashboard.nurse') : isDoctor ? t('dashboard.doctor') : isPatient ? t('dashboard.patient') : t('dashboard.hosp_administrator')}</Text>
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
  bedsLabel: { fontSize: 10, color: T.good, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  vitalsGrid: { flexDirection: 'row', gap: 14, marginTop: 4 },
  vitalLabel: { fontSize: 10.5, color: T.textDim, letterSpacing: 0.5 },
  vitalValue: { fontSize: 20, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 2 },
  vitalUnit: { fontSize: 10, color: T.textDim, fontWeight: '500', marginLeft: 2 },
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
});
