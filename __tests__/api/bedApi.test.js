/**
 * Tests for bedApi — focuses on the correctness of request shapes that
 * were sources of bugs:
 *
 *  - assignPatient  → bedCode is SPREAD into the body alongside the payload
 *  - updateAlarmConfig → uses POST to .../alarmconfig/save (not PUT to .../alarmconfig)
 *  - unassignPatient   → body contains only { bedCode }
 *  - listAll           → GET to correct URL
 */

import { bedApi } from '../../src/services/api';

jest.mock('../../src/i18n', () => ({
  __esModule: true,
  default: { language: 'en' },
  LOCALE_STORAGE_KEY: 'preferred_locale',
}));

const BASE = 'http://139.59.46.163/api';
const ORG = 'APOAP1';
const CARESITE = 'CLV';
const RAW_TOKEN = 'test-token';       // raw JWT — bedApi adds "Bearer " prefix internally
const TOKEN = `Bearer ${RAW_TOKEN}`; // what actually appears in the Authorization header

function ok(body = {}) {
  return Promise.resolve({
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => body,
    text: async () => '',
  });
}

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => jest.restoreAllMocks());

beforeEach(() => { global.fetch = jest.fn(); });
afterEach(() => jest.clearAllMocks());

// ─── bedApi.assignPatient ─────────────────────────────────────────────────────

describe('bedApi.assignPatient', () => {
  const PAYLOAD = {
    patientCode: 'PAT001',
    wardCode: 'WARD-A',
    gatewayCode: 'GW-01',
    devices: [{ deviceCode: 'DEV001' }],
  };

  it('sends POST to /{orgName}/bed/{careSiteCode}/assign/patient', async () => {
    global.fetch.mockReturnValueOnce(ok({ message: 'Patient assigned' }));
    await bedApi.assignPatient(ORG, CARESITE, 'B-01', PAYLOAD, RAW_TOKEN);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${BASE}/${ORG}/bed/${CARESITE}/assign/patient`);
    expect(opts.method).toBe('POST');
  });

  it('spreads bedCode into the body alongside the payload', async () => {
    global.fetch.mockReturnValueOnce(ok({ message: 'Patient assigned' }));
    await bedApi.assignPatient(ORG, CARESITE, 'B-01', PAYLOAD, RAW_TOKEN);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    // bedCode must be present in the body
    expect(body.bedCode).toBe('B-01');
    // all payload fields must also be present
    expect(body.patientCode).toBe('PAT001');
    expect(body.wardCode).toBe('WARD-A');
    expect(body.gatewayCode).toBe('GW-01');
    expect(body.devices).toEqual([{ deviceCode: 'DEV001' }]);
  });

  it('sends the Authorization header', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await bedApi.assignPatient(ORG, CARESITE, 'B-01', PAYLOAD, RAW_TOKEN);
    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe(TOKEN);
  });

  it('does not duplicate bedCode when payload also contains it', async () => {
    global.fetch.mockReturnValueOnce(ok());
    // payload with bedCode already — spread should just override
    await bedApi.assignPatient(ORG, CARESITE, 'B-01', { ...PAYLOAD, bedCode: 'B-01' }, TOKEN);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.bedCode).toBe('B-01');
  });
});

// ─── bedApi.updateAlarmConfig ─────────────────────────────────────────────────

describe('bedApi.updateAlarmConfig', () => {
  const ALARM = { hrMin: 50, hrMax: 120, spo2Min: 90 };

  it('sends POST (not PUT) to .../alarmconfig/save', async () => {
    global.fetch.mockReturnValueOnce(ok({ message: 'Saved' }));
    await bedApi.updateAlarmConfig(ORG, CARESITE, 'B-01', ALARM, RAW_TOKEN);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(url).toBe(`${BASE}/${ORG}/bed/${CARESITE}/B-01/alarmconfig/save`);
  });

  it('URL must end with /alarmconfig/save not /alarmconfig', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await bedApi.updateAlarmConfig(ORG, CARESITE, 'B-01', ALARM, RAW_TOKEN);
    const url = global.fetch.mock.calls[0][0];
    expect(url).not.toMatch(/\/alarmconfig$/);
    expect(url).toMatch(/\/alarmconfig\/save$/);
  });

  it('sends the alarm config as the body', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await bedApi.updateAlarmConfig(ORG, CARESITE, 'B-01', ALARM, RAW_TOKEN);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body).toEqual(ALARM);
  });
});

// ─── bedApi.unassignPatient ───────────────────────────────────────────────────

describe('bedApi.unassignPatient', () => {
  it('sends POST to .../patient/unassign', async () => {
    global.fetch.mockReturnValueOnce(ok({ message: 'Unassigned' }));
    await bedApi.unassignPatient(ORG, CARESITE, 'B-01', RAW_TOKEN);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${BASE}/${ORG}/bed/${CARESITE}/patient/unassign`);
    expect(opts.method).toBe('POST');
  });

  it('body contains only { bedCode }', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await bedApi.unassignPatient(ORG, CARESITE, 'B-01', RAW_TOKEN);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body).toEqual({ bedCode: 'B-01' });
  });
});

// ─── bedApi.listAll ───────────────────────────────────────────────────────────

describe('bedApi.listAll', () => {
  it('sends GET to /{orgName}/bed/{careSiteCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await bedApi.listAll(ORG, CARESITE, RAW_TOKEN);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${BASE}/${ORG}/bed/${CARESITE}/all`);
    expect(opts.method).toBe('GET');
  });

  it('sends Authorization header', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await bedApi.listAll(ORG, CARESITE, RAW_TOKEN);
    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe(TOKEN);
  });
});
