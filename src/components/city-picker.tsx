import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CITIES, cityLabel, type City } from '@/lib/data/cities';

type CityPickerProps = {
  /** Currently selected city code, if any. */
  value?: string;
  placeholder?: string;
  onSelect: (code: string) => void;
};

/** Tappable field that opens a searchable full-screen city list. */
export function CityPicker({ value, placeholder = 'Choose a city', onSelect }: CityPickerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

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
        style={[styles.field, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText themeColor={value ? 'text' : 'textSecondary'}>
          {value ? cityLabel(value) : placeholder}
        </ThemedText>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.background, paddingTop: insets.top + Spacing.three },
          ]}>
          <TextInput
            autoFocus
            value={search}
            onChangeText={setSearch}
            placeholder="Search cities or countries…"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.search,
              { backgroundColor: theme.backgroundElement, color: theme.text },
            ]}
          />
          <FlatList
            data={filtered}
            keyExtractor={(c) => c.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => pick(item)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
                <ThemedText>
                  {item.flag} {item.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.country}
                </ThemedText>
              </Pressable>
            )}
          />
          <View style={{ paddingBottom: insets.bottom + Spacing.two }}>
            <Button title="Cancel" variant="secondary" onPress={() => setOpen(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
  },
  sheet: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  search: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
});
