import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// GoogleSignin.configure() is called once in App.jsx on mount
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { Logo, Field, TextInput, Btn } from '../../components/Shared';
import { LanguageSheet } from '../../components/LanguageSheet';
import {
  IconUser, IconLock, IconEye, IconEyeOff, IconShield, IconBack,
  IconMail, IconGlobe, IconChevron, IconPhone,
} from '../../icons';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RESEND_COOLDOWN = 60; // seconds

const resolveNavTarget = (res, fallbackUsername) => {
  const roles = res.roles || res.userData?.roles || [];
  const isOrgOwner  = roles.includes('ORG_OWNER');
  const isHospOwner = roles.includes('HOSP_OWNER');
  const isNurse     = roles.includes('NURSE');
  const isDoctor    = roles.includes('DOCTOR');
  const isPatient   = roles.includes('PATIENT');

  if (res.orgName === 'SYSTEM' || fallbackUsername === 'iorbit') {
    return { navTarget: 'PlatformDashboard', navParams: { role: 'PLATFORM_ADMIN' } };
  }
  if (res.hospitalCode) {
    const hospRole = isHospOwner ? 'HOSP_OWNER'
      : isNurse ? 'NURSE' : isDoctor ? 'DOCTOR'
      : isPatient ? 'PATIENT' : 'HOSP_ADMIN';
    return { navTarget: 'HospDashboard', navParams: { role: hospRole } };
  }
  return { navTarget: 'OrgDashboard', navParams: { role: isOrgOwner ? 'ORG_OWNER' : 'ORG_ADMIN' } };
};

