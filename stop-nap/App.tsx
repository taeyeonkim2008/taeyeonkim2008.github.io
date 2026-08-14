import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AlarmScreen } from './src/screens/AlarmScreen';
import { ArmedScreen } from './src/screens/ArmedScreen';
import { DevScreen } from './src/screens/DevScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import {
  installNotificationHandler,
  setupCategories,
  setupChannels,
} from './src/services/notifications';
import { initDb } from './src/state/db';
import { useTripStore } from './src/state/tripStore';
import { colors } from './src/theme';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Armed: undefined;
  Alarm: undefined;
  Settings: undefined;
  Dev: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

/** Foreground tick. Fast enough for a live countdown, cheap enough to ignore. */
const TICK_MS = 1000;

export default function App() {
  const hydrate = useTripStore((s) => s.hydrate);
  const refreshPermissions = useTripStore((s) => s.refreshPermissions);
  const tick = useTripStore((s) => s.tick);
  const hydrated = useTripStore((s) => s.hydrated);
  const permissions = useTripStore((s) => s.permissions);
  const phase = useTripStore((s) => s.trip?.phase ?? null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      installNotificationHandler();
      await Promise.all([
        initDb().catch(() => {}),
        setupChannels().catch(() => {}),
        setupCategories().catch(() => {}),
      ]);
      await hydrate();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  // Re-read permissions and disk state whenever we come back to the
  // foreground: the user may have changed a setting, and the background task
  // may have advanced the trip while we were gone.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        refreshPermissions();
        hydrate();
      }
    });
    return () => sub.remove();
  }, [refreshPermissions, hydrate]);

  useEffect(() => {
    const id = setInterval(() => {
      tick();
    }, TICK_MS);
    return () => clearInterval(id);
  }, [tick]);

  if (!ready || !hydrated) {
    return <View style={styles.boot} />;
  }

  const needsOnboarding = permissions == null || permissions.level === 'none';
  const initialRoute: keyof RootStackParamList =
    phase === 'ALARMING' || phase === 'SNOOZED'
      ? 'Alarm'
      : phase === 'ARMED'
        ? 'Armed'
        : needsOnboarding
          ? 'Onboarding'
          : 'Home';

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Armed"
            component={ArmedScreen}
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="Alarm"
            component={AlarmScreen}
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen
            name="Dev"
            component={DevScreen}
            options={{ title: 'Simulation' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.bg },
});
