import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cityLabel } from '@/lib/data/cities';
import { monthName } from '@/lib/format';
import { useTrips } from '@/lib/store';
import type { Trip } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const { trips, hydrated } = useTrips();

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.content}>
        <FlatList
          data={trips}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ gap: Spacing.two, paddingVertical: Spacing.three }}
          ListHeaderComponent={
            <View style={{ gap: Spacing.one, paddingBottom: Spacing.two }}>
              <ThemedText type="subtitle">Where should we all meet?</ThemedText>
              <ThemedText themeColor="textSecondary">
                Add your friends and their home cities — GoTogether ranks the cities where a
                get-together is cheapest and fairest for everyone.
              </ThemedText>
            </View>
          }
          ListEmptyComponent={
            hydrated ? (
              <ThemedText themeColor="textSecondary" style={{ paddingVertical: Spacing.four }}>
                No trips yet. Plan your first one!
              </ThemedText>
            ) : null
          }
          renderItem={({ item }) => (
            <TripRow trip={item} onPress={() => router.push(`/trip/${item.id}`)} />
          )}
        />
        <View style={{ paddingBottom: Spacing.four }}>
          <Button title="＋ Plan a trip" onPress={() => router.push('/new-trip')} />
        </View>
      </View>
    </ThemedView>
  );
}

function TripRow({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const theme = useTheme();
  const origins = [...new Set(trip.travelers.map((t) => t.originCode))];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}>
      <ThemedText style={{ fontWeight: '700' }}>{trip.name}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {monthName(trip.month)} · {trip.nights} nights · {trip.travelers.length} friends
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {origins.map(cityLabel).join('  ')}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  row: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
  },
});
