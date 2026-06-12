/**
 * Tests for authApi endpoints:
 *  - login    → POST /login  with { userName, password }
 *  - refresh  → POST /refresh  with { refreshToken }
 *  - verify2fa → POST /{orgName}/user/{userName}/verify2fa  with { otpCode }
 */

import { authApi } from '../../src/services/api';

jest.mock('../../src/i18n', () => ({
  __esModule: true,
  default: { language: 'en' },
  LOCALE_STORAGE_KEY: 'preferred_locale',
}));

const BASE = 'http://139.59.46.163/api';

function ok(body) {
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

// ─── authApi.login ────────────────────────────────────────────────────────────

describe('authApi.login', () => {
  it('sends POST to /login', async () => {
    global.fetch.mockReturnValueOnce(ok({ code: '200', token: 'jwt' }));
    await authApi.login('admin', 'pass123');
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${BASE}/login`);
    expect(opts.method).toBe('POST');
  });

  it('sends { userName, password } in the request body', async () => {
    global.fetch.mockReturnValueOnce(ok({ code: '200', token: 'jwt' }));
    await authApi.login('admin', 'pass123');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body).toEqual({ userName: 'admin', password: 'pass123' });
  });

  it('returns the parsed response on success', async () => {
    const response = { code: '200', token: 'jwt-abc', orgName: 'APOAP1' };
    global.fetch.mockReturnValueOnce(ok(response));
    const result = await authApi.login('admin', 'pass123');
    expect(result).toEqual(response);
  });
});

// ─── authApi.refresh ──────────────────────────────────────────────────────────

describe('authApi.refresh', () => {
  it('sends POST to /refresh', async () => {
    global.fetch.mockReturnValueOnce(ok({ code: '200', token: 'new-jwt' }));
    await authApi.refresh('my-refresh-token');
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${BASE}/refresh`);
    expect(opts.method).toBe('POST');
  });

  it('sends { refreshToken } in the request body', async () => {
    global.fetch.mockReturnValueOnce(ok({ code: '200', token: 'new-jwt' }));
    await authApi.refresh('my-refresh-token');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body).toEqual({ refreshToken: 'my-refresh-token' });
  });

  it('returns a fresh access token on success', async () => {
    const response = { code: '200', token: 'fresh-jwt', message: 'Token refreshed successfully' };
    global.fetch.mockReturnValueOnce(ok(response));
    const result = await authApi.refresh('rt-xyz');
    expect(result.token).toBe('fresh-jwt');
  });

  it('does NOT send an Authorization header (endpoint is public)', async () => {
    global.fetch.mockReturnValueOnce(ok({ token: 'new-jwt' }));
    await authApi.refresh('rt-xyz');
    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBeUndefined();
  });
});

// ─── authApi.verify2fa ────────────────────────────────────────────────────────

describe('authApi.verify2fa', () => {
  it('sends POST to /{orgName}/user/{userName}/verify2fa', async () => {
    global.fetch.mockReturnValueOnce(ok({ code: '200', token: 'jwt' }));
    await authApi.verify2fa('APOAP1', 'nurse@careSite.com', '123456');
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe(`${BASE}/APOAP1/user/nurse@careSite.com/verify2fa`);
    expect(opts.method).toBe('POST');
  });

  it('sends { otpCode } in the request body', async () => {
    global.fetch.mockReturnValueOnce(ok({ code: '200', token: 'jwt' }));
    await authApi.verify2fa('APOAP1', 'nurse@careSite.com', '123456');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body).toEqual({ otpCode: '123456' });
  });
});
