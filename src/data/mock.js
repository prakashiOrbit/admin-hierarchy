export const ROLES = {
  PLATFORM_ADMIN: { label: 'Platform Admin', short: 'PLATFORM',  color: '#A78BFA', bg: 'rgba(167,139,250,.14)' },
  ORG_OWNER:      { label: 'Org Owner',      short: 'ORG OWNER', color: '#818CF8', bg: 'rgba(129,140,248,.14)' },
  ORG_ADMIN:      { label: 'Org Admin',      short: 'ORG ADMIN', color: '#60A5FA', bg: 'rgba(96,165,250,.14)'  },
  HOSP_OWNER:     { label: 'Hosp Owner',     short: 'HOSP OWNER',color: '#2DD4BF', bg: 'rgba(45,212,191,.14)' },
  HOSP_ADMIN:     { label: 'Hosp Admin',     short: 'HOSP ADMIN',color: '#22D3EE', bg: 'rgba(34,211,238,.14)' },
  DOCTOR:         { label: 'Doctor',         short: 'DOCTOR',    color: '#34D399', bg: 'rgba(52,211,153,.14)' },
  NURSE:          { label: 'Nurse',          short: 'NURSE',     color: '#34D399', bg: 'rgba(52,211,153,.14)' },
};

export const ORGS = [
  { id: 'cleveland', name: 'cleveland-clinic', display: 'Cleveland Clinic',  type: 'Health System', hospitals: 14, users: 1284, devices: 4218, status: 'ACTIVE',  locale: 'en-US' },
  { id: 'stmarys',   name: 'st-marys-network', display: "St. Mary's Network", type: 'Hospital Group', hospitals: 6,  users: 612,  devices: 1903, status: 'ACTIVE',  locale: 'en-US' },
  { id: 'aurora',    name: 'aurora-health',    display: 'Aurora Health',     type: 'Health System', hospitals: 21, users: 2104, devices: 6772, status: 'ACTIVE',  locale: 'en-US' },
  { id: 'northstar', name: 'northstar-medical',display: 'Northstar Medical', type: 'Regional',      hospitals: 3,  users: 198,  devices: 542,  status: 'ACTIVE',  locale: 'en-CA' },
  { id: 'mercy',     name: 'mercy-care',       display: 'Mercy Care',        type: 'Faith-based',   hospitals: 9,  users: 802,  devices: 2415, status: 'PENDING', locale: 'en-US' },
  { id: 'kaiseki',   name: 'kaiseki-medical',  display: 'Kaiseki Medical',   type: 'Hospital Group',hospitals: 4,  users: 311,  devices: 880,  status: 'ACTIVE',  locale: 'ja-JP' },
];

export const HOSPITALS = [
  { id: 'CLV-MAIN', code: 'CLV-MAIN', name: 'Cleveland Main Campus',   city: 'Cleveland, OH',     status: 'ACTIVE',   beds: 1285, devices: 642, wards: 24 },
  { id: 'CLV-AKR',  code: 'CLV-AKR',  name: 'Akron General',            city: 'Akron, OH',         status: 'ACTIVE',   beds: 532,  devices: 318, wards: 12 },
  { id: 'CLV-FAI',  code: 'CLV-FAI',  name: 'Fairview Hospital',        city: 'Cleveland, OH',     status: 'ACTIVE',   beds: 488,  devices: 274, wards: 11 },
  { id: 'CLV-HIL',  code: 'CLV-HIL',  name: 'Hillcrest Hospital',       city: 'Mayfield Hts, OH',  status: 'ACTIVE',   beds: 496,  devices: 251, wards: 10 },
  { id: 'CLV-MAR',  code: 'CLV-MAR',  name: 'Marymount Hospital',       city: 'Garfield Hts, OH',  status: 'INACTIVE', beds: 308,  devices: 142, wards: 8  },
  { id: 'CLV-LUT',  code: 'CLV-LUT',  name: 'Lutheran Hospital',        city: 'Cleveland, OH',     status: 'ACTIVE',   beds: 222,  devices: 118, wards: 6  },
];

