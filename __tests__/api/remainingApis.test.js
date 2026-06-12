/**
 * Tests for all remaining API modules:
 *   getApiErrorMessage, shiftApi, deviceApi, gatewayApi,
 *   nurseApi, patientApi, doctorApi, wardApi, assignmentApi
 *
 * For each method we verify:
 *   1. Correct HTTP method
 *   2. Correct URL
 *   3. Correct request body (POST/PUT/DELETE)
 *   4. Authorization header forwarded
 */

import {
  getApiErrorMessage,
  shiftApi,
  deviceApi,
  gatewayApi,
  nurseApi,
  patientApi,
  doctorApi,
  wardApi,
  assignmentApi,
} from '../../src/services/api';

jest.mock('../../src/i18n', () => ({
  __esModule: true,
  default: { language: 'en' },
  LOCALE_STORAGE_KEY: 'preferred_locale',
}));

const BASE = 'http://139.59.46.163/api';
const ORG  = 'APOAP1';
const CARESITE = 'CLV';
const RAW  = 'raw-token';
const AUTH = `Bearer ${RAW}`;

function ok(body = {}) {
  return Promise.resolve({
    ok: true, status: 200,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const url    = () => global.fetch.mock.calls[0][0];
const method = () => global.fetch.mock.calls[0][1].method;
const headers = () => global.fetch.mock.calls[0][1].headers;
const body   = () => JSON.parse(global.fetch.mock.calls[0][1].body);

// ─── getApiErrorMessage ───────────────────────────────────────────────────────

describe('getApiErrorMessage', () => {
  it('returns timeout message when code is TIMEOUT', () => {
    expect(getApiErrorMessage({ code: 'TIMEOUT' }))
      .toBe('Unable to load data. The server is taking too long to respond.');
  });

  it('returns server unavailable for status >= 500', () => {
    expect(getApiErrorMessage({ status: 500 }))
      .toBe('Unable to load data. The server is currently unavailable.');
    expect(getApiErrorMessage({ status: 503 }))
      .toBe('Unable to load data. The server is currently unavailable.');
  });

  it('returns error.message for other errors', () => {
    expect(getApiErrorMessage({ status: 404, message: 'Not found' })).toBe('Not found');
    expect(getApiErrorMessage({ status: 403, message: 'Access denied' })).toBe('Access denied');
  });

  it('returns fallback when no useful info available', () => {
    expect(getApiErrorMessage({})).toBe('Unable to load data. Please try again.');
    expect(getApiErrorMessage(null)).toBe('Unable to load data. Please try again.');
  });
});

// ─── shiftApi ─────────────────────────────────────────────────────────────────

describe('shiftApi', () => {
  it('create → POST shift/{careSiteCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.create(ORG, CARESITE, { shiftCode: 'S1', shiftName: 'Morning' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${CARESITE}/create`);
    expect(body()).toMatchObject({ shiftCode: 'S1', shiftName: 'Morning' });
    expect(headers()['Authorization']).toBe(AUTH);
  });

  it('listAll → GET shift/{careSiteCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await shiftApi.listAll(ORG, CARESITE, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${CARESITE}/all`);
  });

  it('assignNurse → POST shift/{careSiteCode}/nurse/assign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.assignNurse(ORG, CARESITE, { nurseCode: 'N1', shiftCode: 'S1' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${CARESITE}/nurse/assign`);
    expect(body()).toEqual({ nurseCode: 'N1', shiftCode: 'S1' });
  });

  it('unassignNurse → POST shift/{careSiteCode}/nurse/unassign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.unassignNurse(ORG, CARESITE, { nurseCode: 'N1', shiftCode: 'S1' }, RAW);
    expect(url()).toBe(`${BASE}/${ORG}/shift/${CARESITE}/nurse/unassign`);
    expect(method()).toBe('POST');
  });

  it('assignDoctor → POST shift/{careSiteCode}/doctor/assign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.assignDoctor(ORG, CARESITE, { doctorCode: 'D1', shiftCode: 'S1' }, RAW);
    expect(url()).toBe(`${BASE}/${ORG}/shift/${CARESITE}/doctor/assign`);
    expect(method()).toBe('POST');
    expect(body()).toEqual({ doctorCode: 'D1', shiftCode: 'S1' });
  });

  it('unassignDoctor → POST shift/{careSiteCode}/doctor/unassign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.unassignDoctor(ORG, CARESITE, { doctorCode: 'D1', shiftCode: 'S1' }, RAW);
    expect(url()).toBe(`${BASE}/${ORG}/shift/${CARESITE}/doctor/unassign`);
    expect(method()).toBe('POST');
  });

  it('getDetail → GET shift/{careSiteCode}/{shiftCode}', async () => {
    global.fetch.mockReturnValueOnce(ok({ shiftCode: 'S1' }));
    await shiftApi.getDetail(ORG, CARESITE, 'S1', RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${CARESITE}/S1`);
  });

  it('update → POST shift/{careSiteCode}/{shiftCode}/update', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.update(ORG, CARESITE, 'S1', { shiftName: 'Night' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${CARESITE}/S1/update`);
    expect(body()).toMatchObject({ shiftName: 'Night' });
  });

  it('delete → DELETE shift/{careSiteCode}/{shiftCode}/delete', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.delete(ORG, CARESITE, 'S1', RAW);
    expect(method()).toBe('DELETE');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${CARESITE}/S1/delete`);
  });
});

// ─── deviceApi ────────────────────────────────────────────────────────────────

describe('deviceApi', () => {
  it('listAll → GET device/{careSiteCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await deviceApi.listAll(ORG, CARESITE, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/device/${CARESITE}/all`);
  });

  it('listUnassigned → GET device/{careSiteCode}/unassigneddevices', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await deviceApi.listUnassigned(ORG, CARESITE, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/device/${CARESITE}/unassigneddevices`);
  });

  it('create → POST device/{careSiteCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await deviceApi.create(ORG, CARESITE, { deviceCode: 'DEV1', deviceType: 'ECG' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/device/${CARESITE}/create`);
    expect(body()).toMatchObject({ deviceCode: 'DEV1', deviceType: 'ECG' });
  });

  it('assign → POST device/{careSiteCode}/assign with payload', async () => {
    global.fetch.mockReturnValueOnce(ok());
    const payload = { deviceCode: 'DEV1', gatewayCode: 'GW1', patientCode: 'PAT1' };
    await deviceApi.assign(ORG, CARESITE, payload, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/device/${CARESITE}/assign`);
    expect(body()).toEqual(payload);
  });
});

// ─── gatewayApi ───────────────────────────────────────────────────────────────

describe('gatewayApi', () => {
  it('listAll → GET gateway/{careSiteCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await gatewayApi.listAll(ORG, CARESITE, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/gateway/${CARESITE}/all`);
  });

  it('create → POST gateway/{careSiteCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await gatewayApi.create(ORG, CARESITE, { gatewayCode: 'GW1' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/gateway/${CARESITE}/create`);
    expect(body()).toMatchObject({ gatewayCode: 'GW1' });
  });

  it('assignToBed → POST gateway/{careSiteCode}/assign/bed with correct payload', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await gatewayApi.assignToBed(ORG, CARESITE, { gatewayCode: 'GW1', bedCode: 'B-01' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/gateway/${CARESITE}/assign/bed`);
    expect(body()).toEqual({ gatewayCode: 'GW1', bedCode: 'B-01' });
    expect(headers()['Authorization']).toBe(AUTH);
  });
});

// ─── nurseApi ─────────────────────────────────────────────────────────────────

describe('nurseApi', () => {
  it('listAll → GET nurse/{careSiteCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await nurseApi.listAll(ORG, CARESITE, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/nurse/${CARESITE}/all`);
  });

  it('create → POST nurse/{careSiteCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await nurseApi.create(ORG, CARESITE, { firstName: 'Ann', lastName: 'Smith' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/nurse/${CARESITE}/create`);
    expect(body()).toMatchObject({ firstName: 'Ann', lastName: 'Smith' });
  });

  it('assignBed → POST nurse/{careSiteCode}/assigntobed with payload', async () => {
    global.fetch.mockReturnValueOnce(ok());
    const payload = { nurseCode: 'N1', shiftCode: 'S1', wardCode: 'W1', bedCode: 'B1' };
    await nurseApi.assignBed(ORG, CARESITE, payload, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/nurse/${CARESITE}/assigntobed`);
    expect(body()).toEqual(payload);
  });

  it('admitPatient → POST nurse/{careSiteCode}/admit', async () => {
    global.fetch.mockReturnValueOnce(ok());
    const payload = { nurseCode: 'N1', patientCode: 'PAT1', wardCode: 'W1', bedCode: 'B1' };
    await nurseApi.admitPatient(ORG, CARESITE, payload, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/nurse/${CARESITE}/admit`);
    expect(body()).toEqual(payload);
  });
});

