import React from 'react';
import { View, Text, TouchableOpacity, TextInput as RNTextInput, StyleSheet, Image, Platform } from 'react-native';
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
          borderRadius: 16, 
          padding,
          borderWidth: 1,
          borderColor: T.borderSoft,
        }, 
        style
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
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          height: sizes.h,
          paddingHorizontal: sizes.px,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          opacity: disabled ? 0.5 : 1,
          width: full ? '100%' : 'auto',
        },
        style
      ]}
    >
      <Text style={{ color, fontSize: sizes.fs, fontWeight: '600' }}>{children}</Text>
    </TouchableOpacity>
  );
};

// --- TextInput ---
export const TextInput = ({ value, onChangeText, placeholder, secureTextEntry, leading, trailing, error }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  return (
    <View style={[styles.inputContainer, error && { borderColor: T.bad }]}>
      {leading && <View style={{ marginRight: 8 }}>{leading}</View>}
      <RNTextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.textFaint}
        secureTextEntry={secureTextEntry}
      />
      {trailing && <View style={{ marginLeft: 8 }}>{trailing}</View>}
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
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image 
        source={require('../assets/iorbitdigitaltechnologies_logo.jpeg')} 
        style={{ width: size, height: size, borderRadius: 4 }} 
      />
      <Text style={{ marginLeft: 8, fontSize: size * 0.7, fontWeight: '700', color: T.text }}>
        iOrbit <Text style={{ color: T.textDim, fontWeight: '500' }}>Admin</Text>
      </Text>
    </View>
  );
};

// --- Avatar ---
export const Avatar = ({ initials, size = 36, color }) => {
  const { theme: T } = useTheme();
  const bgColor = color || T.accent;
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 3,
      backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center'
    }}>
      <Text style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '700' }}>{initials}</Text>
    </View>
  );
};

// --- Section Header ---
export const SectionHeader = ({ title, count }) => {
  const { theme: T } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 1 }}>{title.toUpperCase()}</Text>
      {count !== undefined && (
        <Text style={{ fontSize: 11, color: T.textFaint }}>{count}</Text>
      )}
    </View>
  );
};

// --- Role Badge ---
export const RoleBadge = ({ role }) => {
  const { theme: T } = useTheme();
  const roleMap = {
    PLATFORM_ADMIN: { label: 'PLATFORM', color: '#A78BFA', bg: 'rgba(167,139,250,.14)' },
    ORG_OWNER:      { label: 'ORG OWNER', color: '#818CF8', bg: 'rgba(129,140,248,.14)' },
    ORG_ADMIN:      { label: 'ORG ADMIN', color: '#60A5FA', bg: 'rgba(96,165,250,.14)' },
    HOSP_OWNER:     { label: 'HOSP OWNER', color: '#2DD4BF', bg: 'rgba(45,212,191,.14)' },
    HOSP_ADMIN:     { label: 'HOSP ADMIN', color: '#22D3EE', bg: 'rgba(34,211,238,.14)' },
  };
  const r = roleMap[role] || { label: role, color: T.textDim, bg: T.surface2 };

  return (
    <View style={{
      backgroundColor: r.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
      borderWidth: 1, borderColor: 'transparent'
    }}>
      <Text style={{ color: r.color, fontSize: 10, fontWeight: '700' }}>{r.label}</Text>
    </View>
  );
};

// --- Search Bar ---
export const SearchBar = ({ placeholder, value, onChange, trailing }) => {
  const { theme: T } = useTheme();
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface,
      borderRadius: 12, paddingHorizontal: 10, height: 40, borderWidth: 1, borderColor: T.borderSoft
    }}>
      <IconSearch size={18} color={T.textDim} />
      <RNTextInput
        style={{ flex: 1, marginLeft: 8, color: T.text, fontSize: 14 }}
        placeholder={placeholder || "Search"}
        placeholderTextColor={T.textFaint}
        value={value}
        onChangeText={onChange}
      />
      {trailing}
    </View>
  );
};

// --- Chip ---
export const Chip = ({ children, on, color, onClick }) => {
  const { theme: T } = useTheme();
  const bg = on ? (color || T.accent) : T.surface;
  const border = on ? (color || T.accent) : T.borderSoft;
  const textColor = on ? '#fff' : T.text;

  return (
    <TouchableOpacity 
      onPress={onClick}
      style={{
        backgroundColor: bg, paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, borderWidth: 1, borderColor: border, marginRight: 8
      }}
    >
      <Text style={{ color: textColor, fontSize: 12, fontWeight: '600' }}>{children}</Text>
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
    borderColor: T.borderSoft,
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
