import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cityLabel, getCity } from '@/lib/data/cities';
import { money, monthName } from '@/lib/format';
import { rankDestinations } from '@/lib/scoring';
import { useTrip } from '@/lib/store';
import type { DestinationResult } from '@/lib/types';

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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ gap: Spacing.one }}>
          <ThemedText type="subtitle">
            {city.flag} {city.name}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{city.blurb}</ThemedText>
          <View style={styles.badges}>
            {city.vibes.map((vibe) => (
              <View key={vibe} style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
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
            <View style={[styles.summary, { backgroundColor: theme.backgroundElement }]}>
              <SummaryItem label="group total" value={money(result.totalCost)} />
              <SummaryItem label="avg / person" value={money(result.avgCost)} />
              <SummaryItem label="fairness" value={`${(result.fairness * 100).toFixed(0)}%`} />
            </View>

            <View style={{ gap: Spacing.two }}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                PER-PERSON BREAKDOWN — {monthName(trip.month).toUpperCase()}, {trip.nights} NIGHTS
              </ThemedText>
              {result.perTraveler.map((cost) => {
                const traveler = trip.travelers.find((t) => t.id === cost.travelerId);
                if (!traveler) return null;
                return (
                  <View
                    key={cost.travelerId}
                    style={[styles.travelerCard, { backgroundColor: theme.backgroundElement }]}>
                    <View style={styles.travelerHeader}>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ fontWeight: '700' }}>{traveler.name}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          from {cityLabel(traveler.originCode)}
                          {cost.isHome ? ' · already home 🏠' : ''}
                        </ThemedText>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <ThemedText style={{ fontWeight: '700' }}>{money(cost.total)}</ThemedText>
                        {cost.overBudget && traveler.budget ? (
                          <ThemedText type="small" style={{ color: '#E5484D' }}>
                            {money(cost.total - traveler.budget)} over budget
                          </ThemedText>
                        ) : traveler.budget ? (
                          <ThemedText type="small" themeColor="textSecondary">
                            {money(traveler.budget - cost.total)} under budget
                          </ThemedText>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.breakdown}>
                      <BreakdownItem label="Return flight" value={money(cost.flight)} />
                      <BreakdownItem label="Hotel (shared)" value={money(cost.hotelShare)} />
                      <BreakdownItem label="Food & local" value={money(cost.daily)} />
                    </View>
                  </View>
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

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <ThemedText style={{ fontWeight: '700' }}>{value}</ThemedText>
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + Spacing.half,
    marginTop: Spacing.one,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  summary: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: Spacing.three,
  },
  travelerCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  travelerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  breakdown: {
    gap: Spacing.half,
  },
});