export const USERS = [
  { id: 'u01', name: 'Dr. Marcus Chen',     role: 'PLATFORM_ADMIN', hospital: '—',            status: 'ACTIVE',   email: 'm.chen@iorbit.health',  initials: 'MC' },
  { id: 'u02', name: 'Priya Raghunathan',   role: 'ORG_OWNER',      hospital: '—',            status: 'ACTIVE',   email: 'priya.r@clev.health',   initials: 'PR' },
  { id: 'u03', name: 'James O\u2019Sullivan', role: 'ORG_ADMIN',    hospital: '—',            status: 'ACTIVE',   email: 'j.osullivan@clev.health', initials: 'JO' },
  { id: 'u04', name: 'Dr. Anika Bhatt',     role: 'HOSP_OWNER',     hospital: 'Cleveland Main',status: 'ACTIVE',   email: 'a.bhatt@clev.health',   initials: 'AB' },
  { id: 'u05', name: 'Tomás Herrera',       role: 'HOSP_ADMIN',     hospital: 'Cleveland Main',status: 'ACTIVE',   email: 't.herrera@clev.health', initials: 'TH' },
  { id: 'u06', name: 'Dr. Naomi Park',      role: 'DOCTOR',         hospital: 'Cleveland Main',status: 'ACTIVE',   email: 'n.park@clev.health',    initials: 'NP' },
  { id: 'u07', name: 'Lena Kowalski, RN',   role: 'NURSE',          hospital: 'Cleveland Main',status: 'ACTIVE',   email: 'l.kowalski@clev.health',initials: 'LK' },
  { id: 'u08', name: 'Dr. Yusuf El-Amin',   role: 'DOCTOR',         hospital: 'Akron General', status: 'ACTIVE',   email: 'y.elamin@clev.health',  initials: 'YE' },
  { id: 'u09', name: 'Sarah Whitfield, RN', role: 'NURSE',          hospital: 'Cleveland Main',status: 'INACTIVE', email: 's.whitfield@clev.health',initials: 'SW' },
  { id: 'u10', name: 'Devon Akpan',         role: 'HOSP_ADMIN',     hospital: 'Fairview',      status: 'ACTIVE',   email: 'd.akpan@clev.health',   initials: 'DA' },
];

export const ROLES_LIST = [
  { id: 'r-org-owner',  name: 'Org Owner',         system: true,  permissions: 24, members: 2,  color: '#818CF8' },
  { id: 'r-org-admin',  name: 'Org Admin',         system: true,  permissions: 19, members: 5,  color: '#60A5FA' },
  { id: 'r-hosp-owner', name: 'Hospital Owner',    system: true,  permissions: 18, members: 14, color: '#2DD4BF' },
  { id: 'r-hosp-admin', name: 'Hospital Admin',    system: true,  permissions: 13, members: 31, color: '#22D3EE' },
  { id: 'r-billing',    name: 'Billing Coordinator',system: false, permissions: 6,  members: 4,  color: '#FBBF24' },
  { id: 'r-readonly',   name: 'Read-only Auditor', system: false, permissions: 8,  members: 2,  color: '#94A3B8' },
];

export const PERMISSION_GROUPS = [
  { name: 'Users',         perms: ['create.user', 'admin.user', 'delete.user', 'view.user'] },
  { name: 'Roles',         perms: ['create.role', 'admin.roles', 'view.role'] },
  { name: 'Hospitals',     perms: ['create.hospital', 'update.hospital', 'view.hospital'] },
  { name: 'Devices',       perms: ['create.device', 'assign.device', 'view.device'] },
  { name: 'Gateways',      perms: ['create.gateway', 'assign.gateway'] },
  { name: 'Wards / Beds',  perms: ['create.ward', 'create.bed', 'view.ward'] },
  { name: 'Nurses / Shifts',perms: ['create.shift', 'admin.nurse'] },
  { name: 'Telemetry',     perms: ['view.telemetry', 'export.telemetry'] },
  { name: 'Images',        perms: ['view.images', 'upload.images'] },
  { name: 'Device Types',  perms: ['admin.device-types'] },
];

