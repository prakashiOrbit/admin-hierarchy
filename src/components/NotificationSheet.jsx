import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { IconBell } from '../icons';

export const NotificationSheet = ({ visible, onClose }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(T);

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
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('notifications.title')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>{t('common.done')}</Text>
          </TouchableOpacity>
        </View>

        {/* Empty state */}
        <View style={styles.emptyState}>
          <View style={[styles.iconCircle, { backgroundColor: T.accentSoft }]}>
            <IconBell size={28} color={T.accent} />
          </View>
          <Text style={styles.emptyTitle}>{t('notifications.all_caught_up')}</Text>
          <Text style={styles.emptyHint}>{t('notifications.empty_hint')}</Text>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    marginBottom: 32,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
  },
  emptyHint: {
    fontSize: 13,
    color: T.textDim,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
