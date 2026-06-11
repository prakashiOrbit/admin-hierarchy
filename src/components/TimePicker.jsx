import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, ScrollView,
  TouchableOpacity, TouchableWithoutFeedback, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { IconClock } from '../icons';

const ITEM_H = 48;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2); // 2 items of padding top/bottom

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const DrumColumn = ({ items, initialIndex, onSettle, scrollRef }) => {
  const { theme: T } = useTheme();

  const handleEnd = useCallback((e) => {
    const raw = e.nativeEvent.contentOffset.y;
    const idx = Math.round(raw / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    onSettle(clamped);
  }, [items.length, onSettle]);

  return (
    <View style={styles.drumWrap}>
      {/* centre highlight band */}
      <View pointerEvents="none" style={[styles.band, { backgroundColor: T.accentSoft, borderColor: T.accent + '55' }]} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={handleEnd}
        onScrollEndDrag={handleEnd}
        contentContainerStyle={{ paddingVertical: PAD * ITEM_H }}
        scrollEventThrottle={16}
      >
        {items.map((label) => (
          <View key={label} style={styles.drumItem}>
            <Text style={[styles.drumText, { color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}>
              {label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export const TimePicker = ({ value, onChange }) => {
  const { t } = useTranslation();
  const { theme: T } = useTheme();
  const insets = useSafeAreaInsets();

  const [open, setOpen] = useState(false);
  const [tempH, setTempH] = useState(0);
  const [tempM, setTempM] = useState(0);

  const hRef = useRef(null);
  const mRef = useRef(null);

  const openPicker = () => {
    const parts = (value || '00:00').split(':');
    const h = Math.max(0, Math.min(23, parseInt(parts[0]) || 0));
    const m = Math.max(0, Math.min(59, parseInt(parts[1]) || 0));
    setTempH(h);
    setTempM(m);
    setOpen(true);
    setTimeout(() => {
      hRef.current?.scrollTo({ y: h * ITEM_H, animated: false });
      mRef.current?.scrollTo({ y: m * ITEM_H, animated: false });
    }, 80);
  };

  const confirm = () => {
    onChange(`${String(tempH).padStart(2, '0')}:${String(tempM).padStart(2, '0')}`);
    setOpen(false);
  };

  const cancel = () => setOpen(false);

  const displayValue = value || '00:00';

  return (
    <>
      <TouchableOpacity
        onPress={openPicker}
        activeOpacity={0.7}
        style={[styles.trigger, { backgroundColor: T.surface, borderColor: T.borderSoft }]}
      >
        <IconClock size={16} color={T.textDim} />
        <Text style={[styles.triggerText, { color: T.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}>
          {displayValue}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={cancel} statusBarTranslucent>
        <TouchableWithoutFeedback onPress={cancel}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.sheet, { backgroundColor: T.bg, paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.handle} />
          <Text style={[styles.title, { color: T.text }]}>{t('time_picker.title')}</Text>

          <View style={styles.cols}>
            <View style={styles.colWrap}>
              <Text style={[styles.colLabel, { color: T.textFaint }]}>{t('time_picker.hour')}</Text>
              <DrumColumn items={HOURS} initialIndex={tempH} onSettle={setTempH} scrollRef={hRef} />
            </View>

            <Text style={[styles.colon, { color: T.text }]}>:</Text>

            <View style={styles.colWrap}>
              <Text style={[styles.colLabel, { color: T.textFaint }]}>{t('time_picker.min')}</Text>
              <DrumColumn items={MINUTES} initialIndex={tempM} onSettle={setTempM} scrollRef={mRef} />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={cancel}
              style={[styles.btn, styles.btnCancel, { borderColor: T.borderSoft, backgroundColor: T.surface }]}
            >
              <Text style={[styles.btnText, { color: T.textDim }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirm}
              style={[styles.btn, styles.btnConfirm, { backgroundColor: T.accent }]}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>{t('common.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  triggerText: { fontSize: 16, fontWeight: '600', letterSpacing: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  cols: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0 },
  colWrap: { alignItems: 'center', gap: 8 },
  colLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  colon: { fontSize: 28, fontWeight: '700', marginHorizontal: 8, marginTop: 20 },
  drumWrap: {
    width: 80,
    height: VISIBLE * ITEM_H,
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    top: PAD * ITEM_H,
    left: 4,
    right: 4,
    height: ITEM_H,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 1,
    pointerEvents: 'none',
  },
  drumItem: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  drumText: { fontSize: 20, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 28, marginBottom: 8 },
  btn: { flex: 1, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { borderWidth: 1 },
  btnConfirm: {},
  btnText: { fontSize: 15, fontWeight: '700' },
});
