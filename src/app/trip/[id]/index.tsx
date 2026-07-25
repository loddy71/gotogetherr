import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ResultRow } from '@/components/result-row';
import { Rule } from '@/components/rule';
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

const MODE_BLURB: Record<RankMode, string> = {
  cheapest: 'Ranked by the lowest total bill for the group, whoever ends up paying it.',
  balanced: 'Ranked on total cost and an even split together — the usual compromise.',
  fairest: 'Ranked by how evenly the cost falls, even if the total is a little higher.',
};

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

  const mode = modeForWeight(trip.fairnessWeight);

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
            <View style={{ flexDirection: 'row', gap: Spacing.three, paddingRight: Spacing.two }}>
              <HeaderAction label={copied ? 'Copied' : 'Share'} onPress={share} />
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
          ItemSeparatorComponent={() => <Rule />}
          ListHeaderComponent={
            <View>
              <View style={styles.summary}>
                <ThemedText type="label" themeColor="textSecondary">
                  {monthName(trip.month)} · {trip.nights} nights · {trip.travelers.length} flying in
                </ThemedText>
                <View style={styles.legend}>
                  {trip.travelers.map((t, i) => (
                    <View key={t.id} style={styles.legendItem}>
                      <View style={[styles.swatch, { backgroundColor: travelerColor(i) }]} />
                      <ThemedText type="small" themeColor="textSecondary">
                        {t.name}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              <Segmented<RankMode>
                options={[
                  { value: 'cheapest', label: 'Cheapest' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'fairest', label: 'Fairest' },
                ]}
                value={mode}
                onChange={(next) => saveTrip({ ...trip, fairnessWeight: MODE_WEIGHT[next] })}
              />
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={{ paddingVertical: Spacing.three }}>
                {MODE_BLURB[mode]} Each figure is one person&apos;s share: return flight, a bed in a
                shared room, and food on the ground.
              </ThemedText>
              <Rule weight="strong" />
            </View>
          }
          ListEmptyComponent={
            <View style={[styles.center, { paddingVertical: Spacing.six }]}>
              <ActivityIndicator />
            </View>
          }
          ListFooterComponent={<View style={{ height: Spacing.six }} />}
          renderItem={({ item, index }) => (
            <ResultRow
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
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={10}>
      <ThemedText type="label" style={{ color: theme.tint }}>
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
    paddingHorizontal: Spacing.four,
  },
  summary: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    gap: Spacing.two + 2,
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
  swatch: {
    width: 9,
    height: 9,
    borderRadius: 1,
  },
});
