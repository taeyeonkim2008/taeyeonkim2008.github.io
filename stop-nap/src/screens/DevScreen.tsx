import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../../App';
import { destinationPoint, formatDistance, formatEta } from '../core/geo';
import type { Destination } from '../core/types';
import {
  getTaskDiagnostics,
  stopTripTracking,
} from '../services/locationTask';
import {
  SIM_SCENARIOS,
  startSimulation,
  type SimController,
  type SimStatus,
} from '../services/sim';
import { destinationIdFor } from '../state/db';
import { useTripStore } from '../state/tripStore';
import {
  TOUCH_TARGET,
  colors,
  confidenceColor,
  radius,
  spacing,
} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Dev'>;

const FALLBACK_BASE = { latitude: 40.7527, longitude: -73.9772 };

export function DevScreen({ navigation }: Props) {
  const trip = useTripStore((s) => s.trip);
  const projection = useTripStore((s) => s.projection);
  const decisionLog = useTripStore((s) => s.decisionLog);
  const arm = useTripStore((s) => s.arm);
  const disarm = useTripStore((s) => s.disarm);
  const ingestFix = useTripStore((s) => s.ingestFix);

  const controller = useRef<SimController | null>(null);
  const [status, setStatus] = useState<SimStatus | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] =
    useState<Awaited<ReturnType<typeof getTaskDiagnostics>> | null>(null);

  useEffect(() => {
    getTaskDiagnostics().then(setDiagnostics).catch(() => {});
  }, [trip?.phase]);

  useEffect(() => {
    const id = setInterval(() => {
      if (controller.current) setStatus(controller.current.status());
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(
    () => () => {
      controller.current?.stop();
      controller.current = null;
    },
    [],
  );

  // Navigate to the alarm the moment the simulation trips it — the whole point
  // is watching the trigger fire.
  useEffect(() => {
    if (trip?.phase === 'ALARMING') {
      controller.current?.stop();
      controller.current = null;
      setActiveScenario(null);
      navigation.navigate('Alarm');
    }
  }, [trip?.phase, navigation]);

  const stop = useCallback(() => {
    controller.current?.stop();
    controller.current = null;
    setActiveScenario(null);
    setStatus(null);
  }, []);

  const run = useCallback(
    async (scenarioId: string) => {
      const scenario = SIM_SCENARIOS.find((s) => s.id === scenarioId);
      if (!scenario) return;

      stop();

      // Anchor the fake trip near wherever the phone actually is, so the map
      // and the numbers look plausible.
      const known = await Location.getLastKnownPositionAsync().catch(() => null);
      const base = known
        ? { latitude: known.coords.latitude, longitude: known.coords.longitude }
        : FALLBACK_BASE;

      // Place the destination `startDistanceM` south of the base point, so the
      // simulated vehicle starts roughly where the phone actually is and
      // travels toward it.
      const template = scenario.build(base);
      const dest = destinationPoint(base, 180, template.startDistanceM);
      const destination: Destination = {
        id: destinationIdFor(dest.latitude, dest.longitude),
        label: `SIM — ${scenario.label}`,
        subtitle: 'Simulated destination',
        latitude: dest.latitude,
        longitude: dest.longitude,
        lastUsedAt: Date.now(),
        useCount: 0,
        isFavorite: false,
      };

      await disarm();
      await arm(destination);

      // Real background updates would interleave with synthetic fixes and
      // corrupt the run, so the OS feed is cut for the duration.
      await stopTripTracking().catch(() => {});

      setActiveScenario(scenario.id);
      controller.current = startSimulation(
        { ...template, destination },
        (fix) => {
          ingestFix(fix);
        },
        () => {
          setActiveScenario(null);
        },
      );
    },
    [arm, disarm, ingestFix, stop],
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.note}>
        Replays a synthetic GPS track through the real trigger. Vehicle speed is
        multiplied rather than the clock, so every timestamp the trigger sees is
        a genuine wall-clock time and dead reckoning is exercised for real.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scenarios</Text>
        {SIM_SCENARIOS.map((scenario) => {
          const active = activeScenario === scenario.id;
          return (
            <Pressable
              key={scenario.id}
              onPress={() => (active ? stop() : run(scenario.id))}
              style={[styles.scenario, active && styles.scenarioActive]}
            >
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioLabel}>{scenario.label}</Text>
                <Text style={[styles.scenarioAction, active && styles.stopAction]}>
                  {active ? 'STOP' : 'RUN'}
                </Text>
              </View>
              <Text style={styles.scenarioDescription}>{scenario.description}</Text>
            </Pressable>
          );
        })}
      </View>

      {status ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Simulation</Text>
          <Row label="Elapsed" value={`${status.elapsedRealSec.toFixed(0)}s`} />
          <Row label="Travelled" value={formatDistance(status.travelledM)} />
          <Row label="Remaining" value={formatDistance(status.remainingM)} />
          <Row
            label="GPS"
            value={status.inTunnel ? 'IN TUNNEL — suppressed' : 'emitting'}
            valueColor={status.inTunnel ? colors.dark : colors.live}
          />
          <Row
            label="Fixes"
            value={`${status.fixesEmitted} sent / ${status.fixesSuppressed} dropped`}
          />
        </View>
      ) : null}

      {trip && projection ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trigger state</Text>
          <Row label="Phase" value={trip.phase} />
          <Row label="Distance" value={formatDistance(projection.distanceM)} />
          <Row label="ETA" value={formatEta(projection.etaSec)} />
          <Row
            label="Earliest arrival"
            value={formatEta(projection.etaEarliestSec)}
          />
          <Row
            label="Confidence"
            value={projection.confidence}
            valueColor={confidenceColor(projection.confidence)}
          />
          <Row
            label="Fix age"
            value={
              Number.isFinite(projection.fixAgeSec)
                ? `${projection.fixAgeSec.toFixed(0)}s`
                : 'never'
            }
          />
          <Row
            label="Speed"
            value={`${projection.speedTypicalMps.toFixed(1)} / ${projection.speedUpperMps.toFixed(
              1,
            )} m/s`}
          />
          <Row label="Tier" value={trip.powerTier} />
          <Row label="Geofence inner" value={String(trip.innerGeofenceEntered)} />
        </View>
      ) : null}

      {diagnostics ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background tasks</Text>
          <Row
            label="Geofencing"
            value={diagnostics.geofencingStarted ? 'started' : 'stopped'}
          />
          <Row
            label="Location updates"
            value={diagnostics.updatesStarted ? 'started' : 'stopped'}
          />
          <Row
            label="Background available"
            value={String(diagnostics.backgroundAvailable)}
          />
          <Row
            label="Registered"
            value={diagnostics.registeredTasks.join(', ') || 'none'}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Decision log</Text>
        {decisionLog.length === 0 ? (
          <Text style={styles.logEmpty}>No decisions yet.</Text>
        ) : (
          decisionLog.map((line, i) => (
            <Text key={`${i}-${line}`} style={styles.logLine} numberOfLines={2}>
              {line}
            </Text>
          ))
        )}
      </View>

      {trip ? (
        <Pressable
          onPress={async () => {
            stop();
            await disarm();
          }}
          style={styles.disarm}
        >
          <Text style={styles.disarmText}>Disarm and clear</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },

  note: { color: colors.textFaint, fontSize: 13, lineHeight: 19 },

  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },

  scenario: {
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  scenarioActive: { borderColor: colors.accent },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scenarioLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  scenarioAction: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  stopAction: { color: colors.dark },
  scenarioDescription: { color: colors.textFaint, fontSize: 13, lineHeight: 18 },

  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  rowLabel: { color: colors.textDim, fontSize: 14 },
  rowValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },

  logEmpty: { color: colors.textFaint, fontSize: 13 },
  logLine: {
    color: colors.textDim,
    fontSize: 11,
    fontFamily: 'Courier',
    lineHeight: 15,
  },

  disarm: {
    height: TOUCH_TARGET,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disarmText: { color: colors.dark, fontSize: 16, fontWeight: '700' },
});
