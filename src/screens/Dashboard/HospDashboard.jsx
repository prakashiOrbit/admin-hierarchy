import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, BackHandler, ActivityIndicator } from 'react-native';
import { summaryApi, deviceApi, patientApi, nurseApi } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { TopBar, BottomNav } from '../../components/Navigation';
import { StatusPill } from '../../components/StatusPill';
import { 
  IconHospital, IconUsers, IconPulse, IconGateway, IconShield, IconChart,
  IconAlert, IconChevron, IconMenu, IconSettings, IconDashboard, IconBack, IconUser, IconMoon, IconLogout, IconBed, IconStethoscope, IconDoor, IconPatient, IconPlus, IconClock
} from '../../icons';
import { CreateHospAdminScreen } from '../Hospitals/CreateHospAdminScreen';
import { HospAdminsScreen } from '../Hospitals/HospAdminsScreen';
import { UserDetailScreen } from '../Users/UserDetailScreen';
import { WardsScreen } from '../Wards/WardsScreen';
import { CreateWardScreen } from '../Wards/CreateWardScreen';
import { CreateBedScreen } from '../Wards/CreateBedScreen';
import { DevicesScreen } from '../Devices/DevicesScreen';
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

const PulseWave = ({ color }) => (
  <View style={{ height: 40, justifyContent: 'flex-end', paddingBottom: 5 }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      {[20, 40, 15, 80, 10, 30, 25, 60, 40, 20].map((h, i) => (
        <View key={i} style={{ width: 3, height: h * 0.4, backgroundColor: color, borderRadius: 1 }} />
      ))}
    </View>
  </View>
);

const DAY_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MON_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const HospHomeContent = ({ role, onNavigate }) => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  const [homeStats, setHomeStats] = useState({ wards: null, beds: null, devices: null, staffing: null, patients: null });
  const [homeLoading, setHomeLoading] = useState(true);

  useEffect(() => {
    if (!user?.orgName || !user?.hospitalCode) { setHomeLoading(false); return; }
    Promise.all([
      summaryApi.getHospitalSummary(user.orgName, user.hospitalCode, token).catch(() => null),
      deviceApi.listAll(user.orgName, user.hospitalCode, token).catch(() => []),
      patientApi.listAll(user.orgName, user.hospitalCode, token).catch(() => []),
      nurseApi.listAll(user.orgName, user.hospitalCode, token).catch(() => []),
    ]).then(([summary, devices, patients, nurses]) => {
      setHomeStats({
        wards: summary?.stats?.wards ?? null,
        beds: summary?.stats?.beds ?? null,
        devices: Array.isArray(devices) ? devices.length : null,
        staffing: Array.isArray(nurses) ? nurses.length : null,
        patients: Array.isArray(patients) ? patients.length : null,
      });
    }).finally(() => setHomeLoading(false));
  }, [user?.orgName, user?.hospitalCode, token]);

  const fmt = (v) => v == null ? '—' : String(v);
  const now = new Date();
  const dateStr = `${DAY_NAMES[now.getDay()]}, ${now.getDate()} ${MON_NAMES[now.getMonth()]}`;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Greeting */}
      <View style={styles.greetingHeader}>
        <Text style={styles.date}>{dateStr} · {user?.hospitalCode || 'HOSPITAL'}</Text>
        <Text style={styles.greeting}>Good morning, {user?.userName || 'User'}</Text>
        {homeLoading ? (
          <ActivityIndicator size="small" color={T.textDim} style={{ marginTop: 4 }} />
        ) : (
          <Text style={styles.status}>
            {homeStats.wards != null
              ? <Text style={{ color: T.good, fontWeight: '600' }}>{homeStats.wards} wards</Text>
              : null}
            {homeStats.wards != null ? '  ·  ' : null}
            <Text>{fmt(homeStats.devices)} devices registered</Text>
          </Text>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <StatCard
          label="Admissions"
          value={homeLoading ? '…' : fmt(homeStats.patients)}
          icon={<IconPatient />} color="#2DD4BF" accent="rgba(45,212,191,.14)"
        />
        <StatCard
          label="Active Beds"
          value={homeLoading ? '…' : fmt(homeStats.beds)}
          icon={<IconBed />} color={T.accent}
        />
        <StatCard
          label="Devices"
          value={homeLoading ? '…' : fmt(homeStats.devices)}
          icon={<IconPulse />} color="#22D3EE" accent="rgba(34,211,238,.14)"
        />
        <StatCard
          label="Staffing"
          value={homeLoading ? '…' : fmt(homeStats.staffing)}
          icon={<IconUsers />} color="#A78BFA" accent="rgba(167,139,250,.14)"
        />
      </View>

      {/* Live Vitals Card */}
      <Card style={{ marginBottom: 24 }}>
        <View style={styles.sectionHeaderRow}>
          <SectionHeader title="LIVE VITALS" />
          {homeStats.beds != null && (
            <Text style={styles.bedsLabel}>● {homeStats.beds} BEDS</Text>
          )}
        </View>
        <View style={styles.vitalsGrid}>
          {[
            { l: 'AVG HR',   v: '—', u: 'bpm', c: '#F472B6' },
            { l: 'AVG SpO₂', v: '—', u: '%',   c: '#22D3EE' },
            { l: 'ALERTS',   v: '—', u: '',    c: T.warn    },
          ].map((m, i) => (
            <View key={i} style={{ flex: 1 }}>
              <Text style={styles.vitalLabel}>{m.l}</Text>
              <Text style={[styles.vitalValue, { color: m.c }]}>
                {m.v}<Text style={styles.vitalUnit}>{m.u}</Text>
              </Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 12 }}>
          <PulseWave color={T.accent} />
        </View>
      </Card>

      {/* Today's Shifts */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <SectionHeader title="NURSING SHIFTS" />
          <TouchableOpacity onPress={() => onNavigate('shifts')}>
            <Text style={styles.viewLink}>View →</Text>
          </TouchableOpacity>
        </View>
        <Card style={styles.listCard}>
          <View style={styles.shiftRow}>
            {[
              { l: 'Day',     c: '#22D3EE' },
              { l: 'Evening', c: '#A78BFA' },
              { l: 'Night',   c: '#60A5FA' },
            ].map((s, i) => (
              <View key={i} style={[styles.shiftBox, { borderColor: T.borderSoft }]}>
                <View style={styles.shiftHeader}>
                  <View style={[styles.shiftDot, { backgroundColor: s.c }]} />
                  <Text style={[styles.shiftTitle, { color: T.textDim }]}>{s.l.toUpperCase()}</Text>
                </View>
                <Text style={styles.shiftCount}>—</Text>
                <Text style={styles.shiftUnit}>nurses</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Device Alerts */}
      <View style={styles.section}>
        <SectionHeader title="DEVICE ALERTS" />
        <Card style={styles.listCard}>
          <View style={[styles.alertItem, { justifyContent: 'center', paddingVertical: 20 }]}>
            <Text style={{ color: T.textFaint, fontSize: 13 }}>No active alerts</Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export const HospDashboard = ({ navigation, route }) => {
  const role = route.params?.role || 'HOSP_OWNER';
  const isOwner = role === 'HOSP_OWNER';
  
  const insets = useSafeAreaInsets();
  const { theme: T, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const styles = createStyles(T);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [isInvitingHospAdmin, setIsInvitingHospAdmin] = useState(false);
  const [isProvisioningWard, setIsProvisioningWard] = useState(false);
  const [selectedWardForBed, setSelectedWardForBed] = useState(null);
  const [isProvisioningGateway, setIsProvisioningGateway] = useState(false);
  const [isProvisioningDevice, setIsProvisioningDevice] = useState(false);
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const drawerAnim = React.useRef(new Animated.Value(-width)).current;

  const isDeep = isInvitingHospAdmin || selectedUserId || isProvisioningWard || selectedWardForBed || isProvisioningGateway || isProvisioningDevice || isRegisteringPatient || selectedPatientId || isCreatingDoctor || selectedDoctorId || isCreatingNurse || isCreatingShift || !!assignmentData || !!selectedWardForEdit || !!selectedPatientForEdit || !!selectedDoctorForEdit || selectedNurseId || !!selectedNurseForEdit || selectedShiftId || !!selectedShiftForEdit;

  useEffect(() => {
    const backAction = () => {
      if (drawerOpen) { toggleDrawer(); return true; }
      if (isInvitingHospAdmin) { setIsInvitingHospAdmin(false); return true; }
      if (isProvisioningWard) { setIsProvisioningWard(false); return true; }
      if (selectedWardForBed) { setSelectedWardForBed(null); return true; }
      if (isProvisioningGateway) { setIsProvisioningGateway(false); return true; }
      if (isProvisioningDevice) { setIsProvisioningDevice(false); return true; }
      if (isRegisteringPatient) { setIsRegisteringPatient(false); return true; }
      if (isCreatingDoctor) { setIsCreatingDoctor(false); return true; }
      if (isCreatingNurse) { setIsCreatingNurse(false); return true; }
      if (isCreatingShift) { setIsCreatingShift(false); return true; }
      if (assignmentData) { setAssignmentData(null); return true; }
      if (selectedWardForEdit) { setSelectedWardForEdit(null); return true; }
      if (selectedPatientForEdit) { setSelectedPatientForEdit(null); return true; }
      if (selectedDoctorForEdit) { setSelectedDoctorForEdit(null); return true; }
      if (selectedNurseForEdit) { setSelectedNurseForEdit(null); return true; }
      if (selectedNurseId) { setSelectedNurseId(null); return true; }
      if (selectedShiftForEdit) { setSelectedShiftForEdit(null); return true; }
      if (selectedShiftId) { setSelectedShiftId(null); return true; }
      if (selectedUserId) { setSelectedUserId(null); return true; }
      if (selectedPatientId) { setSelectedPatientId(null); return true; }
      if (selectedDoctorId) { setSelectedDoctorId(null); return true; }
      if (activeTab !== 'home') { handleTabChange('home'); return true; }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [drawerOpen, activeTab, isInvitingHospAdmin, selectedUserId, isProvisioningWard, selectedWardForBed, isProvisioningGateway, isProvisioningDevice, isRegisteringPatient, selectedPatientId, isCreatingDoctor, selectedDoctorId, isCreatingNurse, isCreatingShift, assignmentData, selectedWardForEdit, selectedPatientForEdit, selectedDoctorForEdit, selectedNurseId, selectedNurseForEdit, selectedShiftId, selectedShiftForEdit]);

  const toggleDrawer = React.useCallback(() => {
    const toValue = drawerOpen ? -width : 0;
    Animated.timing(drawerAnim, { toValue, duration: 250, useNativeDriver: true }).start();
    setDrawerOpen(!drawerOpen);
  }, [drawerOpen, drawerAnim]);

  const handleTabChange = (tabId) => {
    setIsInvitingHospAdmin(false);
    setSelectedUserId(null);
    setSelectedPatientId(null);
    setSelectedDoctorId(null);
    setIsProvisioningWard(false);
    setSelectedWardForBed(null);
    setIsProvisioningGateway(false);
    setIsProvisioningDevice(false);
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
    setActiveTab(tabId);
  };

  const footerItems = [
    { id: 'home', label: 'Home', icon: <IconDashboard /> },
    ...(isOwner ? [{ id: 'admins', label: 'Admins', icon: <IconUsers /> }] : []),
    { id: 'wards', label: 'Wards', icon: <IconDoor /> },
    { id: 'devices', label: 'Devices', icon: <IconPulse /> },
    { id: 'patients', label: 'Patients', icon: <IconPatient /> },
    { id: 'doctors', label: 'Doctors', icon: <IconStethoscope /> },
    { id: 'shifts', label: 'Shifts', icon: <IconClock /> },
  ];

  const renderContent = () => {
    if (isInvitingHospAdmin) {
      return <CreateHospAdminScreen onCancel={() => setIsInvitingHospAdmin(false)} />;
    }
    if (isProvisioningWard) {
      return <CreateWardScreen onCancel={() => setIsProvisioningWard(false)} />;
    }
    if (selectedWardForBed) {
      return <CreateBedScreen onCancel={() => setSelectedWardForBed(null)} wardCode={selectedWardForBed} />;
    }
    if (isProvisioningGateway) {
      return <CreateGatewayScreen onCancel={() => setIsProvisioningGateway(false)} />;
    }
    if (isProvisioningDevice) {
      return <CreateDeviceScreen onCancel={() => setIsProvisioningDevice(false)} />;
    }
    if (isRegisteringPatient) {
      return <CreatePatientScreen onCancel={() => setIsRegisteringPatient(false)} />;
    }
    if (isCreatingDoctor) {
      return <CreateDoctorScreen onCancel={() => setIsCreatingDoctor(false)} hospCode="CLV-MAIN" />;
    }
    if (isCreatingNurse) {
      return <CreateNurseScreen onCancel={() => setIsCreatingNurse(false)} hospCode="CLV-MAIN" />;
    }
    if (isCreatingShift) {
      return <CreateShiftScreen onCancel={() => setIsCreatingShift(false)} />;
    }
    if (assignmentData) {
      return <AssignmentScreen
        initialPatientId={assignmentData.patientId}
        initialDoctorId={assignmentData.doctorId}
        onCancel={() => setAssignmentData(null)}
      />;
    }
    if (selectedWardForEdit) {
      return <EditWardScreen
        ward={selectedWardForEdit}
        onCancel={() => setSelectedWardForEdit(null)}
        onSave={() => setSelectedWardForEdit(null)}
        onDelete={() => setSelectedWardForEdit(null)}
      />;
    }
    if (selectedPatientForEdit) {
      return <EditPatientScreen
        patientDetail={selectedPatientForEdit}
        onCancel={() => setSelectedPatientForEdit(null)}
        onSave={() => setSelectedPatientForEdit(null)}
      />;
    }
    if (selectedDoctorForEdit) {
      return <EditDoctorScreen
        doctor={selectedDoctorForEdit}
        onCancel={() => setSelectedDoctorForEdit(null)}
        onSave={() => setSelectedDoctorForEdit(null)}
      />;
    }
    if (selectedNurseForEdit) {
      return <EditNurseScreen
        nurse={selectedNurseForEdit}
        onCancel={() => setSelectedNurseForEdit(null)}
        onSave={() => setSelectedNurseForEdit(null)}
      />;
    }
    if (selectedNurseId) {
      return <NurseDetailScreen
        nurseId={selectedNurseId}
        onBack={() => setSelectedNurseId(null)}
        onEdit={(n) => setSelectedNurseForEdit(n)}
      />;
    }
    if (selectedShiftForEdit) {
      return <EditShiftScreen
        shift={selectedShiftForEdit}
        onCancel={() => setSelectedShiftForEdit(null)}
        onSave={() => setSelectedShiftForEdit(null)}
        onDelete={() => { setSelectedShiftForEdit(null); setSelectedShiftId(null); }}
      />;
    }
    if (selectedShiftId) {
      return <ShiftDetailScreen
        shiftId={selectedShiftId}
        onBack={() => setSelectedShiftId(null)}
        onEdit={(s) => setSelectedShiftForEdit(s)}
      />;
    }
    if (selectedUserId) {
      return <UserDetailScreen userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
    }
    if (selectedPatientId) {
      return <PatientDetailScreen
        patientId={selectedPatientId}
        onBack={() => setSelectedPatientId(null)}
        onAssign={() => setAssignmentData({ patientId: selectedPatientId })}
        onEdit={(detail) => setSelectedPatientForEdit(detail)}
      />;
    }
    if (selectedDoctorId) {
      return <DoctorDetailScreen
        doctorId={selectedDoctorId}
        onBack={() => setSelectedDoctorId(null)}
        onAssign={() => setAssignmentData({ doctorId: selectedDoctorId })}
        onEdit={(d) => setSelectedDoctorForEdit(d)}
      />;
    }

    switch (activeTab) {
      case 'home': return <HospHomeContent role={role} onNavigate={handleTabChange} />;
      case 'admins': return <HospAdminsScreen onInvite={() => setIsInvitingHospAdmin(true)} onSelectUser={setSelectedUserId} />;
      case 'wards': return <WardsScreen
        onNewWard={() => setIsProvisioningWard(true)}
        onNewBed={setSelectedWardForBed}
        onEditWard={setSelectedWardForEdit}
      />;
      case 'devices': return <DevicesScreen 
        onNewGateway={() => setIsProvisioningGateway(true)}
        onNewDevice={() => setIsProvisioningDevice(true)}
      />;
      case 'patients': return <PatientsScreen 
        onNewPatient={() => setIsRegisteringPatient(true)}
        onSelectPatient={setSelectedPatientId}
      />;
      case 'doctors': return <DoctorsScreen 
        onNewDoctor={() => setIsCreatingDoctor(true)}
        onSelectDoctor={setSelectedDoctorId}
      />;
      case 'shifts': return <ShiftsScreen
        onNewNurse={() => setIsCreatingNurse(true)}
        onNewShift={() => setIsCreatingShift(true)}
        onSelectNurse={setSelectedNurseId}
        onSelectShift={setSelectedShiftId}
      />;
      default: return <HospHomeContent role={role} onNavigate={handleTabChange} />;
    }
  };

  const getTitle = () => {
    if (isInvitingHospAdmin) return "Invite Hosp Admin";
    if (isProvisioningWard) return "Create Ward";
    if (selectedWardForBed) return "Provision Bed";
    if (isProvisioningGateway) return "Create Gateway";
    if (isProvisioningDevice) return "Create Device";
    if (isRegisteringPatient) return "Register Patient";
    if (isCreatingDoctor) return "Onboard Doctor";
    if (isCreatingNurse) return "Onboard Nurse";
    if (isCreatingShift) return "Assign Shift";
    if (assignmentData) return "Clinical Assignment";
    if (selectedWardForEdit) return "Edit Ward";
    if (selectedPatientForEdit) return "Edit Patient";
    if (selectedDoctorForEdit) return "Edit Doctor";
    if (selectedNurseForEdit) return "Edit Nurse";
    if (selectedNurseId) return "Nurse Details";
    if (selectedShiftForEdit) return "Edit Shift";
    if (selectedShiftId) return "Shift Details";
    if (selectedUserId) return "User Details";
    if (selectedPatientId) return "Patient Details";
    if (selectedDoctorId) return "Doctor Details";

    switch (activeTab) {
      case 'home': return "Hosp Console";
      case 'admins': return "Hospital Admins";
      case 'wards': return "Wards & Beds";
      case 'devices': return "Gateways & Devices";
      case 'patients': return "Patient Registry";
      case 'doctors': return "Medical Staff";
      case 'shifts': return "Nurses & Shifts";
      default: return "Hosp Console";
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
            <Text style={styles.drawerRole}>{isOwner ? 'Hospital Owner' : 'Hospital Administrator'}</Text>
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
        leading={ isDeep ? <IconBack /> : <IconMenu /> }
        onLeadingPress={isDeep ? () => {
          setIsInvitingHospAdmin(false);
          setSelectedUserId(null);
          setSelectedPatientId(null);
          setSelectedDoctorId(null);
          setIsProvisioningWard(false);
          setSelectedWardForBed(null);
          setIsProvisioningGateway(false);
          setIsProvisioningDevice(false);
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
        } : toggleDrawer}
        onNotificationPress={() => setShowNotifications(true)}
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

      <NotificationSheet
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
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
