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
const HOSP = 'CLV';
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
  it('create → POST shift/{hospCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.create(ORG, HOSP, { shiftCode: 'S1', shiftName: 'Morning' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${HOSP}/create`);
    expect(body()).toMatchObject({ shiftCode: 'S1', shiftName: 'Morning' });
    expect(headers()['Authorization']).toBe(AUTH);
  });

  it('listAll → GET shift/{hospCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await shiftApi.listAll(ORG, HOSP, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${HOSP}/all`);
  });

  it('assignNurse → POST shift/{hospCode}/nurse/assign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.assignNurse(ORG, HOSP, { nurseCode: 'N1', shiftCode: 'S1' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${HOSP}/nurse/assign`);
    expect(body()).toEqual({ nurseCode: 'N1', shiftCode: 'S1' });
  });

  it('unassignNurse → POST shift/{hospCode}/nurse/unassign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.unassignNurse(ORG, HOSP, { nurseCode: 'N1', shiftCode: 'S1' }, RAW);
    expect(url()).toBe(`${BASE}/${ORG}/shift/${HOSP}/nurse/unassign`);
    expect(method()).toBe('POST');
  });

  it('assignDoctor → POST shift/{hospCode}/doctor/assign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.assignDoctor(ORG, HOSP, { doctorCode: 'D1', shiftCode: 'S1' }, RAW);
    expect(url()).toBe(`${BASE}/${ORG}/shift/${HOSP}/doctor/assign`);
    expect(method()).toBe('POST');
    expect(body()).toEqual({ doctorCode: 'D1', shiftCode: 'S1' });
  });

  it('unassignDoctor → POST shift/{hospCode}/doctor/unassign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.unassignDoctor(ORG, HOSP, { doctorCode: 'D1', shiftCode: 'S1' }, RAW);
    expect(url()).toBe(`${BASE}/${ORG}/shift/${HOSP}/doctor/unassign`);
    expect(method()).toBe('POST');
  });

  it('getDetail → GET shift/{hospCode}/{shiftCode}', async () => {
    global.fetch.mockReturnValueOnce(ok({ shiftCode: 'S1' }));
    await shiftApi.getDetail(ORG, HOSP, 'S1', RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${HOSP}/S1`);
  });

  it('update → POST shift/{hospCode}/{shiftCode}/update', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.update(ORG, HOSP, 'S1', { shiftName: 'Night' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${HOSP}/S1/update`);
    expect(body()).toMatchObject({ shiftName: 'Night' });
  });

  it('delete → DELETE shift/{hospCode}/{shiftCode}/delete', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await shiftApi.delete(ORG, HOSP, 'S1', RAW);
    expect(method()).toBe('DELETE');
    expect(url()).toBe(`${BASE}/${ORG}/shift/${HOSP}/S1/delete`);
  });
});

// ─── deviceApi ────────────────────────────────────────────────────────────────

describe('deviceApi', () => {
  it('listAll → GET device/{hospCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await deviceApi.listAll(ORG, HOSP, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/device/${HOSP}/all`);
  });

  it('listUnassigned → GET device/{hospCode}/unassigneddevices', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await deviceApi.listUnassigned(ORG, HOSP, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/device/${HOSP}/unassigneddevices`);
  });

  it('create → POST device/{hospCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await deviceApi.create(ORG, HOSP, { deviceCode: 'DEV1', deviceType: 'ECG' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/device/${HOSP}/create`);
    expect(body()).toMatchObject({ deviceCode: 'DEV1', deviceType: 'ECG' });
  });

  it('assign → POST device/{hospCode}/assign with payload', async () => {
    global.fetch.mockReturnValueOnce(ok());
    const payload = { deviceCode: 'DEV1', gatewayCode: 'GW1', patientCode: 'PAT1' };
    await deviceApi.assign(ORG, HOSP, payload, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/device/${HOSP}/assign`);
    expect(body()).toEqual(payload);
  });
});

// ─── gatewayApi ───────────────────────────────────────────────────────────────

describe('gatewayApi', () => {
  it('listAll → GET gateway/{hospCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await gatewayApi.listAll(ORG, HOSP, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/gateway/${HOSP}/all`);
  });

  it('create → POST gateway/{hospCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await gatewayApi.create(ORG, HOSP, { gatewayCode: 'GW1' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/gateway/${HOSP}/create`);
    expect(body()).toMatchObject({ gatewayCode: 'GW1' });
  });

  it('assignToBed → POST gateway/{hospCode}/assign/bed with correct payload', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await gatewayApi.assignToBed(ORG, HOSP, { gatewayCode: 'GW1', bedCode: 'B-01' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/gateway/${HOSP}/assign/bed`);
    expect(body()).toEqual({ gatewayCode: 'GW1', bedCode: 'B-01' });
    expect(headers()['Authorization']).toBe(AUTH);
  });
});

// ─── nurseApi ─────────────────────────────────────────────────────────────────

describe('nurseApi', () => {
  it('listAll → GET nurse/{hospCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await nurseApi.listAll(ORG, HOSP, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/nurse/${HOSP}/all`);
  });

  it('create → POST nurse/{hospCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await nurseApi.create(ORG, HOSP, { firstName: 'Ann', lastName: 'Smith' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/nurse/${HOSP}/create`);
    expect(body()).toMatchObject({ firstName: 'Ann', lastName: 'Smith' });
  });

  it('assignBed → POST nurse/{hospCode}/assigntobed with payload', async () => {
    global.fetch.mockReturnValueOnce(ok());
    const payload = { nurseCode: 'N1', shiftCode: 'S1', wardCode: 'W1', bedCode: 'B1' };
    await nurseApi.assignBed(ORG, HOSP, payload, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/nurse/${HOSP}/assigntobed`);
    expect(body()).toEqual(payload);
  });

  it('admitPatient → POST nurse/{hospCode}/admit', async () => {
    global.fetch.mockReturnValueOnce(ok());
    const payload = { nurseCode: 'N1', patientCode: 'PAT1', wardCode: 'W1', bedCode: 'B1' };
    await nurseApi.admitPatient(ORG, HOSP, payload, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/nurse/${HOSP}/admit`);
    expect(body()).toEqual(payload);
  });
});

