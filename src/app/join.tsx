import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { cityLabel } from '@/lib/data/cities';
import { monthName } from '@/lib/format';
import { decodeTrip } from '@/lib/share';
import { useTrips } from '@/lib/store';

/** Landing screen for shared trip links (/join?d=<encoded trip>). */
export default function JoinScreen() {
  const router = useRouter();
  const { d } = useLocalSearchParams<{ d?: string }>();
  const { saveTrip } = useTrips();

  const trip = useMemo(() => (d ? decodeTrip(d) : null), [d]);

  const accept = () => {
    if (!trip) return;
    saveTrip(trip);
    router.replace(`/trip/${trip.id}`);
  };

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: 'Trip invite' }} />
      <View style={styles.content}>
        {!trip || trip.travelers.length === 0 ? (
          <Card style={styles.card}>
            <Text style={{ fontSize: 40 }}>🤔</Text>
            <ThemedText type="heading">This invite link doesn’t work</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              The link may be incomplete or from a newer version of GoTogether. Ask your friend to
              share it again.
            </ThemedText>
            <Button title="Go home" variant="secondary" onPress={() => router.replace('/')} />
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={{ fontSize: 40 }}>💌</Text>
            <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
              You’re invited to plan{'\n'}“{trip.name}”
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              {monthName(trip.month)} · {trip.nights} nights ·{' '}
              {trip.travelers.map((t) => `${t.name} (${cityLabel(t.originCode)})`).join(', ')}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              A copy is saved to your trips — add yourself and your budget, then compare rankings.
            </ThemedText>
            <Button title="Add to my trips" onPress={accept} style={{ alignSelf: 'stretch' }} />
          </Card>
        )}
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
    padding: Spacing.three,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
});
