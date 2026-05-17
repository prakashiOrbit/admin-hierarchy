// Mock data + role config for iTouch Admin prototype.

const ROLES = {
  PLATFORM_ADMIN: { label: 'Platform Admin', short: 'PLATFORM',  color: '#A78BFA', bg: 'rgba(167,139,250,.14)' },
  ORG_OWNER:      { label: 'Org Owner',      short: 'ORG OWNER', color: '#818CF8', bg: 'rgba(129,140,248,.14)' },
  ORG_ADMIN:      { label: 'Org Admin',      short: 'ORG ADMIN', color: '#60A5FA', bg: 'rgba(96,165,250,.14)'  },
  HOSP_OWNER:     { label: 'Hosp Owner',     short: 'HOSP OWNER',color: '#2DD4BF', bg: 'rgba(45,212,191,.14)' },
  HOSP_ADMIN:     { label: 'Hosp Admin',     short: 'HOSP ADMIN',color: '#22D3EE', bg: 'rgba(34,211,238,.14)' },
  DOCTOR:         { label: 'Doctor',         short: 'DOCTOR',    color: '#34D399', bg: 'rgba(52,211,153,.14)' },
  NURSE:          { label: 'Nurse',          short: 'NURSE',     color: '#34D399', bg: 'rgba(52,211,153,.14)' },
};

const ORGS = [
  { id: 'cleveland', name: 'cleveland-clinic', display: 'Cleveland Clinic',  type: 'Health System', hospitals: 14, users: 1284, devices: 4218, status: 'ACTIVE',  locale: 'en-US' },
  { id: 'stmarys',   name: 'st-marys-network', display: "St. Mary's Network", type: 'Hospital Group', hospitals: 6,  users: 612,  devices: 1903, status: 'ACTIVE',  locale: 'en-US' },
  { id: 'aurora',    name: 'aurora-health',    display: 'Aurora Health',     type: 'Health System', hospitals: 21, users: 2104, devices: 6772, status: 'ACTIVE',  locale: 'en-US' },
  { id: 'northstar', name: 'northstar-medical',display: 'Northstar Medical', type: 'Regional',      hospitals: 3,  users: 198,  devices: 542,  status: 'ACTIVE',  locale: 'en-CA' },
  { id: 'mercy',     name: 'mercy-care',       display: 'Mercy Care',        type: 'Faith-based',   hospitals: 9,  users: 802,  devices: 2415, status: 'PENDING', locale: 'en-US' },
  { id: 'kaiseki',   name: 'kaiseki-medical',  display: 'Kaiseki Medical',   type: 'Hospital Group',hospitals: 4,  users: 311,  devices: 880,  status: 'ACTIVE',  locale: 'ja-JP' },
];

const HOSPITALS = [
  { id: 'CLV-MAIN', code: 'CLV-MAIN', name: 'Cleveland Main Campus',   city: 'Cleveland, OH',     status: 'ACTIVE',   beds: 1285, devices: 642, wards: 24 },
  { id: 'CLV-AKR',  code: 'CLV-AKR',  name: 'Akron General',            city: 'Akron, OH',         status: 'ACTIVE',   beds: 532,  devices: 318, wards: 12 },
  { id: 'CLV-FAI',  code: 'CLV-FAI',  name: 'Fairview Hospital',        city: 'Cleveland, OH',     status: 'ACTIVE',   beds: 488,  devices: 274, wards: 11 },
  { id: 'CLV-HIL',  code: 'CLV-HIL',  name: 'Hillcrest Hospital',       city: 'Mayfield Hts, OH',  status: 'ACTIVE',   beds: 496,  devices: 251, wards: 10 },
  { id: 'CLV-MAR',  code: 'CLV-MAR',  name: 'Marymount Hospital',       city: 'Garfield Hts, OH',  status: 'INACTIVE', beds: 308,  devices: 142, wards: 8  },
  { id: 'CLV-LUT',  code: 'CLV-LUT',  name: 'Lutheran Hospital',        city: 'Cleveland, OH',     status: 'ACTIVE',   beds: 222,  devices: 118, wards: 6  },
];

