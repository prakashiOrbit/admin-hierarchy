import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, Btn } from '../../components/Shared';
import { TopBar, BottomNav, NavItem } from '../../components/Navigation';
import { StatusPill } from '../../components/StatusPill';
import { 
  IconHospital, IconUsers, IconPulse, IconGateway, IconShield, IconChart,
  IconAlert, IconChevron, IconMenu, IconSettings, IconDashboard, IconBack, IconUser, IconMoon, IconLogout, IconBed, IconStethoscope, IconDoor, IconPatient, IconPlus, IconClock
} from '../../icons';
import { HOSPITALS, NURSES, SHIFTS } from '../../data/mock';
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
import { CreateNurseScreen } from '../Users/CreateNurseScreen';
import { AssignmentScreen } from '../Common/AssignmentScreen';

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

const HospHomeContent = ({ role, onNavigate }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const isOwner = role === 'HOSP_OWNER';

  const alerts = [
    { id: 'iT-V4-082', type: 'iT-V4', ward: 'ICU', bed: '3W', battery: 12, status: 'WARN' },
    { id: 'GW-CLV-005', type: 'Gateway', ward: 'PED', bed: '5W', battery: 100, status: 'OFFLINE' },
  ];
  
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Greeting */}
      <View style={styles.greetingHeader}>
        <Text style={styles.date}>FRI, 16 MAY · CLEVELAND MAIN</Text>
        <Text style={styles.greeting}>{isOwner ? 'Good morning, Dr. Bhatt' : 'Good morning, Tomás'}</Text>
        <Text style={styles.status}>
          <Text style={{ color: T.good, fontWeight: '600' }}>4 wards</Text> at full staff · 1 device alert
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <StatCard 
          label="Admissions" 
          value="142" 
          delta={12} 
          icon={<IconPatient />} color="#2DD4BF" accent="rgba(45,212,191,.14)" 
        />
        <StatCard 
          label="Active Beds" 
          value="84" 
          delta={0} 
          icon={<IconBed />} color={T.accent} 
        />
        <StatCard 
          label="Devices" 
          value="612" 
          delta={8} 
          icon={<IconPulse />} color="#22D3EE" accent="rgba(34,211,238,.14)" 
        />
        <StatCard 
          label="Staffing" 
          value="24" 
          delta={-2} 
          icon={<IconUsers />} color="#A78BFA" accent="rgba(167,139,250,.14)" 
        />
      </View>

      {/* Live Vitals Card */}
      <Card style={{ marginBottom: 24 }}>
        <View style={styles.sectionHeaderRow}>
          <SectionHeader title="LIVE VITALS" />
          <Text style={styles.bedsLabel}>● 16 BEDS</Text>
        </View>
        <View style={styles.vitalsGrid}>
          {[
            { l: 'AVG HR',  v: 78,  u: 'bpm',  c: '#F472B6', ok: true },
            { l: 'AVG SpO₂', v: 97, u: '%',    c: '#22D3EE', ok: true },
            { l: 'ALERTS',  v: 1,   u: 'act.', c: T.warn,    ok: false },
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
              { l: 'Day',     n: 6, c: '#22D3EE' },
              { l: 'Evening', n: 5, c: '#A78BFA' },
              { l: 'Night',   n: 4, c: '#60A5FA' },
            ].map((s, i) => (
              <View key={i} style={[styles.shiftBox, { borderColor: T.borderSoft }]}>
                <View style={styles.shiftHeader}>
                  <View style={[styles.shiftDot, { backgroundColor: s.c }]} />
                  <Text style={[styles.shiftTitle, { color: T.textDim }]}>{s.l.toUpperCase()}</Text>
                </View>
                <Text style={styles.shiftCount}>{s.n}</Text>
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
          {alerts.map((d, i) => (
            <View key={d.id} style={[styles.alertItem, i > 0 && styles.listBorder]}>
              <View style={[styles.alertIconBox, { backgroundColor: d.status === 'OFFLINE' ? T.badSoft : T.warnSoft }]}>
                <IconAlert size={16} color={d.status === 'OFFLINE' ? T.bad : T.warn} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertId}>{d.id}</Text>
                <Text style={styles.alertMeta}>{d.type} · {d.ward}-{d.bed} {d.battery < 30 ? `· battery ${d.battery}%` : ''}</Text>
              </View>
              <IconChevron size={16} color={T.textFaint} />
            </View>
          ))}
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = React.useRef(new Animated.Value(-width)).current;

  const isDeep = isInvitingHospAdmin || selectedUserId || isProvisioningWard || selectedWardForBed || isProvisioningGateway || isProvisioningDevice || isRegisteringPatient || selectedPatientId || isCreatingDoctor || selectedDoctorId || isCreatingNurse || isCreatingShift || !!assignmentData;

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
      if (selectedUserId) { setSelectedUserId(null); return true; }
      if (selectedPatientId) { setSelectedPatientId(null); return true; }
      if (selectedDoctorId) { setSelectedDoctorId(null); return true; }
      if (activeTab !== 'home') { handleTabChange('home'); return true; }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [drawerOpen, activeTab, isInvitingHospAdmin, selectedUserId, isProvisioningWard, selectedWardForBed, isProvisioningGateway, isProvisioningDevice, isRegisteringPatient, selectedPatientId, isCreatingDoctor, selectedDoctorId, isCreatingNurse, isCreatingShift, assignmentData]);

  const toggleDrawer = () => {
    const toValue = drawerOpen ? -width : 0;
    Animated.timing(drawerAnim, { toValue, duration: 250, useNativeDriver: true }).start();
    setDrawerOpen(!drawerOpen);
  };

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
      return <CreateHospAdminScreen onBack={() => setIsInvitingHospAdmin(false)} hospCode="CLV-MAIN" />;
    }
    if (isProvisioningWard) {
      return <CreateWardScreen onBack={() => setIsProvisioningWard(false)} hospCode="CLV-MAIN" />;
    }
    if (selectedWardForBed) {
      return <CreateBedScreen onBack={() => setSelectedWardForBed(null)} wardCode={selectedWardForBed} hospCode="CLV-MAIN" />;
    }
    if (isProvisioningGateway) {
      return <CreateGatewayScreen onBack={() => setIsProvisioningGateway(false)} hospCode="CLV-MAIN" />;
    }
    if (isProvisioningDevice) {
      return <CreateDeviceScreen onBack={() => setIsProvisioningDevice(false)} hospCode="CLV-MAIN" />;
    }
    if (isRegisteringPatient) {
      return <CreatePatientScreen onBack={() => setIsRegisteringPatient(false)} hospCode="CLV-MAIN" />;
    }
    if (isCreatingDoctor) {
      return <CreateDoctorScreen onBack={() => setIsCreatingDoctor(false)} hospCode="CLV-MAIN" />;
    }
    if (isCreatingNurse) {
      return <CreateNurseScreen onBack={() => setIsCreatingNurse(false)} hospCode="CLV-MAIN" />;
    }
    if (isCreatingShift) {
      return <CreateShiftScreen onBack={() => setIsCreatingShift(false)} />;
    }
    if (assignmentData) {
      return <AssignmentScreen 
        initialPatientId={assignmentData.patientId} 
        initialDoctorId={assignmentData.doctorId}
        onBack={() => setAssignmentData(null)} 
      />;
    }
    if (selectedUserId) {
      return <UserDetailScreen userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
    }
    if (selectedPatientId) {
      return <PatientDetailScreen patientId={selectedPatientId} onBack={() => setSelectedPatientId(null)} 
        onAssign={() => setAssignmentData({ patientId: selectedPatientId })}
      />;
    }
    if (selectedDoctorId) {
      return <DoctorDetailScreen doctorId={selectedDoctorId} onBack={() => setSelectedDoctorId(null)} 
        onAssign={() => setAssignmentData({ doctorId: selectedDoctorId })}
      />;
    }

    switch (activeTab) {
      case 'home': return <HospHomeContent role={role} onNavigate={handleTabChange} />;
      case 'admins': return <HospAdminsScreen onInvite={() => setIsInvitingHospAdmin(true)} onSelectUser={setSelectedUserId} />;
      case 'wards': return <WardsScreen 
        onNewWard={() => setIsProvisioningWard(true)} 
        onNewBed={setSelectedWardForBed} 
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
            <Text style={styles.drawerName}>{isOwner ? 'Dr. Anika Bhatt' : 'Tomás Herrera'}</Text>
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
              onPress={() => navigation.replace('Login')}
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
        } : toggleDrawer}
        onNotificationPress={() => console.log('Notifications')}
        onProfilePress={() => { handleTabChange('home'); setActiveTab('home'); }}
      />

      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      <BottomNav 
        items={footerItems} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
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