export const ROLE_DEFAULT_PERMS = {
  'r-org-owner':  ['create.user','admin.user','delete.user','view.user','create.role','admin.roles','view.role','create.hospital','update.hospital','view.hospital','create.device','assign.device','view.device','create.gateway','assign.gateway','create.ward','create.bed','view.ward','create.shift','admin.nurse','view.telemetry','export.telemetry','view.images','upload.images'],
  'r-org-admin':  ['create.user','admin.user','view.user','view.role','create.hospital','update.hospital','view.hospital','create.device','assign.device','view.device','create.gateway','assign.gateway','create.ward','create.bed','view.ward','create.shift','view.telemetry','view.images'],
  'r-hosp-owner': ['create.user','admin.user','delete.user','view.user','view.role','update.hospital','view.hospital','create.device','assign.device','view.device','assign.gateway','create.ward','create.bed','view.ward','create.shift','admin.nurse','view.telemetry'],
  'r-hosp-admin': ['create.user','view.user','view.role','view.hospital','assign.device','view.device','create.ward','create.bed','view.ward','create.shift','view.telemetry'],
  'r-billing':    ['view.user','view.hospital','view.device','view.telemetry','export.telemetry','view.images'],
  'r-readonly':   ['view.user','view.role','view.hospital','view.device','view.ward','view.telemetry','view.images'],
};

export const WARDS = [
  { id: 'w1', code: 'WARD998', name: 'Emergency Ward', type: 'ICU', beds: 15, active: 12 },
  { id: 'w2', code: 'ICU-3W',   name: 'Critical Care Unit', type: 'ICU', beds: 16, active: 16 },
  { id: 'w3', code: 'PED-5W',   name: 'Pediatrics North', type: 'GENERAL', beds: 24, active: 8 },
  { id: 'w4', code: 'GEN-2E',   name: 'General Ward East', type: 'GENERAL', beds: 32, active: 20 },
];

export const BEDS_IN_WARD = {
  'WARD998': [
    { id: 'b1', code: 'BED_B1', status: 'ACTIVE', gateway: 'GW_001' },
    { id: 'b2', code: 'BED_B2', status: 'ACTIVE', gateway: 'GW_002' },
    { id: 'b3', code: 'BED_B3', status: 'INACTIVE', gateway: '—' },
  ]
};

export const GATEWAYS = [
  { id: 'g1', code: 'GW_001', type: 'IOT_HUB', os: 'Linux', status: 'ONLINE', config: 'MQTT_ENABLED' },
  { id: 'g2', code: 'GW_002', type: 'IOT_HUB', os: 'Linux', status: 'ONLINE', config: 'MQTT_ENABLED' },
  { id: 'g3', code: 'GW-CLV-005', type: 'EDGE_HUB', os: 'RTOS', status: 'OFFLINE', config: 'MQTT_ENABLED' },
];

export const DEVICES = [
  { id: 'd1', code: 'OXY_100', type: 'Comen-V4', status: 'ACTIVE', protocol: 'BLE', verify: 'MACADDR', usage: 'Fixed', ward: 'ICU', bed: '3W', battery: 85 },
  { id: 'd2', code: 'iT-V4-082', type: 'iT-V4', status: 'WARN', protocol: 'WIFI', verify: 'SERIAL', usage: 'Mobile', ward: 'ICU', bed: '3W', battery: 12 },
  { id: 'd3', code: 'ECG-500', type: 'SmartECG-90', status: 'ACTIVE', protocol: 'BLE', verify: 'MACADDR', usage: 'Fixed', ward: 'PED', bed: '5W', battery: 92 },
];

