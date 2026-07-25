import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Rule } from '@/components/rule';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCity } from '@/lib/data/cities';
import { monthName } from '@/lib/format';
import { decodeTrip } from '@/lib/share';
import { useTrips } from '@/lib/store';

/** Landing screen for shared trip links (/join?d=<encoded trip>). */
export default function JoinScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { d } = useLocalSearchParams<{ d?: string }>();
  const { saveTrip } = useTrips();

  const trip = useMemo(() => (d ? decodeTrip(d) : null), [d]);

  const accept = () => {
    if (!trip) return;
    saveTrip(trip);
    router.replace(`/trip/${trip.id}`);
  };

  if (!trip || trip.travelers.length === 0) {
    return (
      <ThemedView style={styles.screen}>
        <Stack.Screen options={{ title: 'An invitation' }} />
        <View style={styles.content}>
          <ThemedText type="title">This invitation didn&apos;t survive the trip.</ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            The link looks incomplete. Ask whoever sent it to share it again.
          </ThemedText>
          <Button title="Start my own" variant="secondary" onPress={() => router.replace('/')} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: 'An invitation' }} />
      <View style={styles.content}>
        <ThemedText type="label" style={{ color: theme.tint }}>
          You&apos;re invited
        </ThemedText>
        <ThemedText type="display">{trip.name}</ThemedText>
        <ThemedText type="label" themeColor="textSecondary">
          {monthName(trip.month)} · {trip.nights} nights
        </ThemedText>

        <Rule weight="strong" style={{ marginVertical: Spacing.two }} />

        <View style={{ gap: Spacing.two + 2 }}>
          {trip.travelers.map((t) => {
            const city = getCity(t.originCode);
            return (
              <View key={t.id} style={styles.travelerRow}>
                <Text style={styles.flag}>{city.flag}</Text>
                <ThemedText type="default" style={{ flex: 1 }}>
                  {t.name}
                </ThemedText>
                <ThemedText type="label" themeColor="textSecondary">
                  {city.name}
                </ThemedText>
              </View>
            );
          })}
        </View>

        <Rule weight="strong" style={{ marginVertical: Spacing.two }} />

        <ThemedText type="body" themeColor="textSecondary">
          Take a copy of this trip, add yourself and what you can spend, and see which city works
          out fairest for the group.
        </ThemedText>

        <Button title="Add to my trips" onPress={accept} />
      </View>
    </ThemedView>
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
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  flag: {
    fontSize: 17,
  },
});
