import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandGradient, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cityLabel } from '@/lib/data/cities';
import { monthName } from '@/lib/format';
import { useTrips } from '@/lib/store';
import type { Trip } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const { trips, hydrated } = useTrips();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.content}>
        <FlatList
          data={trips}
          keyExtractor={(t) => t.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: Spacing.two + 4,
            paddingBottom: Spacing.three,
            paddingTop: insets.top + Spacing.four,
          }}
          ListHeaderComponent={
            <View style={{ gap: Spacing.two, paddingBottom: Spacing.three }}>
              <LinearGradient
                colors={BrandGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>✈️ GoTogether</Text>
              </LinearGradient>
              <ThemedText type="title">Where should{'\n'}we all meet?</ThemedText>
              <ThemedText themeColor="textSecondary">
                Add your friends and their home cities — GoTogether ranks the cities where a
                get-together is cheapest and fairest for everyone.
              </ThemedText>
            </View>
          }
          ListEmptyComponent={
            hydrated ? (
              <Card style={styles.emptyCard}>
                <Text style={{ fontSize: 40 }}>🌍</Text>
                <ThemedText type="heading">No trips yet. Plan your first one!</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
                  Pick a month, add at least two friends, and see where the group should fly.
                </ThemedText>
              </Card>
            ) : null
          }
          renderItem={({ item }) => (
            <TripRow trip={item} onPress={() => router.push(`/trip/${item.id}`)} />
          )}
        />
        <View style={{ paddingBottom: Spacing.four, paddingTop: Spacing.two }}>
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
    <Card onPress={onPress} style={styles.row}>
      <LinearGradient
        colors={BrandGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.stripe}
      />
      <View style={{ flex: 1, gap: 3, paddingVertical: Spacing.three }}>
        <ThemedText type="heading">{trip.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {monthName(trip.month)} · {trip.nights} nights · {trip.travelers.length} friends
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {origins.map(cityLabel).join('   ')}
        </ThemedText>
      </View>
      <ThemedText type="heading" style={{ color: theme.tint, paddingRight: Spacing.three }}>
        ›
      </ThemedText>
    </Card>
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
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroBadgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    overflow: 'hidden',
  },
  stripe: {
    width: 5,
    alignSelf: 'stretch',
  },
});
