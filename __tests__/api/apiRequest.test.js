/**
 * Tests for the core apiRequest function:
 *  - URL construction (base URL + endpoint + query params)
 *  - Default headers (Content-Type, X-Locale, caller-supplied Authorization)
 *  - Successful response → returns parsed data
 *  - Non-JSON response → wraps text in { message }
 *  - 4xx / 5xx → throws ApiError with server message + status
 *  - GET deduplication (concurrent requests share in-flight promise)
 *  - POST / GET-with-signal NOT deduplicated
 *  - Request cancelled by caller signal → throws ApiError code ABORTED
 *  - Timeout → throws ApiError code TIMEOUT
 */

import { apiRequest, ApiError } from '../../src/services/api';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../src/i18n', () => ({
  __esModule: true,
  default: { language: 'en' },
  LOCALE_STORAGE_KEY: 'preferred_locale',
}));

// Suppress console noise from apiRequest's own logging
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

//const BASE = 'http://139.59.46.163/api';
const BASE = 'https://itouch-plus.iorbit.health/api';

/** Build a resolved fetch response */
function ok(body, contentType = 'application/json') {
  return Promise.resolve({
    ok: true,
    status: 200,
    headers: { get: (h) => (h === 'content-type' ? contentType : null) },
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  });
}

/** Build an error fetch response */
function fail(status, body, contentType = 'application/json') {
  return Promise.resolve({
    ok: false,
    status,
    headers: { get: (h) => (h === 'content-type' ? contentType : null) },
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  });
}

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── URL construction ─────────────────────────────────────────────────────────

