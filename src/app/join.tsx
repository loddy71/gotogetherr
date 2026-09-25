import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { BOTTOM_BAR_CLEARANCE, BottomBar } from '@/components/bottom-bar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorldMap } from '@/components/world-map';
import { MaxContentWidth, Motion, Spacing, travelerColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCity } from '@/lib/data/cities';
import { monthName } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { decodeTrip } from '@/lib/share';
import { useTrips } from '@/lib/store';

/** Landing screen for shared trip links (/join?d=<encoded trip>). */
export default function JoinScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { d } = useLocalSearchParams<{ d?: string }>();
  const { saveTrip } = useTrips();

  const trip = useMemo(() => (d ? decodeTrip(d) : null), [d]);

  const accept = () => {
    if (!trip) return;
    haptic('success');
    saveTrip(trip);
    router.replace(`/trip/${trip.id}`);
  };

  if (!trip || trip.travelers.length === 0) {
    return (
      <ThemedView style={[styles.screen, { paddingTop: insets.top + Spacing.five }]}>
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
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.five, paddingBottom: BOTTOM_BAR_CLEARANCE },
        ]}>
        <Animated.View entering={FadeInDown.duration(Motion.duration.slow)} style={{ gap: Spacing.two }}>
          <ThemedText type="label" style={{ color: theme.tint }}>
            You&apos;re invited
          </ThemedText>
          <ThemedText type="display">{trip.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {monthName(trip.month)} · {trip.nights} nights · {trip.travelers.length} friends so far
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(Motion.duration.slow)}>
          <Card style={{ padding: Spacing.two }}>
            <WorldMap
              origins={trip.travelers.map((t, i) => ({ key: t.id, code: t.originCode, color: travelerColor(i) }))}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(Motion.duration.slow)}>
          <Card style={styles.list}>
            {trip.travelers.map((t, i) => {
              const city = getCity(t.originCode);
              return (
                <View key={t.id} style={styles.travelerRow}>
                  <Avatar name={t.name} index={i} size={32} />
                  <ThemedText type="defaultBold" style={{ flex: 1 }}>
                    {t.name}
                  </ThemedText>
                  <Text style={styles.flag}>{city.flag}</Text>
                  <ThemedText type="small" themeColor="textSecondary">
                    {city.name}
                  </ThemedText>
                </View>
              );
            })}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(Motion.duration.slow)}>
          <ThemedText type="body" themeColor="textSecondary">
            Take a copy of this trip, add yourself and what you can spend, and see which city works
            out fairest for the group.
          </ThemedText>
        </Animated.View>
      </ScrollView>

      <BottomBar>
        <Button title="Add to my trips" onPress={accept} />
      </BottomBar>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three + 4,
    gap: Spacing.four,
  },
  list: { padding: Spacing.three, gap: Spacing.three },
  travelerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flag: { fontSize: 17 },
});
