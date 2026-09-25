import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { Sheet } from '@/components/sheet';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CITIES, REGIONS, regionOf, type City } from '@/lib/data/cities';

type CityPickerProps = {
  value?: string;
  placeholder?: string;
  onSelect: (code: string) => void;
};

/** Rounded field that opens a searchable, region-sectioned sheet of cities. */
export function CityPicker({ value, placeholder = 'Choose a city', onSelect }: CityPickerProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = value ? CITIES.find((c) => c.code === value) : undefined;

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = q
      ? CITIES.filter(
          (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
        )
      : CITIES;
    return REGIONS.map((region) => ({
      title: region,
      data: matches.filter((c) => regionOf(c) === region),
    })).filter((s) => s.data.length > 0);
  }, [search]);

  const close = () => {
    setOpen(false);
    setSearch('');
  };

  const pick = (city: City) => {
    onSelect(city.code);
    close();
  };

  return (
    <>
      <PressableScale
        scaleTo={0.985}
        accessibilityLabel={selected ? `Home city: ${selected.name}` : placeholder}
        onPress={() => setOpen(true)}
        style={[styles.field, { backgroundColor: theme.backgroundSelected }]}>
        {selected ? (
          <View style={styles.fieldRow}>
            <Text style={styles.flag}>{selected.flag}</Text>
            <ThemedText type="defaultBold">{selected.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }} numberOfLines={1}>
              {selected.country}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.fieldRow}>
            <Icon name="plane" size={17} color={theme.textSecondary} />
            <ThemedText type="default" themeColor="textSecondary" style={{ flex: 1 }}>
              {placeholder}
            </ThemedText>
          </View>
        )}
        <Icon name="chevron-down" size={18} color={theme.textSecondary} />
      </PressableScale>

      <Sheet
        visible={open}
        onClose={close}
        header={
          <View style={{ gap: Spacing.three }}>
            <ThemedText type="heading">Where do they fly from?</ThemedText>
            <View style={[styles.search, { backgroundColor: theme.backgroundSelected }]}>
              <Icon name="search" size={18} color={theme.textSecondary} />
              <TextInput
                autoFocus
                value={search}
                onChangeText={setSearch}
                placeholder="Search cities or countries…"
                placeholderTextColor={theme.textSecondary}
                style={[styles.searchInput, { color: theme.text }]}
              />
            </View>
          </View>
        }>
        <SectionList
          sections={sections}
          keyExtractor={(c) => c.code}
          keyboardShouldPersistTaps="handled"
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.three, paddingBottom: Spacing.five }}
          renderSectionHeader={({ section }) => (
            <ThemedText type="label" themeColor="textSecondary" style={styles.sectionHeader}>
              {section.title}
            </ThemedText>
          )}
          ListEmptyComponent={
            <ThemedText type="default" themeColor="textSecondary" style={{ padding: Spacing.three }}>
              No city matches “{search}”. The list covers 50 cities; try the nearest big hub.
            </ThemedText>
          }
          renderItem={({ item }) => {
            const isSelected = item.code === value;
            return (
              <PressableScale
                testID={`city-option-${item.code}`}
                feedback="selection"
                scaleTo={0.98}
                onPress={() => pick(item)}
                style={[styles.row, isSelected && { backgroundColor: theme.backgroundSelected }]}>
                <Text style={styles.flag}>{item.flag}</Text>
                <ThemedText type="default" style={{ flex: 1 }}>
                  {item.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.country}
                </ThemedText>
              </PressableScale>
            );
          }}
        />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    minHeight: 50,
    borderRadius: Radius.md,
  },
  fieldRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flag: {
    fontSize: 18,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    minHeight: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.two,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 13,
    borderRadius: Radius.sm + 2,
  },
});
