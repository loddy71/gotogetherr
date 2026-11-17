import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarStack } from '@/components/avatar';
import { BrandMark } from '@/components/brand-mark';
import { SpecimenPasses } from '@/components/specimen-passes';
import { PageTitle } from '@/components/page-title';
import { BOTTOM_BAR_CLEARANCE, BottomBar } from '@/components/bottom-bar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorldMap } from '@/components/world-map';
import { MaxContentWidth, Motion, Spacing } from '@/constants/theme';
import { useEntrance } from '@/hooks/use-entrance';
import { useTheme } from '@/hooks/use-theme';
import { CITIES, getCity } from '@/lib/data/cities';
import { exampleTrip } from '@/lib/example';
import { monthName } from '@/lib/format';
import { useTrips } from '@/lib/store';
import type { Trip } from '@/lib/types';

const ALL_CITY_CODES = CITIES.map((c) => c.code);

export default function HomeScreen() {
  const router = useRouter();
  const { trips, hydrated, saveTrip } = useTrips();
  const insets = useSafeAreaInsets();
  const enter = useEntrance();
  // One example trip per visit, so the specimen and the opened trip match.
  const [example] = useState(exampleTrip);

  return (
    <ThemedView style={styles.screen}>
      <PageTitle />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.four, paddingBottom: BOTTOM_BAR_CLEARANCE },
        ]}>
        <Animated.View entering={enter(FadeInDown.duration(Motion.duration.slow))} style={styles.masthead}>
          <View style={styles.wordmark} accessibilityLabel="GoTogether">
            <BrandMark size={22} />
            <ThemedText type="heading" style={styles.wordmarkText}>
              GoTogether
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {CITIES.length} cities
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={enter(FadeInDown.delay(60).duration(Motion.duration.slow))}
          style={styles.intro}>
          <ThemedText type="display">Find the fairest{'\n'}place to meet.</ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            Everyone lives somewhere different. GoTogether prices every city per person (flight,
            a shared room and food on the ground), then ranks where the trip costs least and splits
            most evenly.
          </ThemedText>
        </Animated.View>

        {trips.length > 0 && (
          <Animated.View entering={enter(FadeInDown.delay(120).duration(Motion.duration.slow))}>
            <Card style={styles.mapCard}>
              <WorldMap markers={ALL_CITY_CODES} focus={false} aspect={2.5} />
            </Card>
          </Animated.View>
        )}

        {trips.length > 0 && (
          <Animated.View entering={enter(FadeInDown.delay(180).duration(Motion.duration.slow))} style={styles.sectionHead}>
            <ThemedText type="heading">Your trips</ThemedText>
          </Animated.View>
        )}

        {hydrated && trips.length === 0 && (
          <Animated.View
            entering={enter(FadeInDown.delay(120).duration(Motion.duration.slow))}
            style={styles.specimen}>
            {/* First run leads with the product itself: one pass per friend. */}
            <SpecimenPasses trip={example} />
            <View style={styles.specimenText}>
              <ThemedText type="heading">Three friends, three continents.</ThemedText>
              <ThemedText type="default" themeColor="textSecondary">
                Maya, Sam and Kenji live in London, New York and Tokyo. Each gets a pass to the
                city where the trip costs least and splits most evenly, with what they pay.
              </ThemedText>
            </View>
            <Button
              title="Try an example"
              variant="secondary"
              size="small"
              style={styles.exampleButton}
              onPress={() => {
                saveTrip(example);
                router.push(`/trip/${example.id}`);
              }}
            />
          </Animated.View>
        )}

        <View style={{ gap: Spacing.three }}>
          {trips.map((trip, i) => (
            <Animated.View
              key={trip.id}
              entering={enter(FadeInDown.delay(220 + i * Motion.stagger).duration(Motion.duration.slow))}
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
  const origins = [...new Set(trip.travelers.map((t) => t.originCode))];

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
            <ThemedText
              type="numeral"
              numberOfLines={1}
              accessibilityLabel={`Flying from ${origins.map((c) => getCity(c).name).join(', ')}`}
              style={{ flexShrink: 1 }}>
              {origins.join(' · ')}
            </ThemedText>
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
    alignItems: 'center',
  },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  wordmarkText: { fontSize: 22, lineHeight: 26 },
  exampleButton: { alignSelf: 'flex-start' },
  specimen: { gap: Spacing.three },
  specimenText: { gap: Spacing.one, paddingHorizontal: Spacing.one },
  intro: {
    gap: Spacing.three,
  },
  mapCard: {
    padding: Spacing.two,
  },
  sectionHead: {
    marginBottom: -Spacing.two,
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
  go: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
