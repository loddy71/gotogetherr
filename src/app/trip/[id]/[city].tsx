import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedNumber } from '@/components/animated-number';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { StackedBar } from '@/components/cost-bar';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { DotLeader } from '@/components/dot-leader';
import { HEADER_BAR_HEIGHT, ScreenHeader } from '@/components/screen-header';
import { SkeletonBlock } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorldMap } from '@/components/world-map';
import {
  CostColors,
  DangerColor,
  MaxContentWidth,
  Motion,
  Spacing,
  SuccessColor,
  travelerColor,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCity, hotelSeasonFactor, seasonOf, weatherFor } from '@/lib/data/cities';
import { money, monthName } from '@/lib/format';
import { flightHours } from '@/lib/pricing/mock-provider';
import { rankDestinations } from '@/lib/scoring';
import { toggleVeto, vetoedBy } from '@/lib/filters';
import { haptic } from '@/lib/haptics';
import { useTrip, useTrips } from '@/lib/store';
import type { DestinationResult, Traveler, TravelerCost } from '@/lib/types';

const percent = (n: number) => `${Math.round(n)}%`;

export default function DestinationScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id, city: cityCode } = useLocalSearchParams<{ id: string; city: string }>();
  const trip = useTrip(id);
  const { saveTrip } = useTrips();
  const [result, setResult] = useState<DestinationResult | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  useEffect(() => {
    if (!trip) return;
    let cancelled = false;
    rankDestinations(trip).then((all) => {
      if (!cancelled) setResult(all.find((r) => r.cityCode === cityCode) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [trip, cityCode]);

  const origins = useMemo(
    () =>
      (trip?.travelers ?? []).map((t, i) => ({ key: t.id, code: t.originCode, color: travelerColor(i) })),
    [trip?.travelers],
  );

  if (!trip || !cityCode) {
    return (
      <ThemedView style={[styles.screen, styles.center]}>
        <ThemedText themeColor="textSecondary">This trip no longer exists.</ThemedText>
      </ThemedView>
    );
  }

  const city = getCity(cityCode);
  const weather = weatherFor(city, trip.month);
  const season = seasonOf(city, trip.month);
  const seasonShift = Math.round((hotelSeasonFactor(city, trip.month) - 1) * 100);

  return (
    <ThemedView style={styles.screen}>
      <ScreenHeader title={city.name} scrollY={scrollY} collapseAt={90} />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + HEADER_BAR_HEIGHT + Spacing.two, paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <Animated.View entering={FadeInDown.duration(Motion.duration.slow)} style={styles.hero}>
          <ThemedText type="label" style={{ color: theme.tint }}>
            {city.country}
          </ThemedText>
          <View style={styles.heroTitle}>
            <Text style={styles.heroFlag}>{city.flag}</Text>
            <ThemedText type="display" style={{ flexShrink: 1 }}>
              {city.name}
            </ThemedText>
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

        <Animated.View entering={FadeInDown.delay(80).duration(Motion.duration.slow)}>
          <Card style={styles.mapCard}>
            <WorldMap origins={origins} destination={city.code} />
          </Card>
        </Animated.View>

        {!result ? (
          <Card style={[styles.stats, { padding: Spacing.four }]}>
            <SkeletonBlock width="100%" height={40} />
          </Card>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(140).duration(Motion.duration.slow)}>
              <Card style={styles.stats}>
                <Stat label="Group total" value={result.totalCost} format={money} />
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <Stat label="Each" value={result.avgCost} format={money} />
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <Stat label="Even split" value={result.fairness * 100} format={percent} />
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(Motion.duration.slow)} style={{ gap: Spacing.three }}>
              <ThemedText type="label" themeColor="textSecondary" style={{ paddingHorizontal: Spacing.one }}>
                Who pays what
              </ThemedText>
              {result.perTraveler.map((cost, i) => {
                const traveler = trip.travelers.find((t) => t.id === cost.travelerId);
                if (!traveler) return null;
                return (
                  <Animated.View key={cost.travelerId} layout={LinearTransition.springify().damping(Motion.glide.damping)}>
                    <TravelerCard
                      traveler={traveler}
                      cost={cost}
                      index={i}
                      destinationCode={city.code}
                      open={expanded === cost.travelerId}
                      onToggle={() => setExpanded((cur) => (cur === cost.travelerId ? null : cost.travelerId))}
                    />
                  </Animated.View>
                );
              })}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(260).duration(Motion.duration.slow)}>
              <Card style={styles.vetoCard}>
                <View style={{ gap: 2 }}>
                  <ThemedText type="label" themeColor="textSecondary">
                    Anyone out?
                  </ThemedText>
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
                            backgroundColor: out ? theme.tint : theme.backgroundSelected,
                          },
                        ]}>
                        <Avatar name={t.name} index={i} size={24} />
                        <ThemedText type="smallBold" style={{ color: out ? '#FCFAF6' : theme.text }}>
                          {t.name}
                        </ThemedText>
                        <ThemedText type="caption" style={{ color: out ? '#FCFAF6' : theme.textSecondary }}>
                          {out ? 'Out' : 'In'}
                        </ThemedText>
                      </PressableScale>
                    );
                  })}
                </View>
              </Card>
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

