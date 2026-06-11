import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { Btn } from './Shared';

const daysInMonth = (m, y) => new Date(y, m, 0).getDate();

export const DatePickerModal = ({ visible, value, onConfirm, onCancel, title }) => {
  const { t, i18n } = useTranslation();
  const { theme: T } = useTheme();
  const s = makeStyles(T);
  const currentYear = new Date().getFullYear();

  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(currentYear - 30);

  useEffect(() => {
    if (!visible) return;
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      setYear(y); setMonth(m); setDay(d);
    } else {
      setYear(currentYear - 30); setMonth(1); setDay(1);
    }
  }, [visible]);

  const clamp = (d, m, y) => Math.min(d, daysInMonth(m, y));

  const nudgeDay = (n) =>
    setDay(prev => Math.min(Math.max(1, prev + n), daysInMonth(month, year)));

  const nudgeMonth = (n) =>
    setMonth(prev => {
      const nm = ((prev - 1 + n + 12) % 12) + 1;
      setDay(d => clamp(d, nm, year));
      return nm;
    });

  const nudgeYear = (n) =>
    setYear(prev => {
      const ny = Math.min(Math.max(1900, prev + n), currentYear);
      setDay(d => clamp(d, month, ny));
      return ny;
    });

  const confirm = () =>
    onConfirm(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

  const Col = ({ label, display, onUp, onDown }) => (
    <View style={s.col}>
      <Text style={s.colLabel}>{label}</Text>
      <TouchableOpacity style={s.arrowBtn} onPress={onUp}>
        <Text style={s.arrow}>▲</Text>
      </TouchableOpacity>
      <View style={s.valueBox}>
        <Text style={s.valueText}>{display}</Text>
      </View>
      <TouchableOpacity style={s.arrowBtn} onPress={onDown}>
        <Text style={s.arrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onCancel}>
        <TouchableOpacity activeOpacity={1}>
          <View style={s.sheet}>
            <Text style={s.title}>{title || t('entity.dob')}</Text>
            <View style={s.spinners}>
              <Col
                label={t('date_picker.day')}
                display={String(day).padStart(2, '0')}
                onUp={() => nudgeDay(1)}
                onDown={() => nudgeDay(-1)}
              />
              <View style={s.sep} />
              <Col
                label={t('date_picker.month')}
                display={new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(new Date(2000, month - 1, 1))}
                onUp={() => nudgeMonth(1)}
                onDown={() => nudgeMonth(-1)}
              />
              <View style={s.sep} />
              <Col
                label={t('date_picker.year')}
                display={String(year)}
                onUp={() => nudgeYear(1)}
                onDown={() => nudgeYear(-1)}
              />
            </View>
            <View style={s.actions}>
              <Btn variant="surface" style={{ flex: 1 }} onPress={onCancel}>{t('common.cancel')}</Btn>
              <Btn variant="primary" style={{ flex: 1 }} onPress={confirm}>{t('common.done')}</Btn>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const makeStyles = (T) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: T.surface, borderRadius: 16, padding: 20 },
  title: { fontSize: 15, fontWeight: '700', color: T.text, textAlign: 'center', marginBottom: 20 },
  spinners: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20 },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  colLabel: { fontSize: 11, color: T.textFaint, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
  arrowBtn: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center' },
  arrow: { fontSize: 20, color: T.accent },
  valueBox: {
    width: 70, height: 44, borderRadius: 10,
    backgroundColor: T.surface2 || T.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  valueText: { fontSize: 15, fontWeight: '700', color: T.text },
  sep: { width: 1, height: 90, backgroundColor: T.borderSoft },
  actions: { flexDirection: 'row', gap: 10 },
});
