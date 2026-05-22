import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { IconCheck } from '../icons';

export const LanguageSheet = ({ visible, onClose, currentLanguage, onSelect }) => {
  const { theme: T } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(T);

  const languages = [
    { code: 'en', label: t('languages.en') },
    { code: 'ar', label: t('languages.ar') },
    { code: 'fr', label: t('languages.fr') },
    { code: 'de', label: t('languages.de') },
    { code: 'it', label: t('languages.it') },
    { code: 'nl', label: t('languages.nl') },
    { code: 'cs', label: t('languages.cs') },
    { code: 'rm', label: t('languages.rm') },
  ];

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
          <Text style={styles.title}>{t('settings.select_language')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>{t('common.done')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={styles.langItem}
                onPress={() => {
                  onSelect(lang.code);
                  onClose();
                }}
              >
                <Text style={[styles.langLabel, isSelected && styles.selectedLabel]}>
                  {lang.label}
                </Text>
                {isSelected && <IconCheck size={20} color={T.accent} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
    maxHeight: '70%',
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
    marginBottom: 20,
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
  list: {
    marginBottom: 10,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.borderSoft,
  },
  langLabel: {
    fontSize: 15,
    color: T.text,
    fontWeight: '500',
  },
  selectedLabel: {
    color: T.accent,
    fontWeight: '700',
  },
});
