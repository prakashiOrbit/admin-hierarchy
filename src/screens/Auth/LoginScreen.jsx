import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { Logo, Field, TextInput, Btn } from '../../components/Shared';
import { LanguageSheet } from '../../components/LanguageSheet';
import { IconUser, IconLock, IconEye, IconEyeOff, IconShield, IconBack, IconMail, IconGlobe, IconChevron } from '../../icons';


export const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [username, setUsername] = useState('iorbit');
  const [password, setPassword] = useState('iorbitpass');
  const [error, setError] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const [state, setState] = useState('idle'); // idle, loading, twofa, emailVerify
  const [otpValue, setOtpValue] = useState('');
  const [pendingOrg, setPendingOrg] = useState(null);

  const { login } = useAuth();

  const handleLogin = async () => {
    setError(null);
    setState('loading');

    const processLoginResponse = (res) => {
      if (!res) return false;
      const resCode = res.code ? String(res.code) : null;
      const msg = (res.message || '').toLowerCase();
      const hasToken = !!res.token;

      // 1. SECURITY CHALLENGE (HIGHEST PRIORITY)
      // If the server says 601/600 or keywords match, we MUST verify.
      // CRITICAL: We do NOT call login(res) here to avoid setting the session token.
      if (resCode === "601" || msg.includes('2-factor') || msg.includes('2fa') || msg.includes('due fattori') || msg.includes('عاملين')) {
        setPendingOrg(res.orgName || 'UNKNOWN');
        setState('twofa');
        return true;
      }

      if (resCode === "600" || msg.includes('verify') || msg.includes('email') || msg.includes('البريد')) {
        setPendingOrg(res.orgName || 'UNKNOWN');
        setState('emailVerify');
        return true;
      }

      // 2. FINAL SUCCESS (ONLY IF CODE IS 200)
      if (resCode === "200" && hasToken) {
        login(res);
        const roles = res.roles || res.userData?.roles || [];
        const isOrgOwner = roles.includes('ORG_OWNER');
        const isHospOwner = roles.includes('HOSP_OWNER');
        
        if (res.orgName === 'SYSTEM' || username === 'iorbit') {
          navigation.replace('PlatformDashboard', { role: 'PLATFORM_ADMIN' });
        } else if (res.hospitalCode) {
          navigation.replace('HospDashboard', { role: isHospOwner ? 'HOSP_OWNER' : 'HOSP_ADMIN' });
        } else {
          navigation.replace('OrgDashboard', { role: isOrgOwner ? 'ORG_OWNER' : 'ORG_ADMIN' });
        }
        return true;
      }

      return false;
    };

    try {
      const response = await authApi.login(username, password);
      if (!processLoginResponse(response)) {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      if (err.data && processLoginResponse(err.data)) return;
      if (processLoginResponse({ message: err.message })) return;

      setError(err.message || 'Invalid username or password');
      setState('idle');
    }
  };

  const handleVerifyEmail = async () => {
    setState('loading');
    try {
      await authApi.verifyEmail(pendingOrg || 'UNKNOWN', username, otpValue);
      Alert.alert(t('common.success'), 'Email verified successfully. Please login again.', [
        { text: 'OK', onPress: () => { setState('idle'); setOtpValue(''); } }
      ]);
    } catch (err) {
      Alert.alert(t('common.error'), err.message);
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
      Alert.alert(t('common.error'), err.message);
      setState('twofa');
    }
  };

  const currentLangCode = (i18n.language || 'en').split('-')[0];
  const currentLangLabel = t(`languages.${currentLangCode}`)?.split(' ')[0] || 'English';

  if (state === 'twofa' || state === 'emailVerify') {
    const isEmail = state === 'emailVerify';
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.twofaContent}>
          <View style={styles.twofaTopRow}>
            <TouchableOpacity onPress={() => setState('idle')} style={styles.backBtn}>
              <IconBack size={20} color={T.textDim} />
              <Text style={styles.backText}>{t('auth.back_to_login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.langBtn} onPress={() => setShowLocalePicker(true)}>
              <IconGlobe size={14} color={T.textDim} />
              <Text style={styles.langBtnText}>{currentLangLabel}</Text>
              <IconChevron size={12} color={T.textDim} />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <View style={styles.shieldIcon}>
              {isEmail ? <IconMail size={32} color={T.accent} /> : <IconShield size={32} color={T.accent} />}
            </View>
            <Text style={styles.title}>{t(isEmail ? 'auth.verify_email' : 'auth.two_fa')}</Text>
            <Text style={styles.subtitle}>
              {isEmail 
                ? t('auth.otp_email_hint', { org: pendingOrg })
                : t('auth.otp_2fa_hint', { org: pendingOrg })}
            </Text>
          </View>

          <View style={styles.form}>
            <Field label={t('auth.security_code')}>
              <TextInput
                value={otpValue}
                onChangeText={setOtpValue}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                secureTextEntry={!showOtp}
                style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }}
                leading={<View style={{ width: 20 }} />}
                trailing={
                  <TouchableOpacity onPress={() => setShowOtp(!showOtp)}>
                    {showOtp ? <IconEyeOff size={20} color={T.textFaint} /> : <IconEye size={20} color={T.textFaint} />}
                  </TouchableOpacity>
                }
              />
            </Field>

            <Btn 
              full 
              size="lg" 
              onPress={isEmail ? handleVerifyEmail : handleVerify2fa} 
              disabled={state === 'loading' || otpValue.length < 6} 
              style={{ marginTop: 24 }}
            >
              {state === 'loading' ? t('auth.verifying') : t('auth.verify_continue')}
            </Btn>
          </View>

          <TouchableOpacity style={styles.resendBtn}>
            <Text style={styles.resendText}>{t('auth.resend_code')}</Text>
          </TouchableOpacity>
        </View>

        <LanguageSheet
          visible={showLocalePicker}
          onClose={() => setShowLocalePicker(false)}
          currentLanguage={currentLangCode}
          onSelect={(code) => { i18n.changeLanguage(code); setShowLocalePicker(false); }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.langRow}>
            <TouchableOpacity style={styles.langBtn} onPress={() => setShowLocalePicker(true)}>
              <IconGlobe size={14} color={T.textDim} />
              <Text style={styles.langBtnText}>{currentLangLabel}</Text>
              <IconChevron size={12} color={T.textDim} />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Logo size={48} />
            <View style={{ marginTop: 24 }}>
              <Text style={styles.title}>{t('auth.welcome_back')}</Text>
              <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
            </View>
          </View>

          <View style={styles.form}>
            <Field label={t('auth.username')}>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder={t('auth.username_placeholder')}
                leading={<IconUser size={20} color={T.textFaint} />}
              />
            </Field>

            <Field label={t('auth.password')}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                placeholder={t('auth.password_placeholder')}
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
              <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
            </TouchableOpacity>

            <Btn 
              full 
              size="lg" 
              onPress={handleLogin} 
              disabled={state === 'loading'} 
              style={{ marginTop: 12 }}
            >
              {state === 'loading' ? t('auth.signing_in') : t('auth.sign_in')}
            </Btn>
          </View>

          <View style={styles.footer}>
            <Text style={styles.poweredBy}>{t('common.powered_by')}</Text>
            <Logo size={18} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LanguageSheet
        visible={showLocalePicker}
        onClose={() => setShowLocalePicker(false)}
        currentLanguage={currentLangCode}
        onSelect={(code) => { i18n.changeLanguage(code); setShowLocalePicker(false); }}
      />
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
  langRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.borderSoft,
    backgroundColor: T.surface,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: T.textDim,
  },
  twofaContent: {
    flex: 1,
    padding: 24,
  },
  twofaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
