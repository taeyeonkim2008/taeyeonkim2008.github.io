import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../App';
import {
  openSystemSettings,
  requestBackgroundLocation,
  requestForegroundLocation,
  requestNotifications,
} from '../services/permissions';
import { useTripStore } from '../state/tripStore';
import { TOUCH_TARGET, colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

/**
 * The permission flow is explicitly staged, because both platforms punish
 * getting the order wrong:
 *
 *  - iOS will not grant Always unless While-Using was granted first, and if the
 *    user picked "Allow Once" the Always request silently does nothing at all —
 *    no dialog, no error. There is no API to detect that case, so the only
 *    defence is telling the user what to expect before the dialog appears.
 *  - Android 11+ does not show an Always dialog at all. It opens Settings. A
 *    user who has not been warned reads that as the app breaking.
 */
export function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const refreshPermissions = useTripStore((s) => s.refreshPermissions);
  const permissions = useTripStore((s) => s.permissions);

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const advance = useCallback(
    async (action?: () => Promise<unknown>) => {
      setBusy(true);
      try {
        if (action) await action();
        await refreshPermissions();
      } finally {
        setBusy(false);
        setStep((s) => s + 1);
      }
    },
    [refreshPermissions],
  );

  const finish = useCallback(() => {
    navigation.replace('Home');
  }, [navigation]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
    >
      {step === 0 ? (
        <>
          <Text style={styles.title}>Sleep on the train.{'\n'}Wake at your stop.</Text>
          <Text style={styles.body}>
            Stop Nap watches your position and sets off a loud alarm shortly
            before you arrive, so you can actually sleep instead of checking the
            window every two minutes.
          </Text>
          <Text style={styles.body}>
            To do that it needs a few permissions. Here is exactly what each one
            is for.
          </Text>
          <Primary label="Get started" onPress={() => setStep(1)} disabled={busy} />
        </>
      ) : null}

      {step === 1 ? (
        <>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.body}>
            The alarm shows up as a notification you can tap, and a scheduled
            notification is the backup that still fires if the app gets closed.
          </Text>
          <Text style={styles.bodyDim}>
            Without this, you lose the only alarm that survives the app being
            shut down.
          </Text>
          <Primary
            label="Allow notifications"
            onPress={() => advance(requestNotifications)}
            disabled={busy}
          />
          <Secondary label="Skip" onPress={() => setStep(2)} />
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Text style={styles.title}>Location while using the app</Text>
          <Text style={styles.body}>
            This is how Stop Nap measures how far you are from your stop. Nothing
            leaves your phone — there is no account, no server, and no tracking.
          </Text>
          <Primary
            label="Allow location"
            onPress={() => advance(requestForegroundLocation)}
            disabled={busy}
          />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <Text style={styles.title}>Location all the time</Text>
          <Text style={styles.body}>
            This is the important one. An alarm that only works while you are
            staring at the screen is useless — the whole point is that you are
            asleep with the phone locked in your pocket.
          </Text>
          <Text style={styles.body}>
            "Always" lets Stop Nap keep counting down while the app is in the
            background and the screen is off.
          </Text>
          <View style={styles.callout}>
            <Text style={styles.calloutText}>
              {Platform.OS === 'ios'
                ? 'iOS will ask again in a moment. Choose "Change to Always Allow". If you pick "Allow Once", the alarm will not work in the background and iOS gives us no way to detect it or ask again — you would have to fix it in Settings.'
                : 'Android will open its Settings screen rather than a pop-up. Choose "Allow all the time", then come back here.'}
            </Text>
          </View>
          <Primary
            label="Allow always"
            onPress={() => advance(requestBackgroundLocation)}
            disabled={busy}
          />
          <Secondary label="Not now" onPress={() => setStep(4)} />
        </>
      ) : null}

      {step >= 4 ? (
        <>
          {permissions?.level === 'always' ? (
            <>
              <Text style={styles.title}>You are set</Text>
              <Text style={styles.body}>
                Pick a stop, tap Sleep, and put your phone away. Stop Nap will
                wake you {'—'} loudly {'—'} shortly before you arrive.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Limited mode</Text>
              <Text style={styles.body}>
                Stop Nap does not have background location, so the alarm will
                only fire while the app is open and on screen. It will not wake
                you if you lock your phone.
              </Text>
              <Text style={styles.bodyDim}>
                You can still use it that way — the countdown works and the
                alarm is just as loud — but you would have to leave the screen
                on. Grant "Always" in Settings whenever you want the real thing.
              </Text>
              <Secondary label="Open Settings" onPress={openSystemSettings} />
            </>
          )}
          <Primary label="Continue" onPress={finish} disabled={busy} />
        </>
      ) : null}
    </ScrollView>
  );
}

function Primary({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primary,
        disabled && styles.primaryDisabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function Secondary({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md, flexGrow: 1 },

  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: spacing.sm,
  },
  body: { color: colors.textDim, fontSize: 17, lineHeight: 25 },
  bodyDim: { color: colors.textFaint, fontSize: 15, lineHeight: 22 },

  callout: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  calloutText: { color: colors.text, fontSize: 15, lineHeight: 22 },

  primary: {
    marginTop: 'auto',
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabled: { opacity: 0.5 },
  primaryText: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },

  secondary: {
    height: TOUCH_TARGET,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: colors.textDim, fontSize: 16, fontWeight: '600' },

  pressed: { opacity: 0.8 },
});
