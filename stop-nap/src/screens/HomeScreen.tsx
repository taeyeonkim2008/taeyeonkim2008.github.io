import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Circle, Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../App';
import { distanceM, formatDistance } from '../core/geo';
import { leadDistanceM } from '../core/geofences';
import type { Destination } from '../core/types';
import { describeLimitation } from '../services/permissions';
import { destinationIdFor, listDestinations, saveDestination } from '../state/db';
import { useTripStore } from '../state/tripStore';
import { TOUCH_TARGET, colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const FALLBACK_REGION: Region = {
  latitude: 40.7527,
  longitude: -73.9772,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const arm = useTripStore((s) => s.arm);
  const settings = useTripStore((s) => s.settings);
  const permissions = useTripStore((s) => s.permissions);

  const mapRef = useRef<MapView | null>(null);
  const [region, setRegion] = useState<Region>(FALLBACK_REGION);
  const [here, setHere] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [recents, setRecents] = useState<Destination[]>([]);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Destination[]>([]);
  const [searching, setSearching] = useState(false);
  const [arming, setArming] = useState(false);

  const limitation = permissions ? describeLimitation(permissions) : null;

  useEffect(() => {
    listDestinations().then(setRecents).catch(() => {});
  }, []);

  // Centre on the user without blocking anything: last-known is instant and
  // good enough for a map, and a precise fix is not needed to pick a stop.
  useEffect(() => {
    (async () => {
      const known = await Location.getLastKnownPositionAsync().catch(() => null);
      if (!known) return;
      const coords = {
        latitude: known.coords.latitude,
        longitude: known.coords.longitude,
      };
      setHere(coords);
      setRegion((r) => ({ ...r, ...coords }));
      mapRef.current?.animateToRegion({ ...FALLBACK_REGION, ...coords }, 500);
    })();
  }, []);

  const runSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (trimmed.length < 3) return;

    Keyboard.dismiss();
    setSearching(true);
    try {
      // The OS geocoder: Apple's on iOS, Android's on Android. No API key and
      // no billing account, at the cost of mediocre results for bare station
      // names — "Union Square" fares worse than a street address.
      const hits = await Location.geocodeAsync(trimmed);
      const mapped = await Promise.all(
        hits.slice(0, 6).map(async (hit) => {
          const [addr] = await Location.reverseGeocodeAsync({
            latitude: hit.latitude,
            longitude: hit.longitude,
          }).catch(() => []);
          const subtitle = addr
            ? [addr.name, addr.city, addr.region].filter(Boolean).join(', ')
            : undefined;
          return {
            id: destinationIdFor(hit.latitude, hit.longitude),
            label: trimmed,
            subtitle,
            latitude: hit.latitude,
            longitude: hit.longitude,
            lastUsedAt: Date.now(),
            useCount: 0,
            isFavorite: false,
          } satisfies Destination;
        }),
      );
      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  const choose = useCallback((dest: Destination) => {
    setSelected(dest);
    setResults([]);
    setQuery('');
    Keyboard.dismiss();
    mapRef.current?.animateToRegion(
      {
        latitude: dest.latitude,
        longitude: dest.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      400,
    );
  }, []);

  const distanceToSelected = useMemo(() => {
    if (!selected || !here) return null;
    return distanceM(here, selected);
  }, [selected, here]);

  const leadRadius = useMemo(
    () => leadDistanceM(settings.defaultSpeedMps, settings),
    [settings],
  );

  /** The already-there case: arming here would fire almost immediately. */
  const alreadyClose =
    distanceToSelected != null && distanceToSelected <= leadRadius;

  const onArm = useCallback(async () => {
    if (!selected || arming) return;
    setArming(true);
    try {
      await saveDestination(selected);
      await arm(selected);
      navigation.replace('Armed');
    } finally {
      setArming(false);
    }
  }, [selected, arming, arm, navigation]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Stop Nap</Text>
        <View style={styles.headerButtons}>
          <Pressable
            onPress={() => navigation.navigate('Dev')}
            style={styles.iconButton}
            hitSlop={12}
          >
            <Text style={styles.iconText}>SIM</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconButton}
            hitSlop={12}
          >
            <Text style={styles.iconText}>⚙</Text>
          </Pressable>
        </View>
      </View>

      {limitation ? (
        <Pressable
          style={styles.warning}
          onPress={() => navigation.navigate('Onboarding')}
        >
          <Text style={styles.warningText}>{limitation}</Text>
          <Text style={styles.warningAction}>Fix this →</Text>
        </Pressable>
      ) : null}

      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search for your stop"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={runSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searching ? (
          <ActivityIndicator style={styles.searchSpinner} color={colors.accent} />
        ) : null}
      </View>

      {results.length > 0 ? (
        <FlatList
          style={styles.results}
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable style={styles.resultRow} onPress={() => choose(item)}>
              <Text style={styles.resultLabel}>{item.label}</Text>
              {item.subtitle ? (
                <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
              ) : null}
            </Pressable>
          )}
        />
      ) : null}

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          showsUserLocation={permissions?.level !== 'none'}
          showsMyLocationButton={false}
          onLongPress={(e) => {
            // Dropping a pin is the escape hatch when the geocoder cannot find
            // a station by name, which happens more than it should.
            const { latitude, longitude } = e.nativeEvent.coordinate;
            choose({
              id: destinationIdFor(latitude, longitude),
              label: 'Dropped pin',
              subtitle: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              latitude,
              longitude,
              lastUsedAt: Date.now(),
              useCount: 0,
              isFavorite: false,
            });
          }}
        >
          {selected ? (
            <>
              <Marker coordinate={selected} title={selected.label} />
              <Circle
                center={selected}
                radius={leadRadius}
                strokeColor={colors.accent}
                fillColor="rgba(59,130,246,0.15)"
              />
            </>
          ) : null}
        </MapView>

        {!selected ? (
          <View style={styles.mapHint} pointerEvents="none">
            <Text style={styles.mapHintText}>
              Search above, tap a recent stop, or long-press the map
            </Text>
          </View>
        ) : null}
      </View>

      {recents.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.recents}
          contentContainerStyle={styles.recentsContent}
        >
          {recents.map((dest) => {
            const isSelected = selected?.id === dest.id;
            return (
              <Pressable
                key={dest.id}
                onPress={() => choose(dest)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                {dest.isFavorite ? <Text style={styles.star}>★</Text> : null}
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextSelected]}
                  numberOfLines={1}
                >
                  {dest.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {selected ? (
          <Text style={styles.selectedLine} numberOfLines={1}>
            {selected.label}
            {distanceToSelected != null
              ? ` · ${formatDistance(distanceToSelected)} away`
              : ''}
          </Text>
        ) : (
          <Text style={styles.selectedLinePlaceholder}>No stop selected</Text>
        )}

        {alreadyClose ? (
          <Text style={styles.closeWarning}>
            You are already within the alarm radius — this will wake you almost
            immediately.
          </Text>
        ) : null}

        <Pressable
          onPress={onArm}
          disabled={!selected || arming}
          style={({ pressed }) => [
            styles.sleepButton,
            (!selected || arming) && styles.sleepButtonDisabled,
            pressed && styles.sleepButtonPressed,
          ]}
        >
          <Text style={styles.sleepText}>{arming ? 'Arming…' : 'Sleep'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  headerButtons: { flexDirection: 'row', gap: spacing.sm },
  iconButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  iconText: { color: colors.textDim, fontSize: 14, fontWeight: '600' },

  warning: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: colors.degraded,
  },
  warningText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  warningAction: {
    color: colors.degraded,
    fontWeight: '700',
    marginTop: spacing.xs,
  },

  searchRow: { paddingHorizontal: spacing.md, justifyContent: 'center' },
  search: {
    height: TOUCH_TARGET,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 17,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchSpinner: { position: 'absolute', right: spacing.lg },

  results: {
    maxHeight: 220,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  resultRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  resultSubtitle: { color: colors.textDim, fontSize: 13, marginTop: 2 },

  mapWrap: {
    flex: 1,
    margin: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  mapHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.md,
    alignItems: 'center',
  },
  mapHintText: {
    color: colors.text,
    backgroundColor: 'rgba(11,16,32,0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    fontSize: 13,
    overflow: 'hidden',
  },

  recents: { maxHeight: 56, flexGrow: 0 },
  recentsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 200,
  },
  chipSelected: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  chipText: { color: colors.textDim, fontSize: 15, fontWeight: '600' },
  chipTextSelected: { color: colors.text },
  star: { color: colors.degraded, fontSize: 13 },

  footer: { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.sm },
  selectedLine: { color: colors.text, fontSize: 16, fontWeight: '600' },
  selectedLinePlaceholder: { color: colors.textFaint, fontSize: 16 },
  closeWarning: { color: colors.degraded, fontSize: 13, lineHeight: 18 },

  sleepButton: {
    height: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepButtonDisabled: { backgroundColor: colors.surfaceRaised },
  sleepButtonPressed: { opacity: 0.85 },
  sleepText: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
});
