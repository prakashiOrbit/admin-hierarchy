/**
 * Tests for AuthContext / AuthProvider:
 *
 *  Initial state
 *    - isRestoringSession starts true, user/token null
 *
 *  Session restore on mount  (useEffect → AsyncStorage → authApi.refresh)
 *    - No stored session      → isRestoringSession becomes false, no state set
 *    - Valid session + token  → user, token, restoredNav all set; AsyncStorage updated
 *    - Refresh throws          → AsyncStorage cleared, state stays null
 *    - Stored session missing refreshToken → no refresh called
 *
 *  login()
 *    - Sets user and token; isAuthenticated becomes true
 *    - keepSignedIn=true  → AsyncStorage.setItem with full session payload
 *    - keepSignedIn=false → AsyncStorage.setItem NOT called
 *    - No refreshToken in response → not persisted even if keepSignedIn=true
 *
 *  logout()
 *    - Clears user and token
 *    - isAuthenticated becomes false
 *    - Calls AsyncStorage.removeItem with the session key
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { authApi } from '../../src/services/api';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem:    jest.fn(),
    setItem:    jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('../../src/services/api', () => ({
  authApi: { refresh: jest.fn() },
  userApi: { updatePreferredLocale: jest.fn().mockResolvedValue(null) },
}));

jest.mock('../../src/i18n', () => ({
  __esModule: true,
  default: {
    language: 'en',
    on: jest.fn(),
    off: jest.fn(),
    changeLanguage: jest.fn(),
  },
  LOCALE_STORAGE_KEY: 'preferred_locale',
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flush all pending promises (microtasks + macrotasks) */
const flushPromises = () =>
  act(async () => {
    await new Promise((resolve) => setImmediate(resolve));
  });

/** Render the useAuth hook inside AuthProvider */
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

const SESSION_KEY = '@auth:session';

const STORED_SESSION = {
  refreshToken: 'rt-stored',
  token: 'old-jwt',
  userProfile: {
    userName: 'nurse@careSite.com',
    orgName: 'APOAP1',
    careSiteCode: 'CLV',
    userData: null,
    preferredLocale: 'en',
  },
  navTarget: 'CareSiteDashboard',
  navParams: { role: 'NURSE' },
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => jest.restoreAllMocks());

beforeEach(() => {
  // Default: no stored session, refresh not called
  AsyncStorage.getItem.mockResolvedValue(null);
  authApi.refresh.mockResolvedValue(null);
});

afterEach(() => jest.clearAllMocks());

// ─── Initial state ────────────────────────────────────────────────────────────

describe('initial state', () => {
  beforeEach(() => {
    // Keep getItem pending so we can inspect state before it resolves
    AsyncStorage.getItem.mockImplementation(() => new Promise(() => {}));
  });

  it('isRestoringSession is true before async restore completes', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isRestoringSession).toBe(true);
  });

  it('user and token are null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('isAuthenticated is false', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('restoredNav is null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.restoredNav).toBeNull();
  });
});

// ─── Session restore ──────────────────────────────────────────────────────────

describe('session restore on mount', () => {
  it('sets isRestoringSession=false when AsyncStorage has no session', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await flushPromises();

    expect(result.current.isRestoringSession).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(authApi.refresh).not.toHaveBeenCalled();
  });

  it('restores user, token and restoredNav from a valid stored session', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(STORED_SESSION));
    authApi.refresh.mockResolvedValueOnce({ token: 'fresh-jwt' });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    expect(result.current.user).toEqual(STORED_SESSION.userProfile);
    expect(result.current.token).toBe('fresh-jwt');
    expect(result.current.restoredNav).toEqual({
      screen: 'CareSiteDashboard',
      params: { role: 'NURSE' },
    });
    expect(result.current.isRestoringSession).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('calls authApi.refresh with the stored refreshToken', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(STORED_SESSION));
    authApi.refresh.mockResolvedValueOnce({ token: 'fresh-jwt' });

    renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    expect(authApi.refresh).toHaveBeenCalledWith('rt-stored');
  });

  it('persists the new access token back to AsyncStorage after refresh', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(STORED_SESSION));
    authApi.refresh.mockResolvedValueOnce({ token: 'fresh-jwt' });

    renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      SESSION_KEY,
      expect.stringContaining('"token":"fresh-jwt"'),
    );
  });

  it('clears AsyncStorage and restores nothing when refresh throws', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(STORED_SESSION));
    authApi.refresh.mockRejectedValueOnce(new Error('Token expired'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SESSION_KEY);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isRestoringSession).toBe(false);
  });

  it('does not call refresh when stored session has no refreshToken', async () => {
    const sessionWithoutRefresh = { token: 'old-jwt', userProfile: {} };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(sessionWithoutRefresh));

    renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    expect(authApi.refresh).not.toHaveBeenCalled();
  });
});

