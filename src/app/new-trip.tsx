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
import { Card } from '@/components/card';
import { CityPicker } from '@/components/city-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing, travelerColor } from '@/constants/theme';
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
              placeholder="e.g. The lads' reunion"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
            />
          </Field>

          <Field label="When?">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chips}>
                {MONTHS.map((label, i) => {
                  const selected = month === i + 1;
                  return (
                    <Pressable
                      key={label}
                      accessibilityRole="button"
                      onPress={() => setMonth(i + 1)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected ? theme.tint : theme.card,
                          borderColor: selected ? theme.tint : theme.border,
                        },
                      ]}>
                      <ThemedText
                        type="smallBold"
                        style={selected ? { color: '#fff' } : undefined}
                        themeColor={selected ? undefined : 'textSecondary'}>
                        {label.slice(0, 3)}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.stepperRow}>
              <ThemedText themeColor="textSecondary">Nights</ThemedText>
              <View style={styles.stepper}>
                <Button
                  title="−"
                  variant="secondary"
                  onPress={() => setNights((n) => Math.max(1, n - 1))}
                  style={styles.stepButton}
                />
                <ThemedText type="stat" style={styles.stepValue}>
                  {nights}
                </ThemedText>
                <Button
                  title="＋"
                  variant="secondary"
                  onPress={() => setNights((n) => Math.min(21, n + 1))}
                  style={styles.stepButton}
                />
              </View>
            </View>
          </Field>

          <Field label="Who's coming?">
            {travelers.map((traveler, i) => (
              <Card key={traveler.id} style={styles.travelerCard}>
                <View style={styles.travelerHeader}>
                  <View style={[styles.travelerDot, { backgroundColor: travelerColor(i) }]} />
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
                      hitSlop={8}
                      onPress={() =>
                        setTravelers((prev) => prev.filter((t) => t.id !== traveler.id))
                      }>
                      <ThemedText themeColor="textSecondary">✕</ThemedText>
                    </Pressable>
                  )}
                </View>
                <CityPicker
                  value={traveler.originCode || undefined}
                  placeholder="Flying from…"
                  onSelect={(code) => updateTraveler(traveler.id, { originCode: code })}
                />
                <TextInput
                  value={traveler.budget ? String(traveler.budget) : ''}
                  onChangeText={(v) => {
                    const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
                    updateTraveler(traveler.id, { budget: Number.isFinite(n) ? n : undefined });
                  }}
                  keyboardType="number-pad"
                  placeholder="Budget in USD (optional)"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </Card>
            ))}
            <Button
              title="＋ Add a friend"
              variant="secondary"
              onPress={() => setTravelers((prev) => [...prev, emptyTraveler()])}
            />
          </Field>

          <Button
            title={existing ? 'Save changes' : 'Find our city'}
            disabled={!canSave}
            onPress={save}
          />
          {!canSave && (
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              Give the trip a name and pick home cities for at least two friends.
            </ThemedText>
          )}
          {existing && <Button title="Delete trip" variant="destructive" onPress={remove} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: Spacing.two + 2 }}>
      <ThemedText type="label" themeColor="textSecondary">
        {label.toUpperCase()}
      </ThemedText>
      {children}
    </View>
  );
}

function emptyTraveler(): Traveler {
  return { id: newId(), name: '', originCode: '' };
}

function nextMonth(): number {
  return (new Date().getMonth() + 1) % 12 + 1;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  input: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.one + 2,
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  stepValue: {
    minWidth: 32,
    textAlign: 'center',
  },
  travelerCard: {
    padding: Spacing.three,
    gap: Spacing.two + 2,
  },
  travelerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  travelerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nameInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    paddingVertical: 4,
  },
});