const USERS = [
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

const WARDS = [
  { id: 'W-ICU',  code: 'ICU-3W', name: 'ICU \u2014 3 West',         beds: 18, occupied: 16, devices: 42 },
  { id: 'W-CCU',  code: 'CCU-2E', name: 'Cardiac CCU \u2014 2 East', beds: 14, occupied: 11, devices: 31 },
  { id: 'W-MED1', code: 'MED-4N', name: 'Medical \u2014 4 North',    beds: 28, occupied: 24, devices: 24 },
  { id: 'W-PED',  code: 'PED-5W', name: 'Pediatrics \u2014 5 West',  beds: 22, occupied: 14, devices: 18 },
  { id: 'W-ER',   code: 'ER-G',   name: 'Emergency \u2014 Ground',   beds: 32, occupied: 27, devices: 58 },
  { id: 'W-ONC',  code: 'ONC-6N', name: 'Oncology \u2014 6 North',   beds: 24, occupied: 19, devices: 22 },
];

const BEDS_IN_WARD = [
  { id: 'B-ICU-01', label: 'ICU-3W-01', patient: 'Anonymized #4821', device: 'iT-V4-00128', vitals: { hr: 72, spo2: 98 }, status: 'OCCUPIED' },
  { id: 'B-ICU-02', label: 'ICU-3W-02', patient: 'Anonymized #4822', device: 'iT-V4-00129', vitals: { hr: 88, spo2: 96 }, status: 'OCCUPIED' },
  { id: 'B-ICU-03', label: 'ICU-3W-03', patient: 'Anonymized #4830', device: 'iT-V4-00133', vitals: { hr: 65, spo2: 99 }, status: 'OCCUPIED' },
  { id: 'B-ICU-04', label: 'ICU-3W-04', patient: null,               device: null,           vitals: null,                status: 'AVAILABLE' },
  { id: 'B-ICU-05', label: 'ICU-3W-05', patient: 'Anonymized #4801', device: 'iT-V4-00140', vitals: { hr: 102, spo2: 93 }, status: 'OCCUPIED' },
  { id: 'B-ICU-06', label: 'ICU-3W-06', patient: null,               device: 'iT-V4-00142', vitals: null,                status: 'CLEANING' },
];

const DEVICES = [
  { id: 'iT-V4-00128', type: 'Vitals Monitor v4',    ward: 'ICU-3W', bed: '01', patient: '#4821', status: 'ONLINE',   battery: 84, signal: 4, firmware: '4.2.1' },
  { id: 'iT-V4-00129', type: 'Vitals Monitor v4',    ward: 'ICU-3W', bed: '02', patient: '#4822', status: 'ONLINE',   battery: 67, signal: 4, firmware: '4.2.1' },
  { id: 'iT-V4-00133', type: 'Vitals Monitor v4',    ward: 'ICU-3W', bed: '03', patient: '#4830', status: 'ONLINE',   battery: 91, signal: 3, firmware: '4.2.1' },
  { id: 'iT-V4-00140', type: 'Vitals Monitor v4',    ward: 'ICU-3W', bed: '05', patient: '#4801', status: 'WARN',     battery: 22, signal: 2, firmware: '4.2.0' },
  { id: 'iT-V4-00142', type: 'Vitals Monitor v4',    ward: 'ICU-3W', bed: '06', patient: null,    status: 'IDLE',     battery: 96, signal: 4, firmware: '4.2.1' },
  { id: 'iT-IP-00203', type: 'Infusion Pump v2',     ward: 'CCU-2E', bed: '04', patient: '#5102', status: 'ONLINE',   battery: 78, signal: 4, firmware: '2.1.5' },
  { id: 'iT-SP-00088', type: 'SpO\u2082 Sensor',     ward: 'MED-4N', bed: '12', patient: '#3304', status: 'ONLINE',   battery: 41, signal: 3, firmware: '1.4.0' },
  { id: 'iT-VT-00301', type: 'Ventilator Link',      ward: 'ICU-3W', bed: '01', patient: '#4821', status: 'OFFLINE',  battery: 0,  signal: 0, firmware: '3.0.2' },
];

const GATEWAYS = [
  { id: 'GW-CLV-001', location: 'ICU 3W \u2014 Nurse Station', devices: 12, status: 'ONLINE',  signal: 5, uptime: '42d 6h'  },
  { id: 'GW-CLV-002', location: 'CCU 2E \u2014 Nurse Station', devices: 9,  status: 'ONLINE',  signal: 5, uptime: '42d 6h'  },
  { id: 'GW-CLV-003', location: 'MED 4N \u2014 Hall',          devices: 14, status: 'WARN',    signal: 3, uptime: '12d 2h'  },
  { id: 'GW-CLV-004', location: 'ER \u2014 Triage',            devices: 18, status: 'ONLINE',  signal: 4, uptime: '6d 18h'  },
  { id: 'GW-CLV-005', location: 'PED 5W \u2014 Hall',          devices: 8,  status: 'OFFLINE', signal: 0, uptime: '\u2014' },
];

const SHIFTS = [
  { day: 'Mon', date: '14', shifts: [{ band: 'Day',   nurses: 6, color: '#22D3EE' }, { band: 'Eve', nurses: 5, color: '#A78BFA' }, { band: 'Nig', nurses: 4, color: '#60A5FA' }] },
  { day: 'Tue', date: '15', shifts: [{ band: 'Day',   nurses: 7, color: '#22D3EE' }, { band: 'Eve', nurses: 5, color: '#A78BFA' }, { band: 'Nig', nurses: 4, color: '#60A5FA' }] },
  { day: 'Wed', date: '16', shifts: [{ band: 'Day',   nurses: 6, color: '#22D3EE' }, { band: 'Eve', nurses: 6, color: '#A78BFA' }, { band: 'Nig', nurses: 4, color: '#60A5FA' }] },
  { day: 'Thu', date: '17', shifts: [{ band: 'Day',   nurses: 5, color: '#22D3EE' }, { band: 'Eve', nurses: 5, color: '#A78BFA' }, { band: 'Nig', nurses: 3, color: '#60A5FA' }] },
  { day: 'Fri', date: '18', shifts: [{ band: 'Day',   nurses: 7, color: '#22D3EE' }, { band: 'Eve', nurses: 6, color: '#A78BFA' }, { band: 'Nig', nurses: 4, color: '#60A5FA' }] },
  { day: 'Sat', date: '19', shifts: [{ band: 'Day',   nurses: 4, color: '#22D3EE' }, { band: 'Eve', nurses: 4, color: '#A78BFA' }, { band: 'Nig', nurses: 3, color: '#60A5FA' }] },
  { day: 'Sun', date: '20', shifts: [{ band: 'Day',   nurses: 4, color: '#22D3EE' }, { band: 'Eve', nurses: 4, color: '#A78BFA' }, { band: 'Nig', nurses: 3, color: '#60A5FA' }] },
];

const ROLES_LIST = [
  { id: 'r-org-owner',  name: 'Org Owner',         system: true,  permissions: 24, members: 2,  color: '#818CF8' },
  { id: 'r-org-admin',  name: 'Org Admin',         system: true,  permissions: 19, members: 5,  color: '#60A5FA' },
  { id: 'r-hosp-owner', name: 'Hospital Owner',    system: true,  permissions: 18, members: 14, color: '#2DD4BF' },
  { id: 'r-hosp-admin', name: 'Hospital Admin',    system: true,  permissions: 13, members: 31, color: '#22D3EE' },
  { id: 'r-billing',    name: 'Billing Coordinator',system: false, permissions: 6,  members: 4,  color: '#FBBF24' },
  { id: 'r-readonly',   name: 'Read-only Auditor', system: false, permissions: 8,  members: 2,  color: '#94A3B8' },
];

const PERMISSION_GROUPS = [
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

// Permissions auto-granted for each role (used in role detail view).
const ROLE_DEFAULT_PERMS = {
  'r-org-owner':  ['create.user','admin.user','delete.user','view.user','create.role','admin.roles','view.role','create.hospital','update.hospital','view.hospital','create.device','assign.device','view.device','create.gateway','assign.gateway','create.ward','create.bed','view.ward','create.shift','admin.nurse','view.telemetry','export.telemetry','view.images','upload.images'],
  'r-org-admin':  ['create.user','admin.user','view.user','view.role','create.hospital','update.hospital','view.hospital','create.device','assign.device','view.device','create.gateway','assign.gateway','create.ward','create.bed','view.ward','create.shift','view.telemetry','view.images'],
  'r-hosp-owner': ['create.user','admin.user','delete.user','view.user','view.role','update.hospital','view.hospital','create.device','assign.device','view.device','assign.gateway','create.ward','create.bed','view.ward','create.shift','admin.nurse','view.telemetry'],
  'r-hosp-admin': ['create.user','view.user','view.role','view.hospital','assign.device','view.device','create.ward','create.bed','view.ward','create.shift','view.telemetry'],
  'r-billing':    ['view.user','view.hospital','view.device','view.telemetry','export.telemetry','view.images'],
  'r-readonly':   ['view.user','view.role','view.hospital','view.device','view.ward','view.telemetry','view.images'],
};

// Sparkline values 0-100, rough recent trend
const SPARKS = {
  orgs:      [22, 28, 28, 31, 33, 35, 38, 40, 41, 43, 46, 51, 53, 57, 57],
  hospitals: [180,182,184,184,186,190,193,196,201,209,213,218,220,224,231],
  users:     [3100,3120,3180,3240,3290,3380,3420,3520,3600,3680,3760,3870,3940,4020,4118],
  active:    [4400,4480,4520,4580,4612,4660,4700,4740,4780,4810,4860,4900,4940,4980,5031],
};

Object.assign(window, {
  ROLES, ORGS, HOSPITALS, USERS, WARDS, BEDS_IN_WARD, DEVICES, GATEWAYS,
  SHIFTS, ROLES_LIST, PERMISSION_GROUPS, ROLE_DEFAULT_PERMS, SPARKS,
});
