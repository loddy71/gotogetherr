import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  LinearTransition,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedNumber } from '@/components/animated-number';
import { BoardingPass } from '@/components/boarding-pass';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { LivePricesCard } from '@/components/live-prices';
import { PageTitle } from '@/components/page-title';
import { PressableScale } from '@/components/pressable-scale';
import { HEADER_BAR_HEIGHT, ScreenHeader } from '@/components/screen-header';
import { SkeletonBlock } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorldMap } from '@/components/world-map';
import { Flag } from '@/components/flag';
import {
  MaxContentWidth,
  Motion,
  Spacing,
  TouchTarget,
  travelerColor,
} from '@/constants/theme';
import { useEntrance } from '@/hooks/use-entrance';
import { useTheme } from '@/hooks/use-theme';
import { getCity, hotelSeasonFactor, seasonOf, weatherFor } from '@/lib/data/cities';
import { money, monthName } from '@/lib/format';
import { type CostGrid, priceGrid, pricingKey } from '@/lib/scoring';
import { toggleVeto, vetoedBy } from '@/lib/filters';
import { haptic } from '@/lib/haptics';
import { useTrip, useTrips } from '@/lib/store';

const percent = (n: number) => `${Math.round(n)}%`;

export default function DestinationScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const enter = useEntrance();
  const { id, city: cityCode } = useLocalSearchParams<{ id: string; city: string }>();
  const trip = useTrip(id);
  const { saveTrip, hydrated } = useTrips();
  const [priced, setPriced] = useState<{ key: string; grid: CostGrid } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  // Same cached grid as the results screen: vetoes and mode never re-price.
  const priceKey = trip ? pricingKey(trip) : '';
  useEffect(() => {
    if (!trip) return;
    let cancelled = false;
    priceGrid(trip).then((grid) => {
      if (!cancelled) setPriced({ key: priceKey, grid });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on priceKey on purpose
  }, [priceKey]);
  const result = priced?.grid.find((r) => r.cityCode === cityCode) ?? null;

  const origins = useMemo(
    () =>
      (trip?.travelers ?? []).map((t, i) => ({ key: t.id, code: t.originCode, color: travelerColor(i) })),
    [trip?.travelers],
  );

  if (!trip || !cityCode) {
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

  const city = getCity(cityCode);
  const weather = weatherFor(city, trip.month);
  const season = seasonOf(city, trip.month);
  const seasonShift = Math.round((hotelSeasonFactor(city, trip.month) - 1) * 100);

  return (
    <ThemedView style={styles.screen}>
      <PageTitle title={`${city.name} · ${trip.name}`} />
      <ScreenHeader title={city.name} scrollY={scrollY} collapseAt={90} />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + HEADER_BAR_HEIGHT + Spacing.two, paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <Animated.View entering={enter(FadeInDown.duration(Motion.duration.slow))} style={styles.hero}>
          <View style={styles.heroTitle}>
            <View style={styles.heroFlag}>
              <Flag emoji={city.flag} width={42} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <ThemedText type="display">{city.name}</ThemedText>
              <ThemedText type="default" themeColor="textSecondary">
                {city.country}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="body" themeColor="textSecondary">
            {city.blurb}
          </ThemedText>
          <View style={styles.chips}>
            {vetoedBy(trip, city.code).length > 0 && (
              <Chip
                tone="accent"
                label={`Ruled out by ${vetoedBy(trip, city.code).map((t) => t.name).join(', ')}`}
              />
            )}
            <Chip
              icon={weather.hazard && weather.hazard !== 'Extreme heat' ? 'rain' : 'sun'}
              label={`${monthName(trip.month)} · ${weather.highC}°C${weather.hazard ? ` · ${weather.hazard}` : ''}`}
              tone={weather.hazard ? 'warning' : 'neutral'}
            />
            <Chip
              label={
                season === 'shoulder'
                  ? 'Shoulder season'
                  : `${season === 'peak' ? 'Peak' : 'Low'} season · rooms ${seasonShift > 0 ? '+' : ''}${seasonShift}%`
              }
              tone={season === 'peak' ? 'accent' : 'neutral'}
            />
          </View>
        </Animated.View>

        <Animated.View entering={enter(FadeInDown.delay(80).duration(Motion.duration.slow))}>
          <Card style={styles.mapCard}>
            <WorldMap origins={origins} destination={city.code} />
          </Card>
        </Animated.View>

        {!result ? (
          <View style={styles.summary}>
            <SkeletonBlock width={160} height={34} />
            <SkeletonBlock width={240} height={16} />
          </View>
        ) : (
          <>
            <Animated.View
              entering={enter(FadeInDown.delay(140).duration(Motion.duration.slow))}
              style={styles.summary}>
              <View style={styles.summaryLead}>
                <AnimatedNumber type="priceLarge" value={result.avgCost} format={money} fromZero />
                <ThemedText type="body" themeColor="textSecondary">
                  each, estimated average
                </ThemedText>
              </View>
              <ThemedText type="default" themeColor="textSecondary">
                {money(result.totalCost)} for the group · the split is {percent(result.fairness * 100)} even
              </ThemedText>
            </Animated.View>

            <Animated.View entering={enter(FadeInDown.delay(200).duration(Motion.duration.slow))} style={{ gap: Spacing.three }}>
              <ThemedText type="heading" style={{ paddingHorizontal: Spacing.one }}>
                Who pays what
              </ThemedText>
              {result.perTraveler.map((cost, i) => {
                const traveler = trip.travelers.find((t) => t.id === cost.travelerId);
                if (!traveler) return null;
                return (
                  <Animated.View key={cost.travelerId} layout={LinearTransition.springify().damping(Motion.glide.damping)}>
                    <BoardingPass
                      traveler={traveler}
                      cost={cost}
                      index={i}
                      count={result.perTraveler.length}
                      destinationCode={city.code}
                      month={trip.month}
                      nights={trip.nights}
                      open={expanded === cost.travelerId}
                      onToggle={() => setExpanded((cur) => (cur === cost.travelerId ? null : cost.travelerId))}
                    />
                  </Animated.View>
                );
              })}
            </Animated.View>

            <Animated.View entering={enter(FadeInDown.delay(260).duration(Motion.duration.slow))}>
              <Card style={styles.vetoCard}>
                <View style={{ gap: 2 }}>
                  <ThemedText type="heading">Anyone out?</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Tap a name to rule {city.name} out for them. It leaves the ranking for
                    everyone; restore it from Refine.
                  </ThemedText>
                </View>
                <View style={styles.vetoRow}>
                  {trip.travelers.map((t, i) => {
                    const out = t.vetoes?.includes(city.code) ?? false;
                    return (
                      <PressableScale
                        key={t.id}
                        feedback={false}
                        accessibilityLabel={`${t.name} is ${out ? 'out' : 'in'} on ${city.name}`}
                        accessibilityState={{ selected: out }}
                        onPress={() => {
                          haptic('selection');
                          saveTrip(toggleVeto(trip, t.id, city.code));
                        }}
                        style={[
                          styles.vetoPill,
                          {
                            backgroundColor: out ? theme.danger : theme.backgroundSelected,
                          },
                        ]}>
                        <Avatar name={t.name} index={i} size={24} />
                        <ThemedText type="smallBold" style={{ color: out ? '#FFFFFF' : theme.text }}>
                          {t.name}
                        </ThemedText>
                        <ThemedText type="caption" style={{ color: out ? '#FFFFFF' : theme.textSecondary }}>
                          {out ? 'Out' : 'In'}
                        </ThemedText>
                      </PressableScale>
                    );
                  })}
                </View>
              </Card>
            </Animated.View>

            <Animated.View entering={enter(FadeInDown.delay(320).duration(Motion.duration.slow))}>
              <LivePricesCard
                cityCode={city.code}
                month={trip.month}
                nights={trip.nights}
                travelers={trip.travelers}
              />
            </Animated.View>

            <ThemedText type="small" themeColor="textSecondary" style={styles.footnote}>
              Estimates for {monthName(trip.month)}, calibrated to September 2026 fares and hotel
              rates: a typical return economy fare, a mid-range double room shared two to a room
              {city.feeNote ? ` (${city.feeNote.toLowerCase()})` : ''}, and everyday spending. Live
              prices will differ; check before booking.
            </ThemedText>
          </>
        )}
      </Animated.ScrollView>
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
  hero: { gap: Spacing.two + 2 },
  heroTitle: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two + 4 },
  heroFlag: { paddingTop: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  mapCard: { padding: Spacing.two },
  summary: { gap: Spacing.one, paddingHorizontal: Spacing.one },
  summaryLead: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two, flexWrap: 'wrap' },
  footnote: { paddingHorizontal: Spacing.one },
  vetoCard: { padding: Spacing.three, gap: Spacing.three },
  vetoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  vetoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: TouchTarget,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.three,
    borderRadius: 999,
  },
});
