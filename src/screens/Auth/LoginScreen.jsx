import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { Logo, Field, TextInput, Btn } from '../../components/Shared';
import { IconUser, IconLock, IconEye, IconEyeOff, IconShield, IconBack, IconMail } from '../../icons';

export const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [username, setUsername] = useState('apollo_test129@mailinator.com');
  const [password, setPassword] = useState('$Y#f#XTmSp2r');
  const [error, setError] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [state, setState] = useState('idle'); // idle, loading, twofa, emailVerify
  const [otpValue, setOtpValue] = useState('');
  const [pendingOrg, setPendingOrg] = useState(null);

  const { login } = useAuth();

  const handleLogin = async () => {
    setError(null);
    setState('loading');

    try {
      const response = await authApi.login(username, password);
      console.log('Login Response:', JSON.stringify(response));
      
      // Platform User (iorbit) logs in directly if successful
      if (response.code === "200" && response.token) {
        login(response);
        
        const roles = response.roles || response.userData?.roles || [];
        const isOrgOwner = roles.includes('ORG_OWNER');
        const isHospOwner = roles.includes('HOSP_OWNER');
        
        if (response.orgName === 'SYSTEM' || username === 'iorbit') {
          navigation.replace('PlatformDashboard', { role: 'PLATFORM_ADMIN' });
          return;
        } else if (response.hospitalCode) {
          navigation.replace('HospDashboard', { role: isHospOwner ? 'HOSP_OWNER' : 'HOSP_ADMIN' });
          return;
        } else {
          navigation.replace('OrgDashboard', { role: isOrgOwner ? 'ORG_OWNER' : 'ORG_ADMIN' });
          return;
        }
      }

      // Only for non-platform users, check for verification codes
      if (response.code === "600" || response.message?.toLowerCase().includes('email')) {
        setPendingOrg(response.orgName);
        setState('emailVerify');
      } else if (response.code === "601" || response.message?.toLowerCase().includes('2-factor') || response.message?.toLowerCase().includes('2fa')) {
        setPendingOrg(response.orgName);
        setState('twofa');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
      setState('idle');
    } finally {
      if (state === 'loading') setState('idle');
    }
  };

  const handleVerifyEmail = async () => {
    setState('loading');
    try {
      await authApi.verifyEmail(pendingOrg || 'UNKNOWN', username, otpValue);
      Alert.alert('Success', 'Email verified successfully. Please login again.', [
        { text: 'OK', onPress: () => { setState('idle'); setOtpValue(''); } }
      ]);
    } catch (err) {
      Alert.alert('Verification Failed', err.message);
    } finally {
      setState('idle');
    }
  };

  const handleVerify2fa = async () => {
    setState('loading');
    try {
      const response = await authApi.verify2fa(pendingOrg || 'UNKNOWN', username, otpValue);
      login(response);
      
      const roles = response.roles || response.userData?.roles || [];
      const isOrgOwner = roles.includes('ORG_OWNER');
      const isHospOwner = roles.includes('HOSP_OWNER');

      if (response.orgName === 'SYSTEM') {
        navigation.replace('PlatformDashboard', { role: 'PLATFORM_ADMIN' });
      } else if (response.hospitalCode) {
        navigation.replace('HospDashboard', { role: isHospOwner ? 'HOSP_OWNER' : 'HOSP_ADMIN' });
      } else {
        navigation.replace('OrgDashboard', { role: isOrgOwner ? 'ORG_OWNER' : 'ORG_ADMIN' });
      }
    } catch (err) {
      Alert.alert('2FA Failed', err.message);
      setState('twofa');
    } finally {
      if (state === 'loading') setState('twofa');
    }
  };

  if (state === 'twofa' || state === 'emailVerify') {
    const isEmail = state === 'emailVerify';
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.twofaContent}>
          <TouchableOpacity onPress={() => setState('idle')} style={styles.backBtn}>
            <IconBack size={20} color={T.textDim} />
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.shieldIcon}>
              {isEmail ? <IconMail size={32} color={T.accent} /> : <IconShield size={32} color={T.accent} />}
            </View>
            <Text style={styles.title}>{isEmail ? 'Verify Email' : 'Two-Factor Auth'}</Text>
            <Text style={styles.subtitle}>
              {isEmail 
                ? `Enter the 6-digit code sent to your email for ${pendingOrg}.`
                : `Enter the security code from your authenticator app for ${pendingOrg}.`}
            </Text>
          </View>

          <View style={styles.form}>
            <Field label="Security Code">
              <TextInput
                value={otpValue}
                onChangeText={setOtpValue}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }}
              />
            </Field>

            <Btn 
              full 
              size="lg" 
              onPress={isEmail ? handleVerifyEmail : handleVerify2fa} 
              disabled={state === 'loading' || otpValue.length < 6} 
              style={{ marginTop: 24 }}
            >
              {state === 'loading' ? 'Verifying...' : 'Verify and continue'}
            </Btn>
          </View>

          <TouchableOpacity style={styles.resendBtn}>
            <Text style={styles.resendText}>Didn't receive a code? Resend</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Logo size={48} />
            <View style={{ marginTop: 24 }}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to manage your IoMT estate.</Text>
            </View>
          </View>

          <View style={styles.form}>
            <Field label="Username">
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                leading={<IconUser size={20} color={T.textFaint} />}
              />
            </Field>

            <Field label="Password">
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                placeholder="••••••••"
                leading={<IconLock size={20} color={T.textFaint} />}
                trailing={
                  <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                    {showPw ? <IconEyeOff size={20} color={T.textFaint} /> : <IconEye size={20} color={T.textFaint} />}
                  </TouchableOpacity>
                }
              />
            </Field>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Btn 
              full 
              size="lg" 
              onPress={handleLogin} 
              disabled={state === 'loading'} 
              style={{ marginTop: 12 }}
            >
              {state === 'loading' ? 'Signing in...' : 'Sign in'}
            </Btn>
          </View>

          <View style={styles.footer}>
            <Text style={styles.poweredBy}>Powered by</Text>
            <Logo size={18} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: T.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: T.textDim,
    marginTop: 8,
    lineHeight: 20,
  },
  form: {
    gap: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginVertical: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  forgotText: {
    color: T.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 32,
    marginTop: 'auto',
  },
  poweredBy: {
    fontSize: 12,
    color: T.textFaint,
    fontWeight: '500',
  },
  twofaContent: {
    flex: 1,
    padding: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  backText: {
    color: T.textDim,
    fontSize: 13,
  },
  shieldIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: T.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resendBtn: {
    alignItems: 'center',
    padding: 12,
    marginTop: 16,
  },
  resendText: {
    color: T.accent,
    fontSize: 13,
    fontWeight: '500',
  },
});
