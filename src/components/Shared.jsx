import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput as RNTextInput, StyleSheet, Image, Platform, Modal, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { IconSearch } from '../icons';

const DEFAULT_DIAL = '+91';

const DIAL_CODES = [
  { code: '+93',   flag: '🇦🇫', label: 'Afghanistan' },
  { code: '+355',  flag: '🇦🇱', label: 'Albania' },
  { code: '+213',  flag: '🇩🇿', label: 'Algeria' },
  { code: '+376',  flag: '🇦🇩', label: 'Andorra' },
  { code: '+244',  flag: '🇦🇴', label: 'Angola' },
  { code: '+1268', flag: '🇦🇬', label: 'Antigua and Barbuda' },
  { code: '+54',   flag: '🇦🇷', label: 'Argentina' },
  { code: '+374',  flag: '🇦🇲', label: 'Armenia' },
  { code: '+61',   flag: '🇦🇺', label: 'Australia' },
  { code: '+43',   flag: '🇦🇹', label: 'Austria' },
  { code: '+994',  flag: '🇦🇿', label: 'Azerbaijan' },
  { code: '+1242', flag: '🇧🇸', label: 'Bahamas' },
  { code: '+973',  flag: '🇧🇭', label: 'Bahrain' },
  { code: '+880',  flag: '🇧🇩', label: 'Bangladesh' },
  { code: '+1246', flag: '🇧🇧', label: 'Barbados' },
  { code: '+375',  flag: '🇧🇾', label: 'Belarus' },
  { code: '+32',   flag: '🇧🇪', label: 'Belgium' },
  { code: '+501',  flag: '🇧🇿', label: 'Belize' },
  { code: '+229',  flag: '🇧🇯', label: 'Benin' },
  { code: '+975',  flag: '🇧🇹', label: 'Bhutan' },
  { code: '+591',  flag: '🇧🇴', label: 'Bolivia' },
  { code: '+387',  flag: '🇧🇦', label: 'Bosnia and Herzegovina' },
  { code: '+267',  flag: '🇧🇼', label: 'Botswana' },
  { code: '+55',   flag: '🇧🇷', label: 'Brazil' },
  { code: '+673',  flag: '🇧🇳', label: 'Brunei' },
  { code: '+359',  flag: '🇧🇬', label: 'Bulgaria' },
  { code: '+226',  flag: '🇧🇫', label: 'Burkina Faso' },
  { code: '+257',  flag: '🇧🇮', label: 'Burundi' },
  { code: '+238',  flag: '🇨🇻', label: 'Cabo Verde' },
  { code: '+855',  flag: '🇰🇭', label: 'Cambodia' },
  { code: '+237',  flag: '🇨🇲', label: 'Cameroon' },
  { code: '+1',    flag: '🇨🇦', label: 'Canada' },
  { code: '+236',  flag: '🇨🇫', label: 'Central African Republic' },
  { code: '+235',  flag: '🇹🇩', label: 'Chad' },
  { code: '+56',   flag: '🇨🇱', label: 'Chile' },
  { code: '+86',   flag: '🇨🇳', label: 'China' },
  { code: '+57',   flag: '🇨🇴', label: 'Colombia' },
  { code: '+269',  flag: '🇰🇲', label: 'Comoros' },
  { code: '+242',  flag: '🇨🇬', label: 'Congo' },
  { code: '+243',  flag: '🇨🇩', label: 'Congo (DRC)' },
  { code: '+506',  flag: '🇨🇷', label: 'Costa Rica' },
  { code: '+385',  flag: '🇭🇷', label: 'Croatia' },
  { code: '+53',   flag: '🇨🇺', label: 'Cuba' },
  { code: '+357',  flag: '🇨🇾', label: 'Cyprus' },
  { code: '+420',  flag: '🇨🇿', label: 'Czech Republic' },
  { code: '+45',   flag: '🇩🇰', label: 'Denmark' },
  { code: '+253',  flag: '🇩🇯', label: 'Djibouti' },
  { code: '+1767', flag: '🇩🇲', label: 'Dominica' },
  { code: '+1809', flag: '🇩🇴', label: 'Dominican Republic' },
  { code: '+593',  flag: '🇪🇨', label: 'Ecuador' },
  { code: '+20',   flag: '🇪🇬', label: 'Egypt' },
  { code: '+503',  flag: '🇸🇻', label: 'El Salvador' },
  { code: '+240',  flag: '🇬🇶', label: 'Equatorial Guinea' },
  { code: '+291',  flag: '🇪🇷', label: 'Eritrea' },
  { code: '+372',  flag: '🇪🇪', label: 'Estonia' },
  { code: '+268',  flag: '🇸🇿', label: 'Eswatini' },
  { code: '+251',  flag: '🇪🇹', label: 'Ethiopia' },
  { code: '+679',  flag: '🇫🇯', label: 'Fiji' },
  { code: '+358',  flag: '🇫🇮', label: 'Finland' },
  { code: '+33',   flag: '🇫🇷', label: 'France' },
  { code: '+241',  flag: '🇬🇦', label: 'Gabon' },
  { code: '+220',  flag: '🇬🇲', label: 'Gambia' },
  { code: '+995',  flag: '🇬🇪', label: 'Georgia' },
  { code: '+49',   flag: '🇩🇪', label: 'Germany' },
  { code: '+233',  flag: '🇬🇭', label: 'Ghana' },
  { code: '+30',   flag: '🇬🇷', label: 'Greece' },
  { code: '+1473', flag: '🇬🇩', label: 'Grenada' },
  { code: '+502',  flag: '🇬🇹', label: 'Guatemala' },
  { code: '+224',  flag: '🇬🇳', label: 'Guinea' },
  { code: '+245',  flag: '🇬🇼', label: 'Guinea-Bissau' },
  { code: '+592',  flag: '🇬🇾', label: 'Guyana' },
  { code: '+509',  flag: '🇭🇹', label: 'Haiti' },
  { code: '+504',  flag: '🇭🇳', label: 'Honduras' },
  { code: '+36',   flag: '🇭🇺', label: 'Hungary' },
  { code: '+354',  flag: '🇮🇸', label: 'Iceland' },
  { code: '+91',   flag: '🇮🇳', label: 'India' },
  { code: '+62',   flag: '🇮🇩', label: 'Indonesia' },
  { code: '+98',   flag: '🇮🇷', label: 'Iran' },
  { code: '+964',  flag: '🇮🇶', label: 'Iraq' },
  { code: '+353',  flag: '🇮🇪', label: 'Ireland' },
  { code: '+972',  flag: '🇮🇱', label: 'Israel' },
  { code: '+39',   flag: '🇮🇹', label: 'Italy' },
  { code: '+1876', flag: '🇯🇲', label: 'Jamaica' },
  { code: '+81',   flag: '🇯🇵', label: 'Japan' },
  { code: '+962',  flag: '🇯🇴', label: 'Jordan' },
  { code: '+7',    flag: '🇰🇿', label: 'Kazakhstan' },
  { code: '+254',  flag: '🇰🇪', label: 'Kenya' },
  { code: '+686',  flag: '🇰🇮', label: 'Kiribati' },
  { code: '+383',  flag: '🇽🇰', label: 'Kosovo' },
  { code: '+965',  flag: '🇰🇼', label: 'Kuwait' },
  { code: '+996',  flag: '🇰🇬', label: 'Kyrgyzstan' },
  { code: '+856',  flag: '🇱🇦', label: 'Laos' },
  { code: '+371',  flag: '🇱🇻', label: 'Latvia' },
  { code: '+961',  flag: '🇱🇧', label: 'Lebanon' },
  { code: '+266',  flag: '🇱🇸', label: 'Lesotho' },
  { code: '+231',  flag: '🇱🇷', label: 'Liberia' },
  { code: '+218',  flag: '🇱🇾', label: 'Libya' },
  { code: '+423',  flag: '🇱🇮', label: 'Liechtenstein' },
  { code: '+370',  flag: '🇱🇹', label: 'Lithuania' },
  { code: '+352',  flag: '🇱🇺', label: 'Luxembourg' },
  { code: '+261',  flag: '🇲🇬', label: 'Madagascar' },
  { code: '+265',  flag: '🇲🇼', label: 'Malawi' },
  { code: '+60',   flag: '🇲🇾', label: 'Malaysia' },
  { code: '+960',  flag: '🇲🇻', label: 'Maldives' },
  { code: '+223',  flag: '🇲🇱', label: 'Mali' },
  { code: '+356',  flag: '🇲🇹', label: 'Malta' },
  { code: '+692',  flag: '🇲🇭', label: 'Marshall Islands' },
  { code: '+222',  flag: '🇲🇷', label: 'Mauritania' },
  { code: '+230',  flag: '🇲🇺', label: 'Mauritius' },
  { code: '+52',   flag: '🇲🇽', label: 'Mexico' },
  { code: '+691',  flag: '🇫🇲', label: 'Micronesia' },
  { code: '+373',  flag: '🇲🇩', label: 'Moldova' },
  { code: '+377',  flag: '🇲🇨', label: 'Monaco' },
  { code: '+976',  flag: '🇲🇳', label: 'Mongolia' },
  { code: '+382',  flag: '🇲🇪', label: 'Montenegro' },
  { code: '+212',  flag: '🇲🇦', label: 'Morocco' },
  { code: '+258',  flag: '🇲🇿', label: 'Mozambique' },
  { code: '+95',   flag: '🇲🇲', label: 'Myanmar' },
  { code: '+264',  flag: '🇳🇦', label: 'Namibia' },
  { code: '+674',  flag: '🇳🇷', label: 'Nauru' },
  { code: '+977',  flag: '🇳🇵', label: 'Nepal' },
  { code: '+31',   flag: '🇳🇱', label: 'Netherlands' },
  { code: '+64',   flag: '🇳🇿', label: 'New Zealand' },
  { code: '+505',  flag: '🇳🇮', label: 'Nicaragua' },
  { code: '+227',  flag: '🇳🇪', label: 'Niger' },
  { code: '+234',  flag: '🇳🇬', label: 'Nigeria' },
  { code: '+389',  flag: '🇲🇰', label: 'North Macedonia' },
  { code: '+47',   flag: '🇳🇴', label: 'Norway' },
  { code: '+968',  flag: '🇴🇲', label: 'Oman' },
  { code: '+92',   flag: '🇵🇰', label: 'Pakistan' },
  { code: '+680',  flag: '🇵🇼', label: 'Palau' },
  { code: '+970',  flag: '🇵🇸', label: 'Palestine' },
  { code: '+507',  flag: '🇵🇦', label: 'Panama' },
  { code: '+675',  flag: '🇵🇬', label: 'Papua New Guinea' },
  { code: '+595',  flag: '🇵🇾', label: 'Paraguay' },
  { code: '+51',   flag: '🇵🇪', label: 'Peru' },
  { code: '+63',   flag: '🇵🇭', label: 'Philippines' },
  { code: '+48',   flag: '🇵🇱', label: 'Poland' },
  { code: '+351',  flag: '🇵🇹', label: 'Portugal' },
  { code: '+974',  flag: '🇶🇦', label: 'Qatar' },
  { code: '+40',   flag: '🇷🇴', label: 'Romania' },
  { code: '+7',    flag: '🇷🇺', label: 'Russia' },
  { code: '+250',  flag: '🇷🇼', label: 'Rwanda' },
  { code: '+1869', flag: '🇰🇳', label: 'Saint Kitts and Nevis' },
  { code: '+1758', flag: '🇱🇨', label: 'Saint Lucia' },
  { code: '+1784', flag: '🇻🇨', label: 'Saint Vincent and the Grenadines' },
  { code: '+685',  flag: '🇼🇸', label: 'Samoa' },
  { code: '+378',  flag: '🇸🇲', label: 'San Marino' },
  { code: '+239',  flag: '🇸🇹', label: 'Sao Tome and Principe' },
  { code: '+966',  flag: '🇸🇦', label: 'Saudi Arabia' },
  { code: '+221',  flag: '🇸🇳', label: 'Senegal' },
  { code: '+381',  flag: '🇷🇸', label: 'Serbia' },
  { code: '+248',  flag: '🇸🇨', label: 'Seychelles' },
  { code: '+232',  flag: '🇸🇱', label: 'Sierra Leone' },
  { code: '+65',   flag: '🇸🇬', label: 'Singapore' },
  { code: '+421',  flag: '🇸🇰', label: 'Slovakia' },
  { code: '+386',  flag: '🇸🇮', label: 'Slovenia' },
  { code: '+677',  flag: '🇸🇧', label: 'Solomon Islands' },
  { code: '+252',  flag: '🇸🇴', label: 'Somalia' },
  { code: '+27',   flag: '🇿🇦', label: 'South Africa' },
  { code: '+211',  flag: '🇸🇸', label: 'South Sudan' },
  { code: '+34',   flag: '🇪🇸', label: 'Spain' },
  { code: '+94',   flag: '🇱🇰', label: 'Sri Lanka' },
  { code: '+249',  flag: '🇸🇩', label: 'Sudan' },
  { code: '+597',  flag: '🇸🇷', label: 'Suriname' },
  { code: '+46',   flag: '🇸🇪', label: 'Sweden' },
  { code: '+41',   flag: '🇨🇭', label: 'Switzerland' },
  { code: '+963',  flag: '🇸🇾', label: 'Syria' },
  { code: '+886',  flag: '🇹🇼', label: 'Taiwan' },
  { code: '+992',  flag: '🇹🇯', label: 'Tajikistan' },
  { code: '+255',  flag: '🇹🇿', label: 'Tanzania' },
  { code: '+66',   flag: '🇹🇭', label: 'Thailand' },
  { code: '+670',  flag: '🇹🇱', label: 'Timor-Leste' },
  { code: '+228',  flag: '🇹🇬', label: 'Togo' },
  { code: '+676',  flag: '🇹🇴', label: 'Tonga' },
  { code: '+1868', flag: '🇹🇹', label: 'Trinidad and Tobago' },
  { code: '+216',  flag: '🇹🇳', label: 'Tunisia' },
  { code: '+90',   flag: '🇹🇷', label: 'Turkey' },
  { code: '+993',  flag: '🇹🇲', label: 'Turkmenistan' },
  { code: '+688',  flag: '🇹🇻', label: 'Tuvalu' },
  { code: '+256',  flag: '🇺🇬', label: 'Uganda' },
  { code: '+380',  flag: '🇺🇦', label: 'Ukraine' },
  { code: '+971',  flag: '🇦🇪', label: 'UAE' },
  { code: '+44',   flag: '🇬🇧', label: 'United Kingdom' },
  { code: '+1',    flag: '🇺🇸', label: 'USA' },
  { code: '+598',  flag: '🇺🇾', label: 'Uruguay' },
  { code: '+998',  flag: '🇺🇿', label: 'Uzbekistan' },
  { code: '+678',  flag: '🇻🇺', label: 'Vanuatu' },
  { code: '+379',  flag: '🇻🇦', label: 'Vatican City' },
  { code: '+58',   flag: '🇻🇪', label: 'Venezuela' },
  { code: '+84',   flag: '🇻🇳', label: 'Vietnam' },
  { code: '+967',  flag: '🇾🇪', label: 'Yemen' },
  { code: '+260',  flag: '🇿🇲', label: 'Zambia' },
  { code: '+263',  flag: '🇿🇼', label: 'Zimbabwe' },
];

