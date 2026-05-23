import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager, Alert } from 'react-native';
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
    const isRTL = newLocale === 'ar';
    const currentRTL = I18nManager.isRTL;
    
    // 1. Update i18n instance immediately for text
    i18n.changeLanguage(newLocale);
    setLocale(newLocale);

    // 2. Handle Native RTL Layout
    // CRITICAL: RTL changes are NATIVE properties. They require an app restart.
    if (currentRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      
      Alert.alert(
        isRTL ? "تغيير تخطيط اللغة" : "Language Layout Change",
        isRTL 
          ? "يجب إعادة تشغيل التطبيق لتطبيق التنسيق من اليمين إلى اليسار بشكل صحيح."
          : "The app must be restarted to apply the standard layout direction correctly.",
        [{ text: "OK" }]
      );
    }

    // 3. Persist to Back-end
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
