import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CompositionBar } from '@/components/cost-bar';
import { DotLeader, Rule } from '@/components/rule';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  CostColors,
  DangerColor,
  MaxContentWidth,
  Spacing,
  SuccessColor,
  travelerColor,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCity } from '@/lib/data/cities';
import { money, monthName } from '@/lib/format';
import { rankDestinations } from '@/lib/scoring';
import { useTrip } from '@/lib/store';
import type { DestinationResult, TravelerCost } from '@/lib/types';

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
        <View style={styles.hero}>
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
          <ThemedText type="label" themeColor="textSecondary">
            {city.vibes.join(' · ')}
          </ThemedText>
        </View>

        {!result ? (
          <View style={[styles.center, { paddingVertical: Spacing.six }]}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <Rule weight="dashed" />
            <View style={styles.stats}>
              <Stat label="group total" value={money(result.totalCost)} />
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <Stat label="each" value={money(result.avgCost)} />
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <Stat label="even split" value={`${Math.round(result.fairness * 100)}%`} />
            </View>
            <Rule weight="dashed" />

            <View style={styles.section}>
              <ThemedText type="label" themeColor="textSecondary">
                Who pays what
              </ThemedText>
              <Rule weight="strong" />
              {result.perTraveler.map((cost, i) => {
                const traveler = trip.travelers.find((t) => t.id === cost.travelerId);
                if (!traveler) return null;
                return (
                  <View key={cost.travelerId}>
                    <TravelerBlock
                      cost={cost}
                      index={i}
                      name={traveler.name}
                      originCode={traveler.originCode}
                      budget={traveler.budget}
                    />
                    {i < result.perTraveler.length - 1 && <Rule />}
                  </View>
                );
              })}
              <Rule weight="strong" />
            </View>

            <ThemedText type="small" themeColor="textSecondary">
              Figures are estimates for {monthName(trip.month)}: the cheapest typical return fare,
              a mid-range room shared two to a room, and everyday spending on the ground. Connect
              the pricing proxy for live flight and hotel quotes.
            </ThemedText>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function TravelerBlock({
  cost,
  index,
  name,
  originCode,
  budget,
}: {
  cost: TravelerCost;
  index: number;
  name: string;
  originCode: string;
  budget?: number;
}) {
  const origin = getCity(originCode);

  return (
    <View style={styles.travelerBlock}>
      <View style={styles.travelerHead}>
        <View style={[styles.swatch, { backgroundColor: travelerColor(index) }]} />
        <View style={{ flex: 1 }}>
          <ThemedText type="heading">{name}</ThemedText>
          <ThemedText type="label" themeColor="textSecondary">
            {cost.isHome ? 'Lives here · no flight' : `Flying from ${origin.name}`}
          </ThemedText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText type="priceLarge">{money(cost.total)}</ThemedText>
          {budget ? (
            <ThemedText
              type="label"
              style={{ color: cost.overBudget ? DangerColor : SuccessColor }}>
              {cost.overBudget
                ? `${money(cost.total - budget)} over`
                : `${money(budget - cost.total)} spare`}
            </ThemedText>
          ) : null}
        </View>
      </View>

      <CompositionBar
        segments={[
          { value: cost.flight, color: CostColors.flight },
          { value: cost.hotelShare, color: CostColors.hotel },
          { value: cost.daily, color: CostColors.daily },
        ]}
      />

      <View style={{ gap: 3 }}>
        <LineItem label="Return flight" value={money(cost.flight)} color={CostColors.flight} />
        <LineItem
          label="Bed in a shared room"
          value={money(cost.hotelShare)}
          color={CostColors.hotel}
        />
        <LineItem
          label="Food & getting around"
          value={money(cost.daily)}
          color={CostColors.daily}
        />
      </View>
    </View>
  );
}

function LineItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.lineItem}>
      <View style={[styles.tick, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <DotLeader />
      <ThemedText type="small" style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </ThemedText>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
      <ThemedText type="price">{value}</ThemedText>
      <ThemedText type="label" themeColor="textSecondary">
        {label}
      </ThemedText>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  hero: {
    gap: Spacing.two + 2,
  },
  heroTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  heroFlag: {
    fontSize: 34,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  section: {
    gap: Spacing.two,
  },
  travelerBlock: {
    paddingVertical: Spacing.three,
    gap: Spacing.two + 2,
  },
  travelerHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two + 2,
  },
  swatch: {
    width: 9,
    height: 9,
    borderRadius: 1,
    marginTop: 9,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tick: {
    width: 6,
    height: 6,
    borderRadius: 1,
    marginRight: Spacing.two,
  },
});
