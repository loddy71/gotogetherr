import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ResultCard } from '@/components/result-card';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { monthName } from '@/lib/format';
import { rankDestinations } from '@/lib/scoring';
import { useTrip, useTrips } from '@/lib/store';
import type { DestinationResult } from '@/lib/types';

type RankMode = 'cheapest' | 'balanced' | 'fairest';

const MODE_WEIGHT: Record<RankMode, number> = { cheapest: 0.1, balanced: 0.5, fairest: 0.9 };

function modeForWeight(weight: number): RankMode {
  if (weight < 0.3) return 'cheapest';
  if (weight > 0.7) return 'fairest';
  return 'balanced';
}

export default function ResultsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useTrip(id);
  const { saveTrip, hydrated } = useTrips();
  const [results, setResults] = useState<DestinationResult[] | null>(null);

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

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen
        options={{
          title: trip.name,
          headerRight: () => (
            <Button
              title="Edit"
              variant="secondary"
              style={styles.editButton}
              onPress={() => router.push(`/new-trip?id=${trip.id}`)}
            />
          ),
        }}
      />
      <View style={styles.content}>
        <FlatList
          data={results ?? []}
          keyExtractor={(r) => r.cityCode}
          contentContainerStyle={{ gap: Spacing.two, paddingVertical: Spacing.three }}
          ListHeaderComponent={
            <View style={{ gap: Spacing.two, paddingBottom: Spacing.two }}>
              <ThemedText type="small" themeColor="textSecondary">
                {monthName(trip.month)} · {trip.nights} nights ·{' '}
                {trip.travelers.map((t) => t.name).join(', ')}
              </ThemedText>
              <Segmented<RankMode>
                options={[
                  { value: 'cheapest', label: 'Cheapest' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'fairest', label: 'Fairest' },
                ]}
                value={modeForWeight(trip.fairnessWeight)}
                onChange={(mode) => saveTrip({ ...trip, fairnessWeight: MODE_WEIGHT[mode] })}
              />
              <ThemedText type="small" themeColor="textSecondary">
                Prices are estimates per person: return flight + shared mid-range hotel + daily
                costs. Tap a city for the full breakdown.
              </ThemedText>
            </View>
          }
          ListEmptyComponent={
            <View style={[styles.center, { paddingVertical: Spacing.six }]}>
              <ActivityIndicator />
            </View>
          }
          renderItem={({ item, index }) => (
            <ResultCard
              rank={index + 1}
              result={item}
              onPress={() => router.push(`/trip/${trip.id}/${item.cityCode}`)}
            />
          )}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
});