// ─── login() ──────────────────────────────────────────────────────────────────

describe('login()', () => {
  const LOGIN_RESPONSE = {
    userName: 'admin@careSite.com',
    orgName: 'APOAP1',
    careSiteCode: 'CLV',
    token: 'new-access-jwt',
    refreshToken: 'new-refresh-token',
    userData: { roles: ['CARESITE_ADMIN'] },
  };

  beforeEach(() => {
    AsyncStorage.getItem.mockResolvedValue(null); // no stored session
  });

  it('sets user and token from the login response', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await flushPromises(); // let isRestoringSession settle

    act(() => {
      result.current.login(LOGIN_RESPONSE);
    });

    expect(result.current.token).toBe('new-access-jwt');
    expect(result.current.user).toMatchObject({
      userName: 'admin@careSite.com',
      orgName: 'APOAP1',
      careSiteCode: 'CLV',
    });
  });

  it('isAuthenticated becomes true after login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    act(() => { result.current.login(LOGIN_RESPONSE); });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('persists session to AsyncStorage when keepSignedIn=true', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    act(() => {
      result.current.login(LOGIN_RESPONSE, {
        keepSignedIn: true,
        navTarget: 'CareSiteDashboard',
        navParams: { role: 'CARESITE_ADMIN' },
      });
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      SESSION_KEY,
      expect.any(String),
    );

    const stored = JSON.parse(AsyncStorage.setItem.mock.calls.find(
      ([k]) => k === SESSION_KEY
    )[1]);
    expect(stored.token).toBe('new-access-jwt');
    expect(stored.refreshToken).toBe('new-refresh-token');
    expect(stored.navTarget).toBe('CareSiteDashboard');
    expect(stored.navParams).toEqual({ role: 'CARESITE_ADMIN' });
    expect(stored.userProfile.userName).toBe('admin@careSite.com');
  });

  it('does NOT persist when keepSignedIn=false (default)', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    act(() => { result.current.login(LOGIN_RESPONSE); });

    const sessionSetCalls = AsyncStorage.setItem.mock.calls.filter(
      ([k]) => k === SESSION_KEY,
    );
    expect(sessionSetCalls).toHaveLength(0);
  });

  it('does NOT persist when keepSignedIn=true but response has no refreshToken', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    act(() => {
      result.current.login(
        { ...LOGIN_RESPONSE, refreshToken: undefined },
        { keepSignedIn: true, navTarget: 'CareSiteDashboard', navParams: {} },
      );
    });

    const sessionSetCalls = AsyncStorage.setItem.mock.calls.filter(
      ([k]) => k === SESSION_KEY,
    );
    expect(sessionSetCalls).toHaveLength(0);
  });
});

// ─── logout() ─────────────────────────────────────────────────────────────────

describe('logout()', () => {
  const LOGIN_RESPONSE = {
    userName: 'admin@careSite.com',
    orgName: 'APOAP1',
    token: 'jwt',
    refreshToken: 'rt',
  };

  it('clears user and token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    act(() => { result.current.login(LOGIN_RESPONSE); });
    expect(result.current.token).toBe('jwt');

    act(() => { result.current.logout(); });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('isAuthenticated becomes false after logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    act(() => { result.current.login(LOGIN_RESPONSE); });
    act(() => { result.current.logout(); });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('clears restoredNav', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(STORED_SESSION));
    authApi.refresh.mockResolvedValueOnce({ token: 'fresh-jwt' });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    expect(result.current.restoredNav).not.toBeNull();

    act(() => { result.current.logout(); });

    expect(result.current.restoredNav).toBeNull();
  });

  it('removes the session from AsyncStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await flushPromises();

    act(() => { result.current.logout(); });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SESSION_KEY);
  });
});
