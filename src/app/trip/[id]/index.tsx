import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  LinearTransition,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarStack } from '@/components/avatar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { MonthChart } from '@/components/month-chart';
import { RefineSheet } from '@/components/refine-sheet';
import { ResultCard } from '@/components/result-card';
import { HEADER_BAR_HEIGHT, HeaderIconButton, ScreenHeader } from '@/components/screen-header';
import { Segmented } from '@/components/segmented';
import { ResultSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorldMap } from '@/components/world-map';
import { MaxContentWidth, Motion, Radius, Spacing, travelerColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCity } from '@/lib/data/cities';
import { applyFilters, describeFilters, filtersOf, restoreCity, vetoedCities } from '@/lib/filters';
import { monthName } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { compareMonths, type MonthOption } from '@/lib/months';
import { flightHours } from '@/lib/pricing/mock-provider';
import { rankDestinations } from '@/lib/scoring';
import { shareTrip } from '@/lib/share';
import { useTrip, useTrips } from '@/lib/store';
import type { DestinationResult, TripFilters } from '@/lib/types';

type RankMode = 'cheapest' | 'balanced' | 'fairest';

const MODE_WEIGHT: Record<RankMode, number> = { cheapest: 0.1, balanced: 0.5, fairest: 0.9 };

const MODE_BLURB: Record<RankMode, string> = {
  cheapest: 'Lowest total bill for the group, whoever ends up paying it.',
  balanced: 'Total cost and an even split, weighed together.',
  fairest: 'How evenly the cost falls, even if the total runs a little higher.',
};

const INITIAL_VISIBLE = 10;

function modeForWeight(weight: number): RankMode {
  if (weight < 0.3) return 'cheapest';
  if (weight > 0.7) return 'fairest';
  return 'balanced';
}

