import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authApi, getApiErrorMessage } from '../../services/api';
import { Logo, Field, TextInput, PhoneInput, Btn } from '../../components/Shared';
import { LanguageSheet } from '../../components/LanguageSheet';
import {
  IconUser, IconLock, IconEye, IconEyeOff, IconShield, IconBack,
  IconMail, IconGlobe, IconChevron, IconPhone,
} from '../../icons';

const RESEND_COOLDOWN = 60;

const resolveNavTarget = (res, fallbackUsername) => {
  const roles      = res.roles || res.userData?.roles || [];
  const isOrgOwner  = roles.includes('ORG_OWNER');
  const isCareSiteOwner = roles.includes('CARESITE_OWNER');
  const isNurse     = roles.includes('NURSE');
  const isDoctor    = roles.includes('DOCTOR');
  const isPatient   = roles.includes('PATIENT');

  if (res.orgName === 'SYSTEM' || fallbackUsername === 'iorbit') {
    return { navTarget: 'PlatformDashboard', navParams: { role: 'PLATFORM_ADMIN' } };
  }
  if (res.careSiteCode) {
    const careSiteRole = isCareSiteOwner ? 'CARESITE_OWNER'
      : isNurse ? 'NURSE' : isDoctor ? 'DOCTOR'
      : isPatient ? 'PATIENT' : 'CARESITE_ADMIN';
    return { navTarget: 'CareSiteDashboard', navParams: { role: careSiteRole } };
  }
  return { navTarget: 'OrgDashboard', navParams: { role: isOrgOwner ? 'ORG_OWNER' : 'ORG_ADMIN' } };
};

