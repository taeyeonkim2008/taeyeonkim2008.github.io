import { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { previewAlarm } from '../services/alarm';
import { KEEP_ALIVE_ENABLED } from '../services/alarm';
import { describeLimitation, openSystemSettings } from '../services/permissions';
import { useTripStore } from '../state/tripStore';
import { TOUCH_TARGET, colors, radius, spacing } from '../theme';

/**
 * Discrete lead times rather than a slider. The brief asked for 30 s–5 min
 * configurable, and presets cover that range while staying hittable by someone
 * who is already tired — a slider is the wrong control for this app's user.
 */
const LEAD_OPTIONS = [
  { label: '30s', value: 30 },
  { label: '1 min', value: 60 },
  { label: '90s', value: 90 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
];

const SPEED_OPTIONS = [
  { label: 'Bus / tram', value: 7, hint: '~25 km/h' },
  { label: 'Metro', value: 12, hint: '~43 km/h' },
  { label: 'Commuter rail', value: 22, hint: '~80 km/h' },
];

export function SettingsScreen() {
  const settings = useTripStore((s) => s.settings);
  const updateSettings = useTripStore((s) => s.updateSettings);
  const permissions = useTripStore((s) => s.permissions);

  const limitation = permissions ? describeLimitation(permissions) : null;

  const onPreview = useCallback(() => {
    previewAlarm(4000).catch(() => {});
  }, []);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Section title="Wake me this far ahead">
        <View style={styles.chipRow}>
          {LEAD_OPTIONS.map((opt) => {
            const active = settings.leadTimeSec === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => updateSettings({ leadTimeSec: opt.value })}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>
          How much warning you get before arriving. The alarm radius scales with
          how fast you are actually moving, so this is a time, not a distance.
        </Text>
      </Section>

      <Section title="Usual transit type">
        <View style={styles.chipRow}>
          {SPEED_OPTIONS.map((opt) => {
            const active = settings.defaultSpeedMps === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => updateSettings({ defaultSpeedMps: opt.value })}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>
          Only used before Stop Nap has watched you move — after that it measures
          your real speed. It matters most when GPS is lost early in a trip.
        </Text>
      </Section>

      <Section title="Safety">
        <View style={styles.switchRow}>
          <View style={styles.switchLabelWrap}>
            <Text style={styles.switchLabel}>Wake early when unsure</Text>
            <Text style={styles.hint}>
              When GPS is stale or lost, assume you are travelling faster than
              measured and fire early. Turning this off makes the alarm more
              precise and more likely to miss your stop entirely. Leave it on.
            </Text>
          </View>
          <Switch
            value={settings.failLoud}
            onValueChange={(failLoud) => updateSettings({ failLoud })}
            trackColor={{ true: colors.accent, false: colors.border }}
          />
        </View>
      </Section>

      <Section title="Test">
        <Pressable onPress={onPreview} style={styles.button}>
          <Text style={styles.buttonText}>Play the alarm for 4 seconds</Text>
        </Pressable>
        <Text style={styles.hint}>
          Do this once with your phone on silent, in your pocket, before you rely
          on it. On iOS the alarm plays through the ringer switch; if you cannot
          hear it, the volume is the problem, not the switch.
        </Text>
      </Section>

      <Section title="Permissions">
        <Text style={styles.status}>
          Location: {permissions?.level ?? 'unknown'}
          {'\n'}
          Notifications: {permissions?.notifications ? 'on' : 'off'}
        </Text>
        {limitation ? <Text style={styles.warning}>{limitation}</Text> : null}
        <Pressable onPress={openSystemSettings} style={styles.button}>
          <Text style={styles.buttonText}>Open system settings</Text>
        </Pressable>
      </Section>

      <Section title="About the background alarm">
        <Text style={styles.hint}>
          Stop Nap keeps a silent audio session open while armed
          {KEEP_ALIVE_ENABLED ? '' : ' (currently disabled)'}. That is what lets
          the alarm play through the iOS ringer switch without Apple's Critical
          Alerts entitlement, and it helps keep the app resident in the
          background.
          {'\n\n'}
          On Android, swiping Stop Nap out of the app switcher stops everything —
          the OS will not restart us for location events. Leave it running.
        </Text>
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl },

  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  chipText: { color: colors.textDim, fontSize: 15, fontWeight: '600' },
  chipTextActive: { color: colors.text },

  switchRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  switchLabelWrap: { flex: 1, gap: spacing.xs },
  switchLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },

  hint: { color: colors.textFaint, fontSize: 13, lineHeight: 19 },
  status: { color: colors.textDim, fontSize: 15, lineHeight: 22 },
  warning: { color: colors.degraded, fontSize: 14, lineHeight: 20 },

  button: {
    height: TOUCH_TARGET,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: { color: colors.text, fontSize: 16, fontWeight: '600' },
});
