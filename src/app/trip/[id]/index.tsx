import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ResultCard } from '@/components/result-card';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, travelerColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { monthName } from '@/lib/format';
import { rankDestinations } from '@/lib/scoring';
import { shareTrip } from '@/lib/share';
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
  const [copied, setCopied] = useState(false);

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

  const share = async () => {
    const outcome = await shareTrip(trip);
    if (outcome === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen
        options={{
          title: trip.name,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: Spacing.three }}>
              <HeaderAction label={copied ? 'Copied!' : 'Share'} onPress={share} />
              <HeaderAction label="Edit" onPress={() => router.push(`/new-trip?id=${trip.id}`)} />
            </View>
          ),
        }}
      />
      <View style={styles.content}>
        <FlatList
          data={results ?? []}
          keyExtractor={(r) => r.cityCode}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.two + 4, paddingVertical: Spacing.three }}
          ListHeaderComponent={
            <View style={{ gap: Spacing.two + 4, paddingBottom: Spacing.two }}>
              <ThemedText type="small" themeColor="textSecondary">
                {monthName(trip.month)} · {trip.nights} nights
              </ThemedText>
              <View style={styles.legend}>
                {trip.travelers.map((t, i) => (
                  <View key={t.id} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: travelerColor(i) }]} />
                    <ThemedText type="small" themeColor="textSecondary">
                      {t.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
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
                Estimates per person: return flight + shared mid-range hotel + daily costs. The bar
                shows how the cost splits across the group — tap a city for details.
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

function HeaderAction({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
      <ThemedText type="smallBold" style={{ color: theme.tint }}>
        {label}
      </ThemedText>
    </Pressable>
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
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    rowGap: Spacing.one,
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
});