export const PATIENTS = [
  { 
    id: 'p1', mrn: 'PAT-99', name: 'John Doe', status: 'ADMITTED', ward: 'ICU', bed: '3W', initials: 'JD',
    email: 'john.doe99@example.com', phone: '555-0101',
    address: '123 Medical Lane, Springfield, IL, USA, 62704',
    vitals: { bloodGroup: 'O+', weight: '75kg', height: '180cm' }
  },
  { 
    id: 'p2', mrn: 'PAT-102', name: 'Sarah Miller', status: 'ADMITTED', ward: 'PED', bed: '5W', initials: 'SM',
    email: 's.miller@webmail.com', phone: '555-0202',
    address: '45 Health St, Metropolis, NY, USA, 10001',
    vitals: { bloodGroup: 'A-', weight: '62kg', height: '165cm' }
  },
  { 
    id: 'p3', mrn: 'PAT-085', name: 'Robert Wilson', status: 'DISCHARGED', ward: '—', bed: '—', initials: 'RW',
    email: 'r.wilson@outlook.com', phone: '555-0303',
    address: '88 Oak Rd, Cleveland, OH, USA, 44101',
    vitals: { bloodGroup: 'B+', weight: '82kg', height: '178cm' }
  },
  { 
    id: 'p4', mrn: 'PAT-114', name: 'Elena Rodriguez', status: 'PENDING', ward: '—', bed: '—', initials: 'ER',
    email: 'elena.rod@gmail.com', phone: '555-0404',
    address: '12 Maple Ave, Bangalore, KA, India, 560001',
    vitals: { bloodGroup: 'AB+', weight: '58kg', height: '162cm' }
  },
];

export const DOCTORS = [
  { 
    id: 'd1', code: 'DOC997', firstName: 'Gregory', lastName: 'House', initials: 'GH',
    speciality: ['Diagnostics', 'Nephrology'], experience: 20, type: 'SPECIALIST',
    birthDate: '1959-05-15', gender: 'MALE', status: 'ACTIVE',
    email: 'princeton997@mailinator.com', phone: '+91 86252 73840',
    city: 'Princeton', state: 'NJ'
  },
  { 
    id: 'd2', code: 'DOC102', firstName: 'Allison', lastName: 'Cameron', initials: 'AC',
    speciality: ['Immunology'], experience: 8, type: 'RESIDENT',
    birthDate: '1979-08-22', gender: 'FEMALE', status: 'ACTIVE',
    email: 'cameron@princeton.org', phone: '+91 98000 11111',
    city: 'Princeton', state: 'NJ'
  },
  { 
    id: 'd3', code: 'DOC085', firstName: 'Robert', lastName: 'Chase', initials: 'RC',
    speciality: ['Intensive Care'], experience: 10, type: 'SPECIALIST',
    birthDate: '1979-02-12', gender: 'MALE', status: 'ACTIVE',
    email: 'chase@princeton.org', phone: '+91 98000 22222',
    city: 'Princeton', state: 'NJ'
  }
];

export const NURSES = [
  { id: 'n1', initials: 'LK', firstName: 'Lena', lastName: 'Kowalski', nurseCode: 'NR-101', speciality: 'ICU', experience: 12, status: 'ACTIVE', email: 'lena.k@hosp.org' },
  { id: 'n2', initials: 'SW', firstName: 'Sarah', lastName: 'Whitfield', nurseCode: 'NR-105', speciality: 'Emergency', experience: 5, status: 'ACTIVE', email: 's.whitfield@hosp.org' },
  { id: 'n3', initials: 'MJ', firstName: 'Marcus', lastName: 'Jordan', nurseCode: 'NR-202', speciality: 'General', experience: 8, status: 'ACTIVE', email: 'm.jordan@hosp.org' },
  { id: 'n4', initials: 'AP', firstName: 'Anita', lastName: 'Patel', nurseCode: 'NR-303', speciality: 'Pediatrics', experience: 15, status: 'ACTIVE', email: 'a.patel@hosp.org' },
];

export const SHIFTS = [
  { id: 's1', type: 'DAY', wardCode: 'ICU-3W', nurseId: 'n1', status: 'ON_GOING', time: '08:00 - 16:00' },
  { id: 's2', type: 'DAY', wardCode: 'WARD998', nurseId: 'n2', status: 'ON_GOING', time: '08:00 - 16:00' },
  { id: 's3', type: 'EVENING', wardCode: 'ICU-3W', nurseId: 'n3', status: 'UPCOMING', time: '16:00 - 00:00' },
  { id: 's4', type: 'NIGHT', wardCode: 'PED-5W', nurseId: 'n4', status: 'UPCOMING', time: '00:00 - 08:00' },
];
