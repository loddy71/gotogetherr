import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Rule } from '@/components/rule';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CITIES, type City } from '@/lib/data/cities';

type CityPickerProps = {
  /** Currently selected city code, if any. */
  value?: string;
  placeholder?: string;
  onSelect: (code: string) => void;
};

/** Ruled field that opens a searchable index of cities. */
export function CityPicker({ value, placeholder = 'Choose a city', onSelect }: CityPickerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = value ? CITIES.find((c) => c.code === value) : undefined;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
    );
  }, [search]);

  const pick = (city: City) => {
    onSelect(city.code);
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          { borderBottomColor: theme.border },
          pressed && { opacity: 0.6 },
        ]}>
        {selected ? (
          <View style={styles.selectedRow}>
            <Text style={styles.flag}>{selected.flag}</Text>
            <ThemedText type="default">{selected.name}</ThemedText>
            <ThemedText type="label" themeColor="textSecondary">
              {selected.country}
            </ThemedText>
          </View>
        ) : (
          <ThemedText type="default" themeColor="textSecondary">
            {placeholder}
          </ThemedText>
        )}
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.background, paddingTop: insets.top + Spacing.four },
          ]}>
          <View style={{ paddingHorizontal: Spacing.four, gap: Spacing.two }}>
            <ThemedText type="label" themeColor="textSecondary">
              Home airport
            </ThemedText>
            <TextInput
              autoFocus
              value={search}
              onChangeText={setSearch}
              placeholder="Search cities or countries…"
              placeholderTextColor={theme.textSecondary}
              style={[styles.search, { color: theme.text, borderBottomColor: theme.borderStrong }]}
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(c) => c.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: Spacing.four }}
            ItemSeparatorComponent={() => <Rule />}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                testID={`city-option-${item.code}`}
                onPress={() => pick(item)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.5 }]}>
                <Text style={styles.flag}>{item.flag}</Text>
                <ThemedText type="default" style={{ flex: 1 }}>
                  {item.name}
                </ThemedText>
                <ThemedText type="label" themeColor="textSecondary">
                  {item.country}
                </ThemedText>
              </Pressable>
            )}
          />
          <View style={{ paddingBottom: insets.bottom + Spacing.three, paddingHorizontal: Spacing.four }}>
            <Button title="Cancel" variant="secondary" onPress={() => setOpen(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    paddingVertical: Spacing.two + 2,
    borderBottomWidth: 1,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flag: {
    fontSize: 17,
  },
  sheet: {
    flex: 1,
    gap: Spacing.three,
  },
  search: {
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    paddingVertical: 14,
  },
});
