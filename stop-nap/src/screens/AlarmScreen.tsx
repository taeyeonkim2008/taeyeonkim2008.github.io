import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../App';
import { SNOOZE_LIMIT, type FireReason } from '../core/types';
import { useTripStore } from '../state/tripStore';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Alarm'>;

const REASON_HEADLINE: Record<FireReason, string> = {
  GEOFENCE_INNER: 'You are arriving',
  ETA_LIVE: 'You are arriving',
  ETA_DEAD_RECKONED: 'You are arriving (estimated)',
  OVERSHOOT: 'You passed your stop',
  LOST_SIGNAL_FAILSAFE: 'Waking you early',
  MANUAL: 'Test alarm',
};

const REASON_DETAIL: Record<FireReason, string> = {
  GEOFENCE_INNER: 'GPS confirmed you crossed into your stop’s radius.',
  ETA_LIVE: 'Based on a live GPS fix.',
  ETA_DEAD_RECKONED:
    'GPS was unavailable, so this is estimated from your last known position and speed. Check where you are.',
  OVERSHOOT: 'You are moving away from your stop. Get off at the next one.',
  LOST_SIGNAL_FAILSAFE:
    'GPS was lost for several minutes while you were close. Woken early to be safe — you may not be there yet.',
  MANUAL: 'You triggered this from Settings.',
};

/** A half-finished dismissal resets, so a pocket tap cannot leave it primed. */
const RESET_AFTER_MS = 8000;

/** Deliberate delay between the two targets — defeats a double-tap reflex. */
const STEP_DEBOUNCE_MS = 400;

const TARGET_SIZE = 132;

export function AlarmScreen({ navigation }: Props) {
  useKeepAwake();
  const insets = useSafeAreaInsets();

  const trip = useTripStore((s) => s.trip);
  const dismissAlarm = useTripStore((s) => s.dismissAlarm);
  const snoozeAlarm = useTripStore((s) => s.snoozeAlarm);

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [armedAt, setArmedAt] = useState(0);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 450,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (!trip) navigation.replace('Home');
    else if (trip.phase === 'DISMISSED') navigation.replace('Home');
  }, [trip, navigation]);

  const snoozed = trip?.phase === 'SNOOZED';
  const canSnooze = (trip?.snoozeCount ?? 0) < SNOOZE_LIMIT && !snoozed;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBounds({ width, height });
  }, []);

  /**
   * Targets are placed randomly on each step so the gesture cannot become
   * muscle memory, and so the second target is never under the finger that
   * just hit the first.
   */
  const positions = useMemo(() => {
    if (bounds.width === 0 || bounds.height === 0) {
      return [
        { left: 0, top: 0 },
        { left: 0, top: 0 },
      ];
    }
    const padX = spacing.lg;
    const padY = spacing.lg;
    const maxLeft = Math.max(padX, bounds.width - TARGET_SIZE - padX);
    const maxTop = Math.max(padY, bounds.height - TARGET_SIZE - padY);

    const first = {
      left: padX + Math.random() * (maxLeft - padX),
      top: padY + Math.random() * (maxTop - padY) * 0.45,
    };
    const second = {
      left: padX + Math.random() * (maxLeft - padX),
      // Force the second target into the lower band, well away from the first.
      top: padY + (maxTop - padY) * (0.55 + Math.random() * 0.4),
    };
    return [first, second];
    // Re-randomise whenever a dismissal attempt restarts.
  }, [bounds.width, bounds.height, armedAt]);

  const scheduleReset = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setStep(0);
      setArmedAt(Date.now());
    }, RESET_AFTER_MS);
  }, []);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const hitFirst = useCallback(() => {
    setStep(1);
    scheduleReset();
    // The second target only becomes live after the debounce, so a fast
    // double-tap in the same spot cannot carry through.
    setTimeout(() => setStep(2), STEP_DEBOUNCE_MS);
  }, [scheduleReset]);

  const hitSecond = useCallback(async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    await dismissAlarm();
    navigation.replace('Home');
  }, [dismissAlarm, navigation]);

  const reason = trip?.firedReason ?? 'ETA_LIVE';

  const bg = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.alarmDeep, colors.alarm],
  });

  if (snoozed) {
    return (
      <View style={[styles.root, styles.snoozeRoot]}>
        <Text style={styles.snoozeTitle}>Snoozed</Text>
        <Text style={styles.snoozeBody}>
          The alarm will return in under a minute and cannot be snoozed again.
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.root, { backgroundColor: bg }]} onLayout={onLayout}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.headline}>{REASON_HEADLINE[reason]}</Text>
        <Text style={styles.destination}>{trip?.destination.label ?? ''}</Text>
        <Text style={styles.detail}>{REASON_DETAIL[reason]}</Text>
      </View>

      <Text style={styles.instruction}>
        {step === 0
          ? 'Tap both circles to turn this off'
          : step === 1
            ? 'Wait…'
            : 'Now tap the second circle'}
      </Text>

      {step === 0 ? (
        <Pressable
          onPress={hitFirst}
          style={[styles.target, positions[0]]}
          accessibilityLabel="First dismissal target"
        >
          <Text style={styles.targetText}>1</Text>
        </Pressable>
      ) : null}

      {step >= 1 ? (
        <View
          style={[styles.target, styles.targetDone, positions[0]]}
          pointerEvents="none"
        >
          <Text style={styles.targetTextDone}>✓</Text>
        </View>
      ) : null}

      {step === 2 ? (
        <Pressable
          onPress={hitSecond}
          style={[styles.target, positions[1]]}
          accessibilityLabel="Second dismissal target"
        >
          <Text style={styles.targetText}>2</Text>
        </Pressable>
      ) : null}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        {canSnooze ? (
          <Pressable onPress={snoozeAlarm} style={styles.snoozeButton}>
            <Text style={styles.snoozeButtonText}>Snooze 60s (once)</Text>
          </Pressable>
        ) : (
          <Text style={styles.noSnooze}>No snoozes left</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.alarm },
  header: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  headline: { color: '#FFFFFF', fontSize: 40, fontWeight: '900' },
  destination: { color: '#FFFFFF', fontSize: 26, fontWeight: '700' },
  detail: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 21,
    marginTop: spacing.sm,
  },

  instruction: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  target: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetDone: { backgroundColor: 'rgba(255,255,255,0.25)' },
  targetText: { color: colors.alarm, fontSize: 52, fontWeight: '900' },
  targetTextDone: { color: '#FFFFFF', fontSize: 44, fontWeight: '900' },

  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  snoozeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  snoozeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  noSnooze: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },

  snoozeRoot: {
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  snoozeTitle: { color: colors.text, fontSize: 32, fontWeight: '800' },
  snoozeBody: {
    color: colors.textDim,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
