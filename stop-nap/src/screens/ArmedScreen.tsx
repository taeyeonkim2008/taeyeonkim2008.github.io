import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../App';
import { formatDistance, formatEta } from '../core/geo';
import { describeLimitation } from '../services/permissions';
import { useTripStore } from '../state/tripStore';
import {
  TOUCH_TARGET,
  colors,
  confidenceColor,
  confidenceLabel,
  radius,
  spacing,
} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Armed'>;

export function ArmedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const trip = useTripStore((s) => s.trip);
  const projection = useTripStore((s) => s.projection);
  const permissions = useTripStore((s) => s.permissions);
  const disarm = useTripStore((s) => s.disarm);
  const ingestFix = useTripStore((s) => s.ingestFix);

  const watchRef = useRef<Location.LocationSubscription | null>(null);

  // While this screen is open we take our own high-rate feed. The background
  // task keeps running regardless; this just gives a countdown that ticks
  // smoothly instead of jumping every deferred batch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 10 },
        (loc) => {
          ingestFix({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            timestamp: loc.timestamp,
            accuracy: loc.coords.accuracy ?? 9999,
            speed:
              typeof loc.coords.speed === 'number' && loc.coords.speed >= 0
                ? loc.coords.speed
                : undefined,
          });
        },
      ).catch(() => null);

      if (cancelled) {
        sub?.remove();
        return;
      }
      watchRef.current = sub;
    })();

    return () => {
      cancelled = true;
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, [ingestFix]);

  useEffect(() => {
    if (!trip) {
      navigation.replace('Home');
      return;
    }
    if (trip.phase === 'ALARMING' || trip.phase === 'SNOOZED') {
      navigation.replace('Alarm');
    }
  }, [trip, navigation]);

  if (!trip || !projection) return <View style={styles.root} />;

  const limitation = permissions ? describeLimitation(permissions) : null;
  const confidence = projection.confidence;
  const stale = projection.fixAgeSec > 60;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <Text style={styles.eyebrow}>Waking you at</Text>
      <Text style={styles.destination}>{trip.destination.label}</Text>

      <View style={styles.readout}>
        <Text style={styles.distance}>{formatDistance(projection.distanceM)}</Text>
        <Text style={styles.eta}>{formatEta(projection.etaSec)} to go</Text>
      </View>

      <View
        style={[
          styles.confidenceBadge,
          { borderColor: confidenceColor(confidence) },
        ]}
      >
        <View
          style={[styles.dot, { backgroundColor: confidenceColor(confidence) }]}
        />
        <Text style={[styles.confidenceText, { color: confidenceColor(confidence) }]}>
          {confidenceLabel(confidence)}
        </Text>
      </View>

      {confidence === 'DARK' ? (
        <Text style={styles.darkNote}>
          No GPS signal — probably a tunnel. Stop Nap is counting down from your
          last known position and will wake you early rather than risk missing
          your stop.
        </Text>
      ) : null}

      {limitation ? (
        <View style={styles.limitation}>
          <Text style={styles.limitationText}>{limitation}</Text>
        </View>
      ) : null}

      <View style={styles.details}>
        <Detail label="Alarm lead" value={`${trip.settings.leadTimeSec}s before arrival`} />
        <Detail
          label="Earliest it could fire"
          value={formatEta(projection.etaEarliestSec)}
        />
        <Detail
          label="Last fix"
          value={
            Number.isFinite(projection.fixAgeSec)
              ? `${Math.round(projection.fixAgeSec)}s ago`
              : 'never'
          }
        />
        <Detail
          label="Speed"
          value={`${projection.speedTypicalMps.toFixed(1)} m/s (${projection.speedSource})`}
        />
        <Detail label="Location power" value={trip.powerTier} />
      </View>

      <Text style={styles.reassurance}>
        You can lock your phone. Keep Stop Nap running in the background —
        swiping it away from the app switcher will stop the alarm on Android.
      </Text>

      <Pressable
        onPress={async () => {
          await disarm();
          navigation.replace('Home');
        }}
        style={({ pressed }) => [styles.cancel, pressed && styles.cancelPressed]}
      >
        <Text style={styles.cancelText}>Cancel trip</Text>
      </Pressable>

      {stale ? (
        <Text style={styles.staleHint}>
          Estimates shown are dead-reckoned from your last fix
          {' '}
          {Math.round(projection.fixAgeSec)}s ago.
        </Text>
      ) : null}
    </ScrollView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },

  eyebrow: {
    color: colors.textFaint,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  destination: { color: colors.text, fontSize: 32, fontWeight: '700' },

  readout: { marginTop: spacing.lg, alignItems: 'center' },
  distance: { color: colors.text, fontSize: 68, fontWeight: '800' },
  eta: { color: colors.textDim, fontSize: 22, marginTop: spacing.xs },

  confidenceBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  confidenceText: { fontSize: 15, fontWeight: '700' },

  darkNote: {
    color: colors.degraded,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  limitation: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderWidth: 1,
    borderColor: colors.dark,
  },
  limitationText: { color: colors.text, fontSize: 14, lineHeight: 20 },

  details: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: { color: colors.textDim, fontSize: 15 },
  detailValue: { color: colors.text, fontSize: 15, fontWeight: '600' },

  reassurance: {
    color: colors.textFaint,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  cancel: {
    height: TOUCH_TARGET,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPressed: { opacity: 0.7 },
  cancelText: { color: colors.textDim, fontSize: 17, fontWeight: '600' },

  staleHint: {
    color: colors.textFaint,
    fontSize: 12,
    textAlign: 'center',
  },
});
