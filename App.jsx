import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoginScreen } from './src/screens/Auth/LoginScreen';
import { PlatformDashboard } from './src/screens/Dashboard/PlatformDashboard';
import { OrgDashboard } from './src/screens/Dashboard/OrgDashboard';
import { HospDashboard } from './src/screens/Dashboard/HospDashboard';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { theme, isDark } = useTheme();
  
  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="PlatformDashboard" component={PlatformDashboard} />
        <Stack.Screen name="OrgDashboard" component={OrgDashboard} />
        <Stack.Screen name="HospDashboard" component={HospDashboard} />
      </Stack.Navigator>
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <NavigationContainer>
            <AppContent />
          </NavigationContainer>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
