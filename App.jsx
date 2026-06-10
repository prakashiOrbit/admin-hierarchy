import React, { useState, useEffect, useRef } from 'react';
import { View, StatusBar, BackHandler, Alert } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { LoginScreen } from './src/screens/Auth/LoginScreen';
import { PlatformDashboard } from './src/screens/Dashboard/PlatformDashboard';
import { OrgDashboard } from './src/screens/Dashboard/OrgDashboard';
import { HospDashboard } from './src/screens/Dashboard/HospDashboard';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import './src/i18n';
import { restoreLanguage } from './src/i18n';

GoogleSignin.configure({
  webClientId: '420059277266-n57ermcdok8i2p2th64kbm9o3b2tndss.apps.googleusercontent.com',
});

const Stack = createNativeStackNavigator();

function AppContent({ navigationRef }) {
  const { theme } = useTheme();
  const { isRestoringSession, restoredNav } = useAuth();
  const exitAlertShown = useRef(false);

  useEffect(() => {
    const onBackPress = () => {
      if (navigationRef.current?.canGoBack()) {
        return false; // let React Navigation handle normal back navigation
      }
      if (exitAlertShown.current) return true;
      exitAlertShown.current = true;
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => { exitAlertShown.current = false; },
          },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: false }
      );
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigationRef]);

  // Show blank screen while restoring session to avoid login flash
  if (isRestoringSession) {
    return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  const initialRoute = restoredNav?.screen || 'Login';

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="PlatformDashboard"
          component={PlatformDashboard}
          initialParams={restoredNav?.screen === 'PlatformDashboard' ? restoredNav.params : undefined}
        />
        <Stack.Screen
          name="OrgDashboard"
          component={OrgDashboard}
          initialParams={restoredNav?.screen === 'OrgDashboard' ? restoredNav.params : undefined}
        />
        <Stack.Screen
          name="HospDashboard"
          component={HospDashboard}
          initialParams={restoredNav?.screen === 'HospDashboard' ? restoredNav.params : undefined}
        />
      </Stack.Navigator>
    </>
  );
}

function App() {
  const [langReady, setLangReady] = useState(false);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    restoreLanguage().finally(() => setLangReady(true));
  }, []);

  if (!langReady) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <NavigationContainer ref={navigationRef}>
            <AppContent navigationRef={navigationRef} />
          </NavigationContainer>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
