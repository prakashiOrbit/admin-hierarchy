import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const StatusPill = ({ status }) => {
  const { theme: T } = useTheme();
  const map = {
    ACTIVE:    { color: T.good, bg: T.goodSoft, label: 'ACTIVE' },
    INACTIVE:  { color: T.bad,  bg: T.badSoft, label: 'INACTIVE' },
    PENDING:   { color: T.warn, bg: 'rgba(245,158,11,.12)', label: 'PENDING' },
  };
  const s = map[status] || { color: T.textDim, bg: 'rgba(138,149,165,.1)', label: status };
  
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.color }]}>{s.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
