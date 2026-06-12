import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { IconUser, IconBuilding, IconCareSite } from '../icons';

export const ProfileSheet = ({ visible, onClose, user }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(T);

  const rows = [
    { icon: <IconUser size={16} color={T.textDim} />, label: t('settings.username'), value: user?.userName },
    { icon: <IconBuilding size={16} color={T.textDim} />, label: t('settings.organisation'), value: user?.orgName },
    user?.careSiteCode && { icon: <IconCareSite size={16} color={T.textDim} />, label: t('settings.caresite_code'), value: user.careSiteCode },
  ].filter(Boolean);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.profile')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>{t('common.done')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.avatar}>
          <IconUser size={36} color={T.accent} />
        </View>

        <Text style={styles.displayName}>{user?.userName}</Text>

        <View style={styles.infoCard}>
          {rows.map((row, i) => (
            <View key={i} style={[styles.row, i > 0 && styles.rowBorder]}>
              <View style={styles.rowIcon}>{row.icon}</View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value || '—'}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (T) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: T.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: T.borderSoft,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: T.text,
  },
  closeBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  closeText: {
    fontSize: 15,
    color: T.accent,
    fontWeight: '600',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: T.surface,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accentSoft || T.accent,
    marginBottom: 12,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoCard: {
    backgroundColor: T.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: T.borderSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: T.borderSoft,
  },
  rowIcon: {},
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    color: T.textFaint,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
