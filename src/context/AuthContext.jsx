import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import { userApi } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [locale, setLocale] = useState(i18n.language);

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

    if (userProfile.preferredLocale && userProfile.preferredLocale !== i18n.language) {
      changeLanguage(userProfile.preferredLocale);
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
