import React from 'react';
import { View, Text, TouchableOpacity, TextInput as RNTextInput, StyleSheet, Image, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { IconSearch } from '../icons';

// --- Card ---
export const Card = ({ children, style, onPress, padding = 14 }) => {
  const { theme: T } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={[
        {
          backgroundColor: T.surface,
          borderWidth: 1,
          borderColor: T.borderSoft,
          borderRadius: 14,
          padding,
        },
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};

// --- Button ---
export const Btn = ({ children, variant = 'primary', size = 'md', onPress, full, danger, disabled, style }) => {
  const { theme: T } = useTheme();
  const sizes = {
    sm: { h: 32, px: 12, fs: 12.5 },
    md: { h: 42, px: 16, fs: 14 },
    lg: { h: 48, px: 18, fs: 15 },
  }[size];

  let bg = T.accent;
  let color = '#fff';
  let border = 'transparent';

  if (variant === 'primary') {
    bg = danger ? T.bad : T.accent;
  } else if (variant === 'ghost') {
    bg = 'transparent';
    color = danger ? T.bad : T.text;
    border = T.border;
  } else if (variant === 'tonal') {
    bg = danger ? T.badSoft : T.accentSoft;
    color = danger ? T.bad : T.accent;
  } else if (variant === 'surface') {
    bg = T.surface;
    color = T.text;
    border = T.borderSoft;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        {
          minHeight: sizes.h,
          paddingVertical: 4,
          paddingHorizontal: sizes.px,
          borderRadius: 12,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          width: full ? '100%' : undefined,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={{ color, fontSize: sizes.fs, fontWeight: '600', textAlign: 'center', flexShrink: 1 }}>{children}</Text>
      ) : (
        React.Children.map(children, child => {
          if (typeof child === 'string') {
            return <Text style={{ color, fontSize: sizes.fs, fontWeight: '600', textAlign: 'center', flexShrink: 1 }}>{child}</Text>;
          }
          return child;
        })
      )}
    </TouchableOpacity>
  );
};

// --- TextInput ---
export const TextInput = ({ value, onChangeText, placeholder, secureTextEntry, leading, trailing, error, style, containerStyle, ...props }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  return (
    <View style={[
      styles.inputContainer,
      { borderColor: error ? T.bad : T.borderSoft },
      containerStyle
    ]}>
      {leading && <View style={{ marginEnd: 8 }}>{leading}</View>}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.textFaint}
        secureTextEntry={secureTextEntry}
        style={[styles.input, style]}
        {...props}
      />
      {trailing && <View style={{ marginStart: 8 }}>{trailing}</View>}
    </View>
  );
};

// --- Field ---
export const Field = ({ label, children, hint, error }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? (
        <Text style={[styles.hint, { color: T.bad }]}>{error}</Text>
      ) : (
        hint && <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
};

// --- Logo ---
export const Logo = ({ size = 24 }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image 
        source={require('../assets/iorbitdigitaltechnologies_logo.jpeg')} 
        style={{ width: size, height: size, borderRadius: size * 0.2 }}
        resizeMode="contain"
      />
      <Text style={{ fontSize: size * 0.7, fontWeight: '700', color: T.text, marginStart: 10 }}>
        iOrbit <Text style={{ color: T.textDim, fontWeight: '500' }}>{t('common.admin')}</Text>
      </Text>
    </View>
  );
};

// --- Avatar ---
export const Avatar = ({ initials, name, size = 36, color }) => {
  const { theme: T } = useTheme();
  const bgColor = color || T.accent;
  const displayInitials = initials || (name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?');
  
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size * 0.32,
      backgroundColor: bgColor,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '700' }}>{displayInitials}</Text>
    </View>
  );
};

// --- Section Header ---
export const SectionHeader = ({ title, count, subtitle }) => {
  const { theme: T } = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 1 }}>{title.toUpperCase()}</Text>
        {count !== undefined && (
          <Text style={{ fontSize: 11, color: T.textFaint, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>{count}</Text>
        )}
      </View>
      {subtitle && <Text style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>{subtitle}</Text>}
    </View>
  );
};

// --- Role Badge ---
export const RoleBadge = ({ role }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const roleMap = {
    PLATFORM_ADMIN: { label: t('roles.PLATFORM_ADMIN'), color: '#A78BFA', bg: 'rgba(167,139,250,.14)' },
    ORG_OWNER:      { label: t('roles.ORG_OWNER'), color: '#818CF8', bg: 'rgba(129,140,248,.14)' },
    ORG_ADMIN:      { label: t('roles.ORG_ADMIN'), color: '#60A5FA', bg: 'rgba(96,165,250,.14)' },
    HOSP_OWNER:     { label: t('roles.HOSP_OWNER'), color: '#2DD4BF', bg: 'rgba(45,212,191,.14)' },
    HOSP_ADMIN:     { label: t('roles.HOSP_ADMIN'), color: '#22D3EE', bg: 'rgba(34,211,238,.14)' },
  };
  const r = roleMap[role] || { label: role, color: T.textDim, bg: T.surface2 };

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: r.bg,
    }}>
      <View style={{ width: 5, height: 5, borderRadius: 99, backgroundColor: r.color }} />
      <Text style={{
        color: r.color,
        fontSize: 9.5,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      }}>{r.label}</Text>
    </View>
  );
};

// --- Search Bar ---
export const SearchBar = ({ placeholder, value, onChange, onChangeText, trailing }) => {
  const { theme: T } = useTheme();
  const handleChange = onChangeText || onChange;
  
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: T.surface,
      borderWidth: 1,
      borderColor: T.borderSoft,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
    }}>
      <IconSearch size={18} color={T.textDim} />
      <RNTextInput 
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={T.textFaint}
        style={{ flex: 1, color: T.text, fontSize: 14, marginStart: 8, padding: 0 }}
      />
      {trailing}
    </View>
  );
};

// --- Chip ---
export const Chip = ({ children, active, on, color, onPress, onClick }) => {
  const { theme: T } = useTheme();
  const isActive = active || on;
  const handlePress = onPress || onClick;
  
  const bg = isActive ? (color || T.accent) : T.surface;
  const border = isActive ? (color || T.accent) : T.borderSoft;
  const textColor = isActive ? '#fff' : T.text;

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        marginEnd: 8,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>{children}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (T) => StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    color: T.text,
    fontSize: 14,
    padding: 0,
  },
  label: {
    fontSize: 11,
    color: T.textDim,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 11,
    color: T.textFaint,
    marginTop: 4,
  },
});

export const getGreeting = (t, name) => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return t('dashboard.good_morning', { name });
  if (hour === 12) return t('dashboard.good_noon', { name });
  if (hour > 12 && hour < 17) return t('dashboard.good_afternoon', { name });
  return t('dashboard.good_evening', { name });
};
