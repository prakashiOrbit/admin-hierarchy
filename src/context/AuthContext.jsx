import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { LOCALE_STORAGE_KEY } from '../i18n';
import { userApi, authApi } from '../services/api';

const AuthContext = createContext(undefined);
const SESSION_KEY = '@auth:session';

const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [locale, setLocale] = useState(() => (i18n.language || 'en').split('-')[0]);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [restoredNav, setRestoredNav] = useState(null); // { screen, params }
  const localeUpdateRef = useRef({ timer: null, controller: null });

  useEffect(() => () => {
    if (localeUpdateRef.current.timer) clearTimeout(localeUpdateRef.current.timer);
    if (localeUpdateRef.current.controller) localeUpdateRef.current.controller.abort();
  }, []);

  useEffect(() => {
    const sync = (lng) => setLocale((lng || 'en').split('-')[0]);
    i18n.on('languageChanged', sync);
    return () => i18n.off('languageChanged', sync);
  }, []);

  // Restore persisted session on mount
  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then(async (raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (!saved?.refreshToken) return;
        try {
          const res = await authApi.refresh(saved.refreshToken);
          if (res?.token) {
            setUser(saved.userProfile);
            setToken(res.token);
            setRestoredNav({ screen: saved.navTarget, params: saved.navParams || {} });
            // Persist updated access token
            AsyncStorage.setItem(SESSION_KEY, JSON.stringify({
              ...saved,
              token: res.token,
            })).catch(() => {});
          }
        } catch {
          // Refresh token expired or invalid — clear stored session
          AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setIsRestoringSession(false));
  }, []);

  const login = (userData, { keepSignedIn = false, navTarget = null, navParams = {} } = {}) => {
    const jwtPayload = userData.token ? decodeJwtPayload(userData.token) : {};
    const userProfile = {
      userName: userData.userName,
      orgName: userData.orgName,
      hospitalCode: userData.hospitalCode,
      userData: userData.userData,
      preferredLocale: userData.preferredLocale || userData.userData?.preferredLocale || jwtPayload.preferred_locale,
    };

    setUser(userProfile);
    setToken(userData.token);

    const backendLocale = (userProfile.preferredLocale || '').split('-')[0];
    const currentLocale = (i18n.language || '').split('-')[0];
    if (backendLocale && backendLocale !== currentLocale && backendLocale !== 'en') {
      changeLanguage(backendLocale);
    }

    if (keepSignedIn && userData.token && userData.refreshToken) {
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify({
        token: userData.token,
        refreshToken: userData.refreshToken,
        userProfile,
        navTarget,
        navParams,
      })).catch(() => {});
    }
  };

  const logout = async () => {
    try {
      if (token) await authApi.logout(token);
    } catch {
      // best-effort — clear client state regardless
    }
    setUser(null);
    setToken(null);
    setRestoredNav(null);
    AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
  };

  const changeLanguage = (newLocale) => {
    i18n.changeLanguage(newLocale);
    setLocale(newLocale);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale).catch(() => {});

    if (token && user?.orgName) {
      if (localeUpdateRef.current.timer) clearTimeout(localeUpdateRef.current.timer);
      if (localeUpdateRef.current.controller) localeUpdateRef.current.controller.abort();

      const controller = new AbortController();
      localeUpdateRef.current.controller = controller;
      localeUpdateRef.current.timer = setTimeout(() => {
        userApi.updatePreferredLocale(user.orgName, newLocale, token, { signal: controller.signal })
          .catch(err => {
            if (err?.code !== 'ABORTED') {
              console.error('Failed to update preferred locale on back-end:', err);
            }
          });
      }, 500);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      locale,
      isAuthenticated: !!token,
      isRestoringSession,
      restoredNav,
      login,
      logout,
      changeLanguage,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