export default function ResultsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useTrip(id);
  const { saveTrip, hydrated } = useTrips();
  const [results, setResults] = useState<DestinationResult[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  // The staggered entrance plays on arrival; re-ranking by mode glides in place.
  const [settled, setSettled] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [refineOpen, setRefineOpen] = useState(false);
  const [months, setMonths] = useState<{ key: string; options: MonthOption[] } | null>(null);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  useEffect(() => {
    if (!trip) return;
    let cancelled = false;
    rankDestinations(trip).then((r) => {
      if (!cancelled) setResults(r);
    });
    return () => {
      cancelled = true;
    };
  }, [trip]);

  // The month comparison depends on everything except the month itself.
  const monthsKey = trip
    ? JSON.stringify([trip.travelers, trip.nights, trip.fairnessWeight, trip.filters])
    : '';
  useEffect(() => {
    if (!trip) return;
    let cancelled = false;
    compareMonths(trip).then((options) => {
      if (!cancelled) setMonths({ key: monthsKey, options });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on monthsKey on purpose
  }, [monthsKey]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const origins = useMemo(
    () =>
      (trip?.travelers ?? []).map((t, i) => ({
        key: t.id,
        code: t.originCode,
        color: travelerColor(i),
      })),
    [trip?.travelers],
  );

  if (!trip) {
    return (
      <ThemedView style={[styles.screen, styles.center]}>
        {hydrated ? (
          <ThemedText themeColor="textSecondary">This trip no longer exists.</ThemedText>
        ) : (
          <ActivityIndicator />
        )}
      </ThemedView>
    );
  }

  const mode = modeForWeight(trip.fairnessWeight);
  const filters = filtersOf(trip);
  const activeFilters = describeFilters(filters);
  const vetoed = vetoedCities(trip);
  const ranked = results ? applyFilters(trip, results) : null;
  const top = ranked?.[0];
  const visible = ranked ? (showAll ? ranked : ranked.slice(0, INITIAL_VISIBLE)) : [];

  const updateFilters = (next: TripFilters) => {
    setSettled(true);
    saveTrip({ ...trip, filters: next });
  };
  const avgHours =
    top &&
    trip.travelers.reduce((a, t) => a + flightHours(t.originCode, top.cityCode), 0) /
      trip.travelers.length;

  const share = async () => {
    const outcome = await shareTrip(trip);
    if (outcome === 'copied') {
      haptic('success');
      setToast('Invite link copied');
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <ScreenHeader
        title={trip.name}
        scrollY={scrollY}
        right={
          <>
            <HeaderIconButton icon="share" label="Share" onPress={share} />
            <HeaderIconButton
              icon="edit"
              label="Edit"
              onPress={() => router.push(`/new-trip?id=${trip.id}`)}
            />
          </>
        }
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + HEADER_BAR_HEIGHT + Spacing.two, paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <Animated.View entering={FadeInDown.duration(Motion.duration.slow)} style={{ gap: Spacing.two }}>
          <ThemedText type="display">{trip.name}</ThemedText>
          <View style={styles.meta}>
            <AvatarStack names={trip.travelers.map((t) => t.name)} size={26} />
            <ThemedText type="small" themeColor="textSecondary">
              {monthName(trip.month)} · {trip.nights} nights · {trip.travelers.length} flying in
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(Motion.duration.slow)}>
          <Card style={styles.mapCard}>
            <WorldMap origins={origins} destination={top?.cityCode} />
            <View style={styles.mapCaption}>
              {top ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Everyone meets in{' '}
                  <ThemedText type="smallBold">{getCity(top.cityCode).name}</ThemedText>
                  {avgHours ? ` · about ${Math.round(avgHours)} h in the air on average` : ''}
                </ThemedText>
              ) : (
                <ThemedText type="small" themeColor="textSecondary">
                  {ranked ? 'No city matches your filters yet.' : 'Pricing 50 cities for everyone…'}
                </ThemedText>
              )}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(Motion.duration.slow)} style={{ gap: Spacing.two + 2 }}>
          <Segmented<RankMode>
            options={[
              { value: 'cheapest', label: 'Cheapest' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'fairest', label: 'Fairest' },
            ]}
            value={mode}
            onChange={(next) => {
              setSettled(true);
              saveTrip({ ...trip, fairnessWeight: MODE_WEIGHT[next] });
            }}
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.blurb}>
            {MODE_BLURB[mode]} Figures are per person: return flight, a shared mid-range room and
            food on the ground.
          </ThemedText>
          <View style={styles.filterBar}>
            <Button
              title="Refine"
              icon="sliders"
              variant="secondary"
              size="small"
              onPress={() => setRefineOpen(true)}
            />
            <View style={styles.filterChips}>
              {activeFilters.map((label) => (
                <Chip key={label} label={label} tone="accent" />
              ))}
              {vetoed.length > 0 && <Chip label={`${vetoed.length} ruled out`} />}
              {ranked && (
                <ThemedText type="caption" themeColor="textSecondary">
                  {ranked.length} of {results?.length} cities
                </ThemedText>
              )}
            </View>
          </View>
        </Animated.View>

        {months && (
          <Animated.View entering={FadeInDown.delay(200).duration(Motion.duration.slow)}>
            <Card style={styles.monthsCard}>
              <ThemedText type="label" themeColor="textSecondary">
                When&apos;s cheapest?
              </ThemedText>
              <MonthChart
                options={months.options}
                month={trip.month}
                stale={months.key !== monthsKey}
                onPlan={(month) => {
                  haptic('success');
                  setSettled(true);
                  saveTrip({ ...trip, month });
                }}
              />
            </Card>
          </Animated.View>
        )}

        <View style={{ gap: Spacing.three }}>
          {!results &&
            Array.from({ length: 4 }, (_, i) => (
              <Animated.View key={i} entering={FadeIn.delay(i * 80)}>
                <ResultSkeleton />
              </Animated.View>
            ))}
          {visible.map((r, i) => (
            <Animated.View
              key={r.cityCode}
              layout={LinearTransition.springify().damping(Motion.glide.damping).stiffness(Motion.glide.stiffness)}
              entering={
                settled
                  ? FadeIn.duration(Motion.duration.base)
                  : FadeInDown.delay(Math.min(i, 8) * Motion.stagger).duration(Motion.duration.slow)
              }
              exiting={FadeOut.duration(Motion.duration.fast)}>
              <ResultCard
                rank={i + 1}
                result={r}
                month={trip.month}
                revealDelay={settled ? 0 : Math.min(i, 8) * Motion.stagger + 150}
                onPress={() => router.push(`/trip/${trip.id}/${r.cityCode}`)}
              />
            </Animated.View>
          ))}
          {ranked && ranked.length === 0 && (
            <Animated.View entering={FadeIn.duration(Motion.duration.base)}>
              <Card style={styles.empty}>
                <ThemedText type="heading">Nothing fits all of that.</ThemedText>
                <ThemedText type="default" themeColor="textSecondary">
                  No city passes every filter for this group in {monthName(trip.month)}. Loosen the
                  flight limit or drop a vibe.
                </ThemedText>
                <Button title="Refine" variant="secondary" onPress={() => setRefineOpen(true)} />
              </Card>
            </Animated.View>
          )}
          {ranked && !showAll && ranked.length > INITIAL_VISIBLE && (
            <Button
              title={`Show all ${ranked.length} cities`}
              variant="secondary"
              onPress={() => setShowAll(true)}
            />
          )}
        </View>
      </Animated.ScrollView>

      <RefineSheet
        visible={refineOpen}
        onClose={() => setRefineOpen(false)}
        month={trip.month}
        filters={filters}
        matchCount={ranked?.length ?? 0}
        total={results?.length ?? 0}
        onChange={updateFilters}
        vetoed={vetoed.map((v) => ({ cityCode: v.cityCode, names: v.by.map((t) => t.name) }))}
        onRestore={(cityCode) => {
          haptic('selection');
          setSettled(true);
          saveTrip(restoreCity(trip, cityCode));
        }}
      />

      {toast && (
        <Animated.View
          entering={FadeInDown.springify().damping(Motion.glide.damping)}
          exiting={FadeOutDown.duration(Motion.duration.fast)}
          pointerEvents="none"
          style={[styles.toast, { bottom: insets.bottom + Spacing.four, backgroundColor: theme.text }]}>
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            {toast}
          </ThemedText>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three + 4,
    gap: Spacing.four,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  mapCard: {
    padding: Spacing.two,
    gap: Spacing.two,
  },
  mapCaption: {
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.one,
  },
  blurb: {
    paddingHorizontal: Spacing.one,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  filterChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  empty: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  monthsCard: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three - 4,
    borderRadius: Radius.pill,
  },
});