const parsePhone = (value) => {
  if (!value) return { dialCode: DEFAULT_DIAL, number: '' };
  const sorted = [...DIAL_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const d of sorted) {
    if (value.startsWith(d.code)) {
      return { dialCode: d.code, number: value.slice(d.code.length).replace(/^\s+/, '') };
    }
  }
  return { dialCode: DEFAULT_DIAL, number: value };
};

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
  }[size] ?? { h: 42, px: 16, fs: 14 };

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
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, style]}
        {...props}
      />
      {trailing && <View style={{ marginStart: 8 }}>{trailing}</View>}
    </View>
  );
};

// --- PhoneInput ---
export const PhoneInput = ({ value, onChangeText, error, containerStyle }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const init = parsePhone(value);
  const [dialCode, setDialCode] = useState(init.dialCode);
  const [number, setNumber] = useState(init.number);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const { dialCode: d, number: n } = parsePhone(value);
    if (d !== dialCode) setDialCode(d);
    if (n !== number) setNumber(n);
  }, [value]);

  const emit = (dial, num) => onChangeText?.(num ? `${dial}${num}` : '');

  const handleDialSelect = (code) => {
    setDialCode(code);
    setOpen(false);
    setSearch('');
    emit(code, number);
  };

  const handleNumberChange = (text) => {
    setNumber(text);
    emit(dialCode, text);
  };

  const filtered = search
    ? DIAL_CODES.filter(d =>
        d.label.toLowerCase().includes(search.toLowerCase()) || d.code.includes(search)
      )
    : DIAL_CODES;

  const selected = DIAL_CODES.find(d => d.code === dialCode) || DIAL_CODES[0];

  return (
    <>
      <View style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: T.surface,
          borderWidth: 1,
          borderColor: error ? T.bad : T.borderSoft,
          borderRadius: 12,
          height: 44,
          overflow: 'hidden',
        },
        containerStyle,
      ]}>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 10,
            height: '100%',
            borderRightWidth: 1,
            borderRightColor: T.borderSoft,
          }}
        >
          <Text style={{ fontSize: 16 }}>{selected.flag}</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: T.text }}>{dialCode}</Text>
          <Text style={{ fontSize: 10, color: T.textFaint }}>▾</Text>
        </TouchableOpacity>
        <RNTextInput
          value={number}
          onChangeText={handleNumberChange}
          placeholder="00000 00000"
          placeholderTextColor={T.textFaint}
          keyboardType="phone-pad"
          style={{ flex: 1, color: T.text, fontSize: 14, paddingHorizontal: 10, padding: 0 }}
        />
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => { setOpen(false); setSearch(''); }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => { setOpen(false); setSearch(''); }}
        >
          <TouchableOpacity activeOpacity={1} style={{ backgroundColor: T.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: T.borderSoft }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: T.text, marginBottom: 12 }}>{t('phone.select_country')}</Text>
              <RNTextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t('phone.search_placeholder')}
                placeholderTextColor={T.textFaint}
                style={{
                  backgroundColor: T.surface,
                  borderWidth: 1,
                  borderColor: T.borderSoft,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  height: 40,
                  color: T.text,
                  fontSize: 14,
                }}
              />
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {filtered.map(d => (
                <TouchableOpacity
                  key={d.code}
                  onPress={() => handleDialSelect(d.code)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: d.code === dialCode ? T.accentSoft : 'transparent',
                    gap: 12,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{d.flag}</Text>
                  <Text style={{ flex: 1, fontSize: 14, color: T.text }}>{d.label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: T.accent }}>{d.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// --- Field ---
export const Field = ({ label, children, hint, error, required }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={{ color: T.bad, fontSize: 14, fontWeight: '700', marginLeft: 3, lineHeight: 18 }}> *</Text>}
      </View>
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
    CARESITE_OWNER:     { label: t('roles.CARESITE_OWNER'), color: '#2DD4BF', bg: 'rgba(45,212,191,.14)' },
    CARESITE_ADMIN:     { label: t('roles.CARESITE_ADMIN'), color: '#22D3EE', bg: 'rgba(34,211,238,.14)' },
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
