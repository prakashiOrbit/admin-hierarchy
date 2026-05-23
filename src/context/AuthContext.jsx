import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import { userApi } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [locale, setLocale] = useState(() => (i18n.language || 'en').split('-')[0]);

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
    // Only override the current language if the backend has an explicit non-default preference.
    // If backend says 'en' (never changed from default), preserve whatever the user
    // selected before logging in (e.g. from the login screen language picker).
    if (backendLocale && backendLocale !== 'en' && backendLocale !== currentLocale) {
      changeLanguage(backendLocale);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const changeLanguage = async (newLocale) => {
    i18n.changeLanguage(newLocale);
    setLocale(newLocale);

    if (token && user?.orgName) {
      try {
        await userApi.updatePreferredLocale(user.orgName, newLocale, token);
      } catch (err) {
        console.error('Failed to update preferred locale on back-end:', err);
      }
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
