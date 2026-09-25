import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarStack } from '@/components/avatar';
import { BOTTOM_BAR_CLEARANCE, BottomBar } from '@/components/bottom-bar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorldMap } from '@/components/world-map';
import { MaxContentWidth, Motion, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CITIES, getCity } from '@/lib/data/cities';
import { monthName } from '@/lib/format';
import { useTrips } from '@/lib/store';
import type { Trip } from '@/lib/types';

const ALL_CITY_CODES = CITIES.map((c) => c.code);

export default function HomeScreen() {
  const router = useRouter();
  const { trips, hydrated } = useTrips();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.screen}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.four, paddingBottom: BOTTOM_BAR_CLEARANCE },
        ]}>
        <Animated.View entering={FadeInDown.duration(Motion.duration.slow)} style={styles.masthead}>
          <ThemedText type="label" style={{ letterSpacing: 2 }}>
            GoTogether
          </ThemedText>
          <ThemedText type="label" themeColor="textSecondary">
            {CITIES.length} cities
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(60).duration(Motion.duration.slow)}
          style={styles.intro}>
          <ThemedText type="display">Find the fairest{'\n'}place to meet.</ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            Everyone lives somewhere different. GoTogether prices every city per person (flight,
            a shared room and food on the ground), then ranks where the trip costs least and splits
            most evenly.
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(Motion.duration.slow)}>
          <Card style={styles.mapCard}>
            <WorldMap markers={ALL_CITY_CODES} focus={false} aspect={2.5} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(Motion.duration.slow)} style={styles.sectionHead}>
          <ThemedText type="label" themeColor="textSecondary">
            {trips.length > 0 ? 'Your trips' : 'Start here'}
          </ThemedText>
        </Animated.View>

        {hydrated && trips.length === 0 && (
          <Animated.View entering={FadeInDown.delay(220).duration(Motion.duration.slow)}>
            <Card style={styles.empty}>
              <ThemedText type="heading">Nothing planned yet.</ThemedText>
              <ThemedText type="default" themeColor="textSecondary">
                Name the trip, pick a month, and add where everyone flies from. Two people is
                enough to start.
              </ThemedText>
            </Card>
          </Animated.View>
        )}

        <View style={{ gap: Spacing.three }}>
          {trips.map((trip, i) => (
            <Animated.View
              key={trip.id}
              entering={FadeInDown.delay(220 + i * Motion.stagger).duration(Motion.duration.slow)}
              layout={LinearTransition.springify().damping(Motion.glide.damping)}>
              <TripCard trip={trip} onPress={() => router.push(`/trip/${trip.id}`)} />
            </Animated.View>
          ))}
        </View>
      </Animated.ScrollView>

      <BottomBar>
        <Button title="Plan a trip" icon="plus" onPress={() => router.push('/new-trip')} />
      </BottomBar>
    </ThemedView>
  );
}

function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const theme = useTheme();
  const flags = [...new Set(trip.travelers.map((t) => t.originCode))].map(
    (code) => getCity(code).flag,
  );

  return (
    <PressableScale onPress={onPress} scaleTo={0.98}>
      <Card style={styles.tripCard}>
        <View style={{ flex: 1, gap: Spacing.two }}>
          <ThemedText type="heading" numberOfLines={1}>
            {trip.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {monthName(trip.month)} · {trip.nights} nights · {trip.travelers.length} friends
          </ThemedText>
          <View style={styles.tripFoot}>
            <AvatarStack names={trip.travelers.map((t) => t.name)} size={26} />
            <Text style={styles.flags}>{flags.join(' ')}</Text>
          </View>
        </View>
        <View style={[styles.go, { backgroundColor: theme.backgroundSelected }]}>
          <Icon name="arrow-right" size={18} color={theme.text} strokeWidth={2} />
        </View>
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  masthead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  intro: {
    gap: Spacing.three,
  },
  mapCard: {
    padding: Spacing.two,
  },
  sectionHead: {
    marginBottom: -Spacing.two,
  },
  empty: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three + 2,
  },
  tripFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: 2,
  },
  flags: {
    fontSize: 15,
    letterSpacing: 2,
  },
  go: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