// ─── Component ────────────────────────────────────────────────────────────────
export const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { login, changeLanguage } = useAuth();

  // ── Login mode ──────────────────────────────────────────────────────────────
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'phone' | 'google'

  // ── Password mode fields ────────────────────────────────────────────────────
  const [username, setUsername] = useState('iorbit');
  const [password, setPassword] = useState('iorbitpass');
  const [showPw, setShowPw]     = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // ── Phone mode fields ────────────────────────────────────────────────────────
  const [phone, setPhone]       = useState('');
  const [orgName, setOrgName]   = useState('');

  // ── Shared OTP / verify state ────────────────────────────────────────────────
  // state: 'idle' | 'loading' | 'twofa' | 'emailVerify' | 'phoneOtp'
  const [state, setState]           = useState('idle');
  const [otpValue, setOtpValue]     = useState('');
  const [showOtp, setShowOtp]       = useState(false);
  const [pendingOrg, setPendingOrg] = useState(null);
  const [pendingUserName, setPendingUserName] = useState(null);
  const [pendingPhone, setPendingPhone]       = useState(null); // for phone resend
  const [keepSignedInPending, setKeepSignedInPending] = useState(false);

  // ── Misc ─────────────────────────────────────────────────────────────────────
  const [error, setError]                   = useState(null);
  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const currentLangCode  = (i18n.language || 'en').split('-')[0];
  const currentLangLabel = t(`languages.${currentLangCode}`)?.split(' ')[0] || 'English';

  // ── Resend cooldown timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const startResendCooldown = () => setResendCooldown(RESEND_COOLDOWN);

  // ── Navigation helper ────────────────────────────────────────────────────────
  const finalizeLogin = (res, ksi) => {
    const { navTarget, navParams } = resolveNavTarget(res, username);
    login(res, { keepSignedIn: ksi, navTarget, navParams });
    navigation.replace(navTarget, navParams);
  };

  // ── Process any login response (shared by all three modes) ──────────────────
  const processLoginResponse = (res, ksi = false) => {
    if (!res) return false;
    const code = res.code ? String(res.code) : null;
    const msg  = (res.message || '').toLowerCase();

    // Phone OTP pending (code 333)
    if (code === '333') {
      setPendingOrg(res.orgName || orgName);
      setPendingUserName(res.userName || username);
      startResendCooldown();
      setState('phoneOtp');
      return true;
    }

    // 2FA pending
    if (code === '222' || msg.includes('2-factor') || msg.includes('2fa')) {
      setPendingOrg(res.orgName || 'UNKNOWN');
      setPendingUserName(res.userName || username);
      setKeepSignedInPending(ksi);
      startResendCooldown();
      setState('twofa');
      return true;
    }

    // Email verification pending
    if (code === '111' || msg.includes('verify') || msg.includes('email')) {
      setPendingOrg(res.orgName || 'UNKNOWN');
      setPendingUserName(res.userName || username);
      startResendCooldown();
      setState('emailVerify');
      return true;
    }

    // Final success
    if (code === '200' && res.token) {
      finalizeLogin(res, ksi);
      return true;
    }

    return false;
  };

  // ════════════════════════════════════════════════════════════════════════════
  // LOGIN HANDLERS
  // ════════════════════════════════════════════════════════════════════════════

  // ── 1. Username / Password ───────────────────────────────────────────────────
  const handlePasswordLogin = async () => {
    setError(null);
    setState('loading');
    try {
      const res = await authApi.login(username, password);
      if (!processLoginResponse(res, keepSignedIn)) {
        throw new Error(res.message || t('auth.login_failed'));
      }
    } catch (err) {
      if (err.data && processLoginResponse(err.data, keepSignedIn)) return;
      const s = err.status;
      setError(
        s === 401 || s === 403 ? t('auth.invalid_credentials')
          : s === 429          ? t('auth.too_many_attempts')
          : !s || err.name === 'AbortError' ? t('auth.network_error')
          : t('auth.login_failed'),
      );
      setState('idle');
    }
  };

  // ── 2. Phone ─────────────────────────────────────────────────────────────────
  const handlePhoneLogin = async () => {
    const trimmedPhone = phone.trim();
    const trimmedOrg   = orgName.trim();
    if (!trimmedPhone || !trimmedOrg) {
      setError(t('auth.phone_fields_required'));
      return;
    }
    setError(null);
    setState('loading');
    try {
      const res = await authApi.loginPhone(trimmedPhone, trimmedOrg);
      setPendingPhone(trimmedPhone);
      if (!processLoginResponse(res)) {
        throw new Error(res.message || t('auth.login_failed'));
      }
    } catch (err) {
      setError(err.message || t('auth.login_failed'));
      setState('idle');
    }
  };

  // ── 3. Google ────────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setError(null);
    setState('loading');
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken  = userInfo.data?.idToken || userInfo.idToken;
      if (!idToken) throw new Error('Google sign-in did not return an ID token.');

      const res = await authApi.loginGoogle(idToken);
      if (!processLoginResponse(res, keepSignedIn)) {
        throw new Error(res.message || t('auth.login_failed'));
      }
    } catch (err) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        setState('idle');
        return;
      }
      if (err.code === statusCodes.IN_PROGRESS) {
        setState('idle');
        return;
      }
      setError(err.message || t('auth.login_failed'));
      setState('idle');
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // OTP VERIFY HANDLERS
  // ════════════════════════════════════════════════════════════════════════════

  const handleVerifyEmail = async () => {
    setState('loading');
    try {
      await authApi.verifyEmail(pendingOrg, pendingUserName, otpValue);
      Alert.alert(t('common.success'), t('auth.email_verified_msg'), [
        { text: 'OK', onPress: () => { setState('idle'); setOtpValue(''); } },
      ]);
    } catch (err) {
      Alert.alert(t('common.error'), err.message);
      setState('emailVerify');
    }
  };

  const handleVerify2fa = async () => {
    setState('loading');
    try {
      const res = await authApi.verify2fa(pendingOrg, pendingUserName, otpValue);
      finalizeLogin(res, keepSignedInPending);
    } catch (err) {
      Alert.alert(t('common.error'), err.message);
      setState('twofa');
    }
  };

  // Phone OTP uses the same verify2fa endpoint (backend treats it identically)
  const handleVerifyPhoneOtp = async () => {
    setState('loading');
    try {
      const res = await authApi.verify2fa(pendingOrg, pendingUserName, otpValue);
      finalizeLogin(res, false);
    } catch (err) {
      Alert.alert(t('common.error'), err.message);
      setState('phoneOtp');
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // RESEND HANDLER
  // ════════════════════════════════════════════════════════════════════════════

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      if (state === 'emailVerify') {
        await authApi.resendEmailOtp(pendingOrg, pendingUserName);
        Alert.alert(t('common.success'), t('auth.otp_resent'));
        startResendCooldown();
      } else if (state === 'phoneOtp') {
        const res = await authApi.loginPhone(pendingPhone, pendingOrg);
        if (res) {
          Alert.alert(t('common.success'), t('auth.otp_resent'));
          startResendCooldown();
        }
      } else if (state === 'twofa') {
        // No dedicated resend endpoint yet — guide the user back to login
        Alert.alert(
          t('auth.resend_2fa_title'),
          t('auth.resend_2fa_msg'),
          [{ text: t('auth.back_to_login'), onPress: () => { setState('idle'); setOtpValue(''); } }],
        );
      }
    } catch (err) {
      Alert.alert(t('common.error'), err.message || t('auth.resend_failed'));
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // OTP / VERIFY SCREEN  (shared for twofa, emailVerify, phoneOtp)
  // ════════════════════════════════════════════════════════════════════════════

  if (state === 'twofa' || state === 'emailVerify' || state === 'phoneOtp') {
    const isEmail  = state === 'emailVerify';
    const isPhone  = state === 'phoneOtp';
    const onVerify = isEmail ? handleVerifyEmail : isPhone ? handleVerifyPhoneOtp : handleVerify2fa;

    const icon    = isEmail ? <IconMail size={32} color={T.accent} />
                  : isPhone ? <IconPhone size={32} color={T.accent} />
                  : <IconShield size={32} color={T.accent} />;
    const titleKey  = isEmail ? 'auth.verify_email' : isPhone ? 'auth.verify_phone' : 'auth.two_fa';
    const hintKey   = isEmail ? 'auth.otp_email_hint' : isPhone ? 'auth.otp_phone_hint' : 'auth.otp_2fa_hint';

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.otpContent}>
          {/* Top row */}
          <View style={styles.otpTopRow}>
            <TouchableOpacity onPress={() => { setState('idle'); setOtpValue(''); }} style={styles.backBtn}>
              <IconBack size={20} color={T.textDim} />
              <Text style={styles.backText}>{t('auth.back_to_login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.langBtn} onPress={() => setShowLocalePicker(true)}>
              <IconGlobe size={14} color={T.textDim} />
              <Text style={styles.langBtnText}>{currentLangLabel}</Text>
              <IconChevron size={12} color={T.textDim} />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={styles.otpHeader}>
            <View style={styles.otpIconBox}>{icon}</View>
            <Text style={styles.title}>{t(titleKey)}</Text>
            <Text style={styles.subtitle}>{t(hintKey, { org: pendingOrg })}</Text>
          </View>

          {/* OTP input */}
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
              full size="lg"
              onPress={onVerify}
              disabled={state === 'loading' || otpValue.length < 6}
              style={{ marginTop: 24 }}
            >
              {state === 'loading' ? t('auth.verifying') : t('auth.verify_continue')}
            </Btn>
          </View>

          {/* Resend */}
          <TouchableOpacity
            style={styles.resendBtn}
            onPress={handleResend}
            disabled={resendCooldown > 0}
          >
            <Text style={[styles.resendText, resendCooldown > 0 && { color: T.textFaint }]}>
              {resendCooldown > 0
                ? t('auth.resend_in', { seconds: resendCooldown })
                : t('auth.resend_code')}
            </Text>
          </TouchableOpacity>
        </View>

        <LanguageSheet
          visible={showLocalePicker}
          onClose={() => setShowLocalePicker(false)}
          currentLanguage={currentLangCode}
          onSelect={(code) => { changeLanguage(code); setShowLocalePicker(false); }}
        />
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN LOGIN SCREEN
  // ════════════════════════════════════════════════════════════════════════════

  const isLoading = state === 'loading';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Language selector */}
          <View style={styles.langRow}>
            <TouchableOpacity style={styles.langBtn} onPress={() => setShowLocalePicker(true)}>
              <IconGlobe size={14} color={T.textDim} />
              <Text style={styles.langBtnText}>{currentLangLabel}</Text>
              <IconChevron size={12} color={T.textDim} />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Logo size={48} />
            <View style={{ marginTop: 24 }}>
              <Text style={styles.title}>{t('auth.welcome_back')}</Text>
              <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
            </View>
          </View>

          {/* Login mode tabs */}
          <View style={styles.modeTabs}>
            {['password', 'phone', 'google'].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.modeTab, loginMode === mode && styles.modeTabActive]}
                onPress={() => { setLoginMode(mode); setError(null); }}
              >
                <Text style={[styles.modeTabText, loginMode === mode && styles.modeTabTextActive]}>
                  {t(`auth.mode_${mode}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Password form ── */}
          {loginMode === 'password' && (
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

              {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

              <View style={styles.formMeta}>
                <TouchableOpacity
                  style={styles.keepSignedInRow}
                  onPress={() => setKeepSignedIn(v => !v)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, keepSignedIn && styles.checkboxActive]}>
                    {keepSignedIn && <View style={styles.checkmark} />}
                  </View>
                  <Text style={styles.keepSignedInText}>{t('auth.keep_signed_in')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
                </TouchableOpacity>
              </View>

              <Btn full size="lg" onPress={handlePasswordLogin} disabled={isLoading} style={{ marginTop: 12 }}>
                {isLoading ? t('auth.signing_in') : t('auth.sign_in')}
              </Btn>
            </View>
          )}

          {/* ── Phone form ── */}
          {loginMode === 'phone' && (
            <View style={styles.form}>
              <Field label={t('auth.phone_number')}>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+14155552671"
                  keyboardType="phone-pad"
                  leading={<IconPhone size={20} color={T.textFaint} />}
                />
              </Field>

              <Field label={t('auth.organisation')}>
                <TextInput
                  value={orgName}
                  onChangeText={setOrgName}
                  placeholder={t('auth.org_placeholder')}
                  autoCapitalize="none"
                />
              </Field>

              {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

              <Text style={styles.phoneHint}>{t('auth.phone_otp_hint')}</Text>

              <Btn full size="lg" onPress={handlePhoneLogin} disabled={isLoading} style={{ marginTop: 12 }}>
                {isLoading ? t('auth.sending_otp') : t('auth.send_otp')}
              </Btn>
            </View>
          )}

          {/* ── Google form ── */}
          {loginMode === 'google' && (
            <View style={styles.form}>
              {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

              <Text style={styles.googleHint}>{t('auth.google_hint')}</Text>

              <TouchableOpacity
                style={[styles.googleBtn, isLoading && styles.googleBtnDisabled]}
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={T.text} size="small" />
                ) : (
                  <>
                    {/* Google "G" logo */}
                    <View style={styles.googleLogo}>
                      <Text style={styles.googleLogoText}>G</Text>
                    </View>
                    <Text style={styles.googleBtnText}>{t('auth.sign_in_google')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
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
        onSelect={(code) => { changeLanguage(code); setShowLocalePicker(false); }}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const createStyles = (T) => StyleSheet.create({
  container:    { flex: 1, backgroundColor: T.bg },
  scrollContent: { flexGrow: 1, padding: 24 },

  langRow: { alignItems: 'flex-end', marginBottom: 8 },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 20, borderWidth: 1, borderColor: T.borderSoft,
    backgroundColor: T.surface,
  },
  langBtnText: { fontSize: 12, fontWeight: '600', color: T.textDim },

  header:   { marginTop: 20, marginBottom: 24 },
  title:    { fontSize: 28, fontWeight: '700', color: T.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: T.textDim, marginTop: 8, lineHeight: 20 },

  // ── Mode tabs ───────────────────────────────────────────────────────────────
  modeTabs: {
    flexDirection: 'row', gap: 8,
    backgroundColor: T.surface,
    borderRadius: 12, padding: 4,
    marginBottom: 24,
  },
  modeTab: {
    flex: 1, paddingVertical: 10, borderRadius: 9,
    alignItems: 'center',
  },
  modeTabActive: { backgroundColor: T.bg, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  modeTabText:       { fontSize: 13, fontWeight: '600', color: T.textFaint },
  modeTabTextActive: { color: T.text },

  form: { gap: 8 },

  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 10, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', marginVertical: 4,
  },
  errorText: { color: '#EF4444', fontSize: 13, fontWeight: '500', textAlign: 'center' },

  formMeta: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 4, marginBottom: 4,
  },
  keepSignedInRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
    borderColor: T.border, alignItems: 'center', justifyContent: 'center',
    backgroundColor: T.surface,
  },
  checkboxActive: { backgroundColor: T.accent, borderColor: T.accent },
  checkmark:      { width: 9, height: 9, borderRadius: 2, backgroundColor: '#fff' },
  keepSignedInText: { fontSize: 13, color: T.textDim, fontWeight: '500' },
  forgotBtn:  { paddingVertical: 6 },
  forgotText: { color: T.accent, fontSize: 13, fontWeight: '500' },

  phoneHint:  { fontSize: 12, color: T.textFaint, marginTop: 4, lineHeight: 18 },
  googleHint: { fontSize: 14, color: T.textDim, textAlign: 'center', marginBottom: 8, lineHeight: 20 },

  // ── Google button ────────────────────────────────────────────────────────────
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, height: 52,
    backgroundColor: T.surface,
    borderRadius: 12, borderWidth: 1, borderColor: T.border,
    marginTop: 8,
  },
  googleBtnDisabled: { opacity: 0.6 },
  googleLogo: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 2, elevation: 1,
  },
  googleLogoText: { fontSize: 16, fontWeight: '700', color: '#4285F4' },
  googleBtnText:  { fontSize: 15, fontWeight: '600', color: T.text },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 32, marginTop: 'auto',
  },
  poweredBy: { fontSize: 12, color: T.textFaint, fontWeight: '500' },

  // ── OTP screen ───────────────────────────────────────────────────────────────
  otpContent: { flex: 1, padding: 24 },
  otpTopRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: T.textDim, fontSize: 13 },
  otpHeader: { marginBottom: 32 },
  otpIconBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: T.accentSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  resendBtn:  { alignItems: 'center', padding: 12, marginTop: 16 },
  resendText: { color: T.accent, fontSize: 13, fontWeight: '500' },
});