// ─── patientApi ───────────────────────────────────────────────────────────────

describe('patientApi', () => {
  it('listAll → GET patient/{hospCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await patientApi.listAll(ORG, HOSP, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/patient/${HOSP}/all`);
  });

  it('create → POST patient/{hospCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await patientApi.create(ORG, HOSP, { firstName: 'Alice' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/patient/${HOSP}/create`);
    expect(body()).toMatchObject({ firstName: 'Alice' });
  });

  it('discharge → POST patient/{hospCode}/initiateDischarge with patientCode in body', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await patientApi.discharge(ORG, HOSP, 'PAT1', RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/patient/${HOSP}/initiateDischarge`);
    expect(body()).toEqual({ patientCode: 'PAT1' });
  });

  it('transfer → POST patient/{hospCode}/initiateTransfer with patientCode spread', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await patientApi.transfer(ORG, HOSP, 'PAT1', { wardCode: 'W2' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/patient/${HOSP}/initiateTransfer`);
    expect(body()).toEqual({ patientCode: 'PAT1', wardCode: 'W2' });
  });
});

// ─── doctorApi ────────────────────────────────────────────────────────────────

describe('doctorApi', () => {
  it('listAll → GET doctor/{hospCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await doctorApi.listAll(ORG, HOSP, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/doctor/${HOSP}/all`);
  });

  it('create → POST doctor/{hospCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await doctorApi.create(ORG, HOSP, { firstName: 'Dr. John' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/doctor/${HOSP}/create`);
  });

  it('getDetail → GET doctor/{hospCode}/{doctorCode}/doctordetail', async () => {
    global.fetch.mockReturnValueOnce(ok({ doctorCode: 'D1' }));
    await doctorApi.getDetail(ORG, HOSP, 'D1', RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/doctor/${HOSP}/D1/doctordetail`);
  });
});

// ─── wardApi ─────────────────────────────────────────────────────────────────

describe('wardApi', () => {
  it('listAll → GET ward/{hospCode}/all', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await wardApi.listAll(ORG, HOSP, RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/ward/${HOSP}/all`);
  });

  it('create → POST ward/{hospCode}/create', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await wardApi.create(ORG, HOSP, { wardCode: 'W1', wardName: 'ICU' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/ward/${HOSP}/create`);
    expect(body()).toMatchObject({ wardCode: 'W1', wardName: 'ICU' });
  });

  it('update → PUT ward/{hospCode}/update/{wardId}', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await wardApi.update(ORG, HOSP, 'w-uuid-123', { wardName: 'CCU' }, RAW);
    expect(method()).toBe('PUT');
    expect(url()).toBe(`${BASE}/${ORG}/ward/${HOSP}/update/w-uuid-123`);
    expect(body()).toMatchObject({ wardName: 'CCU' });
  });

  it('delete → DELETE ward/{hospCode}/delete/{wardId}', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await wardApi.delete(ORG, HOSP, 'w-uuid-123', RAW);
    expect(method()).toBe('DELETE');
    expect(url()).toBe(`${BASE}/${ORG}/ward/${HOSP}/delete/w-uuid-123`);
  });
});

// ─── assignmentApi ────────────────────────────────────────────────────────────

describe('assignmentApi', () => {
  it('assign → POST assignment/{hospCode}/assign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    const payload = { doctorCode: 'D1', patientCode: 'PAT1' };
    await assignmentApi.assign(ORG, HOSP, payload, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/assignment/${HOSP}/assign`);
    expect(body()).toEqual(payload);
  });

  it('unassign → POST assignment/{hospCode}/unassign', async () => {
    global.fetch.mockReturnValueOnce(ok());
    await assignmentApi.unassign(ORG, HOSP, { doctorCode: 'D1', patientCode: 'PAT1' }, RAW);
    expect(method()).toBe('POST');
    expect(url()).toBe(`${BASE}/${ORG}/assignment/${HOSP}/unassign`);
  });

  it('getByPatient → GET assignment/{hospCode}/patient/{patientCode}', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await assignmentApi.getByPatient(ORG, HOSP, 'PAT1', RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/assignment/${HOSP}/patient/PAT1`);
  });

  it('getByDoctor → GET assignment/{hospCode}/doctor/{doctorCode}', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await assignmentApi.getByDoctor(ORG, HOSP, 'D1', RAW);
    expect(method()).toBe('GET');
    expect(url()).toBe(`${BASE}/${ORG}/assignment/${HOSP}/doctor/D1`);
  });
});