describe('URL construction', () => {
  it('prepends BASE_URL to the endpoint', async () => {
    global.fetch.mockReturnValueOnce(ok({ ok: true }));
    await apiRequest('/shift/CLV/all', { headers: { Authorization: 'Bearer t' } });
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/shift/CLV/all`,
      expect.anything(),
    );
  });

  it('appends query params when options.params is provided', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await apiRequest('/patient/CLV/all', {
      headers: { Authorization: 'Bearer t' },
      params: { page: '1', size: '20' },
    });
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toContain('page=1');
    expect(calledUrl).toContain('size=20');
  });
});

// ─── Default headers ─────────────────────────────────────────────────────────

describe('default headers', () => {
  it('always sends Content-Type: application/json', async () => {
    global.fetch.mockReturnValueOnce(ok({}));
    await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ userName: 'a', password: 'b' }),
    });
    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('always sends X-Locale header (from i18n.language)', async () => {
    global.fetch.mockReturnValueOnce(ok({}));
    await apiRequest('/login', { method: 'POST', body: '{}' });
    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers['X-Locale']).toBe('en');
  });

  it('forwards caller-supplied Authorization header', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await apiRequest('/bed/CLV/all', {
      headers: { Authorization: 'Bearer my-token' },
    });
    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer my-token');
  });
});

// ─── Successful responses ─────────────────────────────────────────────────────

describe('successful responses', () => {
  it('returns parsed JSON body on success', async () => {
    global.fetch.mockReturnValueOnce(ok({ shiftCode: 'S1', status: 'ACTIVE' }));
    const result = await apiRequest('/shift/CLV/S1', {
      headers: { Authorization: 'Bearer t' },
    });
    expect(result).toEqual({ shiftCode: 'S1', status: 'ACTIVE' });
  });

  it('wraps plain-text response in { message } when content-type is not JSON', async () => {
    global.fetch.mockReturnValueOnce(ok('Server started', 'text/plain'));
    const result = await apiRequest('/actuator/health');
    expect(result).toEqual({ message: 'Server started' });
  });

  it('uses method GET by default', async () => {
    global.fetch.mockReturnValueOnce(ok([]));
    await apiRequest('/bed/CLV/all', { headers: { Authorization: 'Bearer t' } });
    expect(global.fetch.mock.calls[0][1].method).toBe('GET');
  });

  it('normalises method names to uppercase', async () => {
    global.fetch.mockReturnValueOnce(ok({}));
    await apiRequest('/login', { method: 'post', body: '{}' });
    expect(global.fetch.mock.calls[0][1].method).toBe('POST');
  });
});

// ─── Error responses ──────────────────────────────────────────────────────────

describe('error responses', () => {
  it('throws ApiError for 401 with the server message', async () => {
    global.fetch.mockReturnValueOnce(fail(401, { message: 'Unauthorised' }));
    await expect(apiRequest('/bed/CLV/all', { headers: { Authorization: 'Bearer bad' } }))
      .rejects.toMatchObject({ name: 'ApiError', status: 401, message: 'Unauthorised' });
  });

  it('throws ApiError for 403 Access Denied', async () => {
    global.fetch.mockReturnValueOnce(fail(403, { message: 'Access denied' }));
    await expect(apiRequest('/bed/CLV/assign/patient', {
      method: 'POST', headers: { Authorization: 'Bearer t' }, body: '{}',
    })).rejects.toMatchObject({ name: 'ApiError', status: 403, message: 'Access denied' });
  });

  it('throws ApiError for 404 with server message', async () => {
    global.fetch.mockReturnValueOnce(fail(404, { message: 'Shift not found' }));
    await expect(apiRequest('/shift/CLV/MISSING', { headers: { Authorization: 'Bearer t' } }))
      .rejects.toMatchObject({ name: 'ApiError', status: 404, message: 'Shift not found' });
  });

  it('throws ApiError for 500 with fallback message when body has no message', async () => {
    global.fetch.mockReturnValueOnce(fail(500, {}));
    await expect(apiRequest('/bed/CLV/all', { headers: { Authorization: 'Bearer t' } }))
      .rejects.toMatchObject({ name: 'ApiError', status: 500, message: 'Something went wrong' });
  });

  it('stores the full response data on the thrown error', async () => {
    const body = { message: 'Validation failed', code: 'INVALID' };
    global.fetch.mockReturnValueOnce(fail(422, body));
    await expect(apiRequest('/shift/CLV/create', {
      method: 'POST', headers: { Authorization: 'Bearer t' }, body: '{}',
    })).rejects.toMatchObject({ data: body, endpoint: '/shift/CLV/create' });
  });
});

// ─── GET deduplication ────────────────────────────────────────────────────────

describe('GET request deduplication', () => {
  it('calls fetch only once for two concurrent GETs with the same key', async () => {
    let resolveFetch;
    global.fetch.mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve; }),
    );

    const req1 = apiRequest('/bed/CLV/all', { headers: { Authorization: 'Bearer t' } });
    const req2 = apiRequest('/bed/CLV/all', { headers: { Authorization: 'Bearer t' } });

    // Both started but fetch only invoked once
    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolveFetch({
      ok: true, status: 200,
      headers: { get: () => 'application/json' },
      json: async () => [{ bedCode: 'B1' }],
      text: async () => '',
    });

    const [r1, r2] = await Promise.all([req1, req2]);
    expect(r1).toEqual([{ bedCode: 'B1' }]);
    expect(r2).toEqual([{ bedCode: 'B1' }]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('does NOT deduplicate GETs with different tokens', async () => {
    global.fetch
      .mockReturnValueOnce(ok([{ bedCode: 'B1' }]))
      .mockReturnValueOnce(ok([{ bedCode: 'B2' }]));

    const [r1, r2] = await Promise.all([
      apiRequest('/bed/CLV/all', { headers: { Authorization: 'Bearer token-A' } }),
      apiRequest('/bed/CLV/all', { headers: { Authorization: 'Bearer token-B' } }),
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(r1).toEqual([{ bedCode: 'B1' }]);
    expect(r2).toEqual([{ bedCode: 'B2' }]);
  });

  it('does NOT deduplicate POST requests', async () => {
    global.fetch
      .mockReturnValueOnce(ok({ id: 1 }))
      .mockReturnValueOnce(ok({ id: 2 }));

    await Promise.all([
      apiRequest('/shift/CLV/create', {
        method: 'POST', headers: { Authorization: 'Bearer t' }, body: '{}',
      }),
      apiRequest('/shift/CLV/create', {
        method: 'POST', headers: { Authorization: 'Bearer t' }, body: '{}',
      }),
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('does NOT deduplicate a GET that has a caller-supplied signal', async () => {
    global.fetch
      .mockReturnValueOnce(ok([]))
      .mockReturnValueOnce(ok([]));

    const controller = new AbortController();
    await Promise.all([
      apiRequest('/bed/CLV/all', {
        headers: { Authorization: 'Bearer t' },
        signal: controller.signal,
      }),
      apiRequest('/bed/CLV/all', {
        headers: { Authorization: 'Bearer t' },
        signal: controller.signal,
      }),
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

// ─── Cancellation ─────────────────────────────────────────────────────────────

describe('request cancellation', () => {
  it('throws ApiError with code ABORTED when caller aborts the signal', async () => {
    const controller = new AbortController();

    global.fetch.mockImplementationOnce((_url, { signal }) =>
      new Promise((_res, reject) => {
        signal.addEventListener('abort', () => {
          const err = new Error('AbortError');
          err.name = 'AbortError';
          reject(err);
        });
      }),
    );

    const promise = apiRequest('/bed/CLV/all', {
      headers: { Authorization: 'Bearer t' },
      signal: controller.signal,
    });

    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'ApiError', code: 'ABORTED' });
  });
});

// ─── Timeout ──────────────────────────────────────────────────────────────────

describe('request timeout', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('throws ApiError with code TIMEOUT when request exceeds timeoutMs', async () => {
    global.fetch.mockImplementationOnce(
      (_url, { signal }) =>
        new Promise((_res, reject) => {
          signal.addEventListener('abort', () => {
            const err = new Error('AbortError');
            err.name = 'AbortError';
            reject(err);
          });
        }),
    );

    const promise = apiRequest('/bed/CLV/all', {
      headers: { Authorization: 'Bearer t' },
      timeoutMs: 5000,
    });

    // Advance time past the timeout, then flush microtasks
    jest.advanceTimersByTime(5001);
    await Promise.resolve(); // flush abort event listener

    await expect(promise).rejects.toMatchObject({ name: 'ApiError', code: 'TIMEOUT' });
  });
});
