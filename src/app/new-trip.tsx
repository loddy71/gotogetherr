import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedNumber } from '@/components/animated-number';
import { Avatar } from '@/components/avatar';
import { BOTTOM_BAR_CLEARANCE, BottomBar } from '@/components/bottom-bar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { CityPicker } from '@/components/city-picker';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { HeaderIconButton } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DisplayFont, MaxContentWidth, Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptic } from '@/lib/haptics';
import { MONTHS, newId } from '@/lib/format';
import { useTrip, useTrips } from '@/lib/store';
import type { Traveler, Trip } from '@/lib/types';

const layoutSpring = LinearTransition.springify().damping(Motion.glide.damping);

/** Create a new trip, or edit an existing one when `?id=` is passed. */
export default function TripFormScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useTrip(id);
  const { saveTrip, deleteTrip } = useTrips();

  const [name, setName] = useState(existing?.name ?? '');
  const [month, setMonth] = useState(existing?.month ?? nextMonth());
  const [nights, setNights] = useState(existing?.nights ?? 3);
  const [travelers, setTravelers] = useState<Traveler[]>(
    existing?.travelers ?? [emptyTraveler(), emptyTraveler()],
  );

  const updateTraveler = (travelerId: string, patch: Partial<Traveler>) => {
    setTravelers((prev) => prev.map((t) => (t.id === travelerId ? { ...t, ...patch } : t)));
  };

  const validTravelers = travelers.filter((t) => t.originCode);
  const canSave = name.trim().length > 0 && validTravelers.length >= 2;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const save = () => {
    const trip: Trip = {
      id: existing?.id ?? newId(),
      name: name.trim(),
      month,
      nights,
      travelers: validTravelers.map((t, i) => ({ ...t, name: t.name.trim() || `Friend ${i + 1}` })),
      fairnessWeight: existing?.fairnessWeight ?? 0.5,
      createdAt: existing?.createdAt ?? Date.now(),
    };
    haptic('success');
    saveTrip(trip);
    if (existing) router.back();
    else router.replace(`/trip/${trip.id}`);
  };

  const remove = () => {
    if (!existing) return;
    deleteTrip(existing.id);
    router.dismissAll();
  };

  return (
    <ThemedView style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: Platform.OS === 'ios' ? Spacing.three : insets.top + Spacing.two }]}>
        <ThemedText type="heading">{existing ? 'Edit trip' : 'Plan a trip'}</ThemedText>
        <HeaderIconButton icon="close" label="Close" onPress={close} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_BAR_CLEARANCE + Spacing.four }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(Motion.duration.slow)}>
            <Section label="Trip name">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="The lads' reunion"
                placeholderTextColor={theme.textSecondary}
                style={[styles.titleInput, { color: theme.text }]}
              />
            </Section>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(60).duration(Motion.duration.slow)}>
            <Section label="When">
              <View style={styles.months}>
                {MONTHS.map((label, i) => (
                  <MonthCell
                    key={label}
                    label={label.slice(0, 3)}
                    selected={month === i + 1}
                    onPress={() => setMonth(i + 1)}
                  />
                ))}
              </View>
              <View style={[styles.nightsRow, { borderTopColor: theme.border }]}>
                <View>
                  <ThemedText type="defaultBold">Nights</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Hotel and daily costs scale with this
                  </ThemedText>
                </View>
                <View style={styles.stepper}>
                  <Stepper icon="minus" onPress={() => setNights((n) => Math.max(1, n - 1))} />
                  <AnimatedNumber type="price" value={nights} format={(n) => String(Math.round(n))} style={styles.nightsValue} />
                  <Stepper icon="plus" onPress={() => setNights((n) => Math.min(21, n + 1))} />
                </View>
              </View>
            </Section>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(Motion.duration.slow)} layout={layoutSpring}>
            <ThemedText type="label" themeColor="textSecondary" style={styles.sectionLabel}>
              Who&apos;s coming
            </ThemedText>
            <View style={{ gap: Spacing.three }}>
              {travelers.map((traveler, i) => (
                <Animated.View
                  key={traveler.id}
                  entering={FadeInDown.springify().damping(Motion.glide.damping)}
                  exiting={FadeOut.duration(Motion.duration.fast)}
                  layout={layoutSpring}>
                  <Card style={styles.traveler}>
                    <View style={styles.travelerHead}>
                      <Avatar name={traveler.name || `Friend ${i + 1}`} index={i} size={34} />
                      <TextInput
                        value={traveler.name}
                        onChangeText={(v) => updateTraveler(traveler.id, { name: v })}
                        placeholder={`Friend ${i + 1}`}
                        placeholderTextColor={theme.textSecondary}
                        style={[styles.nameInput, { color: theme.text }]}
                      />
                      {travelers.length > 2 && (
                        <PressableScale
                          accessibilityLabel={`Remove ${traveler.name || `friend ${i + 1}`}`}
                          hitSlop={10}
                          onPress={() => setTravelers((prev) => prev.filter((t) => t.id !== traveler.id))}
                          style={[styles.remove, { backgroundColor: theme.backgroundSelected }]}>
                          <Icon name="close" size={14} color={theme.textSecondary} strokeWidth={2.2} />
                        </PressableScale>
                      )}
                    </View>
                    <CityPicker
                      value={traveler.originCode || undefined}
                      placeholder="Choose a city"
                      onSelect={(code) => updateTraveler(traveler.id, { originCode: code })}
                    />
                    <View style={[styles.budgetRow, { backgroundColor: theme.backgroundSelected }]}>
                      <ThemedText type="default" themeColor="textSecondary">
                        $
                      </ThemedText>
                      <TextInput
                        value={traveler.budget ? String(traveler.budget) : ''}
                        onChangeText={(v) => {
                          const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
                          updateTraveler(traveler.id, { budget: Number.isFinite(n) ? n : undefined });
                        }}
                        keyboardType="number-pad"
                        placeholder="Budget for the whole trip (optional)"
                        placeholderTextColor={theme.textSecondary}
                        style={[styles.budgetInput, { color: theme.text }]}
                      />
                    </View>
                  </Card>
                </Animated.View>
              ))}
              <Animated.View layout={layoutSpring}>
                <Button
                  title="Add another friend"
                  icon="plus"
                  variant="secondary"
                  onPress={() => setTravelers((prev) => [...prev, emptyTraveler()])}
                />
              </Animated.View>
            </View>
          </Animated.View>

          {existing && (
            <Animated.View layout={layoutSpring}>
              <Button title="Delete this trip" variant="destructive" onPress={remove} />
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomBar>
        <Button title={existing ? 'Save changes' : 'Find our city'} disabled={!canSave} onPress={save} />
      </BottomBar>
      {!canSave && (
        <ThemedText
          type="caption"
          themeColor="textSecondary"
          style={[styles.hint, { bottom: Math.max(insets.bottom, Spacing.three) + 74 }]}>
          Name the trip and give at least two friends a home city
        </ThemedText>
      )}
    </ThemedView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: Spacing.two + 2 }}>
      <ThemedText type="label" themeColor="textSecondary" style={styles.sectionLabel}>
        {label}
      </ThemedText>
      <Card style={styles.section}>{children}</Card>
    </View>
  );
}

