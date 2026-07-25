import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Rule } from '@/components/rule';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CITIES, getCity } from '@/lib/data/cities';
import { monthName } from '@/lib/format';
import { useTrips } from '@/lib/store';
import type { Trip } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { trips, hydrated } = useTrips();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.content}>
        <FlatList
          data={trips}
          keyExtractor={(t) => t.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <Rule />}
          contentContainerStyle={{ paddingTop: insets.top + Spacing.four }}
          ListHeaderComponent={
            <View>
              <View style={styles.masthead}>
                <ThemedText type="label" style={{ letterSpacing: 2.4 }}>
                  GoTogether
                </ThemedText>
                <ThemedText type="label" themeColor="textSecondary">
                  {CITIES.length} cities
                </ThemedText>
              </View>
              <Rule weight="strong" />

              <View style={styles.intro}>
                <ThemedText type="display">
                  Find the fairest{'\n'}place to meet.
                </ThemedText>
                <ThemedText type="body" themeColor="textSecondary">
                  Everyone lives somewhere different. GoTogether prices every candidate city per
                  person — the flight, a shared hotel, food on the ground — then ranks where the
                  trip costs least and lands most evenly.
                </ThemedText>
              </View>

              <View style={styles.sectionHead}>
                <ThemedText type="label" themeColor="textSecondary">
                  {trips.length > 0 ? 'Your trips' : 'Start here'}
                </ThemedText>
              </View>
              <Rule weight="strong" />
            </View>
          }
          ListEmptyComponent={
            hydrated ? (
              <View style={styles.empty}>
                <ThemedText type="heading" themeColor="textSecondary">
                  Nothing planned yet.
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Name the trip, pick a month, add the friends and where they fly from. Two people
                  is enough to start.
                </ThemedText>
              </View>
            ) : null
          }
          ListFooterComponent={
            <View style={styles.index}>
              <ThemedText type="label" themeColor="textSecondary">
                In the index
              </ThemedText>
              <Rule weight="strong" />
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={{ lineHeight: 23 }}>
                {CITIES.map((c) => c.name).join('  ·  ')}
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <TripRow trip={item} onPress={() => router.push(`/trip/${item.id}`)} />
          )}
        />

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
          <Rule weight="strong" style={{ marginBottom: Spacing.three }} />
          <Button title="Plan a trip" onPress={() => router.push('/new-trip')} />
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={{ textAlign: 'center', marginTop: Spacing.two }}>
            Prices are estimates. Trips stay on this device.
          </ThemedText>
        </View>
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: insets.top, backgroundColor: theme.background }} />
    </ThemedView>
  );
}

function TripRow({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const theme = useTheme();
  const flags = [...new Set(trip.travelers.map((t) => t.originCode))].map(
    (code) => getCity(code).flag,
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.tripRow,
        pressed && { backgroundColor: theme.backgroundSelected },
      ]}>
      <View style={{ flex: 1, gap: Spacing.one + 1 }}>
        <ThemedText type="heading">{trip.name}</ThemedText>
        <ThemedText type="label" themeColor="textSecondary">
          {monthName(trip.month)} · {trip.nights} nights · {trip.travelers.length} friends
        </ThemedText>
        <Text style={styles.flags}>{flags.join('  ')}</Text>
      </View>
      <ThemedText type="heading" themeColor="textSecondary" style={{ marginTop: 2 }}>
        →
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
    paddingHorizontal: Spacing.four,
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
  },
  intro: {
    paddingTop: Spacing.four + 4,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  sectionHead: {
    paddingBottom: Spacing.two,
  },
  index: {
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  empty: {
    paddingVertical: Spacing.four,
    gap: Spacing.two,
    maxWidth: 380,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingVertical: Spacing.three + 2,
    paddingHorizontal: Spacing.one,
  },
  flags: {
    fontSize: 15,
    marginTop: 2,
  },
  footer: {
    paddingTop: Spacing.two,
  },
});
