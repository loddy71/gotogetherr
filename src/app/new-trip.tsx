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
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
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
          keyboardShouldPersistTaps="handled">
          <Field label="Trip name">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. The lads' reunion"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
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
                          backgroundColor: selected ? '#208AEF' : theme.backgroundElement,
                        },
                      ]}>
                      <ThemedText
                        type="small"
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
                <ThemedText type="smallBold" style={styles.stepValue}>
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
              <View
                key={traveler.id}
                style={[styles.travelerCard, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.travelerHeader}>
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
                  style={[styles.input, { backgroundColor: theme.backgroundSelected, color: theme.text }]}
                />
              </View>
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
    <View style={{ gap: Spacing.two }}>
      <ThemedText type="smallBold" themeColor="textSecondary">
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
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  chip: {
    borderRadius: 999,
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
    minWidth: 28,
    textAlign: 'center',
  },
  travelerCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  travelerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 4,
  },
});