function MonthCell({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        haptic('selection');
        onPress();
      }}
      style={styles.monthCell}>
      <Animated.View
        style={[
          styles.monthPill,
          {
            backgroundColor: selected ? theme.text : 'transparent',
            transitionProperty: 'backgroundColor',
            transitionDuration: Motion.duration.base,
          },
        ]}>
        <ThemedText type="smallBold" style={{ color: selected ? theme.background : theme.textSecondary }}>
          {label}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

function Stepper({ icon, onPress }: { icon: 'plus' | 'minus'; onPress: () => void }) {
  const theme = useTheme();
  return (
    <PressableScale
      accessibilityLabel={icon === 'plus' ? 'Add a night' : 'Remove a night'}
      feedback="selection"
      scaleTo={0.9}
      onPress={onPress}
      hitSlop={8}
      style={[styles.stepperButton, { backgroundColor: theme.backgroundSelected }]}>
      {icon === 'plus' ? (
        <Icon name="plus" size={16} color={theme.text} strokeWidth={2.2} />
      ) : (
        <View style={[styles.minus, { backgroundColor: theme.text }]} />
      )}
    </PressableScale>
  );
}

function emptyTraveler(): Traveler {
  return { id: newId(), name: '', originCode: '' };
}

function nextMonth(): number {
  return ((new Date().getMonth() + 1) % 12) + 1;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three + 4,
    paddingBottom: Spacing.two,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three + 4,
    paddingTop: Spacing.two,
    gap: Spacing.four,
  },
  sectionLabel: { paddingHorizontal: Spacing.one, marginBottom: Spacing.two + 2 },
  section: { padding: Spacing.three, gap: Spacing.three },
  titleInput: { fontFamily: DisplayFont, fontSize: 28, paddingVertical: Spacing.one },
  months: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -2 },
  monthCell: { width: `${100 / 6}%`, padding: 2 },
  monthPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Radius.pill,
  },
  nightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minus: { width: 12, height: 2, borderRadius: 1 },
  nightsValue: { minWidth: 28, textAlign: 'center' },
  traveler: { padding: Spacing.three, gap: Spacing.two + 2 },
  travelerHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  nameInput: { flex: 1, fontSize: 18, fontWeight: '600', paddingVertical: Spacing.one },
  remove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    minHeight: 48,
    borderRadius: Radius.md,
  },
  budgetInput: { flex: 1, fontSize: 15, paddingVertical: Spacing.two },
  hint: { position: 'absolute', left: 0, right: 0, textAlign: 'center' },
});
