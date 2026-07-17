import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  cityGradient,
  DangerColor,
  MaxContentWidth,
  Radius,
  Spacing,
  SuccessColor,
  travelerColor,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cityLabel, getCity } from '@/lib/data/cities';
import { money, monthName } from '@/lib/format';
import { rankDestinations } from '@/lib/scoring';
import { useTrip } from '@/lib/store';
import type { DestinationResult, TravelerCost } from '@/lib/types';

const COST_COLORS = { flight: '#5B4DE0', hotel: '#0EA5E9', daily: '#F59E0B' } as const;

export default function DestinationScreen() {
  const theme = useTheme();
  const { id, city: cityCode } = useLocalSearchParams<{ id: string; city: string }>();
  const trip = useTrip(id);
  const [result, setResult] = useState<DestinationResult | null>(null);

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

  if (!trip || !cityCode) {
    return (
      <ThemedView style={[styles.screen, styles.center]}>
        <ThemedText themeColor="textSecondary">This trip no longer exists.</ThemedText>
      </ThemedView>
    );
  }

  const city = getCity(cityCode);

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: city.name }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={cityGradient(city.vibes, city.code)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <Text style={styles.heroFlag}>{city.flag}</Text>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.heroTitle}>{city.name}</Text>
            <Text style={styles.heroCountry}>{city.country}</Text>
          </View>
        </LinearGradient>

        <View style={{ gap: Spacing.two }}>
          <ThemedText themeColor="textSecondary">{city.blurb}</ThemedText>
          <View style={styles.badges}>
            {city.vibes.map((vibe) => (
              <View
                key={vibe}
                style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText type="small" themeColor="textSecondary">
                  {vibe}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {!result ? (
          <View style={[styles.center, { paddingVertical: Spacing.six }]}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <Card style={styles.summary}>
              <SummaryItem label="group total" value={money(result.totalCost)} />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <SummaryItem label="avg / person" value={money(result.avgCost)} />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <SummaryItem label="fairness" value={`${(result.fairness * 100).toFixed(0)}%`} />
            </Card>

            <View style={{ gap: Spacing.two + 2 }}>
              <ThemedText type="label" themeColor="textSecondary">
                PER-PERSON BREAKDOWN — {monthName(trip.month).toUpperCase()}, {trip.nights} NIGHTS
              </ThemedText>
              <View style={styles.costLegend}>
                <LegendItem color={COST_COLORS.flight} label="flight" />
                <LegendItem color={COST_COLORS.hotel} label="hotel" />
                <LegendItem color={COST_COLORS.daily} label="food & local" />
              </View>
              {result.perTraveler.map((cost, i) => {
                const traveler = trip.travelers.find((t) => t.id === cost.travelerId);
                if (!traveler) return null;
                return (
                  <TravelerCard
                    key={cost.travelerId}
                    cost={cost}
                    index={i}
                    name={traveler.name}
                    origin={traveler.originCode}
                    budget={traveler.budget}
                  />
                );
              })}
            </View>

            <ThemedText type="small" themeColor="textSecondary">
              All prices are deterministic estimates (mid-range hotel, double occupancy, typical
              return fares for {monthName(trip.month)}). Live flight & hotel quotes are on the
              roadmap — see the repo README.
            </ThemedText>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function TravelerCard({
  cost,
  index,
  name,
  origin,
  budget,
}: {
  cost: TravelerCost;
  index: number;
  name: string;
  origin: string;
  budget?: number;
}) {
  const total = cost.total || 1;

  return (
    <Card style={styles.travelerCard}>
      <View style={styles.travelerHeader}>
        <View style={[styles.travelerDot, { backgroundColor: travelerColor(index) }]} />
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontWeight: '700' }}>{name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            from {cityLabel(origin)}
            {cost.isHome ? ' · already home 🏠' : ''}
          </ThemedText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText type="stat">{money(cost.total)}</ThemedText>
          {cost.overBudget && budget ? (
            <ThemedText type="small" style={{ color: DangerColor, fontWeight: '700' }}>
              {money(cost.total - budget)} over budget
            </ThemedText>
          ) : budget ? (
            <ThemedText type="small" style={{ color: SuccessColor }}>
              {money(budget - cost.total)} under budget
            </ThemedText>
          ) : null}
        </View>
      </View>

      <View style={styles.costBar}>
        {cost.flight > 0 && (
          <View style={{ flex: cost.flight / total, backgroundColor: COST_COLORS.flight }} />
        )}
        <View style={{ flex: cost.hotelShare / total, backgroundColor: COST_COLORS.hotel }} />
        <View style={{ flex: cost.daily / total, backgroundColor: COST_COLORS.daily }} />
      </View>

      <View style={styles.breakdown}>
        <BreakdownItem label="Return flight" value={money(cost.flight)} />
        <BreakdownItem label="Hotel (shared)" value={money(cost.hotelShare)} />
        <BreakdownItem label="Food & local" value={money(cost.daily)} />
      </View>
    </Card>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1, gap: 2 }}>
      <ThemedText type="stat">{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

function BreakdownItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.lg,
    padding: Spacing.four,
  },
  heroFlag: {
    fontSize: 56,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroCountry: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + Spacing.half,
  },
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: Spacing.one,
  },
  costLegend: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  travelerCard: {
    padding: Spacing.three,
    gap: Spacing.two + 2,
  },
  travelerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  travelerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  costBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  breakdown: {
    gap: Spacing.half,
  },
});
