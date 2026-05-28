import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { LOCALE_STORAGE_KEY } from '../i18n';
import { userApi } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [locale, setLocale] = useState(() => (i18n.language || 'en').split('-')[0]);
  const localeUpdateRef = useRef({ timer: null, controller: null });

  useEffect(() => () => {
    if (localeUpdateRef.current.timer) clearTimeout(localeUpdateRef.current.timer);
    if (localeUpdateRef.current.controller) localeUpdateRef.current.controller.abort();
  }, []);

  // Keep locale in sync with i18n regardless of who calls i18n.changeLanguage()
  useEffect(() => {
    const sync = (lng) => setLocale((lng || 'en').split('-')[0]);
    i18n.on('languageChanged', sync);
    return () => i18n.off('languageChanged', sync);
  }, []);

  const login = (userData) => {
    const userProfile = {
      userName: userData.userName,
      orgName: userData.orgName,
      hospitalCode: userData.hospitalCode,
      userData: userData.userData,
      preferredLocale: userData.preferredLocale || userData.userData?.preferredLocale,
    };
    
    setUser(userProfile);
    setToken(userData.token);

    const backendLocale = (userProfile.preferredLocale || '').split('-')[0];
    const currentLocale = (i18n.language || '').split('-')[0];
    // Apply the server-side preference whenever it differs from the current UI language.
    // Exception: if the backend has never been changed from 'en', keep whatever the user
    // pre-selected on the login screen (e.g. they picked French before logging in).
    if (backendLocale && backendLocale !== currentLocale && backendLocale !== 'en') {
      changeLanguage(backendLocale);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
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
      login, 
      logout, 
      changeLanguage,
      isAuthenticated: !!token 
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