// ─── patientApi ───────────────────────────────────────────────────────────────

describe('patientApi', () => {
  it('listAll → GET patient/{careSiteCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await patientApi.listAll(ORG, CARESITE, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/patient/${CARESITE}/all`);
  });

  it('create → POST patient/{careSiteCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await patientApi.create(ORG, CARESITE, { firstName: 'Alice' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/patient/${CARESITE}/create`);
    expect(body()).toMatchObject({ firstName: 'Alice' });
  });

  it('discharge → POST patient/{careSiteCode}/initiateDischarge with patientCode in body', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await patientApi.discharge(ORG, CARESITE, 'PAT1', RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/patient/${CARESITE}/initiateDischarge`);
    expect(body()).toEqual({ patientCode: 'PAT1' });
  });

  it('transfer → POST patient/{careSiteCode}/initiateTransfer with patientCode spread', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await patientApi.transfer(ORG, CARESITE, 'PAT1', { wardCode: 'W2' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/patient/${CARESITE}/initiateTransfer`);
    expect(body()).toEqual({ patientCode: 'PAT1', wardCode: 'W2' });
  });
});

// ─── doctorApi ────────────────────────────────────────────────────────────────

describe('doctorApi', () => {
  it('listAll → GET doctor/{careSiteCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await doctorApi.listAll(ORG, CARESITE, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/doctor/${CARESITE}/all`);
  });

  it('create → POST doctor/{careSiteCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await doctorApi.create(ORG, CARESITE, { firstName: 'Dr. John' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/doctor/${CARESITE}/create`);
  });

  it('getDetail → GET doctor/{careSiteCode}/{doctorCode}/doctordetail', async () => {
    global.fetch.mockReturnValueOnce(ok({ doctorCode: 'D1' }));
    await doctorApi.getDetail(ORG, CARESITE, 'D1', RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/doctor/${CARESITE}/D1/doctordetail`);
  });
});

// ─── wardApi ─────────────────────────────────────────────────────────────────

describe('wardApi', () => {
  it('listAll → GET ward/{careSiteCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await wardApi.listAll(ORG, CARESITE, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/ward/${CARESITE}/all`);
  });

  it('create → POST ward/{careSiteCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await wardApi.create(ORG, CARESITE, { wardCode: 'W1', wardName: 'ICU' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/ward/${CARESITE}/create`);
    expect(body()).toMatchObject({ wardCode: 'W1', wardName: 'ICU' });
  });

  it('update → PUT ward/{careSiteCode}/update/{wardId}', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await wardApi.update(ORG, CARESITE, 'w-uuid-123', { wardName: 'CCU' }, RAW);
    expect(method()).toBe('PUT');
    expect(url()).toBe(`${BASE}/${ORG}/ward/${CARESITE}/update/w-uuid-123`);
    expect(body()).toMatchObject({ wardName: 'CCU' });
  });

  it('delete → DELETE ward/{careSiteCode}/delete/{wardId}', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await wardApi.delete(ORG, CARESITE, 'w-uuid-123', RAW);
    expect(method()).toBe('DELETE');
    expect(url()).toBe(`${BASE}/${ORG}/ward/${CARESITE}/delete/w-uuid-123`);
  });
});

// ─── assignmentApi ────────────────────────────────────────────────────────────

describe('assignmentApi', () => {
  it('assign → POST assignment/{careSiteCode}/assign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    const payload = { doctorCode: 'D1', patientCode: 'PAT1' };
    await assignmentApi.assign(ORG, CARESITE, payload, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/assignment/${CARESITE}/assign`);
    expect(body()).toEqual(payload);
  });

  it('unassign → POST assignment/{careSiteCode}/unassign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await assignmentApi.unassign(ORG, CARESITE, { doctorCode: 'D1', patientCode: 'PAT1' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/assignment/${CARESITE}/unassign`);
  });

  it('getByPatient → GET assignment/{careSiteCode}/patient/{patientCode}', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await assignmentApi.getByPatient(ORG, CARESITE, 'PAT1', RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/assignment/${CARESITE}/patient/PAT1`);
  });

  it('getByDoctor → GET assignment/{careSiteCode}/doctor/{doctorCode}', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await assignmentApi.getByDoctor(ORG, CARESITE, 'D1', RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/assignment/${CARESITE}/doctor/D1`);
  });
});