export const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const { login, changeLanguage } = useAuth();

  // ── Login mode: 'password' (default) or 'phone' (inline sub-form) ──────────
  const [loginMode, setLoginMode] = useState('password');

  // ── Password fields ─────────────────────────────────────────────────────────
  const [username, setUsername]   = useState('iorbit');
  const [password, setPassword]   = useState('iorbitpass');
  const [showPw, setShowPw]       = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // ── Phone fields ─────────────────────────────────────────────────────────────
  const [phone, setPhone]     = useState('');
  const [orgName, setOrgName] = useState('');

  // ── Shared OTP state ─────────────────────────────────────────────────────────
  // state: 'idle' | 'loading' | 'twofa' | 'emailVerify' | 'phoneOtp'
  const [state, setState]                     = useState('idle');
  const [otpValue, setOtpValue]               = useState('');
  const [showOtp, setShowOtp]                 = useState(false);
  const [pendingOrg, setPendingOrg]           = useState(null);
  const [pendingUserName, setPendingUserName] = useState(null);
  const [pendingPhone, setPendingPhone]       = useState(null);
  const [keepSignedInPending, setKeepSignedInPending] = useState(false);

  // ── Misc ─────────────────────────────────────────────────────────────────────
  const [error, setError]                     = useState(null);
  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const [resendCooldown, setResendCooldown]   = useState(0);

  // ── Forgot password flow ──────────────────────────────────────────────────
  const [forgotPwdStep, setForgotPwdStep]     = useState(null); // null | 'enterPin'
  const [forgotPwdPin, setForgotPwdPin]       = useState('');
  const [forgotPwdNewPw, setForgotPwdNewPw]   = useState('');
  const [forgotPwdConfirmPw, setForgotPwdConfirmPw] = useState('');
  const [showForgotNewPw, setShowForgotNewPw] = useState(false);
  const [forgotPwdLoading, setForgotPwdLoading] = useState(false);

  const currentLangCode  = (i18n.language || 'en').split('-')[0];
  const currentLangLabel = t(`languages.${currentLangCode}`)?.split(' ')[0] || t('languages.en').split(' ')[0];

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const startResendCooldown = () => setResendCooldown(RESEND_COOLDOWN);

  const finalizeLogin = (res, ksi) => {
    const { navTarget, navParams } = resolveNavTarget(res, username);
    login(res, { keepSignedIn: ksi, navTarget, navParams });
    navigation.replace(navTarget, navParams);
  };

  const processLoginResponse = (res, ksi = false) => {
    if (!res) return false;
    const code = res.code ? String(res.code) : null;
    const msg  = (res.message || '').toLowerCase();

    if (code === '333') {
      setPendingOrg(res.orgName || orgName);
      setPendingUserName(res.userName || username);
      startResendCooldown();
      setState('phoneOtp');
      return true;
    }
    if (code === '222' || msg.includes('2-factor') || msg.includes('2fa')) {
      setPendingOrg(res.orgName || 'UNKNOWN');
      setPendingUserName(res.userName || username);
      setKeepSignedInPending(ksi);
      startResendCooldown();
      setState('twofa');
      return true;
    }
    if (code === '111' || msg.includes('verify') || msg.includes('email')) {
      setPendingOrg(res.orgName || 'UNKNOWN');
      setPendingUserName(res.userName || username);
      startResendCooldown();
      setState('emailVerify');
      return true;
    }
    if (code === '200' && res.token) {
      finalizeLogin(res, ksi);
      return true;
    }
    return false;
  };

  // ════════════════════════════════════════════════════════════════════════════
  // LOGIN HANDLERS
  // ════════════════════════════════════════════════════════════════════════════

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

  const handleGoogleLogin = async () => {
    setError(null);
    setState('loading');
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      const idToken  = userInfo.data?.idToken || userInfo.idToken;
      if (!idToken) throw new Error('Google sign-in did not return an ID token.');

      const res = await authApi.loginGoogle(idToken);
      if (!processLoginResponse(res, keepSignedIn)) {
        throw new Error(res.message || t('auth.login_failed'));
      }
    } catch (err) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED || err.code === statusCodes.IN_PROGRESS) {
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
        { text: t('common.ok'), onPress: () => { setState('idle'); setOtpValue(''); } },
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
        await authApi.loginPhone(pendingPhone, pendingOrg);
        Alert.alert(t('common.success'), t('auth.otp_resent'));
        startResendCooldown();
      } else if (state === 'twofa') {
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
  // OTP SCREEN  (shared: twofa / emailVerify / phoneOtp)
  // ════════════════════════════════════════════════════════════════════════════

  if (state === 'twofa' || state === 'emailVerify' || state === 'phoneOtp') {
    const isEmail  = state === 'emailVerify';
    const isPhone  = state === 'phoneOtp';
    const onVerify = isEmail ? handleVerifyEmail : isPhone ? handleVerifyPhoneOtp : handleVerify2fa;

    const icon     = isEmail ? <IconMail size={32} color={T.accent} />
                   : isPhone ? <IconPhone size={32} color={T.accent} />
                   : <IconShield size={32} color={T.accent} />;
    const titleKey = isEmail ? 'auth.verify_email' : isPhone ? 'auth.verify_phone' : 'auth.two_fa';
    const hintKey  = isEmail ? 'auth.otp_email_hint' : isPhone ? 'auth.otp_phone_hint' : 'auth.otp_2fa_hint';

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.otpContent}>
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

          <View style={styles.otpHeader}>
            <View style={styles.otpIconBox}>{icon}</View>
            <Text style={styles.title}>{t(titleKey)}</Text>
            <Text style={styles.subtitle}>{t(hintKey, { org: pendingOrg })}</Text>
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
                    {showOtp
                      ? <IconEyeOff size={20} color={T.textFaint} />
                      : <IconEye size={20} color={T.textFaint} />}
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
  // PHONE SUB-FORM  (inline, no tabs)
  // ════════════════════════════════════════════════════════════════════════════

  if (loginMode === 'phone') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

            <View style={styles.otpTopRow}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => { setLoginMode('password'); setError(null); }}
              >
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
              <View style={styles.otpIconBox}>
                <IconPhone size={32} color={T.accent} />
              </View>
              <Text style={styles.title}>{t('auth.verify_phone')}</Text>
              <Text style={styles.subtitle}>{t('auth.phone_otp_hint')}</Text>
            </View>

            <View style={styles.form}>
              <Field label={t('auth.phone_number')}>
                <PhoneInput value={phone} onChangeText={setPhone} />
              </Field>

              <Field label={t('auth.organisation')}>
                <TextInput
                  value={orgName}
                  onChangeText={setOrgName}
                  placeholder={t('auth.org_placeholder')}
                  autoCapitalize="none"
                />
              </Field>

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Btn
                full size="lg"
                onPress={handlePhoneLogin}
                disabled={state === 'loading'}
                style={{ marginTop: 12 }}
              >
                {state === 'loading' ? t('auth.sending_otp') : t('auth.send_otp')}
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
          onSelect={(code) => { changeLanguage(code); setShowLocalePicker(false); }}
        />
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FORGOT PASSWORD SCREEN
  // ════════════════════════════════════════════════════════════════════════════

  if (forgotPwdStep === 'enterPin') {
    const handleResetSubmit = () => {
      if (!forgotPwdPin.trim() || !forgotPwdNewPw || !forgotPwdConfirmPw) return;
      if (forgotPwdNewPw !== forgotPwdConfirmPw) {
        Alert.alert(t('common.error'), t('auth.reset_passwords_mismatch'));
        return;
      }
      setForgotPwdLoading(true);
      authApi.resetPasswordWithPin(username.trim(), forgotPwdPin.trim(), forgotPwdNewPw, forgotPwdConfirmPw)
        .then(() => {
          setForgotPwdStep(null);
          setForgotPwdPin(''); setForgotPwdNewPw(''); setForgotPwdConfirmPw('');
          Alert.alert(t('common.success'), t('auth.reset_success'));
        })
        .catch(e => Alert.alert(t('common.error'), getApiErrorMessage(e) || t('users.reset_pin_failed')))
        .finally(() => setForgotPwdLoading(false));
    };

    const isResetValid = forgotPwdPin.trim().length >= 4 && forgotPwdNewPw.length >= 8 && forgotPwdConfirmPw.length >= 8;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

            <View style={styles.header}>
              <Logo size={40} />
              <View style={{ marginTop: 24 }}>
                <Text style={styles.title}>{t('auth.reset_pin_title')}</Text>
                <Text style={styles.subtitle}>{t('auth.reset_pin_hint')}</Text>
              </View>
            </View>

            <View style={styles.form}>
              <Field label={t('auth.reset_enter_pin')}>
                <TextInput
                  value={forgotPwdPin}
                  onChangeText={setForgotPwdPin}
                  placeholder={t('auth.reset_pin_placeholder')}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </Field>

              <Field label={t('auth.reset_new_password')}>
                <TextInput
                  value={forgotPwdNewPw}
                  onChangeText={setForgotPwdNewPw}
                  placeholder={t('auth.password_placeholder')}
                  secureTextEntry={!showForgotNewPw}
                  trailing={
                    <TouchableOpacity onPress={() => setShowForgotNewPw(v => !v)}>
                      {showForgotNewPw ? <IconEyeOff size={18} color={T.textDim} /> : <IconEye size={18} color={T.textDim} />}
                    </TouchableOpacity>
                  }
                />
              </Field>

              <Field label={t('auth.reset_confirm_password')}>
                <TextInput
                  value={forgotPwdConfirmPw}
                  onChangeText={setForgotPwdConfirmPw}
                  placeholder={t('auth.password_placeholder')}
                  secureTextEntry={!showForgotNewPw}
                />
              </Field>

              <Btn full size="lg" onPress={handleResetSubmit} disabled={!isResetValid || forgotPwdLoading} style={{ marginTop: 12 }}>
                {forgotPwdLoading ? t('auth.reset_resetting') : t('auth.reset_submit')}
              </Btn>

              <TouchableOpacity style={[styles.backBtn, { marginTop: 16 }]} onPress={() => setForgotPwdStep(null)}>
                <IconBack size={16} color={T.textDim} />
                <Text style={styles.backText}>{t('auth.back_to_login')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.poweredBy}>{t('common.powered_by')}</Text>
              <Logo size={18} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN LOGIN SCREEN  (password + or + Google + phone link)
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

          {/* Primary form — username / password */}
          <View style={styles.form}>
            <Field label={t('auth.username')}>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder={t('auth.username_placeholder')}
                autoCapitalize="none"
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
                    {showPw
                      ? <IconEyeOff size={20} color={T.textFaint} />
                      : <IconEye size={20} color={T.textFaint} />}
                  </TouchableOpacity>
                }
              />
            </Field>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => {
                  if (!username.trim()) {
                    Alert.alert(t('common.error'), t('auth.reset_username_required'));
                    return;
                  }
                  setState('loading');
                  authApi.requestPasswordReset(username.trim())
                    .then(() => { setState('idle'); setForgotPwdStep('enterPin'); })
                    .catch(e => { setState('idle'); Alert.alert(t('common.error'), getApiErrorMessage(e) || t('users.reset_pin_failed')); });
                }}
              >
                <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
              </TouchableOpacity>
            </View>

            <Btn
              full size="lg"
              onPress={handlePasswordLogin}
              disabled={isLoading}
              style={{ marginTop: 12 }}
            >
              {isLoading ? t('auth.signing_in') : t('auth.sign_in')}
            </Btn>
          </View>

          {/* ── OR divider ── */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('common.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Google button ── */}
          <TouchableOpacity
            style={[styles.googleBtn, isLoading && styles.altBtnDisabled]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={T.text} size="small" />
            ) : (
              <>
                <View style={styles.googleLogo}>
                  <Text style={styles.googleLogoText}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>{t('auth.sign_in_google')}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Phone link ── */}
          <TouchableOpacity
            style={styles.phoneLink}
            onPress={() => { setLoginMode('phone'); setError(null); }}
            disabled={isLoading}
          >
            <IconPhone size={15} color={T.accent} />
            <Text style={styles.phoneLinkText}>{t('auth.mode_phone')}</Text>
          </TouchableOpacity>

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
  container:     { flex: 1, backgroundColor: T.bg },
  scrollContent: { flexGrow: 1, padding: 24 },

  langRow: { alignItems: 'flex-end', marginBottom: 8 },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 20, borderWidth: 1, borderColor: T.borderSoft,
    backgroundColor: T.surface,
  },
  langBtnText: { fontSize: 12, fontWeight: '600', color: T.textDim },

  header:   { marginTop: 20, marginBottom: 32 },
  title:    { fontSize: 28, fontWeight: '700', color: T.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: T.textDim, marginTop: 8, lineHeight: 20 },

  form: { gap: 8 },

  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 10,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
    marginVertical: 4,
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

  // ── OR divider ───────────────────────────────────────────────────────────────
  divider: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 24, gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: T.border },
  dividerText: { fontSize: 12, color: T.textFaint, fontWeight: '500' },

  // ── Google button ─────────────────────────────────────────────────────────────
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, height: 52,
    backgroundColor: T.surface,
    borderRadius: 12, borderWidth: 1, borderColor: T.border,
  },
  altBtnDisabled: { opacity: 0.6 },
  googleLogo: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 2, elevation: 1,
  },
  googleLogoText: { fontSize: 16, fontWeight: '700', color: '#4285F4' },
  googleBtnText:  { fontSize: 15, fontWeight: '600', color: T.text },

  // ── Phone link ────────────────────────────────────────────────────────────────
  phoneLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 16, paddingVertical: 10,
  },
  phoneLinkText: { fontSize: 14, fontWeight: '500', color: T.accent },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 32, marginTop: 'auto',
  },
  poweredBy: { fontSize: 12, color: T.textFaint, fontWeight: '500' },

  // ── OTP / verify screen ───────────────────────────────────────────────────────
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
