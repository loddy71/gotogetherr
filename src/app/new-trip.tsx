import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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

import { Button } from '@/components/button';
import { CityPicker } from '@/components/city-picker';
import { Rule } from '@/components/rule';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DisplayFont, MaxContentWidth, Spacing, travelerColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MONTHS, newId } from '@/lib/format';
import { useTrip, useTrips } from '@/lib/store';
import type { Traveler, Trip } from '@/lib/types';

/** Create a new trip, or edit an existing one when `?id=` is passed. */
export default function TripFormScreen() {
  const router = useRouter();
  const theme = useTheme();
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

  const save = () => {
    const trip: Trip = {
      id: existing?.id ?? newId(),
      name: name.trim(),
      month,
      nights,
      travelers: validTravelers.map((t, i) => ({
        ...t,
        name: t.name.trim() || `Friend ${i + 1}`,
      })),
      fairnessWeight: existing?.fairnessWeight ?? 0.5,
      createdAt: existing?.createdAt ?? Date.now(),
    };
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
      <Stack.Screen options={{ title: existing ? 'Edit trip' : 'Plan a trip' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Field label="Trip name">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="The lads' reunion"
              placeholderTextColor={theme.textSecondary}
              style={[styles.titleInput, { color: theme.text, borderBottomColor: theme.border }]}
            />
          </Field>

          <Field label="When">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.months}>
                {MONTHS.map((label, i) => {
                  const selected = month === i + 1;
                  return (
                    <Pressable
                      key={label}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setMonth(i + 1)}
                      style={[
                        styles.month,
                        { borderBottomColor: selected ? theme.tint : 'transparent' },
                      ]}>
                      <ThemedText
                        type="label"
                        style={{ color: selected ? theme.text : theme.textSecondary }}>
                        {label.slice(0, 3)}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <Rule />
            <View style={styles.nightsRow}>
              <ThemedText type="label" themeColor="textSecondary">
                Nights
              </ThemedText>
              <View style={styles.stepper}>
                <Stepper label="−" onPress={() => setNights((n) => Math.max(1, n - 1))} />
                <ThemedText type="price" style={styles.nightsValue}>
                  {nights}
                </ThemedText>
                <Stepper label="+" onPress={() => setNights((n) => Math.min(21, n + 1))} />
              </View>
            </View>
          </Field>

          <Field label="Who's coming">
            {travelers.map((traveler, i) => (
              <View key={traveler.id} style={styles.traveler}>
                <View style={styles.travelerHead}>
                  <ThemedText type="numeral" style={{ color: travelerColor(i) }}>
                    {String(i + 1).padStart(2, '0')}
                  </ThemedText>
                  <TextInput
                    value={traveler.name}
                    onChangeText={(v) => updateTraveler(traveler.id, { name: v })}
                    placeholder={`Friend ${i + 1}`}
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.nameInput, { color: theme.text }]}
                  />
                  {travelers.length > 2 && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${traveler.name || `friend ${i + 1}`}`}
                      hitSlop={10}
                      onPress={() =>
                        setTravelers((prev) => prev.filter((t) => t.id !== traveler.id))
                      }>
                      <ThemedText type="label" themeColor="textSecondary">
                        Remove
                      </ThemedText>
                    </Pressable>
                  )}
                </View>

                <View style={{ gap: Spacing.one }}>
                  {i === 0 && (
                    <ThemedText type="label" themeColor="textSecondary">
                      Flying from
                    </ThemedText>
                  )}
                  <CityPicker
                    value={traveler.originCode || undefined}
                    placeholder="Choose a city"
                    onSelect={(code) => updateTraveler(traveler.id, { originCode: code })}
                  />
                </View>

                <View style={{ gap: Spacing.one }}>
                  {i === 0 && (
                    <ThemedText type="label" themeColor="textSecondary">
                      Budget, if there is one
                    </ThemedText>
                  )}
                  <View style={[styles.budgetRow, { borderBottomColor: theme.border }]}>
                    <ThemedText type="default" themeColor="textSecondary">
                      $
                    </ThemedText>
                    <TextInput
                      value={traveler.budget ? String(traveler.budget) : ''}
                      onChangeText={(v) => {
                        const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
                        updateTraveler(traveler.id, {
                          budget: Number.isFinite(n) ? n : undefined,
                        });
                      }}
                      keyboardType="number-pad"
                      placeholder="No limit"
                      placeholderTextColor={theme.textSecondary}
                      style={[styles.budgetInput, { color: theme.text }]}
                    />
                  </View>
                </View>
              </View>
            ))}
            <Button
              title="Add another friend"
              variant="secondary"
              onPress={() => setTravelers((prev) => [...prev, emptyTraveler()])}
            />
          </Field>

          <View style={{ gap: Spacing.two }}>
            <Button
              title={existing ? 'Save changes' : 'Find our city'}
              disabled={!canSave}
              onPress={save}
            />
            {!canSave && (
              <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
                Name the trip and give at least two friends a home city.
              </ThemedText>
            )}
            {existing && <Button title="Delete this trip" variant="destructive" onPress={remove} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: Spacing.three }}>
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="label" themeColor="textSecondary">
          {label}
        </ThemedText>
        <Rule weight="strong" />
      </View>
      {children}
    </View>
  );
}

function Stepper({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'Add a night' : 'Remove a night'}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.stepperButton,
        { borderColor: theme.borderStrong },
        pressed && { opacity: 0.5 },
      ]}>
      <ThemedText type="default" style={{ lineHeight: 20 }}>
        {label}
      </ThemedText>
    </Pressable>
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
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  titleInput: {
    fontFamily: DisplayFont,
    fontSize: 27,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  months: {
    flexDirection: 'row',
  },
  month: {
    paddingVertical: Spacing.two,
    paddingRight: Spacing.three,
    borderBottomWidth: 2,
    marginBottom: -1,
  },
  nightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  stepperButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 2,
  },
  nightsValue: {
    minWidth: 28,
    textAlign: 'center',
  },
  traveler: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  travelerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  nameInput: {
    flex: 1,
    fontSize: 19,
    paddingVertical: 2,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderBottomWidth: 1,
    paddingVertical: Spacing.two + 2,
  },
  budgetInput: {
    flex: 1,
    fontSize: 15,
  },
});