function Stat({ label, value, format }: { label: string; value: number; format: (n: number) => string }) {
  return (
    <View style={styles.stat}>
      <AnimatedNumber type="price" value={value} format={format} fromZero />
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

function TravelerCard({
  traveler,
  cost,
  index,
  destinationCode,
  open,
  onToggle,
}: {
  traveler: Traveler;
  cost: TravelerCost;
  index: number;
  destinationCode: string;
  open: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const origin = getCity(traveler.originCode);
  const hours = flightHours(traveler.originCode, destinationCode);

  const rotation = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    rotation.set(withSpring(open ? 1 : 0, Motion.snappy));
  }, [open, rotation]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <PressableScale
      onPress={onToggle}
      scaleTo={0.985}
      feedback="selection"
      accessibilityState={{ expanded: open }}>
      <Card style={styles.travelerCard}>
        <View style={styles.travelerHead}>
          <Avatar name={traveler.name} index={index} size={36} />
          <View style={{ flex: 1, gap: 1 }}>
            <ThemedText type="defaultBold">{traveler.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {cost.isHome ? 'Lives here, no flight' : `From ${origin.name} · ≈ ${formatHours(hours)} flying`}
            </ThemedText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <AnimatedNumber type="price" value={cost.total} format={money} fromZero />
            {traveler.budget ? (
              <ThemedText type="caption" style={{ color: cost.overBudget ? DangerColor : SuccessColor }}>
                {cost.overBudget
                  ? `${money(cost.total - traveler.budget)} over budget`
                  : `${money(traveler.budget - cost.total)} under budget`}
              </ThemedText>
            ) : null}
          </View>
          <Animated.View style={chevronStyle}>
            <Icon name="chevron-down" size={18} color={theme.textSecondary} />
          </Animated.View>
        </View>

        <StackedBar
          delay={200 + index * Motion.stagger}
          segments={[
            { key: 'flight', value: cost.flight, color: CostColors.flight },
            { key: 'hotel', value: cost.hotelShare, color: CostColors.hotel },
            { key: 'daily', value: cost.daily, color: CostColors.daily },
          ]}
        />

        {open && (
          <Animated.View entering={FadeIn.duration(Motion.duration.base)} style={{ gap: 6 }}>
            <LineItem label="Return flight" value={cost.flight} color={CostColors.flight} />
            <LineItem label="Share of the room" value={cost.hotelShare} color={CostColors.hotel} />
            <LineItem label="Food & getting around" value={cost.daily} color={CostColors.daily} />
          </Animated.View>
        )}
      </Card>
    </PressableScale>
  );
}

function LineItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.lineItem}>
      <View style={[styles.tick, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <DotLeader />
      <ThemedText type="smallBold" style={{ fontVariant: ['tabular-nums'] }}>
        {money(value)}
      </ThemedText>
    </View>
  );
}

function formatHours(h: number): string {
  const whole = Math.floor(h);
  const minutes = Math.round((h - whole) * 60 / 15) * 15;
  if (minutes === 60) return `${whole + 1} h`;
  return minutes ? `${whole} h ${minutes} min` : `${whole} h`;
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
  heroTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2 },
  heroFlag: { fontSize: 34 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  mapCard: { padding: Spacing.two },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three + 2,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  travelerCard: { padding: Spacing.three, gap: Spacing.three },
  travelerHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  lineItem: { flexDirection: 'row', alignItems: 'center' },
  tick: { width: 7, height: 7, borderRadius: 2, marginRight: Spacing.two },
  footnote: { paddingHorizontal: Spacing.one },
  vetoCard: { padding: Spacing.three, gap: Spacing.three },
  vetoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  vetoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingLeft: 4,
    paddingRight: Spacing.three,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
