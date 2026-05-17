import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Logo, Field, TextInput, Btn } from '../../components/Shared';
import { IconUser, IconLock, IconEye, IconEyeOff, IconShield, IconBack } from '../../icons';

export const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [username, setUsername] = useState('iorbit');
  const [password, setPassword] = useState('iorbitpass');
  const [error, setError] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [state, setState] = useState('idle');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const VALID_USERS = {
    'iorbit':      { pass: 'iorbitpass', role: 'PLATFORM_ADMIN', skip2fa: true },
    'org.owner': { pass: 'iorbitpass',  role: 'ORG_OWNER',      skip2fa: false },
    'org.admin': { pass: 'iorbitpass',  role: 'ORG_ADMIN',      skip2fa: false },
    'hosp.owner': { pass: 'iorbitpass',  role: 'HOSP_OWNER',     skip2fa: false },
    'hosp.admin': { pass: 'iorbitpass',  role: 'HOSP_ADMIN',     skip2fa: false },
  };

  const handleLogin = () => {
    setError(null);
    const user = VALID_USERS[username];

    if (!user || user.pass !== password) {
      setError('Invalid username or password');
      return;
    }

    setState('loading');

    setTimeout(() => {
      if (user.skip2fa) {
        setState('idle');
        navigation.replace('PlatformDashboard', { role: user.role });
      } else {
        setState('twofa');
      }
    }, 1200);
  };

  const handleVerify = () => {
    setState('loading');
    setTimeout(() => {
      setState('idle');
      const user = VALID_USERS[username];
      if (user.role === 'HOSP_OWNER' || user.role === 'HOSP_ADMIN') {
        navigation.replace('HospDashboard', { role: user.role });
      } else {
        navigation.replace('OrgDashboard', { role: user.role });
      }
    }, 1000);
  };


  if (state === 'twofa') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.twofaContent}>
          <TouchableOpacity onPress={() => setState('idle')} style={styles.backBtn}>
            <IconBack size={20} color={T.textDim} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.shieldIcon}>
              <IconShield size={32} color={T.accent} />
            </View>
            <Text style={styles.title}>Verify it's you</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to <Text style={styles.mono}>•••• 4421</Text>. It expires in 5:00.
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((v, i) => (
              <View key={i} style={styles.otpBox}>
                <Text style={styles.otpText}>{v || '•'}</Text>
              </View>
            ))}
          </View>

          <Btn 
            full 
            size="lg" 
            onPress={handleVerify} 
            disabled={state === 'loading'} 
            style={{ marginTop: 32 }}
          >
            {state === 'loading' ? 'Verifying...' : 'Verify and continue'}
          </Btn>
          <TouchableOpacity style={styles.resendBtn}>
            <Text style={styles.resendText}>Resend code</Text>
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
  footerText: {
    fontSize: 11,
    color: T.textFaint,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: T.text,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  otpBox: {
    width: 45,
    height: 54,
    borderWidth: 1,
    borderColor: T.borderSoft,
    backgroundColor: T.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpText: {
    fontSize: 22,
    fontWeight: '600',
    color: T.text,
  },
  resendBtn: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  resendText: {
    color: T.accent,
    fontSize: 13,
    fontWeight: '500',
  },
});
